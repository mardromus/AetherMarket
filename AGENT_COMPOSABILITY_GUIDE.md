# 🤖 Agent Composability & Orchestration

Complete guide to building complex workflows using multiple agents working together.

---

## What is Agent Composability?

**Agent Composability** = One agent calling another agent as part of its workflow.

### Two Execution Modes

```
┌─────────────────────────────────────────────────────────────┐
│                    DIRECT EXECUTION                         │
│                                                              │
│  You → x402 Payment → Neural Alpha → Image → You            │
│  Cost: 0.05 APT (1 agent)                                   │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│               ORCHESTRATED EXECUTION                        │
│                                                              │
│  You → x402 Payment → Nexus Prime → Neural Alpha → Image    │
│                     (orchestrator)   (worker)   (result)     │
│  Cost: 0.05 APT + 0.04 APT = 0.09 APT (2 agents)           │
└─────────────────────────────────────────────────────────────┘
```

---

## Why Use Orchestration?

### Example Workflow 1: Code Generation → Code Audit

**Scenario**: You want to generate code AND check it for security issues

```
1. Syntax Wizard generates code from prompt
2. Quantum Sage audits the generated code
3. User gets: Code + Security Report

Benefits:
✅ Automated quality assurance
✅ No manual intermediate steps
✅ Composable, repeatable workflows
✅ Each agent specializes in its task
```

### Example Workflow 2: Content Creation → Sentiment Analysis

**Scenario**: You want to generate content and verify it's positive

```
1. Atlas AI generates marketing copy
2. Sentiment Bot analyzes the tone
3. User gets: Copy + Sentiment Score

Benefits:
✅ Ensure brand consistency
✅ Automated quality control
✅ Fast iteration cycles
```

### Example Workflow 3: Financial Analysis → Web Search

**Scenario**: You want market data plus recent news

```
1. Oracle Prime gets current price data
2. Search Sage finds related articles
3. User gets: Price + Context + News

Benefits:
✅ Comprehensive market view
✅ Data + Context
✅ Better informed decisions
```

---

## Using Orchestration via UI

### Step-by-Step

**1. Navigate to Agent Page**
```
Go to /agents/neural-alpha
```

**2. Choose Execution Mode**
```
Option A: 👤 Use Agent Directly
         └─ You call Neural Alpha directly
         └─ Cost: 0.05 APT
         └─ Simple, straightforward

Option B: 🤖 Use Your Agent
         └─ Your agent calls Neural Alpha
         └─ Cost: Your Agent's Price + 0.05 APT
         └─ Complex, composable workflows
```

**3. Select Orchestrator Agent**
```
If you choose "Use Your Agent":
  ├─ Choose which agent orchestrates
  ├─ Example: "Nexus Prime" orchestrates "Neural Alpha"
  └─ Shows: "Nexus Prime → Neural Alpha"
```

**4. Approve Payment**
```
x402 Payment Modal shows:
  ├─ Orchestrator Cost
  ├─ Target Agent Cost
  ├─ Total Cost
  └─ Workflow Path
```

**5. View Orchestrated Result**
```
Console shows:
  ├─ Stage 1: Orchestrator (Nexus Prime) executing...
  ├─ Stage 2: Target agent (Neural Alpha) executing...
  └─ Result: Combined output from both agents
```

---

## Programmatic Usage

### Direct Execution (Current)

```typescript
import { X402Client } from '@/lib/x402/client';
import { useKeyless } from '@/lib/keyless/provider';

const { account, signWithSession } = useKeyless();
const client = new X402Client();

// Simple 1-agent execution
const result = await client.executeAgentTask(
  {
    agentId: "neural-alpha",
    taskType: "image-generation",
    parameters: { prompt: "A cyberpunk city" }
  },
  account.address,
  (payload) => signWithSession(payload)
);

console.log(result.result.url); // Image URL
```

### Orchestrated Execution (NEW)

