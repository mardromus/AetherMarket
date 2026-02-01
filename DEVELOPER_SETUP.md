# 🚀 AETHER MARKET - DEVELOPER SETUP & ARCHITECTURE

## Project Structure

```
aether-market/
├── src/
│   ├── app/                          # Next.js App Router
│   │   ├── admin/                    # Admin Dashboard (budgets, schemas, discovery)
│   │   ├── agents/                   # Agent Marketplace (browse & details)
│   │   ├── integration/              # Integration Guide (docs & examples)
│   │   ├── dashboard/                # User Dashboard (account, delegation)
│   │   ├── api/                      # API Routes
│   │   │   ├── agent/execute/        # Agent execution endpoint
│   │   │   └── mock-agent/           # Mock agent for testing
│   │   ├── auth/                     # Authentication
│   │   └── docs/                     # Documentation pages
│   │
│   ├── lib/
│   │   ├── agents/
│   │   │   ├── config.ts             # Unified agent configuration (9 agents)
│   │   │   ├── schemas.ts            # Complete TypeScript schemas for all agents
│   │   │   ├── executor.ts           # Agent execution logic
│   │   │   └── registry.ts           # Agent registry
│   │   │
│   │   ├── sdk/
│   │   │   └── aether.ts             # Aether SDK (browse, execute)
│   │   │
│   │   ├── x402/
│   │   │   ├── client.ts             # x402 Payment Client
│   │   │   ├── facilitator.ts        # Payment Facilitator
│   │   │   └── history.ts            # Payment History
│   │   │
│   │   ├── keyless/
│   │   │   ├── provider.tsx          # Keyless Account Provider
│   │   │   └── utils.ts              # Keyless utilities
│   │   │
│   │   └── constants.ts              # App constants
│   │
│   ├── components/
│   │   ├── Navbar.tsx               # Main navigation (4 links)
│   │   ├── AgentCard.tsx            # Agent display component
│   │   ├── PaymentModal.tsx         # Payment UI
│   │   ├── KeylessWalletSelector.tsx # Wallet selector
│   │   └── ui/                      # Shadcn UI components
│   │
│   └── store/
│       └── agentStore.ts            # Zustand agent store (synced from config)
│
├── contracts/                        # Move smart contracts
│   └── sources/
│       ├── agent_registry.move
│       ├── reputation.move
│       └── service_escrow.move
│
├── public/                          # Static assets
├── USER_GUIDE.md                   # User documentation
├── AGENTS.md                       # Agent specifications
└── package.json                    # Dependencies

```

---

## Key Files Overview

### 1. **Unified Agent Configuration** (`src/lib/agents/config.ts`)
- Single source of truth for all 9 agents
- Contains: costs, specs, categories, capabilities
- Used by: store, admin, marketplace, SDK

```typescript
export const AGENT_SPECS = {
    "neural-alpha": { name, model, cost, capabilities, ... },
    "quantum-sage": { ... },
    // ... 7 more agents
}
```

### 2. **Agent Schemas** (`src/lib/agents/schemas.ts`)
- Complete TypeScript interfaces for every agent
- Request/Response types
- Example requests and responses
- Input/output schemas
- Used by: type safety, documentation, client code

```typescript
export namespace NeuralAlpha {
    export interface Request extends AgentRequest { ... }
    export interface Response extends AgentResponse { ... }
    export const EXAMPLE_REQUEST = { ... }
    export const EXAMPLE_RESPONSE = { ... }
}
```

### 3. **Agent Store** (`src/store/agentStore.ts`)
- Zustand store synced from config
- Provides: agents list, methods to get agent by ID
- Used by: admin, marketplace, components

```typescript
const { agents } = useAgentStore();  // Array of 8 agents
```

### 4. **Admin Dashboard** (`src/app/admin/page.tsx`)
- 4 tabs:
  1. **Discovery** - Search agents by skill
  2. **All Agents** - Browse all agents with "Add Budget" buttons
  3. **Budgets** - Full budget CRUD system
  4. **Schemas & API** - View agent schemas with examples

### 5. **Integration Guide** (`src/app/integration/page.tsx`)
- Code examples for all 7 agents
- Universal request/response format
- Best practices
- Copy-able code snippets

### 6. **Agent Marketplace** (`src/app/agents/page.tsx`)
- Browse all agents
- View details and capabilities
- Links to agent-specific pages

