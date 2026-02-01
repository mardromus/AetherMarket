"use client";
import React, { useEffect, useState } from 'react';
import { Navbar } from '@/components/Navbar';
import { NetworkBackground } from '@/components/NetworkBackground';
import { Card, CardContent, CardHeader, CardDescription, CardTitle } from '@/components/ui/card';
import { useAgentStore } from '@/store/agentStore';
import { AgentCard } from '@/components/AgentCard';
import { Wallet, Activity, TrendingUp, Box, ExternalLink, CheckCircle, XCircle } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { getTransactionHistory, getTransactionStats, TransactionRecord } from '@/lib/x402/history';
import Link from 'next/link';

export default function DashboardPage() {
    const { agents } = useAgentStore();
    const [telemetry, setTelemetry] = useState<any[]>([]);
    const [transactions, setTransactions] = useState<TransactionRecord[]>([]);
    const [stats, setStats] = useState({ totalSpent: 0, successfulTransactions: 0 });

    // Filter agents created by "user". For demo, we include custom ones (UUIDs) OR specific default ones.
    // Also include agents that have 0 or high reputation to show some variety if user hasn't made any.
    const userAgents = agents.filter(a =>
        a.id.length > 30 || // UUID check for custom agents
        ['neural-alpha', 'atlas-ai'].includes(a.id)
    );

    useEffect(() => {
        // Load Real Transaction History
        const history = getTransactionHistory();
        const historyStats = getTransactionStats();
        setTransactions(history);
        setStats({
            totalSpent: historyStats.totalSpent,
            successfulTransactions: historyStats.successfulTransactions
        });

        // Generate semi-real telemetry data mixed with random events
        const realAgentIds = agents.slice(0, 5).map(a => a.id);
        const newTelemetry = Array(8).fill(0).map((_, i) => ({
            timestamp: new Date(Date.now() - i * (Math.random() * 5000)).toLocaleTimeString(),
            type: Math.random() > 0.5 ? "PROOF_VERIFIED" : "COMPUTE_ALLOCATED",
            agentId: realAgentIds[i % realAgentIds.length] || `0x${(Math.random() * 10000).toFixed(0)}...`,
            gas: `0.00${Math.floor(Math.random() * 9)} APT`,
            color: Math.random() > 0.5 ? "text-green-400" : "text-blue-400"
        }));
        setTelemetry(newTelemetry);

        // Simulate live telemetry updates
        const interval = setInterval(() => {
            setTelemetry(prev => {
                const newEvent = {
                    timestamp: new Date().toLocaleTimeString(),
                    type: Math.random() > 0.7 ? "PAYMENT_SETTLED" : "PROOF_VERIFIED",
                    agentId: realAgentIds[Math.floor(Math.random() * realAgentIds.length)],
                    gas: `0.00${Math.floor(Math.random() * 5 + 1)} APT`,
                    color: "text-purple-400"
                };
                return [newEvent, ...prev.slice(0, 7)];
            });
        }, 3000);

        return () => clearInterval(interval);
    }, [agents]);

    // Simulated earnings based on owned agents (User is "provider" here)
    // 1 agent earns approx 0.05 APT/day -> Lifetime ~ Agent Count * 45 (mock)
    const totalEarnings = userAgents.length * 45.2;

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
                        <h1 className="text-4xl font-black text-white tracking-tighter">COMMAND CENTER</h1>
                        <p className="text-muted-foreground font-mono">WALLET: 0x71...3A9F | NETWORK: APTOS MAINNET</p>
                    </div>
                </div>

                <Tabs defaultValue="overview" className="w-full">
                    <TabsList className="bg-black/40 border border-white/10 p-1 mb-8">
                        <TabsTrigger value="overview" className="data-[state=active]:bg-primary data-[state=active]:text-black">Overview</TabsTrigger>
                        <TabsTrigger value="agents" className="data-[state=active]:bg-primary data-[state=active]:text-black">My Agents</TabsTrigger>
                        <TabsTrigger value="transactions" className="data-[state=active]:bg-primary data-[state=active]:text-black">Transactions</TabsTrigger>
                        <TabsTrigger value="analytics" className="data-[state=active]:bg-primary data-[state=active]:text-black">Analytics</TabsTrigger>
                    </TabsList>

                    <TabsContent value="overview">
                        {/* Stats Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
                            <Card className="bg-black/40 border-white/10 backdrop-blur-md">
                                <CardHeader className="pb-2">
                                    <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                                        <Box className="w-4 h-4" /> TOTAL AGENTS
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="text-4xl font-bold text-white">{userAgents.length}</div>
                                    <p className="text-xs text-green-400 mt-1">Active on Neural Grid</p>
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
                                    <p className="text-xs text-muted-foreground mt-1">streaming ~{(userAgents.length * 0.002).toFixed(4)} APT/sec</p>
                                </CardContent>
                            </Card>

                            <Card className="bg-black/40 border-white/10 backdrop-blur-md">
                                <CardHeader className="pb-2">
                                    <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                                        <Wallet className="w-4 h-4" /> TOTAL SPENT
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="text-4xl font-bold text-red-400">{stats.totalSpent.toFixed(4)} APT</div>
                                    <p className="text-xs text-muted-foreground mt-1">{stats.successfulTransactions} paid requests</p>
                                </CardContent>
                            </Card>

                            <Card className="bg-black/40 border-white/10 backdrop-blur-md">
                                <CardHeader className="pb-2">
                                    <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                                        <Activity className="w-4 h-4" /> REPUTATION
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="text-4xl font-bold text-pink-500">924</div>
                                    <p className="text-xs text-muted-foreground mt-1">Top 5% Validator Score</p>
                                </CardContent>
                            </Card>
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
                                {telemetry.length === 0 ? (
                                    <div className="p-4 text-center text-muted-foreground">Initializing Telemetry...</div>
                                ) : (
                                    telemetry.map((t, i) => (
                                        <div key={i} className="grid grid-cols-4 p-4 text-sm font-mono border-b border-white/5 hover:bg-white/5 transition-colors animate-in fade-in duration-300">
                                            <div className="text-muted-foreground">{t.timestamp}</div>
                                            <div className={t.color}>
                                                {t.type}
                                            </div>
                                            <div className="text-white/70 truncate">{t.agentId}</div>
                                            <div className="text-right text-muted-foreground">{t.gas}</div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    </TabsContent>

                    <TabsContent value="agents">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                                <Box className="w-6 h-6 text-primary" /> MY AGENTS
                            </h2>
                            <Link href="/register">
                                <Button variant="outline" className="border-primary text-primary hover:bg-primary hover:text-black">
                                    + Register New Agent
                                </Button>
                            </Link>
                        </div>

                        {userAgents.length === 0 ? (
                            <div className="p-12 border border-dashed border-white/20 rounded-xl text-center bg-black/20">
                                <p className="text-muted-foreground mb-4">No Compute Assets Deployed.</p>
                                <Link href="/register">
                                    <Button>Mint your first Agent</Button>
                                </Link>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {userAgents.map((agent) => (
                                    <div key={agent.id} className="relative group">
                                        <AgentCard agent={agent} />
                                        <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <Link href={`/agent/${agent.id}`}>
                                                <Button size="sm" variant="secondary" className="h-8">Details</Button>
                                            </Link>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </TabsContent>

                    <TabsContent value="transactions">
                        <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
                            <Wallet className="w-6 h-6 text-primary" /> TRANSACTION HISTORY
                        </h2>
                        <div className="glass-card rounded-xl border border-white/10 overflow-hidden">
                            <div className="grid grid-cols-[1fr_2fr_1fr_1fr_1fr] bg-white/5 p-4 text-xs font-mono text-muted-foreground border-b border-white/10">
                                <div>TIMESTAMP</div>
                                <div>HASH / PROOF</div>
                                <div>AGENT</div>
                                <div>STATUS</div>
                                <div className="text-right">COST (APT)</div>
                            </div>
                            {transactions.length === 0 ? (
                                <div className="p-12 text-center text-muted-foreground border-b border-white/5">
                                    No transactions found. Execute an agent task to generate history.
                                </div>
                            ) : (
                                transactions.map((tx, i) => (
                                    <div key={tx.id || i} className="grid grid-cols-[1fr_2fr_1fr_1fr_1fr] p-4 text-sm font-mono border-b border-white/5 hover:bg-white/5 transition-colors items-center">
                                        <div className="text-muted-foreground text-xs">
                                            {new Date(tx.timestamp).toLocaleString()}
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <div className="text-blue-400 hover:text-blue-300 cursor-pointer truncate max-w-[200px]" title={tx.txnHash}>
                                                {tx.txnHash}
                                            </div>
                                            <a href={`https://explorer.aptoslabs.com/txn/${tx.txnHash}`} target="_blank" rel="noreferrer" className="text-white/20 hover:text-white">
                                                <ExternalLink className="w-3 h-3" />
                                            </a>
                                        </div>
                                        <div className="text-white/80 truncate pr-2">
                                            {tx.agentName}
                                        </div>
                                        <div>
                                            {tx.status === 'success' ? (
                                                <span className="text-green-400 flex items-center gap-1 text-xs px-2 py-0.5 bg-green-500/10 rounded-full w-fit">
                                                    <CheckCircle className="w-3 h-3" /> CONFIRMED
                                                </span>
                                            ) : (
                                                <span className="text-red-400 flex items-center gap-1 text-xs px-2 py-0.5 bg-red-500/10 rounded-full w-fit">
                                                    <XCircle className="w-3 h-3" /> FAILED
                                                </span>
                                            )}
                                        </div>
                                        <div className="text-right text-white font-bold">
                                            {tx.costAPT}
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </TabsContent>

                    <TabsContent value="analytics">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <Card className="bg-black/40 border-white/10 backdrop-blur-md">
                                <CardHeader>
                                    <CardTitle>Usage Metrics</CardTitle>
                                    <CardDescription>Request volume over last 30 days</CardDescription>
                                </CardHeader>
                                <CardContent className="h-[300px] flex items-center justify-center border border-dashed border-white/10 rounded-lg m-4">
                                    <p className="text-muted-foreground">Chart Visualization Placeholder</p>
                                </CardContent>
                            </Card>
                            <Card className="bg-black/40 border-white/10 backdrop-blur-md">
                                <CardHeader>
                                    <CardTitle>Cost Analysis</CardTitle>
                                    <CardDescription>Spending distribution by agent</CardDescription>
                                </CardHeader>
                                <CardContent className="h-[300px] flex items-center justify-center border border-dashed border-white/10 rounded-lg m-4">
                                    <p className="text-muted-foreground">Chart Visualization Placeholder</p>
                                </CardContent>
                            </Card>
                        </div>
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    );
}
