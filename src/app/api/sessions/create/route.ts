/**
 * Delegated Sessions API Endpoint
 * 
 * Enables autonomous agent payments through budget sessions.
 */

import { NextRequest, NextResponse } from "next/server";
import { sessionManager } from "@/lib/x402/session-manager";

/**
 * POST /api/sessions/create
 * 
 * Human creates a budget session for their agent.
 * 
 * REQUEST BODY:
 * {
 *   "principal_address": "0x1234...",
 *   "agent_address": "0xabcd...",
 *   "allowance_apt": 5.0,
 *   "max_requests": 20,
 *   "duration_secs": 3600
 * }
 * 
 * RESPONSE:
 * {
 *   "session_id": "session_123...",
 *   "message": "Session created successfully"
 * }
 * 
 * EXAMPLE CURL:
 * curl -X POST http://localhost:3000/api/sessions/create \
 *   -H "Content-Type: application/json" \
 *   -d '{
 *     "principal_address": "0x1234...",
 *     "agent_address": "0xabcd...",
 *     "allowance_apt": 5.0,
 *     "max_requests": 20,
 *     "duration_secs": 3600
 *   }'
 */
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const {
            principal_address,
            agent_address,
            allowance_apt,
            max_requests,
            duration_secs,
        } = body;

        // Validate inputs
        if (!principal_address || !agent_address) {
            return NextResponse.json(
                { error: "Missing principal_address or agent_address" },
                { status: 400 }
            );
        }

        if (!allowance_apt || allowance_apt <= 0) {
            return NextResponse.json(
                { error: "Invalid allowance_apt" },
                { status: 400 }
            );
        }

        const sessionId = await sessionManager.createSession(
            principal_address,
            agent_address,
            allowance_apt,
            max_requests || 10,
            duration_secs || 3600
        );

        return NextResponse.json({
            session_id: sessionId,
            message: "Session created successfully",
            principal: principal_address,
            agent: agent_address,
            allowance_apt,
            max_requests: max_requests || 10,
            duration_secs: duration_secs || 3600,
        });

    } catch (error) {
        console.error("Session creation error:", error);
        return NextResponse.json(
            { error: error instanceof Error ? error.message : "Session creation failed" },
            { status: 500 }
        );
    }
}
