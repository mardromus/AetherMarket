/**
 * Aether SDK - Programmatic Agent Service Mesh on Aptos
 * 
 * Provides simple 3-line integration for discovering and calling agents
 * with automatic payment handling via x402 protocol
 */

import {
    Aptos,
    AptosConfig,
    Network,
    SimpleTransaction,
    Account,
    Ed25519PrivateKey,
} from "@aptos-labs/ts-sdk";
import { X402Client } from "@/lib/x402/client";
import { KeylessAccount } from "@aptos-labs/ts-sdk";
import axios, { AxiosError } from "axios";
import { EphemeralKeyPair } from "@aptos-labs/ts-sdk";
import { AGENT_SPECS, getAgentCostAPT, getAllAgentIds } from "@/lib/agents/config";

// ============================================
// TYPES & INTERFACES
// ============================================

export interface AgentBrowseResult {
    id: string;
    name: string;
    endpoint: string;
    type: string;
    capabilities: string[];
    costAPT: number;
}

export interface CallAgentPayload {
    agentId: string;
    taskType: string;
    parameters: Record<string, any>;
}

export interface CallAgentResponse {
    result: any;
    executionTime: number;
    payment?: {
        transactionHash: string;
        blockHeight: number;
        amount: string;
    };
}

export interface BudgetSession {
    agentAddress: string;
    remainingBalance: number;
    validUntil: number;
    budgetOwner: string;
}

// ============================================
// AETHER SDK - MAIN CLASS
// ============================================

export class AetherSDK {
    private aptos: Aptos;
    private x402Client: X402Client;
    private network: Network;
    private keylessAccount?: KeylessAccount;
    private ephemeralKeyPair?: EphemeralKeyPair;

    /**
     * Initialize the Aether SDK
     * @param network - "testnet" or "mainnet" (default: testnet)
     */
    constructor(network: "testnet" | "mainnet" = "testnet") {
        this.network = network === "mainnet" ? Network.MAINNET : Network.TESTNET;
        const config = new AptosConfig({ network: this.network });
        this.aptos = new Aptos(config);
        this.x402Client = new X402Client(this.network);
    }

    /**
     * Set Keyless account from Google OAuth
     * Call this after Keyless authentication to enable autonomous payments
     */
    setKeylessAccount(account: KeylessAccount, ephemeralKeyPair: EphemeralKeyPair) {
        this.keylessAccount = account;
        this.ephemeralKeyPair = ephemeralKeyPair;
    }

    // ============================================
    // DISCOVERY & BROWSING
    // ============================================

    /**
     * Browse agents by skill/category
     * Returns agents matching the search term from unified config
     * 
     * @example
     * const agents = await aether.browse("text-generation");
     * 
     * @param skill - Skill/category to search for (e.g., "text-generation", "code-audit")
     * @returns List of agents with capabilities and pricing
     */
    async browse(skill: string): Promise<AgentBrowseResult[]> {
        try {
            // Search through all agents in config
            const agents: AgentBrowseResult[] = [];

            for (const agentId of getAllAgentIds()) {
                const spec = AGENT_SPECS[agentId as keyof typeof AGENT_SPECS];
                if (!spec) continue;

                // Match by type, category, name, or capabilities
                const skillLower = skill.toLowerCase();
                const typeMatch = spec.type.includes(skillLower);
                const categoryMatch = spec.category.toLowerCase().includes(skillLower);
                const nameMatch = spec.name.toLowerCase().includes(skillLower);
                const capMatch = spec.capabilities.some((c: string) => c.toLowerCase().includes(skillLower));

                if (typeMatch || categoryMatch || nameMatch || capMatch) {
                    agents.push({
                        id: agentId,
                        name: spec.name,
                        endpoint: spec.endpoint,
                        type: spec.type,
                        capabilities: spec.capabilities,
                        costAPT: getAgentCostAPT(agentId)
                    });
                }
            }

            // Sort by relevance and return top 5
            return agents.slice(0, 5);
        } catch (error) {
            console.error("Failed to browse agents:", error);
            throw error;
        }
    }

