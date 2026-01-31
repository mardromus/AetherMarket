import { Aptos, AptosConfig, InputGenerateTransactionPayloadData } from "@aptos-labs/ts-sdk";
import { Network } from "@aptos-labs/ts-sdk";
import { WalletContextState } from "@aptos-labs/wallet-adapter-react";

// Initialize Aptos Client
const aptosConfig = new AptosConfig({ network: Network.TESTNET });
const aptos = new Aptos(aptosConfig);

// DEV CONFIGURATION: Set to false to usage Real Testnet Wallets
// For Hackathon Demo: We can toggle this.
const USE_MOCK_WALLET = false;

/**
 * Handles the x402 payment flow.
 * @param url The API endpoint to call.
 * @param options Fetch options.
 * @param wallet The Aptos wallet adapter context.
 */
export async function fetchWithPayment(
    url: string,
    options: RequestInit = {},
    wallet: WalletContextState
) {
    // 1. Attempt the request
    const response = await fetch(url, options);

    // 2. If not 402, return response
    if (response.status !== 402) {
        return response;
    }

    // 3. Handle 402 Payment Required
    console.log("Payment Required (402). Intiating x402 flow...");

    // Extract payment details from headers
    const wwwAuthenticate = response.headers.get("WWW-Authenticate");
    if (!wwwAuthenticate) {
        throw new Error("Missing WWW-Authenticate header in 402 response");
    }

    // Parse Header: x402 address="...", amount="..."
    const paymentDetails = parseAuthenticateHeader(wwwAuthenticate);

    if (!wallet.account || !wallet.signAndSubmitTransaction) {
        // If Mock Mode is allowed, we can proceed even without a wallet in some cases, 
        // but ideally we still want the "Connect Wallet" UI to be in "connected" state.
        // For this hackathon fix, we'll throw only if NOT using mock wallet.
        if (!USE_MOCK_WALLET) {
            throw new Error("Wallet not connected");
        }
    }

    // 4. Construct Transaction
    // We need to send APT (or USDC) to the facilitator/seller.
    // The header should contain the recipient and amount.

    // DEBUG: Log the payment details
    console.log("[x402] Payment Details:", paymentDetails);

    // ENSURE TYPE SAFETY: 
    // Aptos SDK v1 often expects u64 as strings, but sometimes number works. 
    // We enforce string for u64 to be safe with BigInts.
    const amountStr = String(paymentDetails.amount);

    const payload: InputGenerateTransactionPayloadData = {
        function: "0x1::aptos_account::transfer",
        functionArguments: [paymentDetails.address, amountStr],
    };

    console.log("[x402] Transaction Payload:", JSON.stringify(payload, null, 2));

    try {
        let signatureHash = "";

        if (USE_MOCK_WALLET) {
            console.log("⚠️ MOCK MODE: Bypassing real transaction...");
            await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate network delay
            signatureHash = "0xMOCK_" + Array.from({ length: 40 }, () => Math.floor(Math.random() * 16).toString(16)).join("");
            console.log("Mock Payment Successful:", signatureHash);
        } else {
            // Real Transaction Flow
            const response = await wallet.signAndSubmitTransaction({
                data: payload as any,
            });
            await aptos.waitForTransaction({ transactionHash: response.hash });
            signatureHash = response.hash;
            console.log("Payment Successful:", signatureHash);
        }

        // 5. Retry Request with Payment Proof
        // Add Authorization: x402 <tx_hash>
        const newHeaders = new Headers(options.headers);
        newHeaders.set("Authorization", `x402 ${signatureHash}`);

        return fetch(url, {
            ...options,
            headers: newHeaders,
        });

    } catch (error: any) {
        // Broadly detect cancellation / rejection
        const errorString = String(error?.message || error || "");

        const isUserRejection =
            errorString.toLowerCase().includes("rejected") ||
            errorString.toLowerCase().includes("cancelled") ||
            errorString.toLowerCase().includes("user denied");

        if (isUserRejection) {
            console.warn("x402: Payment flow cancelled by user (Intentional)");
            // We throw a specific error object that the UI can catch without parsing strings again if it wants,
            // or we just rethrow a standard Error with a known message.
            throw new Error("User rejected the request");
        }

        console.error("Payment failed", error);
        throw error;
    }
}

function parseAuthenticateHeader(header: string) {
    // Regex or split to extract address and amount
    // Format: x402 address="0x..." amount="1000" (or 0.1 for display, but usually Octas on-chain)

    const addressMatch = header.match(/address="([^"]+)"/);
    const amountMatch = header.match(/amount="([^"]+)"/);

    if (!addressMatch || !amountMatch) {
        throw new Error("Invalid x402 header format: " + header);
    }

    return {
        address: addressMatch[1],
        amount: amountMatch[1] // Usually passed as string, handled by SDK
    };
}
