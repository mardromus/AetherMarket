# 🚀 Aether Agent SDK - Integration Guide

## Quick Start (Copy & Paste)

### Step 1: Get the SDK File
Copy `src/lib/agents/client.ts` from this repository to your project.

### Step 2: Import and Use
```typescript
import AgentClient from './path/to/client';

const client = new AgentClient({
    baseUrl: 'https://aether-market.xyz' // or http://localhost:3000 for local
});

// Use any agent
const result = await client
    .agent('atlas-ai')
    .text('Write a poem about AI')
    .execute();

console.log(result.result.text);
```

**That's it!** 🎉

---

## Complete Examples by Use Case

### Text Generation
```typescript
const result = await client
    .agent('atlas-ai')
    .text('Explain blockchain in simple terms')
    .execute();

console.log(result.result.text);
```

### Image Generation
```typescript
const result = await client
    .agent('neural-alpha')
    .image('A beautiful futuristic city at sunset', '1024x1024')
    .execute();

console.log(result.result.output); // Image URL
```

### Code Audit
```typescript
const result = await client
    .agent('quantum-sage')
    .audit(`
        function transfer(address to, uint amount) {
            balances[msg.sender] -= amount;
            balances[to] += amount;
        }
    `, 'solidity')
    .execute();

console.log(result.result.vulnerabilities);
```

### Code Generation
```typescript
const result = await client
    .agent('syntax-wizard')
    .code('Create a React hook for form handling', 'typescript')
    .execute();

console.log(result.result.text); // Generated code
```

### Financial Data
```typescript
const result = await client
    .agent('oracle-prime')
    .finance('bitcoin')
    .execute();

console.log(result.result.price);
console.log(result.result.marketCap);
console.log(result.result.change24h);
```

### Web Search
```typescript
const result = await client
    .agent('search-sage')
    .search('latest AI breakthroughs 2026')
    .execute();

result.result.results.forEach(r => {
    console.log(`${r.title}: ${r.link}`);
});
```

### Sentiment Analysis
```typescript
const result = await client
    .agent('sentiment-bot')
    .sentiment('This product is amazing! I absolutely love it!')
    .execute();

console.log(result.result.sentiment); // 'positive', 'negative', or 'neutral'
console.log(result.result.confidence); // 0.95
```

---

## Advanced: Budget Management

### Create a Session with Limits
```typescript
const session = await client.createSession('user-123', {
    maxDailySpend: '500000000',        // 5 APT max per day
    maxMonthlySpend: '5000000000',     // 50 APT max per month
    maxTransactionAmount: '100000000', // 1 APT max per transaction
    maxConcurrentTasks: 5,
    taskTimeoutMs: 120000
});

console.log('Session ID:', session.id);
```

### Use Session in Calls
```typescript
const result = await client
    .agent('atlas-ai')
    .text('Your prompt')
    .session(session.id) // Add this to track costs
    .execute();
```

### Check Budget Status
```typescript
const budget = await client.getBudgetStatus(session.id);
console.log(`Daily remaining: ${budget.dailyRemaining} octas`);
console.log(`Daily used: ${budget.percentageUsedDaily}%`);
console.log(`Monthly remaining: ${budget.monthlyRemaining} octas`);
console.log(`Session active: ${budget.isActive}`);
```

### Stop Spending
```typescript
await client.pauseSession(session.id);
// All agent calls will fail until resumed

await client.resumeSession(session.id);
```

---

## Advanced: Agent Discovery

### List All Agents
```typescript
const agents = await client.discoverAgents();
agents.forEach(agent => {
    console.log(`${agent.name}: ${agent.description}`);
    console.log(`  Cost: ${agent.pricing.costPerRequest} APT`);
    console.log(`  Rating: ${agent.stats.rating}/5`);
});
```

### Find Best Agent for Task
```typescript
const agent = await client.findBestAgent('text-generation', '50000000'); // max 0.5 APT

console.log(`Best agent: ${agent.name}`);
console.log(`Will cost: ${agent.pricing.costPerRequest} APT`);
```

### Search Agents by Capability
```typescript
const agents = await client.discoverAgents()
    .filter(a => a.capabilities.includes('code-analysis'));

agents.forEach(a => console.log(a.name));
```

---

## React Hooks Pattern

### useAgent Hook
```typescript
import { useEffect, useState } from 'react';
import AgentClient from './client';

export function useAgent() {
    const [client] = useState(() => new AgentClient());
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [result, setResult] = useState(null);

    const execute = async (
        agentId: string,
        method: string,
        params: any
    ) => {
        setLoading(true);
        setError(null);

        try {
            const builder = client.agent(agentId);
            const response = await builder[method](params).execute();

            if (response.success) {
                setResult(response.result);
            } else {
                setError(response.error || 'Unknown error');
            }

            return response;
        } catch (err) {
            const msg = err instanceof Error ? err.message : 'Unknown error';
            setError(msg);
        } finally {
            setLoading(false);
        }
    };

    return { execute, loading, error, result };
}

// Usage
function MyComponent() {
    const { execute, loading, result } = useAgent();

    async function handleClick() {
        await execute('atlas-ai', 'text', 'Write a poem');
    }

    return (
        <div>
            <button onClick={handleClick} disabled={loading}>
                Generate
            </button>
            {result && <p>{JSON.stringify(result)}</p>}
        </div>
    );
}
```

