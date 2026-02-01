# 🚀 Agent Development Cheat Sheet

Quick reference for building agents on Aether Market. Save this for quick lookups!

---

## 1. Agent Manifest (agents.json)

```json
{
  "id": "my-agent",
  "name": "My Agent",
  "author": "Your Name",
  "description": "What it does",
  "icon": "🤖",
  "model": "gpt-4o",
  "cost": "0.01 APT per request",
  "capabilities": [{
    "tag": "my-task",
    "description": "Task description",
    "inputSchema": { "param1": "type" },
    "outputSchema": { "result": "type" }
  }]
}
```

---

## 2. Implementation Pattern

```typescript
async function executeMyAgent(parameters: any): Promise<any> {
  // 1. Validate
  if (!parameters.required) throw new Error("required param missing");
  
  // 2. Call API/LLM
  const result = await fetch(url);
  const data = await result.json();
  
  // 3. Format & return
  return {
    result: data.output,
    timestamp: new Date().toISOString()
  };
}
```

---

## 3. Router Registration

```typescript
export async function executeAgent(agentId, taskType, parameters) {
  try {
    let result;
    
    if (agentId === "my-agent" && taskType === "my-task") {
      result = await executeMyAgent(parameters);
    } else {
      throw new Error(`Unknown agent: ${agentId}`);
    }
    
    return {
      result,
      executionTime: Date.now() - startTime,
      agentId,
      taskType,
      metadata: { success: true }
    };
  } catch (error) {
    return {
      result: { error: error.message },
      executionTime: Date.now() - startTime,
      metadata: { success: false, error: error.message }
    };
  }
}
```

---

## 4. Error Handling

```typescript
// ✅ DO THIS
try {
  // Validate early
  if (input.length > 5000) throw new Error("Too large");
  
  // Set timeout
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 30000);
  
  // Make request
  const response = await fetch(url, { signal: controller.signal });
  clearTimeout(timeout);
  
  // Check status
  if (!response.ok) throw new Error(`Error ${response.status}`);
  
  return await response.json();
} catch (error) {
  // Handle specific errors
  if (error instanceof TypeError) {
    throw new Error(`Network: ${error.message}`);
  }
  throw error;
}

// ❌ DON'T DO THIS
fetch(url) // No timeout
  .then(r => r.json()) // No status check
  .then(d => d.result) // No validation
  .catch(e => ({ error: process.env.API_KEY })); // Exposes secrets!
```

---

## 5. Testing

```typescript
describe("My Agent", () => {
  it("should work", async () => {
    const result = await executeAgent(
      "my-agent",
      "my-task",
      { input: "test" }
    );
    
    expect(result.metadata.success).toBe(true);
    expect(result.result).toBeTruthy();
  });

  it("should validate input", async () => {
    const result = await executeAgent(
      "my-agent",
      "my-task",
      {} // missing input
    );
    
    expect(result.metadata.success).toBe(false);
  });
});
```

Run: `npm test -- agents.test.ts --watch`

---

## 6. Pricing Quick Reference

| Type | Base Cost | Markup | Charge |
|------|-----------|--------|--------|
| Text Gen (GPT-4) | ~0.005 | 100% | 0.01 |
| Code Gen (GPT-4) | ~0.01 | 200% | 0.03 |
| Image (DALL-E) | ~0.04 | 25% | 0.05 |
| Web Search | ~0.0005 | 2000% | 0.01 |
| Data (API) | ~0.001 | 100% | 0.02 |

Formula: `ChargeTo User = API Cost × (1 + Markup%)`

---

## 7. Input Validation Patterns

```typescript
// Size limit
if (input.length > 50000) throw new Error("Input too large");

// Type check
if (typeof input !== "string") throw new Error("Must be string");

// Range check
if (age < 0 || age > 150) throw new Error("Age invalid");

// Format check
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
if (!emailRegex.test(email)) throw new Error("Invalid email");

// Enum check
if (!["en", "es", "fr"].includes(language)) {
  throw new Error(`Unsupported language: ${language}`);
}

// Required fields
const required = ["param1", "param2"];
for (const param of required) {
  if (!parameters[param]) throw new Error(`${param} required`);
}
```

---

## 8. Caching Pattern

```typescript
const cache = new Map();

async function executeWithCache(agentId, params) {
  const key = `${agentId}:${JSON.stringify(params)}`;
  const cached = cache.get(key);
  
  if (cached && cached.expiry > Date.now()) {
    return cached.result; // Return from cache
  }
  
  const result = await executeAgent(agentId, params);
  cache.set(key, {
    result,
    expiry: Date.now() + 3600000 // 1 hour TTL
  });
  
  return result;
}
```

---

## 9. Rate Limiting Pattern

```typescript
const limits = new Map();

function checkRateLimit(userId, limit = 10) {
  const now = Date.now();
  const user = limits.get(userId) || { count: 0, resetAt: now };
  
  if (user.resetAt < now) {
    user.count = 0;
    user.resetAt = now + 60000; // Reset every 60 seconds
  }
  
  user.count++;
  limits.set(userId, user);
  
  if (user.count > limit) {
    const resetIn = Math.ceil((user.resetAt - now) / 1000);
    throw new Error(`Rate limit exceeded. Reset in ${resetIn}s`);
  }
}
```

