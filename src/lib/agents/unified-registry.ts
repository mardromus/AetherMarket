/**
 * UNIFIED AGENT REGISTRY - SINGLE SOURCE OF TRUTH
 * All 9 agents with complete specifications
 * Used by: config, schemas, dashboard, executor, API routes
 */

import type { AgentSpec } from "./interface";

// ============================================
// AGENT REGISTRY - ALL 9 AGENTS
// ============================================

export const UNIFIED_AGENT_REGISTRY: Record<string, AgentSpec> = {
    // ========== GENERATION AGENTS ==========
    "neural-alpha": {
        id: "neural-alpha",
        name: "Neural Alpha",
        version: "2.1.0",
        description: "High-quality image generation from text descriptions",
        owner: "aether-labs",
        category: "ai-generation",
        tags: ["image", "art", "visual", "dall-e-3"],
        model: "dall-e-3",
        provider: "openai",
        requiredApiKeys: ["OPENAI_API_KEY"],
        
        capabilities: {
            "image-generation": {
                id: "image-generation",
                name: "Image Generation",
                description: "Generate high-quality images from text prompts",
                inputParameters: [
                    {
                        name: "prompt",
                        type: "string",
                        description: "Detailed text description of the image to generate",
                        required: true,
                        minLength: 10,
                        maxLength: 4000,
                        example: "A futuristic city with flying cars and neon lights"
                    },
                    {
                        name: "size",
                        type: "string",
                        description: "Image size",
                        required: false,
                        enum: ["1024x1024", "1792x1024", "1024x1792"],
                        example: "1024x1024"
                    },
                    {
                        name: "quality",
                        type: "string",
                        description: "Image quality level",
                        required: false,
                        enum: ["standard", "hd"],
                        example: "hd"
                    },
                    {
                        name: "style",
                        type: "string",
                        description: "Artistic style guidance",
                        required: false,
                        maxLength: 500,
                        example: "photorealistic, 8k, professional"
                    }
                ],
                outputSchema: {
                    type: "object",
                    properties: {
                        imageUrl: { type: "string", description: "URL to generated image" },
                        revisedPrompt: { type: "string", description: "Final prompt sent to DALL-E" },
                        base64: { type: "string", description: "Base64 encoded image (optional)" },
                        size: { type: "string" },
                        model: { type: "string" }
                    },
                    required: ["imageUrl", "revisedPrompt"]
                },
                costOctas: "5000000", // 0.05 APT
                executionTimeMs: { min: 5000, max: 30000, average: 12000 },
                maxInputSize: 5000,
                timeoutMs: 45000,
                examples: [
                    {
                        input: {
                            prompt: "A serene mountain lake at sunset",
                            size: "1024x1024",
                            quality: "hd",
                            style: "photorealistic"
                        },
                        output: {
                            imageUrl: "https://...",
                            revisedPrompt: "A serene mountain lake at sunset, photorealistic, detailed, 8k quality",
                            size: "1024x1024"
                        },
                        description: "Generate a beautiful landscape image"
                    }
                ],
                errorCases: [
                    {
                        error: "INAPPROPRIATE_CONTENT",
                        cause: "Prompt contains inappropriate content",
                        solution: "Revise prompt to comply with DALL-E usage policies"
                    },
                    {
                        error: "INVALID_PROMPT",
                        cause: "Prompt too short or unclear",
                        solution: "Provide at least 10 characters with clear visual description"
                    }
                ]
            }
        },
        
        successRate: 99.2,
        averageExecutionTimeMs: 12000,
        totalExecutions: 890,
        averageRating: 4.9,
        isVerified: true,
        verifiedAt: Date.now() - 60 * 24 * 60 * 60 * 1000,
        canInvokeOtherAgents: false
    },

    // ========== CODE AGENTS ==========
    "quantum-sage": {
        id: "quantum-sage",
        name: "Quantum Sage",
        version: "1.5.0",
        description: "Security auditing and vulnerability detection for code",
        owner: "aether-labs",
        category: "code",
        tags: ["security", "audit", "vulnerabilities", "gpt-4o"],
        model: "gpt-4o",
        provider: "openai",
        requiredApiKeys: ["OPENAI_API_KEY"],
        
        capabilities: {
            "code-audit": {
                id: "code-audit",
                name: "Code Audit",
                description: "Analyze code for security vulnerabilities and issues",
                inputParameters: [
                    {
                        name: "code",
                        type: "string",
                        description: "Source code to audit",
                        required: true,
                        minLength: 50,
                        maxLength: 51200,
                        example: "function authenticate(user) { return user.id; }"
                    },
                    {
                        name: "language",
                        type: "string",
                        description: "Programming language",
                        required: true,
                        enum: ["javascript", "typescript", "python", "java", "cpp", "rust", "go", "solidity"],
                        example: "typescript"
                    },
                    {
                        name: "focusAreas",
                        type: "array",
                        description: "Security areas to focus on",
                        required: false,
                        example: ["sql-injection", "xss", "authentication"]
                    }
                ],
                outputSchema: {
                    type: "object",
                    properties: {
                        vulnerabilities: {
                            type: "array",
                            items: {
                                type: "object",
                                properties: {
                                    severity: { type: "string", enum: ["critical", "high", "medium", "low"] },
                                    type: { type: "string" },
                                    description: { type: "string" },
                                    lineNumber: { type: "number" },
                                    fix: { type: "string" }
                                }
                            }
                        },
                        overallScore: { type: "number", minimum: 0, maximum: 100 },
                        recommendations: { type: "array", items: { type: "string" } },
                        safeToUse: { type: "boolean" }
                    },
                    required: ["vulnerabilities", "overallScore", "safeToUse"]
                },
                costOctas: "3000000", // 0.03 APT
                executionTimeMs: { min: 8000, max: 60000, average: 20000 },
                maxInputSize: 51200, // 50KB max
                timeoutMs: 60000,
                examples: [
                    {
                        input: {
                            code: "SELECT * FROM users WHERE id = '" + "user-id" + "'",
                            language: "typescript",
                            focusAreas: ["sql-injection"]
                        },
                        output: {
                            vulnerabilities: [
                                {
                                    severity: "critical",
                                    type: "SQL_INJECTION",
                                    description: "Direct string concatenation in SQL query",
                                    lineNumber: 1,
                                    fix: "Use parameterized queries: db.query('SELECT * FROM users WHERE id = ?', [id])"
                                }
                            ],
                            overallScore: 15,
                            safeToUse: false,
                            recommendations: ["Use ORM or parameterized queries", "Implement input validation"]
                        },
                        description: "Detect SQL injection vulnerability"
                    }
                ],
                errorCases: [
                    {
                        error: "CODE_TOO_LARGE",
                        cause: "Code exceeds 50KB limit",
                        solution: "Split code into smaller chunks (< 50KB each)"
                    },
                    {
                        error: "INVALID_SYNTAX",
                        cause: "Code has syntax errors",
                        solution: "Ensure code is valid and compilable"
                    }
                ]
            },
            "performance-analysis": {
                id: "performance-analysis",
                name: "Performance Analysis",
                description: "Analyze code for performance issues and optimization opportunities",
                inputParameters: [
                    {
                        name: "code",
                        type: "string",
                        description: "Source code to analyze",
                        required: true,
                        minLength: 50,
                        maxLength: 51200,
                        example: "for(let i = 0; i < arr.length; i++) { ... }"
                    },
                    {
                        name: "language",
                        type: "string",
                        description: "Programming language",
                        required: true,
                        enum: ["javascript", "typescript", "python", "java", "cpp", "rust", "go"],
                        example: "typescript"
                    }
                ],
                outputSchema: {
                    type: "object",
                    properties: {
                        issues: {
                            type: "array",
                            items: {
                                type: "object",
                                properties: {
                                    type: { type: "string" },
                                    severity: { type: "string" },
                                    description: { type: "string" },
                                    impact: { type: "string" },
                                    suggestion: { type: "string" }
                                }
                            }
                        },
                        complexityScore: { type: "number" },
                        optimizationPotential: { type: "string" }
                    },
                    required: ["issues", "complexityScore"]
                },
                costOctas: "2500000", // 0.025 APT
                executionTimeMs: { min: 5000, max: 45000, average: 15000 },
                maxInputSize: 51200,
                timeoutMs: 45000,
                examples: [],
                errorCases: []
            }
        },
        
        successRate: 97.8,
        averageExecutionTimeMs: 18000,
        totalExecutions: 567,
        averageRating: 4.6,
        isVerified: true,
        verifiedAt: Date.now() - 45 * 24 * 60 * 60 * 1000,
        canInvokeOtherAgents: false
    },

    "syntax-wizard": {
        id: "syntax-wizard",
        name: "Syntax Wizard",
        version: "1.2.0",
        description: "Production-ready code generation for any language",
        owner: "aether-labs",
        category: "code",
        tags: ["code-generation", "development", "gpt-4o"],
        model: "gpt-4o",
        provider: "openai",
        requiredApiKeys: ["OPENAI_API_KEY"],
        
        capabilities: {
            "code-generation": {
                id: "code-generation",
                name: "Code Generation",
                description: "Generate production-ready code from descriptions",
                inputParameters: [
                    {
                        name: "description",
                        type: "string",
                        description: "What code to generate",
                        required: true,
                        minLength: 20,
                        maxLength: 1000,
                        example: "Create a React hook for user authentication with JWT tokens"
                    },
                    {
                        name: "language",
                        type: "string",
                        description: "Programming language",
                        required: true,
                        enum: ["javascript", "typescript", "python", "java", "rust", "go", "cpp"],
                        example: "typescript"
                    },
                    {
                        name: "includeTests",
                        type: "boolean",
                        description: "Include unit tests",
                        required: false,
                        example: true
                    },
                    {
                        name: "framework",
                        type: "string",
                        description: "Framework (for web)",
                        required: false,
                        enum: ["react", "vue", "angular", "none"],
                        example: "react"
                    }
                ],
                outputSchema: {
                    type: "object",
                    properties: {
                        code: { type: "string", description: "Generated source code" },
                        tests: { type: "string", description: "Test code (if requested)" },
                        documentation: { type: "string", description: "JSDoc/comments" },
                        dependencies: { type: "array", items: { type: "string" } },
                        explanation: { type: "string" }
                    },
                    required: ["code", "documentation"]
                },
                costOctas: "3000000", // 0.03 APT
                executionTimeMs: { min: 3000, max: 40000, average: 12000 },
                maxInputSize: 5000,
                timeoutMs: 40000,
                examples: [
                    {
                        input: {
                            description: "Create a TypeScript function to validate email addresses",
                            language: "typescript",
                            includeTests: true
                        },
                        output: {
                            code: "export function validateEmail(email: string): boolean { ... }",
                            tests: "describe('validateEmail', () => { ... })",
                            documentation: "/**\n * Validates an email address\n */",
                            dependencies: [],
                            explanation: "Standard email validation using regex"
                        },
                        description: "Generate email validator function"
                    }
                ],
                errorCases: [
                    {
                        error: "AMBIGUOUS_REQUIREMENT",
                        cause: "Description is too vague",
                        solution: "Provide more specific requirements (inputs, outputs, edge cases)"
                    }
                ]
            }
        },
        
        successRate: 96.3,
        averageExecutionTimeMs: 10000,
        totalExecutions: 2100,
        averageRating: 4.5,
        isVerified: true,
        verifiedAt: Date.now() - 30 * 24 * 60 * 60 * 1000,
        canInvokeOtherAgents: true,
        dependsOnAgents: ["quantum-sage"]
    },

    // ========== ANALYSIS AGENTS ==========
    "atlas-ai": {
        id: "atlas-ai",
        name: "Atlas AI",
        version: "1.0.0",
        description: "General-purpose text generation, analysis, and reasoning",
        owner: "aether-labs",
        category: "analysis",
        tags: ["text", "analysis", "writing", "gpt-4o"],
        model: "gpt-4o",
        provider: "openai",
        requiredApiKeys: ["OPENAI_API_KEY"],
        
        capabilities: {
            "text-generation": {
                id: "text-generation",
                name: "Text Generation",
                description: "Generate high-quality text content",
                inputParameters: [
                    {
                        name: "prompt",
                        type: "string",
                        description: "What to generate",
                        required: true,
                        minLength: 10,
                        maxLength: 2000,
                        example: "Write a professional bio for a software engineer"
                    },
                    {
                        name: "maxTokens",
                        type: "number",
                        description: "Maximum tokens in response",
                        required: false,
                        minValue: 50,
                        maxValue: 4000,
                        example: 500
                    },
                    {
                        name: "temperature",
                        type: "number",
                        description: "Creativity level (0-1)",
                        required: false,
                        minValue: 0,
                        maxValue: 1,
                        example: 0.7
                    },
                    {
                        name: "format",
                        type: "string",
                        description: "Output format",
                        required: false,
                        enum: ["markdown", "plain", "html", "json"],
                        example: "markdown"
                    }
                ],
                outputSchema: {
                    type: "object",
                    properties: {
                        text: { type: "string" },
                        tokensUsed: { type: "number" },
                        format: { type: "string" }
                    },
                    required: ["text"]
                },
                costOctas: "2000000", // 0.02 APT
                executionTimeMs: { min: 2000, max: 30000, average: 8000 },
                maxInputSize: 100000,
                timeoutMs: 30000,
                examples: [],
                errorCases: []
            },
            "analysis": {
                id: "analysis",
                name: "Analysis",
                description: "Analyze and summarize content",
                inputParameters: [
                    {
                        name: "content",
                        type: "string",
                        description: "Content to analyze",
                        required: true,
                        minLength: 50,
                        maxLength: 100000,
                        example: "Article text here..."
                    },
                    {
                        name: "analysisType",
                        type: "string",
                        description: "Type of analysis",
                        required: true,
                        enum: ["summary", "sentiment", "key-points", "full-analysis"],
                        example: "key-points"
                    }
                ],
                outputSchema: {
                    type: "object",
                    properties: {
                        analysis: { type: "string" },
                        keyPoints: { type: "array", items: { type: "string" } },
                        summary: { type: "string" }
                    },
                    required: ["analysis"]
                },
                costOctas: "1500000", // 0.015 APT
                executionTimeMs: { min: 2000, max: 25000, average: 6000 },
                maxInputSize: 200000,
                timeoutMs: 25000,
                examples: [],
                errorCases: []
            }
        },
        
        successRate: 98.5,
        averageExecutionTimeMs: 7000,
        totalExecutions: 1250,
        averageRating: 4.7,
        isVerified: true,
        verifiedAt: Date.now() - 90 * 24 * 60 * 60 * 1000,
        canInvokeOtherAgents: true
    },

    // ========== DATA AGENTS ==========
    "oracle-prime": {
        id: "oracle-prime",
        name: "Oracle Prime",
        version: "3.0.0",
        description: "Real-time financial and cryptocurrency data analysis",
        owner: "aether-labs",
        category: "data-retrieval",
        tags: ["finance", "crypto", "data", "coingecko"],
        model: "coingecko-api",
        provider: "coingecko",
        
        capabilities: {
            "financial-analysis": {
                id: "financial-analysis",
                name: "Financial Analysis",
                description: "Get real-time cryptocurrency prices and market data",
                inputParameters: [
                    {
                        name: "symbol",
                        type: "string",
                        description: "Cryptocurrency symbol (bitcoin, ethereum, etc)",
                        required: true,
                        minLength: 3,
                        maxLength: 20,
                        example: "bitcoin"
                    },
                    {
                        name: "currency",
                        type: "string",
                        description: "Display currency",
                        required: false,
                        enum: ["usd", "eur", "gbp", "inr"],
                        example: "usd"
                    },
                    {
                        name: "includeChart",
                        type: "boolean",
                        description: "Include price history",
                        required: false,
                        example: false
                    }
                ],
                outputSchema: {
                    type: "object",
                    properties: {
                        symbol: { type: "string" },
                        name: { type: "string" },
                        price: { type: "number" },
                        priceChange24h: { type: "number" },
                        marketCap: { type: "number" },
                        volume24h: { type: "number" },
                        updated: { type: "number" }
                    },
                    required: ["symbol", "price", "updated"]
                },
                costOctas: "2000000", // 0.02 APT
                executionTimeMs: { min: 500, max: 15000, average: 2000 },
                maxInputSize: 1000,
                timeoutMs: 15000,
                examples: [
                    {
                        input: {
                            symbol: "bitcoin",
                            currency: "usd"
                        },
                        output: {
                            symbol: "bitcoin",
                            name: "Bitcoin",
                            price: 42500,
                            priceChange24h: 2.5,
                            marketCap: 832000000000,
                            volume24h: 28000000000,
                            updated: 1706745600000
                        },
                        description: "Get Bitcoin price and market data"
                    }
                ],
                errorCases: [
                    {
                        error: "SYMBOL_NOT_FOUND",
                        cause: "Invalid or unknown cryptocurrency symbol",
                        solution: "Use valid symbol like 'bitcoin', 'ethereum', 'cardano'"
                    }
                ]
            }
        },
        
        successRate: 99.7,
        averageExecutionTimeMs: 1200,
        totalExecutions: 5420,
        averageRating: 4.8,
        isVerified: true,
        verifiedAt: Date.now() - 90 * 24 * 60 * 60 * 1000,
        canInvokeOtherAgents: false,
        rateLimit: { requestsPerMinute: 60, requestsPerDay: 10000 }
    },

    "search-sage": {
        id: "search-sage",
        name: "Search Sage",
        version: "1.1.0",
        description: "Real-time web search and information retrieval",
        owner: "aether-labs",
        category: "data-retrieval",
        tags: ["search", "web", "research", "serpapi"],
        model: "serp-api",
        provider: "serpapi",
        requiredApiKeys: ["SERP_API_KEY"],
        
        capabilities: {
            "web-search": {
                id: "web-search",
                name: "Web Search",
                description: "Search the web for current information",
                inputParameters: [
                    {
                        name: "query",
                        type: "string",
                        description: "Search query",
                        required: true,
                        minLength: 3,
                        maxLength: 2000,
                        example: "latest AI developments 2026"
                    },
                    {
                        name: "numResults",
                        type: "number",
                        description: "Number of results to return",
                        required: false,
                        minValue: 1,
                        maxValue: 100,
                        example: 10
                    }
                ],
                outputSchema: {
                    type: "object",
                    properties: {
                        results: {
                            type: "array",
                            items: {
                                type: "object",
                                properties: {
                                    title: { type: "string" },
                                    url: { type: "string" },
                                    snippet: { type: "string" }
                                }
                            }
                        },
                        totalResults: { type: "number" }
                    },
                    required: ["results"]
                },
                costOctas: "1000000", // 0.01 APT
                executionTimeMs: { min: 1000, max: 20000, average: 4000 },
                maxInputSize: 2000,
                timeoutMs: 20000,
                examples: [
                    {
                        input: {
                            query: "blockchain",
                            numResults: 5
                        },
                        output: {
                            results: [
                                {
                                    title: "What is Blockchain?",
                                    url: "https://...",
                                    snippet: "Blockchain is a distributed ledger..."
                                }
                            ],
                            totalResults: 500000
                        },
                        description: "Search for blockchain information"
                    }
                ],
                errorCases: [
                    {
                        error: "API_LIMIT_EXCEEDED",
                        cause: "Rate limit exceeded",
                        solution: "Wait before making more searches"
                    }
                ]
            }
        },
        
        successRate: 98.1,
        averageExecutionTimeMs: 3500,
        totalExecutions: 3200,
        averageRating: 4.4,
        isVerified: true,
        verifiedAt: Date.now() - 60 * 24 * 60 * 60 * 1000,
        canInvokeOtherAgents: false,
        rateLimit: { requestsPerMinute: 30, requestsPerDay: 1000 }
    },

    "sentiment-bot": {
        id: "sentiment-bot",
        name: "Sentiment Bot",
        version: "1.3.0",
        description: "Emotion and sentiment analysis using advanced NLP",
        owner: "aether-labs",
        category: "analysis",
        tags: ["sentiment", "nlp", "emotion", "gpt-4o"],
        model: "gpt-4o",
        provider: "openai",
        requiredApiKeys: ["OPENAI_API_KEY"],
        
        capabilities: {
            "sentiment-analysis": {
                id: "sentiment-analysis",
                name: "Sentiment Analysis",
                description: "Analyze sentiment, emotion, and tone in text",
                inputParameters: [
                    {
                        name: "text",
                        type: "string",
                        description: "Text to analyze",
                        required: true,
                        minLength: 5,
                        maxLength: 50000,
                        example: "I absolutely love this product! It's amazing!"
                    },
                    {
                        name: "includeEmotions",
                        type: "boolean",
                        description: "Detect specific emotions",
                        required: false,
                        example: true
                    }
                ],
                outputSchema: {
                    type: "object",
                    properties: {
                        sentiment: { type: "string", enum: ["positive", "negative", "neutral", "mixed"] },
                        score: { type: "number", minimum: 0, maximum: 1 },
                        confidence: { type: "number", minimum: 0, maximum: 1 },
                        emotions: { type: "object" },
                        keyPhrases: { type: "array", items: { type: "string" } }
                    },
                    required: ["sentiment", "score"]
                },
                costOctas: "1000000", // 0.01 APT
                executionTimeMs: { min: 1000, max: 15000, average: 3000 },
                maxInputSize: 50000,
                timeoutMs: 15000,
                examples: [
                    {
                        input: {
                            text: "This is fantastic! Best experience ever!",
                            includeEmotions: true
                        },
                        output: {
                            sentiment: "positive",
                            score: 0.95,
                            confidence: 0.99,
                            emotions: { joy: 0.9, satisfaction: 0.88 },
                            keyPhrases: ["fantastic", "best"]
                        },
                        description: "Analyze positive sentiment"
                    }
                ],
                errorCases: []
            }
        },
        
        successRate: 95.4,
        averageExecutionTimeMs: 2800,
        totalExecutions: 1850,
        averageRating: 4.3,
        isVerified: true,
        verifiedAt: Date.now() - 45 * 24 * 60 * 60 * 1000,
        canInvokeOtherAgents: false
    },

    // ========== COMPOSITE AGENTS ==========
    "research-assistant": {
        id: "research-assistant",
        name: "Research Assistant",
        version: "1.0.0",
        description: "Comprehensive research using web search and synthesis",
        owner: "aether-labs",
        category: "composite",
        tags: ["research", "composite", "search", "analysis"],
        provider: "multi-agent",
        
        capabilities: {
            "research": {
                id: "research",
                name: "Research",
                description: "Conduct comprehensive research on a topic",
                inputParameters: [
                    {
                        name: "topic",
                        type: "string",
                        description: "Topic to research",
                        required: true,
                        minLength: 5,
                        maxLength: 500,
                        example: "quantum computing breakthroughs 2026"
                    },
                    {
                        name: "depth",
                        type: "string",
                        description: "Research depth",
                        required: false,
                        enum: ["quick", "standard", "deep"],
                        example: "deep"
                    }
                ],
                outputSchema: {
                    type: "object",
                    properties: {
                        summary: { type: "string" },
                        findings: { type: "array" },
                        sources: { type: "array" },
                        recommendations: { type: "array" }
                    },
                    required: ["summary", "findings"]
                },
                costOctas: "4000000", // 0.04 APT (search + analysis)
                executionTimeMs: { min: 5000, max: 60000, average: 20000 },
                maxInputSize: 500,
                timeoutMs: 60000,
                examples: [],
                errorCases: []
            }
        },
        
        successRate: 96.9,
        averageExecutionTimeMs: 18000,
        totalExecutions: 320,
        averageRating: 4.6,
        isVerified: true,
        verifiedAt: Date.now() - 15 * 24 * 60 * 60 * 1000,
        canInvokeOtherAgents: true,
        isComposite: true,
        usesAgents: ["search-sage", "atlas-ai"]
    },

    "secure-coder": {
        id: "secure-coder",
        name: "Secure Coder",
        version: "1.0.0",
        description: "Generate secure code with automatic vulnerability checking",
        owner: "aether-labs",
        category: "composite",
        tags: ["code", "security", "composite", "generation"],
        provider: "multi-agent",
        
        capabilities: {
            "secure-generation": {
                id: "secure-generation",
                name: "Secure Code Generation",
                description: "Generate code with built-in security verification",
                inputParameters: [
                    {
                        name: "description",
                        type: "string",
                        description: "Code requirements",
                        required: true,
                        minLength: 20,
                        maxLength: 5000,
                        example: "Create a secure user authentication endpoint"
                    },
                    {
                        name: "language",
                        type: "string",
                        description: "Programming language",
                        required: true,
                        enum: ["typescript", "python", "rust"],
                        example: "typescript"
                    },
                    {
                        name: "securityLevel",
                        type: "string",
                        description: "Security requirements",
                        required: false,
                        enum: ["standard", "high", "critical"],
                        example: "high"
                    }
                ],
                outputSchema: {
                    type: "object",
                    properties: {
                        code: { type: "string" },
                        vulnerabilities: { type: "array" },
                        securityScore: { type: "number", minimum: 0, maximum: 100 },
                        recommendations: { type: "array" }
                    },
                    required: ["code", "securityScore"]
                },
                costOctas: "6000000", // 0.06 APT (generation + audit)
                executionTimeMs: { min: 10000, max: 90000, average: 35000 },
                maxInputSize: 5000,
                timeoutMs: 90000,
                examples: [],
                errorCases: []
            }
        },
        
        successRate: 98.3,
        averageExecutionTimeMs: 32000,
        totalExecutions: 180,
        averageRating: 4.8,
        isVerified: true,
        verifiedAt: Date.now() - 20 * 24 * 60 * 60 * 1000,
        canInvokeOtherAgents: true,
        isComposite: true,
        usesAgents: ["syntax-wizard", "quantum-sage"]
    }
};

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Get agent by ID
 */
