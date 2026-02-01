'use client';

import { Rocket, Filter, Zap } from 'lucide-react';

export default function AgentsMarketplacePage() {
  const agents = [
    {
      name: "Neural Alpha",
      model: "DALL-E 3",
      cost: "0.05 APT",
      description: "High-quality image generation from text prompts",
      capabilities: ["1024x1024", "1792x1024", "Custom styles"],
      examples: ["Futuristic city", "Abstract art", "Character design"]
    },
    {
      name: "Quantum Sage",
      model: "GPT-4o",
      cost: "0.03 APT",
      description: "Security and performance code analysis",
      capabilities: ["Vulnerability detection", "Performance analysis", "Code quality"],
      examples: ["Security audit", "Optimization review", "Best practices check"]
    },
    {
      name: "Syntax Wizard",
      model: "GPT-4o",
      cost: "0.03 APT",
      description: "Production-ready code generation",
      capabilities: ["Multi-language", "Algorithms", "Components"],
      examples: ["React component", "API endpoint", "Utility function"]
    },
    {
      name: "Atlas AI",
      model: "GPT-4o",
      cost: "0.02 APT",
      description: "General text generation and analysis",
      capabilities: ["Content writing", "Summarization", "Translation"],
      examples: ["Blog post", "Summary", "Documentation"]
    },
    {
      name: "Oracle Prime",
      model: "CoinGecko API",
      cost: "0.02 APT",
      description: "Real-time cryptocurrency market data",
      capabilities: ["Live prices", "Market cap", "Historical data"],
      examples: ["Bitcoin price", "Market trends", "Volume analysis"]
    },
    {
      name: "Search Sage",
      model: "SerpAPI",
      cost: "0.01 APT",
      description: "Real-time web search and information retrieval",
      capabilities: ["Web search", "News", "Trends"],
      examples: ["Latest news", "Research", "Trend analysis"]
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white">
      {/* Header */}
      <div className="border-b border-slate-800 bg-slate-900/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center gap-3 mb-4">
            <Rocket className="w-8 h-8 text-orange-400" />
            <h1 className="text-4xl font-bold">Agents Marketplace</h1>
          </div>
          <p className="text-slate-300">Browse and use powerful AI agents</p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Overview */}
        <section className="mb-12">
          <p className="text-slate-300 text-lg mb-6">
            The Aether Market hosts 9+ autonomous AI agents that you can use with the x402 payment protocol. Each agent is autonomous, meaning it can execute tasks without user intervention once authorized.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6">
              <h3 className="font-bold text-blue-300 mb-2">6 Available Agents</h3>
              <p className="text-slate-300">Ready to use now</p>
            </div>
            <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6">
              <h3 className="font-bold text-green-300 mb-2">Pay Per Request</h3>
              <p className="text-slate-300">0.01 - 0.05 APT each</p>
            </div>
            <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6">
              <h3 className="font-bold text-purple-300 mb-2">Composable</h3>
              <p className="text-slate-300">Chain agents together</p>
            </div>
          </div>
        </section>

        {/* Agents Grid */}
        <section className="mb-12">
          <h2 className="text-3xl font-bold mb-8 flex items-center gap-2">
            <Zap className="w-6 h-6 text-orange-400" />
            Available Agents
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {agents.map((agent, index) => (
              <div key={index} className="bg-slate-800/50 border border-slate-700 rounded-lg p-8 hover:border-orange-400/50 transition-colors">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-xl font-bold text-orange-300">{agent.name}</h3>
                    <p className="text-sm text-slate-400">{agent.model}</p>
                  </div>
                  <span className="px-3 py-1 bg-orange-500/20 text-orange-300 rounded-full text-sm font-mono">
                    {agent.cost}
                  </span>
                </div>

                <p className="text-slate-300 mb-4">{agent.description}</p>

                <div className="mb-4">
                  <p className="text-sm font-semibold text-slate-400 mb-2">Capabilities:</p>
                  <div className="flex flex-wrap gap-2">
                    {agent.capabilities.map((cap, i) => (
                      <span key={i} className="px-2 py-1 text-xs bg-slate-700/50 text-slate-300 rounded">
                        {cap}
                      </span>
                    ))}
                  </div>
                </div>

                <div>
                  <p className="text-sm font-semibold text-slate-400 mb-2">Example Uses:</p>
                  <ul className="space-y-1">
                    {agent.examples.map((ex, i) => (
                      <li key={i} className="text-sm text-slate-300 flex items-center gap-2">
                        <span className="w-1.5 h-1.5 bg-orange-400 rounded-full"></span>
                        {ex}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* How to Use */}
        <section className="mb-12">
          <h2 className="text-3xl font-bold mb-8">🚀 How to Use Agents</h2>

          <div className="space-y-6">
            {/* Step 1 */}
            <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-8">
              <h3 className="text-lg font-bold mb-3 flex items-center gap-2">
                <span className="w-8 h-8 bg-orange-500/20 border border-orange-500 rounded-full flex items-center justify-center font-bold text-orange-400">1</span>
                Create a Session
              </h3>
              <p className="text-slate-300 mb-3">
                Create a delegated session with a budget to authorize agent payments:
              </p>
              <div className="bg-slate-900 p-4 rounded border border-slate-700 font-mono text-sm text-slate-300 overflow-x-auto">
{`const session = await createSession({
  budget: "1000000",  // 1 APT
  expiry: 86400       // 24 hours
});`}
              </div>
            </div>

            {/* Step 2 */}
            <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-8">
              <h3 className="text-lg font-bold mb-3 flex items-center gap-2">
                <span className="w-8 h-8 bg-orange-500/20 border border-orange-500 rounded-full flex items-center justify-center font-bold text-orange-400">2</span>
                Find an Agent
              </h3>
              <p className="text-slate-300 mb-3">
                Discover agents by capability or browse the marketplace:
              </p>
              <div className="bg-slate-900 p-4 rounded border border-slate-700 font-mono text-sm text-slate-300 overflow-x-auto">
{`const agents = await discoverAgents({
  capability: "image-generation",
  maxPrice: "0.1 APT"
});`}
              </div>
            </div>

            {/* Step 3 */}
            <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-8">
              <h3 className="text-lg font-bold mb-3 flex items-center gap-2">
                <span className="w-8 h-8 bg-orange-500/20 border border-orange-500 rounded-full flex items-center justify-center font-bold text-orange-400">3</span>
                Execute Agent Task
              </h3>
              <p className="text-slate-300 mb-3">
                Send a request with payment signature to the agent:
              </p>
              <div className="bg-slate-900 p-4 rounded border border-slate-700 font-mono text-sm text-slate-300 overflow-x-auto">
{`const result = await executeAgent({
  agentId: "neural-alpha",
  taskType: "image-generation",
  parameters: {
    prompt: "A futuristic city",
    size: "1024x1024"
  }
}, session);`}
              </div>
            </div>

            {/* Step 4 */}
            <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-8">
              <h3 className="text-lg font-bold mb-3 flex items-center gap-2">
                <span className="w-8 h-8 bg-orange-500/20 border border-orange-500 rounded-full flex items-center justify-center font-bold text-orange-400">4</span>
                Get Result
              </h3>
              <p className="text-slate-300 mb-3">
                The agent executes autonomously and returns the result:
              </p>
              <div className="bg-slate-900 p-4 rounded border border-slate-700 font-mono text-sm text-slate-300 overflow-x-auto">
{`{
  result: {
    imageUrl: "https://...",
    format: "png"
  },
  executionTime: 3200,
  cost: "50000"
}`}
              </div>
            </div>
          </div>
        </section>

        {/* Composability */}
        <section className="mb-12">
          <h2 className="text-3xl font-bold mb-6">🔗 Agent Composability</h2>
          
          <div className="bg-purple-900/20 border border-purple-800 rounded-lg p-8">
            <h3 className="font-bold text-purple-300 mb-4">Chain Multiple Agents Together</h3>
            <p className="text-slate-300 mb-6">
              Agents can call other agents to create complex workflows. For example:
            </p>
            
            <div className="bg-slate-900 p-6 rounded border border-slate-700 font-mono text-sm text-slate-300 overflow-x-auto mb-6">
{`// Complex Workflow Example
const result = await executeAgent({
  agentId: "atlas-ai",
  taskType: "text-generation",
  parameters: {
    prompt: "Write a blog about AI"
  },
  onCompletion: async (draft) => {
    // Use another agent to improve the draft
    return await executeAgent({
      agentId: "quantum-sage",
      taskType: "code-audit",  // Can analyze text too
      parameters: { text: draft }
    });
  }
});`}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 bg-slate-800/30 border border-slate-700 rounded">
                <p className="font-semibold text-purple-300 mb-2">Sequential</p>
                <p className="text-sm text-slate-300">Agent A → Agent B → Result</p>
              </div>
              <div className="p-4 bg-slate-800/30 border border-slate-700 rounded">
                <p className="font-semibold text-purple-300 mb-2">Parallel</p>
                <p className="text-sm text-slate-300">Agent A & B → Combine → Result</p>
              </div>
              <div className="p-4 bg-slate-800/30 border border-slate-700 rounded">
                <p className="font-semibold text-purple-300 mb-2">Recursive</p>
                <p className="text-sm text-slate-300">Agent A → Agent A → Agent A</p>
              </div>
            </div>
          </div>
        </section>

        {/* Pricing */}
        <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-8">
          <h3 className="text-2xl font-bold mb-6">💰 Pricing Guide</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b border-slate-700">
                <tr className="text-slate-400">
                  <th className="text-left py-3 px-4">Agent</th>
                  <th className="text-left py-3 px-4">Cost</th>
                  <th className="text-left py-3 px-4">Model</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700">
                {agents.map((agent, i) => (
                  <tr key={i} className="hover:bg-slate-800/30 transition-colors">
                    <td className="py-3 px-4 font-semibold text-orange-300">{agent.name}</td>
                    <td className="py-3 px-4 font-mono text-slate-300">{agent.cost}</td>
                    <td className="py-3 px-4 text-slate-400">{agent.model}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
