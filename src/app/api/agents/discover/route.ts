/**
 * Agent Discovery API
 * Lists all available agents with details, capabilities, and composability info
 */

import { NextRequest, NextResponse } from "next/server";
import { AGENT_REGISTRY, findAgentsByCapability, getAgent } from "@/lib/agents/registry";
import { getAgentDependencies, estimateAgentCost } from "@/lib/agents/invocation";

export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams;
        const action = searchParams.get("action");
        const agentId = searchParams.get("agentId");
        const capability = searchParams.get("capability");
        const verified = searchParams.get("verified");

        // List all agents
        if (action === "list" || !action) {
            let agents = Object.values(AGENT_REGISTRY);

            // Filter by verified status
            if (verified === "true") {
                agents = agents.filter(a => a.isVerified);
            } else if (verified === "false") {
                agents = agents.filter(a => !a.isVerified);
            }

            // Filter by public/private
            const isPublic = searchParams.get("public");
            if (isPublic === "true") {
                agents = agents.filter(a => a.isPublic);
            }

            return NextResponse.json({
                agents: agents.map(agent => ({
                    id: agent.id,
                    name: agent.name,
                    description: agent.description,
                    capabilities: Object.keys(agent.capabilities),
                    totalExecutions: agent.totalExecutions,
                    successRate: agent.successRate,
                    averageRating: agent.averageRating,
                    isVerified: agent.isVerified,
                    isPublic: agent.isPublic,
                    canInvokeOtherAgents: agent.canInvokeOtherAgents,
                    dependsOnAgents: agent.dependsOnAgents
                })),
                total: agents.length
            });
        }

        // Get agent details
        if (action === "details" && agentId) {
            const agent = getAgent(agentId);
            if (!agent) {
                return NextResponse.json(
                    { error: `Agent ${agentId} not found` },
                    { status: 404 }
                );
            }

            const dependencies = getAgentDependencies(agentId);

            return NextResponse.json({
                agent,
                dependencies: dependencies.map(dep => ({
                    id: dep.id,
                    name: dep.name,
                    description: dep.description
                })),
                capabilities: Object.entries(agent.capabilities).map(([key, cap]) => ({
                    id: key,
                    ...cap,
                    estimatedTotalCost: estimateAgentCost(agentId, key)
                }))
            });
        }

        // Find agents by capability
        if (action === "by-capability" && capability) {
            const agents = findAgentsByCapability(capability);
            return NextResponse.json({
                capability,
                agents: agents.map(a => ({
                    id: a.id,
                    name: a.name,
                    description: a.description,
                    cost: a.capabilities[capability]?.costInOctas,
                    averageRating: a.averageRating,
                    successRate: a.successRate
                })),
                total: agents.length
            });
        }

        // Search agents
        if (action === "search") {
            const query = (searchParams.get("q") || "").toLowerCase();
            const agents = Object.values(AGENT_REGISTRY).filter(agent =>
                agent.name.toLowerCase().includes(query) ||
                agent.description.toLowerCase().includes(query) ||
                agent.id.toLowerCase().includes(query) ||
                Object.keys(agent.capabilities).some(cap => cap.toLowerCase().includes(query))
            );

            return NextResponse.json({
                query,
                agents: agents.slice(0, 20).map(a => ({
                    id: a.id,
                    name: a.name,
                    description: a.description,
                    capabilities: Object.keys(a.capabilities),
                    averageRating: a.averageRating
                })),
                total: agents.length
            });
        }

        // Get top agents (by rating, execution count, etc.)
        if (action === "top") {
            const sortBy = searchParams.get("sort") || "rating";
            const limit = Math.min(parseInt(searchParams.get("limit") || "10"), 50);

            let agents = Object.values(AGENT_REGISTRY);

            if (sortBy === "rating") {
                agents.sort((a, b) => b.averageRating - a.averageRating);
            } else if (sortBy === "executions") {
                agents.sort((a, b) => b.totalExecutions - a.totalExecutions);
            } else if (sortBy === "successRate") {
                agents.sort((a, b) => b.successRate - a.successRate);
            }

            return NextResponse.json({
                agents: agents.slice(0, limit).map(a => ({
                    id: a.id,
                    name: a.name,
                    description: a.description,
                    capabilities: Object.keys(a.capabilities),
                    totalExecutions: a.totalExecutions,
                    successRate: a.successRate,
                    averageRating: a.averageRating,
                    isVerified: a.isVerified
                })),
                total: Math.min(agents.length, limit)
            });
        }

        // Get composable agents (agents that use other agents)
        if (action === "composable") {
            const composableAgents = Object.values(AGENT_REGISTRY).filter(
                a => a.canInvokeOtherAgents
            );

            return NextResponse.json({
                agents: composableAgents.map(a => ({
                    id: a.id,
                    name: a.name,
                    description: a.description,
                    dependsOnAgents: a.dependsOnAgents,
                    capabilities: Object.keys(a.capabilities),
                    averageRating: a.averageRating
                })),
                total: composableAgents.length
            });
        }

        return NextResponse.json(
            { error: "Unknown action or missing parameters" },
            { status: 400 }
        );

    } catch (error) {
        console.error("Discovery API error:", error);
        return NextResponse.json(
            {
                error: error instanceof Error ? error.message : "Unknown error"
            },
            { status: 500 }
        );
    }
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { action } = body;

        // Find best agent for a task
        if (action === "find-best") {
            const { capability, maxPrice } = body;

            if (!capability) {
                return NextResponse.json(
                    { error: "capability is required" },
                    { status: 400 }
                );
            }

            const agents = findAgentsByCapability(capability)
                .filter(a => a.isPublic && a.isVerified)
                .sort((a, b) => {
                    // Sort by rating first, then by cost (lower is better)
                    if (Math.abs(b.averageRating - a.averageRating) > 0.1) {
                        return b.averageRating - a.averageRating;
                    }
                    const costA = BigInt(a.capabilities[capability].costInOctas);
                    const costB = BigInt(b.capabilities[capability].costInOctas);
                    return Number(costA - costB);
                });

            if (agents.length === 0) {
                return NextResponse.json(
                    { error: `No verified agents found for capability: ${capability}` },
                    { status: 404 }
                );
            }

            const best = agents[0];
            const cost = best.capabilities[capability].costInOctas;

            if (maxPrice) {
                const costBigInt = BigInt(cost);
                const maxPriceBigInt = BigInt(maxPrice);
                if (costBigInt > maxPriceBigInt) {
                    return NextResponse.json(
                        {
                            error: `Best agent costs ${costBigInt / 1000000n} APT, exceeds max price`,
                            alternatives: agents
                                .filter(a => {
                                    const c = BigInt(a.capabilities[capability].costInOctas);
                                    return c <= maxPriceBigInt;
                                })
                                .slice(0, 3)
                                .map(a => ({
                                    id: a.id,
                                    name: a.name,
                                    cost: a.capabilities[capability].costInOctas,
                                    rating: a.averageRating
                                }))
                        },
                        { status: 400 }
                    );
                }
            }

            return NextResponse.json({
                agent: {
                    id: best.id,
                    name: best.name,
                    description: best.description,
                    cost,
                    averageRating: best.averageRating,
                    successRate: best.successRate,
                    totalExecutions: best.totalExecutions
                },
                alternatives: agents.slice(1, 4).map(a => ({
                    id: a.id,
                    name: a.name,
                    cost: a.capabilities[capability].costInOctas,
                    rating: a.averageRating
                }))
            });
        }

        return NextResponse.json(
            { error: "Unknown action" },
            { status: 400 }
        );

    } catch (error) {
        console.error("Discovery API error:", error);
        return NextResponse.json(
            {
                error: error instanceof Error ? error.message : "Unknown error"
            },
            { status: 500 }
        );
    }
}
