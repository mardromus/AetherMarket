# 402 Payment Required - Troubleshooting Guide

## What Does 402 Mean?

**402 Payment Required** is **EXPECTED** in the x402 protocol. It means:
1. ✅ Server received your request
2. ✅ Agent was identified
3. ✅ Price calculated
4. ❌ Payment not received (yet)
5. 📋 You now need to: Sign a transaction and retry

## Normal Flow (Working as Designed)

```
1. Client: POST /api/agent/execute (no payment)
   ↓
2. Server: Returns 402 + Payment Details
   ↓
3. Client: Creates & signs payment transaction
   ↓
4. Client: Retries with PAYMENT-SIGNATURE header
   ↓
5. Server: Verifies payment on-chain
   ↓
6. Server: Executes agent + returns result
```

## If You Keep Getting 402 (Stuck in Loop)

### Issue 1: Client Not Handling 402
**Symptom**: You see 402 error in browser network tab repeatedly

**Solution**: Make sure you're using the `PaymentModal` component or `X402Client`:
```typescript
import { X402Client } from "@/lib/x402/client";

const client = new X402Client();
const result = await client.executeAgentTask(task, account.address, signer);
```

### Issue 2: Payment Not Being Signed
**Symptom**: 402 returned, but no payment signature sent back

**Solution**: Ensure you have an active delegation session:
```
1. Go to http://localhost:3000/dashboard
2. Click "Create Delegation Session"
3. Wait for confirmation
4. Return to demo or agent page
5. Try again
```

### Issue 3: Payment Signature Invalid
**Symptom**: 402 with message "Payment verification failed"

**Solution**: Check transaction hash:
```
1. Open browser console (F12)
2. Look for "[x402] Payment verified..." message
3. If you see "Payment verification error", check:
   - Is transaction hash valid?
   - Did transaction actually execute?
   - Check Aptos testnet explorer
```

### Issue 4: Transaction Hasn't Finalized
**Symptom**: 402 with "Transaction not yet finalized"

**Solution**: Wait a few seconds and retry:
```
// In PaymentModal, the code already handles this:
// 1. Waits for transaction
// 2. Retries verification
// 3. Exponential backoff on failures
```

## Fixed: GraphQL Verification Too Strict

**Problem**: After GraphQL integration, valid payments were rejected if GraphQL was slow

**Fix Applied** (February 1, 2026):
- REST API is now PRIMARY (confirms payment exists)
- GraphQL is OPTIONAL (enhanced verification only)
- If GraphQL fails, payment still goes through
- GraphQL errors are logged but don't block execution

```typescript
// Old (too strict):
if (!gqlTxn || !gqlTxn.success) {
    return { isValid: false, error: "..." };
}

// New (flexible):
try {
    const gqlTxn = await graphql.getTransaction(...);
    if (gqlTxn) console.log("GraphQL confirmed");
} catch {
    console.log("GraphQL optional, continuing");
}
```

## Testing Payment Flow

### Step 1: Set Up
```bash
npm run dev
# Navigate to http://localhost:3000
```

### Step 2: Authenticate
```
1. Click "Sign in with Google"
2. Complete login
3. You'll get a keyless account
```

### Step 3: Create Session
```
1. Go to /dashboard
2. Click "Create Delegation Session"
3. Sign with Google
4. Wait for confirmation
```

### Step 4: Test Payment
```
Option A - Demo Flow:
1. Go to /demo
2. Click "Start Autonomous Flow"
3. Watch 8-step visualization
4. Check console for GraphQL logs

Option B - Agent Marketplace:
1. Go to /agents
2. Pick an agent
3. Click to execute
4. Complete payment flow
5. See result
```

## Console Logs to Watch For

### Success Indicators
```
✅ [x402] Payment verified: 0x1234...
✅ [x402] Executing agent atlas-ai with real AI...
✅ [x402] Task completed successfully in 2345ms
✅ [GraphQL] Query for transaction successful
```

### Issue Indicators
```
❌ Payment verification error: timeout
❌ Transaction not found on-chain
❌ Transaction failed on-chain
❌ Payment request expired
```

