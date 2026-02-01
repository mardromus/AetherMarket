"use client";

import React, { useState, useMemo } from 'react';
import { getAllAgents } from '@/lib/agents/unified-registry';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Navbar } from '@/components/Navbar';
import { NetworkBackground } from '@/components/NetworkBackground';
import {
    Sparkles, Code2, TrendingUp, Search, MessageSquare, Zap,
    CheckCircle2, AlertCircle, Play, Eye
} from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const CATEGORY_COLORS: Record<string, string> = {
    "ai-generation": "bg-pink-500/10 border-pink-500/20 text-pink-400",
    "analysis": "bg-cyan-500/10 border-cyan-500/20 text-cyan-400",
    "code": "bg-purple-500/10 border-purple-500/20 text-purple-400",
    "data-retrieval": "bg-green-500/10 border-green-500/20 text-green-400",
    "composite": "bg-orange-500/10 border-orange-500/20 text-orange-400",
    "utility": "bg-blue-500/10 border-blue-500/20 text-blue-400"
};

const CATEGORY_ICONS: Record<string, React.ReactNode> = {
    "ai-generation": <Sparkles className="w-4 h-4" />,
    "analysis": <MessageSquare className="w-4 h-4" />,
    "code": <Code2 className="w-4 h-4" />,
    "data-retrieval": <TrendingUp className="w-4 h-4" />,
    "composite": <Zap className="w-4 h-4" />,
    "utility": <Search className="w-4 h-4" />
};

interface AgentDetails {
    expanded: boolean;
    showCapabilities: boolean;
}

