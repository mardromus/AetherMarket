/**
 * PILLAR D: Discovery Layer - Agent Discovery API
 * 
 * This TypeScript module implements the AI "Yellow Pages" - an API-first
 * marketplace designed for machine queries, not human browsing.
 * 
 * Key Features:
 * - Capability-based search: Find agents by intent, not just name
 * - Real-time pricing: Get current rates for each agent
 * - Reputation filtering: Only discover high-quality agents
 * - Intent matching: NLP-powered agent discovery
 * 
 * DISCOVERY MODES:
 * 1. REST API: Agent calls GET /api/discover/agents with filters
 * 2. WebSocket Bazaar: Subscribe to real-time agent availability
 * 3. Intent Search: "Find agent capable of smart contract auditing"
 */

import { Aptos, AptosConfig, Network } from "@aptos-labs/ts-sdk";
import type { Agent } from "@/store/agentStore";

export interface DiscoveryQuery {
    // Capability search
    capabilities?: string[];           // e.g., ["code-audit", "security-analysis"]
    capability_any?: boolean;          // Match ANY capability (default: ALL)

    // Reputation filter
    min_reputation?: number;           // 0-1000
    min_availability?: number;         // 0-100%

    // Pricing filter
    max_price?: number;                // Max APT per request
    min_price?: number;                // Ignore cheap/suspicious agents

    // Intent-based search
    intent?: string;                   // NLP query: "Find agent to audit Move code"

    // Pagination
    limit?: number;                    // Max results
    offset?: number;                   // For pagination

    // Sorting
    sort_by?: "reputation" | "price" | "availability" | "speed";
    order?: "asc" | "desc";
}

export interface DiscoveryResult {
    agent: Agent;
    match_score: number;               // 0-1.0 - how well agent matches query
    matched_capabilities: string[];
    estimated_response_time_ms: number;
}

export interface IntentAnalysis {
    capabilities_required: string[];
    confidence: number;                // 0-1.0
    keywords: string[];
}

/**
 * Capability Intent Mapping
 * Maps user intents to required agent capabilities
 */
const CAPABILITY_MAP = {
    "smart contract audit": ["code-audit", "security-analysis", "move-expertise"],
    "code audit": ["code-audit", "security-analysis"],
    "security review": ["security-analysis", "vulnerability-detection"],
    "image generation": ["image-generation", "dall-e-3"],
    "financial data": ["financial-analysis", "price-feed", "market-data"],
    "data analysis": ["data-analysis", "analytics", "reporting"],
    "code review": ["code-review", "software-engineering"],
    "legal review": ["legal-analysis", "compliance"],
    "contract analysis": ["smart-contract-analysis", "move-expertise"],
};

const INTENT_CONFIDENCE_THRESHOLD = 0.6;

/**
 * DiscoveryService: Main API for agent discovery
 */
export class DiscoveryService {
    private aptos: Aptos;
    private agentCache: Map<string, Agent> = new Map();

    constructor(network: Network = Network.TESTNET) {
        const config = new AptosConfig({ network });
        this.aptos = new Aptos(config);
    }

    /**
     * search: Find agents matching the query
     * 
     * EXAMPLE:
     * const results = await discovery.search({
     *   capabilities: ["code-audit"],
     *   min_reputation: 500,
     *   max_price: 0.5,
     *   sort_by: "reputation",
     *   limit: 10
     * });
     */
    async search(query: DiscoveryQuery): Promise<DiscoveryResult[]> {
        const agents = await this.getAllAgents();
        let results: DiscoveryResult[] = [];

        for (const agent of agents) {
            const matchScore = this.calculateMatchScore(agent, query);

            if (matchScore > 0) {
                results.push({
                    agent,
                    match_score: matchScore,
                    matched_capabilities: this.getMatchedCapabilities(agent, query),
                    estimated_response_time_ms: this.estimateResponseTime(agent),
                });
            }
        }

        // Apply sorting
        results = this.sortResults(results, query.sort_by, query.order);

        // Apply pagination
        const offset = query.offset || 0;
        const limit = query.limit || 10;
        results = results.slice(offset, offset + limit);

        return results;
    }

