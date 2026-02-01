/**
 * Agent-to-Agent Invocation Engine
 * Allows agents to call other agents with automatic payment verification
 */

import { getAgent, AGENT_REGISTRY } from "./registry";
import type { AgentRegistry } from "./registry";
import { checkTransactionLimits, recordTransaction } from "@/lib/session/manager";
import type { SessionConfig } from "@/types/session";

export interface AgentInvocationRequest {
    callingAgentId: string;
    targetAgentId: string;
    capability: string; // which capability of target agent to use
    parameters: any;
    sessionId: string; // session context with limits
    maxPrice?: string; // optional max price override
}

export interface AgentInvocationResult {
    success: boolean;
    result?: any;
    error?: string;
    costInOctas?: string;
    executionTimeMs?: number;
    targetAgentId: string;
    capability: string;
}

/**
 * Invoke another agent from within an agent execution
 * Automatically handles payment verification and budget checking
 */
export async function invokeAgent(
    request: AgentInvocationRequest
): Promise<AgentInvocationResult> {
    const startTime = Date.now();

    try {
        // 1. Verify both agents exist
        const callingAgent = getAgent(request.callingAgentId);
        const targetAgent = getAgent(request.targetAgentId);

        if (!callingAgent) {
            throw new Error(`Calling agent ${request.callingAgentId} not found in registry`);
        }

        if (!targetAgent) {
            throw new Error(`Target agent ${request.targetAgentId} not found in registry`);
        }

        // 2. Check if calling agent can invoke other agents
        if (!callingAgent.canInvokeOtherAgents) {
            throw new Error(`Agent ${request.callingAgentId} is not authorized to invoke other agents`);
        }

        // 3. Verify target agent has the requested capability
        const capability = targetAgent.capabilities[request.capability];
        if (!capability) {
            throw new Error(
                `Agent ${request.targetAgentId} does not have capability "${request.capability}". ` +
                `Available: ${Object.keys(targetAgent.capabilities).join(", ")}`
            );
        }

        // 4. Get cost and check against budget
        const costInOctas = capability.costInOctas;

        if (request.maxPrice) {
            const maxPrice = BigInt(request.maxPrice);
            const cost = BigInt(costInOctas);
            if (cost > maxPrice) {
                throw new Error(
                    `Agent execution cost (${cost / 1000000n} APT) exceeds max price (${maxPrice / 1000000n} APT)`
                );
            }
        }

        // 5. Check session transaction limits
        const limitError = checkTransactionLimits(
            request.sessionId,
            request.targetAgentId,
            costInOctas
        );

        if (limitError) {
            throw new Error(`Transaction limit exceeded: ${limitError.message}`);
        }

        // 6. Record transaction as pending
        const transaction = recordTransaction(
            request.sessionId,
            request.targetAgentId,
            costInOctas,
            request.capability,
            'pending',
            request.callingAgentId
        );

        // 7. Execute the target agent (simplified - in real system, would call actual executor)
        const result = await executeTargetAgent(targetAgent, request.capability, request.parameters);

        // 8. Update transaction as completed
        const executionTime = Date.now() - startTime;
        recordTransaction(
            request.sessionId,
            request.targetAgentId,
            costInOctas,
            request.capability,
            'completed',
            request.callingAgentId
        );

        return {
            success: true,
            result,
            costInOctas,
            executionTimeMs: executionTime,
            targetAgentId: request.targetAgentId,
            capability: request.capability
        };

    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);

        // Record failed transaction
        recordTransaction(
            request.sessionId,
            request.targetAgentId,
            "0", // no cost on failure
            request.capability,
            'failed',
            request.callingAgentId
        );

        return {
            success: false,
            error: errorMessage,
            targetAgentId: request.targetAgentId,
            capability: request.capability,
            executionTimeMs: Date.now() - startTime
        };
    }
}

/**
 * Execute the actual target agent (simplified implementation)
 * In production, this would route to the real executor
 */
async function executeTargetAgent(
    agent: AgentRegistry,
    capability: string,
    parameters: any
): Promise<any> {
    // Simulate agent execution with capability-specific logic
    // In real system, would call /api/agent/execute internally

    switch (agent.id) {
        case "oracle-prime":
            return await handleOraclePrime(capability, parameters);
        case "search-sage":
            return await handleSearchSage(capability, parameters);
        case "atlas-ai":
            return await handleAtlasAI(capability, parameters);
        case "sentiment-bot":
            return await handleSentimentBot(capability, parameters);
        default:
            throw new Error(`No executor found for agent ${agent.id}`);
    }
}

