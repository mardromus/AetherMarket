/**
 * Real Agent Execution Engine - Google Gemini API
 * 
 * Handles routing to actual AI services using Google Gemini
 * Supports: Text Generation, Code Analysis, Image Prompts, Web Search, Sentiment Analysis, etc.
 */

import { GoogleGenerativeAI } from "@google/generative-ai";

// Agent type definitions
export type AgentType = 
  | "image-generation" 
  | "code-audit" 
  | "financial-analysis" 
  | "web-search"
  | "text-generation"
  | "code-generation"
  | "sentiment-analysis"
  | "general";

export interface AgentExecutionResult {
    result: any;
    executionTime: number;
    agentId: string;
    taskType: string;
    metadata?: Record<string, any>;
}

// Initialize Gemini client (lazy loading for performance)
let genAI: GoogleGenerativeAI | null = null;

function getGeminiClient(): GoogleGenerativeAI {
    if (!genAI) {
        const apiKey = process.env.GOOGLE_API_KEY;
        if (!apiKey) {
            throw new Error("GOOGLE_API_KEY environment variable not configured. Get one at https://ai.google.dev");
        }
        genAI = new GoogleGenerativeAI(apiKey);
    }
    return genAI;
}

/**
 * Execute image generation (Neural Alpha)
 * Uses Gemini to generate detailed image prompts
 */
async function executeImageGeneration(parameters: any): Promise<any> {
    const genAI = getGeminiClient();
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });

    const prompt = parameters.prompt || "A beautiful landscape";
    const style = parameters.style || "photorealistic";

    try {
        const response = await model.generateContent(`Create a detailed, vivid image prompt based on this description:
"${prompt}"

Style: ${style}

Requirements:
- Include specific visual elements
- Describe lighting, colors, mood, composition
- Use descriptive adjectives
- Suitable for image generation APIs
- Format: [STYLE] [SUBJECT] [SETTING] [LIGHTING] [MOOD] [QUALITY]

Respond with ONLY the detailed prompt, no additional text.`);

        const imagePrompt = response.response.text();

        return {
            type: "image-prompt",
            originalPrompt: prompt,
            detailedPrompt: imagePrompt,
            style,
            model: "gemini-1.5-pro",
            timestamp: new Date().toISOString(),
            note: "Use this prompt with image generation APIs like Midjourney, Stable Diffusion, or DALL-E"
        };
    } catch (error) {
        console.error("Image generation error:", error);
        throw new Error(`Failed to generate image prompt: ${error instanceof Error ? error.message : "Unknown error"}`);
    }
}

/**
 * Execute code audit (Quantum Sage)
 */
async function executeCodeAudit(parameters: any): Promise<any> {
    const genAI = getGeminiClient();
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });

    const code = parameters.code || "";
    const language = parameters.language || "javascript";

    if (!code) {
        throw new Error("No code provided for audit");
    }

    if (code.length > 100000) {
        throw new Error("Code is too large (max 100KB). Please provide a smaller snippet.");
    }

    try {
        const response = await model.generateContent(`You are an expert code auditor specializing in ${language}. Analyze this code:

\`\`\`${language}
${code}
\`\`\`

Provide a detailed JSON response with these EXACT fields:
{
  "overallScore": 0-10,
  "riskLevel": "critical"|"high"|"medium"|"low",
  "vulnerabilities": [{"severity": "high"|"medium"|"low", "type": string, "description": string, "suggestion": string}],
  "suggestions": [string],
  "strengths": [string],
  "estimatedTimeToFix": "immediate"|"1 hour"|"1 day"|"1 week"
}

Focus on:
1. Security vulnerabilities and exploits
2. Performance bottlenecks
3. Code quality and best practices
4. Potential runtime errors
5. Memory leaks and resource management

Respond with ONLY valid JSON, no markdown.`);

        const content = response.response.text();
        const auditResult = JSON.parse(content);

        return {
            type: "code-audit",
            language,
            codeLength: code.length,
            overallScore: auditResult.overallScore || 5,
            riskLevel: auditResult.riskLevel || "medium",
            vulnerabilities: auditResult.vulnerabilities || [],
            suggestions: auditResult.suggestions || [],
            strengths: auditResult.strengths || [],
            estimatedTimeToFix: auditResult.estimatedTimeToFix || "TBD",
            model: "gemini-1.5-pro",
            timestamp: new Date().toISOString()
        };
    } catch (error) {
        console.error("Code audit error:", error);
        throw new Error(`Failed to audit code: ${error instanceof Error ? error.message : "Unknown error"}`);
    }
}

