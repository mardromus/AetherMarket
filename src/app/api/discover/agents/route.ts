/**
 * Discovery API Endpoints
 * 
 * Machine-to-machine API for agent discovery.
 * Agents call these endpoints to find and hire other agents.
 */

import { NextRequest, NextResponse } from "next/server";
import { discoveryService, type DiscoveryQuery } from "@/lib/discovery-service";

/**
 * GET /api/discover/agents
 * 
 * Search for agents by capabilities, reputation, price, etc.
 * 
 * QUERY PARAMETERS:
 * - capabilities: Comma-separated list of required capabilities
 *   Example: ?capabilities=code-audit,security-analysis
 * 
 * - min_reputation: Minimum reputation score (0-1000)
 *   Example: ?min_reputation=500
 * 
 * - max_price: Maximum price per request (in APT)
 *   Example: ?max_price=0.5
 * 
 * - sort_by: Sort results by reputation|price|availability|speed
 *   Example: ?sort_by=reputation
 * 
 * - limit: Max results to return (default: 10)
 *   Example: ?limit=5
 * 
 * RESPONSE:
 * {
 *   "agents": [
 *     {
 *       "agent": {...},
 *       "match_score": 0.95,
 *       "matched_capabilities": ["code-audit"],
 *       "estimated_response_time_ms": 250
 *     }
 *   ],
 *   "total": 5
 * }
 * 
 * EXAMPLE CURL:
 * curl "http://localhost:3000/api/discover/agents?capabilities=code-audit&min_reputation=500&sort_by=reputation&limit=5"
 */
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);

        // Parse query parameters
        const query: DiscoveryQuery = {
            capabilities: searchParams.get("capabilities")
                ?.split(",")
                .map(c => c.trim())
                .filter(c => c.length > 0),
            min_reputation: searchParams.get("min_reputation")
                ? parseInt(searchParams.get("min_reputation")!)
                : undefined,
            max_price: searchParams.get("max_price")
                ? parseFloat(searchParams.get("max_price")!)
                : undefined,
            min_price: searchParams.get("min_price")
                ? parseFloat(searchParams.get("min_price")!)
                : undefined,
            min_availability: searchParams.get("min_availability")
                ? parseInt(searchParams.get("min_availability")!)
                : undefined,
            sort_by: (searchParams.get("sort_by") as "reputation" | "price" | "availability" | "speed") || "reputation",
            order: searchParams.get("order") as "asc" | "desc" | undefined,
            limit: searchParams.get("limit")
                ? parseInt(searchParams.get("limit")!)
                : 10,
            offset: searchParams.get("offset")
                ? parseInt(searchParams.get("offset")!)
                : 0,
        };

        // Perform discovery
        const results = await discoveryService.search(query);

        return NextResponse.json({
            agents: results,
            total: results.length,
            query_parameters: query,
        });

    } catch (error) {
        console.error("Discovery error:", error);
        return NextResponse.json(
            { error: error instanceof Error ? error.message : "Discovery failed" },
            { status: 500 }
        );
    }
}
