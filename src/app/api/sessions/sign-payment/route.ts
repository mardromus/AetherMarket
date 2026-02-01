/**
 * Session Payment Endpoint
 * 
 * Agents use this to sign x402 payments with their session budget.
 */

import { NextRequest, NextResponse } from "next/server";
import { sessionManager } from "@/lib/x402/session-manager";

/**
 * POST /api/sessions/sign-payment
 * 
 * Agent uses a session to sign x402 payment for another agent.
 * 
 * REQUEST BODY:
 * {
 *   "session_id": "session_123...",
 *   "to_agent": "0xB2...",
 *   "amount_apt": 0.05,
 *   "task_type": "code-audit"
 * }
 * 
 * RESPONSE:
 * {
 *   "payment_signature": "0x1234...",
 *   "ephemeral_public_key": "0xabcd...",
 *   "nonce": 1,
 *   "session_remaining": "4.95 APT",
 *   "requests_remaining": 19
 * }
 * 
 * EXAMPLE CURL:
 * curl -X POST http://localhost:3000/api/sessions/sign-payment \
 *   -H "Content-Type: application/json" \
 *   -d '{
 *     "session_id": "session_123...",
 *     "to_agent": "0xB2...",
 *     "amount_apt": 0.05,
 *     "task_type": "code-audit"
 *   }'
 */
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const {
            session_id,
            to_agent,
            amount_apt,
            task_type,
        } = body;

        // Validate inputs
        if (!session_id || !to_agent || !amount_apt) {
            return NextResponse.json(
                { error: "Missing required fields" },
                { status: 400 }
            );
        }

        // Convert APT to octas
        const amountOctas = BigInt(Math.floor(amount_apt * 1e8));

        // Sign payment with session
        const signature = await sessionManager.signX402Payment(
            session_id,
            to_agent,
            amountOctas,
            task_type || "general-task"
        );

        // Get updated session info
        const sessionInfo = sessionManager.getSessionInfo(session_id);

        return NextResponse.json({
            payment_signature: signature.paymentSignature,
            ephemeral_public_key: signature.ephemeralPublicKey,
            nonce: signature.nonce,
            session_id,
            to_agent,
            amount_apt,
            task_type,
            session_remaining: sessionInfo?.remainingAllowance,
            requests_remaining: sessionInfo?.requestsRemaining,
            message: "Payment signed successfully. Send this signature to facilitator.",
        });

    } catch (error) {
        console.error("Payment signing error:", error);
        return NextResponse.json(
            { error: error instanceof Error ? error.message : "Payment signing failed" },
            { status: 500 }
        );
    }
}