    /**
     * searchByIntent: Find agents based on natural language intent
     * 
     * EXAMPLE:
     * const agents = await discovery.searchByIntent(
     *   "Find an agent that can audit my Move smart contract code"
     * );
     * 
     * Returns agents sorted by relevance to the intent
     */
    async searchByIntent(intent: string): Promise<DiscoveryResult[]> {
        // Step 1: Analyze intent to extract capabilities needed
        const analysis = this.analyzeIntent(intent);

        console.log(`📍 Intent Analysis:`, {
            capabilities: analysis.capabilities_required,
            confidence: analysis.confidence,
            keywords: analysis.keywords,
        });

        // Step 2: Search for agents with those capabilities
        const results = await this.search({
            capabilities: analysis.capabilities_required,
            min_reputation: 300,  // Don't use unknown agents
            limit: 5,
            sort_by: "reputation",
        });

        // Step 3: Rerank by confidence
        return results.map(result => ({
            ...result,
            match_score: result.match_score * analysis.confidence,
        })).sort((a, b) => b.match_score - a.match_score);
    }

    /**
     * getRecommendations: Get the "best" agents for a common task
     * 
     * EXAMPLE:
     * const auditors = await discovery.getRecommendations("code-audit");
     */
    async getRecommendations(capability: string, limit: number = 5): Promise<Agent[]> {
        const results = await this.search({
            capabilities: [capability],
            min_reputation: 600,
            sort_by: "reputation",
            limit,
        });

        return results.map(r => r.agent);
    }

    /**
     * getAgentMetrics: Get current stats about an agent
     * 
     * Returns:
     * - Reputation score
     * - Current pricing
     * - Response time
     * - Availability
     * - Success rate
     */
    async getAgentMetrics(agentId: string): Promise<{
        agentId: string;
        successRate: number;
        averageResponseTime: number;
        totalRequests: number;
        reputation: number;
        availability: number;
    }> {
        const agent = await this.getAgent(agentId);

        if (!agent) {
            throw new Error(`Agent not found: ${agentId}`);
        }

        return {
            agentId: agent.id,
            successRate: this.calculateSuccessRate(agent),
            averageResponseTime: this.estimateResponseTime(agent),
            totalRequests: agent.onChainData?.totalVolume || 0,
            reputation: agent.reputation,
            availability: agent.onChainData?.reputationScore ? (agent.onChainData.reputationScore / 10) : 0,
        };
    }

    /**
     * subscribeToAvailability: WebSocket subscription for real-time agent availability
     * 
     * Used by agents to monitor which agents are online and what their current prices are.
     * 
     * EXAMPLE:
     * const ws = discovery.subscribeToAvailability((update) => {
     *   console.log(`Agent ${update.agent_id} price changed to ${update.price}`);
     * });
     */
    subscribeToAvailability(callback: (update: { agentId: string; available: boolean; timestamp: number }) => void): WebSocket {
        const protocol = typeof window !== 'undefined' && window.location.protocol === 'https:' 
            ? 'wss' 
            : 'ws';
        const ws = new WebSocket(`${protocol}://localhost:3001/api/bazaar`);

        ws.onmessage = (event) => {
            const data = JSON.parse(event.data);
            callback(data);
        };

        ws.onerror = (error) => {
            console.error("Bazaar connection error:", error);
        };

        return ws;
    }

    // ===== Helper Methods =====

    /**
     * analyzeIntent: Extract capabilities from natural language intent
     * 
     * Uses simple keyword matching for MVP.
     * Can be enhanced with LLM in future.
     */
    private analyzeIntent(intent: string): IntentAnalysis {
        const lowerIntent = intent.toLowerCase();
        let matchedCapabilities: string[] = [];
        let bestConfidence = 0;

        // Check each pattern in the map
        for (const [pattern, capabilities] of Object.entries(CAPABILITY_MAP)) {
            if (lowerIntent.includes(pattern)) {
                matchedCapabilities = capabilities;
                bestConfidence = Math.min(1.0, 0.7 + (pattern.split(" ").length * 0.05));
                break;
            }
        }

        // Fallback: keyword matching
        if (matchedCapabilities.length === 0) {
            const keywords = [
                "audit", "review", "analyze", "generate", "code", "contract",
                "security", "image", "data", "price", "market"
            ];

            for (const keyword of keywords) {
                if (lowerIntent.includes(keyword)) {
                    bestConfidence = 0.5;
                    matchedCapabilities.push(keyword);
                }
            }
        }

        return {
            capabilities_required: matchedCapabilities,
            confidence: Math.max(INTENT_CONFIDENCE_THRESHOLD, bestConfidence),
            keywords: intent.split(" "),
        };
    }