export function getAgent(agentId: string): AgentSpec | undefined {
    return UNIFIED_AGENT_REGISTRY[agentId];
}

/**
 * Get all agents
 */
export function getAllAgents(): AgentSpec[] {
    return Object.values(UNIFIED_AGENT_REGISTRY);
}

/**
 * Get agents by category
 */
export function getAgentsByCategory(category: string): AgentSpec[] {
    return Object.values(UNIFIED_AGENT_REGISTRY).filter(agent => agent.category === category);
}

/**
 * Get agents by tag
 */
export function getAgentsByTag(tag: string): AgentSpec[] {
    return Object.values(UNIFIED_AGENT_REGISTRY).filter(agent => agent.tags.includes(tag));
}

/**
 * Get composite agents
 */
export function getCompositeAgents(): AgentSpec[] {
    return Object.values(UNIFIED_AGENT_REGISTRY).filter(agent => agent.isComposite);
}

/**
 * Validate agent can execute capability
 */
export function canAgentExecute(agentId: string, capabilityId: string): boolean {
    const agent = getAgent(agentId);
    return !!agent && !!agent.capabilities[capabilityId];
}

/**
 * Get capability cost
 */
export function getCapabilityCost(agentId: string, capabilityId: string): string | null {
    const agent = getAgent(agentId);
    const capability = agent?.capabilities[capabilityId];
    return capability?.costOctas || null;
}
