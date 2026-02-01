# 🚀 Quick Start: Real Agents

## 30-Second Setup

1. **Add API Keys** to `.env.local`:
```bash
# Required
OPENAI_API_KEY=sk-...
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
NEXT_PUBLIC_APTOS_NETWORK=testnet

# Optional
SERP_API_KEY=...
```

2. **Restart dev server**:
```bash
npm run dev
```

3. **Done!** All 7 agents are now live.

---

## Google OAuth Setup (Required for Keyless Auth)

### 1. Create Google Cloud Project
1. Go to https://console.cloud.google.com
2. Create a new project
3. Enable "Google+ API"

### 2. Create OAuth 2.0 Client ID
1. Navigate to "APIs & Services" → "Credentials"
2. Click "Create Credentials" → "OAuth client ID"
3. Application type: **Web application**
4. Authorized JavaScript origins:
   - `http://localhost:3000` (development)
   - `https://your-domain.com` (production)
5. Authorized redirect URIs:
   - `http://localhost:3000/auth/callback` (development)
   - `https://your-domain.com/auth/callback` (production)

### 3. Add to `.env.local`
```bash
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
```

---

## Aptos Testnet Setup (For Testing Payments)

### 1. Install Petra Wallet
1. Download **Petra Aptos Wallet** (Chrome Extension)
2. Create a new wallet
3. Switch to **Testnet** (Settings → Network)

### 2. Get Testnet APT (Faucet)
1. Click **"Faucet"** in Petra to get 1 APT
2. Or visit [Aptos Faucet](https://aptos.dev/network/faucet)

### 3. Test Payment Flow
1. Go to Aether Dashboard
2. Click **Connect Wallet** (top right)
3. Select an agent and click **Execute**
4. Approve the transfer in Petra
5. Agent executes the task on-chain

---

## Try It Out

### Option 1: Visit Agent Marketplace
Go to http://localhost:3000/agents
- Browse all agents
- See pricing and capabilities
- View technical details

### Option 2: Run Interactive Demo
Go to http://localhost:3000/demo
1. Login with Google
2. Create delegation session (10 autonomous payments)
3. Click "Run Full M2M Flow"
4. Watch real AI execution
5. Check browser console for logs

### Option 3: Call Agent API
```bash
curl http://localhost:3000/api/agent/execute \
  -X POST \
  -H "Content-Type: application/json" \
  -d '{
    "agentId": "atlas-ai",
    "taskType": "text-generation",
    "parameters": {
      "prompt": "What is blockchain?"
    }
  }'
```

Response (first request gets 402):
```json
{
  "amount": "20000",
  "recipient": "0x1",
  "requestId": "req-123..."
}
```

---

## 7 Real Agents Available

```
🖼️ Neural Alpha      → Image generation (DALL-E 3)
💻 Quantum Sage      → Code audit (GPT-4)
📊 Oracle Prime      → Market data (CoinGecko)
⚙️ Syntax Wizard     → Code generation (GPT-4)
📝 Atlas AI          → Text generation (GPT-4)
🔍 Search Sage       → Web search (SerpAPI)
😊 Sentiment Bot     → Sentiment analysis (GPT-4)
```

---

## Example: Call Neural Alpha (Image Generation)

```javascript
// In browser console (after logging in at /agents)
const client = new X402Client();
const result = await client.executeAgentTask(
  {
    agentId: "neural-alpha",
    taskType: "image-generation",
    parameters: {
      prompt: "A futuristic city with flying cars"
    },
    maxPrice: "0.1 APT"
  },
  account.address,
  (payload) => signWithSession(payload)
);

console.log(result.result.url); // Image URL
console.log(result.payment);    // Payment proof
```

---

## Example: Code Audit with Quantum Sage

```javascript
const result = await client.executeAgentTask(
  {
    agentId: "quantum-sage",
    taskType: "code-audit",
    parameters: {
      code: `
        function transfer(to, amount) {
          if (balance >= amount) {
            balance -= amount;
            return true;
          }
        }
      `,
      language: "javascript"
    }
  },
  account.address,
  (payload) => signWithSession(payload)
);

console.log(result.result); // Audit report with vulnerabilities
```

---

## Environment Variables

### Required
```bash
OPENAI_API_KEY=sk-...  # Get from https://platform.openai.com
```

### Optional
```bash
SERP_API_KEY=...       # For web search (https://serpapi.com)
```

### Already Set
```bash
NEXT_PUBLIC_APTOS_NETWORK=testnet
```

---

## Flow: Payment → Verification → Execution

```
1. User calls agent    
   ↓
2. Server returns 402 (needs payment)
   ↓
3. Client signs transaction autonomously (NO POPUP!)
   ↓
4. Server verifies payment on-chain
   ↓
5. Agent executes (calls real AI API)
   ↓
6. Result returned with payment proof
```

**Total time**: 1-5 seconds (DALL-E 3 takes longer: 15-30s)

---

## Pricing

All prices in APT per request:

| Agent | Cost | Model |
|-------|------|-------|
| Neural Alpha | 0.05 | DALL-E 3 |
| Quantum Sage | 0.03 | GPT-4o |
| Syntax Wizard | 0.03 | GPT-4o |
| Atlas AI | 0.02 | GPT-4o |
| Oracle Prime | 0.02 | CoinGecko |
| Search Sage | 0.01 | SerpAPI |
| Sentiment Bot | 0.01 | GPT-4o |

---

## Features

✅ Real AI (GPT-4, DALL-E 3, live APIs)
✅ Autonomous (no user popups)
✅ Verified payments (on-chain)
✅ Pay-per-use (no subscriptions)
✅ 7 agents ready to go
✅ Extensible (add more agents easily)

---

## Common Issues & Fixes

**❌ "OPENAI_API_KEY not configured"**
→ Add OPENAI_API_KEY to .env.local and restart

**❌ "Payment verification failed"**
→ Wait a few seconds and retry (transaction latency)

**❌ "Unknown variant index"**
→ Clear localStorage and login again

**❌ "Code is too large"**
→ Max 50KB per audit, split into smaller files

---

## Docs

- **Full Guide**: Read `AGENTS.md`
- **Add New Agent**: Read `ADD_NEW_AGENTS.md`
- **Agent Specs**: Check `agents.json`

---

## Next: Advanced Usage

### Batch Multiple Requests
```javascript
const results = await Promise.all([
  client.executeAgentTask({...}, addr, sign),
  client.executeAgentTask({...}, addr, sign),
  client.executeAgentTask({...}, addr, sign)
]);
```

### Chain Agents
```javascript
// Generate code with Syntax Wizard
const code = await client.executeAgentTask({
  agentId: "syntax-wizard",
  parameters: { prompt: "React component" }
}, addr, sign);

// Audit generated code with Quantum Sage
const audit = await client.executeAgentTask({
  agentId: "quantum-sage",
  parameters: { code: code.result.code, language: "typescript" }
}, addr, sign);
```

### Add Custom Agent
See `ADD_NEW_AGENTS.md` for step-by-step instructions.

---

## Monitoring

Open browser DevTools (F12) and check Console for logs:

```
✅ Keyless account created successfully!
✅ Delegation session created!
🤖 Signing transaction autonomously...
✅ Transaction signed autonomously! Hash: 0x...
✅ Payment verified on-chain ✅
Agent task completed
```

---

**Ready to go!** 🎉

- Visit `/agents` to explore
- Try `/demo` for interactive walkthrough
- Check `AGENTS.md` for full documentation
