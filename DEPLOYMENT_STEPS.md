# 🚀 Implementation Steps - Deploy Real Agents with Google Gemini

Follow these steps in order to deploy all 9 agents with real Google Gemini API.

## Step 1: Install Google AI Library

```bash
cd "c:\Users\kusha\Desktop\sEM 6\Hackathon\X402 protocol hackathon\aether-market"
npm install @google/generative-ai
```

**Expected Output:**
```
added 1 package, and audited 123 packages in 2s
```

---

## Step 2: Get Google API Key (Free)

### Option A: Quick Setup (Recommended)
```bash
# Go to: https://ai.google.dev/
# Click "Get API Key"
# Copy the key that looks like: AIzaSy...
```

### Option B: Google Cloud Console
```bash
# Go to: https://console.cloud.google.com/
# Create new project → "Aether Market"
# Go to APIs & Services → Credentials
# Create API Key
```

**You'll get a key like:** `AIzaSy_YOUR_KEY_HERE_xxxxx`

---

## Step 3: Create `.env.local`

Create a new file `aether-market/.env.local`:

```bash
# =====================================
# Google APIs
# =====================================

# Your Google AI API Key (get from https://ai.google.dev/)
GOOGLE_API_KEY=AIzaSy_YOUR_KEY_HERE

# Gemini Model (use this model)
GEMINI_MODEL=gemini-1.5-pro

# Optional: Google Custom Search (for live web search)
# Leave empty to use Gemini's knowledge
GOOGLE_CUSTOM_SEARCH_KEY=
GOOGLE_SEARCH_ENGINE_ID=

# Optional: Keep existing keys for fallback
OPENAI_API_KEY=
SERP_API_KEY=

# =====================================
# Network Configuration
# =====================================
NEXT_PUBLIC_APTOS_NETWORK=testnet
```

### Steps:
1. Create file at: `c:\Users\kusha\Desktop\sEM 6\Hackathon\X402 protocol hackathon\aether-market\.env.local`
2. Copy the template above
3. Replace `AIzaSy_YOUR_KEY_HERE` with your actual key
4. Save the file

---

## Step 4: Test the API Key

Create a test file to verify the key works:

```bash
# Windows PowerShell
$apiKey = "YOUR_KEY_HERE"
$body = @{
    contents = @(
        @{
            parts = @(
                @{ text = "Hello! Say something creative in one sentence." }
            )
        }
    )
} | ConvertTo-Json

$response = Invoke-WebRequest -Uri "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro:generateContent?key=$apiKey" `
    -Method POST `
    -ContentType "application/json" `
    -Body $body

$response.Content | ConvertFrom-Json | Select-Object -ExpandProperty candidates | Select-Object -ExpandProperty content | Select-Object -ExpandProperty parts
```

**Expected Output:**
```
text : Your creative text response here...
```

If you see text, ✅ your key works!

---

## Step 5: Update Executor (Replace Old With New)

The new Google Gemini executor has been created at:
- **New**: `src/lib/agents/executor-gemini.ts`
- **Old**: `src/lib/agents/executor.ts`

### Option 1: Backup and Replace (Recommended)

```bash
# Backup old executor
Move-Item -Path "src/lib/agents/executor.ts" -Destination "src/lib/agents/executor-old.ts" -Force

# Copy new executor
Copy-Item -Path "src/lib/agents/executor-gemini.ts" -Destination "src/lib/agents/executor.ts" -Force
```

### Option 2: Update Imports

If you want to use both, update in `src/app/api/agent/execute/route.ts`:

**Before:**
```typescript
import { executeAgent } from '@/lib/agents/executor';
```

**After:**
```typescript
import { executeAgent } from '@/lib/agents/executor-gemini';
```

---

## Step 6: Restart Development Server

```bash
# Stop current server (Ctrl+C if running)

# Restart with new setup
npm run dev
```

**Expected Output:**
```
  ▲ Next.js 16.1.6 (Turbopack)
  - Local:        http://localhost:3000
  ▲ Ready in 1234ms
