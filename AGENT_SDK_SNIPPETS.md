# Aether Agent SDK - Code Snippets & Usage Examples

Quick copy-paste code to use agents in your projects!

---

## 1. TypeScript / JavaScript - React Component

```typescript
import { useEffect, useState } from 'react';
import AgentClient from '@/lib/agents/client';

export function MyAgentComponent() {
    const [result, setResult] = useState(null);
    const [loading, setLoading] = useState(false);

    const client = new AgentClient({
        baseUrl: 'http://localhost:3000'
    });

    async function generateText() {
        setLoading(true);
        try {
            const result = await client
                .agent('atlas-ai')
                .text('Write a poem about blockchain')
                .execute();

            setResult(result);
        } finally {
            setLoading(false);
        }
    }

    return (
        <div>
            <button onClick={generateText} disabled={loading}>
                {loading ? 'Generating...' : 'Generate Text'}
            </button>
            {result && result.success && (
                <div>
                    <h3>Result:</h3>
                    <p>{result.result.text}</p>
                    <small>Cost: {result.costInOctas} octas</small>
                </div>
            )}
        </div>
    );
}
```

---

## 2. TypeScript - Node.js / Backend

```typescript
import AgentClient from './agents/client';

async function main() {
    const client = new AgentClient({
        baseUrl: 'http://localhost:3000',
        timeout: 60000
    });

    // Create a session for budget tracking
    const session = await client.createSession('user-123', {
        maxDailySpend: '1000000000', // 10 APT
        maxTransactionAmount: '50000000' // 0.5 APT max per tx
    });

    console.log('Session created:', session.id);

    // Generate text
    const textResult = await client
        .agent('atlas-ai')
        .text('Explain quantum computing')
        .session(session.id)
        .execute();

    console.log('Text generated:', textResult.result.text);
    console.log('Cost:', textResult.costInOctas, 'octas');

    // Generate an image
    const imageResult = await client
        .agent('neural-alpha')
        .image('A futuristic AI trading on blockchain')
        .session(session.id)
        .execute();

    console.log('Image URL:', imageResult.result.output);

    // Code audit
    const auditResult = await client
        .agent('quantum-sage')
        .audit(`
            function transfer(address to, uint amount) {
                balances[msg.sender] -= amount;
                balances[to] += amount;
            }
        `, 'solidity')
        .session(session.id)
        .execute();

    console.log('Audit report:', auditResult.result);

    // Check budget
    const budget = await client.getBudgetStatus(session.id);
    console.log(`Daily remaining: ${budget.dailyRemaining} octas`);
}

main().catch(console.error);
```

---

## 3. Plain JavaScript (Browser)

```javascript
// Copy the AgentClient code into your project
// Then use it like this:

const client = new AgentClient({
    baseUrl: 'http://localhost:3000'
});

// Simple text generation
async function generateText() {
    const result = await client
        .agent('atlas-ai')
        .text('Write a haiku about AI')
        .execute();

    if (result.success) {
        console.log('Generated:', result.result.text);
        console.log('Cost:', result.costInOctas);
    } else {
        console.error('Error:', result.error);
    }
}

// Generate image
async function generateImage() {
    const result = await client
        .agent('neural-alpha')
        .image('A robot programming itself', '1024x1024')
        .maxPrice('100000000') // max 1 APT
        .execute();

    if (result.success) {
        // Display image
        const img = new Image();
        img.src = result.result.output;
        document.body.appendChild(img);
    }
}

// Search the web
async function searchWeb() {
    const result = await client
        .agent('search-sage')
        .search('latest AI developments 2026')
        .execute();

    if (result.success) {
        result.result.results.forEach(r => {
            console.log(`${r.title}: ${r.link}`);
        });
    }
}

// Generate code
async function generateCode() {
    const result = await client
        .agent('syntax-wizard')
        .code('Create a React component for user authentication', 'typescript')
        .execute();

    if (result.success) {
        console.log('Generated code:', result.result.text);
    }
}

// Audit code
async function auditCode() {
    const result = await client
        .agent('quantum-sage')
        .audit(`
            function withdraw(uint amount) {
                msg.sender.call{value: amount}("");
                balance -= amount;
            }
        `, 'solidity')
        .execute();

    if (result.success) {
        console.log('Security report:', result.result.report);
    }
}

// Analyze sentiment
async function analyzeSentiment() {
    const result = await client
        .agent('sentiment-bot')
        .sentiment('This product is absolutely amazing! I love it!')
        .execute();

    if (result.success) {
        console.log('Sentiment:', result.result.sentiment);
        console.log('Confidence:', result.result.confidence);
    }
}

// Get financial data
async function getPriceData() {
    const result = await client
        .agent('oracle-prime')
        .finance('bitcoin')
        .execute();

    if (result.success) {
        console.log('BTC Price:', result.result.price);
        console.log('Market Cap:', result.result.marketCap);
    }
}
```

