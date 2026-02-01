# 🤖 AGENTS REDESIGN - COMPLETE GUIDE

**Updated:** February 1, 2026  
**Status:** Production Ready ✅

---

## Overview

The Aether Market agent system has been **completely redesigned** to ensure:
- ✅ **Clear Requirements**: Every agent has explicit input/output specifications
- ✅ **Consistency**: Same agent definitions across all areas of the app
- ✅ **Type Safety**: Full TypeScript interfaces for all agent interactions
- ✅ **Scalability**: New agents can be added without duplicating definitions
- ✅ **User Transparency**: Users know exactly what to send and what to expect

---

## Architecture

### Single Source of Truth

```
UNIFIED_AGENT_REGISTRY (unified-registry.ts)
    ↓
    ├─ config.ts (backward compatibility, derives from registry)
    ├─ schemas.ts (auto-generated types)
    ├─ components (all reference registry)
    ├─ API routes (validate using interface.ts)
    └─ dashboard (displays full agent specs)
```

### Key Files

| File | Purpose | Usage |
|------|---------|-------|
| `interface.ts` | Standardized types & validation | All agent interactions |
| `unified-registry.ts` | All 9 agents fully specified | Single source of truth |
| `config.ts` | Legacy config (derives from registry) | Backward compatibility |
| `schemas.ts` | TypeScript types | Type safety, documentation |

---

## The 9 Agents

### 1. **Neural Alpha** 🎨
- **Category**: AI Generation
- **Model**: DALL-E 3
- **Cost**: 0.05 APT
- **What it needs**: `prompt` (required), `size`, `quality`, `style`
- **What it returns**: `imageUrl`, `revisedPrompt`, `base64`

**Example**:
```typescript
{
  prompt: "A futuristic city at sunset",
  size: "1024x1024",
  quality: "hd",
  style: "photorealistic"
}
```

### 2. **Quantum Sage** 🔐
- **Category**: Code (Security)
- **Model**: GPT-4o
- **Cost**: 0.03 APT
- **What it needs**: `code` (required), `language` (required), `focusAreas`
- **What it returns**: `vulnerabilities`, `overallScore`, `safeToUse`, `recommendations`

**Example**:
```typescript
{
  code: "SELECT * FROM users WHERE id = '" + userId + "'",
  language: "typescript",
  focusAreas: ["sql-injection"]
}
```

### 3. **Syntax Wizard** 💻
- **Category**: Code (Generation)
- **Model**: GPT-4o
- **Cost**: 0.03 APT
- **What it needs**: `description` (required), `language` (required), `includeTests`, `framework`
- **What it returns**: `code`, `tests`, `documentation`, `dependencies`, `explanation`

**Example**:
```typescript
{
  description: "Create a React hook for authentication",
  language: "typescript",
  includeTests: true,
  framework: "react"
}
```

### 4. **Atlas AI** 📝
- **Category**: Analysis (Text)
- **Model**: GPT-4o
- **Cost**: 0.02 APT
- **Capabilities**:
  - `text-generation`: Write content
  - `analysis`: Analyze and summarize

### 5. **Oracle Prime** 💰
- **Category**: Data Retrieval (Finance)
- **Model**: CoinGecko API
- **Cost**: 0.02 APT
- **What it needs**: `symbol` (required), `currency`, `includeChart`
- **What it returns**: `price`, `priceChange24h`, `marketCap`, `volume24h`, `updated`

**Example**:
```typescript
{
  symbol: "bitcoin",
  currency: "usd"
}
```

### 6. **Search Sage** 🔍
- **Category**: Data Retrieval (Web Search)
- **Model**: SerpAPI
- **Cost**: 0.01 APT
- **What it needs**: `query` (required), `numResults`
- **What it returns**: `results[]`, `totalResults`

### 7. **Sentiment Bot** 😊
- **Category**: Analysis (NLP)
- **Model**: GPT-4o
- **Cost**: 0.01 APT
- **What it needs**: `text` (required), `includeEmotions`
- **What it returns**: `sentiment`, `score`, `confidence`, `emotions`, `keyPhrases`

### 8. **Research Assistant** 🔬 (Composite)
- **Category**: Composite
- **Uses**: Search Sage + Atlas AI
- **Cost**: 0.04 APT
- **What it needs**: `topic` (required), `depth`
- **What it returns**: `summary`, `findings[]`, `sources[]`, `recommendations[]`

