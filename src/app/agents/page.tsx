"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { AGENT_REGISTRY } from '@/lib/agents/registry';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Navbar } from '@/components/Navbar';
import { NetworkBackground } from '@/components/NetworkBackground';
import { 
  Sparkles, 
  Code2, 
  TrendingUp, 
  Search, 
  MessageSquare, 
  Zap,
  ArrowRight,
  Star,
  GitBranch,
  CheckCircle
} from 'lucide-react';

const AGENT_ICONS: Record<string, React.ReactNode> = {
  "neural-alpha": <Sparkles className="w-6 h-6 text-pink-500" />,
  "quantum-sage": <Code2 className="w-6 h-6 text-blue-500" />,
  "oracle-prime": <TrendingUp className="w-6 h-6 text-green-500" />,
  "syntax-wizard": <Code2 className="w-6 h-6 text-purple-500" />,
  "atlas-ai": <MessageSquare className="w-6 h-6 text-cyan-500" />,
  "search-sage": <Search className="w-6 h-6 text-yellow-500" />,
  "sentiment-bot": <Zap className="w-6 h-6 text-orange-500" />,
  "research-assistant": <Search className="w-6 h-6 text-indigo-500" />,
  "secure-coder": <Code2 className="w-6 h-6 text-green-500" />
};

const AGENT_TAGS: Record<string, string[]> = {
  "neural-alpha": ["Image Gen", "Art", "DALL-E 3"],
  "quantum-sage": ["Security", "Code Review", "GPT-4"],
  "oracle-prime": ["Finance", "Markets", "Crypto", "Real-time"],
  "syntax-wizard": ["Code Gen", "Development", "GPT-4"],
  "atlas-ai": ["Writing", "Analysis", "Versatile", "GPT-4"],
  "search-sage": ["Web Search", "Research", "SerpAPI"],
  "sentiment-bot": ["NLP", "Analysis", "Emotions", "GPT-4"],
  "research-assistant": ["Composite", "Research", "Multi-Agent"],
  "secure-coder": ["Composite", "Code", "Security"]
};

