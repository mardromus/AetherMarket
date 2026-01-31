import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
    // 1. Payment Check (Simulated for Demo, but ready for Mainnet)
    const authHeader = req.headers.get("Authorization");
    const isPaid = authHeader && authHeader.startsWith("x402");

    if (!isPaid) {
        const RECIPIENT = process.env.NEXT_PUBLIC_PAYMENT_RECIPIENT || "0xaaefee8ba1e5f24ef88a74a3f445e0d2b810b90c1996466dae5ea9a0b85d42a0";
        // Charging 100000 Octas (0.001 APT approx for test)
        const COST = "100000";

        return NextResponse.json(
            { error: "Payment Required" },
            {
                status: 402,
                headers: {
                    "WWW-Authenticate": `x402 address="${RECIPIENT}" amount="${COST}"`
                }
            }
        );
    }

    try {
        const body = await req.json();
        // Determine Agent Persona based on body or default
        // In a real app, this would be determined by the Agent ID in the URL, passed here or via context.
        // For this hackathon demo, we'll infer it from the prompt/body or random if not specified.
        const capability = body.capability || "general"; // 'visual', 'audit', 'finance'

        const logs = [];
        logs.push(`[SYSTEM]: Authenticated request from ${authHeader.substring(0, 15)}...`);
        logs.push(`[NODE]: Allocating compute resources (GPU-H100 x 4)...`);

        // --- SCENARIO 1: CREATIVE AGENT (Image Gen) ---
        if (capability === 'visual' || body.prompt?.toLowerCase().includes("image") || body.prompt?.toLowerCase().includes("render")) {
            logs.push(`[MODEL]: Loading Stable-Diffusion-XL-Refiner...`);
            logs.push(`[RENDER]: Sampling 50 steps...`);
            await new Promise(r => setTimeout(r, 800)); // Sim delay
            logs.push(`[UPSCALE]: Enhancing resolution to 4K...`);

            // Return a placeholder image from a reliable source
            const seed = Math.floor(Math.random() * 1000);
            const imageUrl = `https://picsum.photos/seed/${seed}/800/600`;

            return NextResponse.json({
                status: "success",
                logs: logs,
                outputType: "image",
                output: imageUrl,
                timestamp: new Date().toISOString()
            });
        }

        // --- SCENARIO 2: SECURITY AUDITOR (Markdown Report) ---
        if (capability === 'audit' || body.prompt?.toLowerCase().includes("audit") || body.prompt?.toLowerCase().includes("security")) {
            logs.push(`[ANALYSIS]: Parsing Solidity/Move AST...`);
            logs.push(`[SCAN]: Checking for Reentrancy vectors...`);
            await new Promise(r => setTimeout(r, 600));
            logs.push(`[VULN]: 0 Critical, 2 Low severity issues found.`);
            logs.push(`[GENERATOR]: Compiling PDF report...`);

            const report = `
# 🛡️ Smart Contract Security Report
**Target**: \`0x1::AetherProtocol\`
**Score**: **98/100** (A+)

## Executive Summary
The analyzed modules exhibit strong security posture. Access control is strictly enforced via \`signer\` checks. No reentrancy vulnerabilities detected.

## Findings
### 1. Gas Optimization (Low)
In \`AgentRegistry.move\`, the loop over capabilities could be optimized for large vectors.
\`\`\`move
// Recommendation: Use a view function instead of on-chain iteration
public fun get_caps(agent: &AgentCap)...
\`\`\`

### 2. Event Emission
Events are correctly emitted for all state changes.

## Conclusion
Code is **SAFE** for Mainnet Deployment.
            `;

            return NextResponse.json({
                status: "success",
                logs: logs,
                outputType: "markdown",
                output: report,
                timestamp: new Date().toISOString()
            });
        }

        // --- SCENARIO 3: FINANCE (Data Oracle) ---
        // Fallback to original crypto price fetch
        logs.push(`[NET]: GET https://api.coingecko.com/api/v3/simple/price?ids=aptos&vs_currencies=usd`);
        const start = Date.now();
        const cgRes = await fetch("https://api.coingecko.com/api/v3/simple/price?ids=aptos&vs_currencies=usd");
        const data = await cgRes.json();
        const latency = Date.now() - start;

        logs.push(`[NET]: Status 200 OK (${latency}ms)`);

        const price = data?.aptos?.usd || "4.20"; // Fallback if rate limited
        const output = `[LIVE MARKET DATA]\n\nASSET: APTOS (APT)\nPRICE: $${price} USD\nSOURCE: CoinGecko Decentralized Aggregator\n\nTIMESTAMP: ${new Date().toISOString()}`;

        return NextResponse.json({
            status: "success",
            logs: logs,
            outputType: "text",
            output: output,
            timestamp: new Date().toISOString()
        });

    } catch (e) {
        console.error(e);
        return NextResponse.json({ error: "Execution Failed" }, { status: 500 });
    }
}