export default function DashboardAgentPage() {
    const [activeTab, setActiveTab] = useState("overview");
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
    const [expandedAgents, setExpandedAgents] = useState<Record<string, AgentDetails>>({});
    const [filter, setFilter] = useState<"all" | "verified" | "composite">("all");

    const agents = useMemo(() => {
        let result = getAllAgents();
        
        if (selectedCategory) {
            result = result.filter(a => a.category === selectedCategory);
        }
        
        if (filter === "verified") {
            result = result.filter(a => a.isVerified);
        } else if (filter === "composite") {
            result = result.filter(a => a.isComposite);
        }
        
        return result;
    }, [selectedCategory, filter]);

    const categories = useMemo(() => {
        const cats = new Map<string, number>();
        getAllAgents().forEach(agent => {
            cats.set(agent.category, (cats.get(agent.category) || 0) + 1);
        });
        return Array.from(cats.entries());
    }, []);

    const toggleCapabilities = (agentId: string) => {
        setExpandedAgents(prev => ({
            ...prev,
            [agentId]: {
                ...prev[agentId],
                showCapabilities: !prev[agentId]?.showCapabilities
            }
        }));
    };

    return (
        <div className="min-h-screen relative text-foreground">
            <NetworkBackground />
            <Navbar />

            <div className="pt-32 px-6 max-w-7xl mx-auto pb-20 relative z-10">
                {/* Header */}
                <div className="mb-12">
                    <h1 className="text-4xl font-black text-white tracking-tighter mb-2">Agent Dashboard</h1>
                    <p className="text-muted-foreground">Explore, manage, and mint all available agents</p>
                </div>

                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full space-y-8">
                    <TabsList className="grid w-full grid-cols-3 lg:grid-cols-5">
                        <TabsTrigger value="overview">Overview</TabsTrigger>
                        <TabsTrigger value="agents">Agents ({agents.length})</TabsTrigger>
                        <TabsTrigger value="minting">Minting</TabsTrigger>
                    </TabsList>

                    {/* OVERVIEW TAB */}
                    <TabsContent value="overview" className="space-y-8">
                        {/* Stats Grid */}
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                            <Card className="bg-black/20 border-white/10">
                                <CardContent className="pt-6">
                                    <div className="text-3xl font-bold text-cyan-400">{getAllAgents().length}</div>
                                    <div className="text-sm text-muted-foreground mt-2">Total Agents</div>
                                </CardContent>
                            </Card>
                            <Card className="bg-black/20 border-white/10">
                                <CardContent className="pt-6">
                                    <div className="text-3xl font-bold text-green-400">
                                        {getAllAgents().filter(a => a.isVerified).length}
                                    </div>
                                    <div className="text-sm text-muted-foreground mt-2">Verified</div>
                                </CardContent>
                            </Card>
                            <Card className="bg-black/20 border-white/10">
                                <CardContent className="pt-6">
                                    <div className="text-3xl font-bold text-orange-400">
                                        {getAllAgents().filter(a => a.isComposite).length}
                                    </div>
                                    <div className="text-sm text-muted-foreground mt-2">Composite</div>
                                </CardContent>
                            </Card>
                            <Card className="bg-black/20 border-white/10">
                                <CardContent className="pt-6">
                                    <div className="text-3xl font-bold text-purple-400">{categories.length}</div>
                                    <div className="text-sm text-muted-foreground mt-2">Categories</div>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Categories */}
                        <div className="space-y-4">
                            <h2 className="text-lg font-bold text-white">Categories</h2>
                            <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
                                {categories.map(([category, count]) => (
                                    <button
                                        key={category}
                                        onClick={() => {
                                            setSelectedCategory(selectedCategory === category ? null : category);
                                            setActiveTab("agents");
                                        }}
                                        className={`p-4 rounded-lg border transition-all ${
                                            selectedCategory === category
                                                ? 'bg-white/10 border-white/30'
                                                : 'bg-black/20 border-white/10 hover:border-white/20'
                                        }`}
                                    >
                                        <div className="flex items-center gap-2 mb-2">
                                            {CATEGORY_ICONS[category]}
                                            <span className="font-semibold capitalize">{category.replace("-", " ")}</span>
                                        </div>
                                        <div className="text-sm text-muted-foreground">{count} agents</div>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Top Agents */}
                        <div className="space-y-4">
                            <h2 className="text-lg font-bold text-white">Top Performing</h2>
                            <div className="space-y-2">
                                {getAllAgents()
                                    .sort((a, b) => b.successRate - a.successRate)
                                    .slice(0, 5)
                                    .map(agent => (
                                        <div
                                            key={agent.id}
                                            className="flex items-center justify-between p-4 rounded-lg bg-black/20 border border-white/10"
                                        >
                                            <div className="flex items-center gap-3">
                                                <CheckCircle2 className="w-5 h-5 text-green-400" />
                                                <div>
                                                    <div className="font-semibold">{agent.name}</div>
                                                    <div className="text-sm text-muted-foreground">{agent.successRate}% success rate</div>
                                                </div>
                                            </div>
                                            <Badge className="bg-green-500/20 text-green-400 border-0">
                                                {agent.averageRating}/5 ⭐
                                            </Badge>
                                        </div>
                                    ))}
                            </div>
                        </div>
                    </TabsContent>

                    {/* AGENTS TAB */}
                    <TabsContent value="agents" className="space-y-6">
                        {/* Filters */}
                        <div className="flex gap-2 flex-wrap">
                            {(["all", "verified", "composite"] as const).map(f => (
                                <Button
                                    key={f}
                                    variant={filter === f ? "default" : "outline"}
                                    size="sm"
                                    onClick={() => setFilter(f)}
                                    className="capitalize"
                                >
                                    {f}
                                </Button>
                            ))}
                        </div>

                        {/* Agents List */}
                        <div className="grid gap-4">
                            {agents.length === 0 ? (
                                <Card className="bg-black/20 border-white/10">
                                    <CardContent className="pt-8 text-center">
                                        <AlertCircle className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                                        <p className="text-muted-foreground">No agents found</p>
                                    </CardContent>
                                </Card>
                            ) : (
                                agents.map(agent => (
                                    <Card
                                        key={agent.id}
                                        className="bg-black/20 border-white/10 hover:border-white/20 transition-all"
                                    >
                                        <CardHeader>
                                            <div className="flex items-start justify-between">
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-3 mb-2">
                                                        <CardTitle className="text-xl">{agent.name}</CardTitle>
                                                        {agent.isVerified && (
                                                            <CheckCircle2 className="w-4 h-4 text-green-400" />
                                                        )}
                                                        {agent.isComposite && (
                                                            <Badge className="bg-orange-500/20 text-orange-400 border-0 text-xs">
                                                                Composite
                                                            </Badge>
                                                        )}
                                                    </div>
                                                    <CardDescription className="line-clamp-2">
                                                        {agent.description}
                                                    </CardDescription>
                                                </div>
                                                <Badge className={`border ${CATEGORY_COLORS[agent.category] || ""}`}>
                                                    {CATEGORY_ICONS[agent.category]}
                                                    <span className="ml-1 capitalize">{agent.category}</span>
                                                </Badge>
                                            </div>
                                        </CardHeader>

                                        <CardContent className="space-y-4">
                                            {/* Metrics */}
                                            <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 text-sm">
                                                <div className="p-2 rounded bg-white/5">
                                                    <div className="text-muted-foreground">Success Rate</div>
                                                    <div className="text-green-400 font-semibold">{agent.successRate}%</div>
                                                </div>
                                                <div className="p-2 rounded bg-white/5">
                                                    <div className="text-muted-foreground">Rating</div>
                                                    <div className="text-cyan-400 font-semibold">{agent.averageRating}/5</div>
                                                </div>
                                                <div className="p-2 rounded bg-white/5">
                                                    <div className="text-muted-foreground">Executions</div>
                                                    <div className="text-purple-400 font-semibold">{agent.totalExecutions}</div>
                                                </div>
                                                <div className="p-2 rounded bg-white/5">
                                                    <div className="text-muted-foreground">Avg Time</div>
                                                    <div className="text-orange-400 font-semibold">{agent.averageExecutionTimeMs}ms</div>
                                                </div>
                                            </div>

                                            {/* Capabilities Button */}
                                            <button
                                                onClick={() => toggleCapabilities(agent.id)}
                                                className="w-full flex items-center justify-between p-2 rounded hover:bg-white/5 transition-all"
                                            >
                                                <span className="text-sm font-medium">
                                                    Capabilities ({Object.keys(agent.capabilities).length})
                                                </span>
                                                <Eye className={`w-4 h-4 transition-transform ${
                                                    expandedAgents[agent.id]?.showCapabilities ? 'rotate-180' : ''
                                                }`} />
                                            </button>

                                            {/* Capabilities */}
                                            {expandedAgents[agent.id]?.showCapabilities && (
                                                <div className="space-y-3 pt-2 border-t border-white/10">
                                                    {Object.entries(agent.capabilities).map(([capId, cap]) => (
                                                        <div key={capId} className="p-3 rounded bg-white/5 space-y-2">
                                                            <div className="flex items-start justify-between">
                                                                <div>
                                                                    <div className="font-semibold text-sm">{cap.name}</div>
                                                                    <div className="text-xs text-muted-foreground">{cap.description}</div>
                                                                </div>
                                                                <Badge variant="secondary" className="text-xs whitespace-nowrap">
                                                                    {Number(cap.costOctas) / 100_000_000} APT
                                                                </Badge>
                                                            </div>
                                                            <div className="grid grid-cols-2 gap-2 text-xs">
                                                                <div>
                                                                    <div className="text-muted-foreground">Max Input</div>
                                                                    <div>{(cap.maxInputSize / 1024).toFixed(1)}KB</div>
                                                                </div>
                                                                <div>
                                                                    <div className="text-muted-foreground">Timeout</div>
                                                                    <div>{cap.timeoutMs}ms</div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}

                                            {/* Tags */}
                                            <div className="flex gap-2 flex-wrap pt-2">
                                                {agent.tags.map(tag => (
                                                    <Badge key={tag} variant="secondary" className="text-xs">
                                                        {tag}
                                                    </Badge>
                                                ))}
                                            </div>

                                            {/* Actions */}
                                            <div className="flex gap-2 pt-4">
                                                <Button
                                                    size="sm"
                                                    variant="default"
                                                    className="flex-1"
                                                    onClick={() => {
                                                        window.open(`/agents/${agent.id}`, '_blank');
                                                    }}
                                                >
                                                    <Play className="w-4 h-4 mr-2" />
                                                    Use Agent
                                                </Button>
                                                {agent.isComposite && (
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        className="flex-1"
                                                    >
                                                        <Zap className="w-4 h-4 mr-2" />
                                                        Dependencies
                                                    </Button>
                                                )}
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))
                            )}
                        </div>
                    </TabsContent>

                    {/* MINTING TAB */}
                    <TabsContent value="minting" className="space-y-6">
                        <Card className="bg-black/20 border-white/10">
                            <CardHeader>
                                <CardTitle>Agent Minting</CardTitle>
                                <CardDescription>
                                    Create and register new agents on the Aether Market
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div className="grid gap-6 pt-4">
                                    {/* Coming Soon Notice */}
                                    <div className="p-6 rounded-lg bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-500/20 space-y-4">
                                        <div className="flex items-start gap-4">
                                            <Sparkles className="w-6 h-6 text-purple-400 mt-1 flex-shrink-0" />
                                            <div>
                                                <h3 className="font-bold text-lg text-white mb-2">Coming Soon</h3>
                                                <p className="text-muted-foreground mb-4">
                                                    Agent minting capabilities will allow developers to register custom agents on Aether Market.
                                                </p>
                                                <ul className="space-y-2 text-sm text-muted-foreground">
                                                    <li>✓ Deploy custom agent logic</li>
                                                    <li>✓ Set pricing and capabilities</li>
                                                    <li>✓ On-chain registration & verification</li>
                                                    <li>✓ Revenue sharing & reputation</li>
                                                </ul>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Feature Timeline */}
                                    <div className="space-y-4">
                                        <h3 className="font-bold text-white">Release Timeline</h3>
                                        <div className="space-y-3">
                                            {[
                                                { phase: "Phase 1", date: "Feb 2026", desc: "Agent Registry Contract" },
                                                { phase: "Phase 2", date: "Mar 2026", desc: "Minting SDK & CLI Tools" },
                                                { phase: "Phase 3", date: "Apr 2026", desc: "Mainnet Deployment" }
                                            ].map((item, idx) => (
                                                <div key={idx} className="flex items-start gap-4">
                                                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-purple-500/20 border border-purple-500 flex items-center justify-center">
                                                        <span className="text-xs font-bold text-purple-400">{idx + 1}</span>
                                                    </div>
                                                    <div className="flex-1">
                                                        <div className="font-semibold text-white">{item.phase}</div>
                                                        <div className="text-sm text-muted-foreground">{item.desc} • {item.date}</div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    );
}
