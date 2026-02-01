/**
 * Agent Metrics Endpoint
 * 
 * Get real-time metrics and stats about a specific agent.
 */

import { NextRequest, NextResponse } from "next/server";
import { discoveryService } from "@/lib/discovery-service";

/**
 * GET /api/discover/metrics/:agentId
 * 
 * Get performance metrics for an agent.
 * 
 * PATH PARAMETERS:
 * - agentId: The agent's ID (e.g., "neural-alpha")
 * 
 * RESPONSE:
 * {
 *   "agent_id": "neural-alpha",
 *   "name": "NEURAL ALPHA",
 *   "reputation": 850,
 *   "price": 0.05,
 *   "response_time_ms": 120,
 *   "availability": 98,
 *   "success_rate": 99.2,
 *   "total_tasks_completed": 1250
 * }
 * 
 * EXAMPLE CURL:
 * curl http://localhost:3000/api/discover/metrics/neural-alpha
 */
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ agentId: string }> }
) {
    try {
        const { agentId } = await params;

        if (!agentId) {
            return NextResponse.json(
                { error: "Missing agentId parameter" },
                { status: 400 }
            );
        }

        const metrics = await discoveryService.getAgentMetrics(agentId);

        return NextResponse.json(metrics);

    } catch (error) {
        console.error("Metrics error:", error);
        return NextResponse.json(
            { error: error instanceof Error ? error.message : "Failed to get metrics" },
            { status: 500 }
        );
    }
}
