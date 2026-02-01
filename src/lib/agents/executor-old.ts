/**
 * Real Agent Execution Engine
 * 
 * Handles routing to actual AI services based on agent type
 * Supports: DALL-E 3, GPT-4, Code Analysis, Financial Data, Web Search, Sentiment Analysis, etc.
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

// Initialize AI clients (lazy loading for performance)
let openaiClient: OpenAI | null = null;

function getOpenAIClient(): OpenAI {
    if (!openaiClient) {
        const apiKey = process.env.OPENAI_API_KEY;
        if (!apiKey) {
            throw new Error("OPENAI_API_KEY environment variable not configured");
        }
        openaiClient = new OpenAI({ apiKey });
    }
    return openaiClient;
}

/**
 * Execute web search using external API
 */
async function executeWebSearch(parameters: any): Promise<any> {
    const query = parameters.query || parameters.search || "";
    
    if (!query) {
        throw new Error("Search query is required");
    }

    try {
        // Using SerpAPI or similar (free tier available)
        const serpApiKey = process.env.SERP_API_KEY;
        
        if (!serpApiKey) {
            // Fallback: use a mock response for demo
            return {
                type: "search-results",
                query,
                message: "Web search requires SERP_API_KEY. Add to .env.local for live results",
                results: [
                    {
                        title: `Results for "${query}"`,
                        description: "Set up SERP_API_KEY in .env.local for real search results",
                        link: "https://serpapi.com"
                    }
                ]
            };
        }

        const response = await fetch(
            `https://serpapi.com/search?q=${encodeURIComponent(query)}&api_key=${serpApiKey}`
        );

        if (!response.ok) {
            throw new Error(`Search API error: ${response.statusText}`);
        }

        const data = await response.json();
        const results = (data.organic_results || []).slice(0, 5).map((result: any) => ({
            title: result.title,
            description: result.snippet,
            link: result.link,
            source: result.source
        }));

        return {
            type: "search-results",
            query,
            resultCount: results.length,
            results,
            timestamp: new Date().toISOString()
        };
    } catch (error) {
        console.error("Web search error:", error);
        throw new Error(`Web search failed: ${error instanceof Error ? error.message : "Unknown error"}`);
    }
}


async function executeImageGeneration(parameters: any): Promise<any> {
    const openai = getOpenAIClient();

    const prompt = parameters.prompt || "A beautiful landscape";
    const size = parameters.size || "1024x1024";

    try {
        const response = await openai.images.generate({
            model: "dall-e-3",
            prompt: prompt,
            n: 1,
            size: size as "1024x1024" | "1792x1024" | "1024x1792",
            quality: "standard",
        });

        if (!response.data || !response.data[0]) {
            throw new Error("No image data returned from API");
        }

        return {
            type: "image",
            url: response.data[0].url,
            prompt: prompt,
            revisedPrompt: response.data[0].revised_prompt,
            dimensions: size,
            model: "dall-e-3"
        };
    } catch (error) {
        console.error("Image generation error:", error);
        throw new Error(`Failed to generate image: ${error instanceof Error ? error.message : "Unknown error"}`);
    }
}

/**
 * Execute code audit using GPT-4
 */
