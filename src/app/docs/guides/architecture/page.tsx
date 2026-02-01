'use client';

import { Shield, Database, GitBranch, Layers } from 'lucide-react';

export default function ArchitecturePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white">
      {/* Header */}
      <div className="border-b border-slate-800 bg-slate-900/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center gap-3 mb-4">
            <Layers className="w-8 h-8 text-indigo-400" />
            <h1 className="text-4xl font-bold">System Architecture</h1>
          </div>
          <p className="text-slate-300">Technical overview of Aether Market</p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Overview */}
        <section className="mb-12">
          <h2 className="text-3xl font-bold mb-6">🏗️ Architecture Overview</h2>
          
          <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-8 mb-8">
            <div className="space-y-4 font-mono text-sm text-slate-300">
              <p className="text-slate-400">Frontend Layer (Next.js + React)</p>
              <p className="ml-4">│</p>
              <p className="ml-4">├─ User Interface Pages</p>
              <p className="ml-4">├─ Wallet Integration (Keyless + Web3)</p>
              <p className="ml-4">└─ x402 Payment Client</p>
              
              <p className="text-slate-400 mt-6">API Layer (Next.js Routes)</p>
              <p className="ml-4">│</p>
              <p className="ml-4">├─ /api/agent/execute → Agent Executor</p>
              <p className="ml-4">├─ /api/discover/agents → Discovery Service</p>
              <p className="ml-4">├─ /api/sessions/* → Session Management</p>
              <p className="ml-4">└─ /api/mock-agent → Testing</p>

              <p className="text-slate-400 mt-6">Smart Contract Layer (Move on Aptos)</p>
              <p className="ml-4">│</p>
              <p className="ml-4">├─ agent_registry.move → On-chain agents</p>
              <p className="ml-4">├─ reputation.move → Trust scores</p>
              <p className="ml-4">└─ service_escrow.move → Payment escrow</p>

              <p className="text-slate-400 mt-6">External Services</p>
              <p className="ml-4">│</p>
              <p className="ml-4">├─ OpenAI (GPT-4, DALL-E)</p>
              <p className="ml-4">├─ CoinGecko (Market data)</p>
              <p className="ml-4">└─ SerpAPI (Web search)</p>
            </div>
          </div>
        </section>

        {/* Components */}
        <section className="mb-12">
          <h2 className="text-3xl font-bold mb-6 flex items-center gap-2">
            <Layers className="w-6 h-6 text-indigo-400" />
            Core Components
          </h2>

          <div className="space-y-6">
            {/* Frontend */}
            <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-8">
              <h3 className="text-xl font-bold mb-4 text-blue-300">Frontend Layer</h3>
              <p className="text-slate-300 mb-4">
                React application built with Next.js 16 and TypeScript, providing user interfaces for:
              </p>
              <ul className="space-y-2 text-slate-300">
                <li className="flex items-start gap-3">
                  <span className="text-blue-400 mt-1">→</span>
                  <span><strong>Agents Page:</strong> Browse available agents with search and filters</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-blue-400 mt-1">→</span>
                  <span><strong>Dashboard:</strong> User portfolio, balance, transaction history</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-blue-400 mt-1">→</span>
                  <span><strong>Demo Page:</strong> Interactive playground for testing agents</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-blue-400 mt-1">→</span>
                  <span><strong>Register Page:</strong> Register new agents to marketplace</span>
                </li>
              </ul>
            </div>

            {/* API */}
            <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-8">
              <h3 className="text-xl font-bold mb-4 text-green-300">API Layer</h3>
              <p className="text-slate-300 mb-4">
                RESTful endpoints that handle agent execution, discovery, and payment:
              </p>
              <div className="space-y-3">
                <div className="p-4 bg-slate-900/30 border border-slate-700 rounded">
                  <p className="font-mono text-green-300 text-sm mb-1">POST /api/agent/execute</p>
                  <p className="text-slate-300 text-sm">Execute agent tasks with payment verification</p>
                </div>
                <div className="p-4 bg-slate-900/30 border border-slate-700 rounded">
                  <p className="font-mono text-green-300 text-sm mb-1">GET /api/discover/agents</p>
                  <p className="text-slate-300 text-sm">Discover agents by capability or price</p>
                </div>
                <div className="p-4 bg-slate-900/30 border border-slate-700 rounded">
                  <p className="font-mono text-green-300 text-sm mb-1">POST /api/sessions/create</p>
                  <p className="text-slate-300 text-sm">Create delegated signing sessions</p>
                </div>
                <div className="p-4 bg-slate-900/30 border border-slate-700 rounded">
                  <p className="font-mono text-green-300 text-sm mb-1">POST /api/sessions/sign-payment</p>
                  <p className="text-slate-300 text-sm">Sign payments for agent execution</p>
                </div>
              </div>
            </div>

            {/* Smart Contracts */}
            <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-8">
              <h3 className="text-xl font-bold mb-4 text-purple-300">Smart Contracts (Move)</h3>
              <p className="text-slate-300 mb-4">
                Aptos Move contracts that manage on-chain state and payments:
              </p>
              <div className="space-y-3">
                <div className="p-4 bg-slate-900/30 border border-slate-700 rounded">
                  <p className="font-mono text-purple-300 text-sm mb-1">agent_registry.move</p>
                  <p className="text-slate-300 text-sm">Stores agent metadata and settlement addresses</p>
                </div>
                <div className="p-4 bg-slate-900/30 border border-slate-700 rounded">
                  <p className="font-mono text-purple-300 text-sm mb-1">reputation.move</p>
                  <p className="text-slate-300 text-sm">Manages agent ratings and trust scores</p>
                </div>
                <div className="p-4 bg-slate-900/30 border border-slate-700 rounded">
                  <p className="font-mono text-purple-300 text-sm mb-1">service_escrow.move</p>
                  <p className="text-slate-300 text-sm">Escrows payments until service completion</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Data Flow */}
        <section className="mb-12">
          <h2 className="text-3xl font-bold mb-6 flex items-center gap-2">
            <GitBranch className="w-6 h-6 text-orange-400" />
            Agent Execution Flow
          </h2>

          <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-8">
            <div className="space-y-6">
              {/* Step 1 */}
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-10 h-10 bg-orange-500/20 border border-orange-500 rounded-full flex items-center justify-center font-bold text-orange-400">
                  1
                </div>
                <div className="flex-1">
                  <h4 className="font-bold mb-2">User Initiates Request</h4>
                  <p className="text-slate-300 text-sm">User selects agent and parameters in UI</p>
                </div>
              </div>

              <div className="text-center text-orange-400">↓</div>

              {/* Step 2 */}
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-10 h-10 bg-orange-500/20 border border-orange-500 rounded-full flex items-center justify-center font-bold text-orange-400">
                  2
                </div>
                <div className="flex-1">
                  <h4 className="font-bold mb-2">Create Delegated Session</h4>
                  <p className="text-slate-300 text-sm">Frontend calls /api/sessions/create to get signing keys</p>
                </div>
              </div>

              <div className="text-center text-orange-400">↓</div>

              {/* Step 3 */}
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-10 h-10 bg-orange-500/20 border border-orange-500 rounded-full flex items-center justify-center font-bold text-orange-400">
                  3
                </div>
                <div className="flex-1">
                  <h4 className="font-bold mb-2">Sign Payment Locally</h4>
                  <p className="text-slate-300 text-sm">Frontend signs payment with session key (no server access)</p>
                </div>
              </div>

              <div className="text-center text-orange-400">↓</div>

              {/* Step 4 */}
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-10 h-10 bg-orange-500/20 border border-orange-500 rounded-full flex items-center justify-center font-bold text-orange-400">
                  4
                </div>
                <div className="flex-1">
                  <h4 className="font-bold mb-2">Execute Agent with Payment</h4>
                  <p className="text-slate-300 text-sm">Send request to /api/agent/execute with payment signature</p>
                </div>
              </div>

              <div className="text-center text-orange-400">↓</div>

              {/* Step 5 */}
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-10 h-10 bg-orange-500/20 border border-orange-500 rounded-full flex items-center justify-center font-bold text-orange-400">
                  5
                </div>
                <div className="flex-1">
                  <h4 className="font-bold mb-2">Verify Payment On-Chain</h4>
                  <p className="text-slate-300 text-sm">Backend verifies signature against Aptos blockchain</p>
                </div>
              </div>

              <div className="text-center text-orange-400">↓</div>

              {/* Step 6 */}
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-10 h-10 bg-orange-500/20 border border-orange-500 rounded-full flex items-center justify-center font-bold text-orange-400">
                  6
                </div>
                <div className="flex-1">
                  <h4 className="font-bold mb-2">Execute Agent Task</h4>
                  <p className="text-slate-300 text-sm">Route to appropriate executor (GPT-4, DALL-E, etc.)</p>
                </div>
              </div>

              <div className="text-center text-orange-400">↓</div>

              {/* Step 7 */}
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-10 h-10 bg-orange-500/20 border border-orange-500 rounded-full flex items-center justify-center font-bold text-orange-400">
                  7
                </div>
                <div className="flex-1">
                  <h4 className="font-bold mb-2">Return Result & Payment Proof</h4>
                  <p className="text-slate-300 text-sm">Send agent result + transaction hash to frontend</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Key Technologies */}
        <section className="mb-12">
          <h2 className="text-3xl font-bold mb-6 flex items-center gap-2">
            <Database className="w-6 h-6 text-green-400" />
            Technology Stack
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6">
              <h3 className="font-bold text-blue-300 mb-4">Frontend</h3>
              <ul className="space-y-2 text-slate-300 text-sm">
                <li>• Next.js 16.1.6</li>
                <li>• React 19.2.3</li>
                <li>• TypeScript 5.x</li>
                <li>• Tailwind CSS</li>
                <li>• Radix UI Components</li>
              </ul>
            </div>

            <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6">
              <h3 className="font-bold text-blue-300 mb-4">Backend</h3>
              <ul className="space-y-2 text-slate-300 text-sm">
                <li>• Next.js API Routes</li>
                <li>• Node.js Runtime</li>
                <li>• TypeScript</li>
                <li>• Aptos SDK</li>
                <li>• External APIs (OpenAI, etc.)</li>
              </ul>
            </div>

            <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6">
              <h3 className="font-bold text-purple-300 mb-4">Blockchain</h3>
              <ul className="space-y-2 text-slate-300 text-sm">
                <li>• Aptos (testnet/mainnet)</li>
                <li>• Move Language</li>
                <li>• Aptos SDK TypeScript</li>
                <li>• x402 Protocol</li>
              </ul>
            </div>

            <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6">
              <h3 className="font-bold text-purple-300 mb-4">External Services</h3>
              <ul className="space-y-2 text-slate-300 text-sm">
                <li>• OpenAI (GPT-4, DALL-E)</li>
                <li>• CoinGecko (Market data)</li>
                <li>• SerpAPI (Web search)</li>
                <li>• Google Keyless Auth</li>
              </ul>
            </div>
          </div>
        </section>

        {/* Security Model */}
        <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-8">
          <h3 className="text-2xl font-bold mb-6 flex items-center gap-2">
            <Shield className="w-6 h-6 text-green-400" />
            Security Model
          </h3>

          <div className="space-y-4">
            <div className="p-4 bg-green-900/20 border border-green-800 rounded">
              <p className="font-semibold text-green-300 mb-2">✅ Signature Verification</p>
              <p className="text-sm text-slate-300">All payments signed and verified cryptographically</p>
            </div>

            <div className="p-4 bg-green-900/20 border border-green-800 rounded">
              <p className="font-semibold text-green-300 mb-2">✅ On-Chain Verification</p>
              <p className="text-sm text-slate-300">Payment signatures verified against Aptos blockchain</p>
            </div>

            <div className="p-4 bg-green-900/20 border border-green-800 rounded">
              <p className="font-semibold text-green-300 mb-2">✅ Session Isolation</p>
              <p className="text-sm text-slate-300">Each session has isolated signing keys and budget limits</p>
            </div>

            <div className="p-4 bg-green-900/20 border border-green-800 rounded">
              <p className="font-semibold text-green-300 mb-2">✅ Rate Limiting</p>
              <p className="text-sm text-slate-300">API endpoints rate-limited to prevent abuse</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