---

## 4. Advanced - With Session Management

```typescript
import AgentClient from './agents/client';

class MyAgentApp {
    private client: AgentClient;
    private sessionId: string;

    constructor(userId: string) {
        this.client = new AgentClient({
            baseUrl: 'http://localhost:3000'
        });
        this.sessionId = '';
        this.init(userId);
    }

    async init(userId: string) {
        // Create session with spending limits
        const session = await this.client.createSession(userId, {
            maxDailySpend: '5000000000', // 50 APT/day
            maxMonthlySpend: '50000000000', // 500 APT/month
            maxTransactionAmount: '100000000', // 1 APT max per transaction
            maxConcurrentTasks: 5,
            taskTimeoutMs: 120000
        });

        this.sessionId = session.id;
        console.log('Session initialized:', this.sessionId);
    }

    async runResearch(topic: string) {
        // Research assistant uses both search and analysis
        console.log(`Researching: ${topic}`);

        // First search
        const searchResult = await this.client
            .agent('search-sage')
            .search(topic)
            .session(this.sessionId)
            .execute();

        if (!searchResult.success) {
            throw new Error(`Search failed: ${searchResult.error}`);
        }

        console.log(`Found ${searchResult.result.resultCount} results`);

        // Then analyze with AI
        const analysisResult = await this.client
            .agent('atlas-ai')
            .text(`Summarize the following search results about ${topic}:
            ${JSON.stringify(searchResult.result.results)}`)
            .session(this.sessionId)
            .execute();

        return analysisResult.result.text;
    }

    async generateSecureCode(prompt: string) {
        // Secure-coder generates code then audits it
        console.log('Generating secure code:', prompt);

        const codeResult = await this.client
            .agent('syntax-wizard')
            .code(prompt, 'typescript')
            .session(this.sessionId)
            .execute();

        if (!codeResult.success) {
            throw new Error(`Code generation failed: ${codeResult.error}`);
        }

        const code = codeResult.result.text;

        // Audit the generated code
        const auditResult = await this.client
            .agent('quantum-sage')
            .audit(code, 'typescript')
            .session(this.sessionId)
            .execute();

        return {
            code,
            audit: auditResult.result
        };
    }

    async checkBudget() {
        const budget = await this.client.getBudgetStatus(this.sessionId);
        return {
            dailyRemaining: budget.dailyRemaining,
            monthlyRemaining: budget.monthlyRemaining,
            dailyUsedPercent: budget.percentageUsedDaily,
            monthlyUsedPercent: budget.percentageUsedMonthly
        };
    }
}

// Usage
const app = new MyAgentApp('user-123');
const research = await app.runResearch('blockchain scalability');
console.log('Research:', research);

const code = await app.generateSecureCode(
    'Create a secure payment contract'
);
console.log('Code:', code.code);
console.log('Audit:', code.audit.findings);

const budget = await app.checkBudget();
console.log('Budget status:', budget);
```

---

## 5. Next.js API Route

```typescript
// pages/api/my-agent-endpoint.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import AgentClient from '@/lib/agents/client';

const client = new AgentClient({
    baseUrl: process.env.AETHER_BASE_URL || 'http://localhost:3000'
});

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { agentId, capability, parameters, userId } = req.body;

        // Create session if needed
        let sessionId = req.headers['x-session-id'] as string;
        if (!sessionId) {
            const session = await client.createSession(userId);
            sessionId = session.id;
        }

        // Execute agent
        const result = await client.execute({
            agentId,
            capability,
            parameters,
            sessionId
        });

        res.status(200).json({
            ...result,
            sessionId
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error'
        });
    }
}
```