---

## 10. Logging Pattern

```typescript
interface Metrics {
  agentId: string;
  executionTime: number;
  success: boolean;
  inputSize: number;
  outputSize: number;
  error?: string;
}

async function executeWithLogging(agentId, params) {
  const startTime = Date.now();
  const inputSize = JSON.stringify(params).length;
  
  try {
    const result = await executeAgent(agentId, params);
    
    const metrics: Metrics = {
      agentId,
      executionTime: Date.now() - startTime,
      success: true,
      inputSize,
      outputSize: JSON.stringify(result).length
    };
    
    await logMetrics(metrics);
    return result;
  } catch (error) {
    const metrics: Metrics = {
      agentId,
      executionTime: Date.now() - startTime,
      success: false,
      inputSize,
      outputSize: 0,
      error: error.message
    };
    
    await logMetrics(metrics);
    throw error;
  }
}

async function logMetrics(m: Metrics) {
  // Send to monitoring service
  console.log(`[${m.agentId}] ${m.executionTime}ms - ${m.success ? "✓" : "✗"}`);
}
```

---

## 11. Environment Variables

```bash
# Required
OPENAI_API_KEY=sk-...

# Optional
SERP_API_KEY=...          # For web search
ALPHA_VANTAGE_KEY=...     # For stock data
WEATHER_API_KEY=...       # For weather

# Blockchain
NEXT_PUBLIC_APTOS_NETWORK=testnet
```

---

## 12. Deployment Checklist

- [ ] Code compiles: `npm run build`
- [ ] Tests pass: `npm test`
- [ ] Linting: `npm run lint`
- [ ] Agent in `agents.json`
- [ ] Type in `AgentType`
- [ ] Router in `executeAgent()`
- [ ] Error handling complete
- [ ] Input validation done
- [ ] Pricing set correctly
- [ ] Environment variables set
- [ ] Commit message clear
- [ ] Push to main branch

---

## 13. Common Errors & Fixes

| Error | Fix |
|-------|-----|
| "OPENAI_API_KEY not configured" | Add to .env.local, restart dev server |
| "Unknown agent: X" | Check agents.json has ID, check router has route |
| "402 Payment fails" | Check wallet has APT, confirm testnet |
| "Timeout" | Increase timeout or reduce input size |
| "Code too large" | Split into multiple files/requests |
| "JSON parse error" | Validate API response format |
| "Type mismatch" | Use TypeScript types, run type check |

---

## 14. Performance Tips

```typescript
// ✅ Good: Parallel requests
const [data1, data2] = await Promise.all([
  fetch(url1).then(r => r.json()),
  fetch(url2).then(r => r.json())
]);

// ❌ Bad: Sequential requests
const data1 = await fetch(url1).then(r => r.json());
const data2 = await fetch(url2).then(r => r.json());

// ✅ Good: Cache results
const cached = cache.get(key);
if (cached) return cached;

// ❌ Bad: Always call API
for (let i = 0; i < 100; i++) {
  await fetch(url); // 100 API calls!
}

// ✅ Good: Stream large results
const stream = await response.body?.getReader();

// ❌ Bad: Load everything
const text = await response.text();
```

---

## 15. Useful Commands

```bash
# Development
npm run dev                    # Start dev server
npm test                       # Run tests
npm test -- --watch          # Watch mode
npm run lint                  # Check code quality
npm run build                 # Build for production

# Git
git status                     # Check changes
git add -A                     # Stage all changes
git commit -m "Add agent"     # Commit with message
git push origin main          # Push to main

# Testing agent
curl -X POST http://localhost:3000/api/agent/execute \
  -H "Content-Type: application/json" \
  -d '{"agentId":"my-agent","taskType":"my-task","parameters":{}}'
```

---

## 16. Resources

| Resource | Link |
|----------|------|
| Full Guide | [AGENT_DEVELOPER_GUIDE.md](AGENT_DEVELOPER_GUIDE.md) |
| Dev Hub | [/develop](/develop) |
| Agent List | [/agents](/agents) |
| Payment Info | [PAYMENT_TROUBLESHOOTING.md](PAYMENT_TROUBLESHOOTING.md) |
| M2M Protocol | [M2M_PROTOCOL_GUIDE.md](M2M_PROTOCOL_GUIDE.md) |
| Quick Start | [QUICK_START.md](QUICK_START.md) |

---

## Quick Start Template

```typescript
// 1. Add to agents.json
{
  "id": "template-agent",
  "name": "Template Agent",
  "cost": "0.01 APT per request",
  "capabilities": [{ "tag": "task" }]
}

// 2. Implement in executor.ts
async function executeTemplate(parameters: any) {
  const { input } = parameters;
  if (!input) throw new Error("input required");
  
  const result = await fetch("https://api.example.com", {
    method: "POST",
    body: JSON.stringify({ data: input })
  }).then(r => r.json());
  
  return { success: true, result };
}

// 3. Add to router
if (agentId === "template-agent") {
  result = await executeTemplate(parameters);
}

// 4. Deploy
git add -A && git push origin main

// 5. Access at /agents
```

---

**Bookmark this page for quick reference!**

Last Updated: February 1, 2026
