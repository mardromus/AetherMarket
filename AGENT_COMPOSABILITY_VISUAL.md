# 🔗 Agent Composability Quick Visual Guide

Visual walkthrough of the agent composability feature.

---

## The Relationship: Neural Grid ↔ Agent Marketplace

```
                    NEURAL GRID
         (Decentralized Swarm Orchestration)
                        │
                    Manages & Orchestrates
                        │
            ┌───────────┴───────────┐
            │                       │
        Nexus Prime           Deep Think v9
        Vortex Renderer       Data Suit 7
            │                       │
            └───────────┬───────────┘
                        │
                        ↓
            AGENT MARKETPLACE
        (Individual AI Agents)
                        │
        ┌───────┬───────┼────────┬────────┐
        │       │       │        │        │
    Neural   Quantum Oracle  Syntax  Atlas
    Alpha    Sage    Prime   Wizard   AI
        │       │       │        │        │
        ↓       ↓       ↓        ↓        ↓
     Image   Code   Finance  Code    Text
     Gen     Audit  Data     Gen     Gen


RELATIONSHIP:
Neural Grid ORCHESTRATES Agents (decides which ones to use)
Agents EXECUTE TASKS individually or together
```

---

## Two Execution Modes Visualized

### Mode 1: Direct Execution

```
┌─────────────┐
│   User      │
│ (You)       │
└──────┬──────┘
       │
       │ 1. Select Agent
       │    (e.g., "Generate Image")
       ↓
┌──────────────────────────┐
│ x402 PAYMENT             │
│ Amount: 0.05 APT         │
│ Recipient: Treasury      │
│ Wallet: Approve ✓        │
└──────┬───────────────────┘
       │
       │ 2. Blockchain Confirms
       │    (On-chain settlement)
       ↓
┌──────────────────────────┐
│ NEURAL ALPHA             │
│ (Image Generation)       │
│ Running...               │
└──────┬───────────────────┘
       │
       │ 3. Image Generated
       ↓
┌──────────────────────────┐
│ RESULT                   │
│ Image URL: https://...   │
│ Cost: 0.05 APT           │
│ Time: 2.3 seconds        │
└──────────────────────────┘

TIME: ~3 seconds
COST: 0.05 APT
AGENTS: 1 (Direct)
```

---

### Mode 2: Orchestrated Execution

```
┌──────────────┐
│   User       │
│  (You)       │
└──────┬───────┘
       │
       │ 1. Select Execution Mode
       │    → "Use Your Agent"
       ↓
┌──────────────────────────┐
│ SELECT ORCHESTRATOR      │
│ Agent: Syntax Wizard ▼   │
│ Task: Code Audit         │
│ Workflow: Wizard → Sage  │
└──────┬───────────────────┘
       │
       │ 2. x402 PAYMENT
       │    Wizard: 0.03 APT
       │    Sage:   0.03 APT
       │    Total:  0.06 APT
       ↓
┌──────────────────────────┐
│ WALLET APPROVAL          │
│ Blockchain Confirms ✓    │
└──────┬───────────────────┘
       │
       │ 3. Stage 1: Orchestrator
       ↓
┌──────────────────────────┐
│ SYNTAX WIZARD            │
│ Input: "Create auth fn"  │
│ Status: Generating...    │
└──────┬───────────────────┘
       │ Output: Generated Code
       │
       │ 4. Stage 2: Target Agent
       ↓
┌──────────────────────────┐
│ QUANTUM SAGE             │
│ Input: Generated Code    │
│ Status: Auditing...      │
└──────┬───────────────────┘
       │ Output: Security Report
       │
       │ 5. Results Combined
       ↓
┌──────────────────────────┐
│ WORKFLOW RESULT          │
│                          │
│ Workflow: Wizard → Sage  │
│ Stage 1 Time: 2.1s       │
│ Stage 2 Time: 1.8s       │
│ Total Time: 3.9s         │
│                          │
│ Stage 1 Output:          │
│   Code: function auth... │
│                          │
│ Stage 2 Output:          │
│   Issues: 2              │
│   Severity: Medium       │
│   Score: 7.8/10         │
│                          │
│ Total Cost: 0.06 APT     │
└──────────────────────────┘

TIME: ~4 seconds
COST: 0.06 APT (3¢ + 3¢)
AGENTS: 2 (Orchestrated)
WORKFLOW: Syntax Wizard → Quantum Sage
```

