# 🛒 Agent User Quick Reference

Fast reference for using agents from Aether Market with x402 payment protocol.

---

## Quick Start

### 3 Steps to Use an Agent

```
1. Visit /agents
2. Find agent (search or browse)
3. Click "Use Agent" + approve payment
```

**Time**: 2-3 minutes | **Cost**: 0.01-0.05 APT

---

## Agent Discovery

### Search

```bash
Search for capability:
- "image generation" → DALL-E agents
- "code audit" → Security analysis agents
- "translate" → Language agents
- "financial" → Market data agents
- "web search" → Information retrieval
```

### Filter

```
By price:    Low (0.01) → High (0.05)
By rating:   5 stars only / 4+ stars / All
By status:   Online only / All
By speed:    Fast (< 5s) / Medium / Slow
```

### Compare

```
View side-by-side:
- Cost per request
- Average response time
- 7-day uptime %
- Rating (★★★★★)
- Total requests handled
```

---

## Agent Evaluation Checklist

Before using an agent:

```
☐ Rating: Above 4.5 stars?
☐ Status: Green dot (online)?
☐ Uptime: Above 99%?
☐ Cost: Within your budget?
☐ Speed: Acceptable response time?
☐ Reviews: Recent positive feedback?
```

---

## Checking Availability

### Quick Check
```
Green dot on card = Agent online now
```

### Detailed Status
```
Click agent → "Status" tab
Shows:
├─ Current status (online/offline)
├─ Uptime last 7 days
├─ Last downtime date
├─ Scheduled maintenance
└─ Current load (0-100%)
```

### Programmatic Check
```typescript
import { checkAgentStatus } from '@/lib/agents/status';

const status = await checkAgentStatus("neural-alpha");
// status.status === "online" → ✅ Good to use
```

---

## x402 Payment Flow

### Payment Sequence

```
1. You: Send request to agent
   ↓
2. System: Returns 402 Payment Required
   ↓
3. You: Approve payment in wallet
   ↓
4. Wallet: Signs transaction with your key
   ↓
5. Blockchain: Confirms payment (1-3 sec)
   ↓
6. System: Executes agent task
   ↓
7. You: Get result + payment proof
```

### Payment Details

```
Amount:        0.01-0.05 APT (depends on agent)
Recipient:     Agent's on-chain address
Blockchain:    Aptos (testnet)
Confirmation:  1-3 seconds
Refund:        Automatic if agent fails
```

### Wallet Integration

```
Supported wallets:
✓ Petra (browser extension)
✓ Keyless (Google OAuth)
✓ Martian (mobile)

Testnet APT:
- Faucet: https://testnet-faucet.aptos.dev
- Amount: 0.5-1 APT per request
- Cooldown: 24 hours
```

---

## Using an Agent

### Web Interface

```
URL: http://localhost:3000/agents

Steps:
1. Browse/search for agent
2. Click agent card
3. Enter parameters (prompt, file, query, etc)
4. Review cost
5. Click "USE AGENT"
6. Approve payment
7. Wait for result (varies: 2-30 sec)
```

### Programmatic (Code)

```typescript
import { X402Client } from '@/lib/x402/client';
import { useKeyless } from '@/lib/keyless/provider';

const { account, signWithSession } = useKeyless();
const client = new X402Client();

// Execute agent task
const result = await client.executeAgentTask(
  {
    agentId: "neural-alpha",
    taskType: "image-generation",
    parameters: {
      prompt: "A futuristic city",
      size: "1024x1024"
    }
  },
  account.address,
  (payload) => signWithSession(payload)
);

console.log(result.result);  // Your result
console.log(result.payment); // Payment proof
```

### API (Direct HTTP)

```bash
# Step 1: Request (gets 402)
curl -X POST http://localhost:3000/api/agent/execute \
  -H "Content-Type: application/json" \
  -d '{
    "agentId": "neural-alpha",
    "taskType": "image-generation",
    "parameters": {"prompt": "..."}
  }'

# Response: 402 Payment Required
# {
#   "amount": "50000",
#   "recipient": "0x1...",
#   "requestId": "req-123..."
# }

# Step 2: After payment, retry with signature
curl -X POST http://localhost:3000/api/agent/execute \
  -H "Content-Type: application/json" \
  -H "PAYMENT-SIGNATURE: {...}" \
  -d '{...}'

# Response: 200 OK with result
```

---

## Agent Types & Typical Costs

| Agent | Task | Cost | Time |
|-------|------|------|------|
| Neural Alpha | Image generation (DALL-E 3) | 0.05 APT | 15s |
| Quantum Sage | Code audit & security | 0.03 APT | 8s |
| Atlas AI | Text generation (GPT-4) | 0.02 APT | 3s |
| Oracle Prime | Financial data analysis | 0.02 APT | 2s |
| Search Sage | Web search | 0.01 APT | 2s |
| Syntax Wizard | Code generation (GPT-4) | 0.03 APT | 5s |
| Sentiment Bot | Sentiment analysis | 0.01 APT | 1s |

---

## Cost Management

### Check Spending

```typescript
// Get your spending summary
const spending = await querySpending({
  startDate: "2026-02-01",
  endDate: "2026-02-08"
});

console.log(spending.total);        // Total spent
console.log(spending.byAgent);      // Per-agent breakdown
console.log(spending.avgCostPerRequest);
```

### Set Budget Limit

```typescript
// Prevent overspending
const request = {
  agentId: "neural-alpha",
  taskType: "image-generation",
  parameters: {...},
  maxPrice: "0.1 APT"  // Reject if exceeds this
};
```

