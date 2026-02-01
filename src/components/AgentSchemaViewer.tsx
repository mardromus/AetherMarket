"use client";

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Copy, Check, Code2, Info, AlertCircle, CheckCircle } from 'lucide-react';
import type { AgentSpec } from '@/lib/agents/interface';
import { toast } from 'sonner';

interface AgentSchemaViewerProps {
    agent?: AgentSpec | null;
    className?: string;
}

export function AgentSchemaViewer({ agent, className = '' }: AgentSchemaViewerProps) {
    const [copiedId, setCopiedId] = useState<string | null>(null);

    // Early return if no agent provided
    if (!agent || !agent.capabilities || Object.keys(agent.capabilities).length === 0) {
        return (
            <Card className={`bg-black/40 border-white/10 ${className}`}>
                <CardContent className="pt-6 text-center text-muted-foreground">
                    <p>No agent selected or agent data not available.</p>
                </CardContent>
            </Card>
        );
    }

    const [selectedCapability, setSelectedCapability] = useState<string>(
        Object.keys(agent.capabilities)[0]
    );

    const capability = agent.capabilities[selectedCapability];

    const copyToClipboard = (text: string, id: string) => {
        navigator.clipboard.writeText(text);
        setCopiedId(id);
        toast.success('Copied to clipboard!');
        setTimeout(() => setCopiedId(null), 2000);
    };

    const formatType = (param: any): string => {
        if (param.enum) return `enum: ${param.enum.join(' | ')}`;
        if (param.type === 'array') return 'array';
        return param.type || 'string';
    };

    const formatConstraints = (param: any): string[] => {
        const constraints: string[] = [];
        if (param.minLength) constraints.push(`min: ${param.minLength}`);
        if (param.maxLength) constraints.push(`max: ${param.maxLength}`);
        if (param.minValue !== undefined) constraints.push(`min: ${param.minValue}`);
        if (param.maxValue !== undefined) constraints.push(`max: ${param.maxValue}`);
        return constraints;
    };

    return (
        <div className={`space-y-6 ${className}`}>
            {/* Agent Overview */}
            <Card className="bg-gradient-to-r from-primary/10 to-primary/5 border-primary/20">
                <CardHeader>
                    <div className="flex items-start justify-between">
                        <div>
                            <CardTitle className="text-2xl mb-2">{agent.name}</CardTitle>
                            <CardDescription className="text-base">{agent.description}</CardDescription>
                        </div>
                        <Badge className="bg-primary/20 text-primary border-primary/30 text-sm px-3 py-1">
                            v{agent.version}
                        </Badge>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div>
                            <p className="text-xs text-muted-foreground mb-1">Model</p>
                            <p className="font-mono text-sm font-semibold">{agent.model || agent.provider}</p>
                        </div>
                        <div>
                            <p className="text-xs text-muted-foreground mb-1">Category</p>
                            <p className="font-semibold text-sm capitalize">{agent.category}</p>
                        </div>
                        <div>
                            <p className="text-xs text-muted-foreground mb-1">Success Rate</p>
                            <p className="font-semibold text-sm text-green-400">{agent.successRate}%</p>
                        </div>
                        <div>
                            <p className="text-xs text-muted-foreground mb-1">Verified</p>
                            <p className="font-semibold text-sm flex items-center gap-1">
                                {agent.isVerified ? (
                                    <>
                                        <CheckCircle className="w-4 h-4 text-green-400" />
                                        <span className="text-green-400">Yes</span>
                                    </>
                                ) : (
                                    <span className="text-gray-400">No</span>
                                )}
                            </p>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Capability Selector */}
            {Object.keys(agent.capabilities).length > 1 && (
                <Card className="bg-black/40 border-white/10">
                    <CardContent className="pt-6">
                        <label className="text-sm text-muted-foreground mb-3 block">Select Capability</label>
                        <select
                            value={selectedCapability}
                            onChange={(e) => setSelectedCapability(e.target.value)}
                            className="w-full bg-black/50 border border-white/10 rounded px-4 py-3 text-white font-semibold"
                        >
                            {Object.entries(agent.capabilities).map(([capId, cap]) => (
                                <option key={capId} value={capId}>
                                    {cap.name} - {(Number(cap.costOctas) / 100_000_000).toFixed(3)} APT
                                </option>
                            ))}
                        </select>
                    </CardContent>
                </Card>
            )}

            {/* Schema Tabs */}
            <Tabs defaultValue="input" className="w-full">
                <TabsList className="grid w-full grid-cols-4">
                    <TabsTrigger value="input">Input Schema</TabsTrigger>
                    <TabsTrigger value="output">Output Schema</TabsTrigger>
                    <TabsTrigger value="examples">Examples</TabsTrigger>
                    <TabsTrigger value="errors">Error Cases</TabsTrigger>
                </TabsList>

                {/* Input Schema Tab */}
                <TabsContent value="input" className="space-y-4">
                    <Card className="bg-blue-500/5 border-blue-500/20">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Code2 className="w-5 h-5 text-blue-400" />
                                Input Parameters
                            </CardTitle>
                            <CardDescription>
                                Required and optional parameters for {capability.name}
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="border-b border-white/10">
                                            <th className="text-left py-3 px-4 text-muted-foreground font-medium">Parameter</th>
                                            <th className="text-left py-3 px-4 text-muted-foreground font-medium">Type</th>
                                            <th className="text-left py-3 px-4 text-muted-foreground font-medium">Required</th>
                                            <th className="text-left py-3 px-4 text-muted-foreground font-medium">Constraints</th>
                                            <th className="text-left py-3 px-4 text-muted-foreground font-medium">Example</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {capability.inputParameters.map((param, idx) => (
                                            <tr key={idx} className="border-b border-white/5 hover:bg-white/5">
                                                <td className="py-3 px-4">
                                                    <code className="text-cyan-400 font-mono">{param.name}</code>
                                                </td>
                                                <td className="py-3 px-4">
                                                    <Badge variant="outline" className="font-mono text-xs">
                                                        {formatType(param)}
                                                    </Badge>
                                                </td>
                                                <td className="py-3 px-4">
                                                    {param.required ? (
                                                        <Badge className="bg-red-500/20 text-red-400 border-red-500/30">Required</Badge>
                                                    ) : (
                                                        <Badge className="bg-gray-500/20 text-gray-400 border-gray-500/30">Optional</Badge>
                                                    )}
                                                </td>
                                                <td className="py-3 px-4 text-muted-foreground text-xs">
                                                    {formatConstraints(param).join(', ') || '-'}
                                                </td>
                                                <td className="py-3 px-4">
                                                    <code className="text-xs bg-black/50 px-2 py-1 rounded">
                                                        {JSON.stringify(param.example)}
                                                    </code>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Description for each parameter */}
                    <Card className="bg-black/40 border-white/10">
                        <CardHeader>
                            <CardTitle className="text-base">Parameter Descriptions</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            {capability.inputParameters.map((param, idx) => (
                                <div key={idx} className="pb-3 border-b border-white/5 last:border-0">
                                    <p className="font-mono text-sm text-cyan-400 mb-1">{param.name}</p>
                                    <p className="text-sm text-muted-foreground">{param.description}</p>
                                </div>
                            ))}
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Output Schema Tab */}
                <TabsContent value="output" className="space-y-4">
                    <Card className="bg-green-500/5 border-green-500/20">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Info className="w-5 h-5 text-green-400" />
                                Output Schema
                            </CardTitle>
                            <CardDescription>
                                Expected response structure from {capability.name}
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="bg-black/50 p-4 rounded border border-white/10">
                                <pre className="text-xs text-green-400 font-mono overflow-x-auto">
                                    {JSON.stringify(capability.outputSchema, null, 2)}
                                </pre>
                            </div>
                            <Button
                                size="sm"
                                variant="outline"
                                onClick={() => copyToClipboard(JSON.stringify(capability.outputSchema, null, 2), 'output-schema')}
                                className="mt-3 gap-2"
                            >
                                {copiedId === 'output-schema' ? (
                                    <>
                                        <Check className="w-3 h-3" />
                                        Copied!
                                    </>
                                ) : (
                                    <>
                                        <Copy className="w-3 h-3" />
                                        Copy Schema
                                    </>
                                )}
                            </Button>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Examples Tab */}
                <TabsContent value="examples" className="space-y-4">
                    {capability.examples && capability.examples.length > 0 ? (
                        capability.examples.map((example, idx) => (
                            <Card key={idx} className="bg-purple-500/5 border-purple-500/20">
                                <CardHeader>
                                    <CardTitle className="text-base">Example {idx + 1}: {example.description}</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    {/* Input Example */}
                                    <div>
                                        <p className="text-sm font-semibold mb-2 text-blue-400">Request:</p>
                                        <div className="bg-black/50 p-4 rounded border border-white/10">
                                            <pre className="text-xs text-cyan-400 font-mono overflow-x-auto">
                                                {JSON.stringify(example.input, null, 2)}
                                            </pre>
                                        </div>
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            onClick={() => copyToClipboard(JSON.stringify(example.input, null, 2), `ex-input-${idx}`)}
                                            className="mt-2 gap-2"
                                        >
                                            {copiedId === `ex-input-${idx}` ? (
                                                <>
                                                    <Check className="w-3 h-3" />
                                                    Copied!
                                                </>
                                            ) : (
                                                <>
                                                    <Copy className="w-3 h-3" />
                                                    Copy
                                                </>
                                            )}
                                        </Button>
                                    </div>

                                    {/* Output Example */}
                                    <div>
                                        <p className="text-sm font-semibold mb-2 text-green-400">Response:</p>
                                        <div className="bg-black/50 p-4 rounded border border-white/10">
                                            <pre className="text-xs text-green-400 font-mono overflow-x-auto">
                                                {JSON.stringify(example.output, null, 2)}
                                            </pre>
                                        </div>
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            onClick={() => copyToClipboard(JSON.stringify(example.output, null, 2), `ex-output-${idx}`)}
                                            className="mt-2 gap-2"
                                        >
                                            {copiedId === `ex-output-${idx}` ? (
                                                <>
                                                    <Check className="w-3 h-3" />
                                                    Copied!
                                                </>
                                            ) : (
                                                <>
                                                    <Copy className="w-3 h-3" />
                                                    Copy
                                                </>
                                            )}
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        ))
                    ) : (
                        <Card className="bg-black/40 border-white/10">
                            <CardContent className="pt-6 text-center text-muted-foreground">
                                <p>No examples available for this capability.</p>
                            </CardContent>
                        </Card>
                    )}
                </TabsContent>

                {/* Error Cases Tab */}
                <TabsContent value="errors" className="space-y-4">
                    {capability.errorCases && capability.errorCases.length > 0 ? (
                        capability.errorCases.map((errorCase, idx) => (
                            <Card key={idx} className="bg-red-500/5 border-red-500/20">
                                <CardContent className="pt-6">
                                    <div className="flex items-start gap-3">
                                        <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                                        <div className="flex-1">
                                            <p className="font-mono text-sm text-red-400 mb-2">{errorCase.error}</p>
                                            <div className="space-y-2 text-sm">
                                                <div>
                                                    <span className="text-muted-foreground">Cause: </span>
                                                    <span>{errorCase.cause}</span>
                                                </div>
                                                <div>
                                                    <span className="text-muted-foreground">Solution: </span>
                                                    <span className="text-green-400">{errorCase.solution}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))
                    ) : (
                        <Card className="bg-black/40 border-white/10">
                            <CardContent className="pt-6 text-center text-muted-foreground">
                                <p>No documented error cases for this capability.</p>
                            </CardContent>
                        </Card>
                    )}
                </TabsContent>
            </Tabs>

            {/* Performance Info */}
            <Card className="bg-yellow-500/5 border-yellow-500/20">
                <CardHeader>
                    <CardTitle className="text-base">Performance & Limits</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                            <p className="text-muted-foreground mb-1">Cost</p>
                            <p className="font-bold text-green-400">
                                {(Number(capability.costOctas) / 100_000_000).toFixed(4)} APT
                            </p>
                        </div>
                        <div>
                            <p className="text-muted-foreground mb-1">Avg. Execution</p>
                            <p className="font-semibold">
                                {capability.executionTimeMs?.average ? `${capability.executionTimeMs.average}ms` : 'N/A'}
                            </p>
                        </div>
                        <div>
                            <p className="text-muted-foreground mb-1">Timeout</p>
                            <p className="font-semibold">{capability.timeoutMs}ms</p>
                        </div>
                        <div>
                            <p className="text-muted-foreground mb-1">Max Input Size</p>
                            <p className="font-semibold">{capability.maxInputSize} bytes</p>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