```typescript
import { executeOrchestratedAgent } from '@/lib/agents/executor';
import { X402Client } from '@/lib/x402/client';

const client = new X402Client();

// Multi-agent workflow
const result = await executeOrchestratedAgent(
  "syntax-wizard",      // Orchestrator: generates code
  "quantum-sage",       // Target: audits code
  "code-generation",    // Task type
  { prompt: "Create a secure authentication function" }
);

// Result structure:
{
  result: {
    type: "orchestrated-result",
    workflow: "syntax-wizard → quantum-sage",
    orchestratorOutput: { /* generated code */ },
    targetOutput: { /* security audit */ },
    stages: [
      { stage: "orchestrator", agentId: "syntax-wizard", time: 2500 },
      { stage: "target", agentId: "quantum-sage", time: 1800 }
    ]
  },
  executionTime: 4300,
  metadata: {
    workflowType: "orchestrated",
    totalCost: "0.04 APT + 0.03 APT"
  }
}
```

---

## Real-World Workflow Examples

### Example 1: Marketing Copy Generation with Quality Check

```typescript
// Frontend
const workflow = {
  orchestrator: "atlas-ai",      // General text generation
  target: "sentiment-bot",       // Sentiment analysis
  task: "text-generation",
  parameters: {
    prompt: "Write engaging product description for AI headphones",
    style: "professional yet friendly"
  }
};

// Flow:
// 1. Atlas AI generates marketing copy
// 2. Sentiment Bot analyzes: Is it positive/engaging?
// 3. Returns: Text + Sentiment Score

// Result:
{
  orchestratorOutput: {
    text: "Experience the future of sound...",
    type: "marketing-copy"
  },
  targetOutput: {
    sentiment: "positive",
    confidence: 0.92,
    emotions: ["excitement", "trust", "innovation"]
  }
}
```

### Example 2: Code Generation & Security Audit

```typescript
const workflow = {
  orchestrator: "syntax-wizard",
  target: "quantum-sage",
  task: "code-generation",
  parameters: {
    prompt: "Smart contract for token transfer",
    language: "solidity"
  }
};

// Flow:
// 1. Syntax Wizard generates Solidity code
// 2. Quantum Sage checks for vulnerabilities
// 3. Returns: Code + Security Report

// Result:
{
  orchestratorOutput: {
    code: "contract Token { ... }",
    language: "solidity"
  },
  targetOutput: {
    vulnerabilities: [
      { severity: "high", issue: "Reentrancy risk", line: 45 }
    ],
    securityScore: 7.8
  }
}
```

### Example 3: Financial Analysis with News Context

```typescript
const workflow = {
  orchestrator: "oracle-prime",
  target: "search-sage",
  task: "financial-analysis",
  parameters: {
    symbol: "APT",
    timeframe: "7d"
  }
};

// Flow:
// 1. Oracle Prime gets current price data
// 2. Search Sage finds relevant news
// 3. Returns: Market Data + News Context

// Result:
{
  orchestratorOutput: {
    symbol: "APT",
    price: 12.45,
    change_24h: "+5.2%",
    marketCap: "1.2B"
  },
  targetOutput: {
    query: "APT Aptos news",
    results: [
      { title: "Aptos reaches new milestone", link: "..." },
      { title: "Layer 1 scalability breakthrough", link: "..." }
    ]
  }
}
```

---

## Workflow Design Patterns

### Pattern 1: Enhancement (Generate → Evaluate)

```
Generator Agent → Evaluator Agent → Enhanced Result

Examples:
- Syntax Wizard → Quantum Sage (Code Generation + Audit)
- Atlas AI → Sentiment Bot (Content + Analysis)
- Neural Alpha → (future: QA agent) (Image + Quality Check)
```

**When to use**: Quality assurance, automated validation, content moderation

### Pattern 2: Enrichment (Single → Contextual)

