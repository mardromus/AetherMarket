# 🧠 Aether Market: The "Under the Hood" Technical Deep Dive

Use this content for the **"Technical Architecture"** and **"Innovation"** sections of your presentation. This explains *exactly* how we merged Web2 Identity with Web3 Payments.

---

## 1. The Core Innovation: AIP-61 (Keyless Accounts)

Most blockchain apps require a browser extension (Petra, Martian). We removed that barrier using **AIP-61**.

### **What is AIP-61?**
It is a standard on Aptos that allows a blockchain address to be derived from an OpenID Connect (OIDC) identity (like Google, Apple, or GitHub) combined with a Zero-Knowledge (ZK) Proof.

### **The Cryptographic Flow (The "Magic Trick")**

1.  **Ephemeral Key Generation (Client-Side)**
    *   The browser generates a temporary public/private key pair (`EphemeralKeyPair`).
    *   This key lives *only* in browser memory and expires in 1 hour.
    *   *Why?* So Google never sees your blockchain private key.

2.  **OIDC Handshake (OAuth 2.0)**
    *   We send the user to Google.
    *   **Crucial Step**: We embed the `Ephemeral_Public_Key` into the **nonce** field of the request.
    *   Google responds with a **JWT (JSON Web Token)** signed by Google's private key.
    *   *The link*: The JWT says "Kushal owns this email AND he authorized this Ephemeral Key (via nonce)."

3.  **Zero-Knowledge Proof (Groth16)**
    *   We generate a **ZK Proof** (using Groth16) that proves:
        *   "I have a valid JWT signed by Google."
        *   "The JWT contains the user's customized identity (sub)."
        *   "The JWT contains the specific Ephemeral Public Key."
    *   **Privacy**: The proof reveals `Hash(uid, pepper, aud)`, NOT the user's email or the raw signature.

4.  **On-Chain Verification**
    *   The transaction is signed by the *Ephemeral Private Key*.
    *   The transaction includes the *ZK Proof* and the *Ephemeral Public Key*.
    *   The Aptos blockchain verifies the proof against the verification key (stored on-chain).
    *   **Result**: Valid transaction from `0xADDRESS`.

---

## 2. Address Derivation & Privacy (The "Pepper")

How do we ensure privacy? If we just hashed `kushal@gmail.com`, anyone could guess the hash.

### **The Formula**
```
Aptos_Address = Hash(
    UID (Google User ID) 
    + App_ID (aud) 
    + PEPPER (Secret Blinding Factor)
)
```

### **The Pepper Service**
*   We run a private service that stores a database of `UID -> Pepper`.
*   When a user logs in, we fetch their specific Pepper.
*   **Property**: The Pepper ensures your wallet address is stable (same email = same wallet) but private (cannot be reverse-engineered to the email).

---

## 3. The x402 Protocol: Testnet vs Mainnet Flow

You asked: **"What is the flow currently in Testnet?"**

On Testnet, we use **Optimistic Verification** to simulate "Instant Settlement" without waiting for block finality latency.

### **The Testnet Payment Flow (Current Implementation)**

1.  **Trigger**: User clicks "Execute" (e.g., generate image).
2.  **State Check**: Client checks `KeylessAccount` existence.
3.  **Transaction Build**:
    *   Client constructs a transfer transaction: `0.02 APT` -> `FacilitatorAddress` (or Treasury).
4.  **Signing**:
    *   Client signs with **Keyless Ephemeral Key** (Instant).
    *   Client submits to Aptos Testnet node.
    *   Node returns `PendingTransactionHash`.
5.  **Optimistic Handshake (The "Fast Path")**:
    *   Client sends `PAYMENT-SIGNATURE: 0xHash` header to our API immediately.
    *   **API Verification**:
        *   Our API calls the Aptos Node: `GET /transactions/by_hash/{hash}`.
        *   **Testnet Trick**: Even if the transaction is "Pending", if the signature is valid and gas is sufficient, we **accept it immediately**.
        *   We don't wait for 100% block finality.
    *   **Result**: The AI Agent starts working *milliseconds* after you click the button.

### **The Mainnet Flow (Future)**
On Mainnet, we will wait for **1 Block Confirmation (~200ms on Aptos)** to ensure the money actually moved before burning expensive GPU credits.

---

## 4. Key Differentiators (Why We Win)

| Feature | Competitors (Traditional) | Aether Market (AIP-61 + x402) |
| :--- | :--- | :--- |
| **Onboarding** | "Install Metamask, save seed phrase" | "Sign in with Google" |
| **Payments** | Subscription with Credit Card | Pay-per-request (Micropayments) |
| **Latency** | High (Block confirmations) | Sub-second (Optimistic verification) |
| **Privacy** | Public wallet tracking | ZK-Shielded Identity |

---

## 5. Code Snippet for AIP-61 (React)

```typescript
// src/lib/keyless/provider.tsx

const signWithSession = async (payload: any) => {
    // 1. Get the active Ephemeral Key Pair
    const keyPair = loadEphemeralKeyPair(); 
    
    // 2. Get the ZK Proof (already generated at login)
    const proof = loadZKProof();

    // 3. Create the Transaction
    const transaction = await aptos.transaction.build.simple({
        sender: account.address,
        data: payload
    });

    // 4. Sign it using the Ephemeral Key (No Popup!)
    const senderAuthenticator = aptos.transaction.sign.keyless({
        transaction,
        signer: keyPair,
        proof // Attach the ZK Proof
    });

    // 5. Submit to Chain
    return await aptos.transaction.submit.simple({
        transaction,
        senderAuthenticator
    });
};
```