---

## 6. Custom Hook (React)

```typescript
// hooks/useAgent.ts
import { useState, useCallback } from 'react';
import AgentClient from '@/lib/agents/client';

export function useAgent(sessionId?: string) {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [result, setResult] = useState(null);

    const client = new AgentClient({
        baseUrl: 'http://localhost:3000'
    });

    const execute = useCallback(async (
        agentId: string,
        capability: string,
        parameters: any
    ) => {
        setLoading(true);
        setError(null);

        try {
            const response = await client.execute({
                agentId,
                capability,
                parameters,
                sessionId
            });

            if (response.success) {
                setResult(response.result);
            } else {
                setError(response.error || 'Unknown error');
            }

            return response;
        } catch (err) {
            const errorMsg = err instanceof Error ? err.message : 'Unknown error';
            setError(errorMsg);
            return { success: false, error: errorMsg };
        } finally {
            setLoading(false);
        }
    }, [sessionId]);

    return { execute, loading, error, result };
}

// Usage in component
function MyComponent() {
    const { execute, loading, result } = useAgent('session-123');

    async function handleClick() {
        await execute('atlas-ai', 'text-generation', {
            prompt: 'Hello world'
        });
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

## 7. Simple HTML File

Create `index.html` and copy this:

```html
<!DOCTYPE html>
<html>
<head>
    <title>Aether Agent Demo</title>
    <style>
        body { font-family: Arial; max-width: 800px; margin: 40px auto; }
        input, button { padding: 10px; margin: 5px; }
        .result { background: #f0f0f0; padding: 15px; margin-top: 20px; border-radius: 5px; }
        .loading { color: #666; font-style: italic; }
    </style>
</head>
<body>
    <h1>Aether Agent SDK Demo</h1>

    <div>
        <h2>Generate Text</h2>
        <input type="text" id="textPrompt" placeholder="Enter prompt..." value="Write a poem">
        <button onclick="generateText()">Generate</button>
    </div>

    <div id="result"></div>

    <script>
        // Paste the AgentClient code here (from src/lib/agents/client.ts)
        // Then use it:

        const client = new AgentClient({
            baseUrl: 'http://localhost:3000'
        });

        async function generateText() {
            const resultDiv = document.getElementById('result');
            const prompt = document.getElementById('textPrompt').value;

            resultDiv.innerHTML = '<div class="loading">Generating...</div>';

            try {
                const result = await client
                    .agent('atlas-ai')
                    .text(prompt)
                    .execute();

                if (result.success) {
                    resultDiv.innerHTML = `
                        <div class="result">
                            <h3>Generated Text:</h3>
                            <p>${result.result.text}</p>
                            <small>Cost: ${result.costInOctas} octas | 
                            Time: ${result.executionTimeMs}ms</small>
                        </div>
                    `;
                } else {
                    resultDiv.innerHTML = `<div class="result error">Error: ${result.error}</div>`;
                }
            } catch (error) {
                resultDiv.innerHTML = `<div class="result error">Error: ${error.message}</div>`;
            }
        }
    </script>
</body>
</html>
```

---

## 8. Python Example

```python
import requests
import json
from typing import Optional

class AetherAgent:
    def __init__(self, base_url: str = "http://localhost:3000"):
        self.base_url = base_url
        self.session_id = None

    def create_session(self, user_id: str, daily_spend: str = "500000000") -> str:
        """Create a session with spending limits"""
        response = requests.post(
            f"{self.base_url}/api/sessions/config",
            json={
                "action": "create",
                "userId": user_id,
                "maxDailySpend": daily_spend
            }
        )
        session = response.json()
        self.session_id = session["id"]
        return self.session_id

    def execute_agent(
        self,
        agent_id: str,
        capability: str,
        parameters: dict,
        max_price: Optional[str] = None
    ) -> dict:
        """Execute an agent"""
        payload = {
            "agentId": agent_id,
            "capability": capability,
            "parameters": parameters
        }
        
        if self.session_id:
            payload["sessionId"] = self.session_id
        if max_price:
            payload["maxPrice"] = max_price

        response = requests.post(
            f"{self.base_url}/api/agent/execute",
            json=payload
        )
        return response.json()

    def text_generation(self, prompt: str) -> str:
        """Generate text"""
        result = self.execute_agent(
            "atlas-ai",
            "text-generation",
            {"prompt": prompt}
        )
        return result["result"]["text"] if result["success"] else None

    def search(self, query: str) -> list:
        """Web search"""
        result = self.execute_agent(
            "search-sage",
            "web-search",
            {"query": query}
        )
        return result["result"]["results"] if result["success"] else []

    def get_budget(self) -> dict:
        """Get budget status"""
        response = requests.get(
            f"{self.base_url}/api/sessions/config",
            params={"action": "budget-status", "sessionId": self.session_id}
        )
        return response.json()


# Usage
if __name__ == "__main__":
    agent = AetherAgent()
    agent.create_session("user-123")

    # Generate text
    text = agent.text_generation("Explain AI in one paragraph")
    print(f"Generated: {text}")

    # Search
    results = agent.search("blockchain scalability solutions")
    for result in results:
        print(f"- {result['title']}: {result['link']}")

    # Check budget
    budget = agent.get_budget()
    print(f"Daily remaining: {budget['dailyRemaining']} octas")
```

---

## 9. cURL Examples

```bash
# Create session
curl -X POST http://localhost:3000/api/sessions/config \
  -H "Content-Type: application/json" \
  -d '{
    "action": "create",
    "userId": "user-123",
    "maxDailySpend": "500000000"
  }'

# Generate text
curl -X POST http://localhost:3000/api/agent/execute \
  -H "Content-Type: application/json" \
  -d '{
    "agentId": "atlas-ai",
    "capability": "text-generation",
    "parameters": {"prompt": "Write a poem"},
    "sessionId": "session-xxx"
  }'

