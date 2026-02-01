# 📚 Documentation Index

Quick navigation guide for the Aether Market documentation.

---

## 🚀 Getting Started

**New to Aether?**

1. **[README.md](README.md)** ← Start here
   - Project overview
   - Key features
   - Quick demo

2. **[QUICK_START.md](QUICK_START.md)** ← Then read this
   - 30-second setup
   - Environment configuration
   - OAuth & testnet setup
   - First agent execution

---

## 🔑 Authentication & Login Issues

**Having trouble logging in?**

- **[KEYLESS_PEPPER_SERVICE_TROUBLESHOOTING.md](KEYLESS_PEPPER_SERVICE_TROUBLESHOOTING.md)** ⭐ NEW
  - Pepper Service error diagnosis
  - 5 root causes & solutions
  - Network connectivity fixes
  - Browser/extension troubleshooting
  - JWT token issues
  - Detailed error messages reference
  - Console logs guide
  - Workarounds & recovery paths
  - Best practices

- **[PEPPER_SERVICE_FIX_SUMMARY.md](PEPPER_SERVICE_FIX_SUMMARY.md)** - What was fixed
  - Issue explained
  - Solution implemented
  - Changes made to provider.tsx
  - Testing guide
  - Backwards compatibility

---

## 🤖 Agents & Usage

**Want to use agents?**

- **[AGENT_USER_GUIDE.md](AGENT_USER_GUIDE.md)** - How to use agents from marketplace ⭐ NEW
  - Discovering agents (browse, search, filter)
  - Evaluating agents (rating, cost, speed, uptime)
  - Checking agent availability & status
  - x402 payment flow explained
  - Step-by-step examples (image gen, code audit)
  - Advanced workflows (chaining, batch processing)
  - Troubleshooting & FAQs

- **[AGENT_USER_QUICK_REFERENCE.md](AGENT_USER_QUICK_REFERENCE.md)** - Quick reference card
  - 3-step quick start
  - Agent discovery (search, filter, compare)
  - Availability checking
  - x402 payment sequence
  - Common tasks & examples
  - Troubleshooting quick fixes
  - Cost management & checklists

- **[AGENT_COMPOSABILITY_GUIDE.md](AGENT_COMPOSABILITY_GUIDE.md)** - Multi-agent workflows ⭐ NEW
  - Direct vs Orchestrated execution
  - Building complex workflows
  - Agent chaining patterns
  - Real-world examples (code audit pipeline, marketing copy review)
  - Programmatic usage
  - Advanced features (caching, monitoring)
  - Design patterns & best practices

- **[AGENTS.md](AGENTS.md)** - Complete guide to all 7 agents
  - Agent specifications
  - Pricing and capabilities
  - Usage examples
  - API reference

**Want to build agents?**

- **[AGENT_DEVELOPER_GUIDE.md](AGENT_DEVELOPER_GUIDE.md)** - Create your own agents ⭐
  - 5-minute quick start
  - Agent architecture explained
  - Full code examples (translation, code audit)
  - Payment integration guide
  - Testing and deployment
  - Error handling & best practices
  - Advanced topics (caching, rate limiting, monitoring)

- **[AGENT_DEVELOPMENT_CHEATSHEET.md](AGENT_DEVELOPMENT_CHEATSHEET.md)** - Quick reference card
  - Code snippets for copy-paste
  - Common patterns (validation, caching, rate limiting)
  - Error handling quick fixes
  - Deployment checklist
  - Performance tips

- **[agents.json](agents.json)** - Machine-readable agent registry

---

## 💳 Payment & Troubleshooting

**Payment issues?**

- **[PAYMENT_TROUBLESHOOTING.md](PAYMENT_TROUBLESHOOTING.md)**
  - 402 Payment Required explained
  - Common issues & fixes
  - Debugging steps
  - Console logs to watch for

---

## 🏗️ M2M Protocol (Advanced)

