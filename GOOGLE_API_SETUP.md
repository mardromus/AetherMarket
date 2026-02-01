# 🚀 Google API Setup Guide - Deploy Real Agents

This guide helps you set up Google Cloud APIs to power real, autonomous agents in Aether Market.

## 📋 Overview

We'll use Google APIs to replace mock agents:
- **Google Gemini API** - Text/code generation (replaces GPT-4)
- **Google Generative AI** - Image analysis
- **Google Custom Search** - Web search
- **Google Translation API** - Sentiment analysis

### Agents to Deploy (9 Total)

1. **Neural Alpha** → Google Gemini (text-to-code/prompts)
2. **Quantum Sage** → Google Gemini (code audit)
3. **Syntax Wizard** → Google Gemini (code generation)
4. **Atlas AI** → Google Gemini (text generation)
5. **Search Sage** → Google Custom Search (web search)
6. **Sentiment Bot** → Google Gemini (sentiment analysis)
7. **Oracle Prime** → Gemini with Finance context
8. **Research Assistant** → Composite (Gemini + Search)
9. **Secure Coder** → Composite (Gemini code audit)

---

## 🔑 Step 1: Create Google Cloud Project

### 1.1 Create Project
```bash
# Go to: https://console.cloud.google.com/

# Sign in with your Google account
# Click "Select a Project" → "NEW PROJECT"
# Project name: "Aether Market"
# Click CREATE
```

### 1.2 Enable APIs

After creating project, enable these APIs:

```
1. Generative AI API (Gemini)
   - Search for "Generative AI API"
   - Click ENABLE

2. Custom Search API
   - Search for "Custom Search API"
   - Click ENABLE

3. Cloud Translation API
   - Search for "Cloud Translation API"
   - Click ENABLE

4. Vision API (optional, for image analysis)
   - Search for "Vision API"
   - Click ENABLE
```

### 1.3 Create API Keys

Go to **APIs & Services** → **Credentials** → **Create Credentials** → **API Key**

This will give you: `AIzaSy...` (your API key)

---

## 🔑 Step 2: Get Gemini API Key (Free)

### 2.1 Gemini API (Easiest)
```bash
# Go to: https://ai.google.dev/

# Click "Get API Key"
# Create new API key in Google AI Studio
# You'll get: AIzaSy...

# This gives you:
# ✅ Free tier: 60 calls/minute
# ✅ No credit card needed
# ✅ Gemini Pro 1.5 access
```

### 2.2 Alternative: Cloud Console (Same Key)

If you already created API key in Cloud Console, use that same key.

---

## 🔑 Step 3: Set Up Environment Variables

### 3.1 Create `.env.local` file

In your project root (`aether-market/.env.local`):

```bash
# Google APIs
GOOGLE_API_KEY=AIzaSy...YOUR_KEY_HERE...

# Google Cloud Project ID (optional, for advanced features)
GOOGLE_CLOUD_PROJECT_ID=aether-market-xxx

# Gemini Model (default)
GEMINI_MODEL=gemini-1.5-pro

# Optional: SerpAPI for web search (fallback)
SERP_API_KEY=xxx (keep existing if you have it)

# Optional: OpenAI key (for comparison/fallback)
OPENAI_API_KEY=sk-... (optional)
```

### 3.2 Verify Setup

Create a test file to verify API key works:

```bash
# In terminal, test the key:
curl -X POST "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro:generateContent?key=YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "contents": [{
      "parts": [{"text": "Hello!"}]
    }]
  }'
```

If you get a response with text, ✅ your key works!

---

## 📝 Step 4: Update Executor

We'll update `src/lib/agents/executor.ts` to use Google Gemini API:

### 4.1 Install Google AI Library

```bash
npm install @google/generative-ai
```

### 4.2 Key Changes

**Before (OpenAI):**
```typescript
import OpenAI from "openai";
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
```

**After (Google Gemini):**
```typescript
import { GoogleGenerativeAI } from "@google/generative-ai";
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY!);
```

---

## 🤖 Agent Implementation Plans