```

---

## Step 7: Test Each Agent

Navigate to **http://localhost:3000/agents** and test:

### ✅ Test Checklist

| Agent | Test | Expected |
|-------|------|----------|
| **Neural Alpha** | Input: "A sunset over mountains" | Generates detailed image prompt |
| **Quantum Sage** | Paste some code | Analyzes for vulnerabilities |
| **Syntax Wizard** | Input: "Create a React button" | Generates React code |
| **Atlas AI** | Input: "What is AI?" | Generates text response |
| **Search Sage** | Input: "Latest AI news" | Provides search summary |
| **Sentiment Bot** | Input: "I love this product!" | Analyzes as positive sentiment |
| **Oracle Prime** | Input: "ethereum" | Shows ETH price & analysis |
| **Research Assistant** | Input: "Blockchain technology" | Provides research summary |
| **Secure Coder** | Paste code + prompt | Audits and suggests fixes |

---

## Step 8: Monitor Console Logs

Open browser DevTools (F12) and check Console for agent execution:

```
🤖 Executing agent: atlas-ai | Task: text-generation
✅ Agent execution completed in 1234ms
```

### Troubleshooting Console Errors

**Error: "GOOGLE_API_KEY environment variable not configured"**
```
Solution:
1. Check .env.local file exists
2. Verify GOOGLE_API_KEY is set
3. Restart dev server: npm run dev
```

**Error: "Invalid API key"**
```
Solution:
1. Verify key is correct (copy from https://ai.google.dev/)
2. Check no extra spaces at start/end
3. Verify API is enabled in Google Cloud Console
4. Create new key if needed
```

**Error: "Quota exceeded"**
```
Google free tier limits:
- 60 requests/minute
- 1,500 requests/day

Solution: Wait 1 minute or upgrade to paid
```

---

## Step 9: Deploy (Production)

Once everything works, deploy to production:

### Vercel Deployment

```bash
# Add environment variables to Vercel project
# Go to: Settings → Environment Variables
# Add: GOOGLE_API_KEY=AIzaSy...

# Deploy
npm run build
git push  # Deploys to Vercel automatically
```

### Other Platforms

For other platforms (Netlify, Railway, etc.):
1. Build locally: `npm run build`
2. Add environment variable: `GOOGLE_API_KEY=...`
3. Deploy built files

---

## 📊 Agent Implementation Details

### 1. Neural Alpha (Image Generation)
- **Model**: Gemini 1.5 Pro
- **Task**: Generates detailed image prompts
- **Input**: Description, style
- **Output**: Detailed image prompt for image generation APIs

### 2. Quantum Sage (Code Audit)
- **Model**: Gemini 1.5 Pro
- **Task**: Analyze code for vulnerabilities, performance issues
- **Input**: Code + language
- **Output**: JSON with score, vulnerabilities, suggestions

### 3. Syntax Wizard (Code Generation)
- **Model**: Gemini 1.5 Pro
- **Task**: Generate production-ready code
- **Input**: Prompt + language
- **Output**: Working code with comments

### 4. Atlas AI (Text Generation)
- **Model**: Gemini 1.5 Pro
- **Task**: General text generation, writing, analysis
- **Input**: Prompt
- **Output**: Generated text

### 5. Search Sage (Web Search)
- **Model**: Gemini 1.5 Pro + Custom Search API (optional)
- **Task**: Search and summarize web results
- **Input**: Query
- **Output**: Search summary

### 6. Sentiment Bot (Sentiment Analysis)
- **Model**: Gemini 1.5 Pro
- **Task**: Analyze sentiment, emotions, tone
- **Input**: Text
- **Output**: JSON with sentiment score, emotions, reasoning

### 7. Oracle Prime (Financial Analysis)
- **Model**: Gemini 1.5 Pro + CoinGecko API
- **Task**: Analyze cryptocurrency market data
- **Input**: Coin symbol (e.g., "bitcoin", "ethereum")
- **Output**: Live price + market analysis

### 8. Research Assistant (Composite)
- **Model**: Gemini 1.5 Pro (multi-step)
- **Task**: Comprehensive research with planning
- **Input**: Topic
- **Output**: Research plan + detailed analysis

### 9. Secure Coder (Composite)
- **Model**: Gemini 1.5 Pro (audit + fix)
- **Task**: Audit code and suggest improvements
- **Input**: Code + description
- **Output**: Audit + improved code

---

## 🐛 Common Issues & Solutions

### Issue 1: Module Not Found Error
```
Error: Cannot find module '@google/generative-ai'
```

**Solution:**
```bash
npm install @google/generative-ai
npm run dev
```

### Issue 2: Environment Variable Not Loading
```
Error: GOOGLE_API_KEY environment variable not configured
```

**Solution:**
1. Verify `.env.local` file exists (not `.env`)
2. Check file is in project root: `aether-market/.env.local`
3. Restart dev server: `npm run dev`
4. Clear Next.js cache: `rm -rf .next` then `npm run dev`

### Issue 3: Agent Execution Hangs
```
Request times out or takes forever
```

**Solution:**
1. Check API key is valid
2. Check internet connection
3. Check quota: Free tier = 60 requests/minute
4. Check model name is correct: `gemini-1.5-pro`

### Issue 4: JSON Parse Error
```
Error: Unexpected token in JSON
```

**Solution:**
- Agent response format changed
- Check agent implementation matches expected JSON format
- Verify Gemini is returning valid JSON

---

## ✅ Final Verification

Run this to verify all systems:

```bash
# 1. Check .env.local exists
Test-Path ".env.local"  # Should return True

# 2. Check node_modules has @google/generative-ai
Test-Path "node_modules/@google/generative-ai"  # Should return True

# 3. Start dev server
npm run dev

# 4. Visit http://localhost:3000/agents
# 5. Click on an agent and click "Use Agent"
# 6. Try executing an agent
```

**Expected Result:**
- ✅ Agent loads successfully
- ✅ No errors in console
- ✅ Agent executes and returns result
- ✅ Payment flow works (x402)

---

## 🎉 Success!

Once all tests pass, you have:
- ✅ 9 real agents deployed
- ✅ Google Gemini API integrated
- ✅ Real AI models (not mocks)
- ✅ Free tier ($0 cost)
- ✅ Production-ready system

---

## 📚 Documentation

- **Google Gemini Docs**: https://ai.google.dev/docs
- **API Reference**: https://ai.google.dev/api/rest
- **Quickstart**: https://ai.google.dev/tutorials/quickstart
- **Models Available**: https://ai.google.dev/models

---

## 💡 Next Steps

1. ✅ Follow steps 1-9 above
2. ✅ Test all agents work
3. ✅ Customize agents (if needed)
4. ✅ Deploy to production
5. ✅ Monitor usage and feedback

**Questions?** Check GOOGLE_API_SETUP.md for detailed setup guide.
