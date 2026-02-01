/**
 * UNIFIED AGENT CONFIGURATION
 * Single source of truth - synced from unified-registry.ts
 * Auto-derives from UNIFIED_AGENT_REGISTRY
 */

import { UNIFIED_AGENT_REGISTRY } from "./unified-registry";

// ============================================
// AUTO-GENERATED FROM UNIFIED REGISTRY
// ============================================

// Extract costs by agent ID
export const AGENT_COSTS = Object.entries(UNIFIED_AGENT_REGISTRY).reduce((acc, [agentId, agent]) => {
    const firstCapability = Object.values(agent.capabilities)[0];
    acc[agentId] = Number(firstCapability.costOctas);
    return acc;
}, {} as Record<string, number>);

// Add default
(AGENT_COSTS as any).default = 3000000;

// Derive specs from registry for backward compatibility
export const AGENT_SPECS = Object.entries(UNIFIED_AGENT_REGISTRY).reduce((acc, [agentId, agent]) => {
    const firstCapId = Object.keys(agent.capabilities)[0];
    const firstCapability = agent.capabilities[firstCapId];
    
    acc[agentId] = {
        name: agent.name,
        type: firstCapId,
        model: agent.model || "multi-agent",
        endpoint: agent.executorUrl || "/api/mock-agent",
        costAPT: Number(firstCapability.costOctas) / 100_000_000,
        capabilities: agent.tags,
        category: agent.category,
        isComposite: agent.isComposite,
        usesAgents: agent.usesAgents || []
    };
    
    return acc;
}, {} as Record<string, any>);

/**
 * Get agent cost in octas
 */
export function getAgentCostOctas(agentId: string, capabilityId?: string): string {
    const agent = UNIFIED_AGENT_REGISTRY[agentId];
    if (!agent) return "3000000";
    
    if (capabilityId && agent.capabilities[capabilityId]) {
        return agent.capabilities[capabilityId].costOctas;
    }
    
    // Return first capability cost
    const firstCapability = Object.values(agent.capabilities)[0];
    return firstCapability?.costOctas || "3000000";
}

/**
 * Get agent cost in APT
 */
export function getAgentCostAPT(agentId: string, capabilityId?: string): number {
    const octas = getAgentCostOctas(agentId, capabilityId);
    return Number(octas) / 100_000_000;
}

/**
 * Get agent specs
 */
export function getAgentSpecs(agentId: string) {
    return AGENT_SPECS[agentId];
}

/**
 * List all agent IDs
 */
export function getAllAgentIds(): string[] {
    return Object.keys(UNIFIED_AGENT_REGISTRY);
}

/**
 * Get agents by category
 */
export function getAgentsByCategory(category: string) {
    return getAllAgentIds().filter(id => {
        const agent = UNIFIED_AGENT_REGISTRY[id];
        return agent?.category === category;
    });
}

/**
 * Export full registry for advanced usage
 */
export { UNIFIED_AGENT_REGISTRY } from "./unified-registry";
export type { AgentSpec } from "./interface";