/**
 * Generate code (Syntax Wizard)
 */
async function executeCodeGeneration(parameters: any): Promise<any> {
    const genAI = getGeminiClient();
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });

    const prompt = parameters.prompt || parameters.description || "";
    const language = parameters.language || "typescript";

    if (!prompt) {
        throw new Error("Code generation prompt is required");
    }

    try {
        const response = await model.generateContent(`Generate clean, well-documented, production-ready ${language} code that solves:
"${prompt}"

Requirements:
- Clear variable names
- Comments explaining logic
- Error handling
- Type hints (if applicable)
- Example usage at the end
- Follow best practices

Respond with ONLY the code in a markdown code block, no explanations.`);

        let generatedCode = response.response.text();
        
        // Remove markdown code block if present
        if (generatedCode.includes("```")) {
            generatedCode = generatedCode.split("```").slice(1, -1).join("```").trim();
        }

        return {
            type: "code-generation",
            language,
            prompt,
            code: generatedCode,
            model: "gemini-1.5-pro",
            timestamp: new Date().toISOString()
        };
    } catch (error) {
        console.error("Code generation error:", error);
        throw new Error(`Failed to generate code: ${error instanceof Error ? error.message : "Unknown error"}`);
    }
}

/**
 * Sentiment analysis (Sentiment Bot)
 */
async function executeSentimentAnalysis(parameters: any): Promise<any> {
    const genAI = getGeminiClient();
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });

    const text = parameters.text || parameters.content || "";

    if (!text) {
        throw new Error("Text is required for sentiment analysis");
    }

    try {
        const response = await model.generateContent(`Analyze the sentiment of this text:

"${text}"

Return a JSON response with:
{
  "sentiment": "positive"|"negative"|"neutral",
  "confidence": 0-1,
  "score": -1 to 1,
  "emotions": [string],
  "reasoning": string,
  "keyPhrases": [string]
}

Respond with ONLY valid JSON, no markdown or explanations.`);

        const result = JSON.parse(response.response.text());

        return {
            type: "sentiment-analysis",
            ...result,
            textLength: text.length,
            model: "gemini-1.5-pro",
            timestamp: new Date().toISOString()
        };
    } catch (error) {
        console.error("Sentiment analysis error:", error);
        throw new Error(`Sentiment analysis failed: ${error instanceof Error ? error.message : "Unknown error"}`);
    }
}

/**
 * Financial analysis (Oracle Prime)
 */