    // ============================================
    // AGENT EXECUTION WITH AUTO PAYMENT
    // ============================================

    /**
     * Call an agent with automatic x402 payment handling
     * 
     * Three-line usage:
     * const aether = new AetherSDK("testnet");
     * aether.setKeylessAccount(keylessAccount, ephemeralKeyPair);
     * const result = await aether.callAgent("agent-id", { prompt: "..." }, budgetId);
     * 
     * @param agentId - Agent identifier
     * @param payload - Request payload { agentId, taskType, parameters }
     * @param budgetId - Optional: Budget ID for spending limits
     * @returns Agent response with payment proof
     */
    async callAgent(
        agentId: string,
        payload: Partial<CallAgentPayload>,
        budgetId?: string
    ): Promise<CallAgentResponse> {
        if (!this.keylessAccount || !this.ephemeralKeyPair) {
            throw new Error("Keyless account not set. Call setKeylessAccount() first.");
        }

        const fullPayload: CallAgentPayload = {
            agentId,
            taskType: payload.taskType || "general",
            parameters: payload.parameters || {},
        };

        try {
            // Step 1: Try initial request (might be free or cached)
            console.log(`🚀 [AETHER] Calling agent: ${agentId}`);
            const response = await axios.post(
                `/api/agent/execute`,
                fullPayload
            );

            return {
                result: response.data.result,
                executionTime: response.data.executionTime,
                payment: response.data.payment,
            };
        } catch (error) {
            const axiosError = error as AxiosError<any>;

            // Step 2: Check for 402 Payment Required
            if (axiosError.response?.status === 402) {
                console.log("💳 [AETHER] Payment required (402), initiating x402 flow...");

                const paymentRequired = axiosError.response.data;
                const amount = paymentRequired.amount;

                // Step 3: Create payment signature
                const paymentSignature = await this.createPaymentSignature(
                    amount,
                    paymentRequired.recipient,
                    budgetId
                );

                // Step 4: Retry with payment signature
                console.log("✅ [AETHER] Payment signed, retrying with X-PAYMENT header...");
                const retryResponse = await axios.post(
                    `/api/agent/execute`,
                    fullPayload,
                    {
                        headers: {
                            "PAYMENT-SIGNATURE": JSON.stringify(paymentSignature),
                        },
                    }
                );

                return {
                    result: retryResponse.data.result,
                    executionTime: retryResponse.data.executionTime,
                    payment: retryResponse.data.payment,
                };
            }

            // Step 5: Handle other errors
            throw error;
        }
    }

    /**
     * Create payment signature for x402 flow
     * Uses Keyless ephemeral key to sign automatically
     */
    private async createPaymentSignature(
        amount: string,
        recipient: string,
        budgetId?: string
    ) {
        const payload = {
            function: "0x1::aptos_account::transfer" as `${string}::${string}::${string}`,
            functionArguments: [recipient, amount],
        };

        // Build and sign transaction
        const builtTxn = await this.aptos.transaction.build.simple({
            sender: this.keylessAccount!.accountAddress,
            data: {
                function: payload.function,
                functionArguments: payload.functionArguments,
            },
        });

        const signedTxn = await this.aptos.transaction.sign({
            signer: this.keylessAccount!,
            transaction: builtTxn,
        });

        const committedTxn = await this.aptos.transaction.submit.simple({
            transaction: builtTxn,
            senderAuthenticator: signedTxn,
        });

        return {
            signature: (signedTxn as any).signature || "",
            publicKey: this.keylessAccount!.publicKey?.toString(),
            txnHash: committedTxn.hash,
            timestamp: Date.now(),
        };
    }

    // ============================================
    // BUDGET MANAGEMENT
    // ============================================