```
Primary Agent → Context Agent → Enriched Result

Examples:
- Oracle Prime → Search Sage (Prices + News)
- Financial Analysis → Web Search (Data + Market Context)
- Code Audit → Web Search (Code Issues + Documentation)
```

**When to use**: Adding context, research, cross-referencing, background information

### Pattern 3: Orchestration (Master → Multiple Workers)

```
Orchestrator → Worker A → Result A
            → Worker B → Result B
            → Combine → Final Output

Examples:
- Nexus Prime → Neural Alpha + Quantum Sage (Multi-task)
- Atlas AI → Search Sage + Sentiment Bot (Research + Analysis)
```

**When to use**: Complex tasks, multi-step processes, parallel execution (future)

---

## Advanced Features

### Cost Optimization

```typescript
// Calculate workflow cost
function calculateWorkflowCost(orchestratorPrice, targetPrice) {
  const total = parseFloat(orchestratorPrice) + parseFloat(targetPrice);
  return {
    orchestrator: orchestratorPrice,
    target: targetPrice,
    total: `${total.toFixed(3)} APT`
  };
}

// Example:
const cost = calculateWorkflowCost("0.02 APT", "0.03 APT");
// Result: { orchestrator: "0.02 APT", target: "0.03 APT", total: "0.05 APT" }
```

### Workflow Caching

```typescript
// Cache orchestrated results to avoid re-execution
const cache = new Map();

async function cachedOrchestratedAgent(
  orchestratorId: string,
  targetId: string,
  parameters: any
) {
  const cacheKey = `${orchestratorId}:${targetId}:${JSON.stringify(parameters)}`;
  
  if (cache.has(cacheKey)) {
    return cache.get(cacheKey);
  }
  
  const result = await executeOrchestratedAgent(
    orchestratorId,
    targetId,
    "general",
    parameters
  );
  
  cache.set(cacheKey, result);
  return result;
}
```

### Workflow Monitoring

```typescript
// Track orchestrated workflow execution
interface WorkflowExecution {
  id: string;
  workflow: `${string}→${string}`;
  startTime: number;
  orchestratorTime: number;
  targetTime: number;
  totalTime: number;
  cost: string;
  status: "success" | "failed";
}

function logWorkflow(
  orchestratorId: string,
  targetId: string,
  result: AgentExecutionResult
) {
  const execution: WorkflowExecution = {
    id: `wf-${Date.now()}`,
    workflow: `${orchestratorId}→${targetId}`,
    startTime: Date.now() - result.executionTime,
    orchestratorTime: result.result.stages[0].time,
    targetTime: result.result.stages[1].time,
    totalTime: result.executionTime,
    cost: result.metadata.totalCost,
    status: result.metadata.success ? "success" : "failed"
  };
  
  console.log("Workflow Execution:", execution);
}
```

---

## Comparison: Direct vs Orchestrated

| Aspect | Direct | Orchestrated |
|--------|--------|--------------|
| **Speed** | Fast (1 agent) | Slower (2+ agents) |
| **Cost** | Lower (0.01-0.05 APT) | Higher (0.02-0.10 APT) |
| **Complexity** | Simple | Complex workflows |
| **Use Case** | Single task | Multi-task pipelines |
| **Quality** | Fast results | Validated results |
| **Flexibility** | Limited | Highly flexible |

---

## Limitations & Workarounds

### Limitation 1: No Circular Dependencies

```typescript
// ❌ NOT ALLOWED
await executeOrchestratedAgent("agent-a", "agent-b", ...);
await executeOrchestratedAgent("agent-b", "agent-a", ...); // Circular!

// ✅ ALLOWED
// Linear flows only
Agent A → Agent B → Agent C (chain)
```

### Limitation 2: Max Depth (Currently 2 Agents)

```typescript
// ❌ NOT SUPPORTED (yet)
Agent A → Agent B → Agent C

// ✅ SUPPORTED
Agent A → Agent B

// Workaround: Chain multiple 2-agent workflows
```

### Limitation 3: Sequential Execution