async function executeFinancialAnalysis(parameters: any): Promise<any> {
    const genAI = getGeminiClient();
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });

    const symbol = parameters.symbol || parameters.coin || "bitcoin";

    try {
        // Fetch real crypto data from free CoinGecko API
        const response = await fetch(
            `https://api.coingecko.com/api/v3/simple/price?ids=${symbol.toLowerCase()}&vs_currencies=usd&include_market_cap=true&include_24hr_vol=true&include_price_change_percentage=true`
        );

        if (!response.ok) {
            throw new Error(`CoinGecko API error: ${response.statusText}`);
        }

        const data = await response.json();
        const coinData = data[symbol.toLowerCase()];

        if (!coinData) {
            throw new Error(`Coin not found: ${symbol}`);
        }

        // Use Gemini to analyze the data
        const analysisResponse = await model.generateContent(`Analyze this cryptocurrency market data and provide insights:

Coin: ${symbol}
Price: $${coinData.usd}
Market Cap: $${coinData.usd_market_cap}
24h Volume: $${coinData.usd_24h_vol}
24h Change: ${coinData.usd_24h_change_percentage}%

Provide JSON analysis:
{
  "currentPrice": number,
  "marketSentiment": "bullish"|"bearish"|"neutral",
  "trendAnalysis": string,
  "riskFactors": [string],
  "buySignals": [string],
  "sellSignals": [string],
  "recommendations": string
}

Respond with ONLY valid JSON, no markdown.`);

        const analysis = JSON.parse(analysisResponse.response.text());

        return {
            type: "financial-analysis",
            symbol,
            liveData: {
                price: coinData.usd,
                marketCap: coinData.usd_market_cap,
                volume24h: coinData.usd_24h_vol,
                change24h: coinData.usd_24h_change_percentage
            },
            analysis,
            model: "gemini-1.5-pro",
            timestamp: new Date().toISOString(),
            dataSource: "CoinGecko API"
        };
    } catch (error) {
        console.error("Financial analysis error:", error);
        throw new Error(`Financial analysis failed: ${error instanceof Error ? error.message : "Unknown error"}`);
    }
}

/**
 * Web search (Search Sage)
 */
async function executeWebSearch(parameters: any): Promise<any> {
    const genAI = getGeminiClient();
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });

    const query = parameters.query || parameters.search || "";

    if (!query) {
        throw new Error("Search query is required");
    }

    try {
        // Try to use Google Custom Search if available
        const customSearchKey = process.env.GOOGLE_CUSTOM_SEARCH_KEY;
        const searchEngineId = process.env.GOOGLE_SEARCH_ENGINE_ID;

        let searchResults = "";

        if (customSearchKey && searchEngineId) {
            // Use Custom Search API
            const response = await fetch(
                `https://www.googleapis.com/customsearch/v1?q=${encodeURIComponent(query)}&key=${customSearchKey}&cx=${searchEngineId}`
            );
            const data = await response.json();
            searchResults = JSON.stringify(data.items?.slice(0, 5) || [], null, 2);
        } else {
            // Use Gemini to search (requires internet-enabled model)
            searchResults = `[Note: Custom Search API not configured. Using Gemini's knowledge cutoff.]`;
        }

        // Use Gemini to summarize search results
        const analysisResponse = await model.generateContent(`Search query: "${query}"

${searchResults ? `Search results:\n${searchResults}\n` : ""}

Provide a comprehensive summary of search results for this query. Include:
1. Top findings
2. Key points
3. Relevant statistics
4. Source recommendations

Format as structured text with clear sections.`);

        return {
            type: "search-results",
            query,
            summary: analysisResponse.response.text(),
            model: "gemini-1.5-pro",
            timestamp: new Date().toISOString(),
            note: "Set GOOGLE_CUSTOM_SEARCH_KEY and GOOGLE_SEARCH_ENGINE_ID in .env for live web search"
        };
    } catch (error) {
        console.error("Web search error:", error);
        throw new Error(`Web search failed: ${error instanceof Error ? error.message : "Unknown error"}`);
    }
}

/**
 * General text generation (Atlas AI)
 */
async function executeTextGeneration(parameters: any): Promise<any> {
    const genAI = getGeminiClient();
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });

    const message = parameters.prompt || parameters.query || parameters.message || "";
    const maxTokens = parameters.maxTokens || 1000;

    if (!message) {
        throw new Error("Prompt is required");
    }

    try {
        const response = await model.generateContent(message);

        return {
            type: "text-generation",
            response: response.response.text(),
            prompt: message,
            model: "gemini-1.5-pro",
            timestamp: new Date().toISOString()
        };
    } catch (error) {
        console.error("Text generation error:", error);
        throw new Error(`Text generation failed: ${error instanceof Error ? error.message : "Unknown error"}`);
    }
}

/**
 * Research (Research Assistant - Composite Agent)
 */
