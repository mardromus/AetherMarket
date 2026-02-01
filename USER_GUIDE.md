# 🤖 AETHER MARKET - COMPLETE USER GUIDE

## Table of Contents
1. [Quick Start](#quick-start)
2. [Understanding Agents](#understanding-agents)
3. [Agent Schemas & Data Types](#agent-schemas--data-types)
4. [How to Call Agents](#how-to-call-agents)
5. [Budget Management](#budget-management)
6. [Response Handling](#response-handling)
7. [Best Practices](#best-practices)

---

## Quick Start

### 1. Navigate to Agents Marketplace
Visit `/agents` to browse all available agents with their capabilities and pricing.

### 2. Access Admin Dashboard
Go to `/admin` to:
- **Discover** agents by skill
- **View** all available agents
- **Create** budget sessions
- **View Schemas** and API documentation

### 3. Integration Guide
Visit `/integration` for complete code examples and best practices for integrating agents into your application.

---

## Understanding Agents

### Available Agents (7 Total)

#### 🎨 Neural Alpha - Image Generation
- **Cost:** 0.05 APT
- **Model:** DALL-E 3
- **Use Cases:** Generate images, artwork, visual designs
- **Category:** Reality Forge

#### 🔒 Quantum Sage - Code Audit
- **Cost:** 0.03 APT
- **Model:** GPT-4o
- **Use Cases:** Security analysis, performance review, code quality
- **Category:** Logic Engine

#### 📊 Oracle Prime - Financial Analysis
- **Cost:** 0.02 APT
- **Model:** CoinGecko API
- **Use Cases:** Cryptocurrency prices, market data, volume metrics
- **Category:** Data Harvester

#### 💻 Syntax Wizard - Code Generation
- **Cost:** 0.03 APT
- **Model:** GPT-4o
- **Use Cases:** Generate code, algorithms, boilerplate
- **Category:** Code Factory

#### ✍️ Atlas AI - Text Generation
- **Cost:** 0.02 APT
- **Model:** GPT-4o
- **Use Cases:** Content writing, analysis, translation
- **Category:** Text Forge

#### 🔍 Search Sage - Web Search
- **Cost:** 0.01 APT
- **Model:** SerpAPI
- **Use Cases:** Web search, research, information gathering
- **Category:** Knowledge Seeker

#### 😊 Sentiment Bot - Sentiment Analysis
- **Cost:** 0.01 APT
- **Model:** GPT-4o
- **Use Cases:** Sentiment analysis, emotion detection, intent recognition
- **Category:** NLP Analyzer

---

## Agent Schemas & Data Types

### Universal Request Format

Every agent follows this request structure:

```typescript
interface AgentRequest {
    agentId: string;              // Which agent to call
    taskType: string;             // What task to perform
    parameters: Record<string, unknown>; // Task-specific parameters
    maxPrice?: string;            // Optional: max price in APT
    budgetId?: string;            // Optional: budget session ID
}
```

### Universal Response Format

Every agent returns this response structure:

```typescript
interface AgentResponse {
    success: boolean;             // Did execution succeed?
    result: any;                  // Agent-specific result
    executionTime: number;        // Milliseconds taken
    cost: string;                 // Cost in octas (0.0005 APT = 50000 octas)
    agentId: string;              // Which agent executed
    taskType: string;             // Which task was performed
    error?: string;               // Error message if failed
    metadata?: {
        tokensUsed?: number;      // LLM tokens used
        model?: string;           // Model name
        timestamp?: number;       // When executed
    };
}
```

### Agent-Specific Schemas

#### Neural Alpha Request
```typescript
{
    agentId: "neural-alpha",
    taskType: "image-generation",
    parameters: {
        prompt: string;           // REQUIRED: Image description (max 4000 chars)
        size?: "1024x1024" | "1792x1024" | "1024x1792";  // Optional: default 1024x1024
        quality?: "standard" | "hd";  // Optional: default standard
        n?: number;               // Optional: number of images (1-10)
        style?: string;           // Optional: artistic style
    }
}
```

**Response Data:**
```typescript
{
    imageUrl: string;             // HTTPS URL to the generated image
    revisedPrompt: string;        // Prompt as interpreted by API
    base64?: string;              // Optional: base64 encoded image
    metadata?: {
        size: string;
        quality: string;
        model: string;
    }
}
```

---

#### Quantum Sage Request
```typescript
{
    agentId: "quantum-sage",
    taskType: "code-audit",
    parameters: {
        code: string;             // REQUIRED: Code to audit (max 50KB)
        language: string;         // REQUIRED: js|ts|py|java|cpp|rust|go|sol
        focus?: ("security" | "performance" | "maintainability" | "all")[];
        includeFixes?: boolean;   // Include corrected code
    }
}
```

**Response Data:**
```typescript
{
    issues: Array<{
        severity: "critical" | "high" | "medium" | "low";
        type: string;
        line: number;
        message: string;
        suggestion?: string;
    }>;
    summary: string;              // Human-readable summary
    score: number;                // 0-100 quality score
    codeQuality: "excellent" | "good" | "fair" | "poor";
    recommendations: string[];    // Improvement suggestions
    fixedCode?: string;           // Corrected code if includeFixes=true
}
```

---

#### Oracle Prime Request
```typescript
{
    agentId: "oracle-prime",
    taskType: "financial-analysis",
    parameters: {
        symbol: string;           // REQUIRED: e.g., "bitcoin", "ethereum"
        timeframe?: "24h" | "7d" | "30d" | "1y";
        includeHistory?: boolean;
    }
}
```

**Response Data:**
```typescript
{
    symbol: string;
    name: string;
    price: number;                // Current price in USD
    currency: string;             // "USD"
    priceChange: {
        change24h: number;        // Absolute change
        change7d: number;
        change30d: number;
        percentChange24h: number; // Percentage change
    };
    market: {
        marketCap: number;
        volume24h: number;
        circulatingSupply: number;
    };
    analysis: {
        trend: "bullish" | "bearish" | "neutral";
        volatility: "high" | "medium" | "low";
        sentiment: string;
    };
}
```

---

#### Syntax Wizard Request
```typescript
{
    agentId: "syntax-wizard",
    taskType: "code-generation",
    parameters: {
        prompt: string;           // REQUIRED: What to generate (max 2000 chars)
        language: string;         // REQUIRED: js|ts|py|java|cpp|rust|go|sol
        includeComments?: boolean;
        includeTests?: boolean;
    }
}
```

**Response Data:**
```typescript
{
    code: string;                 // Generated source code
    language: string;
    explanation: string;          // What the code does
    tests?: string;               // Unit tests if requested
    dependencies?: string[];      // Required packages
}
```

---

#### Atlas AI Request
```typescript
{
    agentId: "atlas-ai",
    taskType: "text-generation",
    parameters: {
        prompt: string;           // REQUIRED: Question or prompt (max 4000 chars)
        maxTokens?: number;       // Optional: 100-4000, default 1500
        temperature?: number;     // Optional: 0-1, default 0.7 (higher = creative)
        format?: "text" | "markdown" | "json";
    }
}
```

**Response Data:**
```typescript
{
    text: string;                 // Generated response
    tokensUsed: number;          // Tokens consumed
    format: string;              // Response format used
}
```

---

#### Search Sage Request
```typescript
{
    agentId: "search-sage",
    taskType: "web-search",
    parameters: {
        query: string;            // REQUIRED: Search query (max 500 chars)
        numResults?: number;      // Optional: 1-10, default 5
        language?: string;        // Optional: language code
    }
}
```

**Response Data:**
```typescript
{
    query: string;
    results: Array<{
        title: string;
        link: string;
        snippet: string;          // Search result preview
    }>;
    totalResults: number;         // Approx total results
    executionMs: number;
}
```

---

#### Sentiment Bot Request
```typescript
{
    agentId: "sentiment-bot",
    taskType: "sentiment-analysis",
    parameters: {
        text: string;             // REQUIRED: Text to analyze (max 5000 chars)
        includeEmotions?: boolean;
        includeKeyPhrases?: boolean;
    }
}
```

**Response Data:**
```typescript
{
    sentiment: "positive" | "negative" | "neutral" | "mixed";
    score: number;                // 0-1, confidence of sentiment
    confidence: number;           // 0-1, model confidence
    emotions?: Record<string, number>; // e.g., { joy: 0.85, anger: 0.1 }
    keyPhrases?: string[];       // Important phrases from text
    explanation: string;          // Human-readable explanation
}
```

---

## How to Call Agents

### Method 1: Via X402 Client (Recommended)

```typescript
import { X402Client } from '@/lib/x402/client';
import { useKeyless } from '@/lib/keyless/provider';

export function MyComponent() {
    const { account, signWithSession } = useKeyless();

    const executeAgent = async () => {
        const client = new X402Client();

        try {
            const result = await client.executeAgentTask(
                {
                    agentId: "atlas-ai",
                    taskType: "text-generation",
                    parameters: {
                        prompt: "Explain quantum computing",
                        maxTokens: 500
                    }
                },
                account.address,
                (payload) => signWithSession(payload)
            );

            if (result.success) {
                console.log("Result:", result.result.text);
                console.log("Cost:", result.cost, "octas");
            } else {
                console.error("Error:", result.error);
            }
        } catch (error) {
            console.error("Failed:", error);
        }
    };

    return <button onClick={executeAgent}>Generate Text</button>;
}
```

### Method 2: With Budget Control

```typescript
const result = await client.executeAgentTask(
    {
        agentId: "neural-alpha",
        taskType: "image-generation",
        parameters: {
            prompt: "A futuristic city",
            size: "1024x1024"
        },
        budgetId: "budget-123",  // Use specific budget
        maxPrice: "0.1"          // Max price limit
    },
    account.address,
    (payload) => signWithSession(payload)
);
```

### Method 3: Batch Execution

```typescript
async function batchAnalysis(symbols: string[]) {
    const client = new X402Client();
    
    const results = await Promise.all(
        symbols.map(symbol =>
            client.executeAgentTask({
                agentId: "oracle-prime",
                taskType: "financial-analysis",
                parameters: { symbol }
            })
        )
    );

    return results.map(r => ({
        symbol: r.result.symbol,
        price: r.result.price,
        trend: r.result.analysis.trend
    }));
}
```

---

## Budget Management

### Why Use Budgets?
- **Control Spending:** Set maximum budget for agents
- **Time-Limited:** Budgets expire after set period
- **Tracking:** Monitor usage and costs
- **Prevent Overruns:** Automatic limits prevent excessive spending

### Creating a Budget

1. Go to **Admin Dashboard** (`/admin`)
2. Click **"Budgets"** tab
3. Click **"New Budget"** button
4. Fill in:
   - **Agent:** Select which agent to use
   - **Amount:** Budget in APT (e.g., 10 APT)
   - **Duration:** Days until expiration (e.g., 7 days)
5. Click **"✅ Create Budget"**

### Budget Status

| Status | Meaning | Action |
|--------|---------|--------|
| 🟢 Active | Budget available, not expired | Can use normally |
| 🟡 Low | Less than 0.05 APT remaining | Almost depleted |
| 🟠 Depleted | All budget spent | Need new budget |
| 🔴 Expired | Time limit passed | Expired, need new |

### Using a Budget

```typescript
const result = await client.executeAgentTask(
    {
        agentId: "atlas-ai",
        taskType: "text-generation",
        parameters: { prompt: "..." },
        budgetId: "budget-123"  // Link to budget
    },
    account.address,
    (payload) => signWithSession(payload)
);

// Check if within budget
if (result.success) {
    console.log("Remaining:", remainingAPT);
} else if (result.error?.includes("budget")) {
    console.log("Budget exceeded");
}
```

---

## Response Handling

### Always Check Success First

```typescript
const result = await client.executeAgentTask(...);

if (!result.success) {
    // Handle error
    console.error("Failed:", result.error);
    return;
}

// Process result only if successful
const data = result.result;
```

### Parse Results by Agent Type

```typescript
switch (result.agentId) {
    case "neural-alpha":
        const imageUrl = result.result.imageUrl;
        // Display image
        break;

    case "sentiment-bot":
        const sentiment = result.result.sentiment;
        const score = result.result.score;
        // Display sentiment info
        break;

    case "oracle-prime":
        const price = result.result.price;
        const change = result.result.priceChange.percentChange24h;
        // Display price data
        break;
}
```

### Handle Cost Information

```typescript
const costOctas = parseInt(result.cost);
const costAPT = costOctas / 100_000_000;

console.log(`Cost: ${costAPT.toFixed(6)} APT`);
console.log(`Execution Time: ${result.executionTime}ms`);
```

---

## Best Practices

### 1. **Cache Results**
Don't re-call agents for the same input:
```typescript
const cache = new Map<string, any>();

function getOrExecute(key: string, fn: () => Promise<any>) {
    if (cache.has(key)) return cache.get(key);
    
    const result = fn();
    cache.set(key, result);
    return result;
}
```

### 2. **Set Reasonable Limits**
```typescript
// Good: Limited budget
const result = await client.executeAgentTask(
    { ..., maxPrice: "0.1" },  // Prevent runaway costs
    account.address,
    sign
);

// Bad: No limit
const result = await client.executeAgentTask(
    { ... },  // Could exceed expectations
    account.address,
    sign
);
```

### 3. **Validate Inputs**
```typescript
// Check size before sending
if (code.length > 50000) {
    throw new Error("Code too large (max 50KB)");
}

// Validate parameter types
if (typeof amount !== "number" || amount <= 0) {
    throw new Error("Invalid amount");
}
```

### 4. **Use Appropriate Agents**
- **Image:** Use Neural Alpha
- **Code Review:** Use Quantum Sage
- **Prices:** Use Oracle Prime
- **Generate Code:** Use Syntax Wizard
- **Write Text:** Use Atlas AI
- **Search:** Use Search Sage
- **Emotions:** Use Sentiment Bot

### 5. **Error Handling**
```typescript
try {
    const result = await client.executeAgentTask(...);
    
    if (!result.success) {
        if (result.error?.includes("budget")) {
            // Handle budget error
        } else if (result.error?.includes("timeout")) {
            // Handle timeout
        } else {
            // Handle generic error
        }
    }
} catch (error) {
    // Network or signing error
    console.error("Execution failed:", error);
}
```

### 6. **Monitor Costs**
```typescript
let totalCost = 0;

for (const agent of agents) {
    const result = await executeAgent(agent);
    totalCost += parseInt(result.cost) / 100_000_000;
}

console.log(`Total cost: ${totalCost} APT`);
```

### 7. **Use Budgets for Repeated Calls**
```typescript
// If calling same agent multiple times:
// 1. Create budget once
// 2. Use budgetId for all calls
// 3. Monitor remaining balance
```

---

## Important Notes

### Conversion Reference
- **1 APT** = 100,000,000 octas
- Cost in responses is in **octas**
- Budget amounts are in **APT**

### Gas & Fees
- Costs shown are agent execution costs only
- Aptos blockchain fees (negligible) apply separately
- Budget tracking is automatic

### Rate Limits
- No hard rate limit (API provider limits apply)
- Respect provider fair use policies
- Use caching and deduplication

### Data Privacy
- Inputs are sent to third-party AI providers
- Don't send sensitive personal data
- Check provider privacy policies

---

## Quick Links

- 📊 [Agent Marketplace](/agents)
- ⚙️ [Admin Dashboard](/admin)
- 📖 [Integration Guide](/integration)
- 💰 [Budget Management](/admin?tab=budgets)
- 📋 [API Schemas](/admin?tab=schemas)
- 📚 [Documentation](/docs)

---

**Last Updated:** February 1, 2026
**Status:** Production Ready ✅
