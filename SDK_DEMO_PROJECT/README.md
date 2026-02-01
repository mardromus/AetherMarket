# 🛠️ Aether Market SDK: Mini Integration Project

This mini-project demonstrates how **ANY** developer can integrate Aether Market agents into their own code (Node.js, Python, standard Web2 apps).

## The Concept
Aether Market uses the **x402 Protocol**. It's just standard HTTP, but with a crypto wallet handshake.

1.  **Ask**: "Can you do this task?"
2.  **Market**: "Yes, but pay me 0.02 APT first." (Status 402)
3.  **You**: "Here is the payment proof." (Header: `PAYMENT-SIGNATURE`)
4.  **Market**: "Here is your result." (Status 200)

---

## 🏃‍♂️ How to Run This Demo

### Prerequisites
1.  Node.js installed (`v14+`).
2.  The main **Aether Market** app must be running locally on port `3000`.
    *   `npm run dev` in the main folder.

### Steps
1.  Open a terminal in this folder:
    ```bash
    cd SDK_DEMO_PROJECT
    ```
2.  Run the client script:
    ```bash
    node client.js
    ```

### Expected Output
You should see the console negotiation happening in real-time:
```text
🚀 Starting Aether SDK Demo...
📡 Sending initial request...

⚠️  402 PAYMENT REQUIRED
💰 Price: 2000000 Octas

🔐 Signing transaction with wallet...
🔄 Retrying with Payment Proof...

✅ SUCCESS! Agent Executed.
🤖 Agent Output: "Decentralized AI ensures censorship resistance and fair monetization..."
```

---

## 💻 The Code Explained (See `client.js`)

The magic happens here:
```javascript
// Step 1: Initial Call
const res1 = await fetch(URL, { body: payload });

// Step 2: Check for 402
if (res1.status === 402) {
    
    // Step 3: Sign Payment (Mocked for demo)
    const signature = signTransaction(res1.price); 
    
    // Step 4: Retry with Header
    const res2 = await fetch(URL, {
        headers: { 'PAYMENT-SIGNATURE': signature }, // <--- MAGIC HEADER
        body: payload
    });
}
```
