# 🚀 Aether Market: Hackathon Presentation Guide

This document contains everything you need to build your slide deck. It includes **Bullet Points**, **Speaker Notes**, **Code Snippets**, and **Screenshot Suggestions**.

---

## 🎨 Slide 1: Title Slide
**Title:** Aether Market: The First Autonomous Agent Economy on Aptos
**Subtitle:** Powered by AIP-61 Keyless Identity & x402 Micropayments
**Team Name:** [Your Team Name]

---

## 🛑 Slide 2: The Problem
**Headline:** AI Agents are Siloed and Unbanked.

*   **Identities are Fragmented:** Agents use API keys, not identities. They can't "own" anything.
*   **Payments are Broken:** Subscriptions (SaaS) don't work for machine-to-machine interaction. An AI agent cannot "subscribe" to another AI agent.
*   **UX is Friction:** Users don't want to manage private keys or seed phrases just to use an AI app.

---

## 💡 Slide 3: The Solution (Aether Market)
**Headline:** A Unified Operating System for Autonomous Agents.

*   **Keyless Entry:** Log in with Google, transact on-chain (AIP-61). Zero seed phrases.
*   **M2M Economy:** Agents pay each other per-request using the **x402 Protocol**.
*   **Composable:** Any developer can integrate our agents using the Aether SDK.

**[INSERT SCREENSHOT: Aether Market Dashboard showing available agents]**

---

## 🛠️ Slide 4: Technical Deep Dive - AIP-61 (Keyless)
**Headline:** Web2 UX + Web3 Security (ZK Proofs)

*   **No Wallets Required:** We use **Aptos AIP-61 Keyless Accounts**.
*   **How it works:**
    1.  User signs into Google (OIDC).
    2.  We generate a **Zero-Knowledge Proof (Groth16)** linking the JWT to a blockchain address.
    3.  An **Ephemeral Key** (stored in browser memory) signs transactions.
*   **Security:** Google *never* sees the private key. The proof is verified verify on-chain.

**[INSERT SCREENSHOT: The "Shield" icon in the navbar showing your address `0x...`]**

---

## 💳 Slide 5: The x402 Payment Protocol
**Headline:** HTTP 402 - The Missing Status Code

We implemented the `402 Payment Required` standard for handling autonomous payments.

**The Flow:**
1.  **Request:** Client asks Agent to "Generate Image".
2.  **Challenge:** Server responds: `402 Payment Required` + `Recipient Address` + `Price`.
3.  **Payment:** Client broadcasts transaction on Aptos.
4.  **Proof:** Client retries request with header: `PAYMENT-SIGNATURE: 0xTxnHash...`.
5.  **Execution:** Server verifies hash on-chain -> Deliver Result.

---

## 💻 Slide 6: LIVE DEMO - The SDK Integration
**Headline:** "Anyone can build on Aether"

*We proved this works externally. We built a Node.js client (outside the app) that hires an agent.*

**Code Snippet (The Client Loop):**
```javascript
// SDK_DEMO_PROJECT/client.js

// 1. Initial Request (Fails with 402)
const res1 = await fetch(GATEWAY_URL, payload);
const invoice = await res1.json(); // Price: 0.02 APT

// 2. Sign & Pay on Chain
const txn = await aptos.signAndSubmitTransaction({
    sender: account,
    data: { 
        function: "0x1::aptos_account::transfer", 
        arguments: [invoice.recipient, invoice.amount] 
    }
});

// 3. Retry with Proof
const res2 = await fetch(GATEWAY_URL, {
    headers: { 
        'PAYMENT-SIGNATURE': JSON.stringify({ txnHash: txn.hash }) 
    },
    body: JSON.stringify(payload)
});

// ✅ Success: Agent performs task!
```

**[INSERT SCREENSHOT: Your terminal output showing "✅ Transaction Confirmed on Chain!" and "🤖 Agent Output"]**

---

## 📊 Slide 7: Verification System
**Headline:** Trust, Verified.

*   **On-Chain Verification:** The server (Facilitator) reads the Aptos Blockchain state.
*   **Instant Settlement:** We use Optimistic Verification on Testnet for sub-second agent response times.
*   **Double-Spend Protection:** Each Request ID + Transaction Hash pair is unique.

**Code Snippet (The Server Verification):**
```typescript
// src/app/api/agent/execute/route.ts

// Verify on-chain data
const verification = await facilitator.verifyAndSubmit(
    paymentSignature,
    storedRequest.amount
);

if (!verification.isValid) {
    return NextResponse.json({ error: "Payment failed" }, { status: 402 });
}

// Payment confirmed -> Execute AI Model
const result = await executeAgent(agentId, parameters);
```

**[INSERT SCREENSHOT: Aptos Explorer showing the transaction from your Keyless Account to the Agent]**

---

## 🏆 Slide 8: Why We Win (Impact)
*   **Target Audience:** Non-crypto natives (Keyless) + AI Developers (SDK).
*   **Scalability:** Aptos high throughput + Move security.
*   **Future:** We are building the "App Store" for AI Agents.

---

## 📸 Checklist: Screenshots to Capture
1.  **Homepage:** The Hero section with "Connect with Google".
2.  **Dashboard:** The list of agents with prices in APT.
3.  **Aptos Explorer:** A transaction details page showing `transfer` of `0.02 APT`.
4.  **Terminal:** The output of `node client.js` showing the successful handshake.
5.  **Navbar:** The Wallet Selector showing your balance (evidence of balance fetching).

