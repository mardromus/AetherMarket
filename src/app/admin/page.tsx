"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { Navbar } from '@/components/Navbar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { NetworkBackground } from '@/components/NetworkBackground';
import {
    Plus,
    Trash2,
    Zap,
    Settings,
    CheckCircle,
    Wallet,
    Code2,
    Search,
    TrendingUp,
    DollarSign,
    Copy,
    Check,
    Info,
    BookOpen,
} from 'lucide-react';
import { AetherSDK } from '@/lib/sdk/aether';
import { toast } from 'sonner';
import { useAgentStore } from '@/store/agentStore';
import { AGENT_METADATA } from '@/lib/agents/schemas';

interface BudgetSession {
    id: string;
    agentId: string;
    agentName: string;
    budgetAPT: number;
    spentAPT: number;
    remainingAPT: number;
    createdAt: number;
    expiresAt: number;
    status: 'active' | 'expired' | 'depleted';
}

interface Agent {
    id: string;
    name: string;
    description: string;
    price: number;
    category?: string;
    reputation?: number;
}

interface DiscoveredAgent {
    id: string;
    name: string;
    type: string;
    capabilities: string[];
    costAPT: number;
}

export default function AdminDashboard() {
    const { agents: storeAgents } = useAgentStore();
    const [activeTab, setActiveTab] = useState<'discovery' | 'agents' | 'budgets' | 'schemas'>('discovery');
    const [copiedCode, setCopiedCode] = useState<string | null>(null);
    const [selectedAgentForSchema, setSelectedAgentForSchema] = useState<string>('neural-alpha');
    
    // Discovery
    const [discoverSkill, setDiscoverSkill] = useState('');
    const [discoveredAgents, setDiscoveredAgents] = useState<DiscoveredAgent[]>([]);
    const [isSearching, setIsSearching] = useState(false);

    // Budget Management
    const [budgets, setBudgets] = useState<BudgetSession[]>([]);
    const [showNewBudget, setShowNewBudget] = useState(false);
    const [selectedAgentId, setSelectedAgentId] = useState('');
    const [budgetAmount, setBudgetAmount] = useState('');
    const [budgetDays, setBudgetDays] = useState('7');

    const aether = new AetherSDK('testnet');

    const copyToClipboard = (code: string, id: string) => {
        navigator.clipboard.writeText(code);
        setCopiedCode(id);
        toast.success('Copied!');
        setTimeout(() => setCopiedCode(null), 2000);
    };

    // ============================================
    // DISCOVERY
    // ============================================

    const handleDiscoverAgents = async () => {
        if (!discoverSkill.trim()) {
            toast.error('Please enter a skill');
            return;
        }

        try {
            setIsSearching(true);
            const result = await aether.browse(discoverSkill);
            setDiscoveredAgents(result as DiscoveredAgent[]);
            
            if (result.length === 0) {
                toast.info('No agents found matching that skill');
            } else {
                toast.success(`✅ Found ${result.length} agents`);
            }
        } catch (error) {
            toast.error('Failed to discover agents');
            console.error(error);
        } finally {
            setIsSearching(false);
        }
    };

    // ============================================
    // BUDGET MANAGEMENT
    // ============================================

    const handleCreateBudget = async () => {
        if (!selectedAgentId || !budgetAmount) {
            toast.error('Please select agent and enter amount');
            return;
        }

        try {
            const amount = parseFloat(budgetAmount);
            if (amount <= 0) {
                toast.error('Amount must be greater than 0');
                return;
            }

            const agent = storeAgents.find((a) => a.id === selectedAgentId) as Agent | undefined;
            if (!agent) {
                toast.error('Agent not found');
                return;
            }

            const newBudget: BudgetSession = {
                id: `budget-${Date.now()}`,
                agentId: selectedAgentId,
                agentName: agent.name,
                budgetAPT: amount,
                spentAPT: 0,
                remainingAPT: amount,
                createdAt: Date.now(),
                expiresAt: Date.now() + (parseInt(budgetDays) * 24 * 60 * 60 * 1000),
                status: 'active'
            };

            setBudgets([...budgets, newBudget]);
            toast.success(`✅ Budget created for ${agent.name}: ${amount} APT`);
            
            setSelectedAgentId('');
            setBudgetAmount('');
            setBudgetDays('7');
            setShowNewBudget(false);
        } catch (error) {
            toast.error('Failed to create budget');
            console.error(error);
        }
    };

    const handleDeleteBudget = (budgetId: string) => {
        if (!window.confirm('Delete this budget?')) return;
        setBudgets(budgets.filter(b => b.id !== budgetId));
        toast.success('Budget deleted');
    };

    const handleSpendFromBudget = async (budgetId: string) => {
        const budget = budgets.find(b => b.id === budgetId);
        if (!budget) return;

        const agent = storeAgents.find((a) => a.id === budget.agentId) as Agent | undefined;
        if (!agent) return;

        const costAPT = agent.price;
        if (budget.remainingAPT < costAPT) {
            toast.error(`Insufficient budget. Need ${costAPT} APT, have ${budget.remainingAPT.toFixed(4)} APT`);
            return;
        }

        const updatedBudgets = budgets.map(b => {
            if (b.id === budgetId) {
                const newRemaining = b.remainingAPT - costAPT;
                const newStatus: 'active' | 'expired' | 'depleted' = newRemaining <= 0 ? 'depleted' : 'active';
                return {
                    ...b,
                    spentAPT: b.spentAPT + costAPT,
                    remainingAPT: newRemaining,
                    status: newStatus
                };
            }
            return b;
        });

        setBudgets(updatedBudgets);
        toast.success(`✅ Spent ${costAPT} APT from budget`);
    };

    const getStatusColor = (status: string, remaining: number) => {
        if (status === 'expired') return 'bg-red-500/20 text-red-400 border-red-500/30';
        if (status === 'depleted') return 'bg-orange-500/20 text-orange-400 border-orange-500/30';
        if (remaining < 0.05) return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
        return 'bg-green-500/20 text-green-400 border-green-500/30';
    };

    return (
        <div className="min-h-screen relative text-foreground">
            <NetworkBackground />
            <Navbar />

            <div className="pt-32 px-6 max-w-7xl mx-auto pb-20 relative z-10">
                {/* Header */}
                <div className="mb-8">
                    <div className="flex items-center gap-4 mb-2">
                        <div className="p-3 bg-primary/10 rounded-xl border border-primary/20">
                            <Settings className="w-8 h-8 text-primary" />
                        </div>
                        <div>
                            <h1 className="text-4xl font-black tracking-tighter">ADMIN DASHBOARD</h1>
                            <p className="text-muted-foreground font-mono">Manage budgets, discover agents, and control spending</p>
                        </div>
                    </div>
                </div>

                {/* Tabs */}
                <div className="flex gap-2 border-b border-white/10 mb-6">
                    <button
                        onClick={() => setActiveTab('discovery')}
                        className={`px-4 py-2 font-semibold transition-colors ${
                            activeTab === 'discovery'
                                ? 'text-primary border-b-2 border-primary'
                                : 'text-muted-foreground hover:text-foreground'
                        }`}
                    >
                        <Search className="w-4 h-4 inline mr-2" />
                        Discover
                    </button>
                    <button
                        onClick={() => setActiveTab('agents')}
                        className={`px-4 py-2 font-semibold transition-colors ${
                            activeTab === 'agents'
                                ? 'text-primary border-b-2 border-primary'
                                : 'text-muted-foreground hover:text-foreground'
                        }`}
                    >
                        <Code2 className="w-4 h-4 inline mr-2" />
                        All Agents ({storeAgents.length})
                    </button>
                    <button
                        onClick={() => setActiveTab('budgets')}
                        className={`px-4 py-2 font-semibold transition-colors ${
                            activeTab === 'budgets'
                                ? 'text-primary border-b-2 border-primary'
                                : 'text-muted-foreground hover:text-foreground'
                        }`}
                    >
                        <Wallet className="w-4 h-4 inline mr-2" />
                        Budgets ({budgets.length})
                    </button>
                    <button
                        onClick={() => setActiveTab('schemas')}
                        className={`px-4 py-2 font-semibold transition-colors ${
                            activeTab === 'schemas'
                                ? 'text-primary border-b-2 border-primary'
                                : 'text-muted-foreground hover:text-foreground'
                        }`}
                    >
                        <BookOpen className="w-4 h-4 inline mr-2" />
                        Schemas & API
                    </button>
                </div>

                {/* DISCOVERY TAB */}
                {activeTab === 'discovery' && (
                    <div className="space-y-4">
                        <h2 className="text-xl font-bold">🔍 Discover Agents by Skill</h2>

                        <Card className="bg-purple-500/5 border-purple-500/20 backdrop-blur-md">
                            <CardContent className="pt-6">
                                <div className="flex gap-2">
                                    <Input
                                        placeholder="Search: text-generation, code-audit, web-search, image-generation..."
                                        value={discoverSkill}
                                        onChange={(e) => setDiscoverSkill(e.target.value)}
                                        onKeyPress={(e) => {
                                            if (e.key === 'Enter') handleDiscoverAgents();
                                        }}
                                        className="flex-1"
                                    />
                                    <Button
                                        onClick={handleDiscoverAgents}
                                        disabled={isSearching}
                                        className="bg-purple-600 hover:bg-purple-700"
                                    >
                                        {isSearching ? 'Searching...' : <Search className="w-4 h-4" />}
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>

                        {discoveredAgents.length === 0 ? (
                            <Card className="bg-black/40 border-white/10">
                                <CardContent className="pt-6 text-center text-muted-foreground">
                                    <p>Search to discover agents matching your skill</p>
                                </CardContent>
                            </Card>
                        ) : (
                            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                                {discoveredAgents.map((agent) => (
                                    <Card key={agent.id} className="bg-black/40 border-white/10 backdrop-blur-md hover:border-white/20 transition-colors">
                                        <CardContent className="pt-6">
                                            <div className="flex justify-between items-start mb-2">
                                                <h3 className="font-bold text-lg flex-1">{agent.name}</h3>
                                                <Badge className="bg-primary/20 text-primary border-primary/30">{agent.type}</Badge>
                                            </div>
                                            <div className="flex gap-1 flex-wrap mb-3">
                                                {agent.capabilities.map((cap: string) => (
                                                    <Badge key={cap} variant="outline" className="text-xs">
                                                        {cap}
                                                    </Badge>
                                                ))}
                                            </div>
                                            <div className="flex justify-between items-center pt-3 border-t border-white/10">
                                                <span className="font-mono font-bold text-primary">{agent.costAPT} APT</span>
                                                <span className="text-xs text-muted-foreground">Ready to use</span>
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {/* AGENTS TAB */}
                {activeTab === 'agents' && (
                    <div className="space-y-4">
                        <h2 className="text-xl font-bold">📊 All Available Agents</h2>

                        {storeAgents.length === 0 ? (
                            <Card className="bg-black/40 border-white/10">
                                <CardContent className="pt-6 text-center text-muted-foreground">
                                    <p>No agents available</p>
                                </CardContent>
                            </Card>
                        ) : (
                            <div className="space-y-3">
                                {storeAgents.map((agent) => (
                                    <Card key={agent.id} className="bg-black/40 border-white/10 backdrop-blur-md">
                                        <CardContent className="pt-6">
                                            <div className="flex justify-between items-start gap-4">
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-3 mb-2">
                                                        <h3 className="font-bold text-lg">{agent.name}</h3>
                                                        <Badge variant="secondary" className="bg-primary/20 text-primary">
                                                            {agent.category || 'General'}
                                                        </Badge>
                                                    </div>
                                                    <p className="text-sm text-muted-foreground mb-2">
                                                        {agent.description.slice(0, 80)}...
                                                    </p>
                                                    <div className="flex gap-3 text-xs">
                                                        <span className="flex items-center gap-1">
                                                            <DollarSign className="w-3 h-3 text-green-400" />
                                                            <span className="font-mono">{agent.price} APT</span>
                                                        </span>
                                                        <span className="flex items-center gap-1">
                                                            <TrendingUp className="w-3 h-3 text-blue-400" />
                                                            <span>Rep: {agent.reputation}/100</span>
                                                        </span>
                                                    </div>
                                                </div>
                                                <Button
                                                    size="sm"
                                                    className="whitespace-nowrap"
                                                    onClick={() => {
                                                        setSelectedAgentId(agent.id);
                                                        setShowNewBudget(true);
                                                        setActiveTab('budgets');
                                                    }}
                                                >
                                                    <Plus className="w-3 h-3 mr-1" />
                                                    Add Budget
                                                </Button>
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {/* BUDGETS TAB */}
                {activeTab === 'budgets' && (
                    <div className="space-y-4">
                        <div className="flex justify-between items-center">
                            <h2 className="text-xl font-bold">💰 Budget Sessions</h2>
                            <Button
                                onClick={() => setShowNewBudget(!showNewBudget)}
                                className="gap-2 bg-primary hover:bg-primary/90"
                            >
                                <Plus className="w-4 h-4" />
                                New Budget
                            </Button>
                        </div>

                        {/* Create Budget Form */}
                        {showNewBudget && (
                            <Card className="bg-green-500/5 border-green-500/20 backdrop-blur-md">
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <CheckCircle className="w-5 h-5 text-green-500" />
                                        Create New Budget
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        <div>
                                            <label className="text-sm text-muted-foreground mb-2 block">Select Agent</label>
                                            <select
                                                value={selectedAgentId}
                                                onChange={(e) => setSelectedAgentId(e.target.value)}
                                                className="w-full bg-black/50 border border-white/10 rounded px-3 py-2 text-white"
                                            >
                                                <option value="">Choose an agent...</option>
                                                {storeAgents.map((agent) => (
                                                    <option key={agent.id} value={agent.id}>
                                                        {agent.name} ({agent.price} APT)
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                        <div>
                                            <label className="text-sm text-muted-foreground mb-2 block">Budget Amount (APT)</label>
                                            <Input
                                                type="number"
                                                placeholder="e.g., 10"
                                                value={budgetAmount}
                                                onChange={(e) => setBudgetAmount(e.target.value)}
                                                min="0.01"
                                                step="0.01"
                                                className="bg-black/50 border-white/10"
                                            />
                                        </div>
                                        <div>
                                            <label className="text-sm text-muted-foreground mb-2 block">Duration (Days)</label>
                                            <Input
                                                type="number"
                                                placeholder="7"
                                                value={budgetDays}
                                                onChange={(e) => setBudgetDays(e.target.value)}
                                                min="1"
                                                max="365"
                                                className="bg-black/50 border-white/10"
                                            />
                                        </div>
                                    </div>
                                    <div className="flex gap-2">
                                        <Button
                                            onClick={handleCreateBudget}
                                            className="flex-1 bg-green-600 hover:bg-green-700"
                                        >
                                            ✅ Create Budget
                                        </Button>
                                        <Button
                                            onClick={() => setShowNewBudget(false)}
                                            variant="outline"
                                            className="flex-1"
                                        >
                                            Cancel
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        )}

                        {/* Budgets List */}
                        {budgets.length === 0 ? (
                            <Card className="bg-black/40 border-white/10">
                                <CardContent className="pt-6 text-center text-muted-foreground">
                                    <p>No budgets created yet</p>
                                    <p className="text-sm mt-2">Create your first budget to manage agent spending</p>
                                </CardContent>
                            </Card>
                        ) : (
                            <div className="space-y-3">
                                {budgets.map((budget) => {
                                    const agent = storeAgents.find((a) => a.id === budget.agentId) as Agent | undefined;
                                    const isExpired = Date.now() > budget.expiresAt;
                                    const displayStatus = isExpired ? 'expired' : budget.status;
                                    const percentSpent = (budget.spentAPT / budget.budgetAPT) * 100;

                                    return (
                                        <Card key={budget.id} className={`backdrop-blur-md ${
                                            displayStatus === 'expired'
                                                ? 'bg-red-500/5 border-red-500/20'
                                                : 'bg-black/40 border-white/10'
                                        }`}>
                                            <CardContent className="pt-6">
                                                <div className="space-y-4">
                                                    <div className="flex justify-between items-start">
                                                        <div className="flex-1">
                                                            <h4 className="font-bold text-lg mb-1">{budget.agentName}</h4>
                                                            <p className="text-xs text-muted-foreground font-mono">{budget.id}</p>
                                                        </div>
                                                        <Badge className={`${getStatusColor(displayStatus, budget.remainingAPT)} border`}>
                                                            {displayStatus.toUpperCase()}
                                                        </Badge>
                                                    </div>

                                                    {/* Budget Progress Bar */}
                                                    <div className="space-y-2">
                                                        <div className="flex justify-between text-sm">
                                                            <span className="text-muted-foreground">Spent / Total</span>
                                                            <span className="font-mono">{budget.spentAPT.toFixed(2)} / {budget.budgetAPT.toFixed(2)} APT</span>
                                                        </div>
                                                        <div className="w-full bg-black/50 rounded-full h-2 overflow-hidden border border-white/10">
                                                            <div
                                                                className={`h-full transition-all ${
                                                                    percentSpent > 80 ? 'bg-red-500' :
                                                                    percentSpent > 50 ? 'bg-yellow-500' :
                                                                    'bg-green-500'
                                                                }`}
                                                                style={{ width: `${Math.min(percentSpent, 100)}%` }}
                                                            />
                                                        </div>
                                                    </div>

                                                    {/* Budget Info Grid */}
                                                    <div className="grid grid-cols-3 gap-4 text-sm">
                                                        <div>
                                                            <p className="text-muted-foreground mb-1">Remaining</p>
                                                            <p className="font-bold text-green-400">{budget.remainingAPT.toFixed(4)} APT</p>
                                                        </div>
                                                        <div>
                                                            <p className="text-muted-foreground mb-1">Expires</p>
                                                            <p className="font-mono text-xs">
                                                                {new Date(budget.expiresAt).toLocaleDateString()}
                                                            </p>
                                                        </div>
                                                        <div>
                                                            <p className="text-muted-foreground mb-1">Calls Possible</p>
                                                            <p className="font-bold">
                                                                {Math.floor(budget.remainingAPT / (agent?.price || 0.01))}
                                                            </p>
                                                        </div>
                                                    </div>

                                                    {/* Actions */}
                                                    <div className="flex gap-2">
                                                        <Button
                                                            onClick={() => handleSpendFromBudget(budget.id)}
                                                            disabled={displayStatus === 'expired' || budget.remainingAPT <= 0}
                                                            className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
                                                            size="sm"
                                                        >
                                                            <Zap className="w-3 h-3 mr-1" />
                                                            Test Call ({agent?.price} APT)
                                                        </Button>
                                                        <Button
                                                            onClick={() => handleDeleteBudget(budget.id)}
                                                            variant="destructive"
                                                            size="sm"
                                                        >
                                                            <Trash2 className="w-3 h-3" />
                                                        </Button>
                                                    </div>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                )}

                {/* SCHEMAS & API TAB */}
                {activeTab === 'schemas' && (
                    <div className="space-y-6">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-bold">📋 Agent Schemas & API Documentation</h2>
                            <Link href="/integration">
                                <Button className="gap-2">
                                    <BookOpen className="w-4 h-4" />
                                    Full Integration Guide
                                </Button>
                            </Link>
                        </div>

                        {/* Agent Selector */}
                        <Card className="bg-black/40 border-white/10">
                            <CardContent className="pt-6">
                                <label className="text-sm text-muted-foreground mb-3 block">Select Agent</label>
                                <select
                                    value={selectedAgentForSchema}
                                    onChange={(e) => setSelectedAgentForSchema(e.target.value)}
                                    className="w-full bg-black/50 border border-white/10 rounded px-4 py-3 text-white font-semibold"
                                >
                                    {Object.entries(AGENT_METADATA).map(([id, metadata]) => (
                                        <option key={id} value={id}>
                                            {metadata.name} - {metadata.cost} APT
                                        </option>
                                    ))}
                                </select>
                            </CardContent>
                        </Card>

                        {(() => {
                            const metadata = AGENT_METADATA[selectedAgentForSchema as keyof typeof AGENT_METADATA];
                            if (!metadata) return null;

                            return (
                                <div className="space-y-4">
                                    {/* Agent Info */}
                                    <Card className="bg-gradient-to-r from-primary/20 to-primary/5 border-primary/30">
                                        <CardContent className="pt-6">
                                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                                <div>
                                                    <p className="text-xs text-muted-foreground mb-1">Agent</p>
                                                    <p className="font-bold">{metadata.name}</p>
                                                </div>
                                                <div>
                                                    <p className="text-xs text-muted-foreground mb-1">Cost</p>
                                                    <p className="font-bold text-green-400">{metadata.cost}</p>
                                                </div>
                                                <div>
                                                    <p className="text-xs text-muted-foreground mb-1">Model</p>
                                                    <p className="font-bold font-mono text-sm">{metadata.model}</p>
                                                </div>
                                                <div>
                                                    <p className="text-xs text-muted-foreground mb-1">Category</p>
                                                    <p className="font-bold">{metadata.category}</p>
                                                </div>
                                            </div>
                                            <p className="text-sm text-muted-foreground mt-4">{metadata.description}</p>
                                        </CardContent>
                                    </Card>

                                    {/* Example Request */}
                                    <Card className="bg-blue-500/5 border-blue-500/20">
                                        <CardHeader>
                                            <CardTitle className="flex items-center gap-2">
                                                <Code2 className="w-5 h-5" />
                                                Example Request
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                onClick={() => {
                                                    const code = JSON.stringify(metadata.examples?.[0], null, 2);
                                                    copyToClipboard(code, `request-${selectedAgentForSchema}`);
                                                }}
                                                className="mb-3 gap-2"
                                            >
                                                {copiedCode === `request-${selectedAgentForSchema}` ? (
                                                    <>
                                                        <Check className="w-3 h-3" />
                                                        Copied
                                                    </>
                                                ) : (
                                                    <>
                                                        <Copy className="w-3 h-3" />
                                                        Copy
                                                    </>
                                                )}
                                            </Button>
                                            <pre className="bg-black/80 p-4 rounded border border-white/10 overflow-x-auto text-xs">
                                                <code className="text-cyan-400 font-mono">
                                                    {JSON.stringify(metadata.examples?.[0], null, 2)}
                                                </code>
                                            </pre>
                                        </CardContent>
                                    </Card>

                                    {/* Example Response */}
                                    <Card className="bg-green-500/5 border-green-500/20">
                                        <CardHeader>
                                            <CardTitle className="flex items-center gap-2">
                                                <Info className="w-5 h-5" />
                                                Example Response
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                onClick={() => {
                                                    const code = JSON.stringify(metadata.examples?.[1], null, 2);
                                                    copyToClipboard(code, `response-${selectedAgentForSchema}`);
                                                }}
                                                className="mb-3 gap-2"
                                            >
                                                {copiedCode === `response-${selectedAgentForSchema}` ? (
                                                    <>
                                                        <Check className="w-3 h-3" />
                                                        Copied
                                                    </>
                                                ) : (
                                                    <>
                                                        <Copy className="w-3 h-3" />
                                                        Copy
                                                    </>
                                                )}
                                            </Button>
                                            <pre className="bg-black/80 p-4 rounded border border-white/10 overflow-x-auto text-xs max-h-96">
                                                <code className="text-green-400 font-mono">
                                                    {JSON.stringify(metadata.examples?.[1], null, 2)}
                                                </code>
                                            </pre>
                                        </CardContent>
                                    </Card>

                                    {/* API Documentation Info */}
                                    <Card className="bg-yellow-500/5 border-yellow-500/20">
                                        <CardHeader>
                                            <CardTitle className="flex items-center gap-2">
                                                <BookOpen className="w-5 h-5" />
                                                How to Use This Agent
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent className="space-y-3">
                                            <p className="text-sm">1. Prepare your request with the required parameters above</p>
                                            <p className="text-sm">2. Call the agent via <code className="bg-black/50 px-2 py-1 rounded text-cyan-400">executeAgentTask()</code></p>
                                            <p className="text-sm">3. Handle the response - check <code className="bg-black/50 px-2 py-1 rounded text-cyan-400">success</code> field first</p>
                                            <p className="text-sm">4. Access result data from <code className="bg-black/50 px-2 py-1 rounded text-cyan-400">response.result</code></p>
                                            <p className="text-sm">5. Monitor cost in <code className="bg-black/50 px-2 py-1 rounded text-cyan-400">response.cost</code> (octas)</p>
                                            <Link href="/integration">
                                                <Button variant="outline" className="mt-4 w-full">
                                                    View Full Integration Guide
                                                </Button>
                                            </Link>
                                        </CardContent>
                                    </Card>
                                </div>
                            );
                        })()}
                    </div>
                )}
            </div>
        </div>
    );
}