### 9. **Secure Coder** 🛡️ (Composite)
- **Category**: Composite
- **Uses**: Syntax Wizard + Quantum Sage
- **Cost**: 0.06 APT
- **What it needs**: `description` (required), `language` (required), `securityLevel`
- **What it returns**: `code`, `vulnerabilities[]`, `securityScore`, `recommendations[]`

---

## Parameter Validation

All agents validate parameters before execution. Validation includes:

- **Type checking**: Is it the right type?
- **Required fields**: Are all required fields provided?
- **Length constraints**: Min/max lengths for strings
- **Enum validation**: Is the value in allowed list?
- **Value constraints**: Min/max for numbers
- **Size limits**: Max input size (50KB for code, etc.)

**Example**:
```typescript
const validation = validateParameters(parameters, agent.capabilities[capabilityId].inputParameters);

if (!validation.valid) {
    console.error(validation.errors);
    // Error: "text" field has "Minimum length is 5"
}
```

---

## How to Call an Agent

### Method 1: Using Unified Registry

```typescript
import { UNIFIED_AGENT_REGISTRY, canAgentExecute } from '@/lib/agents/unified-registry';

// Check if agent can execute
const result = canAgentExecute("atlas-ai", "text-generation");
if (!result.can) {
    console.error(result.reason);
    return;
}

// Get agent specs
const agent = UNIFIED_AGENT_REGISTRY["atlas-ai"];
const capability = agent.capabilities["text-generation"];

// Validate parameters
const validation = validateParameters(userInput, capability.inputParameters);
if (!validation.valid) {
    throw new Error(`Invalid parameters: ${validation.errors}`);
}

// Call API
const response = await fetch('/api/agent/execute', {
    method: 'POST',
    body: JSON.stringify({
        agentId: "atlas-ai",
        capabilityId: "text-generation",
        parameters: userInput
    })
});
```

### Method 2: Using Config (Legacy)

```typescript
import { getAgentCostAPT, AGENT_SPECS } from '@/lib/agents/config';

const cost = getAgentCostAPT("atlas-ai");
const specs = AGENT_SPECS["atlas-ai"];
```

### Method 3: Using X402 Client

```typescript
import { X402Client } from '@/lib/x402/client';

const client = new X402Client();
const result = await client.executeAgentTask({
    agentId: "atlas-ai",
    taskType: "text-generation",
    parameters: {
        prompt: "Write a poem about blockchain"
    }
});
```

---

## Dashboard

New dashboard at `/dashboard/agents` shows:

✅ **Overview Tab**
- Agent statistics
- Top performers
- Category breakdown

✅ **Agents Tab**
- All 9 agents with detailed specs
- Filter by verified/composite
- Click to expand capabilities
- View parameter requirements
- See cost per capability
- Quick "Use Agent" button

✅ **Minting Tab** (Coming Soon)
- Register custom agents
- Set pricing
- Manage permissions
- On-chain verification

---

## Cost Structure

All costs are specified **per capability**, not per agent:

```
Agent: Atlas AI (0.02 APT for text-generation)
├─ text-generation: 0.02 APT
└─ analysis: 0.015 APT

Agent: Quantum Sage (0.03 APT for code-audit)
├─ code-audit: 0.03 APT
└─ performance-analysis: 0.025 APT

Composite: Research Assistant (0.04 APT)
└─ research: 0.04 APT (uses Search Sage + Atlas AI)
```

Users see **exact costs** before execution:

```
This will cost: 0.02 APT (2,000,000 octas)
Estimated time: 2-30 seconds
```

---

## Error Handling

Each agent defines its error cases:

```typescript
errorCases: [
    {
        error: "CODE_TOO_LARGE",
        cause: "Code exceeds 50KB limit",
        solution: "Split code into smaller chunks"
    },
    {
        error: "INVALID_LANGUAGE",
        cause: "Language not supported",
        solution: "Use: javascript, typescript, python, java, etc."
    }
]
```

When error occurs, user gets:
- ✅ Clear error code
- ✅ Why it happened
- ✅ How to fix it

---

## Consistency Guarantees

### Same Agent Definition Everywhere

```
User sees:
  [Dashboard] → "Atlas AI - General-purpose text generation"
  [Marketplace] → "Atlas AI - General-purpose text generation"
  [API Schema] → name: "Atlas AI", description: "..."
  [Type System] → AtlasAI.NAME, AtlasAI.DESCRIPTION

All from: UNIFIED_AGENT_REGISTRY["atlas-ai"]
```

