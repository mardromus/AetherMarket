# 🎥 Aether Market: Hackathon Demo Video Script (2 Minutes)

**Target Length:** 120 Seconds
**Goal:** Show the seamless User Experience (Keyless) and the powerful Developer Experience (x402 Protocol).

---

## 🎬 Intro: The Problem (0:00 - 0:20)
**Visual:**
*   Show a split screen: On the left, a complex MetaMask popup. On the right, a credit card subscription form.
*   Overlay text: "Broken Identity" | "Broken Payments"

**Voiceover:**
"We are entering the age of AI Agents, but they are currently unbanked and siloed. Agents can't hold wallets, and they can't swipe credit cards. To build a true Agentic Economy, we need a new Operating System."

---

## 🚀 Part 1: Keyless Identity (0:20 - 0:50)
**Visual:**
*   **Action:** Go to `neural-grid-iota.vercel.app` (Incognito window).
*   **Action:** Click **"Connect with Google"**.
*   **Action:** Select a Google Account -> *Snap* -> Logged in.
*   **highlight:** Hover over the Shield icon in the top right. Show the address `0x...` and the Balance.

**Voiceover:**
"This is Aether Market. Notice what you *didn't* see? No seed phrases. No wallet extensions.
Using **Aptos AIP-61 Keyless Accounts**, we generate a Zero-Knowledge Proof that derives a blockchain wallet directly from your Google Login. It's secure, non-custodial, and instant."

---

## 🤖 Part 2: The Agent Marketplace (0:50 - 1:15)
**Visual:**
*   **Action:** Scroll down to the Agent Grid.
*   **Action:** Click on "Atlas AI" (Text Agent).
*   **Action:** Type a prompt: *"Write a haiku about blockchain."*
*   **Action:** Click **"Execute Task"**.
*   **Visual:** Show the loading state -> Success.
*   **Visual:** Briefly show **Aptos Explorer** showing the transaction that just happened.

**Voiceover:**
"Here, I can hire autonomous agents for specific tasks. When I click 'Execute', I'm not just making an API call. I am streaming a micropayment of **Octas** directly to the Agent's wallet. The Agent verifies payment on-chain and delivers the result instantly using our Optimistic Verification system."

---

## 💻 Part 3: The Developer SDK (The "Wow" Moment) (1:15 - 1:45)
**Visual:**
*   **Transition:** Swift transition to VS Code / Terminal.
*   **Visual:** Show `client.js` code briefly.
*   **Action:** Run command: `node client.js` in the terminal.
*   **Visual:** Zoom in on the output logs:
    *   `⚠️ 402 PAYMENT REQUIRED`
    *   `🔗 Broadcasting Real Transaction...`
    *   `✅ Transaction Confirmed on Chain!`
    *   `🤖 Agent Output: ...`

**Voiceover:**
"But the real magic happens in the code. Because we use the **x402 Payment Protocol**, *any* developer can integrate these agents.
Here, my script tries to hire an agent. The server responds with '402 Payment Required'. My script automatically signs a real transaction on Aptos, sends the proof, and gets the result. This is true Machine-to-Machine commerce."

---

## 🏁 Outro (1:45 - 2:00)
**Visual:**
*   Return to the Aether Market Landing Page.
*   Overlay Text: **Aether Market** | **Built on Aptos**.

**Voiceover:**
"Aether Market bridges the gap between Web2 usability and Web3 value transfer. We are building the financial layer for the next generation of AI. Thank you."

---

## 🛠️ Preparation Checklist
1.  **Clear Local Storage:** Make sure you are logged out before starting Part 1.
2.  **Fund Wallet:** Ensure your Google Account wallet has at least 1 APT (Testnet) so you don't hit "Insufficient Balance".
3.  **Reset Terminal:** Run `clear` in your terminal so it looks clean before running the node script.
4.  **Zoom In:** Increase browser and IDE font size to 125% for visibility on video.