// Agent-specific execution handlers
async function handleOraclePrime(capability: string, parameters: any): Promise<any> {
    if (capability === "financial-analysis") {
        const symbol = parameters.symbol?.toLowerCase() || "bitcoin";

        // Fetch from CoinGecko API (free tier)
        const response = await fetch(
            `https://api.coingecko.com/api/v3/simple/price?ids=${symbol}&vs_currencies=usd&include_market_cap=true&include_24hr_vol=true&include_24hr_change=true`
        );

        if (!response.ok) {
            throw new Error(`CoinGecko API error: ${response.statusText}`);
        }

        const data = await response.json();
        const coinData = data[symbol];

        if (!coinData) {
            throw new Error(`Symbol ${symbol} not found`);
        }

        return {
            symbol: symbol.toUpperCase(),
            price: coinData.usd,
            marketCap: coinData.usd_market_cap,
            volume24h: coinData.usd_24h_vol,
            change24h: coinData.usd_24h_change,
            timestamp: new Date().toISOString()
        };
    }

    throw new Error(`Unknown capability: ${capability}`);
}

async function handleSearchSage(capability: string, parameters: any): Promise<any> {
    if (capability === "web-search") {
        const query = parameters.query || parameters.search || "";

        if (!query) {
            throw new Error("Search query is required");
        }

        const serpApiKey = process.env.SERP_API_KEY;

        if (!serpApiKey) {
            return {
                type: "search-results",
                query,
                message: "Web search requires SERP_API_KEY configuration",
                results: []
            };
        }

        const response = await fetch(
            `https://serpapi.com/search?q=${encodeURIComponent(query)}&api_key=${serpApiKey}`
        );

        if (!response.ok) {
            throw new Error(`Search API error: ${response.statusText}`);
        }

        const data = await response.json();
        const results = (data.organic_results || []).slice(0, 5).map((result: any) => ({
            title: result.title,
            description: result.snippet,
            link: result.link,
            source: result.source
        }));

        return {
            type: "search-results",
            query,
            resultCount: results.length,
            results,
            timestamp: new Date().toISOString()
        };
    }

    throw new Error(`Unknown capability: ${capability}`);
}

async function handleAtlasAI(capability: string, parameters: any): Promise<any> {
    const { getAIClient, getModelName } = await import('@/lib/ai/provider');
    const client = getAIClient();
    const model = getModelName();

    if (capability === "text-generation") {
        const response = await client.chat.completions.create({
            model,
            messages: [
                {
                    role: "user",
                    content: parameters.prompt || parameters.text || ""
                }
            ],
            max_tokens: parameters.maxTokens || 1000
        });

        return {
            text: response.choices[0].message.content,
            tokens: response.usage?.total_tokens,
            model
        };
    }

    throw new Error(`Unknown capability: ${capability}`);
}

async function handleSentimentBot(capability: string, parameters: any): Promise<any> {
    const { getAIClient, getModelName } = await import('@/lib/ai/provider');
    const client = getAIClient();
    const model = getModelName();

    if (capability === "sentiment-analysis") {
        const response = await client.chat.completions.create({
            model,
            messages: [
                {
                    role: "system",
                    content: "Analyze the sentiment of the given text. Return a JSON object with sentiment (positive/negative/neutral), confidence (0-1), and explanation."
                },
                {
                    role: "user",
                    content: parameters.text || ""
                }
            ],
            max_tokens: 500
        });

        const content = response.choices[0].message.content;
        const parsed = JSON.parse(content || '{}');

        return {
            sentiment: parsed.sentiment,
            confidence: parsed.confidence,
            explanation: parsed.explanation,
            text: parameters.text
        };
    }

    throw new Error(`Unknown capability: ${capability}`);
}

/**
 * Get agent composition requirements
 * Returns list of agents this agent depends on
 */
export function getAgentDependencies(agentId: string): AgentRegistry[] {
    const agent = getAgent(agentId);
    if (!agent || !agent.dependsOnAgents) return [];

    return agent.dependsOnAgents
        .map(id => getAgent(id))
        .filter((agent): agent is AgentRegistry => agent !== undefined);
}

/**
 * Estimate total cost for an agent call including nested calls
 */
export function estimateAgentCost(agentId: string, capability: string): string {
    const agent = getAgent(agentId);
    if (!agent) return "0";

    const cap = agent.capabilities[capability];
    if (!cap) return "0";

    let totalCost = BigInt(cap.costInOctas);

    // Add costs of dependent agents if they have the same capability
    if (agent.dependsOnAgents) {
        for (const depId of agent.dependsOnAgents) {
            const depAgent = getAgent(depId);
            if (depAgent && depAgent.capabilities[capability]) {
                totalCost += BigInt(depAgent.capabilities[capability].costInOctas);
            }
        }
    }

    return totalCost.toString();
}