async function executeCodeAudit(parameters: any): Promise<any> {
    const openai = getOpenAIClient();

    const code = parameters.code || "";
    const language = parameters.language || "javascript";

    if (!code) {
        throw new Error("No code provided for audit");
    }

    if (code.length > 50000) {
        throw new Error("Code is too large (max 50KB). Please provide a smaller snippet.");
    }

    try {
        const systemPrompt = `You are an expert code auditor specializing in ${language}. Analyze the provided code for:
1. Security vulnerabilities and exploits
2. Performance bottlenecks and optimization opportunities
3. Code quality, style, and best practices
4. Potential runtime errors and edge cases
5. Memory leaks and resource management

Provide a detailed JSON response with these EXACT fields:
{
  "overallScore": 0-10,
  "riskLevel": "critical"|"high"|"medium"|"low",
  "vulnerabilities": [{"severity": "high"|"medium"|"low", "type": string, "description": string, "line": number|null, "suggestion": string}],
  "suggestions": [string],
  "strengths": [string],
  "estimatedTimeToFix": "1 hour"|"1 day"|"1 week"
}`;

        const response = await openai.chat.completions.create({
            model: "gpt-4o",
            messages: [
                { role: "system", content: systemPrompt },
                { role: "user", content: `Audit this ${language} code:\n\`\`\`${language}\n${code}\n\`\`\`` }
            ],
            response_format: { type: "json_object" },
            temperature: 0.2,
            max_tokens: 2000
        });

        const content = response.choices[0].message.content || "{}";
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
            model: "gpt-4o",
            timestamp: new Date().toISOString()
        };
    } catch (error) {
        console.error("Code audit error:", error);
        throw new Error(`Failed to audit code: ${error instanceof Error ? error.message : "Unknown error"}`);
    }
}

/**
 * Generate code using GPT-4
 */
async function executeCodeGeneration(parameters: any): Promise<any> {
    const openai = getOpenAIClient();

    const prompt = parameters.prompt || parameters.description || "";
    const language = parameters.language || "typescript";

    if (!prompt) {
        throw new Error("Code generation prompt is required");
    }

    try {
        const systemPrompt = `You are an expert ${language} developer. Generate clean, well-documented, production-ready code that solves the given problem. Include:
- Clear variable names
- Comments explaining logic
- Error handling
- Type hints (if applicable)
- Example usage`;

        const response = await openai.chat.completions.create({
            model: "gpt-4o",
            messages: [
                { role: "system", content: systemPrompt },
                { role: "user", content: `Generate ${language} code for: ${prompt}` }
            ],
            temperature: 0.7,
            max_tokens: 2000
        });

        const generatedCode = response.choices[0].message.content || "";

        return {
            type: "code-generation",
            language,
            prompt,
            code: generatedCode,
            model: "gpt-4o",
            timestamp: new Date().toISOString()
        };
    } catch (error) {
        console.error("Code generation error:", error);
        throw new Error(`Failed to generate code: ${error instanceof Error ? error.message : "Unknown error"}`);
    }
}

/**
 * Sentiment analysis using GPT
 */
async function executeSentimentAnalysis(parameters: any): Promise<any> {
    const openai = getOpenAIClient();

    const text = parameters.text || parameters.content || "";

    if (!text) {
        throw new Error("Text is required for sentiment analysis");
    }

    try {
        const response = await openai.chat.completions.create({
            model: "gpt-4o",
            messages: [
                {
                    role: "system",
                    content: `Analyze the sentiment of the given text. Return a JSON response with:
{
  "sentiment": "positive"|"negative"|"neutral",
  "confidence": 0-1,
  "score": -1 to 1,
  "emotions": [string],
  "reasoning": string,
  "keyPhrases": [string]
}`
                },
                { role: "user", content: text }
            ],
            response_format: { type: "json_object" },
            temperature: 0.3,
            max_tokens: 500
        });

        const result = JSON.parse(response.choices[0].message.content || "{}");

        return {
            type: "sentiment-analysis",
            ...result,
            textLength: text.length,
            model: "gpt-4o",
            timestamp: new Date().toISOString()
        };
    } catch (error) {
        console.error("Sentiment analysis error:", error);
        throw new Error(`Sentiment analysis failed: ${error instanceof Error ? error.message : "Unknown error"}`);
    }
}

/**
 * Execute financial data analysis using CoinGecko API (free tier)
 */
