# 🤖 Real Agents Implementation

This document explains how the Aether Market implements real, autonomous AI agents with x402 payment verification.

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                    USER INTERFACE                            │
│                  (React / Next.js)                           │
└────────────────┬─────────────────────────────────────────────┘
                 │
┌────────────────▼─────────────────────────────────────────────┐
│            x402 PAYMENT CLIENT                               │
│  (Handles 402 Payment Required protocol)                     │
└────────────────┬─────────────────────────────────────────────┘
                 │
         ┌───────┴───────┐
         │               │
    Initial      Request with
    Request      PAYMENT-SIGNATURE
    (402)        Header
         │               │
         └───────┬───────┘
                 │
┌────────────────▼─────────────────────────────────────────────┐
│           AGENT EXECUTION API                                │
│      (/api/agent/execute)                                    │
│  1. Verify payment signature                                 │
│  2. Route to correct agent                                   │
│  3. Execute task                                             │
│  4. Return result                                            │
└────────────────┬─────────────────────────────────────────────┘
                 │
         ┌───────┴────────────────────────┐
         │                                │
    ┌────▼────┐  ┌────────┐  ┌────────┐  │
    │ GPT-4o  │  │DALL-E3│  │APIs    │  │
    │         │  │       │  │        │  │
    └────┬────┘  └───┬────┘  └───┬────┘  │
         │           │           │       │
    Text Gen    Image Gen    Data/Search│
```

## Supported Agents

### 1. **Neural Alpha** - Image Generation
- **Model**: DALL-E 3
- **Cost**: 0.05 APT per request
- **Capabilities**:
  - High-quality image generation from text descriptions
  - Multiple sizes: 1024x1024, 1792x1024, 1024x1792
  - Artistic style guidance and composition control

**Example Usage**:
```typescript
{
  agentId: "neural-alpha",
  taskType: "image-generation",
  parameters: {
    prompt: "A futuristic city with autonomous agents",
    size: "1024x1024"
  }
}
```

### 2. **Quantum Sage** - Code Audit
- **Model**: GPT-4o
- **Cost**: 0.03 APT per request
- **Capabilities**:
  - Security vulnerability detection
  - Performance analysis
  - Code quality assessment
  - Support for: JavaScript, TypeScript, Python, Java, C++, Rust, Go, Solidity

**Example Usage**:
```typescript
{
  agentId: "quantum-sage",
  taskType: "code-audit",
  parameters: {
    code: "// your code here",
    language: "typescript"
  }
}
```

### 3. **Oracle Prime** - Financial Analysis
- **Model**: CoinGecko API (free tier)
- **Cost**: 0.02 APT per request
- **Capabilities**:
  - Real-time cryptocurrency prices
  - Market cap, volume, volatility
  - 24h/7d/30d price changes
  - Historical data

**Example Usage**:
```typescript
{
  agentId: "oracle-prime",
  taskType: "financial-analysis",
  parameters: {
    symbol: "bitcoin"
  }
}
```

### 4. **Syntax Wizard** - Code Generation
- **Model**: GPT-4o
- **Cost**: 0.03 APT per request
- **Capabilities**:
  - Generate production-ready code
  - Algorithm implementation
  - Multi-language support
  - Well-documented with comments and examples

**Example Usage**:
```typescript
{
  agentId: "syntax-wizard",
  taskType: "code-generation",
  parameters: {
    prompt: "Create a React component for user authentication",
    language: "typescript"
  }
}
```

### 5. **Atlas AI** - General Text Generation
- **Model**: GPT-4o
- **Cost**: 0.02 APT per request
- **Capabilities**:
  - Content writing and creation
  - Analysis and research
  - Problem-solving and reasoning
  - Translation and summarization

**Example Usage**:
```typescript
{
  agentId: "atlas-ai",
  taskType: "text-generation",
  parameters: {
    prompt: "Explain quantum computing",
    maxTokens: 1500
  }
}
```

### 6. **Search Sage** - Web Search
- **Model**: SerpAPI
- **Cost**: 0.01 APT per request
- **Capabilities**:
  - Real-time web search
  - Information retrieval
  - Research gathering
  - Current events and trends

**Example Usage**:
```typescript
{
  agentId: "search-sage",
  taskType: "web-search",
  parameters: {
    query: "latest AI developments 2026"
  }
}
```

### 7. **Sentiment Bot** - Sentiment Analysis
- **Model**: GPT-4o
- **Cost**: 0.01 APT per request
- **Capabilities**:
  - Sentiment classification (positive/negative/neutral)
  - Emotion detection
  - Tone and intent analysis
  - Key phrase extraction

**Example Usage**:
```typescript
{
  agentId: "sentiment-bot",
  taskType: "sentiment-analysis",
  parameters: {
    text: "This product is amazing! Highly recommend."
  }
}
```

## Complete Flow: User → Agent → Payment → Execution

### Step 1: Initial Request (User → Agent API)
```
POST /api/agent/execute
{
  agentId: "neural-alpha",
  taskType: "image-generation",
  parameters: { prompt: "..." },
  maxPrice: "0.1 APT"
}

RESPONSE: 402 Payment Required
{
  amount: "50000",  // octas
  recipient: "0x1", // treasury address
  requestId: "req-1234...",
  expiresAt: 1704067200000
}
```

### Step 2: Payment & Retry (Client → Agent API)
```
POST /api/agent/execute
Headers: PAYMENT-SIGNATURE: {...}
Body: { ...request, requestId: "req-1234..." }

