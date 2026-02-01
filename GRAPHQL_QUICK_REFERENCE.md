✅ AGENT_DEVELOPER_GUIDE.md (3,000+ lines)
✅ AGENT_DEVELOPMENT_CHEATSHEET.md (600 lines)
✅ src/app/develop/page.tsx (400 lines)
✅ AGENT_DOCS_START_HERE.md
✅ AGENT_DOCS_SUMMARY.md
✅ README_AGENT_DOCS.md
✅ DOCUMENTATION_COMPLETE.md
✅ DEVELOPER_GUIDE_ADDED.md
✅ AGENT_DOCS_CHECKLIST.md# GraphQL Quick Reference

## Basic Usage

```typescript
import { getAptosGraphQL } from "@/lib/aptos/graphql";

// Initialize (automatic network detection from config)
const graphql = getAptosGraphQL("mainnet"); // or "testnet"

// Get transaction
const txn = await graphql.getTransaction("0x1234...");

// Check balance
const balance = await graphql.getBalance("0xabcd...");

// Get events
const events = await graphql.getTransactionEvents("0x5678...");

// Check if finalized
const finalized = await graphql.isTransactionFinalized("0x1234...");
```

## Available Methods

| Method | Purpose | Returns |
|--------|---------|---------|
| `getTransaction(hash)` | Get transaction details | `Transaction \| null` |
| `getTransactionEvents(hash)` | Get transaction events | `Event[]` |
| `isTransactionFinalized(hash)` | Check if on-chain & confirmed | `boolean` |
| `getTransactions(limit, offset)` | Fetch multiple transactions | `Transaction[]` |
| `getAccount(address)` | Get account info | `Account \| null` |
| `getBalance(address, coinType)` | Get APT balance | `bigint` |
| `getModule(address, name)` | Get Move module | `Module \| null` |
| `getChainInfo()` | Get network info | `ChainInfo \| null` |
| `query<T>(gql, vars)` | Raw GraphQL query | `T \| null` |

## In Facilitator

```typescript
// The facilitator automatically uses GraphQL for verification

const result = await facilitator.verifyAndSubmit(
    paymentSignature,
    expectedAmount
);

if (result.isValid) {
    console.log("Payment verified via GraphQL!");
    console.log(result.transaction);
}

// Check balance before payment
const canPay = await facilitator.verifyAccountBalance(
    userAddress,
    "50000" // octas
);

// Get transaction details
const details = await facilitator.getTransactionDetails(txnHash);

// Get events
const events = await facilitator.getTransactionEvents(txnHash);
```

## Network Selection

```typescript
// Testnet
const graphql = getAptosGraphQL("testnet");

// Mainnet
const graphql = getAptosGraphQL("mainnet");

// Auto-detect from facilitator config
const networkStr = (facilitator.config.network === Network.TESTNET 
    ? "testnet" 
    : "mainnet") as "testnet" | "mainnet";
const graphql = getAptosGraphQL(networkStr);
```

## Common Patterns

### Verify Payment Transaction

```typescript
const graphql = getAptosGraphQL("mainnet");

const txn = await graphql.getTransaction(txnHash);
if (!txn || !txn.success) {
    return { error: "Transaction failed" };
}

const finalized = await graphql.isTransactionFinalized(txnHash);
if (!finalized) {
    return { error: "Not yet finalized" };
}

return { success: true, transaction: txn };
```

### Check Balance

```typescript
const balance = await graphql.getBalance("0xabcd...");
const required = BigInt("50000");

if (balance < required) {
    throw new Error(`Insufficient: ${balance} < ${required}`);
}
```

### Get Payment Events

```typescript
const events = await graphql.getTransactionEvents(txnHash);

const paymentEvents = events.filter(e => 
    e.type.includes("Payment") || e.type.includes("Coin")
);

paymentEvents.forEach(event => {
    console.log(event.type, event.data);
});
```

### Monitor Transaction Status

```typescript
async function waitForTransaction(txnHash: string, maxRetries = 30) {
    const graphql = getAptosGraphQL("mainnet");
    
    for (let i = 0; i < maxRetries; i++) {
        const txn = await graphql.getTransaction(txnHash);
        
        if (txn?.block_height) {
            return txn; // Finalized!
        }
        
        await new Promise(r => setTimeout(r, 1000)); // Wait 1s
    }
    
    throw new Error("Transaction timeout");
}
```

## Error Handling

```typescript
const txn = await graphql.getTransaction(txnHash);

if (!txn) {
    console.error("Transaction not found or query failed");
    // Fallback to REST API
}

const events = await graphql.getTransactionEvents(txnHash);
// Returns [] on error (never null)

const balance = await graphql.getBalance(address);
// Returns BigInt(0) on error
```

## Performance Tips

1. **Use Singleton**: `getAptosGraphQL()` always returns same instance
2. **Batch Queries**: Group related queries when possible
3. **Cache Results**: Cache transaction queries if checking same txn multiple times
4. **Network First**: REST API is primary, GraphQL is fallback
5. **Timeout Handling**: Add timeouts for production queries

## Endpoints

```
Testnet:  https://api.testnet.aptoslabs.com/v1/graphql
Mainnet:  https://api.mainnet.aptoslabs.com/v1/graphql
```

## Types

```typescript
export interface AptosTransaction {
    hash: string;
    success: boolean;
    version: string;
    block_height: string;
    gas_used: string;
    timestamp: string;
    sender: string;
}

export interface AptosAccount {
    address: string;
    authentication_key: string;
    coin_register_events: number;
}

export interface AptosEvent {
    key: string;
    sequence_number: string;
    type: string;
    data: Record<string, unknown>;
}

export type AptosNetwork = "testnet" | "mainnet";
```

## Related Files

- `src/lib/aptos/graphql.ts` - GraphQL client
- `src/lib/x402/facilitator.ts` - Payment verification
- `GRAPHQL_INTEGRATION.md` - Full documentation

---

**Last Updated**: February 1, 2026
