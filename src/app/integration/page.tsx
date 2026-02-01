"use client";

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Navbar } from '@/components/Navbar';
import { NetworkBackground } from '@/components/NetworkBackground';
import { Copy, Check, ChevronDown, Code2, BookOpen } from 'lucide-react';
import { toast } from 'sonner';

interface CodeExample {
    title: string;
    language: string;
    code: string;
}

const INTEGRATION_EXAMPLES: Record<string, CodeExample[]> = {
    "neural-alpha": [
        {
            title: "Basic Image Generation",
            language: "typescript",
            code: `import { X402Client } from '@/lib/x402/client';

const client = new X402Client();

// Generate image
const result = await client.executeAgentTask({
    agentId: "neural-alpha",
    taskType: "image-generation",
    parameters: {
        prompt: "A futuristic city with AI agents",
        size: "1024x1024",
        quality: "hd"
    }
});

console.log(result.result.imageUrl);`
        },
        {
            title: "With Budget Control",
            language: "typescript",
            code: `const result = await client.executeAgentTask(
    {
        agentId: "neural-alpha",
        taskType: "image-generation",
        parameters: {
            prompt: "Beautiful landscape",
            size: "1024x1024"
        }
    },
    userAddress,
    (payload) => signWithSession(payload),
    {
        budgetId: "budget-123",
        maxPrice: "0.1" // APT
    }
);`
        }
    ],
    "quantum-sage": [
        {
            title: "Audit JavaScript Code",
            language: "typescript",
            code: `const result = await client.executeAgentTask({
    agentId: "quantum-sage",
    taskType: "code-audit",
    parameters: {
        code: \`
            function process(data) {
                eval(data);
                return data;
            }
        \`,
        language: "javascript",
        focus: ["security", "performance"],
        includeFixes: true
    }
});

console.log("Issues found:", result.result.issues);
console.log("Fixed code:", result.result.fixedCode);`
        },
        {
            title: "Audit Solidity Smart Contract",
            language: "typescript",
            code: `const result = await client.executeAgentTask({
    agentId: "quantum-sage",
    taskType: "code-audit",
    parameters: {
        code: contractSourceCode,
        language: "solidity",
        focus: ["security"],
        includeFixes: false
    }
});

result.result.issues.forEach(issue => {
    if (issue.severity === "critical") {
        console.warn(\`Critical: \${issue.message}\`);
    }
});`
        }
    ],
    "oracle-prime": [
        {
            title: "Get Bitcoin Price",
            language: "typescript",
            code: `const result = await client.executeAgentTask({
    agentId: "oracle-prime",
    taskType: "financial-analysis",
    parameters: {
        symbol: "bitcoin",
        timeframe: "24h"
    }
});

const { price, percentChange24h } = result.result;
console.log(\`BTC: $\${price} (\${percentChange24h}%)\`);`
        },
        {
            title: "Portfolio Analysis",
            language: "typescript",
            code: `async function analyzePortfolio(symbols: string[]) {
    const results = await Promise.all(
        symbols.map(symbol =>
            client.executeAgentTask({
                agentId: "oracle-prime",
                taskType: "financial-analysis",
                parameters: { symbol, timeframe: "7d" }
            })
        )
    );

    return results.map(r => ({
        name: r.result.name,
        price: r.result.price,
        change: r.result.priceChange.percentChange24h
    }));
}`
        }
    ],
    "syntax-wizard": [
        {
            title: "Generate React Component",
            language: "typescript",
            code: `const result = await client.executeAgentTask({
    agentId: "syntax-wizard",
    taskType: "code-generation",
    parameters: {
        prompt: "Create a React component for todo list with add/delete",
        language: "typescript",
        includeComments: true,
        includeTests: false
    }
});

// Use the generated code
eval(result.result.code);`
        },
        {
            title: "Generate Python Function",
            language: "typescript",
            code: `const result = await client.executeAgentTask({
    agentId: "syntax-wizard",
    taskType: "code-generation",
    parameters: {
        prompt: "Create function to calculate fibonacci sequence",
        language: "python",
        includeComments: true,
        includeTests: true
    }
});

console.log("Code:", result.result.code);
console.log("Tests:", result.result.tests);`
        }
    ],
    "atlas-ai": [
        {
            title: "Text Generation",
            language: "typescript",
            code: `const result = await client.executeAgentTask({
    agentId: "atlas-ai",
    taskType: "text-generation",
    parameters: {
        prompt: "Explain quantum computing",
        maxTokens: 1500,
        temperature: 0.7,
        format: "markdown"
    }
});

console.log(result.result.text);
console.log("Tokens used:", result.result.tokensUsed);`
        },
        {
            title: "Content Writing",
            language: "typescript",
            code: `const result = await client.executeAgentTask({
    agentId: "atlas-ai",
    taskType: "text-generation",
    parameters: {
        prompt: "Write a product description for a smartphone",
        maxTokens: 300,
        format: "text"
    }
});

return result.result.text;`
        }
    ],
    "search-sage": [
        {
            title: "Web Search",
            language: "typescript",
            code: `const result = await client.executeAgentTask({
    agentId: "search-sage",
    taskType: "web-search",
    parameters: {
        query: "latest AI developments 2026",
        numResults: 5,
        language: "en"
    }
});

result.result.results.forEach(r => {
    console.log(\`\${r.title}\\n\${r.link}\\n\${r.snippet}\\n\`);
});`
        },
        {
            title: "Research Gathering",
            language: "typescript",
            code: `async function gatherResearch(topic: string) {
    const result = await client.executeAgentTask({
        agentId: "search-sage",
        taskType: "web-search",
        parameters: {
            query: topic,
            numResults: 10
        }
    });

    return result.result.results.map(r => ({
        title: r.title,
        url: r.link,
        summary: r.snippet
    }));
}`
        }
    ],
    "sentiment-bot": [
        {
            title: "Analyze Product Review",
            language: "typescript",
            code: `const result = await client.executeAgentTask({
    agentId: "sentiment-bot",
    taskType: "sentiment-analysis",
    parameters: {
        text: "This product is amazing! Love the quality.",
        includeEmotions: true,
        includeKeyPhrases: true
    }
});

console.log(\`Sentiment: \${result.result.sentiment}\`);
console.log(\`Score: \${result.result.score}\`);
console.log(\`Emotions:\`, result.result.emotions);`
        },
        {
            title: "Batch Analysis",
            language: "typescript",
            code: `async function analyzeReviews(reviews: string[]) {
    const results = await Promise.all(
        reviews.map(text =>
            client.executeAgentTask({
                agentId: "sentiment-bot",
                taskType: "sentiment-analysis",
                parameters: { text, includeEmotions: true }
            })
        )
    );

    const positive = results.filter(r => r.result.sentiment === 'positive').length;
    return \`\${positive}/\${reviews.length} positive reviews\`;
}`
        }
    ]
};