## Environment Checks

### Required for Payments
- ✅ NEXT_PUBLIC_APTOS_NETWORK=testnet (or mainnet)
- ✅ Google OAuth configured (for keyless)
- ✅ Node.js environment variables set

### Check Setup
```bash
# Verify environment
echo $NEXT_PUBLIC_APTOS_NETWORK

# Should show: testnet (or mainnet)
```

## If Still Stuck

### Check #1: Browser Console
```
1. Press F12 to open DevTools
2. Click "Console" tab
3. Look for [x402] or GraphQL logs
4. Copy error message
5. Search GRAPHQL_INTEGRATION.md for error
```

### Check #2: Network Tab
```
1. Press F12 → Network tab
2. Execute a task
3. Look for /api/agent/execute requests
4. Click request → Response tab
5. Should see:
   - First response: 402 status
   - Second response: 200 status with result
```

### Check #3: Transaction on Testnet
```
1. Get transaction hash from console
2. Go to https://testnet.aptoslabs.com/
3. Paste hash in search
4. Should see transaction details
5. Should show success: true
```

## Quick Fixes

### "Payment request expired" (410 Error)
```
❌ Problem: Took too long to sign
✅ Solution: Try again (5 min timeout)
```

### "Invalid or expired request ID" (400 Error)
```
❌ Problem: Payment signature from different request
✅ Solution: Don't reuse payment signatures
```

### "Transaction failed on-chain" (402 Error)
```
❌ Problem: Payment transaction failed
✅ Solution: Check balance, try again
```

### "Transaction not yet finalized" (402 Error)
```
❌ Problem: Just submitted, not yet on-chain
✅ Solution: Wait 1-2 seconds, retry
```

## Expected Timing

```
REST API verification:     ~50-100ms ✅
GraphQL verification:      ~100-200ms (optional)
Total payment verify:      ~150-300ms ✅
Agent execution:           1000-5000ms (depends on agent)
Total end-to-end:          2000-6000ms

If GraphQL times out:      Falls back to REST (~50-100ms)
```

## Verify It's Working

```bash
# 1. Start server
npm run dev

# 2. Open http://localhost:3000/demo

# 3. You should see:
# - "Sign in with Google" button
# - Once signed in: "Create Session" button
# - Once session created: "Start Autonomous Flow" button

# 4. Click "Start Autonomous Flow"

# 5. Watch the 8-step visualization:
# Step 1: Initialize ✅
# Step 2: Verify Auth ✅
# Step 3: Request Payment ✅ (402)
# Step 4: Sign Transaction ✅
# Step 5: Verify on-chain ✅
# Step 6: Execute Agent ✅
# Step 7: Get Result ✅
# Step 8: Complete ✅

# If all steps show ✅, system is working!
```

## Real Example: Expected Console Output

```
[x402] Initial request received
GET /api/agent/execute (no payment)
Response: 402 Payment Required
{
  amount: "2000000",
  recipient: "0x1",
  requestId: "req-...",
  expiresAt: 1706818284838
}

[Keyless] Signing with session...
POST /api/agent/execute (with PAYMENT-SIGNATURE)
Response: 200 OK
[x402] Payment verified: 0x1234567...
[x402] Executing agent atlas-ai with real AI...
[agents] Calling OpenAI GPT-4...
[x402] Task completed successfully in 2345ms
{
  result: "Here is the answer...",
  executionTime: 2345,
  agentId: "atlas-ai",
  taskType: "text-generation",
  metadata: { success: true }
}
```

## Still Not Working?

1. **Restart the dev server** (sometimes helps)
   ```bash
   Ctrl+C to stop
   npm run dev to restart
   ```

2. **Clear browser cache** (localStorage might be stale)
   ```
   DevTools → Application → Clear Site Data
   ```

3. **Check browser console** for specific error messages

4. **Read GRAPHQL_QUICK_REFERENCE.md** for GraphQL-specific issues

5. **Check AGENTS.md** for agent-specific configuration

---

**Last Updated**: February 1, 2026
**Status**: 402 payments now working perfectly with improved fallback logic ✅
