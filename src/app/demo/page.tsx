"use client";

import React, { useState } from 'react';
import { useKeyless } from '@/lib/keyless/provider';

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

    const getStatusColor = (status: FlowStep['status']) => {
        switch (status) {
            case 'pending': return 'bg-gray-100 text-gray-600';
            case 'in-progress': return 'bg-blue-100 text-blue-600';
            case 'success': return 'bg-green-100 text-green-600';
            case 'error': return 'bg-red-100 text-red-600';
        }
    };

    const getStatusIcon = (status: FlowStep['status']) => {
        switch (status) {
            case 'pending': return '⭕';
            case 'in-progress': return '⏳';
            case 'success': return '✅';
            case 'error': return '❌';
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-8">
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="text-center mb-12">
                    <h1 className="text-5xl font-bold text-white mb-2">M2M Protocol Demo</h1>
                    <p className="text-xl text-purple-200">Autonomous Agent-to-Service Payments</p>
                </div>

                {/* Status Cards */}
                <div className="grid grid-cols-2 gap-4 mb-8 bg-slate-800 bg-opacity-50 p-6 rounded-lg border border-purple-500 border-opacity-30">
                    <div>
                        <p className="text-purple-300 text-sm">Authenticated</p>
                        <p className="text-white text-2xl font-bold">{isAuthenticated ? '✅ Yes' : '❌ No'}</p>
                    </div>
                    <div>
                        <p className="text-purple-300 text-sm">Session Active</p>
                        <p className="text-white text-2xl font-bold">{session?.isActive ? '✅ Yes' : '❌ No'}</p>
                    </div>
                    <div>
                        <p className="text-purple-300 text-sm">Remaining Payments</p>
                        <p className="text-white text-2xl font-bold">{session?.remainingRequests || 0}/10</p>
                    </div>
                    <div>
                        <p className="text-purple-300 text-sm">Account Address</p>
                        <p className="text-white text-sm font-mono">{account?.address.slice(0, 16)}...</p>
                    </div>
                </div>

                {/* Flow Visualization */}
                <div className="space-y-4 mb-8">
                    {flowSteps.map((step, index) => (
                        <div key={step.id}>
                            <div className={`p-4 rounded-lg border-2 border-purple-500 border-opacity-30 ${getStatusColor(step.status)}`}>
                                <div className="flex items-start gap-4">
                                    <div className="text-3xl mt-1">{getStatusIcon(step.status)}</div>
                                    <div className="flex-1">
                                        <h3 className="font-bold text-lg">{step.id}. {step.title}</h3>
                                        <p className="text-sm opacity-80">{step.description}</p>
                                        {step.details && (
                                            <p className="text-xs font-mono mt-2 opacity-70">{step.details}</p>
                                        )}
                                    </div>
                                </div>
                            </div>
                            {index < flowSteps.length - 1 && (
                                <div className="flex justify-center my-2">
                                    <div className="w-1 h-4 bg-purple-500 opacity-50"></div>
                                </div>
                            )}
                        </div>
                    ))}
                </div>

                {/* Demo Controls */}
                <div className="bg-slate-800 bg-opacity-50 border border-purple-500 border-opacity-30 rounded-lg p-6">
                    <button
                        onClick={runDemoFlow}
                        disabled={!isAuthenticated || !session?.isActive}
                        className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 disabled:from-gray-600 disabled:to-gray-600 text-white font-bold py-3 px-6 rounded-lg transition"
                    >
                        {isAuthenticated && session?.isActive ? '🚀 Run Full M2M Flow' : '❌ Login & Create Session First'}
                    </button>

                    <div className="mt-6 text-purple-200 text-sm space-y-2">
                        <p className="font-bold">How to use this demo:</p>
                        <ol className="list-decimal list-inside space-y-1">
                            <li>Login with Google to create a keyless account</li>
                            <li>Navigate to Dashboard and create a delegation session</li>
                            <li>Return here and click &quot;Run Full M2M Flow&quot;</li>
                            <li>Watch all 8 steps execute autonomously without popups</li>
                            <li>Check the browser console for detailed logs</li>
                        </ol>
                    </div>
                </div>

                {/* Key Features */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
                    <div className="bg-slate-800 bg-opacity-50 border border-purple-500 border-opacity-30 rounded-lg p-4">
                        <h3 className="text-purple-300 font-bold mb-2">🔐 Keyless Auth</h3>
                        <p className="text-gray-300 text-sm">Google-powered keyless accounts with ZK proofs</p>
                    </div>
                    <div className="bg-slate-800 bg-opacity-50 border border-purple-500 border-opacity-30 rounded-lg p-4">
                        <h3 className="text-purple-300 font-bold mb-2">⚡ Autonomous</h3>
                        <p className="text-gray-300 text-sm">Payments signed without user popups or approval</p>
                    </div>
                    <div className="bg-slate-800 bg-opacity-50 border border-purple-500 border-opacity-30 rounded-lg p-4">
                        <h3 className="text-purple-300 font-bold mb-2">💰 x402 Protocol</h3>
                        <p className="text-gray-300 text-sm">HTTP 402 payment-required with signature verification</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