---

## Data Flow Architecture

### User → Agent Request

```
User Input (UI)
    ↓
[X402Client.executeAgentTask()]
    ├─ Validate request
    ├─ Get agent specs from config
    └─ Call /api/agent/execute
        ↓
[API Route: /api/agent/execute]
    ├─ Receive request (402 response)
    ├─ User signs payment (keyless)
    ├─ Verify payment on Aptos
    ├─ Call appropriate agent handler
    │   ├─ If GPT-4o → OpenAI API
    │   ├─ If DALL-E → OpenAI API
    │   ├─ If CoinGecko → CoinGecko API
    │   └─ If SerpAPI → SerpAPI
    └─ Return result with cost
        ↓
[Client receives response]
    ├─ Check success flag
    ├─ Process result by agent type
    └─ Update UI / Budget
```

### Budget Flow

```
Create Budget
    ↓
[setSelectedAgentId, setBudgetAmount, setBudgetDays]
    ↓
[handleCreateBudget()]
    ├─ Validate inputs
    ├─ Calculate expiration
    └─ Add to budgets[] state
        ↓
Display Budget Card
    ├─ Show progress bar (spent/total)
    ├─ Show status (Active/Expired/Depleted)
    ├─ Show remaining balance
    └─ Show possible calls
        ↓
User clicks "Test Call"
    ↓
[handleSpendFromBudget()]
    ├─ Check remaining balance
    ├─ Deduct agent cost
    ├─ Update status if needed
    └─ Show toast notification
```

---

## Agent Execution Flow

### Example: Image Generation (Neural Alpha)

```typescript
// 1. User provides prompt
const request = {
    agentId: "neural-alpha",
    taskType: "image-generation",
    parameters: {
        prompt: "A futuristic city",
        size: "1024x1024"
    }
};

// 2. Client sends request
POST /api/agent/execute
Response: 402 Payment Required

// 3. Client signs payment
user.sign({
    transaction: paymentTx,
    budget: 0.05 APT
});

// 4. Server receives signed payment
POST /api/agent/execute
Headers: { "PAYMENT-SIGNATURE": {...} }

// 5. Server verifies payment on Aptos blockchain
waitForTransaction(txHash) → success

// 6. Server calls OpenAI API
const image = await openai.images.generate({
    model: "dall-e-3",
    prompt: "A futuristic city",
    size: "1024x1024"
});

// 7. Server returns result
{
    success: true,
    result: {
        imageUrl: "https://...",
        revisedPrompt: "..."
    },
    executionTime: 2500,
    cost: "50000"  // octas
}

// 8. Client receives and displays
displayImage(result.result.imageUrl);
console.log(`Cost: ${result.cost} octas (0.0005 APT)`);
```

---

## API Endpoints

### POST /api/agent/execute
**Purpose:** Execute any agent task with x402 payment

**First Request (Get Payment Quote):**
```json
POST /api/agent/execute
{
    "agentId": "neural-alpha",
    "taskType": "image-generation",
    "parameters": {
        "prompt": "A city",
        "size": "1024x1024"
    }
}

Response: 402 Payment Required
{
    "amount": "50000",
    "recipient": "0x1...",
    "requestId": "req-1234",
    "expiresAt": 1704067200000
}
```

**Second Request (With Payment):**
```json
POST /api/agent/execute
Headers: {
    "PAYMENT-SIGNATURE": "..."
}
{
    "agentId": "neural-alpha",
    "taskType": "image-generation",
    "parameters": { ... },
    "requestId": "req-1234"
}

Response: 200 OK
{
    "success": true,
    "result": { ... },
    "executionTime": 2500,
    "cost": "50000",
    "agentId": "neural-alpha",
    "taskType": "image-generation"
}
```

---

## Component Hierarchy

```
Navbar
├─ AGENTS link → /agents
│   └── AgentsPage
│       ├── Agent List (sidebar)
│       └── Agent Details (main)
│
├─ ADMIN link → /admin
│   └── AdminDashboard
│       ├── Discovery Tab
│       │   └── Search agents by skill
│       ├── All Agents Tab
│       │   └── Agent list + "Add Budget" buttons
│       ├── Budgets Tab
│       │   └── Budget management (CRUD)
│       └── Schemas & API Tab
│           └── Agent schema viewer
│
├─ DASHBOARD link → /dashboard
│   └── DashboardPage
│       └── User account info
│
└─ DOCS link → /docs
    └── DocumentationPage
```

