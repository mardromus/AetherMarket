import { Network } from "@aptos-labs/ts-sdk";

export const NETWORK = Network.TESTNET;
export const MODULE_ADDRESS = "0x..."; // To be filled with x402 contract address if implementing one, or the facilitator address.
// For the starter kit, we usually interact with a facilitator.
// The prompted facilitator URL is https://x402-navy.vercel.app/facilitator (implied).
// But for on-chain, we need the facilitator address.
// Per prompt, "Apto x402 is a production-ready payment protocol implementation".
// We'll trust the starter kit usually provides this. I'll leave a placeholder or look it up if I can.
// Actually, the prompt gives test wallets but not the contract address explicitly in the cheat sheet?
// Wait, "Aptos x402 Facilitator as a Service".
// I'll stick to basic constants for now.

export const APP_NAME = "Aether Agent Market";