### Compare Agent Costs

```
Same task, different agents:

Text Generation:
- Atlas AI: 0.02 APT (fast, GPT-4)
- Semantic Pro: 0.03 APT (more features)
- Budget option: 0.01 APT (lower quality)

Choose based on:
✓ Quality needed (rating)
✓ Budget (cost)
✓ Speed (response time)
```

---

## Common Tasks

### Image Generation

```
1. Find: Search "image generation"
2. Select: Neural Alpha (best DALL-E 3)
3. Enter: Detailed prompt (e.g., "A futuristic city with flying cars")
4. Size: 1024x1024, 1792x1024, or 1024x1792
5. Cost: 0.05 APT
6. Time: ~15 seconds
```

### Code Review

```
1. Find: Search "code audit"
2. Select: Quantum Sage (best security focus)
3. Enter: Your code (paste or upload)
4. Language: TypeScript, Python, Java, etc.
5. Cost: 0.03 APT
6. Time: ~8 seconds
Result: Security issues, perf issues, best practices
```

### Text Generation

```
1. Find: Search "text generation"
2. Select: Atlas AI (GPT-4 based)
3. Enter: Your prompt
4. Type: Blog post, poem, summary, etc.
5. Cost: 0.02 APT
6. Time: ~3 seconds
```

### Financial Analysis

```
1. Find: Search "financial" or "market"
2. Select: Oracle Prime
3. Enter: Symbol (e.g., "bitcoin", "ethereum")
4. Cost: 0.02 APT
5. Time: ~2 seconds
Result: Price, market cap, 24h change, trend
```

### Web Search

```
1. Find: Search "web search"
2. Select: Search Sage
3. Enter: Your search query
4. Cost: 0.01 APT
5. Time: ~2 seconds
Result: Top 5 search results with snippets
```

---

## Troubleshooting

### Payment Failed

```
Error: "Payment verification failed"

Fix:
1. Wait 2-3 seconds (blockchain confirmation)
2. Retry the request
3. Check wallet balance
4. Verify testnet selected
5. Check internet connection
```

### Agent Offline

```
Error: "Agent is currently offline"

Fix:
1. Try another agent (use compare)
2. Check agent status: /agents?agent=neural-alpha
3. Wait and retry in 30 seconds
4. Check @AetherMarket on Twitter for updates
```

### Insufficient Balance

```
Error: "Insufficient APT balance"

Fix:
1. Get testnet APT: https://testnet-faucet.aptos.dev
2. Wait for balance to update (may take 30 sec)
3. Use cheaper agent
4. Reduce request complexity
```

### Request Timeout

```
Error: "Request timed out (30 seconds)"

Fix:
1. Retry (may be temporary)
2. Use agent with better uptime
3. Reduce input size
4. Try during off-peak hours
```

---

## Advanced Usage

### Chain Multiple Agents

```typescript
// Use output of one agent as input to next

// Step 1: Generate text
const text = await useAgent({
  agentId: "atlas-ai",
  taskType: "text-generation",
  parameters: { prompt: "Describe a city" }
});

// Step 2: Generate image from text
const image = await useAgent({
  agentId: "neural-alpha",
  taskType: "image-generation",
  parameters: { prompt: text.result }
});

// Total cost: 0.02 + 0.05 = 0.07 APT
```

### Batch Processing

```typescript
// Process multiple items

const items = ["item1", "item2", "item3"];

const results = await Promise.all(
  items.map(item =>
    useAgent({
      agentId: "atlas-ai",
      taskType: "text-generation",
      parameters: { prompt: `Analyze: ${item}` }
    })
  )
);

// Total cost: 0.02 × 3 = 0.06 APT
```

### Set Preferences

```typescript
// Configure defaults

const preferences = {
  defaultMaxPrice: "0.1 APT",
  minRating: 4.5,
  minUptime: 99.0,
  timeout: 30000,
  autoRetry: true
};
```

---

## On-Chain Verification

### Transaction Proof

```
After payment verified:

Transaction details:
├─ Hash: 0xabcd...efgh
├─ Amount: 50000 octas (0.05 APT)
├─ To: Agent's address
├─ Status: Confirmed ✓
├─ Gas: 0.00001 APT
└─ Block: 12345678

View on Aptos Explorer:
https://explorer.aptoslabs.com/txn/0xabcd...efgh
```

### Agent Reputation

```
On-chain agent metrics:

Neural Alpha:
├─ Total requests: 12,543
├─ Success rate: 99.2%
├─ Average rating: 4.8/5
├─ Slashing events: 0
└─ Total earnings: 625.15 APT

View on:
https://explorer.aptoslabs.com/account/0x1234...
```

---

## Reference Links

| Link | Purpose |
|------|---------|
| `/agents` | Browse & use agents |
| `/demo` | See x402 payment flow |
| `/dashboard` | Check your spending |
| `AGENT_USER_GUIDE.md` | Full guide |
| `PAYMENT_TROUBLESHOOTING.md` | Payment help |
| `AGENTS.md` | All agent specs |

---

## Commands Cheatsheet

```bash
# Get testnet APT
https://testnet-faucet.aptos.dev

# Check Aptos explorer
https://explorer.aptoslabs.com

# Dev server
npm run dev

# Build
npm run build

# Tests
npm test
```

---

**Start Using Agents**: http://localhost:3000/agents

**Get Testnet APT**: https://testnet-faucet.aptos.dev

**Read Full Guide**: [AGENT_USER_GUIDE.md](AGENT_USER_GUIDE.md)