async function executeFinancialAnalysis(parameters: any): Promise<any> {
    const symbol = parameters.symbol || "bitcoin";
    const isCrypto = !symbol.match(/^[A-Z]{1,5}$/); // Simple check: crypto if not all caps ticker

    try {
        if (isCrypto) {
            // Use CoinGecko API (no key required for public endpoint)
            const coinId = symbol.toLowerCase();
            const response = await fetch(
                `https://api.coingecko.com/api/v3/coins/${coinId}?localization=false&tickers=false&community_data=false&developer_data=false`
            );

            if (!response.ok) {
                throw new Error(`CoinGecko API error: ${response.statusText}`);
            }

            const data = await response.json();
            const marketData = data.market_data;

            return {
                type: "financial-data",
                assetType: "cryptocurrency",
                symbol: data.symbol.toUpperCase(),
                name: data.name,
                price: marketData.current_price.usd,
                change24h: marketData.price_change_percentage_24h.toFixed(2) + "%",
                change7d: marketData.price_change_percentage_7d?.toFixed(2) + "%",
                marketCap: `$${(marketData.market_cap.usd / 1e9).toFixed(2)}B`,
                volume24h: `$${(marketData.total_volume.usd / 1e6).toFixed(2)}M`,
                high24h: marketData.high_24h.usd,
                low24h: marketData.low_24h.usd,
                allTimeHigh: marketData.ath.usd,
                allTimeLow: marketData.atl.usd,
                circulatingSupply: marketData.circulating_supply,
                lastUpdated: new Date(data.last_updated).toISOString()
            };
        } else {
            // For stocks, use a simple mock (or integrate Alpha Vantage with key)
            return {
                type: "financial-data",
                assetType: "stock",
                symbol: symbol,
                message: "Stock data requires Alpha Vantage API key. Add ALPHA_VANTAGE_KEY to .env.local",
                price: "N/A",
                change24h: "N/A"
            };
        }
    } catch (error) {
        console.error("Financial analysis error:", error);
        throw new Error(`Failed to fetch financial data: ${error instanceof Error ? error.message : "Unknown error"}`);
    }
}

/**
 * Main agent execution router
 */