**Want to understand the protocol?**

- **[M2M_PROTOCOL_GUIDE.md](M2M_PROTOCOL_GUIDE.md)** - Complete protocol guide
  - Core vision
  - Four pillars explained
  - Agent registration
  - Validation & reputation
  - API reference

- **[QUICK_REFERENCE.md](QUICK_REFERENCE.md)** - Quick reference card
  - Smart contracts
  - JSON schemas
  - Code examples

---

## 📊 GraphQL API (Advanced)

**Building with GraphQL?**

- **[GRAPHQL_QUICK_REFERENCE.md](GRAPHQL_QUICK_REFERENCE.md)**
  - All GraphQL methods
  - Code examples
  - Error handling
  - Performance tips

---

## 📖 Project Vision

**Want the big picture?**

- **[Aether_Whitepaper.md](Aether_Whitepaper.md)** - Project vision & roadmap

---

## 📋 By Use Case

### "I want to run an agent"
1. README.md
2. QUICK_START.md
3. AGENTS.md
4. Try `/demo` page

### "I'm getting a 402 error"
→ PAYMENT_TROUBLESHOOTING.md

### "I want to build an agent"
1. AGENTS.md
2. M2M_PROTOCOL_GUIDE.md
3. Check `src/lib/agents/executor.ts`

### "I want GraphQL queries"
→ GRAPHQL_QUICK_REFERENCE.md

### "I want to understand everything"
→ M2M_PROTOCOL_GUIDE.md (deep dive)

### "I need quick answers"
→ Search files above, or check:
- QUICK_REFERENCE.md (M2M protocol)
- GRAPHQL_QUICK_REFERENCE.md (GraphQL)
- PAYMENT_TROUBLESHOOTING.md (payments)

---

## 🎯 File Summary

| File | Type | Length | Purpose |
|------|------|--------|---------|
| README.md | Guide | Short | Project overview |
| QUICK_START.md | Guide | Medium | Setup & first run |
| AGENTS.md | Reference | Long | All agents documented |
| PAYMENT_TROUBLESHOOTING.md | Guide | Medium | Debugging payments |
| M2M_PROTOCOL_GUIDE.md | Guide | Long | Deep protocol dive |
| QUICK_REFERENCE.md | Reference | Medium | Protocol quick ref |
| GRAPHQL_QUICK_REFERENCE.md | Reference | Medium | GraphQL quick ref |
| Aether_Whitepaper.md | Vision | Medium | Project vision |
| agents.json | Data | Short | Agent registry |

---

## ⏱️ Reading Time Guide

- **5 minutes**: README.md
- **10 minutes**: README.md + QUICK_START.md
- **20 minutes**: + AGENTS.md (basics)
- **1 hour**: + M2M_PROTOCOL_GUIDE.md
- **2 hours**: All files (comprehensive)

---

## 🔍 Search Tips

**Looking for...**

| Topic | File |
|-------|------|
| Agent specs | AGENTS.md or agents.json |
| Payment issues | PAYMENT_TROUBLESHOOTING.md |
| 402 error | PAYMENT_TROUBLESHOOTING.md |
| GraphQL methods | GRAPHQL_QUICK_REFERENCE.md |
| Protocol design | M2M_PROTOCOL_GUIDE.md |
| Setup instructions | QUICK_START.md |
| Quick answers | QUICK_REFERENCE.md |
| OAuth setup | QUICK_START.md |
| Project vision | Aether_Whitepaper.md |

---

## ✨ Pro Tips

1. **Bookmark QUICK_START.md** for common setup questions
2. **Pin AGENTS.md** for agent specifications
3. **Keep PAYMENT_TROUBLESHOOTING.md** open when testing payments
4. **Read QUICK_REFERENCE.md** as a quick card (printable!)

---

**Last Updated**: February 1, 2026
**Status**: Clean, organized, ready to use ✅