---

## Three Workflow Patterns

### Pattern 1: Enhancement (Evaluate → Improve)

```
INPUT
  ↓
[GENERATOR AGENT]
Syntax Wizard generates code
  ↓
INTERMEDIATE: Generated code
  ↓
[EVALUATOR AGENT]
Quantum Sage audits for security
  ↓
OUTPUT
Code + Security Report
Status: Safe ✓ or Unsafe ✗

EXAMPLES:
- Generate Copy → Analyze Sentiment
- Generate Code → Audit Security
- Generate Image → Check Quality
```

---

### Pattern 2: Enrichment (Context → Enhanced)

```
INPUT
  ↓
[PRIMARY AGENT]
Oracle Prime gets market data
  ↓
INTERMEDIATE: Price, cap, volume
  ↓
[CONTEXT AGENT]
Search Sage finds related news
  ↓
OUTPUT
Market Data + News Context
Better informed decision

EXAMPLES:
- Prices → Market News
- Data → Supporting Articles
- Numbers → Interpretation
```

---

### Pattern 3: Coordination (Master → Workers)

```
INPUT
  ↓
[ORCHESTRATOR]
Nexus Prime (Master)
Decides what to do
  ↓
ROUTES TO:
├─ Atlas AI (Text generation)
├─ Neural Alpha (Image gen)
└─ Quantum Sage (Code review)
  ↓
OUTPUT
Multi-task results combined
Complete solution

EXAMPLES:
- Content + Images + Code Review
- Blog Post + Thumbnail + Quality Check
- Product Desc + Image + Sentiment
```

---

## Real Example: Code Review Pipeline

### User's Goal
"Generate a React component AND make sure it's secure"

### Workflow

```
START
  ↓
USER CHOOSES:
  Orchestrator: Syntax Wizard
  Target: Quantum Sage
  Task: Generate React Auth Component
  ↓
PAYMENT (x402):
  Amount: 0.06 APT (0.03 + 0.03)
  ✓ Approved in wallet
  ↓
STAGE 1: SYNTAX WIZARD (Orchestrator)
┌──────────────────────────────────────┐
│ Generate React Component             │
│ Language: TypeScript                 │
│ Features: Auth, validation           │
│ Status: ✓ Complete (2.1s)            │
│                                      │
│ Output:                              │
│ export const AuthForm = () => {      │
│   const [password, setPassword] ... │
│   return (                           │
│     <form onSubmit={handleAuth}>     │
│       <input />                      │
│     </form>                          │
│   );                                 │
│ };                                   │
└──────────────────────────────────────┘
  ↓
STAGE 2: QUANTUM SAGE (Target)
┌──────────────────────────────────────┐
│ Security Audit                       │
│ Input: Generated code above          │
│ Status: ✓ Complete (1.8s)            │
│                                      │
│ Security Report:                     │
│ ✓ No hardcoded secrets               │
│ ✗ Missing CSRF protection            │
│ ✓ Input validation present           │
│ ✓ No XSS vulnerabilities            │
│                                      │
│ Security Score: 7.8/10               │
│ Recommendation: Add CSRF token       │
└──────────────────────────────────────┘
  ↓
COMBINED OUTPUT:
  Code: ✓ Generated
  Quality: 7.8/10
  Issues: 1 (CSRF protection)
  Total Time: 3.9s
  Total Cost: 0.06 APT
  
RESULT: User has code + audit in one transaction ✓
END
```

---

## UI Walkthrough

### Step 1: Open Agent Page

```
Navigate to: http://localhost:3000/agents/quantum-sage

┌─────────────────────────────┐
│ AGENT: Quantum Sage         │
│ Code Audit & Security       │
│ Price: 0.03 APT             │
│ Rating: 4.9 ★              │
│ Status: Online ●            │
└─────────────────────────────┘
```