---

## State Management

### Zustand Store (Agent Store)
```typescript
// src/store/agentStore.ts
export const useAgentStore = create((set) => ({
    agents: AGENT_SPECS.map(...),  // 8 agents
    getAgentById: (id) => agents.find(...),
    getAgentsByCategory: (cat) => agents.filter(...)
}));
```

### Component State (Admin Dashboard)
```typescript
const [activeTab, setActiveTab] = useState('discovery');
const [budgets, setBudgets] = useState<BudgetSession[]>([]);
const [selectedAgentId, setSelectedAgentId] = useState('');
const [budgetAmount, setBudgetAmount] = useState('');
// ... etc
```

### Local Storage (Future)
- Budget history
- Execution history
- User preferences

---

## Environment Variables

```bash
# .env.local

# Required: OpenAI API (for GPT-4, DALL-E, etc.)
OPENAI_API_KEY=sk_...

# Optional: Web search
SERP_API_KEY=...

# Optional: Stock data
ALPHA_VANTAGE_KEY=...

# Aptos Network
NEXT_PUBLIC_APTOS_NETWORK=testnet
```

---

## Development Workflow

### 1. Add a New Agent
1. **Add to config.ts**
```typescript
"my-agent": {
    name: "My Agent",
    model: "gpt-4o",
    cost: 0.02,  // APT
    // ...
}
```

2. **Add schema**
```typescript
// src/lib/agents/schemas.ts
export namespace MyAgent {
    export interface Request { ... }
    export interface Response { ... }
}
```

3. **Add handler**
```typescript
// src/lib/agents/executor.ts
async function handleMyAgent(params) {
    // Implementation
}
```

4. **Auto syncs to:**
- Store
- Marketplace
- Admin dashboard
- Integration guide

### 2. Modify Request/Response Schemas
- Update in `schemas.ts`
- Types auto-propagate
- Examples kept in sync
- Documentation auto-updates

### 3. Add Documentation
- Add example in `INTEGRATION_EXAMPLES`
- Add to `AGENT_INFO` in guide
- Schemas auto-generate from types

---

## Testing

### Manual Testing
1. Go to `/admin`
2. Select "Schemas & API" tab
3. Choose agent
4. Copy example request
5. Modify parameters as needed
6. Use X402Client to test

### Mock Agent Endpoint
```
GET /api/mock-agent?agentId=neural-alpha&params=...
```
Returns fake response for testing (no payment required)

---

## Performance Optimization

### Caching Strategy
```typescript
const cache = new Map<string, any>();

// Cache agent specs
const agents = useAgentStore(); // Cached in Zustand

// Cache search results
const [discoveredAgents, setDiscoveredAgents] = useState([]);
// Only update on search
```

### Budget Optimization
- Single state array
- O(1) budget lookup by ID
- Efficient filtering

### Network Optimization
- Group related requests
- Batch operations where possible
- Reuse HTTP connections

---

## Troubleshooting

### Common Issues

**1. Agents not showing in admin**
- Check `useAgentStore()` has agents
- Verify config.ts is exported
- Check browser console for errors

**2. Budget not deducting**
- Check `handleSpendFromBudget()` calculation
- Verify agent price is correct
- Ensure budget not expired

**3. Payment failing**
- Check Aptos network connection
- Verify payment signature format
- Ensure user has APT balance

**4. API response types wrong**
- Check schemas.ts interfaces
- Verify example responses match types
- Check response handler in executor

---

## Future Enhancements

- [ ] Agent composition (chain agents)
- [ ] Custom agent registration
- [ ] Advanced caching layer
- [ ] Agent reputation scores
- [ ] Batch execution with discounts
- [ ] Async long-running tasks
- [ ] Webhook support
- [ ] Multi-signature approvals

---

## Support & Resources

- **User Guide:** [USER_GUIDE.md](USER_GUIDE.md)
- **Agent Specs:** [AGENTS.md](AGENTS.md)
- **Integration Guide:** [/integration](/integration)
- **Admin Dashboard:** [/admin](/admin)
- **API Schemas:** [/admin?tab=schemas](/admin?tab=schemas)

---

**Last Updated:** February 1, 2026
**Architecture Version:** 2.0 (Unified)
**Status:** Production Ready ✅