    /**
     * Check remaining budget for an agent
     */
    async getBudgetBalance(
        budgetOwner: string,
        agentAddress: string
    ): Promise<BudgetSession> {
        const result = await this.aptos.view({
            payload: {
                function: `0x${process.env.NEXT_PUBLIC_AETHER_ADDRESS || "aether"}::aether_budget::get_remaining_balance`,
                typeArguments: [],
                functionArguments: [budgetOwner, agentAddress],
            },
        });

        if (!Array.isArray(result) || result.length === 0) {
            throw new Error("Budget not found");
        }

        const [remaining, validUntil] = result[0] as [number, number];
        return {
            agentAddress,
            remainingBalance: remaining,
            validUntil,
            budgetOwner,
        };
    }

    /**
     * Get total budget balance
     */
    async getTotalBudgetBalance(budgetOwner: string): Promise<number> {
        const result = await this.aptos.view({
            payload: {
                function: `0x${process.env.NEXT_PUBLIC_AETHER_ADDRESS || "aether"}::aether_budget::get_budget_balance`,
                typeArguments: [],
                functionArguments: [budgetOwner],
            },
        });

        if (!Array.isArray(result) || result.length === 0) {
            return 0;
        }

        return result[0] as number;
    }

    // ============================================
    // AGENT MANAGEMENT (For Developers)
    // ============================================

    /**
     * Register a new agent in the marketplace
     */
    async registerAgent(
        owner: Account,
        handle: string,
        endpoint: string,
        skills: string[],
        pricePerCall: number
    ) {
        const txn = await this.aptos.transaction.build.simple({
            sender: owner.accountAddress,
            data: {
                function: `0x${process.env.NEXT_PUBLIC_AETHER_ADDRESS || "aether"}::aether_registry::register_agent`,
                functionArguments: [
                    handle,
                    endpoint,
                    skills,
                    pricePerCall,
                ],
            },
        });

        const signedTxn = await this.aptos.transaction.sign({
            signer: owner,
            transaction: txn,
        });

        const committedTxn = await this.aptos.transaction.submit.simple({
            transaction: txn,
            senderAuthenticator: signedTxn,
        });

        return committedTxn.hash;
    }

    /**
     * Delete an agent from the registry
     */
    async deleteAgent(
        owner: Account,
        agentAddress: string
    ) {
        const txn = await this.aptos.transaction.build.simple({
            sender: owner.accountAddress,
            data: {
                function: `0x${process.env.NEXT_PUBLIC_AETHER_ADDRESS || "aether"}::aether_registry::delete_agent`,
                functionArguments: [agentAddress],
            },
        });

        const signedTxn = await this.aptos.transaction.sign({
            signer: owner,
            transaction: txn,
        });

        const committedTxn = await this.aptos.transaction.submit.simple({
            transaction: txn,
            senderAuthenticator: signedTxn,
        });

        return committedTxn.hash;
    }

    /**
     * Get Aptos client instance for advanced usage
     */
    getAptos(): Aptos {
        return this.aptos;
    }
}

// ============================================
// SINGLETON INSTANCE
// ============================================

let aetherInstance: AetherSDK | null = null;

/**
 * Get or create Aether SDK instance
 */
export function getAether(network: "testnet" | "mainnet" = "testnet"): AetherSDK {
    if (!aetherInstance) {
        aetherInstance = new AetherSDK(network);
    }
    return aetherInstance;
}

// ============================================
// QUICK REFERENCE
// ============================================

/**
 * Example: 3-line agent call with automatic payment
 * 
 * import { getAether } from '@/lib/sdk/aether';
 * 
 * const aether = getAether("testnet");
 * aether.setKeylessAccount(keylessAccount, ephemeralKeyPair);
 * const result = await aether.callAgent("atlas-ai", { 
 *   parameters: { prompt: "What is blockchain?" } 
 * });
 * console.log(result.result);
 */

export default AetherSDK;