---

### Step 2: Choose Execution Mode

```
┌────────────────────────────────────────┐
│ EXECUTION MODE                         │
├────────────────────────────────────────┤
│ ○ 👤 Use Agent Directly               │
│   └─ You call Quantum Sage directly    │
│   └─ Cost: 0.03 APT                   │
│                                       │
│ ◉ 🤖 Use Your Agent                   │
│   └─ Your agent uses Quantum Sage     │
│   └─ Cost: Your Agent + 0.03 APT      │
│                                       │
│ ┌────────────────────────────────────┐│
│ │ Select your orchestrator agent:    ││
│ │                                    ││
│ │ [Syntax Wizard (0.03 APT) ▼]      ││
│ │                                    ││
│ │ 💡 Workflow: Syntax Wizard →      ││
│ │            Quantum Sage            ││
│ └────────────────────────────────────┘│
└────────────────────────────────────────┘
```

---

### Step 3: Review Costs

```
┌────────────────────────────────────────┐
│ x402 PAYMENT DETAILS                   │
├────────────────────────────────────────┤
│ Orchestrator:  Syntax Wizard           │
│ Target:        Quantum Sage            │
│                                       │
│ Costs:                                 │
│   Syntax Wizard  0.03 APT             │
│   Quantum Sage   0.03 APT             │
│   ────────────────────────           │
│   TOTAL:         0.06 APT             │
│                                       │
│ Workflow Path:                         │
│   Syntax Wizard → Quantum Sage        │
│                                       │
│ [APPROVE IN WALLET]  [CANCEL]         │
└────────────────────────────────────────┘
```

---

### Step 4: View Execution Stages

```
EXECUTION CONSOLE:

[14:32:15] 🤖 ORCHESTRATION MODE ACTIVE
[14:32:15] Orchestrator Agent: Syntax Wizard
[14:32:15] Target Agent: Quantum Sage
[14:32:15] Workflow: Syntax Wizard → Quantum Sage
[14:32:15] Total Cost: 0.06 APT
[14:32:15] Initializing x402 payment protocol...
[14:32:15] Task: code-audit

[14:32:16] ✓ Payment confirmed!
[14:32:16] Transaction: 0xabcd1234ef...

[14:32:16] Stage 1: Syntax Wizard (orchestrator) executing...
[14:32:18] ✓ Stage 1 complete (2.1s)
[14:32:18] Generated: 126 lines of TypeScript

[14:32:18] Stage 2: Quantum Sage executing...
[14:32:20] ✓ Stage 2 complete (1.8s)
[14:32:20] Security Issues Found: 1

[14:32:20] ✓ Workflow Complete!
[14:32:20] Total Time: 3.9 seconds
[14:32:20] Cost: 0.06 APT
[14:32:20] Status: SUCCESS ✓
```

---

## Cost Comparison

### Example: Code Generation + Audit

```
┌─────────────────────────────────┐
│ OPTION 1: Direct (2 Requests)   │
├─────────────────────────────────┤
│ Request 1: Syntax Wizard        │
│   Cost: 0.03 APT                │
│   Time: 2.5s                    │
│   Result: Generated code        │
│                                 │
│ Request 2: Quantum Sage         │
│   Cost: 0.03 APT                │
│   Time: 1.8s                    │
│   Result: Security audit        │
│                                 │
│ Total Cost: 0.06 APT (manual)   │
│ Total Time: 4.3s (sequential)   │
│ Coordination: Manual ❌          │
└─────────────────────────────────┘

┌─────────────────────────────────┐
│ OPTION 2: Orchestrated          │
├─────────────────────────────────┤
│ Workflow: Wizard → Sage         │
│   Cost: 0.06 APT (automated)    │
│   Time: 3.9s (optimized)        │
│   Result: Code + Audit          │
│   Coordination: Automatic ✓      │
│   Intermediate: 1 transaction   │
│   Approval: 1 time              │
│                                 │
│ Advantages:                     │
│   ✓ Single transaction          │
│   ✓ Automatic handoff           │
│   ✓ Cleaner workflow            │
│   ✓ Faster than manual          │
└─────────────────────────────────┘
```

