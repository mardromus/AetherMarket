"use client";
import React from 'react';
import { Navbar } from '@/components/Navbar';
import { NetworkBackground } from '@/components/NetworkBackground';
import { Card, CardContent, CardHeader, CardDescription, CardTitle } from '@/components/ui/card';
import { useAgentStore } from '@/store/agentStore';
import { AgentCard } from '@/components/AgentCard';
import { Wallet, Activity, TrendingUp, Box } from 'lucide-react';

export default function DashboardPage() {
    const { agents } = useAgentStore();

    // Filter agents created by "user" (mocked: simplified assumed create -> owned)
    // In a real app, check wallet address ownership.
    // For this demo, we'll show recently "Minted" agents (those with isSwarm + custom specs).
    const userAgents = agents.filter(a => a.specs?.architecture?.includes("Custom") || a.specs?.vram?.includes("On-Chain"));

    const totalEarnings = userAgents.length * 40.25; // Mock calculation

    return (
        <div className="min-h-screen relative text-foreground">
            <NetworkBackground />
            <Navbar />

            <div className="pt-32 px-6 max-w-7xl mx-auto pb-20 relative z-10">
                <div className="flex items-center gap-4 mb-8">
                    <div className="p-3 bg-primary/10 rounded-xl border border-primary/20">
                        <Wallet className="w-8 h-8 text-primary" />
                    </div>
                    <div>
                        <h1 className="text-4xl font-black text-white tracking-tighter">COMMAND CENTER DASHBOARD</h1>
                        <p className="text-muted-foreground font-mono">WALLET: 0x71...3A9F | NETWORK: APTOS MAINNET</p>
                    </div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                    <Card className="bg-black/40 border-white/10 backdrop-blur-md">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                                <Box className="w-4 h-4" /> TOTAL MINTED ASSETS
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-4xl font-bold text-white">{userAgents.length}</div>
                            <p className="text-xs text-green-400 mt-1">+2 from last epoch</p>
                        </CardContent>
                    </Card>

                    <Card className="bg-black/40 border-white/10 backdrop-blur-md">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                                <TrendingUp className="w-4 h-4" /> LIFETIME EARNINGS
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-4xl font-bold text-cyan-400">{totalEarnings.toFixed(2)} APT</div>
                            <p className="text-xs text-muted-foreground mt-1">streaming ~0.004 APT/sec</p>
                        </CardContent>
                    </Card>

                    <Card className="bg-black/40 border-white/10 backdrop-blur-md">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                                <Activity className="w-4 h-4" /> SWARM UTILIZATION
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-4xl font-bold text-pink-500">92.4%</div>
                            <p className="text-xs text-muted-foreground mt-1">High demand for Logic Engines</p>
                        </CardContent>
                    </Card>
                </div>

                {/* Asset List */}
                <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
                    <Box className="w-6 h-6 text-primary" /> DEPLOYED NODES
                </h2>

                {userAgents.length === 0 ? (
                    <div className="p-12 border border-dashed border-white/20 rounded-xl text-center bg-black/20">
                        <p className="text-muted-foreground mb-4">No Compute Assets Deployed.</p>
                        <button className="text-primary underline font-bold" onClick={() => window.location.href = '/register'}>Mint your first Agent</button>
                    </div>
                ) : (
                    <div className="space-y-12">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                            {userAgents.map((agent) => (
                                <AgentCard key={agent.id} agent={agent} />
                            ))}
                        </div>

                        {/* Recent Activity Log */}
                        <div>
                            <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                                <Activity className="w-5 h-5 text-green-400" /> LIVE NETWORK TELEMETRY
                            </h2>
                            <div className="glass-card rounded-xl border border-white/10 overflow-hidden">
                                <div className="grid grid-cols-4 bg-white/5 p-4 text-xs font-mono text-muted-foreground border-b border-white/10">
                                    <div>TIMESTAMP</div>
                                    <div>EVENT TYPE</div>
                                    <div>AGENT ID</div>
                                    <div className="text-right">GAS USED</div>
                                </div>
                                {[1, 2, 3, 4].map((_, i) => (
                                    <div key={i} className="grid grid-cols-4 p-4 text-sm font-mono border-b border-white/5 hover:bg-white/5 transition-colors">
                                        <div className="text-muted-foreground">{new Date(Date.now() - i * 1000000).toLocaleTimeString()}</div>
                                        <div className={i % 2 === 0 ? "text-green-400" : "text-blue-400"}>
                                            {i % 2 === 0 ? "PROOF_VERIFIED" : "COMPUTE_ALLOCATED"}
                                        </div>
                                        <div className="text-white/70">0x{(Math.random() * 10000).toFixed(0)}...</div>
                                        <div className="text-right text-muted-foreground">0.00{Math.floor(Math.random() * 9)} APT</div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
