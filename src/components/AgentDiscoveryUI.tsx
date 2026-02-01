"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, Star, TrendingUp, Zap, AlertCircle, GitBranch } from "lucide-react";

interface Agent {
    id: string;
    name: string;
    description: string;
    capabilities: string[];
    totalExecutions: number;
    successRate: number;
    averageRating: number;
    isVerified: boolean;
    isPublic: boolean;
    canInvokeOtherAgents?: boolean;
    dependsOnAgents?: string[];
}

interface AgentDiscoveryProps {
    onAgentSelect?: (agentId: string) => void;
    capabilityFilter?: string;
}

export function AgentDiscoveryUI({ onAgentSelect, capabilityFilter }: AgentDiscoveryProps) {
    const [agents, setAgents] = useState<Agent[]>([]);
    const [loading, setLoading] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [sortBy, setSortBy] = useState("rating");
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        loadAgents();
    }, [capabilityFilter]);

    async function loadAgents() {
        setLoading(true);
        setError(null);

        try {
            let url = "/api/agents/discover?action=list";

            if (capabilityFilter) {
                url = `/api/agents/discover?action=by-capability&capability=${capabilityFilter}`;
            }

            const response = await fetch(url);
            if (!response.ok) throw new Error("Failed to load agents");

            const data = await response.json();
            let agentList = capabilityFilter ? data.agents : data.agents;

            // Sort agents
            if (sortBy === "rating") {
                agentList.sort((a: any, b: any) => b.averageRating - a.averageRating);
            } else if (sortBy === "executions") {
                agentList.sort((a: any, b: any) => b.totalExecutions - a.totalExecutions);
            } else if (sortBy === "successRate") {
                agentList.sort((a: any, b: any) => b.successRate - a.successRate);
            }

            setAgents(agentList);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Unknown error");
        } finally {
            setLoading(false);
        }
    }

    async function handleSearch() {
        if (!searchQuery.trim()) {
            loadAgents();
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const response = await fetch(
                `/api/agents/discover?action=search&q=${encodeURIComponent(searchQuery)}`
            );
            if (!response.ok) throw new Error("Search failed");

            const data = await response.json();
            setAgents(data.agents);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Unknown error");
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="space-y-6">
            {/* Search and Filter Bar */}
            <div className="flex gap-2">
                <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                        placeholder="Search agents..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        onKeyPress={(e) => e.key === "Enter" && handleSearch()}
                        className="pl-10 bg-white/5 border-white/10"
                    />
                </div>
                <Button onClick={handleSearch} className="bg-primary hover:bg-primary/90">
                    Search
                </Button>
                <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="bg-white/5 border border-white/10 rounded px-3 py-2 text-sm"
                >
                    <option value="rating">Top Rated</option>
                    <option value="executions">Most Used</option>
                    <option value="successRate">Success Rate</option>
                </select>
            </div>

            {error && (
                <div className="flex gap-2 p-3 bg-red-500/10 border border-red-500/20 rounded">
                    <AlertCircle className="w-4 h-4 text-red-400 mt-0.5 flex-shrink-0" />
                    <span className="text-sm text-red-400">{error}</span>
                </div>
            )}

            {loading ? (
                <div className="text-center py-8 text-muted-foreground">
                    Loading agents...
                </div>
            ) : agents.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                    No agents found. Try adjusting your search.
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {agents.map((agent) => (
                        <AgentCard
                            key={agent.id}
                            agent={agent}
                            onSelect={() => onAgentSelect?.(agent.id)}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}

function AgentCard({ agent, onSelect }: { agent: Agent; onSelect: () => void }) {
    return (
        <Card className="bg-black/40 border-white/10 backdrop-blur-md hover:border-white/20 transition-all cursor-pointer" onClick={onSelect}>
            <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-2">
                    <div className="flex-1">
                        <CardTitle className="text-lg">{agent.name}</CardTitle>
                        <p className="text-xs text-muted-foreground mt-1">{agent.description}</p>
                    </div>
                    {agent.isVerified && (
                        <Badge variant="default" className="bg-green-500/20 text-green-300 border-green-500/30">
                            ✓ Verified
                        </Badge>
                    )}
                </div>
            </CardHeader>

            <CardContent className="space-y-4">
                {/* Stats */}
                <div className="grid grid-cols-3 gap-2 text-xs">
                    <div>
                        <div className="flex items-center gap-1 text-muted-foreground mb-1">
                            <Star className="w-3 h-3" />
                            Rating
                        </div>
                        <div className="text-lg font-bold">{agent.averageRating.toFixed(1)}</div>
                    </div>
                    <div>
                        <div className="flex items-center gap-1 text-muted-foreground mb-1">
                            <TrendingUp className="w-3 h-3" />
                            Success
                        </div>
                        <div className="text-lg font-bold">{agent.successRate.toFixed(0)}%</div>
                    </div>
                    <div>
                        <div className="flex items-center gap-1 text-muted-foreground mb-1">
                            <Zap className="w-3 h-3" />
                            Uses
                        </div>
                        <div className="text-lg font-bold">{(agent.totalExecutions / 1000).toFixed(1)}k</div>
                    </div>
                </div>

                {/* Capabilities */}
                <div>
                    <p className="text-xs text-muted-foreground mb-2">Capabilities</p>
                    <div className="flex flex-wrap gap-1">
                        {agent.capabilities.slice(0, 3).map((cap) => (
                            <Badge key={cap} variant="outline" className="text-xs">
                                {cap}
                            </Badge>
                        ))}
                        {agent.capabilities.length > 3 && (
                            <Badge variant="outline" className="text-xs">
                                +{agent.capabilities.length - 3}
                            </Badge>
                        )}
                    </div>
                </div>

                {/* Agent Composition */}
                {agent.canInvokeOtherAgents && (
                    <div className="flex items-center gap-2 p-2 bg-cyan-500/10 rounded border border-cyan-500/20">
                        <GitBranch className="w-3 h-3 text-cyan-400" />
                        <span className="text-xs text-cyan-300">
                            Uses {agent.dependsOnAgents?.length || 0} other agent(s)
                        </span>
                    </div>
                )}

                {/* Action Button */}
                <Button
                    onClick={onSelect}
                    variant="outline"
                    className="w-full border-primary/50 text-primary hover:bg-primary/10"
                >
                    Use This Agent
                </Button>
            </CardContent>
        </Card>
    );
}
