"use client";

import React, { useState } from 'react';
import { useKeyless } from '@/lib/keyless/provider';
import { Navbar } from '@/components/Navbar';
import { NetworkBackground } from '@/components/NetworkBackground';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Activity, Circle, CheckCircle2, XCircle, Terminal, Shield, Play, Lock } from 'lucide-react';

interface FlowStep {
    id: string;
    title: string;
    description: string;
    status: 'pending' | 'in-progress' | 'success' | 'error';
    details?: string;
}

export default function M2MDemoPage() {
    const { account, isAuthenticated, session, signWithSession } = useKeyless();
    const [flowSteps, setFlowSteps] = useState<FlowStep[]>([
        {
            id: '1',
            title: 'User Authentication',
            description: 'Create keyless account via Google',
            status: 'pending'
        },
        {
            id: '2',
            title: 'Delegation Session',
            description: 'Authorize autonomous payments (10 payments)',
            status: 'pending'
        },
        {
            id: '3',
            title: 'Agent Task Request',
            description: 'Submit task to agent endpoint',
            status: 'pending'
        },
        {
            id: '4',
            title: 'Payment Required (402)',
            description: 'Server requests payment signature',
            status: 'pending'
        },
        {
            id: '5',
            title: 'Autonomous Payment',
            description: 'Sign & submit payment transaction (NO POPUP)',
            status: 'pending'
        },
        {
            id: '6',
            title: 'Payment Verification',
            description: 'Server verifies transaction on-chain',
            status: 'pending'
        },
        {
            id: '7',
            title: 'Agent Execution',
            description: 'Agent executes task with real AI',
            status: 'pending'
        },
        {
            id: '8',
            title: 'Task Complete',
            description: 'Receive agent result & payment receipt',
            status: 'pending'
        }
    ]);

    const updateStep = (id: string, status: FlowStep['status'], details?: string) => {
        setFlowSteps(prev =>
            prev.map(step =>
                step.id === id ? { ...step, status, details } : step
            )
        );
    };

    const runDemoFlow = async () => {
        try {
            // Step 1: Check authentication
            updateStep('1', 'in-progress');
            if (!isAuthenticated || !account) {
                updateStep('1', 'error', 'Not authenticated. Please login first.');
                return;
            }
            updateStep('1', 'success', `Keyless account: ${account.address.slice(0, 10)}...`);

            // Step 2: Check delegation session
            updateStep('2', 'in-progress');
            if (!session || !session.isActive) {
                updateStep('2', 'error', 'No active delegation session. Create one first.');
                return;
            }
            updateStep('2', 'success', `${session.remainingRequests}/${session.maxRequests} payments authorized`);

            // Step 3: Submit agent task
            updateStep('3', 'in-progress');

            const taskRequest = {
                agentId: 'atlas-ai',
                taskType: 'text-generation',
                parameters: {
                    prompt: 'Explain how autonomous agents and AI can transform service economies with blockchain payments.',
                    system: 'You are an expert in distributed systems and blockchain technology.'
                },
                maxPrice: '0.05 APT'
            };

            updateStep('3', 'success', 'Task request created');

            // Step 4: Initial request (will get 402)
            updateStep('4', 'in-progress');
            const initialResponse = await fetch('/api/agent/execute', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(taskRequest)
            });

            if (initialResponse.status !== 402) {
                updateStep('4', 'error', `Expected 402, got ${initialResponse.status}`);
                return;
            }

            const paymentRequired = await initialResponse.json();
            updateStep('4', 'success', `Payment required: ${paymentRequired.amount} octas`);

            // Step 5: Autonomous payment
            updateStep('5', 'in-progress', 'Signing transaction autonomously...');

            let txnHash: string = '';
            try {
                const signResponse = await signWithSession({
                    function: '0x1::aptos_account::transfer',
                    functionArguments: [
                        paymentRequired.recipient,
                        paymentRequired.amount
                    ]
                });

                txnHash = signResponse.hash;
                updateStep('5', 'success', `Transaction signed: ${txnHash.slice(0, 10)}...`);
            } catch (error) {
                updateStep('5', 'error', `Signing failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
                return;
            }

            // Step 6: Payment verification
            updateStep('6', 'in-progress', 'Waiting for on-chain verification...');
            const paymentSignature = {
                signature: txnHash,
                publicKey: account.address,
                txnHash,
                timestamp: Date.now()
            };

            const retryResponse = await fetch('/api/agent/execute', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'PAYMENT-SIGNATURE': JSON.stringify(paymentSignature)
                },
                body: JSON.stringify({
                    ...taskRequest,
                    requestId: paymentRequired.requestId
                })
            });

            if (!retryResponse.ok) {
                const error = await retryResponse.text();
                updateStep('6', 'error', `Verification failed: ${error}`);
                return;
            }

            updateStep('6', 'success', 'Payment verified on-chain ✅');

            // Step 7: Agent execution
            updateStep('7', 'in-progress', 'Agent executing task...');
            const result = await retryResponse.json();
            updateStep('7', 'success', 'Agent task completed');

            // Step 8: Complete
            updateStep('8', 'success', `Result: ${JSON.stringify(result).slice(0, 100)}...`);

        } catch (error) {
            console.error('Demo flow error:', error);
            updateStep(
                flowSteps.find(s => s.status === 'in-progress')?.id || '8',
                'error',
                error instanceof Error ? error.message : 'Unknown error'
            );
        }
    };

    const getStatusStyles = (status: FlowStep['status']) => {
        switch (status) {
            case 'pending': return 'border-white/10 bg-white/5 text-muted-foreground';
            case 'in-progress': return 'border-blue-500/50 bg-blue-500/10 text-blue-400 animate-pulse';
            case 'success': return 'border-green-500/50 bg-green-500/10 text-green-400';
            case 'error': return 'border-red-500/50 bg-red-500/10 text-red-400';
        }
    };

    const getStatusIcon = (status: FlowStep['status']) => {
        switch (status) {
            case 'pending': return <Circle className="w-5 h-5" />;
            case 'in-progress': return <Activity className="w-5 h-5 animate-spin" />;
            case 'success': return <CheckCircle2 className="w-5 h-5" />;
            case 'error': return <XCircle className="w-5 h-5" />;
        }
    };

    return (
        <div className="min-h-screen relative text-foreground">
            <NetworkBackground />
            <Navbar />

            <div className="pt-32 px-6 max-w-7xl mx-auto pb-20 relative z-10">
                {/* Header */}
                <div className="flex items-center gap-4 mb-12">
                    <div className="p-3 bg-purple-500/10 rounded-xl border border-purple-500/20">
                        <Terminal className="w-8 h-8 text-purple-400" />
                    </div>
                    <div>
                        <h1 className="text-4xl font-black text-white tracking-tighter">M2M PROTOCOL DEMO</h1>
                        <p className="text-purple-300 font-mono">AUTONOMOUS AGENT-TO-SERVICE PAYMENTS</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* LEFT COLUMN: Controls & Status */}
                    <div className="space-y-6">
                        <Card className="glass-card border-purple-500/30 bg-black/40">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2 text-purple-400">
                                    <Shield className="w-5 h-5" /> SESSION SECURITY
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex justify-between items-center py-2 border-b border-white/5">
                                    <span className="text-muted-foreground text-sm">Authentication</span>
                                    <Badge variant={isAuthenticated ? "default" : "destructive"} className={isAuthenticated ? "bg-green-500/20 text-green-400" : ""}>
                                        {isAuthenticated ? 'Authenticated' : 'Not Connected'}
                                    </Badge>
                                </div>
                                <div className="flex justify-between items-center py-2 border-b border-white/5">
                                    <span className="text-muted-foreground text-sm">Delegation Session</span>
                                    <Badge variant={session?.isActive ? "default" : "secondary"} className={session?.isActive ? "bg-blue-500/20 text-blue-400" : ""}>
                                        {session?.isActive ? 'Active' : 'Inactive'}
                                    </Badge>
                                </div>
                                <div className="flex justify-between items-center py-2 border-b border-white/5">
                                    <span className="text-muted-foreground text-sm">Allowance</span>
                                    <span className="font-mono text-white">{session?.remainingRequests || 0} / 10 TXs</span>
                                </div>
                                <div className="pt-2">
                                    <span className="text-xs text-muted-foreground block mb-1">Keyless Wallet</span>
                                    <div className="bg-black/50 p-2 rounded text-xs font-mono text-white/50 truncate">
                                        {account?.address || "Not connected"}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="glass-card border-white/10 bg-black/40">
                            <CardHeader>
                                <CardTitle className="text-white">Run Simulation</CardTitle>
                                <CardDescription>Execute autonomous M2M payment flow</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <Button
                                    onClick={runDemoFlow}
                                    disabled={!isAuthenticated || !session?.isActive}
                                    className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold h-12 shadow-[0_0_20px_rgba(168,85,247,0.4)] transition-all"
                                >
                                    {isAuthenticated && session?.isActive ? (
                                        <> <Play className="w-4 h-4 mr-2" /> EXECUTE PROTOCOL </>
                                    ) : (
                                        <> <Lock className="w-4 h-4 mr-2" /> LOGIN REQUIRED </>
                                    )}
                                </Button>

                                <div className="text-xs text-muted-foreground space-y-2 bg-white/5 p-3 rounded">
                                    <p className="font-bold text-white">Instructions:</p>
                                    <ol className="list-decimal list-inside space-y-1">
                                        <li>Login via Navbar</li>
                                        <li>Enable Delegation (Dashboard)</li>
                                        <li>Click Execute Protocol</li>
                                    </ol>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* RIGHT COLUMN: Flow Visualization */}
                    <div className="lg:col-span-2 space-y-4">
                        <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                            <Activity className="w-5 h-5 text-blue-400" /> REAL-TIME EXECUTION LOG
                        </h2>

                        <div className="space-y-0 relative">
                            {/* Vertical Line */}
                            <div className="absolute left-6 top-4 bottom-4 w-px bg-white/10 z-0" />

                            {flowSteps.map((step, index) => (
                                <div key={step.id} className="relative z-10 mb-4 group">
                                    <div className={`
                                        ml-12 p-4 rounded-xl border transition-all duration-300
                                        ${getStatusStyles(step.status)}
                                    `}>
                                        {/* Status Icon Bubble */}
                                        <div className={`
                                            absolute -left-12 top-4 w-10 h-10 rounded-full border-4 border-black flex items-center justify-center
                                            ${step.status === 'pending' ? 'bg-slate-800 text-muted-foreground' : ''}
                                            ${step.status === 'in-progress' ? 'bg-blue-600 text-white' : ''}
                                            ${step.status === 'success' ? 'bg-green-600 text-white' : ''}
                                            ${step.status === 'error' ? 'bg-red-600 text-white' : ''}
                                        `}>
                                            {getStatusIcon(step.status)}
                                        </div>

                                        <div className="flex justify-between items-start">
                                            <div>
                                                <h3 className="font-bold text-sm uppercase tracking-wider mb-1">{step.title}</h3>
                                                <p className="text-sm opacity-90">{step.description}</p>
                                            </div>
                                            {step.status === 'in-progress' && <Activity className="w-4 h-4 animate-spin opacity-50" />}
                                        </div>

                                        {step.details && (
                                            <div className="mt-3 pt-3 border-t border-black/10 dark:border-white/10">
                                                <code className="text-xs font-mono block break-all opacity-75 bg-black/20 p-2 rounded">
                                                    {step.details}
                                                </code>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
