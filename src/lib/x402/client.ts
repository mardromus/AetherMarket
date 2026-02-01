/**
 * x402 Payment Client
 * 
 * Handles the complete x402 payment flow:
 * 1. Request resource → Receive 402 Payment Required
 * 2. Generate payment signature
 * 3. Retry request with PAYMENT-SIGNATURE header
 * 4. Verify settlement and receive resource
 */

import { Aptos, AptosConfig, Network } from "@aptos-labs/ts-sdk";
import type {
    PaymentRequired,
    PaymentSignature,
    PaymentResponse,
    PaymentVerification,
    AgentTaskRequest,
    AgentTaskResponse
} from "@/types/x402";

enum PaymentStatus {
    PENDING = "pending",
    SUBMITTED = "submitted",
    CONFIRMED = "confirmed",
    FAILED = "failed"
}

export class X402Client {
    private aptos: Aptos;
    private network: Network;

    constructor(network: Network = Network.TESTNET) {
        const config = new AptosConfig({ network });
        this.aptos = new Aptos(config);
        this.network = network;
    }

    /**
     * Execute an agent task with x402 payment flow
     */
    async executeAgentTask(
        request: AgentTaskRequest,
        walletAddress: string,
        signTransaction: (payload: Record<string, unknown>) => Promise<string>
    ): Promise<AgentTaskResponse> {

        // Step 1: Initial request to agent endpoint
        const initialResponse = await fetch(`/api/agent/execute`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(request)
        });

        // Step 2: Check for 402 Payment Required
        if (initialResponse.status === 402) {
            const paymentRequired: PaymentRequired = await initialResponse.json();

            // Validate payment amount against user's max price
            if (request.maxPrice && BigInt(paymentRequired.amount) > BigInt(request.maxPrice)) {
                throw new Error(`Price exceeds maximum: ${paymentRequired.amount} > ${request.maxPrice}`);
            }

            // Step 3: Create payment transaction
            const paymentSignature = await this.createPaymentSignature(
                paymentRequired,
                walletAddress,
                signTransaction
            ).catch(error => {
                if (error.message?.includes('INSUFFICIENT_BALANCE_FOR_TRANSACTION_FEE')) {
                    throw new Error('Insufficient balance for gas fee. Please fund your account with at least 0.1 APT.');
                }
                throw error;
            });

            // Step 4: Retry request with payment signature
            const paidResponse = await fetch(`/api/agent/execute`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "PAYMENT-SIGNATURE": JSON.stringify(paymentSignature)
                },
                body: JSON.stringify({
                    ...request,
                    requestId: paymentRequired.requestId
                })
            });

            if (!paidResponse.ok) {
                throw new Error(`Payment failed: ${paidResponse.statusText}`);
            }

            // Step 5: Extract payment response from headers
            const paymentResponseHeader = paidResponse.headers.get("PAYMENT-RESPONSE");
            const paymentResponse: PaymentResponse = paymentResponseHeader
                ? JSON.parse(paymentResponseHeader)
                : null;

            const result = await paidResponse.json();

            return {
                ...result,
                payment: paymentResponse
            };
        }

        // If no payment required (free tier / cached), return directly
        if (initialResponse.ok) {
            return await initialResponse.json();
        }

        throw new Error(`Unexpected response: ${initialResponse.status}`);
    }

    private async createPaymentSignature(
        paymentRequired: PaymentRequired,
        fromAddress: string,
        signTransaction: (payload: Record<string, unknown>) => Promise<string>
    ): Promise<PaymentSignature> {

        // Pass the payload to the wallet for signing
        const payload = {
            function: "0x1::aptos_account::transfer" as `${string}::${string}::${string}`,
            functionArguments: [
                paymentRequired.recipient,
                paymentRequired.amount
            ]
        };

        const txnHash = await signTransaction(payload);

        return {
            signature: txnHash,
            publicKey: fromAddress,
            txnHash,
            timestamp: Date.now()
        };
    }

    /**
     * Verify a payment transaction on-chain
     */
    async verifyPayment(txnHash: string): Promise<PaymentVerification> {
        try {
            const txn = await this.aptos.waitForTransaction({
                transactionHash: txnHash,
                options: {
                    timeoutSecs: 30,
                    checkSuccess: true
                }
            });

            if (!txn.success) {
                return {
                    isValid: false,
                    error: "Transaction failed on-chain"
                };
            }

            const gasFee = (txn as unknown as Record<string, unknown>).gas_used || "0";
            const transaction: PaymentResponse = {
                transactionHash: txn.hash,
                blockHeight: Number(txn.version),
                gasFee: String(gasFee),
                amount: "0",
                settledAt: Math.floor(Date.now() / 1000),
                success: true
            };

            return {
                isValid: true,
                transaction
            };

        } catch (error) {
            return {
                isValid: false,
                error: error instanceof Error ? error.message : "Unknown error"
            };
        }
    }

    /**
     * Get current payment status
     */
    async getPaymentStatus(txnHash: string): Promise<PaymentStatus> {
        try {
            const txn = await this.aptos.getTransactionByHash({ transactionHash: txnHash });

            if ("success" in txn && txn.success) {
                return PaymentStatus.CONFIRMED;
            } else if ("success" in txn && !txn.success) {
                return PaymentStatus.FAILED;
            }

            return PaymentStatus.SUBMITTED;
        } catch {
            return PaymentStatus.PENDING;
        }
    }

    /**
     * Convert APT to Octas (1 APT = 100,000,000 Octas)
     * Uses Math.round to avoid floating point precision issues
     */
    static aptToOctas(apt: number): string {
        return Math.round(apt * 100_000_000).toString();
    }

    /**
     * Convert Octas to APT
     */
    static octasToApt(octas: string): number {
        return Number(octas) / 100_000_000;
    }
}