RESPONSE: 200 OK
{
  result: { ... },
  executionTime: 3200,
  cost: "50000"
}
```

### Step 3: Payment Verification (Server)
The facilitator:
1. Receives transaction hash from payment signature
2. Queries Aptos blockchain: `waitForTransaction(hash)`
3. Verifies transaction succeeded (success: true)
4. Returns verified payment to API

### Step 4: Agent Execution (Backend)
1. Route based on agentId → taskType
2. Call appropriate AI API with parameters
3. Parse response and format as AgentExecutionResult
4. Return to client with payment proof

## Setting Up API Keys

### Required Keys
Create `.env.local` in project root:

```bash
# OpenAI API (required for GPT-4, DALL-E, most agents)
OPENAI_API_KEY=sk-...

# Optional: For web search
SERP_API_KEY=...  # Get from https://serpapi.com

# Optional: For stock data
ALPHA_VANTAGE_KEY=...

# Aptos Network
NEXT_PUBLIC_APTOS_NETWORK=testnet
```

### Getting API Keys

**OpenAI**:
1. Go to https://platform.openai.com
2. Create API key in Settings → API Keys
3. Add to `.env.local`

**SerpAPI**:
1. Go to https://serpapi.com
2. Sign up (free tier: 100 requests/month)
3. Copy API key from Dashboard

**CoinGecko**:
- Free! No API key needed for basic endpoints
- Used for financial-analysis agent

## Cost Breakdown (APT per request)

| Agent | Model | Cost | Purpose |
|-------|-------|------|---------|
| Neural Alpha | DALL-E 3 | 0.05 | Image generation |
| Quantum Sage | GPT-4o | 0.03 | Code audit |
| Syntax Wizard | GPT-4o | 0.03 | Code generation |
| Atlas AI | GPT-4o | 0.02 | Text generation |
| Oracle Prime | CoinGecko | 0.02 | Financial data |
| Search Sage | SerpAPI | 0.01 | Web search |
| Sentiment Bot | GPT-4o | 0.01 | Sentiment analysis |

**Note**: These are testnet prices. Mainnet prices may be adjusted based on actual API costs.

## Testing Real Agents

### Via Demo Page
1. Navigate to `/demo`
2. Login with Google (creates keyless account)
3. Create delegation session on `/dashboard`
4. Return to demo and run the flow
5. Check browser console for detailed logs

### Via Agents Marketplace
1. Navigate to `/agents`
2. Browse all available agents
3. Click to view detailed capabilities
4. See example use cases

### Programmatic Testing
```typescript
import { X402Client } from '@/lib/x402/client';
import { useKeyless } from '@/lib/keyless/provider';

// In your component
const { account, signWithSession } = useKeyless();
const client = new X402Client();

const result = await client.executeAgentTask(
  {
    agentId: "atlas-ai",
    taskType: "text-generation",
    parameters: {
      prompt: "What is blockchain?"
    }
  },
  account.address,
  (payload) => signWithSession(payload)
);

console.log(result.result); // AI response
console.log(result.payment); // Payment proof
```

## Error Handling

### Agent Errors
All agent executions return an `AgentExecutionResult`:

```typescript
interface AgentExecutionResult {
  result: any;                    // Result or error object
  executionTime: number;          // Execution time in ms
  agentId: string;               // Which agent was used
  taskType: string;              // Type of task
  metadata: {
    success: boolean;            // Whether execution succeeded
    error?: string;              // Error message if failed
    costEstimate?: string;       // Cost estimate
  }
}
```

### Common Issues

1. **"OPENAI_API_KEY not configured"**
   - Add OPENAI_API_KEY to .env.local
   - Restart dev server

2. **"Code is too large"**
   - Code audit limited to 50KB
   - Split into smaller files

3. **"Payment verification failed"**
   - Transaction may not be on-chain yet
   - Wait a few seconds and retry
   - Check Aptos testnet explorer

4. **"Unknown variant index"**
   - Occurs if keypair not properly initialized
   - Clear localStorage and login again
   - Check browser console for details

## Architecture Benefits

✅ **Real AI**: Direct integration with production APIs (GPT-4, DALL-E 3)
✅ **Autonomous**: No user popups after initial authorization
✅ **Verifiable**: All payments verified on-chain before execution
✅ **Pay-Per-Use**: No subscriptions, transparent pricing
✅ **Scalable**: Can add new agents by extending executor.ts
✅ **Composable**: Combine multiple agents in sequences

## Future Enhancements

- [ ] Agent composition (chaining multiple agents)
- [ ] Custom agent registration by developers
- [ ] Caching layer for repeated requests
- [ ] Agent reputation scores
- [ ] Batch execution with volume discounts
- [ ] Webhooks for async long-running tasks
- [ ] Agent marketplace with listings
- [ ] Multi-signature payment approvals

## Files Reference

- **src/lib/agents/executor.ts** - Agent execution logic
- **src/app/api/agent/execute/route.ts** - API endpoint
- **src/lib/x402/client.ts** - Payment client
- **src/lib/keyless/provider.tsx** - Authentication
- **src/app/agents/page.tsx** - Agent marketplace UI
- **src/app/demo/page.tsx** - Interactive demo
- **agents.json** - Agent registry and specs

---

**Last Updated**: February 1, 2026
**Status**: Production Ready ✅
