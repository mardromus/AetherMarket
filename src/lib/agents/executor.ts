/**
 * Real Agent Execution Engine - Groq API
 * 
 * Handles routing to actual AI services using Groq (fast Llama models)
 * Supports: Text Generation, Code Analysis, Image Prompts, Web Search, Sentiment Analysis, etc.
 */

import OpenAI from "openai";

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

// Initialize Groq client (lazy loading for performance)
let groqClient: OpenAI | null = null;

function getGroqClient(): OpenAI {
    if (!groqClient) {
        const apiKey = process.env.GROQ_API_KEY;
        if (!apiKey) {
            throw new Error("GROQ_API_KEY environment variable not configured. Get one free at https://console.groq.com");
        }
        groqClient = new OpenAI({
            apiKey,
            baseURL: "https://api.groq.com/openai/v1"
        });
    }
    return groqClient;
}

// Default model - Llama 3.3 70B is fast and high quality
const DEFAULT_MODEL = "llama-3.3-70b-versatile";

/**
 * Execute image generation (Neural Alpha)
 * Uses Groq to generate detailed image prompts
 */
async function executeImageGeneration(parameters: any): Promise<any> {
    const client = getGroqClient();

    const prompt = parameters.prompt || "A beautiful landscape";
    const style = parameters.style || "photorealistic";

    try {
        const response = await client.chat.completions.create({
            model: DEFAULT_MODEL,
            messages: [{
                role: "user",
                content: `Create a detailed, vivid image prompt based on this description:
"${prompt}"

Style: ${style}

Requirements:
- Include specific visual elements
- Describe lighting, colors, mood, composition
- Use descriptive adjectives
- Suitable for image generation APIs
- Format: [STYLE] [SUBJECT] [SETTING] [LIGHTING] [MOOD] [QUALITY]

Respond with ONLY the detailed prompt, no additional text.`
            }],
            temperature: 0.7,
            max_tokens: 500
        });

        const imagePrompt = response.choices[0]?.message?.content || "";

        return {
            type: "image-prompt",
            originalPrompt: prompt,
            detailedPrompt: imagePrompt,
            style,
            model: DEFAULT_MODEL,
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
    const client = getGroqClient();

    const code = parameters.code || "";
    const language = parameters.language || "javascript";

    if (!code) {
        throw new Error("No code provided for audit");
    }

    if (code.length > 50000) {
        throw new Error("Code is too large (max 50KB). Please provide a smaller snippet.");
    }

    try {
        const response = await client.chat.completions.create({
            model: DEFAULT_MODEL,
            messages: [{
                role: "user",
                content: `You are an expert code auditor specializing in ${language}. Analyze this code:

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

Respond with ONLY valid JSON, no markdown.`
            }],
            temperature: 0.3,
            max_tokens: 2000
        });

        const content = response.choices[0]?.message?.content || "{}";
        let auditResult;
        try {
            auditResult = JSON.parse(content);
        } catch {
            auditResult = { overallScore: 5, riskLevel: "medium", vulnerabilities: [], suggestions: [], strengths: [] };
        }

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
            model: DEFAULT_MODEL,
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
    const client = getGroqClient();

    const prompt = parameters.prompt || parameters.description || "";
    const language = parameters.language || "typescript";

    if (!prompt) {
        throw new Error("Code generation prompt is required");
    }

    try {
        const response = await client.chat.completions.create({
            model: DEFAULT_MODEL,
            messages: [{
                role: "user",
                content: `Generate clean, well-documented, production-ready ${language} code that solves:
"${prompt}"

Requirements:
- Clear variable names
- Comments explaining logic
- Error handling
- Type hints (if applicable)
- Example usage at the end
- Follow best practices

Respond with ONLY the code in a markdown code block, no explanations.`
            }],
            temperature: 0.4,
            max_tokens: 3000
        });

        let generatedCode = response.choices[0]?.message?.content || "";

        // Remove markdown code block if present
        if (generatedCode.includes("```")) {
            const parts = generatedCode.split("```");
            if (parts.length >= 2) {
                generatedCode = parts[1].replace(/^[a-z]+\n/, '').trim();
            }
        }

        return {
            type: "code-generation",
            language,
            prompt,
            code: generatedCode,
            model: DEFAULT_MODEL,
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
    const client = getGroqClient();

    const text = parameters.text || parameters.content || "";

    if (!text) {
        throw new Error("Text is required for sentiment analysis");
    }

    try {
        const response = await client.chat.completions.create({
            model: DEFAULT_MODEL,
            messages: [{
                role: "user",
                content: `Analyze the sentiment of this text:

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

Respond with ONLY valid JSON, no markdown or explanations.`
            }],
            temperature: 0.2,
            max_tokens: 500
        });

        let result;
        try {
            result = JSON.parse(response.choices[0]?.message?.content || "{}");
        } catch {
            result = { sentiment: "neutral", confidence: 0.5, score: 0, emotions: [], reasoning: "Unable to parse", keyPhrases: [] };
        }

        return {
            type: "sentiment-analysis",
            ...result,
            textLength: text.length,
            model: DEFAULT_MODEL,
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
    const client = getGroqClient();

    const symbol = parameters.symbol || parameters.coin || "bitcoin";

    try {
        // Fetch real crypto data from free CoinGecko API
        const response = await fetch(
            `https://api.coingecko.com/api/v3/simple/price?ids=${symbol.toLowerCase()}&vs_currencies=usd&include_market_cap=true&include_24hr_vol=true&include_24hr_change=true`
        );

        if (!response.ok) {
            throw new Error(`CoinGecko API error: ${response.statusText}`);
        }

        const data = await response.json();
        const coinData = data[symbol.toLowerCase()];

        if (!coinData) {
            throw new Error(`Coin not found: ${symbol}`);
        }

        // Use Groq to analyze the data
        const analysisResponse = await client.chat.completions.create({
            model: DEFAULT_MODEL,
            messages: [{
                role: "user",
                content: `Analyze this cryptocurrency market data and provide insights:

Coin: ${symbol}
Price: $${coinData.usd}
Market Cap: $${coinData.usd_market_cap}
24h Volume: $${coinData.usd_24h_vol}
24h Change: ${coinData.usd_24h_change}%

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

Respond with ONLY valid JSON, no markdown.`
            }],
            temperature: 0.3,
            max_tokens: 1000
        });

        let analysis;
        try {
            analysis = JSON.parse(analysisResponse.choices[0]?.message?.content || "{}");
        } catch {
            analysis = { marketSentiment: "neutral", trendAnalysis: "Unable to analyze", riskFactors: [], recommendations: "Do your own research" };
        }

        return {
            type: "financial-analysis",
            symbol,
            liveData: {
                price: coinData.usd,
                marketCap: coinData.usd_market_cap,
                volume24h: coinData.usd_24h_vol,
                change24h: coinData.usd_24h_change
            },
            analysis,
            model: DEFAULT_MODEL,
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
    const client = getGroqClient();

    const query = parameters.query || parameters.search || "";

    if (!query) {
        throw new Error("Search query is required");
    }

    try {
        // Use Groq to provide search-like response
        const searchResponse = await client.chat.completions.create({
            model: DEFAULT_MODEL,
            messages: [{
                role: "user",
                content: `Search query: "${query}"

Provide a comprehensive summary as if you searched the web. Include:
1. Top findings and answers
2. Key points and facts
3. Relevant statistics if applicable
4. Source recommendations (suggest where to find more info)

Format as structured text with clear sections.`
            }],
            temperature: 0.5,
            max_tokens: 1500
        });

        return {
            type: "search-results",
            query,
            summary: searchResponse.choices[0]?.message?.content || "No results",
            model: DEFAULT_MODEL,
            timestamp: new Date().toISOString(),
            note: "Results based on AI knowledge. For real-time data, add web search API."
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
    const client = getGroqClient();

    const message = parameters.prompt || parameters.query || parameters.message || "";

    if (!message) {
        throw new Error("Prompt is required");
    }

    try {
        const response = await client.chat.completions.create({
            model: DEFAULT_MODEL,
            messages: [{
                role: "user",
                content: message
            }],
            temperature: 0.7,
            max_tokens: 2000
        });

        return {
            type: "text-generation",
            response: response.choices[0]?.message?.content || "",
            prompt: message,
            model: DEFAULT_MODEL,
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
    const client = getGroqClient();

    const topic = parameters.topic || parameters.prompt || "";

    if (!topic) {
        throw new Error("Research topic is required");
    }

    try {
        // Step 1: Generate research plan
        const planResponse = await client.chat.completions.create({
            model: DEFAULT_MODEL,
            messages: [{
                role: "user",
                content: `Create a research plan for: "${topic}"

Provide a JSON outline:
{
  "mainTopics": [string],
  "questions": [string],
  "searchTerms": [string],
  "expectedSources": [string]
}

Respond with ONLY valid JSON.`
            }],
            temperature: 0.4,
            max_tokens: 500
        });

        let plan;
        try {
            plan = JSON.parse(planResponse.choices[0]?.message?.content || "{}");
        } catch {
            plan = { mainTopics: [topic], questions: [], searchTerms: [], expectedSources: [] };
        }

        // Step 2: Generate comprehensive research
        const researchResponse = await client.chat.completions.create({
            model: DEFAULT_MODEL,
            messages: [{
                role: "user",
                content: `Provide comprehensive research on: "${topic}"

Research plan:
${JSON.stringify(plan, null, 2)}

Include:
1. Overview and context
2. Key findings and trends
3. Current state of the field
4. Challenges and opportunities
5. Future outlook
6. Key sources and references

Provide detailed, well-structured analysis.`
            }],
            temperature: 0.5,
            max_tokens: 3000
        });

        return {
            type: "research",
            topic,
            plan,
            research: researchResponse.choices[0]?.message?.content || "",
            model: DEFAULT_MODEL,
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
        console.log(`\n🤖 ====== AGENT EXECUTION START (GROQ) ======`);
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
                costEstimate: "Free (Groq)",
                model: DEFAULT_MODEL
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
                details: "Agent execution failed. Ensure GROQ_API_KEY is configured in .env.local"
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
                totalCost: "Free (Groq)"
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
