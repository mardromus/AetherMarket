import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { AGENT_SPECS, getAgentCostAPT, getAllAgentIds, UNIFIED_AGENT_REGISTRY } from '@/lib/agents/config';
import type { AgentSpec } from '@/lib/agents/interface';

export interface Agent {
    id: string;
    name: string;
    description: string;
    price: number;
    reputation: number;
    imageUrl: string;
    endpoint: string;
    category?: string;
    model?: string;
    // Full agent specification from registry
    fullSpec?: AgentSpec;
    specs?: {
        architecture: string;
        tflops: string;
        vram: string;
        latency: string;
    };
    isSwarm?: boolean;
    onChainData?: {
        registryId: string;
        ownerAddress: string;
        reputationScore: number;
        totalVolume: number;
        disputeRate: number;
    };
}

interface AgentState {
    agents: Agent[];
    addAgent: (agent: Agent) => void;
    updateReputation: (id: string, score: number) => void;
}

/**
 * Generate default agents from unified config
 */
function generateDefaultAgents(): Agent[] {
    return getAllAgentIds().map(id => {
        const spec = AGENT_SPECS[id as keyof typeof AGENT_SPECS];
        const fullSpec = UNIFIED_AGENT_REGISTRY[id as keyof typeof UNIFIED_AGENT_REGISTRY];
        const costAPT = getAgentCostAPT(id);

        return {
            id,
            name: spec.name,
            description: fullSpec?.description || `${spec.name} - ${spec.category}. Powered by ${spec.model}.`,
            price: costAPT,
            reputation: Math.floor(Math.random() * 40) + 80, // 80-120
            imageUrl: `https://robohash.org/${id}?set=set1&bgset=bg1`,
            endpoint: spec.endpoint,
            category: spec.category,
            model: spec.model,
            fullSpec: fullSpec, // Include complete specification
            isSwarm: spec.isSwarm || false,
            specs: {
                architecture: spec.model,
                tflops: `${Math.floor(Math.random() * 500) + 50} TFLOPS`,
                vram: "Cloud GPU",
                latency: `${Math.floor(Math.random() * 2000) + 100}ms`
            },
            onChainData: {
                registryId: `0x${id.charCodeAt(0)}::${id.charCodeAt(1)}`,
                ownerAddress: `0xaether${id.slice(0, 6)}`,
                reputationScore: Math.floor(Math.random() * 300) + 700,
                totalVolume: Math.floor(Math.random() * 50000),
                disputeRate: Math.random() * 5
            }
        };
    });
}

const DEFAULT_AGENTS = generateDefaultAgents();

export const useAgentStore = create<AgentState>()(
    persist(
        (set) => ({
            agents: DEFAULT_AGENTS,
            addAgent: (agent) => set((state) => ({ agents: [...state.agents, agent] })),
            updateReputation: (id, score) => set((state) => ({
                agents: state.agents.map(a => a.id === id ? { ...a, reputation: score } : a)
            })),
        }),
        {
            name: 'aether-agent-storage',            // Reconcile persisted agents with any new default agents added in code
            onRehydrateStorage: () => (state) => {
                try {
                    const defaultIds = DEFAULT_AGENTS.map(a => a.id);
                    const persisted = (state as any)?.agents || [];
                    const persistedIds = persisted.map((a: any) => a.id);

                    // Add missing defaults
                    const missing = DEFAULT_AGENTS.filter(a => !persistedIds.includes(a.id));

                    // Update existing entries from defaults for schema drift
                    const merged = persisted.map((p: any) => {
                        const updated = DEFAULT_AGENTS.find(d => d.id === p.id);
                        return updated ? { ...updated, reputation: p.reputation ?? updated.reputation, onChainData: p.onChainData ?? updated.onChainData } : p;
                    });

                    if (missing.length > 0) {
                        (state as any).agents = [...merged, ...missing];
                    } else {
                        (state as any).agents = merged;
                    }
                } catch (e) {
                    // no-op
                }
            }
        }
    )
);
