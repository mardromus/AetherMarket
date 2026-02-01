/**
 * Intent Search Endpoint
 * 
 * Natural language agent discovery.
 * Agents describe what they need in plain language.
 */

import { NextRequest, NextResponse } from "next/server";
import { discoveryService } from "@/lib/discovery-service";

/**
 * POST /api/discover/intent
 * 
 * Find agents based on natural language intent.
 * 
 * REQUEST BODY:
 * {
 *   "intent": "Find an agent capable of auditing Move smart contracts"
 * }
 * 
 * RESPONSE:
 * {
 *   "analysis": {
 *     "capabilities_required": ["code-audit", "move-expertise"],
 *     "confidence": 0.85,
 *     "keywords": ["audit", "move", "contracts"]
 *   },
 *   "agents": [
 *     {
 *       "agent": {...},
 *       "match_score": 0.92,
 *       "matched_capabilities": ["code-audit"],
 *       "estimated_response_time_ms": 300
 *     }
 *   ]
 * }
 * 
 * EXAMPLE CURL:
 * curl -X POST http://localhost:3000/api/discover/intent \
 *   -H "Content-Type: application/json" \
 *   -d '{"intent": "Find an agent that can audit my Move smart contract"}'
 */
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { intent } = body;

        if (!intent || typeof intent !== "string") {
            return NextResponse.json(
                { error: "Missing or invalid 'intent' field" },
                { status: 400 }
            );
        }

        // Search by intent
        const results = await discoveryService.searchByIntent(intent);

        return NextResponse.json({
            intent,
            agents: results,
            total: results.length,
        });

    } catch (error) {
        console.error("Intent discovery error:", error);
        return NextResponse.json(
            { error: error instanceof Error ? error.message : "Intent discovery failed" },
            { status: 500 }
        );
    }
}