# Search web
curl -X POST http://localhost:3000/api/agent/execute \
  -H "Content-Type: application/json" \
  -d '{
    "agentId": "search-sage",
    "capability": "web-search",
    "parameters": {"query": "AI news"}
  }'

# Get budget status
curl http://localhost:3000/api/sessions/config?action=budget-status&sessionId=session-xxx

# Discover agents
curl http://localhost:3000/api/agents/discover?action=list

# Find best agent for capability
curl -X POST http://localhost:3000/api/agents/discover \
  -H "Content-Type: application/json" \
  -d '{
    "action": "find-best",
    "capability": "text-generation"
  }'
```

---

## Installation

### Option 1: Copy & Paste
1. Copy `src/lib/agents/client.ts` to your project
2. Import and use as shown in examples above

### Option 2: Direct Import (if your project imports from this repo)
```typescript
import AgentClient from 'aether-market/src/lib/agents/client';
```

### Option 3: Use via API (no SDK needed)
All examples work by calling the HTTP API directly. Use your favorite HTTP client (fetch, axios, requests, etc.)

---

## Quick Start

### 5-Minute Setup

1. **Initialize Client:**
```typescript
const client = new AgentClient({ baseUrl: 'http://localhost:3000' });
```

2. **Create Session:**
```typescript
const session = await client.createSession('user-123');
```

3. **Execute Agent:**
```typescript
const result = await client
    .agent('atlas-ai')
    .text('Your prompt here')
    .session(session.id)
    .execute();
```

4. **Use Result:**
```typescript
console.log(result.result.text);
```

That's it! 🚀

---

## Available Agents

| Agent | Method | Cost |
|-------|--------|------|
| **Atlas AI** | `.text()` | 0.02 APT |
| **Neural Alpha** | `.image()` | 0.05 APT |
| **Quantum Sage** | `.audit()` | 0.03 APT |
| **Syntax Wizard** | `.code()` | 0.03 APT |
| **Oracle Prime** | `.finance()` | 0.02 APT |
| **Search Sage** | `.search()` | 0.01 APT |
| **Sentiment Bot** | `.sentiment()` | 0.01 APT |

---

## Troubleshooting

**"Module not found"**
- Make sure you've copied `client.ts` to your project
- Update import path if needed

**"CORS errors"**
- Make sure API is running on the baseUrl
- For local dev: `http://localhost:3000`

**"Budget exceeded"**
- Check budget status: `await client.getBudgetStatus(sessionId)`
- Increase limits: `await client.createSession(userId, { maxDailySpend: '...' })`

**"Session expired"**
- Sessions expire after 24 hours
- Create a new session if needed

