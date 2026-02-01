"use client";
import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'next/navigation';
import { useAgentStore } from '@/store/agentStore';
import { UNIFIED_AGENT_REGISTRY } from '@/lib/agents/unified-registry';
import { Navbar } from '@/components/Navbar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Terminal, CheckCircle, AlertCircle, ArrowLeft, BrainCircuit, ShieldCheck, Zap, Code2 } from 'lucide-react';
import Link from 'next/link';
import { useKeyless } from '@/lib/keyless/provider'; // Use Keyless provider
import { toast } from 'sonner';
import { SwarmGraph } from '@/components/SwarmGraph';
import { PaymentModal } from '@/components/PaymentModal';

interface LogEntry {
    timestamp: string;
    message: string;
    type: 'info' | 'success' | 'error' | 'warning' | 'payment';
}

type ExecutionMode = 'direct' | 'orchestrated'; // direct = user calls agent, orchestrated = agent calls agent

export default function AgentDetailsPage() {
    const params = useParams();
    const { agents } = useAgentStore();
    const { isAuthenticated } = useKeyless(); // Use Keyless auth check

    // Try to get agent from unified registry first, then fall back to store
    const [agent, setAgent] = useState(() => {
        const agentId = params.id as string;
        const registryAgent = UNIFIED_AGENT_REGISTRY[agentId];
        if (registryAgent) return registryAgent as any;
        return agents.find(a => a.id === params.id);
    });
    const [logs, setLogs] = useState<LogEntry[]>([]);
    const [outputData, setOutputData] = useState<{ type: string, content: any } | null>(null);
    const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
    const [taskParams, setTaskParams] = useState<any>({});
    const [executionMode, setExecutionMode] = useState<ExecutionMode>('direct'); // NEW: Track execution mode
    const [orchestratorAgent, setOrchestratorAgent] = useState<string>(''); // NEW: Selected orchestrator agent
    const [userInputs, setUserInputs] = useState<Record<string, any>>({}); // NEW: User input state
    const scrollRef = useRef<HTMLDivElement>(null);

    // Refresh agent if store loads later or changes - but KEEP unified registry data if available
    useEffect(() => {
        const agentId = params.id as string;
        // Always prefer unified registry (has inputParameters)
        const registryAgent = UNIFIED_AGENT_REGISTRY[agentId];
        if (registryAgent) {
            setAgent(registryAgent as any);
            return;
        }
        // Fallback to store only if not in registry
        const found = agents.find(a => a.id === params.id);
        if (found) setAgent(found);
    }, [agents, params.id]);

    // Initialize default inputs based on agent capabilities
    useEffect(() => {
        if (!agent || !agent.capabilities) return;

        const firstCapability = Object.values(agent.capabilities)[0] as any;
        if (!firstCapability || !firstCapability.inputParameters) return;

        // Set default values from examples
        const defaults: Record<string, any> = {};
        firstCapability.inputParameters.forEach((param: any) => {
            defaults[param.name] = param.example || '';
        });
        setUserInputs(defaults);
    }, [agent]);

    const addLog = (message: string, type: LogEntry['type'] = 'info') => {
        setLogs(prev => [...prev, {
            timestamp: new Date().toLocaleTimeString(),
            message,
            type
        }]);
    };

    // Auto-scroll logs
    useEffect(() => {
        if (scrollRef.current) {
            setTimeout(() => {
                if (scrollRef.current)
                    scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
            }, 100);
        }
    }, [logs]);

    const handleExecuteAgent = () => {
        if (!agent) return;
        if (!isAuthenticated) {
            toast.error("Please login with Google first");
            addLog("Execution Aborted: Authentication required.", "error");
            return;
        }

        // Validate orchestrated mode selection
        if (executionMode === 'orchestrated' && !orchestratorAgent) {
            toast.error("Please select an orchestrator agent");
            addLog("Execution Aborted: No orchestrator agent selected.", "error");
            return;
        }

        // Validate required inputs
        if (agent.capabilities) {
            const firstCapability = Object.values(agent.capabilities)[0] as any;
            if (firstCapability && firstCapability.inputParameters) {
                const missingFields = firstCapability.inputParameters
                    .filter((param: any) => param.required && !userInputs[param.name])
                    .map((param: any) => param.name);

                if (missingFields.length > 0) {
                    toast.error(`Missing required fields: ${missingFields.join(', ')}`);
                    addLog(`Validation Error: Missing ${missingFields.join(', ')}`, "error");
                    return;
                }
            }
        }

        // Reset State
        setLogs([]);
        setOutputData(null);

        // Use user inputs as parameters
        const params = { ...userInputs };

        // Get the first capability
        let taskType = 'text-generation';
        if (agent.capabilities) {
            const capabilities = Object.keys(agent.capabilities);
            if (capabilities.length > 0) {
                taskType = capabilities[0];
            }
        }

        setTaskParams(params);

        if (executionMode === 'orchestrated') {
            const orchestrator = agents.find(a => a.id === orchestratorAgent);
            addLog(`🤖 ORCHESTRATION MODE ACTIVE`, "info");
            addLog(`Orchestrator Agent: ${orchestrator?.name}`, "info");
            addLog(`Target Agent: ${agent?.name}`, "info");
            addLog(`Workflow: ${orchestrator?.name} will execute ${agent?.name}`, "warning");
            addLog(`Total Cost: ${(Number(orchestrator?.price) + Number(agent?.price)).toFixed(3)} APT`, "info");
        } else {
            addLog(`👤 DIRECT EXECUTION MODE`, "info");
            addLog(`Cost: ${agent?.price} APT`, "info");
        }

        addLog(`Initializing x402 payment protocol...`, "info");
        addLog(`Task: ${taskType}`, "info");
        addLog(`Agent: ${agent?.name} (${agent?.id})`, "info");
        addLog(`Parameters: ${JSON.stringify(params, null, 2)}`, "info");

        // Open payment modal with orchestration context
        setIsPaymentModalOpen(true);
    };

    const handlePaymentSuccess = (result: any) => {
        addLog(`Payment confirmed! Transaction: ${result.payment?.transactionHash}`, "payment");
        addLog(`Agent execution completed in ${result.executionTime}ms`, "success");
        addLog(`Cost: ${result.cost} Octas`, "payment");

        // Save to transaction history
        if (result.payment?.transactionHash && agent && typeof params.id === 'string') {
            import("@/lib/x402/history").then(({ saveTransaction }) => {
                saveTransaction({
                    id: `tx-${Date.now()}`,
                    txnHash: result.payment.transactionHash,
                    agentId: params.id as string,
                    agentName: agent.name,
                    taskType: agent.category || "unknown",
                    parameters: taskParams,
                    cost: result.cost || "0",
                    costAPT: parseFloat(String(agent.price || "0")),
                    result: result.result,
                    timestamp: Date.now(),
                    executionTime: result.executionTime || 0,
                    status: "success",
                    blockHeight: result.payment.blockHeight
                });
                addLog("✅ Transaction saved to history", "success");
            }).catch(console.error);
        }

        // Set output data based on result type
        if (result.result) {
            const resultType = result.result.type || 'text';

            // Log the actual response content
            if (result.result.response) {
                addLog(`📝 Response: ${result.result.response.substring(0, 200)}${result.result.response.length > 200 ? '...' : ''}`, "success");
            } else if (result.result.detailedPrompt) {
                addLog(`🎨 Image Prompt: ${result.result.detailedPrompt.substring(0, 200)}...`, "success");
            } else if (result.result.code) {
                addLog(`💻 Code Generated: ${result.result.code.substring(0, 200)}...`, "success");
            }

            // Map executor result types to display types
            let displayContent: any;
            if (resultType === 'text-generation') {
                displayContent = result.result.response || JSON.stringify(result.result, null, 2);
            } else if (resultType === 'image-prompt') {
                displayContent = result.result.detailedPrompt || result.result;
            } else if (resultType === 'code-audit' || resultType === 'code-generation') {
                displayContent = JSON.stringify(result.result, null, 2);
            } else if (resultType === 'financial-analysis') {
                displayContent = JSON.stringify(result.result, null, 2);
            } else if (resultType === 'sentiment-analysis') {
                displayContent = JSON.stringify(result.result, null, 2);
            } else if (resultType === 'search-results') {
                displayContent = result.result.summary || JSON.stringify(result.result, null, 2);
            } else {
                displayContent = typeof result.result === 'string' ? result.result : JSON.stringify(result.result, null, 2);
            }

            setOutputData({
                type: resultType,
                content: displayContent
            });
        }

        toast.success("Task completed successfully!");
        setIsPaymentModalOpen(false);
    };

    if (!agent) {
        return (
            <div className="min-h-screen bg-background">
                <Navbar />
                <div className="flex flex-col items-center justify-center min-h-screen space-y-4">
                    <h1 className="text-4xl font-bold text-red-500">AGENT NOT FOUND</h1>
                    <Link href="/">
                        <Button className="glass-card">Return to Base</Button>
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background pb-20">
            <Navbar />

            <div className="pt-24 px-6 max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column: Agent Info */}
                <div className="lg:col-span-1 space-y-6 animate-in slide-in-from-left duration-500">
                    <Link href="/" className="text-muted-foreground hover:text-primary flex items-center gap-2 mb-4">
                        <ArrowLeft className="w-4 h-4" /> Back to Market
                    </Link>

                    <Card className="glass-card border-primary/20 overflow-hidden">
                        <div className="h-32 bg-gradient-to-br from-primary/20 to-purple-500/20 relative">
                            <div className="absolute -bottom-10 left-6">
                                <img src={agent.imageUrl} alt={agent.name} className="w-24 h-24 rounded-xl border-4 border-black bg-black" />
                            </div>
                        </div>
                        <div className="pt-12 px-6 pb-6 space-y-4">
                            <div>
                                <h1 className="text-2xl font-bold text-white">{agent.name}</h1>
                                <Badge variant="secondary" className="mt-2 bg-primary/10 text-primary border-primary/20">
                                    {agent.category || "General"} Agent
                                </Badge>
                            </div>

                            <p className="text-muted-foreground text-sm">{agent.description}</p>

                            <Separator className="bg-white/10" />

                            <div className="flex justify-between items-center text-sm">
                                <span className="text-muted-foreground">Price per Request</span>
                                <span className="text-xl font-bold text-green-400 font-mono">{agent.price || "0.02"} APT</span>
                            </div>

                            <div className="flex justify-between items-center text-sm">
                                <span className="text-muted-foreground">Reputation Score</span>
                                <span className="text-primary font-bold">{agent.onChainData?.reputationScore || agent.reputation || Math.round((agent.averageRating || 4.5) * 200)}/1000</span>
                            </div>

                            <Separator className="bg-white/10" />

                            {/* PARAMETER INPUT FORM */}
                            {agent.capabilities && Object.keys(agent.capabilities).length > 0 && (() => {
                                const firstCapability = Object.values(agent.capabilities)[0] as any;
                                if (!firstCapability?.inputParameters || firstCapability.inputParameters.length === 0) {
                                    return null;
                                }

                                return (
                                    <div className="space-y-3">
                                        <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                                            Input Parameters
                                        </div>

                                        {firstCapability.inputParameters.map((param: any, idx: number) => (
                                            <div key={idx} className="space-y-1.5">
                                                <label className="text-xs font-medium text-white flex items-center gap-1">
                                                    {param.name}
                                                    {param.required && <span className="text-red-400">*</span>}
                                                </label>
                                                <p className="text-[10px] text-muted-foreground">{param.description}</p>

                                                {param.type === 'string' && !param.enum && param.name !== 'text' && param.name !== 'code' ? (
                                                    <input
                                                        type="text"
                                                        value={userInputs[param.name] || ''}
                                                        onChange={(e) => setUserInputs({ ...userInputs, [param.name]: e.target.value })}
                                                        placeholder={typeof param.example === 'string' ? param.example : `Enter ${param.name}...`}
                                                        className="w-full bg-black/50 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary transition"
                                                        required={param.required}
                                                    />
                                                ) : param.type === 'string' && (param.name === 'text' || param.name === 'code' || param.name === 'prompt') ? (
                                                    <textarea
                                                        value={userInputs[param.name] || ''}
                                                        onChange={(e) => setUserInputs({ ...userInputs, [param.name]: e.target.value })}
                                                        placeholder={typeof param.example === 'string' ? param.example : `Enter ${param.name}...`}
                                                        rows={4}
                                                        className="w-full bg-black/50 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary transition resize-none font-mono"
                                                        required={param.required}
                                                    />
                                                ) : param.enum ? (
                                                    <select
                                                        value={userInputs[param.name] || param.enum[0]}
                                                        onChange={(e) => setUserInputs({ ...userInputs, [param.name]: e.target.value })}
                                                        className="w-full bg-black/50 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-primary transition"
                                                    >
                                                        {param.enum.map((opt: string) => (
                                                            <option key={opt} value={opt}>{opt}</option>
                                                        ))}
                                                    </select>
                                                ) : param.type === 'number' ? (
                                                    <input
                                                        type="number"
                                                        value={userInputs[param.name] || ''}
                                                        onChange={(e) => setUserInputs({ ...userInputs, [param.name]: Number(e.target.value) })}
                                                        placeholder={typeof param.example === 'string' ? param.example : String(param.example || `Enter ${param.name}...`)}
                                                        min={param.minValue}
                                                        max={param.maxValue}
                                                        className="w-full bg-black/50 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary transition"
                                                        required={param.required}
                                                    />
                                                ) : (
                                                    <input
                                                        type="text"
                                                        value={userInputs[param.name] || ''}
                                                        onChange={(e) => setUserInputs({ ...userInputs, [param.name]: e.target.value })}
                                                        placeholder={typeof param.example === 'string' ? param.example : `Enter ${param.name}...`}
                                                        className="w-full bg-black/50 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary transition"
                                                        required={param.required}
                                                    />
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                );
                            })()}

                            <Separator className="bg-white/10" />

                            {/* NEW: Execution Mode Selector */}
                            <div className="space-y-3">
                                <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Execution Mode</div>

                                {/* Direct Execution */}
                                <button
                                    onClick={() => setExecutionMode('direct')}
                                    className={`w-full p-3 rounded-lg border-2 transition-all text-left ${executionMode === 'direct'
                                        ? 'border-primary bg-primary/10'
                                        : 'border-white/10 hover:border-white/20 bg-white/5'
                                        }`}
                                >
                                    <div className="font-semibold text-sm">👤 Use Agent Directly</div>
                                    <div className="text-xs text-muted-foreground mt-1">You call {agent.name} directly</div>
                                </button>

                                {/* Orchestrated Execution */}
                                <button
                                    onClick={() => setExecutionMode('orchestrated')}
                                    className={`w-full p-3 rounded-lg border-2 transition-all text-left ${executionMode === 'orchestrated'
                                        ? 'border-purple-500 bg-purple-500/10'
                                        : 'border-white/10 hover:border-white/20 bg-white/5'
                                        }`}
                                >
                                    <div className="font-semibold text-sm">🤖 Use Your Agent</div>
                                    <div className="text-xs text-muted-foreground mt-1">Your agent uses {agent.name} internally</div>
                                </button>

                                {/* Agent Selector for Orchestrated Mode */}
                                {executionMode === 'orchestrated' && (
                                    <div className="space-y-2 bg-purple-500/5 p-3 rounded-lg border border-purple-500/20">
                                        <label className="text-xs font-semibold text-muted-foreground">Select your orchestrator agent:</label>
                                        <select
                                            value={orchestratorAgent}
                                            onChange={(e) => setOrchestratorAgent(e.target.value)}
                                            className="w-full bg-black/50 border border-purple-500/30 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-purple-500 transition-colors"
                                        >
                                            <option value="">Choose an agent...</option>
                                            {agents
                                                .filter(a => a.id !== params.id) // Don't allow self-reference
                                                .map(a => (
                                                    <option key={a.id} value={a.id}>
                                                        {a.name} ({a.price} APT)
                                                    </option>
                                                ))
                                            }
                                        </select>
                                        {orchestratorAgent && (
                                            <div className="text-xs text-purple-400 mt-2">
                                                💡 Workflow: {agents.find(a => a.id === orchestratorAgent)?.name} → {agent.name}
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>

                            {/* x402 Payment Button */}
                            <Button
                                className="w-full bg-primary hover:bg-cyan-400 text-black font-bold shadow-[0_0_15px_rgba(14,165,233,0.2)] hover:shadow-[0_0_25px_rgba(14,165,233,0.5)] transition-all h-12"
                                onClick={handleExecuteAgent}
                                disabled={executionMode === 'orchestrated' && !orchestratorAgent}
                            >
                                <Zap className="w-4 h-4 mr-2 fill-current" />
                                EXECUTE WITH x402
                            </Button>

                            <div className="text-[10px] text-center font-mono text-muted-foreground">
                                Pay-per-request micropayment • Sub-second settlement
                            </div>
                        </div>
                    </Card>

                    <Card className="glass-card border-white/5">
                        <CardHeader>
                            <CardTitle className="text-sm text-muted-foreground">System Stats</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2 text-sm font-mono text-green-500/80">
                            <div className="flex justify-between">
                                <span>Latency</span>
                                <span>{agent.specs?.latency || "~45ms"}</span>
                            </div>
                            <div className="flex justify-between">
                                <span>Uptime</span>
                                <span>99.9%</span>
                            </div>
                            <div className="flex justify-between">
                                <span>Success Rate</span>
                                <span>{(100 - (agent.onChainData?.disputeRate || 0)).toFixed(1)}%</span>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Developer Integration Card */}
                    <Card className="glass-card border-white/5 mt-6">
                        <CardHeader>
                            <CardTitle className="text-sm text-muted-foreground flex items-center gap-2">
                                <Code2 className="w-4 h-4" /> Developer Integration
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <p className="text-xs text-muted-foreground">
                                Want to integrate {agent.name} into your dApp? Use the x402 SDK.
                            </p>
                            <div className="bg-black/50 p-2 rounded border border-white/10 relative">
                                <pre className="text-[10px] font-mono text-green-400 overflow-x-auto scrollbar-hide">
                                    {`import { AetherClient } from '@aether/sdk';

const client = new AetherClient();
const result = await client.execute({
  agentId: "${agent.id}",
  params: { ... }
});`}
                                </pre>
                            </div>
                            <Link href="/docs/sdk">
                                <Button variant="outline" size="sm" className="w-full text-xs h-8 text-black bg-white hover:bg-gray-200">
                                    View API Docs
                                </Button>
                            </Link>
                        </CardContent>
                    </Card>
                </div>

                {/* Right Column: Console / Execution Log */}
                <div className="lg:col-span-2 animate-in slide-in-from-right duration-500 delay-100 h-full max-h-[800px] flex flex-col">
                    <Card className="glass-card border-white/10 flex-1 flex flex-col overflow-hidden bg-black/80">
                        <CardHeader className="bg-white/5 border-b border-white/5 py-3 flex flex-row items-center justify-between">
                            <div className="flex items-center gap-2 text-sm font-mono text-muted-foreground">
                                <Terminal className="w-4 h-4" />
                                <span>EXECUTION CONSOLE</span>
                            </div>
                            <div className="flex gap-1.5">
                                <div className="w-3 h-3 rounded-full bg-red-500/20 border border-red-500/50" />
                                <div className="w-3 h-3 rounded-full bg-yellow-500/20 border border-yellow-500/50" />
                                <div className="w-3 h-3 rounded-full bg-green-500/20 border border-green-500/50" />
                            </div>
                        </CardHeader>
                        <CardContent className="flex-1 p-0 relative">
                            <ScrollArea className="h-[600px] w-full p-4 font-mono text-sm" ref={scrollRef}>
                                <div className="min-h-full">
                                    {logs.length === 0 && (
                                        <div className="h-[500px] flex flex-col items-center justify-center text-muted-foreground/30 space-y-4">
                                            <BrainCircuit className="w-24 h-24 opacity-20 animate-pulse" />
                                            <p className="font-mono text-center">
                                                Awaiting Neural Link...<br />
                                                <span className="text-xs opacity-50">x402 Protocol Ready</span>
                                            </p>
                                        </div>
                                    )}

                                    {/* Swarm Visualization */}
                                    {agent.isSwarm && logs.length > 0 && (
                                        <SwarmGraph active={true} step={logs.length} />
                                    )}

                                    {/* RICH OUTPUT RENDERER */}
                                    {outputData && (
                                        <div className="mb-6 p-4 rounded-xl border border-white/10 bg-black/50 overflow-hidden animate-in slide-in-from-bottom-4 duration-700">
                                            <div className="text-xs text-muted-foreground font-mono mb-2 uppercase tracking-widest border-b border-white/5 pb-1">
                                                Result Payload [{outputData.type}]
                                            </div>

                                            {outputData.type === 'image' && (
                                                <div className="relative group">
                                                    <img src={outputData.content} alt="Agent Output" className="w-full rounded-lg border border-white/10 shadow-2xl transition-transform duration-500" />
                                                    <div className="absolute top-2 right-2 bg-black/80 text-white text-[10px] px-2 py-1 rounded backdrop-blur">
                                                        GENERATED BY {agent.name.toUpperCase()}
                                                    </div>
                                                </div>
                                            )}

                                            {/* Handle all other text-based output types */}
                                            {outputData.type !== 'image' && (
                                                <div className="space-y-3">
                                                    <pre className="whitespace-pre-wrap font-mono text-xs text-green-300/90 leading-relaxed max-h-[400px] overflow-y-auto bg-black/30 p-3 rounded-lg">
                                                        {typeof outputData.content === 'string' ? outputData.content : JSON.stringify(outputData.content, null, 2)}
                                                    </pre>
                                                    <div className="flex gap-2">
                                                        <Button
                                                            size="sm"
                                                            variant="outline"
                                                            className="text-xs"
                                                            onClick={() => {
                                                                navigator.clipboard.writeText(
                                                                    typeof outputData.content === 'string'
                                                                        ? outputData.content
                                                                        : JSON.stringify(outputData.content, null, 2)
                                                                );
                                                                toast.success("Copied to clipboard!");
                                                            }}
                                                        >
                                                            📋 Copy
                                                        </Button>
                                                        <Button
                                                            size="sm"
                                                            variant="outline"
                                                            className="text-xs"
                                                            onClick={() => {
                                                                const content = typeof outputData.content === 'string'
                                                                    ? outputData.content
                                                                    : JSON.stringify(outputData.content, null, 2);
                                                                const blob = new Blob([content], { type: 'text/plain' });
                                                                const url = URL.createObjectURL(blob);
                                                                const a = document.createElement('a');
                                                                a.href = url;
                                                                a.download = `${agent.id}-output-${Date.now()}.txt`;
                                                                a.click();
                                                                toast.success("Downloaded!");
                                                            }}
                                                        >
                                                            ⬇️ Download
                                                        </Button>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    <div className="space-y-2">
                                        {logs.map((log, i) => (
                                            <div key={i} className="flex items-start gap-3 animate-in fade-in slide-in-from-left-2 duration-300">
                                                <span className="text-xs text-muted-foreground min-w-[80px] pt-0.5">{log.timestamp}</span>
                                                <div className="flex-1 break-all">
                                                    {log.type === 'info' && <span className="text-blue-400">ℹ {log.message}</span>}
                                                    {log.type === 'success' && <span className="text-green-400 flex items-start gap-1"><CheckCircle className="w-3 h-3 mt-1" /> {log.message}</span>}
                                                    {log.type === 'error' && <span className="text-red-400 flex items-start gap-1"><AlertCircle className="w-3 h-3 mt-1" /> {log.message}</span>}
                                                    {log.type === 'warning' && <span className="text-yellow-400">⚠ {log.message}</span>}
                                                    {log.type === 'payment' && <span className="text-purple-400 flex items-center gap-1"><Zap className="w-3 h-3 fill-current" /> {log.message}</span>}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </ScrollArea>
                        </CardContent>
                    </Card>
                </div>
            </div>

            {/* x402 Payment Modal */}
            <PaymentModal
                isOpen={isPaymentModalOpen}
                onClose={() => setIsPaymentModalOpen(false)}
                agentId={agent.id}
                agentName={agent.name}
                taskType={taskParams.prompt ? 'image-generation' : taskParams.code ? 'code-audit' : 'financial-analysis'}
                taskParameters={taskParams}
                priceAPT={agent.price}
                onSuccess={handlePaymentSuccess}
            />
        </div>
    );
}