### Agent 1: Neural Alpha (Image Generation)
- **Current**: DALL-E 3
- **New**: Google Gemini (text-based image descriptions)
- **Function**: Generate detailed image prompts → return to user

```typescript
async function executeNeuralAlpha(prompt: string) {
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });
  const result = await model.generateContent(`
    Create a detailed, vivid image prompt based on this description: ${prompt}
    Make it suitable for image generation APIs.
    Format: [STYLE] [SUBJECT] [SETTING] [MOOD] [QUALITY]
  `);
  return result.response.text();
}
```

### Agent 2: Quantum Sage (Code Audit)
- **Current**: GPT-4o
- **New**: Google Gemini 1.5 (can read large code)
- **Function**: Analyze code for vulnerabilities, bugs, performance

```typescript
async function executeQuantumSage(code: string, language: string) {
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });
  const result = await model.generateContent(`
    Analyze this ${language} code for:
    1. Security vulnerabilities
    2. Performance issues
    3. Code quality
    4. Bugs and edge cases
    
    Format as JSON:
    {
      "overallScore": 1-10,
      "riskLevel": "critical|high|medium|low",
      "vulnerabilities": [],
      "suggestions": []
    }
    
    CODE:
    ${code}
  `);
  return JSON.parse(result.response.text());
}
```

### Agent 3: Syntax Wizard (Code Generation)
- **Current**: GPT-4o
- **New**: Google Gemini 1.5
- **Function**: Generate code from natural language descriptions

```typescript
async function executeSyntaxWizard(prompt: string, language: string) {
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });
  const result = await model.generateContent(`
    Generate production-ready ${language} code for: ${prompt}
    Include: comments, error handling, type hints, example usage.
    Respond with ONLY the code, no markdown.
  `);
  return result.response.text();
}
```

### Agent 4: Atlas AI (Text Generation)
- **Current**: GPT-4o
- **New**: Google Gemini 1.5
- **Function**: General text generation, writing, analysis

```typescript
async function executeAtlasAI(prompt: string) {
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });
  const result = await model.generateContent(prompt);
  return result.response.text();
}
```

### Agent 5: Search Sage (Web Search)
- **Current**: SerpAPI
- **New**: Google Custom Search or Gemini with live search (if available)
- **Function**: Retrieve and summarize web search results

```typescript
async function executeSearchSage(query: string) {
  // Option 1: Use Custom Search API
  const response = await fetch(
    `https://www.googleapis.com/customsearch/v1?q=${encodeURIComponent(query)}&key=${GOOGLE_API_KEY}&cx=${SEARCH_ENGINE_ID}`
  );
  
  // Option 2: Use Gemini to summarize search results
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });
  const result = await model.generateContent(`
    Search results for: ${query}
    Please provide a summary of the top 5 results about this topic.
  `);
  return result.response.text();
}
```

### Agent 6: Sentiment Bot (Sentiment Analysis)
- **Current**: GPT-4o
- **New**: Google Gemini 1.5
- **Function**: Analyze sentiment, emotions, tone

```typescript
async function executeSentimentBot(text: string) {
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });
  const result = await model.generateContent(`
    Analyze the sentiment of this text:
    "${text}"
    
    Return JSON:
    {
      "sentiment": "positive|negative|neutral",
      "confidence": 0-1,
      "score": -1 to 1,
      "emotions": ["emotion1", "emotion2"],
      "reasoning": "explanation"
    }
  `);
  return JSON.parse(result.response.text());
}
```

### Agent 7: Oracle Prime (Financial Analysis)
- **Current**: CoinGecko API
- **New**: Gemini with financial context
- **Function**: Analyze cryptocurrencies, market data

```typescript
async function executeOraclePrime(symbol: string) {
  // Fetch real data from free API
  const data = await fetch(
    `https://api.coingecko.com/api/v3/simple/price?ids=${symbol.toLowerCase()}&vs_currencies=usd&include_market_cap=true&include_24hr_vol=true`
  ).then(r => r.json());
  
  // Use Gemini to analyze
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });
  const result = await model.generateContent(`
    Analyze this crypto market data:
    ${JSON.stringify(data, null, 2)}
    
    Provide: current price, market sentiment, trends, risks
  `);
  return result.response.text();
}
```

### Agent 8: Research Assistant (Composite)
- **Current**: Multiple agents
- **New**: Gemini + Search + Analysis
- **Function**: Multi-step research with web search

```typescript
async function executeResearchAssistant(topic: string) {
  // Step 1: Search for topic
  const searchResults = await executeSearchSage(topic);
  
  // Step 2: Analyze with Gemini
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });
  const result = await model.generateContent(`
    Based on these search results:
    ${searchResults}
    
    Provide a comprehensive research summary on: ${topic}
    Include: key findings, trends, sources, recommendations
  `);
  
  return result.response.text();
}
```

### Agent 9: Secure Coder (Composite)
- **Current**: Multiple agents
- **New**: Gemini code audit + generation
- **Function**: Audit code, suggest fixes, generate improvements

---

## 🔧 Installation Steps

### Step 1: Add Google AI Library

```bash
cd "c:\Users\kusha\Desktop\sEM 6\Hackathon\X402 protocol hackathon\aether-market"
npm install @google/generative-ai
```

### Step 2: Create `.env.local`

```bash
# Create file in project root:
# aether-market/.env.local

