"use client";

import { useState } from "react";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  Code2, 
  Zap, 
  BookOpen, 
  GitBranch, 
  CheckCircle,
  AlertCircle,
  Copy,
  ExternalLink
} from "lucide-react";

export default function AgentDevelopmentPage() {
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const copyToClipboard = (code: string, id: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(id);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const codeExamples = {
    manifest: `{
  "id": "my-translator",
  "name": "My Translation Agent",
  "author": "Your Name",
  "description": "Translate text between languages",
  "icon": "🌍",
  "model": "gpt-4o",
  "cost": "0.01 APT per request",
  "capabilities": [
    {
      "tag": "translation",
      "description": "Translate text to any language",
      "inputSchema": {
        "text": "string (required)",
        "targetLanguage": "string (required)"
      },
      "outputSchema": {
        "translated": "string",
        "confidence": "number"
      }
    }
  ]
}`,

    implementation: `async function executeTranslation(parameters: any): Promise<any> {
  const { text, targetLanguage } = parameters;

  // Validate
  if (!text || !targetLanguage) {
    throw new Error("text and targetLanguage required");
  }

  // Call OpenAI
  const client = getOpenAIClient();
  const response = await client.chat.completions.create({
    model: "gpt-4o",
    messages: [
      {
        role: "system",
        content: \`Translate to \${targetLanguage}\`
      },
      { role: "user", content: text }
    ]
  });

  return {
    translated: response.choices[0].message.content,
    timestamp: new Date().toISOString()
  };
}`,

    router: `export async function executeAgent(
  agentId: string,
  taskType: string,
  parameters: any
): Promise<AgentExecutionResult> {
  const startTime = Date.now();

  try {
    let result;

    if (agentId === "my-translator" && taskType === "translation") {
      result = await executeTranslation(parameters);
    } else {
      throw new Error(\`Unknown agent: \${agentId}\`);
    }

    return {
      result,
      executionTime: Date.now() - startTime,
      agentId,
      taskType,
      metadata: { success: true }
    };
  } catch (error) {
    return {
      result: { error: error.message },
      executionTime: Date.now() - startTime,
      agentId,
      taskType,
      metadata: { success: false, error: error.message }
    };
  }
}`,

    testing: `import { executeAgent } from "@/lib/agents/executor";

describe("Translation Agent", () => {
  it("should translate text", async () => {
    const result = await executeAgent(
      "my-translator",
      "translation",
      {
        text: "Hello world",
        targetLanguage: "Spanish"
      }
    );

    expect(result.metadata.success).toBe(true);
    expect(result.result.translated).toBeTruthy();
  });

  it("should reject missing params", async () => {
    const result = await executeAgent(
      "my-translator",
      "translation",
      { text: "Hello" }
    );

    expect(result.metadata.success).toBe(false);
  });
});`
  };

  return (
    <div className="min-h-screen bg-black text-white pt-20">
      {/* Hero Section */}
      <section className="border-b border-white/10 px-6 py-12">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-3 mb-4">
            <Code2 className="w-8 h-8 text-purple-400" />
            <h1 className="text-4xl font-bold text-glow">Build Your Own Agents</h1>
          </div>
          <p className="text-lg text-gray-400 mb-6">
            Create autonomous AI agents that earn APT through the x402 payment protocol. Complete guide with code examples.
          </p>
          <div className="flex gap-4">
            <Link href="/docs">
              <Button className="gap-2">
                <BookOpen className="w-4 h-4" />
                Full Documentation
                <ExternalLink className="w-3 h-3" />
              </Button>
            </Link>
            <Link href="/agents">
              <Button variant="outline" className="gap-2">
                View Existing Agents
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Quick Start */}
      <section className="border-b border-white/10 px-6 py-12">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold mb-8 flex items-center gap-2">
            <Zap className="w-6 h-6 text-yellow-400" />
            5-Minute Quick Start
          </h2>

          <div className="space-y-4">
            {[
              {
                step: 1,
                title: "Set Up Environment",
                command: "npm install && cp .env.example .env.local",
                note: "Add OPENAI_API_KEY to .env.local"
              },
              {
                step: 2,
                title: "Create Agent Manifest",
                command: "Add to agents.json",
                note: "Define name, description, capabilities, pricing"
              },
              {
                step: 3,
                title: "Implement Agent Logic",
                command: "Add to src/lib/agents/executor.ts",
                note: "Input validation, API call, error handling"
              },
              {
                step: 4,
                title: "Add Router",
                command: "Update executeAgent() function",
                note: "Route to your agent based on agentId + taskType"
              },
              {
                step: 5,
                title: "Test & Deploy",
                command: "npm test && npm run dev",
                note: "Visit /agents to see your agent live"
              }
            ].map((item) => (
              <Card key={item.step} className="bg-white/5 border-white/10">
                <CardContent className="pt-6">
                  <div className="flex gap-4">
                    <div className="flex-shrink-0">
                      <div className="flex items-center justify-center h-8 w-8 rounded-full bg-purple-500/20 border border-purple-500/40">
                        <span className="font-bold text-purple-400">{item.step}</span>
                      </div>
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-base mb-1">{item.title}</h3>
                      <code className="text-xs bg-black/50 px-3 py-1 rounded border border-white/10 inline-block mb-2">
                        {item.command}
                      </code>
                      <p className="text-xs text-gray-400">{item.note}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Code Examples */}
      <section className="border-b border-white/10 px-6 py-12">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold mb-8 flex items-center gap-2">
            <Code2 className="w-6 h-6 text-cyan-400" />
            Code Examples
          </h2>

          <div className="space-y-6">
            {[
              { key: "manifest", label: "agents.json", title: "Manifest Template" },
              { key: "implementation", label: "executor.ts", title: "Implementation Pattern" },
              { key: "router", label: "executeAgent()", title: "Router Registration" },
              { key: "testing", label: "agents.test.ts", title: "Testing Pattern" }
            ].map(({ key, label, title }) => (
              <Card key={key} className="bg-white/5 border-white/10">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-lg">{title}</CardTitle>
                      <CardDescription className="text-xs text-gray-400 mt-1">File: {label}</CardDescription>
                    </div>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => copyToClipboard(codeExamples[key as keyof typeof codeExamples], key)}
                      className="gap-2"
                    >
                      <Copy className="w-4 h-4" />
                      {copiedCode === key ? "Copied!" : "Copy"}
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <pre className="bg-black/50 p-4 rounded border border-white/10 overflow-x-auto text-xs text-gray-200 max-h-96 overflow-y-auto">
                    {codeExamples[key as keyof typeof codeExamples]}
                  </pre>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Architecture */}
      <section className="border-b border-white/10 px-6 py-12">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold mb-8 flex items-center gap-2">
            <GitBranch className="w-6 h-6 text-green-400" />
            Agent Architecture
          </h2>

          <Card className="bg-white/5 border-white/10 mb-6">
            <CardContent className="pt-6">
              <div className="space-y-4 text-sm">
                <div className="flex gap-4">
                  <div className="text-cyan-400 font-mono min-w-24">User Request</div>
                  <div className="text-gray-400">Sends task parameters to /api/agent/execute</div>
                </div>
                <div className="border-l border-cyan-400/30 ml-12 pl-4 py-2">
                  ↓
                </div>
                <div className="flex gap-4">
                  <div className="text-cyan-400 font-mono min-w-24">402 Payment</div>
                  <div className="text-gray-400">System returns amount to pay + recipient address</div>
                </div>
                <div className="border-l border-cyan-400/30 ml-12 pl-4 py-2">
                  ↓
                </div>
                <div className="flex gap-4">
                  <div className="text-cyan-400 font-mono min-w-24">Payment Signature</div>
                  <div className="text-gray-400">Wallet signs transaction, returns signature header</div>
                </div>
                <div className="border-l border-cyan-400/30 ml-12 pl-4 py-2">
                  ↓
                </div>
                <div className="flex gap-4">
                  <div className="text-cyan-400 font-mono min-w-24">Verify</div>
                  <div className="text-gray-400">Server verifies payment on Aptos blockchain</div>
                </div>
                <div className="border-l border-cyan-400/30 ml-12 pl-4 py-2">
                  ↓
                </div>
                <div className="flex gap-4">
                  <div className="text-cyan-400 font-mono min-w-24">Execute</div>
                  <div className="text-gray-400">Calls your agent logic (API call, LLM, etc.)</div>
                </div>
                <div className="border-l border-cyan-400/30 ml-12 pl-4 py-2">
                  ↓
                </div>
                <div className="flex gap-4">
                  <div className="text-cyan-400 font-mono min-w-24">Result</div>
                  <div className="text-gray-400">Returns result + payment proof to user</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Best Practices */}
      <section className="border-b border-white/10 px-6 py-12">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold mb-8">Best Practices</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="bg-green-500/10 border-green-500/20">
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2 text-green-400">
                  <CheckCircle className="w-5 h-5" />
                  Do This
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-gray-300">
                  <li>✓ Validate inputs early</li>
                  <li>✓ Set 30-second timeouts</li>
                  <li>✓ Handle errors gracefully</li>
                  <li>✓ Cache results when appropriate</li>
                  <li>✓ Test with multiple scenarios</li>
                  <li>✓ Log execution metrics</li>
                  <li>✓ Use TypeScript for safety</li>
                  <li>✓ Document capabilities clearly</li>
                </ul>
              </CardContent>
            </Card>

            <Card className="bg-red-500/10 border-red-500/20">
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2 text-red-400">
                  <AlertCircle className="w-5 h-5" />
                  Avoid This
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-gray-300">
                  <li>✗ Trust user input blindly</li>
                  <li>✗ Make API calls without timeout</li>
                  <li>✗ Expose API keys in errors</li>
                  <li>✗ Accept unlimited input sizes</li>
                  <li>✗ Ignore error cases</li>
                  <li>✗ Skip TypeScript types</li>
                  <li>✗ Deploy without testing</li>
                  <li>✗ Hard-code sensitive data</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Pricing Examples */}
      <section className="border-b border-white/10 px-6 py-12">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold mb-8">Pricing Strategy</h2>

          <div className="overflow-x-auto">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="text-left py-3 px-4 text-gray-400 font-medium">Agent Type</th>
                  <th className="text-left py-3 px-4 text-gray-400 font-medium">API Cost</th>
                  <th className="text-left py-3 px-4 text-gray-400 font-medium">Suggested Price</th>
                  <th className="text-left py-3 px-4 text-gray-400 font-medium">Markup</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { type: "Text Generation (GPT-4)", cost: "~0.005", price: "0.01", markup: "100%" },
                  { type: "Code Generation (GPT-4)", cost: "~0.01", price: "0.03", markup: "200%" },
                  { type: "Image Generation (DALL-E)", cost: "~0.04", price: "0.05", markup: "25%" },
                  { type: "Code Audit (GPT-4)", cost: "~0.015", price: "0.03", markup: "100%" },
                  { type: "Web Search (SerpAPI)", cost: "~0.0005", price: "0.01", markup: "2000%" }
                ].map((row, i) => (
                  <tr key={i} className="border-b border-white/5 hover:bg-white/5">
                    <td className="py-3 px-4 text-white">{row.type}</td>
                    <td className="py-3 px-4 text-gray-400">{row.cost} APT</td>
                    <td className="py-3 px-4"><Badge variant="outline">{row.price} APT</Badge></td>
                    <td className="py-3 px-4 text-gray-400">{row.markup}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <p className="text-xs text-gray-500 mt-4">
            * Markup = (Suggested Price - API Cost) / API Cost. Adjust based on your market research.
          </p>
        </div>
      </section>

      {/* Advanced Topics */}
      <section className="px-6 py-12">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold mb-8">Advanced Topics</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[
              {
                title: "Caching Results",
                description: "Cache agent results with TTL to reduce API calls and improve performance",
                file: "AGENT_DEVELOPER_GUIDE.md#caching-results"
              },
              {
                title: "Rate Limiting",
                description: "Implement per-user rate limits to prevent abuse and control costs",
                file: "AGENT_DEVELOPER_GUIDE.md#rate-limiting"
              },
              {
                title: "Custom Validation",
                description: "Add sophisticated input validation for your specific use cases",
                file: "AGENT_DEVELOPER_GUIDE.md#custom-input-validation"
              },
              {
                title: "Monitoring & Logging",
                description: "Track execution metrics, errors, and performance over time",
                file: "AGENT_DEVELOPER_GUIDE.md#logging-and-monitoring"
              },
              {
                title: "Error Handling",
                description: "Gracefully handle timeouts, API failures, and malformed responses",
                file: "AGENT_DEVELOPER_GUIDE.md#error-handling-best-practices"
              },
              {
                title: "Multi-Agent Workflows",
                description: "Chain multiple agents together for complex tasks",
                file: "M2M_PROTOCOL_GUIDE.md#multi-agent-workflows"
              }
            ].map((topic, i) => (
              <Card key={i} className="bg-white/5 border-white/10 hover:border-purple-500/50 transition-colors">
                <CardHeader>
                  <CardTitle className="text-base text-purple-400">{topic.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-400 mb-4">{topic.description}</p>
                  <Link href={`/${topic.file}`} target="_blank">
                    <Button size="sm" variant="ghost" className="gap-2">
                      Learn More
                      <ExternalLink className="w-3 h-3" />
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="border-t border-white/10 px-6 py-12 bg-white/5">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-2xl font-bold mb-4">Ready to Build?</h2>
          <p className="text-gray-400 mb-8">
            Follow the complete guide with code examples, testing strategies, and best practices.
          </p>
          <div className="flex gap-4 justify-center">
            <Link href="/docs">
              <Button className="gap-2" size="lg">
                <BookOpen className="w-5 h-5" />
                Read Full Developer Guide
              </Button>
            </Link>
            <Link href="/agents">
              <Button variant="outline" size="lg">
                View Live Agents
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