export async function executeAgent(
    agentId: string,
    taskType: AgentType,
    parameters: Record<string, any>
): Promise<AgentExecutionResult> {
    const startTime = Date.now();

    try {
        let result: any;

        switch (taskType) {
            case "image-generation":
                result = await executeImageGeneration(parameters);
                break;

            case "code-audit":
                result = await executeCodeAudit(parameters);
                break;

            case "code-generation":
                result = await executeCodeGeneration(parameters);
                break;

            case "financial-analysis":
                result = await executeFinancialAnalysis(parameters);
                break;

            case "web-search":
                result = await executeWebSearch(parameters);
                break;

            case "sentiment-analysis":
                result = await executeSentimentAnalysis(parameters);
                break;

            case "text-generation":
            case "general":
            default:
                // General text generation using GPT-4
                const openai = getOpenAIClient();
                const message = parameters.prompt || parameters.query || parameters.message || "Hello!";
                const systemMessage = parameters.system || "You are a helpful AI assistant.";
                const maxTokens = parameters.maxTokens || 500;

                const response = await openai.chat.completions.create({
                    model: "gpt-4o",
                    messages: [
                        { role: "system", content: systemMessage },
                        { role: "user", content: message }
                    ],
                    max_tokens: maxTokens,
                    temperature: parameters.temperature || 0.7
                });

                result = {
                    type: "text-generation",
                    response: response.choices[0].message.content,
                    prompt: message,
                    model: "gpt-4o",
                    tokenCount: response.usage?.total_tokens || 0
                };
        }

        return {
            result,
            executionTime: Date.now() - startTime,
            agentId,
            taskType,
            metadata: {
                timestamp: new Date().toISOString(),
                success: true,
                costEstimate: estimateCost(taskType, parameters)
            }
        };
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "Unknown error";
        return {
            result: {
                type: "error",
                error: errorMessage,
                taskType,
                agentId,
                details: "Agent execution failed. Ensure API keys are configured and parameters are valid."
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
 * Estimate cost of agent execution
 */
function estimateCost(taskType: AgentType, parameters: Record<string, any>): string {
    const costMap: Record<AgentType, string> = {
        "image-generation": "0.02 APT (DALL-E 3)",
        "code-audit": "0.01 APT (GPT-4)",
        "code-generation": "0.01 APT (GPT-4)",
        "financial-analysis": "0.005 APT (API)",
        "web-search": "0.005 APT (SerpAPI)",
        "sentiment-analysis": "0.005 APT (GPT-4)",
        "text-generation": "0.01 APT (GPT-4)",
        "general": "0.01 APT (GPT-4)"
    };

    return costMap[taskType] || "0.01 APT";
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
        
        // Financial & Market Data
        "oracle-prime": "financial-analysis",
        "market-analyst": "financial-analysis",
        
        // General Purpose
        "atlas-ai": "text-generation",
        "echo-mind": "text-generation",
        "search-sage": "web-search",
        "sentiment-bot": "sentiment-analysis"
    };

    return agentTypeMap[agentId] || "general";
}

/**
 * Execute orchestrated agent workflow
 * 
 * Allows one agent to delegate work to another agent
 * Workflow: OrchestratorAgent → TargetAgent → Result
 */
export async function executeOrchestratedAgent(
    orchestratorId: string,
    targetId: string,
    taskType: AgentType,
    parameters: Record<string, any>
): Promise<AgentExecutionResult> {
    const startTime = Date.now();
    
    try {
        // Step 1: Orchestrator agent processes the request
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
        
        // Step 2: Target agent executes using orchestrator's output
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
        
        // Step 3: Combine results
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
                totalCost: `${estimateCost(orchestratorType, {})} + ${estimateCost(targetType, {})}`
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

/**
 * Get agent metadata
 */
export interface AgentInfo {
    id: string;
    name: string;
    description: string;
    type: AgentType;
    capabilities: string[];
    costPerRequest: string;
    maxTokens?: number;
    model: string;
}

export const AGENT_REGISTRY: Record<string, AgentInfo> = {
    "neural-alpha": {
        id: "neural-alpha",
        name: "Neural Alpha",
        description: "High-quality image generation using DALL-E 3",
        type: "image-generation",
        capabilities: ["image generation", "visual design", "art creation"],
        costPerRequest: "0.05 APT",
        model: "dall-e-3"
    },
    "quantum-sage": {
        id: "quantum-sage",
        name: "Quantum Sage",
        description: "Advanced code audit with security analysis",
        type: "code-audit",
        capabilities: ["security analysis", "code review", "vulnerability detection"],
        costPerRequest: "0.03 APT",
        maxTokens: 2000,
        model: "gpt-4o"
    },
    "oracle-prime": {
        id: "oracle-prime",
        name: "Oracle Prime",
        description: "Real-time financial and market data analysis",
        type: "financial-analysis",
        capabilities: ["price tracking", "market analysis", "financial insights"],
        costPerRequest: "0.02 APT",
        model: "coingecko-api"
    },
    "syntax-wizard": {
        id: "syntax-wizard",
        name: "Syntax Wizard",
        description: "Intelligent code generation for any language",
        type: "code-generation",
        capabilities: ["code generation", "algorithm implementation", "boilerplate creation"],
        costPerRequest: "0.03 APT",
        maxTokens: 2000,
        model: "gpt-4o"
    },
    "atlas-ai": {
        id: "atlas-ai",
        name: "Atlas AI",
        description: "Versatile AI assistant for text generation and analysis",
        type: "text-generation",
        capabilities: ["writing", "analysis", "explanation", "translation"],
        costPerRequest: "0.02 APT",
        maxTokens: 1500,
        model: "gpt-4o"
    },
    "search-sage": {
        id: "search-sage",
        name: "Search Sage",
        description: "Web search and information retrieval",
        type: "web-search",
        capabilities: ["web search", "research", "information gathering"],
        costPerRequest: "0.01 APT",
        model: "serpapi"
    },
    "sentiment-bot": {
        id: "sentiment-bot",
        name: "Sentiment Bot",
        description: "Sentiment and emotion analysis of text",
        type: "sentiment-analysis",
        capabilities: ["sentiment analysis", "emotion detection", "tone analysis"],
        costPerRequest: "0.01 APT",
        maxTokens: 500,
        model: "gpt-4o"
    }
};
