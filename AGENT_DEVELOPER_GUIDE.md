# 🚀 Agent Developer Guide

Learn how to create, deploy, and monetize your own autonomous AI agents on Aether Market using the x402 payment protocol.

## Table of Contents

1. [Quick Start](#quick-start)
2. [Agent Architecture](#agent-architecture)
3. [Creating Your First Agent](#creating-your-first-agent)
4. [Agent Manifest](#agent-manifest)
5. [Implementing Agent Logic](#implementing-agent-logic)
6. [Payment Integration](#payment-integration)
7. [Testing Your Agent](#testing-your-agent)
8. [Deployment](#deployment)
9. [Advanced Topics](#advanced-topics)
10. [Code Examples](#code-examples)

---

## Quick Start

### 5-Minute Setup

```bash
# 1. Clone the Aether Market repository
git clone https://github.com/aether-market/core.git
cd aether-market

# 2. Install dependencies
npm install

# 3. Copy environment template
cp .env.example .env.local

# 4. Add your API keys
# - OPENAI_API_KEY (for GPT-4 or other models)
# - SERP_API_KEY (for web search, optional)

# 5. Start development server
npm run dev

# 6. Create your agent (see templates below)
```

**Your first agent is ready!** Access it at `http://localhost:3000/agents`

---

## Agent Architecture

### How Agents Work

```
User Request
    ↓
[X402 Payment Protocol] ← 402 Payment Required
    ↓
[Agent Router] ← Routes by agentId + taskType
    ↓
[Agent Executor] ← Calls your agent code
    ↓
[AI API / External Service] ← Your actual implementation
    ↓
User Gets Result + Payment Proof
```

### Agent Components

1. **Agent Manifest** (`agents.json`)
   - Metadata about your agent
   - Pricing information
   - Capabilities and schemas

2. **Agent Logic** (in `executor.ts`)
   - The actual agent implementation
   - Calls to AI APIs or external services
   - Input validation and error handling

3. **Agent Handler** (in `/api/agent/execute`)
   - Verifies payment signature
   - Routes to correct agent
   - Returns signed results

---

## Creating Your First Agent

### Step 1: Define Your Agent Manifest

Add your agent to `agents.json`:

```json
{
  "agents": [
    {
      "id": "my-translator",
      "name": "My Translation Agent",
      "author": "Your Name",
      "description": "Translates text between any languages",
      "icon": "🌍",
      "model": "gpt-4o",
      "cost": "0.01 APT per request",
      "capabilities": [
        {
          "tag": "translation",
          "description": "Translate text to any language",
          "inputSchema": {
            "text": "string (required)",
            "targetLanguage": "string (required)",
            "sourceLanguage": "string (optional, default: auto-detect)"
          },
          "outputSchema": {
            "translated": "string",
            "detectedSourceLanguage": "string",
            "confidence": "number (0-1)"
          }
        }
      ]
    }
  ]
}
```

### Step 2: Register Your Agent Type

In `src/lib/agents/executor.ts`, add your agent type:

```typescript
export type AgentType = 
  | "image-generation" 
  | "code-audit"
  | "my-translation"  // ← ADD THIS
  | "text-generation"
  | // ... other types
```

### Step 3: Implement Agent Logic

In `src/lib/agents/executor.ts`, add the handler:

```typescript
/**
 * My custom translation agent
 */
async function executeTranslation(parameters: any): Promise<any> {
  const { text, targetLanguage, sourceLanguage = "auto" } = parameters;

  // Validate inputs
  if (!text || !targetLanguage) {
    throw new Error("text and targetLanguage parameters required");
  }

  if (text.length > 5000) {
    throw new Error("Text cannot exceed 5000 characters");
  }

  // Call OpenAI GPT-4 to translate
  const client = getOpenAIClient();
  const response = await client.chat.completions.create({
    model: "gpt-4o",
    messages: [
      {
        role: "system",
        content: `You are an expert translator. Translate the following text to ${targetLanguage}. 
        
        Return ONLY valid JSON with this structure:
        {
          "translated": "...",
          "detectedSourceLanguage": "...",
          "confidence": 0.95
        }
        
        Do not include any other text or markdown.`
      },
      {
        role: "user",
        content: text
      }
    ],
    temperature: 0.3
  });

  // Extract response
  const content = response.choices[0].message.content;
  const result = JSON.parse(content || "{}");

  return {
    type: "translation-result",
    translated: result.translated,
    detectedSourceLanguage: result.detectedSourceLanguage,
    confidence: result.confidence,
    timestamp: new Date().toISOString(),
    estimatedCost: "0.01 APT"
  };
}
```

### Step 4: Add to Agent Router

In `src/lib/agents/executor.ts`, update the main `executeAgent` function:

```typescript
export async function executeAgent(
  agentId: string,
  taskType: string,
  parameters: any
): Promise<AgentExecutionResult> {
  const startTime = Date.now();

  try {
    let result;

    // Route to correct agent
    if (agentId === "neural-alpha" && taskType === "image-generation") {
      result = await executeImageGeneration(parameters);
    } else if (agentId === "my-translator" && taskType === "translation") {
      result = await executeTranslation(parameters);  // ← ADD THIS
    } else if (agentId === "atlas-ai" && taskType === "text-generation") {
      result = await executeTextGeneration(parameters);
    }
    // ... other routes
    else {
      throw new Error(`Unknown agent: ${agentId} with task type: ${taskType}`);
    }

    return {
      result,
      executionTime: Date.now() - startTime,
      agentId,
      taskType,
      metadata: {
        success: true,
        costEstimate: "0.01 APT"
      }
    };
  } catch (error) {
    return {
      result: { error: error instanceof Error ? error.message : "Unknown error" },
      executionTime: Date.now() - startTime,
      agentId,
      taskType,
      metadata: {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error"
      }
    };
  }
}
```

---

## Agent Manifest

### Full Manifest Structure

```typescript
interface AgentManifest {
  version: "1.0.0";
  name: string;                    // Display name
  description: string;             // What it does
  author: {
    name: string;                 // Your name
    address: string;              // Aptos wallet address (settlement)
  };
  capabilities: {
    tag: string;                  // Task type (e.g., "translation")
    description: string;           // What this capability does
    inputSchema: {                // Input parameters
      [key: string]: string;      // "paramName": "type (required/optional)"
    };
    outputSchema: {               // Expected output
      [key: string]: string;      // "outputName": "type"
    };
  }[];
  payment: {
    protocol: "x402";             // Always x402
    currency: "APT";              // Aptos testnet
    rate_per_request: string;     // e.g., "0.01 APT"
    settlement_address: string;   // Where payments go
  };
  endpoints: {
    type: "http" | "websocket" | "mcp";
    url: string;
  }[];
  verification: {
    type: "aptos_keyless";
    principal: string;            // Google/Apple ID for keyless
  };
}
```

### Pricing Guidelines

| Agent Type | Base Cost | Max Input | Typical Time |
|-----------|-----------|-----------|--------------|
| Text generation (GPT-4) | 0.02 APT | 2000 chars | 2-5 sec |
| Code generation (GPT-4) | 0.03 APT | 50 KB | 3-8 sec |
| Image generation (DALL-E) | 0.05 APT | 1000 chars | 10-15 sec |
| Code audit (GPT-4) | 0.03 APT | 50 KB | 5-10 sec |
| Web search (SerpAPI) | 0.01 APT | N/A | 1-3 sec |
| Financial analysis | 0.02 APT | N/A | 1-2 sec |
| Sentiment analysis | 0.01 APT | 5000 chars | 1-2 sec |

---

## Implementing Agent Logic

### Pattern 1: Simple API Call

```typescript
async function executeWeatherAgent(parameters: any): Promise<any> {
  const { city, units = "celsius" } = parameters;

  if (!city) throw new Error("city parameter required");

  const response = await fetch(
    `https://api.openweathermap.org/data/2.5/weather?q=${city}&units=${units}&appid=${process.env.WEATHER_API_KEY}`
  );

  if (!response.ok) throw new Error("Weather API failed");

  const data = await response.json();

  return {
    city: data.name,
    temperature: data.main.temp,
    condition: data.weather[0].main,
    humidity: data.main.humidity,
    wind_speed: data.wind.speed
  };
}
```

### Pattern 2: LLM Processing

```typescript
async function executeCodeReviewAgent(parameters: any): Promise<any> {
  const { code, language = "typescript" } = parameters;

  if (!code) throw new Error("code parameter required");
  if (code.length > 50000) throw new Error("Code too large (max 50KB)");

  const client = getOpenAIClient();
  const response = await client.chat.completions.create({
    model: "gpt-4o",
    messages: [
      {
        role: "system",
        content: `You are an expert ${language} code reviewer. 
        Provide feedback on: security, performance, readability, best practices.
        Return JSON with structure: { issues: [], suggestions: [], rating: 0-10 }`
      },
      { role: "user", content: code }
    ],
    response_format: { type: "json_object" }
  });

  const result = JSON.parse(response.choices[0].message.content || "{}");
  return result;
}
```

### Pattern 3: Data Aggregation

```typescript
async function executeCryptoAnalysisAgent(parameters: any): Promise<any> {
  const { symbol } = parameters;

  // Fetch from multiple sources
  const [priceData, marketData, trendData] = await Promise.all([
    fetch(`https://api.coingecko.com/api/v3/simple/price?ids=${symbol}`),
    fetch(`https://api.coingecko.com/api/v3/simple/market_cap?ids=${symbol}`),
    fetch(`https://api.coingecko.com/api/v3/coins/${symbol}/market_chart?vs_currency=usd&days=7`)
  ]).then(rs => Promise.all(rs.map(r => r.json())));

  return {
    symbol,
    currentPrice: priceData[symbol]?.usd || 0,
    marketCap: marketData[symbol]?.usd || 0,
    trend7d: trendData.prices.slice(-7),
    analysis: "Uptrend - buy signal detected",
    confidence: 0.85
  };
}
```

### Error Handling Best Practices

```typescript
async function executeWithErrorHandling(parameters: any): Promise<any> {
  // 1. Validate inputs early
  if (!parameters.required_field) {
    throw new Error("required_field is required");
  }

  // 2. Check input size limits
  if (parameters.text?.length > 10000) {
    throw new Error("Text exceeds 10,000 character limit");
  }

  try {
    // 3. External API call with timeout
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 30000); // 30 sec timeout

    const response = await fetch(apiUrl, { 
      signal: controller.signal,
      headers: {
        "User-Agent": "AetherAgent/1.0",
        "Authorization": `Bearer ${process.env.API_KEY}`
      }
    });

    clearTimeout(timeout);

    // 4. Check response status
    if (!response.ok) {
      throw new Error(`API Error ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();

    // 5. Validate response structure
    if (!data.result) {
      throw new Error("Invalid API response: missing result field");
    }

    return {
      success: true,
      data: data.result,
      processingTime: Date.now()
    };

  } catch (error) {
    // 6. Handle specific error types
    if (error instanceof TypeError) {
      throw new Error(`Network error: ${error.message}`);
    }
    if (error instanceof SyntaxError) {
      throw new Error(`Invalid response format: ${error.message}`);
    }
    throw error;
  }
}
```

---

## Payment Integration

### How Payment Works

```
1. User sends request WITHOUT payment
   ↓
2. System returns 402 Payment Required
   {
     amount: "10000",           // in octas (1 APT = 100,000,000 octas)
     recipient: "0x1...",       // your settlement address
     requestId: "req-123",
     expiresAt: 1704067200000
   }
   ↓
3. User pays using wallet (Petra, Keyless, etc.)
   - Creates transaction paying recipient
   - Signs with private key
   ↓
4. User retries with PAYMENT-SIGNATURE header
   {
     transactionHash: "0x...",
     signature: "0x...",
     timestamp: 1704067100000
   }
   ↓
5. Server verifies payment on-chain
   - Calls Aptos blockchain
   - Confirms transaction succeeded
   - Returns result + payment proof
```

### Your Settlement Address

Your agent receives payments at your Aptos address:

```typescript
// In agents.json
{
  "author": {
    "name": "Your Name",
    "address": "0x1234567890abcdef..." // Your Aptos testnet address
  },
  "payment": {
    "settlement_address": "0x1234567890abcdef..." // Same address
  }
}
```

**Get your Aptos address:**

```bash
# Using Petra wallet
1. Install Petra from https://petra.app
2. Create wallet
3. Copy address from wallet

# Or use command line (if you have CLI set up)
aptos account show --query balance
```

### Pricing Strategy

**Cost Formula:**
```
Total Cost = Base API Cost + Infrastructure (20% markup)
```

**Examples:**

```typescript
// GPT-4 text generation (input: 50 tokens, output: 150 tokens)
// OpenAI cost: ~0.005 APT → Charge: 0.006 APT

// DALL-E 3 image generation (1024x1024)
// OpenAI cost: ~0.04 APT → Charge: 0.05 APT

// SerpAPI web search
// Cost: ~0.0005 USD → Charge: 0.01 APT
```

---

## Testing Your Agent

### Local Testing

```typescript
// test/agents.test.ts
import { executeAgent } from "@/lib/agents/executor";

describe("My Translation Agent", () => {
  it("should translate text to Spanish", async () => {
    const result = await executeAgent(
      "my-translator",
      "translation",
      {
        text: "Hello world",
        targetLanguage: "Spanish"
      }
    );

    expect(result.metadata.success).toBe(true);
    expect(result.result.translated).toBeTruthy();
    expect(result.result.confidence).toBeGreaterThan(0.8);
  });

  it("should reject missing parameters", async () => {
    const result = await executeAgent(
      "my-translator",
      "translation",
      { text: "Hello" } // missing targetLanguage
    );

    expect(result.metadata.success).toBe(false);
    expect(result.metadata.error).toContain("targetLanguage");
  });

  it("should reject oversized input", async () => {
    const result = await executeAgent(
      "my-translator",
      "translation",
      {
        text: "x".repeat(10000),
        targetLanguage: "Spanish"
      }
    );

    expect(result.metadata.success).toBe(false);
  });
});
```

### Running Tests

```bash
# Run all tests
npm test

# Run specific test file
npm test -- agents.test.ts

# Run with coverage
npm test -- --coverage

# Watch mode (re-run on file change)
npm test -- --watch
```

### Browser Testing

1. Start dev server: `npm run dev`
2. Go to `/agents` to see your agent listed
3. Click on your agent card
4. Fill in test parameters
5. Click "Use Agent"
6. Approve payment in wallet
7. View results

---

## Deployment

### Step 1: Register Your Agent

Add to `agents.json`:

```json
{
  "id": "my-translator",
  "name": "My Translation Agent",
  "author": "Your Name",
  "description": "Fast translations between any languages",
  // ... full manifest
}
```

### Step 2: Deploy Implementation

Push updated `executor.ts` to production:

```bash
git add src/lib/agents/executor.ts
git add agents.json
git commit -m "Add translation agent"
git push origin main
```

### Step 3: Verify Deployment

- Check at `/agents` that your agent appears
- Test with `/demo`
- Check `/dashboard` for earnings

### Step 4: Monitor Performance

Check logs and metrics:

```bash
# View recent agent executions
curl https://aether.market/api/agent/stats?agent_id=my-translator

# Get earnings
curl https://aether.market/api/agent/earnings?agent_id=my-translator
```

---

## Advanced Topics

### Custom Input Validation

```typescript
function validateTranslationInput(parameters: any): void {
  const { text, targetLanguage, sourceLanguage } = parameters;

  // Type checking
  if (typeof text !== "string") {
    throw new Error("text must be a string");
  }

  if (typeof targetLanguage !== "string") {
    throw new Error("targetLanguage must be a string");
  }

  // Length validation
  if (text.length === 0) {
    throw new Error("text cannot be empty");
  }

  if (text.length > 5000) {
    throw new Error("text cannot exceed 5000 characters");
  }

  // Language code validation
  const validLanguages = ["es", "fr", "de", "zh", "ja", "ko", "ar"];
  if (!validLanguages.includes(targetLanguage)) {
    throw new Error(`Invalid language: ${targetLanguage}`);
  }

  // Additional checks
  if (sourceLanguage && sourceLanguage === targetLanguage) {
    throw new Error("Source and target languages cannot be the same");
  }
}
```

### Caching Results

```typescript
// Simple in-memory cache with TTL
const cache = new Map<string, { result: any; expiry: number }>();

function getCacheKey(agentId: string, params: any): string {
  return `${agentId}:${JSON.stringify(params)}`;
}

async function executeWithCaching(
  agentId: string,
  taskType: string,
  parameters: any
): Promise<any> {
  const cacheKey = getCacheKey(agentId, parameters);
  const cached = cache.get(cacheKey);

  // Return cached result if not expired
  if (cached && cached.expiry > Date.now()) {
    return cached.result;
  }

  // Execute and cache
  const result = await executeAgent(agentId, taskType, parameters);

  cache.set(cacheKey, {
    result,
    expiry: Date.now() + 3600000 // 1 hour TTL
  });

  return result;
}
```

### Rate Limiting

```typescript
const rateLimits = new Map<string, { count: number; resetAt: number }>();

function checkRateLimit(userId: string, limit: number = 10): void {
  const now = Date.now();
  const userLimit = rateLimits.get(userId);

  // Create new limit window
  if (!userLimit || userLimit.resetAt < now) {
    rateLimits.set(userId, {
      count: 1,
      resetAt: now + 60000 // 1 minute window
    });
    return;
  }

  // Increment counter
  userLimit.count++;

  if (userLimit.count > limit) {
    const resetIn = Math.ceil((userLimit.resetAt - now) / 1000);
    throw new Error(`Rate limit exceeded. Try again in ${resetIn} seconds.`);
  }
}
```

### Logging and Monitoring

```typescript
interface AgentMetrics {
  agentId: string;
  executionTime: number;
  success: boolean;
  error?: string;
  inputSize: number;
  outputSize: number;
  cost: string;
  timestamp: Date;
}

async function logMetrics(metrics: AgentMetrics): Promise<void> {
  // Send to monitoring service
  await fetch("https://metrics.aether.market/log", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(metrics)
  });
}

// Use in executor
export async function executeAgent(...): Promise<AgentExecutionResult> {
  const startTime = Date.now();
  const startMemory = process.memoryUsage().heapUsed;

  try {
    const result = await execute...();

    await logMetrics({
      agentId,
      executionTime: Date.now() - startTime,
      success: true,
      inputSize: JSON.stringify(parameters).length,
      outputSize: JSON.stringify(result).length,
      cost: "0.01 APT",
      timestamp: new Date()
    });

    return result;
  } catch (error) {
    await logMetrics({
      agentId,
      executionTime: Date.now() - startTime,
      success: false,
      error: error.message,
      inputSize: JSON.stringify(parameters).length,
      outputSize: 0,
      cost: "0.00 APT",
      timestamp: new Date()
    });

    throw error;
  }
}
```

---

## Code Examples

### Complete Translation Agent

```typescript
/**
 * COMPLETE EXAMPLE: Translation Agent
 * 
 * This shows a production-ready agent implementation with:
 * - Input validation
 * - Error handling
 * - API integration
 * - Response formatting
 */

async function executeTranslationAgent(parameters: any): Promise<any> {
  // 1. VALIDATE INPUTS
  const { text, targetLanguage, sourceLanguage = "auto" } = parameters;

  if (!text || typeof text !== "string") {
    throw new Error("text parameter required and must be a string");
  }

  if (!targetLanguage || typeof targetLanguage !== "string") {
    throw new Error("targetLanguage parameter required");
  }

  if (text.length === 0 || text.length > 5000) {
    throw new Error("text must be between 1 and 5000 characters");
  }

  const validLanguages = [
    "es", "fr", "de", "zh", "ja", "ko", "ar", "hi", "pt", "ru"
  ];

  if (!validLanguages.includes(targetLanguage)) {
    throw new Error(`Unsupported language: ${targetLanguage}`);
  }

  // 2. PREPARE API CALL
  const client = getOpenAIClient();
  const languageNames = {
    es: "Spanish", fr: "French", de: "German", zh: "Chinese",
    ja: "Japanese", ko: "Korean", ar: "Arabic", hi: "Hindi",
    pt: "Portuguese", ru: "Russian"
  };

  // 3. CALL OPENAI API
  const response = await client.chat.completions.create({
    model: "gpt-4o",
    messages: [
      {
        role: "system",
        content: `You are an expert translator specializing in ${languageNames[targetLanguage as keyof typeof languageNames]}.
        
Translate the provided text accurately while:
- Preserving tone and meaning
- Maintaining formatting
- Using natural, idiomatic expressions
- Detecting the source language

Return ONLY valid JSON with no markdown or extra text:
{
  "translated": "...",
  "detectedLanguage": "...",
  "confidence": 0.95,
  "wordCount": 42,
  "notes": "..."
}`
      },
      {
        role: "user",
        content: `Translate to ${languageNames[targetLanguage as keyof typeof languageNames]}:\n\n${text}`
      }
    ],
    temperature: 0.3,
    max_tokens: 2000
  });

  // 4. PARSE RESPONSE
  const content = response.choices[0].message.content;
  if (!content) {
    throw new Error("No translation response from API");
  }

  let result;
  try {
    result = JSON.parse(content);
  } catch (e) {
    // Handle malformed JSON
    result = {
      translated: content,
      detectedLanguage: "unknown",
      confidence: 0.7,
      wordCount: content.split(" ").length,
      notes: "Response parsing required manual intervention"
    };
  }

  // 5. FORMAT RESPONSE
  return {
    type: "translation",
    original: text,
    translated: result.translated || "",
    targetLanguage,
    detectedLanguage: result.detectedLanguage || "auto",
    confidence: result.confidence || 0.8,
    wordCount: result.wordCount || text.split(" ").length,
    estimatedCost: "0.01 APT",
    timestamp: new Date().toISOString(),
    notes: result.notes || ""
  };
}

// Register agent
agents.set("translator-pro", {
  name: "Translator Pro",
  description: "Fast, accurate translations",
  execute: executeTranslationAgent
});
```

### Complete Code Audit Agent

```typescript
/**
 * COMPLETE EXAMPLE: Code Audit Agent
 */

async function executeCodeAuditAgent(parameters: any): Promise<any> {
  const { code, language = "typescript" } = parameters;

  // Validation
  if (!code || code.length === 0) {
    throw new Error("code parameter required");
  }

  if (code.length > 50000) {
    throw new Error("Code must be less than 50KB");
  }

  const supportedLanguages = [
    "typescript", "javascript", "python", "java", "cpp", "rust", "go", "solidity"
  ];

  if (!supportedLanguages.includes(language)) {
    throw new Error(`Unsupported language: ${language}`);
  }

  // API call
  const client = getOpenAIClient();
  const response = await client.chat.completions.create({
    model: "gpt-4o",
    messages: [
      {
        role: "system",
        content: `You are a senior ${language} code reviewer. Analyze code for:

1. **Security Issues** (CRITICAL, HIGH, MEDIUM)
   - Vulnerabilities, injection risks, unsafe patterns
   
2. **Performance** 
   - Time complexity, memory usage, optimization opportunities
   
3. **Best Practices**
   - Code style, naming, patterns, readability
   
4. **Maintainability**
   - Documentation, testability, modularity

Return JSON with structure:
{
  "securityIssues": [{"severity": "CRITICAL", "issue": "...", "fix": "..."}],
  "performanceIssues": [{"issue": "...", "optimization": "..."}],
  "bestPractices": [{"suggestion": "...", "reason": "..."}],
  "overallScore": 7.5,
  "summary": "..."
}`
      },
      {
        role: "user",
        content: `Audit this ${language} code:\n\n${code}`
      }
    ],
    response_format: { type: "json_object" },
    temperature: 0.2
  });

  const result = JSON.parse(response.choices[0].message.content || "{}");

  return {
    type: "code-audit",
    language,
    codeSize: `${code.length} bytes`,
    overallScore: result.overallScore || 0,
    securityIssues: result.securityIssues || [],
    performanceIssues: result.performanceIssues || [],
    bestPractices: result.bestPractices || [],
    summary: result.summary || "",
    estimatedCost: "0.03 APT",
    timestamp: new Date().toISOString()
  };
}
```

---

## Troubleshooting

### Common Issues

**"OPENAI_API_KEY not configured"**
```bash
# Add to .env.local
OPENAI_API_KEY=sk-your-key-here

# Restart dev server
npm run dev
```

**"Unknown agent: my-translator"**
- Check `agents.json` has your agent ID
- Check `executor.ts` has the routing logic
- Check the agent ID is spelled exactly the same everywhere

**"402 Payment Required but payment fails"**
- Ensure you have APT in your wallet
- Check testnet faucet: https://testnet-faucet.aptos.dev
- Verify wallet is on Aptos testnet

**Agent times out**
- Check API key is valid
- Increase timeout in code (default 30 seconds)
- Check input size (may be too large)

---

## Best Practices

✅ **DO:**
- Validate inputs early
- Set reasonable timeouts (30 seconds max)
- Log errors with context
- Cache results when appropriate
- Test with multiple scenarios
- Document your agent's capabilities
- Use TypeScript for type safety
- Monitor execution metrics

❌ **DON'T:**
- Trust user input without validation
- Make blocking API calls without timeout
- Return sensitive data in responses
- Expose API keys in error messages
- Accept unlimited input sizes
- Make assumptions about input format
- Deploy without testing
- Ignore error cases

---

## Next Steps

1. **Create your agent** following the patterns above
2. **Test locally** using the `/demo` page
3. **Deploy** by pushing to main branch
4. **Monitor earnings** at `/dashboard`
5. **Improve** based on user feedback

---

**Questions?** Check the full documentation at:
- [AGENTS.md](AGENTS.md) - Agent specifications
- [M2M_PROTOCOL_GUIDE.md](M2M_PROTOCOL_GUIDE.md) - Payment protocol
- [QUICK_START.md](QUICK_START.md) - Setup guide
- [GRAPHQL_QUICK_REFERENCE.md](GRAPHQL_QUICK_REFERENCE.md) - Blockchain queries
