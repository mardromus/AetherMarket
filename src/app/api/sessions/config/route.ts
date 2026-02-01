/**
 * Session Management API
 * Handles session creation, configuration, and limit management
 */

import { NextRequest, NextResponse } from "next/server";
import {
    createSession,
    getOrCreateSession,
    getSession,
    getBudgetStatus,
    updateSessionConfig,
    pauseSession,
    resumeSession,
    getTransactionHistory
} from "@/lib/session/manager";

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { action, userId, sessionId } = body;

        // Create new session
        if (action === "create") {
            const session = createSession(userId, {
                maxTransactionAmount: body.maxTransactionAmount || "50000000",
                maxDailySpend: body.maxDailySpend || "500000000",
                maxMonthlySpend: body.maxMonthlySpend || "5000000000",
                maxConcurrentTasks: body.maxConcurrentTasks || 5,
                taskTimeoutMs: body.taskTimeoutMs || 120000,
                requestRateLimit: body.requestRateLimit || 10,
                allowedAgentIds: body.allowedAgentIds
            });

            return NextResponse.json(session);
        }

        // Get or create session
        if (action === "get-or-create") {
            const session = getOrCreateSession(userId);
            return NextResponse.json(session);
        }

        // Get session details
        if (action === "get") {
            const session = getSession(sessionId);
            if (!session) {
                return NextResponse.json(
                    { error: "Session not found" },
                    { status: 404 }
                );
            }
            return NextResponse.json(session);
        }

        // Get budget status
        if (action === "budget-status") {
            const status = getBudgetStatus(sessionId);
            if (!status) {
                return NextResponse.json(
                    { error: "Session not found" },
                    { status: 404 }
                );
            }
            return NextResponse.json(status);
        }

        // Update session config
        if (action === "update") {
            const updated = updateSessionConfig(sessionId, {
                maxTransactionAmount: body.maxTransactionAmount,
                maxDailySpend: body.maxDailySpend,
                maxMonthlySpend: body.maxMonthlySpend,
                maxConcurrentTasks: body.maxConcurrentTasks,
                taskTimeoutMs: body.taskTimeoutMs,
                requestRateLimit: body.requestRateLimit,
                allowedAgentIds: body.allowedAgentIds,
                requireManualApprovalOver: body.requireManualApprovalOver
            });

            if (!updated) {
                return NextResponse.json(
                    { error: "Session not found" },
                    { status: 404 }
                );
            }

            return NextResponse.json(updated);
        }

        // Pause session
        if (action === "pause") {
            const paused = pauseSession(sessionId, body.reason || "User paused session");
            if (!paused) {
                return NextResponse.json(
                    { error: "Session not found" },
                    { status: 404 }
                );
            }
            return NextResponse.json({ success: true, session: paused });
        }

        // Resume session
        if (action === "resume") {
            const resumed = resumeSession(sessionId);
            if (!resumed) {
                return NextResponse.json(
                    { error: "Session not found" },
                    { status: 404 }
                );
            }
            return NextResponse.json({ success: true, session: resumed });
        }

        // Get transaction history
        if (action === "transactions") {
            const history = getTransactionHistory(sessionId, body.limit || 50);
            return NextResponse.json({ transactions: history });
        }

        return NextResponse.json(
            { error: "Unknown action" },
            { status: 400 }
        );

    } catch (error) {
        console.error("Session API error:", error);
        return NextResponse.json(
            {
                error: error instanceof Error ? error.message : "Unknown error"
            },
            { status: 500 }
        );
    }
}

export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams;
        const action = searchParams.get("action");
        const sessionId = searchParams.get("sessionId");

        if (action === "budget-status" && sessionId) {
            const status = getBudgetStatus(sessionId);
            if (!status) {
                return NextResponse.json(
                    { error: "Session not found" },
                    { status: 404 }
                );
            }
            return NextResponse.json(status);
        }

        if (action === "get" && sessionId) {
            const session = getSession(sessionId);
            if (!session) {
                return NextResponse.json(
                    { error: "Session not found" },
                    { status: 404 }
                );
            }
            return NextResponse.json(session);
        }

        return NextResponse.json(
            { error: "Missing required parameters" },
            { status: 400 }
        );

    } catch (error) {
        console.error("Session API error:", error);
        return NextResponse.json(
            {
                error: error instanceof Error ? error.message : "Unknown error"
            },
            { status: 500 }
        );
    }
}
