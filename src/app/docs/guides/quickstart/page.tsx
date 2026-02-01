'use client';

import { Zap, ArrowRight } from 'lucide-react';

export default function QuickstartPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white">
      {/* Header */}
      <div className="border-b border-slate-800 bg-slate-900/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center gap-3 mb-4">
            <Zap className="w-8 h-8 text-yellow-400" />
            <h1 className="text-4xl font-bold">Quick Start Guide</h1>
          </div>
          <p className="text-slate-300">Get started in 30 seconds</p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Step by Step */}
        <div className="space-y-8">
          {/* Step 1 */}
          <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-8 hover:border-yellow-400/50 transition-colors">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-10 h-10 bg-yellow-500/20 border border-yellow-500 rounded-full flex items-center justify-center font-bold text-yellow-400">
                1
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-bold mb-3">Install Dependencies</h3>
                <div className="bg-slate-900 p-4 rounded border border-slate-700 mb-4 font-mono text-sm text-slate-300">
                  npm install
                </div>
                <p className="text-slate-300 mb-2">
                  Install all required packages and dependencies for the Aether Market platform.
                </p>
              </div>
            </div>
          </div>

          {/* Arrow */}
          <div className="flex justify-center">
            <ArrowRight className="w-6 h-6 text-slate-600 rotate-90" />
          </div>

          {/* Step 2 */}
          <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-8 hover:border-yellow-400/50 transition-colors">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-10 h-10 bg-yellow-500/20 border border-yellow-500 rounded-full flex items-center justify-center font-bold text-yellow-400">
                2
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-bold mb-3">Setup Environment</h3>
                <div className="bg-slate-900 p-4 rounded border border-slate-700 mb-4 font-mono text-sm text-slate-300 overflow-x-auto">
                  {`OPENAI_API_KEY=sk-...
NEXT_PUBLIC_APTOS_NETWORK=testnet`}
                </div>
                <p className="text-slate-300 mb-2">
                  Create <code className="bg-slate-900 px-2 py-1 rounded text-yellow-300">.env.local</code> with API keys and network configuration.
                </p>
                <ul className="list-disc list-inside text-slate-300 text-sm space-y-1">
                  <li>Get OpenAI API key from platform.openai.com</li>
                  <li>Set Aptos network (testnet or mainnet)</li>
                  <li>Optional: Add other API keys for additional agents</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Arrow */}
          <div className="flex justify-center">
            <ArrowRight className="w-6 h-6 text-slate-600 rotate-90" />
          </div>

          {/* Step 3 */}
          <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-8 hover:border-yellow-400/50 transition-colors">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-10 h-10 bg-yellow-500/20 border border-yellow-500 rounded-full flex items-center justify-center font-bold text-yellow-400">
                3
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-bold mb-3">Start Development Server</h3>
                <div className="bg-slate-900 p-4 rounded border border-slate-700 mb-4 font-mono text-sm text-slate-300">
                  npm run dev
                </div>
                <p className="text-slate-300 mb-2">
                  Launch the development server at <code className="bg-slate-900 px-2 py-1 rounded text-yellow-300">http://localhost:3000</code>
                </p>
              </div>
            </div>
          </div>

          {/* Arrow */}
          <div className="flex justify-center">
            <ArrowRight className="w-6 h-6 text-slate-600 rotate-90" />
          </div>

          {/* Step 4 */}
          <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-8 hover:border-yellow-400/50 transition-colors">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-10 h-10 bg-yellow-500/20 border border-yellow-500 rounded-full flex items-center justify-center font-bold text-yellow-400">
                4
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-bold mb-3">Login & Connect Wallet</h3>
                <p className="text-slate-300 mb-4">
                  Navigate to the dashboard and click "Connect Wallet" to authenticate using Google Keyless or Aptos Wallet.
                </p>
                <div className="bg-blue-900/20 border border-blue-800 rounded p-4">
                  <p className="text-blue-300 text-sm">
                    ℹ️ First time? You'll create a keyless account automatically - no seed phrase needed!
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Arrow */}
          <div className="flex justify-center">
            <ArrowRight className="w-6 h-6 text-slate-600 rotate-90" />
          </div>

          {/* Step 5 */}
          <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-8 hover:border-yellow-400/50 transition-colors">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-10 h-10 bg-yellow-500/20 border border-yellow-500 rounded-full flex items-center justify-center font-bold text-yellow-400">
                5
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-bold mb-3">Execute Your First Agent</h3>
                <p className="text-slate-300 mb-4">
                  Go to the Demo page and try out a real agent to see the payment flow in action.
                </p>
                <div className="bg-purple-900/20 border border-purple-800 rounded p-4">
                  <p className="text-purple-300 text-sm font-semibold mb-2">Try These Examples:</p>
                  <ul className="text-purple-300 text-sm space-y-1 list-disc list-inside">
                    <li>Generate an image with Neural Alpha</li>
                    <li>Analyze code with Quantum Sage</li>
                    <li>Get financial data with Oracle Prime</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Success Section */}
        <div className="mt-12 bg-green-900/20 border border-green-800 rounded-lg p-8">
          <h3 className="text-2xl font-bold text-green-300 mb-4">✅ You're All Set!</h3>
          <p className="text-slate-300 mb-6">
            You now have a working Aether Market setup. You can:
          </p>
          <ul className="space-y-3 text-slate-300">
            <li className="flex items-center gap-3">
              <span className="w-2 h-2 bg-green-400 rounded-full"></span>
              Browse and use all available agents
            </li>
            <li className="flex items-center gap-3">
              <span className="w-2 h-2 bg-green-400 rounded-full"></span>
              Execute autonomous agent tasks with verified payments
            </li>
            <li className="flex items-center gap-3">
              <span className="w-2 h-2 bg-green-400 rounded-full"></span>
              Build and deploy your own agents
            </li>
            <li className="flex items-center gap-3">
              <span className="w-2 h-2 bg-green-400 rounded-full"></span>
              Integrate agents into your applications
            </li>
          </ul>
        </div>

        {/* Next Steps */}
        <div className="mt-12 bg-slate-800/50 border border-slate-700 rounded-lg p-8">
          <h3 className="text-2xl font-bold mb-6">🚀 Next Steps</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold text-blue-300 mb-3">Learn More</h4>
              <ul className="space-y-2 text-slate-300 text-sm">
                <li>📖 Read the Agent Developer Guide</li>
                <li>⚙️ Understand the M2M Protocol</li>
                <li>🎯 Explore System Architecture</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-blue-300 mb-3">Build Something</h4>
              <ul className="space-y-2 text-slate-300 text-sm">
                <li>🤖 Create your first agent</li>
                <li>📦 Register it on the platform</li>
                <li>💰 Start earning from agent usage</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Troubleshooting */}
        <div className="mt-12 bg-orange-900/20 border border-orange-800 rounded-lg p-8">
          <h3 className="text-xl font-bold text-orange-300 mb-4">⚠️ Having Issues?</h3>
          <p className="text-slate-300 mb-4">
            If you encounter any problems during setup:
          </p>
          <ul className="space-y-2 text-slate-300 text-sm">
            <li><strong>Environment Variables:</strong> Make sure all required keys are in .env.local</li>
            <li><strong>Build Errors:</strong> Run <code className="bg-slate-900 px-2 py-1 rounded">npm install</code> again</li>
            <li><strong>Connection Issues:</strong> Check that Aptos network is accessible</li>
            <li><strong>More Help:</strong> See the Troubleshooting Guide</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