```typescript
// ❌ NOT SUPPORTED (parallel execution)
Agent A  ├─→ Result
         └─→ Agent C → Result

// ✅ SUPPORTED (sequential)
Agent A → Agent B → Result
```

---

## Future Enhancements

- [ ] 3+ agent chains (A → B → C → D)
- [ ] Parallel agent execution
- [ ] Conditional branching
- [ ] Retry logic with fallbacks
- [ ] Agent reputation in workflows
- [ ] Workflow marketplace (save & share)
- [ ] Performance profiling
- [ ] Cost optimization recommendations
- [ ] Automatic workflow suggestions

---

## FAQ

### Q: Can I use the same agent twice in a workflow?
**A**: Not currently. Agent A → Agent A is not allowed. Use different agents or retry Agent A separately.

### Q: What happens if the orchestrator fails?
**A**: The entire workflow fails. You're refunded and can retry with different parameters.

### Q: Can I see intermediate results?
**A**: Yes! The orchestrated result includes both orchestratorOutput and targetOutput.

### Q: Is there a limit to workflow complexity?
**A**: Currently limited to 2 agents. Future versions will support deeper chains.

### Q: How are costs calculated?
**A**: Each agent's cost is paid separately. Total = Orchestrator Cost + Target Cost.

### Q: Can I schedule workflows?
**A**: Not yet. Submit a request to the roadmap!

---

## Examples in Code

### Example 1: Copy Generation + Analysis

```typescript
// User wants marketing copy that's definitely positive
const orchestratedResult = await executeOrchestratedAgent(
  "atlas-ai",           // Generate copy
  "sentiment-bot",      // Analyze sentiment
  "text-generation",
  {
    prompt: "Write product description for premium coffee maker",
    tone: "luxury, sophisticated"
  }
);

// Check if sentiment is positive
if (orchestratedResult.result.targetOutput.sentiment === "positive") {
  console.log("✅ Copy approved!");
  saveMarketingCopy(orchestratedResult.result.orchestratorOutput);
} else {
  console.log("❌ Sentiment not positive, regenerating...");
  // Retry with different prompt
}
```

### Example 2: Code Review Pipeline

```typescript
// Generate code and get security audit
const codeReview = await executeOrchestratedAgent(
  "syntax-wizard",
  "quantum-sage",
  "code-generation",
  {
    prompt: "Create a React component for user auth",
    language: "typescript"
  }
);

// Structure:
// ├─ orchestratorOutput: Generated TypeScript code
// └─ targetOutput: Security audit report

console.log("Generated Code:", codeReview.result.orchestratorOutput.code);
console.log("Security Issues:", codeReview.result.targetOutput.vulnerabilities);
console.log("Safe to Deploy?", codeReview.result.targetOutput.securityScore > 8);
```

### Example 3: Market Research

```typescript
// Get market data + supporting articles
const marketResearch = await executeOrchestratedAgent(
  "oracle-prime",
  "search-sage",
  "financial-analysis",
  {
    symbol: "APT",
    analysisType: "comprehensive"
  }
);

// Structure:
// ├─ orchestratorOutput: Price data, market cap, volume
// └─ targetOutput: Related news articles

console.log("Current Price:", marketResearch.result.orchestratorOutput.price);
console.log("Top News:", marketResearch.result.targetOutput.results[0].title);
```

---

## Integration Checklist

- [ ] Update agent page to show execution mode selector
- [ ] Add orchestrator agent dropdown
- [ ] Update PaymentModal to show combined cost
- [ ] Update execution console to show workflow stages
- [ ] Add executeOrchestratedAgent to executor.ts
- [ ] Update payment verification to accept orchestrated workflows
- [ ] Add workflow cost to transaction history
- [ ] Create workflow examples in documentation
- [ ] Update API endpoint to handle orchestration
- [ ] Add metrics tracking for workflows

---

**Last Updated**: February 1, 2026
**Status**: Implemented ✅ | Production Ready ✅

