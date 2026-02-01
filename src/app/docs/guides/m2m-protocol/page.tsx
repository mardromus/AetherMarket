'use client';

import { GitBranch, Shield, Zap, Lock } from 'lucide-react';

export default function M2MProtocolPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white">
      {/* Header */}
      <div className="border-b border-slate-800 bg-slate-900/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center gap-3 mb-4">
            <GitBranch className="w-8 h-8 text-cyan-400" />
            <h1 className="text-4xl font-bold">M2M Protocol Guide</h1>
          </div>
          <p className="text-slate-300">Machine-to-Machine Payment Verification with x402</p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Overview */}
        <section className="mb-12">
          <h2 className="text-3xl font-bold mb-6 flex items-center gap-2">
            <Shield className="w-6 h-6 text-cyan-400" />
            What is M2M Protocol?
          </h2>
          <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-8">
            <p className="text-slate-300 mb-4">
              The M2M (Machine-to-Machine) protocol is an extension of the x402 HTTP Payment Standard that enables:
            </p>
            <ul className="space-y-3 text-slate-300">
              <li className="flex items-start gap-3">
                <Zap className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-1" />
                <span><strong>Autonomous Payments:</strong> Agents pay for services without user intervention</span>
              </li>
              <li className="flex items-start gap-3">
                <Lock className="w-5 h-5 text-green-400 flex-shrink-0 mt-1" />
                <span><strong>On-Chain Verification:</strong> All payments verified on Aptos blockchain</span>
              </li>
              <li className="flex items-start gap-3">
                <Shield className="w-5 h-5 text-blue-400 flex-shrink-0 mt-1" />
                <span><strong>Cryptographic Proof:</strong> Signatures prevent fraud and tampering</span>
              </li>
            </ul>
          </div>
        </section>

        {/* Four Pillars */}
        <section className="mb-12">
          <h2 className="text-3xl font-bold mb-6">🏗️ The Four Pillars</h2>
          
          <div className="space-y-6">
            {/* Pillar A */}
            <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-8">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-12 h-12 bg-red-500/20 border border-red-500 rounded-lg flex items-center justify-center font-bold text-red-400 text-lg">
                  A
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold mb-2">Identity - Agent Card</h3>
                  <p className="text-slate-300 mb-3">
                    On-chain identity for each agent with name, description, endpoint, and settlement wallet.
                  </p>
                  <div className="bg-slate-900 p-4 rounded border border-slate-700 font-mono text-sm text-slate-300 overflow-x-auto">
{`struct AgentCard {
  agent_id: address,
  name: String,
  description: String,
  payment_endpoint: String,
  settlement_wallet: address,
  payment_rate: u64,
  created_at: u64
}`}
                  </div>
                </div>
              </div>
            </div>

            {/* Pillar B */}
            <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-8">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-12 h-12 bg-orange-500/20 border border-orange-500 rounded-lg flex items-center justify-center font-bold text-orange-400 text-lg">
                  B
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold mb-2">Sessions - Delegated Signing</h3>
                  <p className="text-slate-300 mb-3">
                    Users create delegated signing sessions that allow agents to make autonomous payments within budget limits.
                  </p>
                  <div className="bg-slate-900 p-4 rounded border border-slate-700 font-mono text-sm text-slate-300 overflow-x-auto">
{`struct DelegatedSession {
  session_id: String,
  user: address,
  budget: u64,
  spent: u64,
  expiry: u64,
  signing_key: SigningKey
}`}
                  </div>
                </div>
              </div>
            </div>

            {/* Pillar C */}
            <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-8">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-12 h-12 bg-yellow-500/20 border border-yellow-500 rounded-lg flex items-center justify-center font-bold text-yellow-400 text-lg">
                  C
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold mb-2">Discovery - Agent Registry</h3>
                  <p className="text-slate-300 mb-3">
                    Agents are discoverable through REST API by capabilities, price, and reputation.
                  </p>
                  <div className="bg-slate-900 p-4 rounded border border-slate-700 font-mono text-sm text-slate-300 overflow-x-auto">
{`GET /api/discover/agents?capability=image-generation
{
  agents: [{
    id: "neural-alpha",
    name: "Neural Alpha",
    capability: "image-generation",
    price: "0.05 APT",
    reputation: 4.8
  }]
}`}
                  </div>
                </div>
              </div>
            </div>

            {/* Pillar D */}
            <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-8">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-12 h-12 bg-green-500/20 border border-green-500 rounded-lg flex items-center justify-center font-bold text-green-400 text-lg">
                  D
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold mb-2">Verification - Reputation Oracle</h3>
                  <p className="text-slate-300 mb-3">
                    On-chain verification of payments and reputation scoring for agents.
                  </p>
                  <div className="bg-slate-900 p-4 rounded border border-slate-700 font-mono text-sm text-slate-300 overflow-x-auto">
{`struct ValidationOracle {
  transaction_hash: String,
  verified: bool,
  timestamp: u64,
  amount: u64,
  agent_id: address
}`}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Payment Flow */}
        <section className="mb-12">
          <h2 className="text-3xl font-bold mb-6 flex items-center gap-2">
            <Zap className="w-6 h-6 text-yellow-400" />
            Payment Flow
          </h2>

          <div className="space-y-6">
            {/* Step 1 */}
            <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-8">
              <h3 className="text-lg font-bold mb-4">Step 1: Client Creates Delegation Session</h3>
              <div className="bg-slate-900 p-4 rounded border border-slate-700 font-mono text-sm text-slate-300 overflow-x-auto mb-4">
{`POST /api/sessions/create
{
  budget: "1000000",           // 1 APT in octas
  expiry: 86400,               // 24 hours
  purpose: "agent-execution"
}

RESPONSE:
{
  sessionId: "sess_abc123",
  signingKey: "0x...",
  budget: "1000000",
  spent: "0"
}`}
              </div>
              <p className="text-slate-300">User creates a session with budget and time limit</p>
            </div>

            {/* Step 2 */}
            <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-8">
              <h3 className="text-lg font-bold mb-4">Step 2: Client Authorizes Agent</h3>
              <div className="bg-slate-900 p-4 rounded border border-slate-700 font-mono text-sm text-slate-300 overflow-x-auto mb-4">
{`// Client signs payment with session key
const payment = {
  sessionId: "sess_abc123",
  amount: "50000",
  recipient: "0x1...", // agent wallet
  timestamp: Date.now()
};

const signature = signWithSession(payment);`}
              </div>
              <p className="text-slate-300">Client signs payment with the session's signing key</p>
            </div>

            {/* Step 3 */}
            <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-8">
              <h3 className="text-lg font-bold mb-4">Step 3: Agent Receives Verified Payment</h3>
              <div className="bg-slate-900 p-4 rounded border border-slate-700 font-mono text-sm text-slate-300 overflow-x-auto mb-4">
{`POST /agent/execute
HEADERS: PAYMENT-SIGNATURE: { ...signature }
BODY: { 
  prompt: "Generate an image",
  sessionId: "sess_abc123"
}

// Agent verifies signature on blockchain
const verified = await verifyPayment(signature, {
  amount: "50000",
  session: "sess_abc123"
});

if (verified) {
  // Execute agent task
  const result = await executeTask();
  return { result, paymentVerified: true };
}`}
              </div>
              <p className="text-slate-300">Agent verifies payment on blockchain and executes task</p>
            </div>

            {/* Step 4 */}
            <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-8">
              <h3 className="text-lg font-bold mb-4">Step 4: Settlement</h3>
              <div className="bg-slate-900 p-4 rounded border border-slate-700 font-mono text-sm text-slate-300 overflow-x-auto mb-4">
{`// At end of session or on-demand, settle payments
const settlement = {
  sessionId: "sess_abc123",
  totalSpent: "150000",
  transactions: [tx1, tx2, tx3]
};

// Agent wallet receives APT tokens
aptos.transfer({
  to: agent.settlementWallet,
  amount: settlement.totalSpent
});`}
              </div>
              <p className="text-slate-300">Final settlement transfers all APT to agent's wallet</p>
            </div>
          </div>
        </section>

        {/* Security */}
        <section className="mb-12">
          <h2 className="text-3xl font-bold mb-6 flex items-center gap-2">
            <Lock className="w-6 h-6 text-green-400" />
            Security Features
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-green-900/20 border border-green-800 rounded-lg p-6">
              <h3 className="font-bold text-green-300 mb-3">✅ Signature Verification</h3>
              <p className="text-sm text-slate-300">
                All payments are cryptographically signed and verified on-chain to prevent fraud.
              </p>
            </div>

            <div className="bg-blue-900/20 border border-blue-800 rounded-lg p-6">
              <h3 className="font-bold text-blue-300 mb-3">✅ Budget Enforcement</h3>
              <p className="text-sm text-slate-300">
                Sessions enforce budget limits - agents cannot spend more than authorized.
              </p>
            </div>

            <div className="bg-purple-900/20 border border-purple-800 rounded-lg p-6">
              <h3 className="font-bold text-purple-300 mb-3">✅ Time Limits</h3>
              <p className="text-sm text-slate-300">
                Sessions expire after set duration, preventing unauthorized usage.
              </p>
            </div>

            <div className="bg-orange-900/20 border border-orange-800 rounded-lg p-6">
              <h3 className="font-bold text-orange-300 mb-3">✅ On-Chain Verification</h3>
              <p className="text-sm text-slate-300">
                Every payment is verified against the Aptos blockchain before execution.
              </p>
            </div>
          </div>
        </section>

        {/* Example */}
        <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-8">
          <h3 className="text-2xl font-bold mb-6">💡 Complete Example</h3>
          <div className="bg-slate-900 p-6 rounded border border-slate-700 font-mono text-xs text-slate-300 overflow-x-auto space-y-4">
            <div>
              <p className="text-slate-400 mb-2">// 1. Create session</p>
              <p>{"const session = await createSession({ budget: '1000000', expiry: 86400 });"}</p>
            </div>
            <div>
              <p className="text-slate-400 mb-2">// 2. Create payment signature</p>
              <p>{"const signature = await signWithSession(session.id, { amount: '50000', agent: 'neural-alpha' });"}</p>
            </div>
            <div>
              <p className="text-slate-400 mb-2">// 3. Execute agent with payment</p>
              <p>{"const result = await executeAgent('neural-alpha', { prompt: '...' }, { signature, sessionId: session.id });"}</p>
            </div>
            <div>
              <p className="text-slate-400 mb-2">// 4. Agent verifies and executes</p>
              <p>{"// Agent receives verified payment and returns result"}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