async function executeResearch(parameters: any): Promise<any> {
    const genAI = getGeminiClient();
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });

    const topic = parameters.topic || parameters.prompt || "";

    if (!topic) {
        throw new Error("Research topic is required");
    }

    try {
        // Step 1: Generate research plan
        const planResponse = await model.generateContent(`Create a research plan for: "${topic}"

Provide a JSON outline:
{
  "mainTopics": [string],
  "questions": [string],
  "searchTerms": [string],
  "expectedSources": [string]
}

Respond with ONLY valid JSON.`);

        const plan = JSON.parse(planResponse.response.text());

        // Step 2: Generate comprehensive research
        const researchResponse = await model.generateContent(`Provide comprehensive research on: "${topic}"

Research plan:
${JSON.stringify(plan, null, 2)}

Include:
1. Overview and context
2. Key findings and trends
3. Current state of the field
4. Challenges and opportunities
5. Future outlook
6. Key sources and references

Provide detailed, well-structured analysis.`);

        return {
            type: "research",
            topic,
            plan,
            research: researchResponse.response.text(),
            model: "gemini-1.5-pro",
            agentType: "composite",
            timestamp: new Date().toISOString()
        };
    } catch (error) {
        console.error("Research error:", error);
        throw new Error(`Research failed: ${error instanceof Error ? error.message : "Unknown error"}`);
    }
}

/**
 * Main agent executor
 */
export async function executeAgent(
    agentId: string,
    taskType: AgentType,
    parameters: Record<string, any>
): Promise<AgentExecutionResult> {
    const startTime = Date.now();
    let result: any = null;

    try {
        console.log(`\n🤖 ====== AGENT EXECUTION START ======`);
        console.log(`🤖 Agent ID: ${agentId}`);
        console.log(`🤖 Task Type: ${taskType}`);
        console.log(`🤖 Parameters: `, JSON.stringify(parameters, null, 2));

        switch (taskType) {
            case "image-generation":
                console.log(`🤖 Calling executeImageGeneration...`);
                result = await executeImageGeneration(parameters);
                break;

            case "code-audit":
                console.log(`🤖 Calling executeCodeAudit...`);
                result = await executeCodeAudit(parameters);
                break;

            case "code-generation":
                console.log(`🤖 Calling executeCodeGeneration...`);
                result = await executeCodeGeneration(parameters);
                break;

            case "sentiment-analysis":
                console.log(`🤖 Calling executeSentimentAnalysis...`);
                result = await executeSentimentAnalysis(parameters);
                break;

            case "financial-analysis":
                console.log(`🤖 Calling executeFinancialAnalysis...`);
                result = await executeFinancialAnalysis(parameters);
                break;

            case "web-search":
                console.log(`🤖 Calling executeWebSearch...`);
                result = await executeWebSearch(parameters);
                break;

            case "text-generation":
            case "general":
            default:
                console.log(`🤖 Calling executeTextGeneration (default)...`);
                result = await executeTextGeneration(parameters);
        }

        console.log(`🤖 ✅ Agent execution successful. Result:`, JSON.stringify(result, null, 2));

        return {
            result,
            executionTime: Date.now() - startTime,
            agentId,
            taskType,
            metadata: {
                timestamp: new Date().toISOString(),
                success: true,
                costEstimate: estimateCost(taskType, parameters),
                model: "gemini-1.5-pro"
            }
        };
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "Unknown error";
        console.error(`\n🤖 ❌ ====== AGENT EXECUTION FAILED ======`);
        console.error(`🤖 Agent ID: ${agentId}`);
        console.error(`🤖 Task Type: ${taskType}`);
        console.error(`🤖 Error: ${errorMessage}`);
        console.error(`🤖 Stack:`, error instanceof Error ? error.stack : "No stack trace");
        
        return {
            result: {
                type: "error",
                error: errorMessage,
                taskType,
                agentId,
                details: "Agent execution failed. Ensure GOOGLE_API_KEY is configured and parameters are valid."
            },
            executionTime: Date.now() - startTime,
            agentId,
            taskType,
            metadata: {
                timestamp: new Date().toISOString(),
                success: false,
                error: errorMessage
            }
        };
    }
}

/**
 * Estimate cost of agent execution (free tier)
 */