const AGENT_INFO = [
    {
        id: "neural-alpha",
        name: "Neural Alpha",
        model: "DALL-E 3",
        cost: "0.05 APT",
        category: "Image Generation",
        description: "Generate high-quality images from text descriptions",
        inputs: ["prompt (string, required)", "size (1024x1024 | 1792x1024 | 1024x1792)", "quality (standard | hd)"],
        outputs: ["imageUrl", "revisedPrompt", "base64 (optional)"],
        maxInputSize: "4,000 characters"
    },
    {
        id: "quantum-sage",
        name: "Quantum Sage",
        model: "GPT-4o",
        cost: "0.03 APT",
        category: "Code Audit",
        description: "Audit code for security vulnerabilities and performance",
        inputs: ["code (string, required)", "language (js|ts|py|java|cpp|rust|go|sol)", "focus (security|performance|all)", "includeFixes (boolean)"],
        outputs: ["issues[]", "summary", "score", "codeQuality", "fixedCode (optional)"],
        maxInputSize: "50 KB"
    },
    {
        id: "oracle-prime",
        name: "Oracle Prime",
        model: "CoinGecko API",
        cost: "0.02 APT",
        category: "Financial Data",
        description: "Real-time cryptocurrency and market data",
        inputs: ["symbol (string, required)", "timeframe (24h|7d|30d|1y)", "includeHistory (boolean)"],
        outputs: ["price", "priceChange", "market", "analysis"],
        maxInputSize: "500 characters"
    },
    {
        id: "syntax-wizard",
        name: "Syntax Wizard",
        model: "GPT-4o",
        cost: "0.03 APT",
        category: "Code Generation",
        description: "Generate production-ready code from descriptions",
        inputs: ["prompt (string, required)", "language (js|ts|py|java|cpp|rust|go|sol)", "includeComments (boolean)", "includeTests (boolean)"],
        outputs: ["code", "language", "explanation", "tests (optional)", "dependencies[]"],
        maxInputSize: "2,000 characters"
    },
    {
        id: "atlas-ai",
        name: "Atlas AI",
        model: "GPT-4o",
        cost: "0.02 APT",
        category: "Text Generation",
        description: "Generate text, analyze content, solve problems",
        inputs: ["prompt (string, required)", "maxTokens (100-4000)", "temperature (0-1)", "format (text|markdown|json)"],
        outputs: ["text", "tokensUsed", "format"],
        maxInputSize: "4,000 characters"
    },
    {
        id: "search-sage",
        name: "Search Sage",
        model: "SerpAPI",
        cost: "0.01 APT",
        category: "Web Search",
        description: "Search the web and gather real-time information",
        inputs: ["query (string, required)", "numResults (1-10)", "language (string)"],
        outputs: ["query", "results[]", "totalResults"],
        maxInputSize: "500 characters"
    },
    {
        id: "sentiment-bot",
        name: "Sentiment Bot",
        model: "GPT-4o",
        cost: "0.01 APT",
        category: "Sentiment Analysis",
        description: "Analyze sentiment and emotions in text",
        inputs: ["text (string, required)", "includeEmotions (boolean)", "includeKeyPhrases (boolean)"],
        outputs: ["sentiment", "score (0-1)", "confidence", "emotions{}", "keyPhrases[]", "explanation"],
        maxInputSize: "5,000 characters"
    }
];

