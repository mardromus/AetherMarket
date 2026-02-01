'use client';

import { AlertCircle, Wrench, HelpCircle } from 'lucide-react';

export default function TroubleshootingPage() {
  const issues = [
    {
      title: "Payment Verification Failed",
      category: "payment",
      symptoms: "Error message: 'Payment verification failed' or 'Invalid signature'",
      solutions: [
        "Check that your wallet has sufficient APT balance",
        "Ensure you're using the correct network (testnet vs mainnet)",
        "Try creating a new session - the previous one may have expired",
        "Clear browser cache and localStorage",
        "Check that Aptos network is accessible"
      ],
      logs: "Look for 'waitForTransaction timeout' in console"
    },
    {
      title: "Insufficient Balance",
      category: "payment",
      symptoms: "Error: 'Insufficient balance' when trying to execute agent",
      solutions: [
        "Check your account balance on the dashboard",
        "Request testnet APT from the Aptos faucet",
        "Verify the agent's cost (hover over agent name)",
        "Ensure budget is set to at least agent cost + 0.01 APT for fees"
      ],
      logs: "Transaction rejected by blockchain"
    },
    {
      title: "Session Expired",
      category: "auth",
      symptoms: "Error: 'Session expired' or 'Invalid session'",
      solutions: [
        "Create a new delegation session",
        "Increase session expiry time (default 24 hours)",
        "Check that your computer clock is synchronized",
        "Try logging out and logging back in"
      ],
      logs: "Check session creation timestamp"
    },
    {
      title: "Authentication Failed",
      category: "auth",
      symptoms: "Cannot login or 'Authentication failed' error",
      solutions: [
        "Ensure Google is reachable in your region",
        "Clear browser cookies and cache",
        "Try in an incognito/private window",
        "Check that you're using a supported browser",
        "Verify that JavaScript is enabled"
      ],
      logs: "Check browser console for CORS or network errors"
    },
    {
      title: "Agent Not Found",
      category: "agents",
      symptoms: "Error: 'Agent not found' or '404'",
      solutions: [
        "Verify the agent ID is correct",
        "Check that the agent is published on the marketplace",
        "Refresh the agents list",
        "Try searching by capability instead",
        "Ensure the agent is available in your region/network"
      ],
      logs: "Check agent discovery API response"
    },
    {
      title: "Agent Execution Timeout",
      category: "agents",
      symptoms: "Request takes too long or times out",
      solutions: [
        "Some agents may take longer (especially image generation)",
        "Increase timeout in your client (default 30 seconds)",
        "Check the agent's status on the dashboard",
        "Try a simpler request first",
        "Contact agent provider if consistently timing out"
      ],
      logs: "Look for 'request timeout' in logs"
    },
    {
      title: "API Rate Limit Exceeded",
      category: "api",
      symptoms: "Error: '429 Too Many Requests'",
      solutions: [
        "Reduce the frequency of requests",
        "Wait a few minutes before retrying",
        "Increase request batching if possible",
        "Consider upgrading to higher rate limit tier"
      ],
      logs: "Check 'Retry-After' header for wait time"
    },
    {
      title: "Network Connection Error",
      category: "network",
      symptoms: "Error: 'Cannot connect to server' or 'Network error'",
      solutions: [
        "Check your internet connection",
        "Verify the server is accessible",
        "Try a different network (WiFi vs mobile)",
        "Check if your firewall blocks the connection",
        "Try accessing via VPN if blocked in your region"
      ],
      logs: "Check CORS headers in browser network tab"
    },
    {
      title: "Wallet Connection Issues",
      category: "wallet",
      symptoms: "Cannot connect wallet or 'Wallet not detected'",
      solutions: [
        "Install Aptos Wallet extension or use Keyless (Google)",
        "Ensure wallet extension is enabled",
        "Try refreshing the page",
        "Clear wallet cache if using installed extension",
        "Try a different wallet option"
      ],
      logs: "Check browser console for wallet provider errors"
    },
    {
      title: "OpenAI API Key Error",
      category: "config",
      symptoms: "Error: 'OPENAI_API_KEY not configured'",
      solutions: [
        "Add OPENAI_API_KEY to .env.local file",
        "Verify the key is valid (doesn't expire)",
        "Check that key has correct permissions",
        "Restart development server after updating .env.local",
        "Ensure no extra spaces around the key"
      ],
      logs: "Check server startup logs for configuration errors"
    }
  ];

  const categories = ["all", "payment", "auth", "agents", "api", "network", "wallet", "config"];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white">
      {/* Header */}
      <div className="border-b border-slate-800 bg-slate-900/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center gap-3 mb-4">
            <HelpCircle className="w-8 h-8 text-red-400" />
            <h1 className="text-4xl font-bold">Troubleshooting Guide</h1>
          </div>
          <p className="text-slate-300">Solutions to common issues</p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Quick Help */}
        <section className="mb-12">
          <div className="bg-blue-900/20 border border-blue-800 rounded-lg p-8">
            <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
              <AlertCircle className="w-6 h-6 text-blue-400" />
              Quick Troubleshooting
            </h2>
            <ol className="space-y-3 text-slate-300">
              <li className="flex items-start gap-3">
                <span className="font-bold text-blue-400 flex-shrink-0">1.</span>
                <span>Check the error message carefully - it often indicates the issue</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="font-bold text-blue-400 flex-shrink-0">2.</span>
                <span>Open browser console (F12) and look for error details</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="font-bold text-blue-400 flex-shrink-0">3.</span>
                <span>Search for your error below or use Ctrl+F</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="font-bold text-blue-400 flex-shrink-0">4.</span>
                <span>Follow the solutions step by step</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="font-bold text-blue-400 flex-shrink-0">5.</span>
                <span>If problem persists, check logs section</span>
              </li>
            </ol>
          </div>
        </section>

        {/* Issues Grid */}
        <section>
          <h2 className="text-3xl font-bold mb-8">🔧 Common Issues</h2>

          <div className="space-y-6">
            {issues.map((issue, index) => (
              <div key={index} className="bg-slate-800/50 border border-slate-700 rounded-lg p-8 hover:border-red-400/50 transition-colors">
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <h3 className="text-xl font-bold text-red-300">{issue.title}</h3>
                  <span className="px-3 py-1 bg-slate-700/50 text-slate-300 rounded-full text-xs font-mono">
                    {issue.category}
                  </span>
                </div>

                {/* Symptoms */}
                <div className="mb-6 p-4 bg-slate-900/30 border border-slate-700 rounded">
                  <p className="text-sm text-slate-400 font-semibold mb-2">What does it look like?</p>
                  <p className="text-slate-300">{issue.symptoms}</p>
                </div>

                {/* Solutions */}
                <div className="mb-6">
                  <p className="text-sm text-slate-400 font-semibold mb-3 flex items-center gap-2">
                    <Wrench className="w-4 h-4 text-green-400" />
                    Solutions to Try
                  </p>
                  <ol className="space-y-2">
                    {issue.solutions.map((solution, i) => (
                      <li key={i} className="flex items-start gap-3 text-slate-300">
                        <span className="text-green-400 font-bold flex-shrink-0">{i + 1}.</span>
                        <span>{solution}</span>
                      </li>
                    ))}
                  </ol>
                </div>

                {/* Logs */}
                <div className="p-3 bg-slate-900/50 border border-slate-700 rounded">
                  <p className="text-xs text-slate-400 mb-2">Debug Info:</p>
                  <p className="text-xs text-slate-400 font-mono">{issue.logs}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Additional Help */}
        <section className="mt-16">
          <h2 className="text-3xl font-bold mb-8">📚 Additional Resources</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6">
              <h3 className="font-bold text-blue-300 mb-4">Browser Console</h3>
              <p className="text-slate-300 text-sm mb-3">
                Press <code className="bg-slate-900 px-2 py-1 rounded">F12</code> to open developer tools:
              </p>
              <ul className="space-y-2 text-slate-300 text-sm">
                <li>• Click "Console" tab for error messages</li>
                <li>• Look for red error messages</li>
                <li>• Copy full error text</li>
                <li>• Check "Network" tab for API errors</li>
              </ul>
            </div>

            <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6">
              <h3 className="font-bold text-blue-300 mb-4">Check Status</h3>
              <p className="text-slate-300 text-sm mb-3">
                Before troubleshooting, verify:
              </p>
              <ul className="space-y-2 text-slate-300 text-sm">
                <li>• Internet connection working</li>
                <li>• Browser is up to date</li>
                <li>• JavaScript is enabled</li>
                <li>• Not in incognito mode (if issues)</li>
              </ul>
            </div>

            <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6">
              <h3 className="font-bold text-green-300 mb-4">Server Logs</h3>
              <p className="text-slate-300 text-sm mb-3">
                For development issues:
              </p>
              <ul className="space-y-2 text-slate-300 text-sm">
                <li>• Check terminal where dev server runs</li>
                <li>• Look for build errors</li>
                <li>• Check for missing environment variables</li>
                <li>• Verify API connections</li>
              </ul>
            </div>

            <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6">
              <h3 className="font-bold text-green-300 mb-4">Environment Setup</h3>
              <p className="text-slate-300 text-sm mb-3">
                Verify your .env.local:
              </p>
              <ul className="space-y-2 text-slate-300 text-sm">
                <li>• OPENAI_API_KEY set correctly</li>
                <li>• NEXT_PUBLIC_APTOS_NETWORK set</li>
                <li>• No extra spaces around values</li>
                <li>• Run: npm install after changes</li>
              </ul>
            </div>
          </div>
        </section>

        {/* Reset Steps */}
        <div className="mt-12 bg-orange-900/20 border border-orange-800 rounded-lg p-8">
          <h3 className="text-2xl font-bold mb-6 text-orange-300">🔄 If Nothing Works - Reset Steps</h3>
          <ol className="space-y-4">
            <li className="flex items-start gap-4">
              <span className="w-8 h-8 bg-orange-500/20 border border-orange-500 rounded-full flex items-center justify-center font-bold text-orange-400 flex-shrink-0">1</span>
              <div>
                <p className="font-semibold text-slate-300">Clear Browser Cache</p>
                <p className="text-sm text-slate-400">Ctrl+Shift+Del (Windows) or Cmd+Shift+Del (Mac)</p>
              </div>
            </li>
            <li className="flex items-start gap-4">
              <span className="w-8 h-8 bg-orange-500/20 border border-orange-500 rounded-full flex items-center justify-center font-bold text-orange-400 flex-shrink-0">2</span>
              <div>
                <p className="font-semibold text-slate-300">Clear Local Storage</p>
                <p className="text-sm text-slate-400">In console: localStorage.clear() then refresh</p>
              </div>
            </li>
            <li className="flex items-start gap-4">
              <span className="w-8 h-8 bg-orange-500/20 border border-orange-500 rounded-full flex items-center justify-center font-bold text-orange-400 flex-shrink-0">3</span>
              <div>
                <p className="font-semibold text-slate-300">Logout & Login Again</p>
                <p className="text-sm text-slate-400">Disconnect wallet and reconnect fresh</p>
              </div>
            </li>
            <li className="flex items-start gap-4">
              <span className="w-8 h-8 bg-orange-500/20 border border-orange-500 rounded-full flex items-center justify-center font-bold text-orange-400 flex-shrink-0">4</span>
              <div>
                <p className="font-semibold text-slate-300">Restart Dev Server</p>
                <p className="text-sm text-slate-400">Kill with Ctrl+C and run: npm run dev</p>
              </div>
            </li>
            <li className="flex items-start gap-4">
              <span className="w-8 h-8 bg-orange-500/20 border border-orange-500 rounded-full flex items-center justify-center font-bold text-orange-400 flex-shrink-0">5</span>
              <div>
                <p className="font-semibold text-slate-300">Try Fresh Install</p>
                <p className="text-sm text-slate-400">rm -rf node_modules && npm install</p>
              </div>
            </li>
          </ol>
        </div>
      </div>
    </div>
  );
}