    /**
     * calculateMatchScore: How well agent matches the query (0-1.0)
     */
    private calculateMatchScore(agent: Agent, query: DiscoveryQuery): number {
        let score = 0;

        // Capability matching
        if (query.capabilities && query.capabilities.length > 0) {
            const agentCapabilities = agent.onChainData ? [] : [agent.category || ""];
            const matchedCount = query.capabilities.filter(cap =>
                agentCapabilities.some(ac => ac.toLowerCase().includes(cap.toLowerCase()))
            ).length;

            if (query.capability_any) {
                score += (matchedCount > 0 ? 0.3 : 0);
            } else {
                score += (matchedCount / query.capabilities.length) * 0.3;
            }
        } else {
            score += 0.3;
        }

        // Reputation filter
        if (query.min_reputation) {
            const rep = agent.onChainData?.reputationScore || agent.reputation * 10;
            if (rep >= query.min_reputation) {
                score += 0.3;
            } else {
                return 0;  // Don't return agents below reputation threshold
            }
        } else {
            score += 0.3;
        }

        // Price filter
        if (query.max_price && agent.price > query.max_price) {
            return 0;  // Exclude if over budget
        }
        if (query.min_price && agent.price < query.min_price) {
            return 0;  // Exclude if suspiciously cheap
        }
        score += 0.2;

        // Availability
        if (query.min_availability) {
            const availability = agent.onChainData?.reputationScore ? (agent.onChainData.reputationScore / 10) : 50;
            if (availability >= query.min_availability) {
                score += 0.2;
            }
        } else {
            score += 0.2;
        }

        return Math.min(score, 1.0);
    }

    /**
     * getMatchedCapabilities: Which capabilities matched the query
     */
    private getMatchedCapabilities(agent: Agent, query: DiscoveryQuery): string[] {
        if (!query.capabilities) return [];

        const agentCapabilities = agent.onChainData ? [] : [agent.category || ""];
        return query.capabilities.filter(cap =>
            agentCapabilities.some(ac => ac.toLowerCase().includes(cap.toLowerCase()))
        );
    }

    /**
     * estimateResponseTime: Predict how fast agent will respond
     * 
     * Based on agent specs and historical data
     */
    private estimateResponseTime(agent: Agent): number {
        if (agent.specs?.latency) {
            const match = agent.specs.latency.match(/(\d+)/);
            if (match) {
                return parseInt(match[1]);
            }
        }
        return 500;  // Default 500ms
    }

    /**
     * calculateSuccessRate: What % of agent's tasks succeed
     */
    private calculateSuccessRate(agent: Agent): number {
        if (agent.onChainData) {
            // success_rate = successful / total
            // We don't have this data directly, estimate from reputation
            return Math.min(100, (agent.onChainData.reputationScore / 1000) * 100);
        }
        return 85;  // Default estimate
    }

    /**
     * sortResults: Apply sorting to results
     */
    private sortResults(
        results: DiscoveryResult[],
        sortBy?: string,
        order?: string
    ): DiscoveryResult[] {
        const ascending = order === "asc";

        switch (sortBy) {
            case "price":
                return results.sort((a, b) =>
                    ascending ? a.agent.price - b.agent.price : b.agent.price - a.agent.price
                );

            case "availability":
                return results.sort((a, b) => {
                    const aAvail = a.agent.onChainData?.reputationScore || 0;
                    const bAvail = b.agent.onChainData?.reputationScore || 0;
                    return ascending ? aAvail - bAvail : bAvail - aAvail;
                });

            case "speed":
                return results.sort((a, b) =>
                    ascending
                        ? a.estimated_response_time_ms - b.estimated_response_time_ms
                        : b.estimated_response_time_ms - a.estimated_response_time_ms
                );

            case "reputation":
            default:
                return results.sort((a, b) =>
                    ascending
                        ? a.match_score - b.match_score
                        : b.match_score - a.match_score
                );
        }
    }

    /**
     * getAllAgents: Fetch all registered agents from blockchain
     * 
     * In production, this would:
     * 1. Query Aptos on-chain state
     * 2. Cache results with periodic refresh
     * 3. Supplement with off-chain data
     */
    private async getAllAgents(): Promise<Agent[]> {
        // TODO: Query agent_card module for all registered agents
        // For now, return empty - will be fetched from blockchain
        return [];
    }

    /**
     * getAgent: Fetch a specific agent by ID
     */
    private async getAgent(agentId: string): Promise<Agent | null> {
        if (this.agentCache.has(agentId)) {
            return this.agentCache.get(agentId) || null;
        }

        // TODO: Query agent_card module for this specific agent
        return null;
    }
}

/**
 * Export singleton discovery service for use throughout app
 */
export const discoveryService = new DiscoveryService();