export default function AgentIntegrationGuide() {
    const [selectedAgent, setSelectedAgent] = useState("neural-alpha");
    const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({});
    const [copiedCode, setCopiedCode] = useState<string | null>(null);

    const agent = AGENT_INFO.find(a => a.id === selectedAgent)!;
    const examples = INTEGRATION_EXAMPLES[selectedAgent] || [];

    const toggleSection = (section: string) => {
        setExpandedSections(prev => ({
            ...prev,
            [section]: !prev[section]
        }));
    };

    const copyToClipboard = (code: string, codeId: string) => {
        navigator.clipboard.writeText(code);
        setCopiedCode(codeId);
        toast.success('Code copied!');
        setTimeout(() => setCopiedCode(null), 2000);
    };

    return (
        <div className="min-h-screen relative text-foreground">
            <NetworkBackground />
            <Navbar />

            <div className="pt-32 px-6 max-w-6xl mx-auto pb-20 relative z-10">
                {/* Header */}
                <div className="mb-8">
                    <div className="flex items-center gap-4 mb-2">
                        <div className="p-3 bg-primary/10 rounded-xl border border-primary/20">
                            <Code2 className="w-8 h-8 text-primary" />
                        </div>
                        <div>
                            <h1 className="text-4xl font-black tracking-tighter">AGENT INTEGRATION GUIDE</h1>
                            <p className="text-muted-foreground font-mono">Complete documentation on calling agents and handling data</p>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-8">
                    {/* Agent Selector */}
                    <div className="lg:col-span-1">
                        <h3 className="font-bold mb-3 text-lg">Select Agent</h3>
                        <div className="space-y-2">
                            {AGENT_INFO.map(a => (
                                <button
                                    key={a.id}
                                    onClick={() => setSelectedAgent(a.id)}
                                    className={`w-full text-left p-3 rounded-lg transition-all border text-sm ${
                                        selectedAgent === a.id
                                            ? 'bg-primary/30 border-primary/60 text-white'
                                            : 'bg-black/40 border-white/10 text-muted-foreground hover:border-white/20'
                                    }`}
                                >
                                    <div className="font-bold">{a.name}</div>
                                    <div className="text-xs text-muted-foreground">{a.cost}</div>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Agent Details */}
                    <div className="lg:col-span-3 space-y-4">
                        {/* Header Card */}
                        <Card className="bg-gradient-to-r from-primary/20 to-primary/5 border-primary/30">
                            <CardContent className="pt-6">
                                <div className="flex justify-between items-start mb-4">
                                    <div>
                                        <h2 className="text-2xl font-bold mb-1">{agent.name}</h2>
                                        <p className="text-muted-foreground">{agent.description}</p>
                                    </div>
                                    <Badge className="bg-primary/20 text-primary border-primary/30">{agent.cost}</Badge>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <p className="text-xs text-muted-foreground mb-1">Model</p>
                                        <p className="font-mono font-bold">{agent.model}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-muted-foreground mb-1">Max Input Size</p>
                                        <p className="font-mono font-bold">{agent.maxInputSize}</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Inputs Section */}
                        <Card className="bg-black/40 border-white/10">
                            <CardHeader className="cursor-pointer" onClick={() => toggleSection('inputs')}>
                                <div className="flex items-center justify-between">
                                    <CardTitle className="text-lg">📥 Input Parameters</CardTitle>
                                    <ChevronDown className={`w-5 h-5 transition-transform ${expandedSections.inputs ? 'rotate-180' : ''}`} />
                                </div>
                            </CardHeader>
                            {expandedSections.inputs && (
                                <CardContent className="space-y-2 border-t border-white/10 pt-4">
                                    {agent.inputs.map((input, idx) => (
                                        <div key={idx} className="p-3 bg-black/50 rounded border border-white/5">
                                            <code className="text-sm text-cyan-400">{input}</code>
                                        </div>
                                    ))}
                                </CardContent>
                            )}
                        </Card>

                        {/* Outputs Section */}
                        <Card className="bg-black/40 border-white/10">
                            <CardHeader className="cursor-pointer" onClick={() => toggleSection('outputs')}>
                                <div className="flex items-center justify-between">
                                    <CardTitle className="text-lg">📤 Output Data</CardTitle>
                                    <ChevronDown className={`w-5 h-5 transition-transform ${expandedSections.outputs ? 'rotate-180' : ''}`} />
                                </div>
                            </CardHeader>
                            {expandedSections.outputs && (
                                <CardContent className="space-y-2 border-t border-white/10 pt-4">
                                    {agent.outputs.map((output, idx) => (
                                        <div key={idx} className="p-3 bg-black/50 rounded border border-white/5">
                                            <code className="text-sm text-green-400">{output}</code>
                                        </div>
                                    ))}
                                </CardContent>
                            )}
                        </Card>
                    </div>
                </div>

                {/* Code Examples */}
                <div className="space-y-4 mb-8">
                    <h2 className="text-2xl font-bold">💻 Code Examples</h2>
                    {examples.map((example, idx) => {
                        const codeId = `${selectedAgent}-${idx}`;
                        return (
                            <Card key={idx} className="bg-black/40 border-white/10">
                                <CardHeader>
                                    <div className="flex justify-between items-center">
                                        <CardTitle className="text-lg">{example.title}</CardTitle>
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            onClick={() => copyToClipboard(example.code, codeId)}
                                            className="gap-2"
                                        >
                                            {copiedCode === codeId ? (
                                                <>
                                                    <Check className="w-4 h-4" />
                                                    Copied
                                                </>
                                            ) : (
                                                <>
                                                    <Copy className="w-4 h-4" />
                                                    Copy
                                                </>
                                            )}
                                        </Button>
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <pre className="bg-black/80 p-4 rounded border border-white/10 overflow-x-auto">
                                        <code className="text-sm text-green-400 font-mono whitespace-pre-wrap">
                                            {example.code}
                                        </code>
                                    </pre>
                                </CardContent>
                            </Card>
                        );
                    })}
                </div>

                {/* Universal Request/Response Format */}
                <Card className="bg-blue-500/5 border-blue-500/20 mb-8">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <BookOpen className="w-5 h-5" />
                            Universal Request Format
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div>
                            <p className="text-sm font-bold mb-2">All agents follow this structure:</p>
                            <pre className="bg-black/50 p-4 rounded border border-white/10 overflow-x-auto">
                                <code className="text-xs text-cyan-400 font-mono">{`{
  "agentId": "string",        // Agent ID (e.g., "neural-alpha")
  "taskType": "string",       // Task type (e.g., "image-generation")
  "parameters": {             // Agent-specific parameters
    // ... varies by agent
  },
  "maxPrice": "0.1",         // Optional: max price in APT
  "budgetId": "budget-123"   // Optional: budget session ID
}`}</code>
                            </pre>
                        </div>
                        <div>
                            <p className="text-sm font-bold mb-2">Response format:</p>
                            <pre className="bg-black/50 p-4 rounded border border-white/10 overflow-x-auto">
                                <code className="text-xs text-green-400 font-mono">{`{
  "success": true,
  "result": {                 // Agent-specific result
    // ... varies by agent
  },
  "executionTime": 2500,      // Milliseconds
  "cost": "50000",            // Octas (0.0005 APT)
  "agentId": "neural-alpha",
  "taskType": "image-generation",
  "error": null               // Only if success: false
}`}</code>
                            </pre>
                        </div>
                    </CardContent>
                </Card>

                {/* Best Practices */}
                <Card className="bg-yellow-500/5 border-yellow-500/20">
                    <CardHeader>
                        <CardTitle>✨ Best Practices</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        <div className="p-3 bg-black/40 rounded border border-white/10">
                            <p className="font-bold text-sm mb-1">1. Always use budgets for repeated calls</p>
                            <p className="text-xs text-muted-foreground">Create a budget session to control spending limits</p>
                        </div>
                        <div className="p-3 bg-black/40 rounded border border-white/10">
                            <p className="font-bold text-sm mb-1">2. Handle errors gracefully</p>
                            <p className="text-xs text-muted-foreground">Check response.success and response.error before using results</p>
                        </div>
                        <div className="p-3 bg-black/40 rounded border border-white/10">
                            <p className="font-bold text-sm mb-1">3. Cache results when possible</p>
                            <p className="text-xs text-muted-foreground">Store results to avoid duplicate executions and costs</p>
                        </div>
                        <div className="p-3 bg-black/40 rounded border border-white/10">
                            <p className="font-bold text-sm mb-1">4. Monitor execution times</p>
                            <p className="text-xs text-muted-foreground">Use executionTime to optimize user experience</p>
                        </div>
                        <div className="p-3 bg-black/40 rounded border border-white/10">
                            <p className="font-bold text-sm mb-1">5. Validate input sizes</p>
                            <p className="text-xs text-muted-foreground">Check that inputs don&apos;t exceed max size limits</p>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