---

## Technical Diagram

```
USER INTERFACE LAYER
┌─────────────────────────────────────┐
│ Agent Page [id].page.tsx            │
│ ├─ Mode Selector UI                 │
│ ├─ Orchestrator Dropdown            │
│ └─ Execute Button                   │
└──────────────┬──────────────────────┘
               │
BUSINESS LOGIC LAYER
┌──────────────▼──────────────────────┐
│ handleExecuteAgent()                │
│ ├─ Validate inputs                  │
│ ├─ Determine mode                   │
│ ├─ Calculate costs                  │
│ └─ Open PaymentModal                │
└──────────────┬──────────────────────┘
               │
EXECUTION LAYER
┌──────────────▼──────────────────────┐
│ executeAgent() or                   │
│ executeOrchestratedAgent()           │
│                                     │
│ ORCHESTRATED PATH:                  │
│ ├─ Call Agent A (Orchestrator)      │
│ ├─ Pass Output → Agent B (Target)   │
│ └─ Combine Results                  │
└──────────────┬──────────────────────┘
               │
BLOCKCHAIN LAYER
┌──────────────▼──────────────────────┐
│ Aptos Testnet                       │
│ ├─ Verify Payment                   │
│ ├─ Settle x402                      │
│ └─ Record on-chain                  │
└─────────────────────────────────────┘
```

---

## Key Benefits Visualization

```
WITHOUT COMPOSABILITY:
User → Agent A → Result A
User → Agent B → Result B
User → Process manually

❌ Manual coordination
❌ Multiple transactions
❌ Slow workflow
❌ Room for human error

─────────────────────────────────────

WITH COMPOSABILITY:
User → Orchestrated Workflow
   Agent A → Agent B → Combined Result

✅ Automatic coordination
✅ Single transaction
✅ Fast workflow
✅ No human error
✅ Complex pipelines possible
```

---

## Agent Composability Matrix

Which agents work well together?

```
┌────────────┬─────────┬─────────┬────────────┬───────────┐
│ Orchestr.  │ Syntax  │ Quantum │ Atlas AI   │ Search    │
│            │ Wizard  │ Sage    │            │ Sage      │
├────────────┼─────────┼─────────┼────────────┼───────────┤
│ Syntax W.  │ ✓ Yes   │ ✓ YES ⭐│ ✓ Yes     │ ✓ Yes    │
│ (Code Gen) │ (pair)  │ (audit) │ (similar) │ (search)  │
├────────────┼─────────┼─────────┼────────────┼───────────┤
│ Atlas AI   │ ✓ Yes   │ ✓ Yes   │ ✓ Yes     │ ✓ YES ⭐ │
│ (Text Gen) │ (code)  │ (review)│ (similar) │ (research)│
├────────────┼─────────┼─────────┼────────────┼───────────┤
│ Oracle     │ ✓ Yes   │ ✓ Yes   │ ✓ Yes     │ ✓ YES ⭐ │
│ (Finance)  │ (code)  │ (review)│ (analysis)│ (context) │
├────────────┼─────────┼─────────┼────────────┼───────────┤
│ Neural A.  │ ✓ Yes   │ ✓ Yes   │ ✓ Yes     │ ✓ Yes    │
│ (Image)    │ (verify)│ (check) │ (describe)│ (search)  │
└────────────┴─────────┴─────────┴────────────┴───────────┘

⭐ = Recommended combination
✓ = Works (though may not be optimal)
```

---

## Next Steps

1. **Try It**: Visit `/agents/quantum-sage`
2. **Select Mode**: Choose "Use Your Agent"
3. **Pick Orchestrator**: Select "Syntax Wizard"
4. **Approve**: Sign transaction in wallet
5. **Watch**: See both agents execute in console
6. **Review**: Compare results

---

**Status**: ✅ Production Ready | Release: Feb 1, 2026

