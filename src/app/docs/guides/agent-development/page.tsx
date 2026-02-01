'use client';

import { Code2, FileCode, Layers, Zap, Plus, Check } from 'lucide-react';

export default function AgentDevelopmentPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white">
      {/* Header */}
      <div className="border-b border-slate-800 bg-slate-900/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center gap-3 mb-4">
            <Code2 className="w-8 h-8 text-purple-400" />
            <h1 className="text-4xl font-bold">Agent Development Guide</h1>
          </div>
          <p className="text-slate-300">Build autonomous AI agents on the Aether Market</p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Overview */}
        <section className="mb-12">
          <h2 className="text-3xl font-bold mb-6 flex items-center gap-2">
            <Zap className="w-6 h-6 text-purple-400" />
            What is an Agent?
          </h2>
          <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-8 space-y-4">
            <p className="text-slate-300">
              An agent is an autonomous AI service that can be called over HTTP with the x402 payment protocol. Users pay per request, and your agent receives the payment in APT tokens.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 bg-purple-900/20 border border-purple-800 rounded">
                <p className="text-purple-300 font-semibold mb-2">✨ Key Features</p>
                <ul className="text-sm text-slate-300 space-y-1">
                  <li>• Autonomous execution</li>
                  <li>• Per-request payments</li>
                  <li>• On-chain verification</li>
                  <li>• Composable with other agents</li>
                </ul>
              </div>
              <div className="p-4 bg-blue-900/20 border border-blue-800 rounded">
                <p className="text-blue-300 font-semibold mb-2">💡 Examples</p>
                <ul className="text-sm text-slate-300 space-y-1">
                  <li>• Image generation</li>
                  <li>• Code analysis</li>
                  <li>• Data processing</li>
                  <li>• Financial analysis</li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* Development Steps */}
        <section className="mb-12">
          <h2 className="text-3xl font-bold mb-6 flex items-center gap-2">
            <FileCode className="w-6 h-6 text-purple-400" />
            Development Workflow
          </h2>
          
          <div className="space-y-6">
            {/* Step 1 */}
            <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-8">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-10 h-10 bg-purple-500/20 border border-purple-500 rounded-full flex items-center justify-center font-bold text-purple-400">
                  1
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold mb-3">Create Agent Service</h3>
                  <p className="text-slate-300 mb-4">
                    Build your HTTP endpoint that accepts requests and returns responses:
                  </p>
                  <div className="bg-slate-900 p-4 rounded border border-slate-700 font-mono text-sm text-slate-300 overflow-x-auto">
{`// server.ts
import express from 'express';

const app = express();

app.post('/execute', async (req, res) => {
  const { prompt } = req.body;
  
  // Your AI logic here
  const result = await processWithAI(prompt);
  
  res.json({
    success: true,
    result: result,
    executionTime: Date.now()
  });
});

app.listen(3001);`}
                  </div>
                </div>
              </div>
            </div>

            {/* Step 2 */}
            <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-8">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-10 h-10 bg-purple-500/20 border border-purple-500 rounded-full flex items-center justify-center font-bold text-purple-400">
                  2
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold mb-3">Create Agent Manifest</h3>
                  <p className="text-slate-300 mb-4">
                    Define your agent's capabilities and metadata:
                  </p>
                  <div className="bg-slate-900 p-4 rounded border border-slate-700 font-mono text-sm text-slate-300 overflow-x-auto">
{`{
  "version": "1.0.0",
  "name": "Image Generator",
  "description": "Generate images from text",
  "capabilities": [{
    "tag": "image-generation",
    "input_schema": {
      "prompt": "string",
      "size": "1024x1024"
    },
    "output_schema": {
      "imageUrl": "string",
      "format": "png"
    }
  }],
  "payment": {
    "protocol": "x402",
    "rate_per_request": "0.05 APT"
  }
}`}
                  </div>
                </div>
              </div>
            </div>

            {/* Step 3 */}
            <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-8">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-10 h-10 bg-purple-500/20 border border-purple-500 rounded-full flex items-center justify-center font-bold text-purple-400">
                  3
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold mb-3">Register on Platform</h3>
                  <p className="text-slate-300 mb-4">
                    Register your agent on the Aether Market:
                  </p>
                  <div className="bg-slate-900 p-4 rounded border border-slate-700 font-mono text-sm text-slate-300 overflow-x-auto">
{`POST /api/register-agent
{
  "name": "Image Generator",
  "description": "...",
  "endpoint": "https://your-agent.com/execute",
  "manifestUrl": "https://your-agent.com/manifest.json",
  "paymentRate": "0.05 APT",
  "walletAddress": "0x..."
}`}
                  </div>
                </div>
              </div>
            </div>

            {/* Step 4 */}
            <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-8">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-10 h-10 bg-purple-500/20 border border-purple-500 rounded-full flex items-center justify-center font-bold text-purple-400">
                  4
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold mb-3">Handle x402 Payments</h3>
                  <p className="text-slate-300 mb-4">
                    Verify payment signatures before executing:
                  </p>
                  <div className="bg-slate-900 p-4 rounded border border-slate-700 font-mono text-sm text-slate-300 overflow-x-auto">
{`// Verify payment signature
const paymentSignature = req.headers['payment-signature'];
const verified = await verifyPayment(paymentSignature, {
  amount: '50000', // in octas
  recipient: walletAddress
});

if (!verified) {
  return res.status(402).json({ 
    error: 'Payment required'
  });
}

// Process request
const result = await executeAgent(req.body);
res.json(result);`}
                  </div>
                </div>
              </div>
            </div>

            {/* Step 5 */}
            <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-8">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-10 h-10 bg-purple-500/20 border border-purple-500 rounded-full flex items-center justify-center font-bold text-purple-400">
                  5
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold mb-3">Deploy & Publish</h3>
                  <p className="text-slate-300 mb-4">
                    Deploy your agent to production and publish it to the marketplace:
                  </p>
                  <ul className="space-y-2 text-slate-300">
                    <li>✓ Deploy to reliable hosting (AWS, Google Cloud, etc.)</li>
                    <li>✓ Ensure 99.9% uptime</li>
                    <li>✓ Publish manifest publicly</li>
                    <li>✓ Submit to Aether Market</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Best Practices */}
        <section className="mb-12">
          <h2 className="text-3xl font-bold mb-6 flex items-center gap-2">
            <Check className="w-6 h-6 text-green-400" />
            Best Practices
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-green-900/20 border border-green-800 rounded-lg p-6">
              <h3 className="font-bold text-green-300 mb-3">✅ Performance</h3>
              <ul className="space-y-2 text-slate-300 text-sm">
                <li>• Response under 10 seconds</li>
                <li>• Efficient resource usage</li>
                <li>• Rate limiting implemented</li>
                <li>• Caching where appropriate</li>
              </ul>
            </div>

            <div className="bg-blue-900/20 border border-blue-800 rounded-lg p-6">
              <h3 className="font-bold text-blue-300 mb-3">🔒 Security</h3>
              <ul className="space-y-2 text-slate-300 text-sm">
                <li>• Verify all payments</li>
                <li>• Use HTTPS only</li>
                <li>• Validate all inputs</li>
                <li>• Log all transactions</li>
              </ul>
            </div>

            <div className="bg-purple-900/20 border border-purple-800 rounded-lg p-6">
              <h3 className="font-bold text-purple-300 mb-3">📊 Reliability</h3>
              <ul className="space-y-2 text-slate-300 text-sm">
                <li>• Error handling</li>
                <li>• Retry logic</li>
                <li>• Monitoring & alerts</li>
                <li>• Graceful degradation</li>
              </ul>
            </div>

            <div className="bg-orange-900/20 border border-orange-800 rounded-lg p-6">
              <h3 className="font-bold text-orange-300 mb-3">📝 Documentation</h3>
              <ul className="space-y-2 text-slate-300 text-sm">
                <li>• Clear API docs</li>
                <li>• Examples provided</li>
                <li>• Schema documented</li>
                <li>• Error codes listed</li>
              </ul>
            </div>
          </div>
        </section>

        {/* Agent Examples */}
        <section className="mb-12">
          <h2 className="text-3xl font-bold mb-6 flex items-center gap-2">
            <Plus className="w-6 h-6 text-blue-400" />
            Built-in Agent Examples
          </h2>
          
          <div className="space-y-4">
            {[
              { name: "Neural Alpha", desc: "Generate images with DALL-E 3", cost: "0.05 APT" },
              { name: "Quantum Sage", desc: "Audit code for security issues", cost: "0.03 APT" },
              { name: "Syntax Wizard", desc: "Generate production code", cost: "0.03 APT" },
              { name: "Atlas AI", desc: "General text generation", cost: "0.02 APT" },
              { name: "Search Sage", desc: "Real-time web search", cost: "0.01 APT" }
            ].map((agent, i) => (
              <div key={i} className="p-4 bg-slate-800/30 border border-slate-700 rounded hover:border-blue-400/50 transition-colors">
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="font-bold text-blue-300">{agent.name}</h4>
                    <p className="text-sm text-slate-400">{agent.desc}</p>
                  </div>
                  <span className="text-sm font-mono text-slate-400">{agent.cost}</span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Next Steps */}
        <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-8">
          <h3 className="text-2xl font-bold mb-6">🚀 Ready to Build?</h3>
          <ol className="space-y-3 text-slate-300">
            <li className="flex items-start gap-3">
              <span className="font-bold text-purple-400 flex-shrink-0">1.</span>
              <span>Set up your development environment</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="font-bold text-purple-400 flex-shrink-0">2.</span>
              <span>Build your agent service endpoint</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="font-bold text-purple-400 flex-shrink-0">3.</span>
              <span>Create and test your manifest</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="font-bold text-purple-400 flex-shrink-0">4.</span>
              <span>Register your agent on the platform</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="font-bold text-purple-400 flex-shrink-0">5.</span>
              <span>Deploy to production</span>
            </li>
          </ol>
        </div>
      </div>
    </div>
  );
}