export default function AgentsPage() {
    const [selectedAgent, setSelectedAgent] = useState<string>("atlas-ai");
    const agents = Object.values(AGENT_REGISTRY);
    const agent = selectedAgent ? AGENT_REGISTRY[selectedAgent] : null;

    return (
        <div className="min-h-screen relative text-foreground">
            <NetworkBackground />
            <Navbar />

            <div className="pt-32 px-6 max-w-7xl mx-auto pb-20 relative z-10">
                {/* Header */}
                <div className="flex items-center gap-4 mb-8">
                    <div className="p-3 bg-primary/10 rounded-xl border border-primary/20">
                        <Sparkles className="w-8 h-8 text-primary" />
                    </div>
                    <div>
                        <h1 className="text-4xl font-black text-white tracking-tighter">AGENT MARKETPLACE</h1>
                        <p className="text-muted-foreground font-mono">Real AI agents. Real execution. Real payments with x402 protocol.</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-12">
                    {/* Agents List */}
                    <div className="lg:col-span-2 space-y-3">
                        <h2 className="text-lg font-bold text-white mb-4">Available Agents ({agents.length})</h2>
                        <div className="space-y-2 max-h-[600px] overflow-y-auto">
                            {agents.map((a) => (
                                <button
                                    key={a.id}
                                    onClick={() => setSelectedAgent(a.id)}
                                    className={`w-full text-left p-3 rounded-lg transition-all border ${
                                        selectedAgent === a.id
                                            ? 'bg-primary/20 border-primary/50'
                                            : 'bg-black/20 border-white/10 hover:border-white/20'
                                    }`}
                                >
                                    <div className="flex items-start gap-3">
                                        {AGENT_ICONS[a.id] || <Sparkles className="w-5 h-5 mt-0.5" />}
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2">
                                                <h3 className="font-bold text-white">{a.name}</h3>
                                                {a.isVerified && (
                                                    <CheckCircle className="w-3 h-3 text-green-400" />
                                                )}
                                                {a.canInvokeOtherAgents && (
                                                    <GitBranch className="w-3 h-3 text-cyan-400" />
                                                )}
                                            </div>
                                            <p className="text-xs text-muted-foreground truncate">{a.description}</p>
                                            <div className="flex gap-1 mt-1 flex-wrap">
                                                {Object.keys(a.capabilities).slice(0, 2).map(cap => (
                                                    <span key={cap} className="text-xs bg-white/5 px-1.5 py-0.5 rounded text-muted-foreground">
                                                        {cap}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Agent Details */}
                    {agent && (
                        <Card className="lg:sticky lg:top-32 h-fit bg-black/40 border-white/10 backdrop-blur-md">
                            <CardHeader>
                                <div className="flex items-start justify-between gap-2">
                                    <div className="flex items-center gap-2">
                                        {AGENT_ICONS[agent.id] || <Sparkles className="w-5 h-5" />}
                                        <CardTitle>{agent.name}</CardTitle>
                                    </div>
                                    {agent.isVerified && (
                                        <CheckCircle className="w-4 h-4 text-green-400" />
                                    )}
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {/* Description */}
                                <div>
                                    <p className="text-sm text-muted-foreground">{agent.description}</p>
                                </div>

                                {/* Stats */}
                                <div className="grid grid-cols-2 gap-2 text-xs">
                                    <div>
                                        <p className="text-muted-foreground">Rating</p>
                                        <p className="flex items-center gap-1 font-bold">
                                            <Star className="w-3 h-3" />
                                            {agent.averageRating.toFixed(1)}/5
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-muted-foreground">Success Rate</p>
                                        <p className="font-bold text-green-400">{agent.successRate}%</p>
                                    </div>
                                    <div>
                                        <p className="text-muted-foreground">Executions</p>
                                        <p className="font-bold">{(agent.totalExecutions / 1000).toFixed(1)}k</p>
                                    </div>
                                    <div>
                                        <p className="text-muted-foreground">Avg Time</p>
                                        <p className="font-bold">{(agent.averageExecutionTimeMs / 1000).toFixed(1)}s</p>
                                    </div>
                                </div>

                                {/* Capabilities */}
                                <div>
                                    <p className="text-xs text-muted-foreground font-bold mb-2">Capabilities</p>
                                    <div className="space-y-2">
                                        {Object.entries(agent.capabilities).map(([key, cap]) => (
                                            <div key={key} className="text-xs p-2 bg-white/5 rounded border border-white/10">
                                                <div className="flex justify-between items-start mb-1">
                                                    <span className="font-medium">{cap.name}</span>
                                                    <span className="text-cyan-400">
                                                        {(BigInt(cap.costInOctas) / 1000000n).toString()} APT
                                                    </span>
                                                </div>
                                                <p className="text-muted-foreground">{cap.description}</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Dependencies */}
                                {agent.dependsOnAgents && agent.dependsOnAgents.length > 0 && (
                                    <div>
                                        <p className="text-xs text-muted-foreground font-bold mb-2">
                                            <GitBranch className="w-3 h-3 inline mr-1" />
                                            Uses Agents
                                        </p>
                                        <div className="space-y-1">
                                            {agent.dependsOnAgents.map(depId => {
                                                const dep = AGENT_REGISTRY[depId];
                                                return dep ? (
                                                    <p key={depId} className="text-xs text-muted-foreground">
                                                        • {dep.name}
                                                    </p>
                                                ) : null;
                                            })}
                                        </div>
                                    </div>
                                )}

                                <Link href={`/agent/${agent.id}`} className="w-full">
                                    <Button className="w-full bg-primary hover:bg-primary/90 gap-2">
                                        Use Agent
                                        <ArrowRight className="w-4 h-4" />
                                    </Button>
                                </Link>
                            </CardContent>
                        </Card>
                    )}
                </div>

                {/* Features */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 pt-12 border-t border-white/10">
                    <Card className="bg-black/40 border-white/10 backdrop-blur-md">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm">Real AI Models</CardTitle>
                        </CardHeader>
                        <CardContent className="text-xs text-muted-foreground">
                            GPT-4, DALL-E 3, and real APIs - not mock data
                        </CardContent>
                    </Card>

                    <Card className="bg-black/40 border-white/10 backdrop-blur-md">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm">Agent Composition</CardTitle>
                        </CardHeader>
                        <CardContent className="text-xs text-muted-foreground">
                            Agents can invoke other agents with automatic payment routing
                        </CardContent>
                    </Card>

                    <Card className="bg-black/40 border-white/10 backdrop-blur-md">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm">Budget Control</CardTitle>
                        </CardHeader>
                        <CardContent className="text-xs text-muted-foreground">
                            Set transaction limits, daily/monthly budgets and approval thresholds
                        </CardContent>
                    </Card>

                    <Card className="bg-black/40 border-white/10 backdrop-blur-md">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm">x402 Payments</CardTitle>
                        </CardHeader>
                        <CardContent className="text-xs text-muted-foreground">
                            Verified on-chain payments with automatic deduction
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