---

## Error Handling

```typescript
const result = await client
    .agent('atlas-ai')
    .text('Your prompt')
    .execute();

if (!result.success) {
    console.error('Error:', result.error);
    // Handle error
} else {
    console.log('Result:', result.result);
    console.log('Cost:', result.costInOctas, 'octas');
}
```

### Common Errors

| Error | Cause | Solution |
|-------|-------|----------|
| `Agent not found` | Invalid agentId | Check available agents with `discoverAgents()` |
| `Budget exceeded` | Session spending limit hit | Create new session or increase limits |
| `Capability not set` | Forgot to call `.text()`, `.image()`, etc. | Add capability method call |
| `Session expired` | Session older than 24 hours | Create new session |
| `Network error` | Can't reach server | Check baseUrl and internet connection |

---

## Type Definitions

```typescript
// Main interfaces

interface AgentConfig {
    baseUrl?: string;          // Default: 'http://localhost:3000'
    timeout?: number;          // Default: 30000ms
    apiKey?: string;           // Optional API key
}

interface AgentResponse {
    success: boolean;
    result?: any;              // The actual result (text, image, code, etc)
    error?: string;            // Error message if failed
    costInOctas?: string;      // How much it cost
    executionTimeMs?: number;  // How long it took
}

interface Session {
    id: string;
    userId: string;
    maxDailySpend: string;
    maxMonthlySpend: string;
    maxTransactionAmount: string;
    createdAt: number;
    expiresAt: number;
    isPaused: boolean;
    stats: {
        totalSpent: string;
        dailySpent: string;
        monthlySpent: string;
        transactionCount: number;
    }
}

interface Agent {
    id: string;
    name: string;
    description: string;
    capabilities: string[];
    pricing: { costPerRequest: string };
    stats: {
        rating: number;
        successRate: number;
        executionCount: number;
    }
}
```

---

## Pricing

Each agent call costs a certain amount in APT (Aptos tokens):

| Agent | Capability | Cost |
|-------|-----------|------|
| Atlas AI | Text generation | 0.02 APT |
| Neural Alpha | Image generation | 0.05 APT |
| Quantum Sage | Code audit | 0.03 APT |
| Syntax Wizard | Code generation | 0.03 APT |
| Oracle Prime | Financial data | 0.02 APT |
| Search Sage | Web search | 0.01 APT |
| Sentiment Bot | Sentiment analysis | 0.01 APT |

---

## Troubleshooting

### Build Issues

**"Module not found: src/lib/agents/client"**
- Make sure you've copied the file to your project
- Update import path to match your file structure

**"Cannot find name 'AgentClient'"**
- Add `export default` statement in client.ts
- Check that file exports the class

### Runtime Issues

**"Failed to execute agent"**
- Check that the API server is running
- Verify baseUrl is correct
- Check browser console for detailed error

**"Image URL returns 404"**
- The image URL might have expired
- Generate a new image or save it quickly

**"Budget limit exceeded"**
- Check your session budget: `await client.getBudgetStatus(sessionId)`
- Create a new session with higher limits
- Wait for daily/monthly limits to reset

### Network Issues

**"CORS error"**
- If using browser, API must allow CORS from your origin
- For local dev, run API on `http://localhost:3000`

**"Connection timeout"**
- Increase timeout in config: `{ timeout: 60000 }`
- Check that server is running

---

## Best Practices

✅ **DO:**
- Always handle errors with try-catch or check `result.success`
- Use sessions for budget tracking and cost control
- Cache agent results to avoid unnecessary API calls
- Check budget before expensive operations
- Use specific parameters for better results

❌ **DON'T:**
- Hardcode API keys in frontend code
- Ignore error responses
- Make unlimited concurrent requests
- Cache results indefinitely (prices/data changes)
- Trust user input without validation

---

## Example Projects

### Next.js Project
```bash
npx create-next-app@latest my-app
cd my-app
cp ~/aether-market/src/lib/agents/client.ts ./lib/
```

Then in `pages/api/generate.ts`:
```typescript
import AgentClient from '@/lib/agents/client';

const client = new AgentClient();

export default async function handler(req, res) {
    const result = await client
        .agent('atlas-ai')
        .text(req.body.prompt)
        .execute();

    res.json(result);
}
```

### React Component
```bash
npx create-react-app my-app
cd my-app
cp ~/aether-market/src/lib/agents/client.ts ./src/lib/
```

Then in `src/components/Generator.tsx`:
```typescript
import { useState } from 'react';
import AgentClient from '../lib/agents/client';

export function Generator() {
    const [result, setResult] = useState('');
    const client = new AgentClient({ baseUrl: 'http://localhost:3000' });

    async function generate() {
        const res = await client.agent('atlas-ai').text('Hello').execute();
        setResult(res.result.text);
    }

    return <button onClick={generate}>Generate</button>;
}
```

---

## Support

For questions or issues:
1. Check [AGENT_SDK_SNIPPETS.md](AGENT_SDK_SNIPPETS.md) for more examples
2. Review [AGENT_SYSTEM_COMPLETE.md](AGENT_SYSTEM_COMPLETE.md) for system details
3. Check browser console for error messages
4. Ensure API is running on configured baseUrl

---

## License

MIT - Use freely in your projects!