### No Mismatches

❌ **Before**:
```
Admin dashboard: Shows 9 agents
Marketplace: Shows 7 agents  ← DIFFERENT!
Config: Shows "nexus-prime" ← NOT A REAL AGENT!
```

✅ **After**:
```
All pages derive from UNIFIED_AGENT_REGISTRY
All show exactly 9 agents, consistently
All have same metadata, costs, descriptions
```

---

## Adding New Agents

Adding an agent is now **one-step**:

### Step 1: Add to `unified-registry.ts`

```typescript
export const UNIFIED_AGENT_REGISTRY: Record<string, AgentSpec> = {
    // ... existing agents
    
    "my-agent": {
        id: "my-agent",
        name: "My Agent",
        version: "1.0.0",
        description: "What it does",
        owner: "your-org",
        category: "analysis",
        tags: ["custom", "my-domain"],
        model: "gpt-4o",
        provider: "openai",
        
        capabilities: {
            "my-capability": {
                id: "my-capability",
                name: "My Capability",
                description: "What it does",
                inputParameters: [
                    {
                        name: "input",
                        type: "string",
                        description: "Input description",
                        required: true,
                        minLength: 10,
                        maxLength: 1000
                    }
                ],
                outputSchema: {
                    type: "object",
                    properties: {
                        result: { type: "string" }
                    },
                    required: ["result"]
                },
                costOctas: "2000000",
                executionTimeMs: { min: 1000, max: 30000, average: 5000 },
                maxInputSize: 100000,
                timeoutMs: 30000,
                examples: [...],
                errorCases: [...]
            }
        },
        
        successRate: 95.0,
        averageExecutionTimeMs: 5000,
        totalExecutions: 100,
        averageRating: 4.5,
        isVerified: true,
        canInvokeOtherAgents: false
    }
};
```

### Done! ✅

The agent now appears in:
- ✅ Dashboard
- ✅ Marketplace
- ✅ Admin panel
- ✅ API schemas
- ✅ Type system
- ✅ Dropdown selectors

---

## FAQ

**Q: Why is consistency important?**  
A: When users see different agents in different places, they get confused about what's available. This causes frustration and failed attempts to call non-existent agents.

**Q: What if I want to use a custom agent?**  
A: Coming in Phase 2 - Agent Minting SDK will let you register custom agents.

**Q: How do I know what parameters an agent needs?**  
A: Every agent has detailed `inputParameters` with:
- Type (string, number, boolean, etc.)
- Description of what it means
- Min/max lengths
- Allowed values (enum)
- Examples

**Q: What if a parameter is invalid?**  
A: Validation happens before sending to agent. User gets clear error saying exactly what's wrong and how to fix it.

**Q: Can agents work together?**  
A: Yes! Composite agents like "Research Assistant" and "Secure Coder" chain multiple agents together.

---

## Migration Guide

### Old Code
```typescript
import { AGENT_SPECS } from '@/lib/agents/config';

const specs = AGENT_SPECS["atlas-ai"];
const cost = specs.costAPT;
```

### New Code (Works the same!)
```typescript
import { AGENT_SPECS } from '@/lib/agents/config';

const specs = AGENT_SPECS["atlas-ai"]; // ✅ Still works
const cost = specs.costAPT; // ✅ Still works
```

**All old code continues to work** because `config.ts` derives from the unified registry.

---

## Testing

### Manual Testing

1. Go to `/dashboard/agents`
2. Select an agent
3. Review all capabilities
4. See parameter requirements
5. Click "Use Agent"

### Programmatic Testing

```typescript
import { UNIFIED_AGENT_REGISTRY, validateParameters } from '@/lib/agents/unified-registry';
import { validateParameters } from '@/lib/agents/interface';

const agent = UNIFIED_AGENT_REGISTRY["atlas-ai"];
const capability = agent.capabilities["text-generation"];

// Test validation
const result = validateParameters(
    { prompt: "Short" }, // Too short!
    capability.inputParameters
);

console.log(result); // { valid: false, errors: [...] }
```

---

## Summary

✅ **All 9 agents fully documented**  
✅ **Clear requirements for each**  
✅ **Same definitions everywhere**  
✅ **Type-safe interactions**  
✅ **Easy to add new agents**  
✅ **Comprehensive dashboard**  
✅ **Full cost transparency**  
✅ **Better error messages**  

**Everything works together seamlessly!** 🚀