function estimateCost(taskType: AgentType, parameters: Record<string, any>): string {
    const costMap: Record<AgentType, string> = {
        "image-generation": "Free (Gemini)",
        "code-audit": "Free (Gemini)",
        "code-generation": "Free (Gemini)",
        "financial-analysis": "Free (Gemini + CoinGecko)",
        "web-search": "Free (Gemini + Custom Search)",
        "sentiment-analysis": "Free (Gemini)",
        "text-generation": "Free (Gemini)",
        "general": "Free (Gemini)"
    };

    return costMap[taskType] || "Free (Gemini)";
}

/**
 * Get agent type from agent ID
 */
export function getAgentType(agentId: string): AgentType {
    const agentTypeMap: Record<string, AgentType> = {
        // Visual Generation
        "neural-alpha": "image-generation",
        "pixel-sage": "image-generation",
        
        // Code Analysis & Generation
        "quantum-sage": "code-audit",
        "code-guardian": "code-audit",
        "syntax-wizard": "code-generation",
        "dev-copilot": "code-generation",
        "secure-coder": "code-audit",
        
        // Financial & Market Data
        "oracle-prime": "financial-analysis",
        "market-analyst": "financial-analysis",
        
        // General Purpose
        "atlas-ai": "text-generation",
        "echo-mind": "text-generation",
        "search-sage": "web-search",
        "sentiment-bot": "sentiment-analysis",
        "research-assistant": "general"
    };

    return agentTypeMap[agentId] || "general";
}

/**
 * Execute orchestrated agent workflow (agent calling agent)
 */
export async function executeOrchestratedAgent(
    orchestratorId: string,
    targetId: string,
    taskType: AgentType,
    parameters: Record<string, any>
): Promise<AgentExecutionResult> {
    const startTime = Date.now();
    
    try {
        console.log(`🤖 Orchestration: ${orchestratorId} → ${targetId}`);
        
        const orchestratorType = getAgentType(orchestratorId);
        console.log(`Step 1: Orchestrator (${orchestratorId}) analysis...`);
        
        const orchestratorResult = await executeAgent(
            orchestratorId,
            orchestratorType,
            parameters
        );
        
        if (!orchestratorResult.metadata?.success) {
            throw new Error(`Orchestrator failed: ${orchestratorResult.metadata?.error}`);
        }
        
        console.log(`Step 2: Target agent (${targetId}) executing...`);
        
        const targetType = getAgentType(targetId);
        const enhancedParameters = {
            ...parameters,
            _orchestratorContext: orchestratorResult.result
        };
        
        const targetResult = await executeAgent(
            targetId,
            targetType,
            enhancedParameters
        );
        
        if (!targetResult.metadata?.success) {
            throw new Error(`Target agent failed: ${targetResult.metadata?.error}`);
        }
        
        const executionTime = Date.now() - startTime;
        
        return {
            result: {
                type: "orchestrated-result",
                workflow: `${orchestratorId} → ${targetId}`,
                orchestratorOutput: orchestratorResult.result,
                targetOutput: targetResult.result,
                stages: [
                    { stage: "orchestrator", agentId: orchestratorId, time: orchestratorResult.executionTime },
                    { stage: "target", agentId: targetId, time: targetResult.executionTime }
                ]
            },
            executionTime,
            agentId: `${orchestratorId}+${targetId}`,
            taskType,
            metadata: {
                timestamp: new Date().toISOString(),
                success: true,
                workflowType: "orchestrated",
                totalCost: "Free (Gemini)"
            }
        };
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "Unknown error";
        return {
            result: {
                type: "error",
                error: errorMessage,
                workflow: `${orchestratorId} → ${targetId}`,
                details: "Orchestrated agent execution failed"
            },
            executionTime: Date.now() - startTime,
            agentId: `${orchestratorId}+${targetId}`,
            taskType,
            metadata: {
                timestamp: new Date().toISOString(),
                success: false,
                error: errorMessage,
                workflowType: "orchestrated"
            }
        };
    }
}

export default executeAgent;