GOOGLE_API_KEY=AIzaSy...YOUR_KEY...
GEMINI_MODEL=gemini-1.5-pro
```

### Step 3: Update executor.ts

Replace OpenAI imports with Google Gemini:
- See implementation details above
- Update each agent function
- Test each agent

### Step 4: Restart Dev Server

```bash
npm run dev
```

---

## ✅ Testing Checklist

After setup, verify each agent:

```
□ Neural Alpha - Can generate image prompts
□ Quantum Sage - Can audit code
□ Syntax Wizard - Can generate code
□ Atlas AI - Can generate text
□ Search Sage - Can search web
□ Sentiment Bot - Can analyze sentiment
□ Oracle Prime - Can fetch crypto data
□ Research Assistant - Can do multi-step research
□ Secure Coder - Can audit and improve code
```

---

## 🐛 Troubleshooting

### Issue: "API key not configured"
```
Solution: Check .env.local file exists with GOOGLE_API_KEY=AIzaSy...
Restart: npm run dev
```

### Issue: "Quota exceeded"
```
Google free tier has limits:
- Gemini: 60 calls/minute
- Custom Search: 100 queries/day (free tier)

Solution: Upgrade to paid plan if needed
```

### Issue: "Invalid API key"
```
Check:
1. Key is copied correctly (no extra spaces)
2. Key hasn't been revoked in Google Cloud Console
3. API is enabled for the project
4. Restart dev server
```

### Issue: "Model not found"
```
Ensure model name is correct:
- gemini-1.5-pro (latest)
- gemini-pro (stable)
- gemini-pro-vision (with vision)

Available at: https://ai.google.dev/models
```

---

## 📚 Useful Resources

- **Gemini API Docs**: https://ai.google.dev/docs
- **API Reference**: https://ai.google.dev/api/rest
- **Quickstart**: https://ai.google.dev/tutorials/quickstart
- **Custom Search Docs**: https://developers.google.com/custom-search
- **GitHub Repo**: https://github.com/google/generative-ai-js

---

## 💰 Pricing

### Free Tier (Gemini)
- ✅ 60 requests/minute
- ✅ 1,500 requests/day
- ✅ No credit card
- ✅ Perfect for hackathons

### Custom Search
- ✅ 100 queries/day free
- 💰 $5 per 1,000 queries after

### Production
- Standard API pricing: $0.0001-$0.0015 per request
- See: https://ai.google.dev/pricing

---

## 🚀 Next Steps

1. ✅ Create Google Cloud Project
2. ✅ Get API keys
3. ✅ Set up `.env.local`
4. ✅ Update executor.ts (we'll do this next)
5. ✅ Test each agent
6. ✅ Deploy!

---

**Status**: Ready to implement! Start with Step 1 above.
