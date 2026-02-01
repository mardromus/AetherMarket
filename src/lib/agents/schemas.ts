/**
 * COMPREHENSIVE AGENT SCHEMAS & INTERFACES
 * Complete type definitions for all agent request/response formats
 */

// ============================================
// UNIVERSAL AGENT REQUEST/RESPONSE TYPES
// ============================================

export interface AgentRequest {
    agentId: string;
    taskType: string;
    parameters: Record<string, unknown>;
    maxPrice?: string;
    budgetId?: string;
    metadata?: {
        userId?: string;
        sessionId?: string;
        timestamp?: number;
    };
}

export interface AgentResponse<T = unknown> {
    success: boolean;
    result: T;
    executionTime: number;
    cost: string;
    agentId: string;
    taskType: string;
    error?: string;
    metadata?: {
        tokensUsed?: number;
        model?: string;
        timestamp?: number;
    };
}

// ============================================
// NEURAL ALPHA - IMAGE GENERATION
// ============================================

export namespace NeuralAlpha {
    export const ID = "neural-alpha";
    export const NAME = "Neural Alpha";
    export const COST = 0.05; // APT
    export const MODEL = "dall-e-3";

    export interface Request extends Omit<AgentRequest, 'parameters'> {
        agentId: typeof ID;
        taskType: "image-generation";
        parameters: {
            /** Text description of the image to generate */
            prompt: string;
            /** Image size: 1024x1024, 1792x1024, or 1024x1792 */
            size?: "1024x1024" | "1792x1024" | "1024x1792";
            /** Quality: standard or hd */
            quality?: "standard" | "hd";
            /** Number of images to generate (1-10) */
            n?: number;
            /** Style guidance for the image */
            style?: string;
        };
    }

    export interface Response extends AgentResponse {
        result: {
            imageUrl: string;
            revisedPrompt: string;
            base64?: string;
            metadata?: {
                size: string;
                quality: string;
                model: string;
            };
        };
    }

    export const EXAMPLE_REQUEST: Request = {
        agentId: ID,
        taskType: "image-generation",
        parameters: {
            prompt: "A futuristic city with autonomous agents walking",
            size: "1024x1024",
            quality: "hd",
            n: 1
        }
    };

    export const EXAMPLE_RESPONSE: Response = {
        success: true,
        result: {
            imageUrl: "https://...",
            revisedPrompt: "A futuristic cityscape with autonomous robots...",
            metadata: {
                size: "1024x1024",
                quality: "hd",
                model: "dall-e-3"
            }
        },
        executionTime: 2500,
        cost: "50000",
        agentId: ID,
        taskType: "image-generation"
    };

    export const SCHEMA = {
        input: {
            prompt: { type: "string", required: true, maxLength: 4000 },
            size: { type: "enum", values: ["1024x1024", "1792x1024", "1024x1792"], required: false },
            quality: { type: "enum", values: ["standard", "hd"], required: false },
            n: { type: "number", min: 1, max: 10, required: false },
            style: { type: "string", required: false }
        },
        output: {
            imageUrl: { type: "string", description: "HTTPS URL to generated image" },
            revisedPrompt: { type: "string", description: "Revised prompt used by API" },
            base64: { type: "string", description: "Optional base64 encoded image" }
        }
    };
}

// ============================================
// QUANTUM SAGE - CODE AUDIT
// ============================================

export namespace QuantumSage {
    export const ID = "quantum-sage";
    export const NAME = "Quantum Sage";
    export const COST = 0.03; // APT
    export const MODEL = "gpt-4o";

    export interface Request extends Omit<AgentRequest, 'parameters'> {
        agentId: typeof ID;
        taskType: "code-audit";
        parameters: {
            /** Code to audit */
            code: string;
            /** Programming language */
            language: "javascript" | "typescript" | "python" | "java" | "cpp" | "rust" | "go" | "solidity";
            /** Audit focus areas */
            focus?: ("security" | "performance" | "maintainability" | "all")[];
            /** Should include fixes */
            includeFixes?: boolean;
        };
    }

    export interface Issue {
        severity: "critical" | "high" | "medium" | "low";
        type: string;
        line: number;
        message: string;
        suggestion?: string;
    }

    export interface Response extends AgentResponse {
        result: {
            issues: Issue[];
            summary: string;
            score: number;
            codeQuality: "excellent" | "good" | "fair" | "poor";
            recommendations: string[];
            fixedCode?: string;
        };
    }

    export const EXAMPLE_REQUEST: Request = {
        agentId: ID,
        taskType: "code-audit",
        parameters: {
            code: "function process(data) {\n  eval(data);\n  return data;\n}",
            language: "javascript",
            focus: ["security", "performance"],
            includeFixes: true
        }
    };

    export const EXAMPLE_RESPONSE: Response = {
        success: true,
        result: {
            issues: [
                {
                    severity: "critical",
                    type: "Security",
                    line: 2,
                    message: "Use of eval() is dangerous",
                    suggestion: "Parse JSON or use Function constructor with sandboxing"
                }
            ],
            summary: "1 critical issue found. Code quality: POOR",
            score: 25,
            codeQuality: "poor",
            recommendations: [
                "Remove eval() usage",
                "Add input validation",
                "Add error handling"
            ],
            fixedCode: "function process(data) {\n  try {\n    return JSON.parse(data);\n  } catch (e) {\n    throw new Error('Invalid input');\n  }\n}"
        },
        executionTime: 1800,
        cost: "30000",
        agentId: ID,
        taskType: "code-audit"
    };

    export const SCHEMA = {
        input: {
            code: { type: "string", required: true, maxLength: 51200 },
            language: { type: "enum", values: ["javascript", "typescript", "python", "java", "cpp", "rust", "go", "solidity"], required: true },
            focus: { type: "array", values: ["security", "performance", "maintainability", "all"], required: false },
            includeFixes: { type: "boolean", required: false }
        },
        output: {
            issues: { type: "array", description: "List of found issues" },
            summary: { type: "string" },
            score: { type: "number", min: 0, max: 100 },
            codeQuality: { type: "enum", values: ["excellent", "good", "fair", "poor"] },
            recommendations: { type: "array", description: "Improvement suggestions" },
            fixedCode: { type: "string", description: "Corrected code (if includeFixes=true)" }
        }
    };
}

// ============================================
// ORACLE PRIME - FINANCIAL ANALYSIS
// ============================================

export namespace OraclePrime {
    export const ID = "oracle-prime";
    export const NAME = "Oracle Prime";
    export const COST = 0.02; // APT
    export const MODEL = "coingecko-api";

    export interface Request extends Omit<AgentRequest, 'parameters'> {
        agentId: typeof ID;
        taskType: "financial-analysis";
        parameters: {
            /** Cryptocurrency symbol (e.g., "bitcoin", "ethereum") */
            symbol: string;
            /** Analysis timeframe */
            timeframe?: "24h" | "7d" | "30d" | "1y";
            /** Include historical data */
            includeHistory?: boolean;
        };
    }

    export interface Response extends AgentResponse {
        result: {
            symbol: string;
            name: string;
            price: number;
            currency: string;
            priceChange: {
                change24h: number;
                change7d: number;
                change30d: number;
                percentChange24h: number;
            };
            market: {
                marketCap: number;
                volume24h: number;
                circulatingSupply: number;
            };
            analysis: {
                trend: "bullish" | "bearish" | "neutral";
                volatility: "high" | "medium" | "low";
                sentiment: string;
            };
        };
    }

    export const EXAMPLE_REQUEST: Request = {
        agentId: ID,
        taskType: "financial-analysis",
        parameters: {
            symbol: "bitcoin",
            timeframe: "7d",
            includeHistory: false
        }
    };

    export const EXAMPLE_RESPONSE: Response = {
        success: true,
        result: {
            symbol: "bitcoin",
            name: "Bitcoin",
            price: 42500,
            currency: "USD",
            priceChange: {
                change24h: 1250,
                change7d: 3500,
                change30d: 5000,
                percentChange24h: 3.04
            },
            market: {
                marketCap: 840000000000,
                volume24h: 28000000000,
                circulatingSupply: 21000000
            },
            analysis: {
                trend: "bullish",
                volatility: "medium",
                sentiment: "Positive market sentiment with steady gains"
            }
        },
        executionTime: 800,
        cost: "20000",
        agentId: ID,
        taskType: "financial-analysis"
    };

    export const SCHEMA = {
        input: {
            symbol: { type: "string", required: true },
            timeframe: { type: "enum", values: ["24h", "7d", "30d", "1y"], required: false },
            includeHistory: { type: "boolean", required: false }
        },
        output: {
            symbol: { type: "string" },
            name: { type: "string" },
            price: { type: "number" },
            currency: { type: "string" },
            priceChange: { type: "object" },
            market: { type: "object" },
            analysis: { type: "object" }
        }
    };
}

// ============================================
// SYNTAX WIZARD - CODE GENERATION
// ============================================

export namespace SyntaxWizard {
    export const ID = "syntax-wizard";
    export const NAME = "Syntax Wizard";
    export const COST = 0.03; // APT
    export const MODEL = "gpt-4o";

    export interface Request extends Omit<AgentRequest, 'parameters'> {
        agentId: typeof ID;
        taskType: "code-generation";
        parameters: {
            /** Description of what to generate */
            prompt: string;
            /** Programming language */
            language: "javascript" | "typescript" | "python" | "java" | "cpp" | "rust" | "go" | "solidity";
            /** Include comments and documentation */
            includeComments?: boolean;
            /** Include unit tests */
            includeTests?: boolean;
        };
    }

    export interface Response extends AgentResponse {
        result: {
            code: string;
            language: string;
            explanation: string;
            tests?: string;
            dependencies?: string[];
        };
    }

    export const EXAMPLE_REQUEST: Request = {
        agentId: ID,
        taskType: "code-generation",
        parameters: {
            prompt: "Create a React component for user authentication with email and password",
            language: "typescript",
            includeComments: true,
            includeTests: false
        }
    };

    export const EXAMPLE_RESPONSE: Response = {
        success: true,
        result: {
            code: "import React, { useState } from 'react';\n\ninterface LoginProps {\n  onSuccess: (user: any) => void;\n}\n\nexport const LoginComponent: React.FC<LoginProps> = ({ onSuccess }) => {\n  const [email, setEmail] = useState('');\n  const [password, setPassword] = useState('');\n  const [loading, setLoading] = useState(false);\n  const [error, setError] = useState('');\n\n  const handleSubmit = async (e: React.FormEvent) => {\n    e.preventDefault();\n    setLoading(true);\n    setError('');\n\n    try {\n      // Call your auth API\n      const response = await fetch('/api/auth/login', {\n        method: 'POST',\n        headers: { 'Content-Type': 'application/json' },\n        body: JSON.stringify({ email, password })\n      });\n\n      if (response.ok) {\n        const user = await response.json();\n        onSuccess(user);\n      } else {\n        setError('Invalid credentials');\n      }\n    } catch (err) {\n      setError('Authentication failed');\n    } finally {\n      setLoading(false);\n    }\n  };\n\n  return (\n    <form onSubmit={handleSubmit}>\n      <input\n        type=\"email\"\n        placeholder=\"Email\"\n        value={email}\n        onChange={(e) => setEmail(e.target.value)}\n        required\n      />\n      <input\n        type=\"password\"\n        placeholder=\"Password\"\n        value={password}\n        onChange={(e) => setPassword(e.target.value)}\n        required\n      />\n      {error && <div className=\"error\">{error}</div>}\n      <button type=\"submit\" disabled={loading}>\n        {loading ? 'Logging in...' : 'Login'}\n      </button>\n    </form>\n  );\n};",
            language: "typescript",
            explanation: "A React component that handles user login with email/password authentication",
            dependencies: ["react", "typescript"]
        },
        executionTime: 3200,
        cost: "30000",
        agentId: ID,
        taskType: "code-generation"
    };

    export const SCHEMA = {
        input: {
            prompt: { type: "string", required: true, maxLength: 2000 },
            language: { type: "enum", values: ["javascript", "typescript", "python", "java", "cpp", "rust", "go", "solidity"], required: true },
            includeComments: { type: "boolean", required: false },
            includeTests: { type: "boolean", required: false }
        },
        output: {
            code: { type: "string", description: "Generated code" },
            language: { type: "string" },
            explanation: { type: "string" },
            tests: { type: "string", description: "Optional unit tests" },
            dependencies: { type: "array", description: "Required dependencies" }
        }
    };
}

// ============================================
// ATLAS AI - TEXT GENERATION
// ============================================

export namespace AtlasAI {
    export const ID = "atlas-ai";
    export const NAME = "Atlas AI";
    export const COST = 0.02; // APT
    export const MODEL = "gpt-4o";

    export interface Request extends Omit<AgentRequest, 'parameters'> {
        agentId: typeof ID;
        taskType: "text-generation";
        parameters: {
            /** Prompt or question */
            prompt: string;
            /** Max tokens in response (default: 1500) */
            maxTokens?: number;
            /** Temperature for creativity (0-1) */
            temperature?: number;
            /** Response format */
            format?: "text" | "markdown" | "json";
        };
    }

    export interface Response extends AgentResponse {
        result: {
            text: string;
            tokensUsed: number;
            format: string;
        };
    }

    export const EXAMPLE_REQUEST: Request = {
        agentId: ID,
        taskType: "text-generation",
        parameters: {
            prompt: "Explain quantum computing in simple terms",
            maxTokens: 500,
            temperature: 0.7,
            format: "markdown"
        }
    };

    export const EXAMPLE_RESPONSE: Response = {
        success: true,
        result: {
            text: "# Quantum Computing Explained\n\n...",
            tokensUsed: 342,
            format: "markdown"
        },
        executionTime: 1200,
        cost: "20000",
        agentId: ID,
        taskType: "text-generation"
    };

    export const SCHEMA = {
        input: {
            prompt: { type: "string", required: true, maxLength: 4000 },
            maxTokens: { type: "number", min: 100, max: 4000, required: false },
            temperature: { type: "number", min: 0, max: 1, required: false },
            format: { type: "enum", values: ["text", "markdown", "json"], required: false }
        },
        output: {
            text: { type: "string", description: "Generated text response" },
            tokensUsed: { type: "number" },
            format: { type: "string" }
        }
    };
}

// ============================================
// SEARCH SAGE - WEB SEARCH
// ============================================

export namespace SearchSage {
    export const ID = "search-sage";
    export const NAME = "Search Sage";
    export const COST = 0.01; // APT
    export const MODEL = "serpapi";

    export interface Request extends Omit<AgentRequest, 'parameters'> {
        agentId: typeof ID;
        taskType: "web-search";
        parameters: {
            /** Search query */
            query: string;
            /** Number of results (1-10) */
            numResults?: number;
            /** Search language */
            language?: string;
        };
    }

    export interface SearchResult {
        title: string;
        link: string;
        snippet: string;
    }

    export interface Response extends AgentResponse {
        result: {
            query: string;
            results: SearchResult[];
            totalResults: number;
            executionMs: number;
        };
    }

    export const EXAMPLE_REQUEST: Request = {
        agentId: ID,
        taskType: "web-search",
        parameters: {
            query: "latest AI developments 2026",
            numResults: 5,
            language: "en"
        }
    };

    export const EXAMPLE_RESPONSE: Response = {
        success: true,
        result: {
            query: "latest AI developments 2026",
            results: [
                {
                    title: "Breakthrough in AI Reasoning",
                    link: "https://...",
                    snippet: "New AI models show significant improvement in logical reasoning..."
                }
            ],
            totalResults: 1000,
            executionMs: 450
        },
        executionTime: 650,
        cost: "10000",
        agentId: ID,
        taskType: "web-search"
    };

    export const SCHEMA = {
        input: {
            query: { type: "string", required: true, maxLength: 500 },
            numResults: { type: "number", min: 1, max: 10, required: false },
            language: { type: "string", required: false }
        },
        output: {
            query: { type: "string" },
            results: { type: "array", description: "Search results" },
            totalResults: { type: "number" }
        }
    };
}

// ============================================
// SENTIMENT BOT - SENTIMENT ANALYSIS
// ============================================

export namespace SentimentBot {
    export const ID = "sentiment-bot";
    export const NAME = "Sentiment Bot";
    export const COST = 0.01; // APT
    export const MODEL = "gpt-4o";

    export interface Request extends Omit<AgentRequest, 'parameters'> {
        agentId: typeof ID;
        taskType: "sentiment-analysis";
        parameters: {
            /** Text to analyze */
            text: string;
            /** Include emotion detection */
            includeEmotions?: boolean;
            /** Include key phrases */
            includeKeyPhrases?: boolean;
        };
    }

    export interface Response extends AgentResponse {
        result: {
            sentiment: "positive" | "negative" | "neutral" | "mixed";
            score: number;
            confidence: number;
            emotions?: Record<string, number>;
            keyPhrases?: string[];
            explanation: string;
        };
    }

    export const EXAMPLE_REQUEST: Request = {
        agentId: ID,
        taskType: "sentiment-analysis",
        parameters: {
            text: "This product is amazing! I love the quality and customer service is excellent.",
            includeEmotions: true,
            includeKeyPhrases: true
        }
    };

    export const EXAMPLE_RESPONSE: Response = {
        success: true,
        result: {
            sentiment: "positive",
            score: 0.92,
            confidence: 0.98,
            emotions: {
                joy: 0.85,
                satisfaction: 0.88,
                enthusiasm: 0.81
            },
            keyPhrases: ["amazing", "love", "excellent"],
            explanation: "Strong positive sentiment with multiple expressions of satisfaction and enthusiasm"
        },
        executionTime: 850,
        cost: "10000",
        agentId: ID,
        taskType: "sentiment-analysis"
    };

    export const SCHEMA = {
        input: {
            text: { type: "string", required: true, maxLength: 5000 },
            includeEmotions: { type: "boolean", required: false },
            includeKeyPhrases: { type: "boolean", required: false }
        },
        output: {
            sentiment: { type: "enum", values: ["positive", "negative", "neutral", "mixed"] },
            score: { type: "number", min: 0, max: 1 },
            confidence: { type: "number", min: 0, max: 1 },
            emotions: { type: "object", description: "Emotion scores" },
            keyPhrases: { type: "array" },
            explanation: { type: "string" }
        }
    };
}

// ============================================
// RESEARCH ASSISTANT - COMPOSITE AGENT
// ============================================

export namespace ResearchAssistant {
    export const ID = "research-assistant";
    export const NAME = "Research Assistant";
    export const COST = 0.04; // APT
    export const MODEL = "multi-agent";

    export interface Request extends Omit<AgentRequest, 'parameters'> {
        agentId: typeof ID;
        taskType: "research";
        parameters: {
            query: string;
            depth?: "quick" | "standard" | "deep";
            includeSourceReferences?: boolean;
            maxResults?: number;
        };
    }

    export interface Response extends AgentResponse {
        result: {
            summary: string;
            findings: Array<{
                title: string;
                description: string;
                relevance: number;
            }>;
            sources: Array<{
                title: string;
                url: string;
            }>;
            recommendations: string[];
        };
    }

    export const EXAMPLE_REQUEST: Request = {
        agentId: ID,
        taskType: "research",
        parameters: {
            query: "latest developments in quantum computing",
            depth: "deep",
            includeSourceReferences: true,
            maxResults: 10
        }
    };

    export const EXAMPLE_RESPONSE: Response = {
        success: true,
        result: {
            summary: "Recent quantum computing breakthroughs include error correction advances and commercial deployments by major tech companies.",
            findings: [
                {
                    title: "Google's Quantum Error Correction Milestone",
                    description: "Google announced significant progress in quantum error correction",
                    relevance: 0.98
                },
                {
                    title: "IBM Quantum Network Expansion",
                    description: "IBM expanded its quantum computing network globally",
                    relevance: 0.92
                }
            ],
            sources: [
                { title: "Google Blog", url: "https://blog.google/technology/..." },
                { title: "IBM Newsroom", url: "https://newsroom.ibm.com/..." }
            ],
            recommendations: ["Follow quantum computing releases", "Monitor IBM and Google developments"]
        },
        executionTime: 8500,
        cost: "40000",
        agentId: ID,
        taskType: "research"
    };

    export const SCHEMA = {
        input: {
            query: { type: "string", required: true, maxLength: 500 },
            depth: { type: "enum", values: ["quick", "standard", "deep"], required: false },
            includeSourceReferences: { type: "boolean", required: false },
            maxResults: { type: "number", required: false, min: 1, max: 50 }
        },
        output: {
            summary: { type: "string", description: "Comprehensive research summary" },
            findings: { type: "array", description: "Detailed findings from research" },
            sources: { type: "array", description: "Source references" },
            recommendations: { type: "array", description: "Actionable recommendations" }
        }
    };
}

// ============================================
// SECURE CODER - COMPOSITE AGENT
// ============================================

export namespace SecureCoder {
    export const ID = "secure-coder";
    export const NAME = "Secure Coder";
    export const COST = 0.06; // APT
    export const MODEL = "multi-agent";

    export interface Request extends Omit<AgentRequest, 'parameters'> {
        agentId: typeof ID;
        taskType: "secure-generation";
        parameters: {
            description: string;
            language: "javascript" | "typescript" | "python" | "rust";
            securityLevel?: "standard" | "high" | "critical";
            includeTests?: boolean;
        };
    }

    export interface Response extends AgentResponse {
        result: {
            code: string;
            vulnerabilities: Array<{
                severity: "low" | "medium" | "high" | "critical";
                description: string;
                recommendation: string;
            }>;
            tests: string;
            documentation: string;
            securityScore: number;
        };
    }

    export const EXAMPLE_REQUEST: Request = {
        agentId: ID,
        taskType: "secure-generation",
        parameters: {
            description: "Create a React authentication hook with secure token handling",
            language: "typescript",
            securityLevel: "high",
            includeTests: true
        }
    };

    export const EXAMPLE_RESPONSE: Response = {
        success: true,
        result: {
            code: "// Production-ready secure auth hook\nexport const useSecureAuth = () => { ... }",
            vulnerabilities: [],
            tests: "describe('useSecureAuth', () => { ... })",
            documentation: "## Secure Authentication Hook\n\nProvides secure token management...",
            securityScore: 0.98
        },
        executionTime: 12000,
        cost: "60000",
        agentId: ID,
        taskType: "secure-generation"
    };

    export const SCHEMA = {
        input: {
            description: { type: "string", required: true, maxLength: 1000 },
            language: { type: "enum", values: ["javascript", "typescript", "python", "rust"], required: true },
            securityLevel: { type: "enum", values: ["standard", "high", "critical"], required: false },
            includeTests: { type: "boolean", required: false }
        },
        output: {
            code: { type: "string", description: "Generated secure code" },
            vulnerabilities: { type: "array", description: "Security analysis results" },
            tests: { type: "string", description: "Test code" },
            documentation: { type: "string", description: "Code documentation" },
            securityScore: { type: "number", min: 0, max: 1 }
        }
    };
}

// ============================================
// ALL AGENT SCHEMAS MAP
// ============================================

export const ALL_AGENT_SCHEMAS = {
    "neural-alpha": NeuralAlpha.SCHEMA,
    "quantum-sage": QuantumSage.SCHEMA,
    "oracle-prime": OraclePrime.SCHEMA,
    "syntax-wizard": SyntaxWizard.SCHEMA,
    "atlas-ai": AtlasAI.SCHEMA,
    "search-sage": SearchSage.SCHEMA,
    "sentiment-bot": SentimentBot.SCHEMA,
    "research-assistant": ResearchAssistant.SCHEMA,
    "secure-coder": SecureCoder.SCHEMA
} as const;

// ============================================
// AGENT METADATA MAP
// ============================================

export const AGENT_METADATA = {
    "neural-alpha": {
        id: NeuralAlpha.ID,
        name: NeuralAlpha.NAME,
        cost: NeuralAlpha.COST,
        model: NeuralAlpha.MODEL,
        description: "Generate high-quality images from text descriptions",
        category: "Reality Forge",
        examples: [NeuralAlpha.EXAMPLE_REQUEST, NeuralAlpha.EXAMPLE_RESPONSE]
    },
    "quantum-sage": {
        id: QuantumSage.ID,
        name: QuantumSage.NAME,
        cost: QuantumSage.COST,
        model: QuantumSage.MODEL,
        description: "Audit code for security vulnerabilities and performance issues",
        category: "Logic Engine",
        examples: [QuantumSage.EXAMPLE_REQUEST, QuantumSage.EXAMPLE_RESPONSE]
    },
    "oracle-prime": {
        id: OraclePrime.ID,
        name: OraclePrime.NAME,
        cost: OraclePrime.COST,
        model: OraclePrime.MODEL,
        description: "Get real-time cryptocurrency and financial market data",
        category: "Data Harvester",
        examples: [OraclePrime.EXAMPLE_REQUEST, OraclePrime.EXAMPLE_RESPONSE]
    },
    "syntax-wizard": {
        id: SyntaxWizard.ID,
        name: SyntaxWizard.NAME,
        cost: SyntaxWizard.COST,
        model: SyntaxWizard.MODEL,
        description: "Generate production-ready code from descriptions",
        category: "Code Factory",
        examples: [SyntaxWizard.EXAMPLE_REQUEST, SyntaxWizard.EXAMPLE_RESPONSE]
    },
    "atlas-ai": {
        id: AtlasAI.ID,
        name: AtlasAI.NAME,
        cost: AtlasAI.COST,
        model: AtlasAI.MODEL,
        description: "Generate text, analyze content, and solve problems",
        category: "Text Forge",
        examples: [AtlasAI.EXAMPLE_REQUEST, AtlasAI.EXAMPLE_RESPONSE]
    },
    "search-sage": {
        id: SearchSage.ID,
        name: SearchSage.NAME,
        cost: SearchSage.COST,
        model: SearchSage.MODEL,
        description: "Search the web and gather real-time information",
        category: "Knowledge Seeker",
        examples: [SearchSage.EXAMPLE_REQUEST, SearchSage.EXAMPLE_RESPONSE]
    },
    "sentiment-bot": {
        id: SentimentBot.ID,
        name: SentimentBot.NAME,
        cost: SentimentBot.COST,
        model: SentimentBot.MODEL,
        description: "Analyze sentiment and emotions in text",
        category: "NLP Analyzer",
        examples: [SentimentBot.EXAMPLE_REQUEST, SentimentBot.EXAMPLE_RESPONSE]
    },
    "research-assistant": {
        id: ResearchAssistant.ID,
        name: ResearchAssistant.NAME,
        cost: ResearchAssistant.COST,
        model: ResearchAssistant.MODEL,
        description: "Comprehensive research with web search and synthesis (composite agent)",
        category: "Research Hub",
        examples: [ResearchAssistant.EXAMPLE_REQUEST, ResearchAssistant.EXAMPLE_RESPONSE]
    },
    "secure-coder": {
        id: SecureCoder.ID,
        name: SecureCoder.NAME,
        cost: SecureCoder.COST,
        model: SecureCoder.MODEL,
        description: "Generate secure code with automatic vulnerability checking (composite agent)",
        category: "Secure Factory",
        examples: [SecureCoder.EXAMPLE_REQUEST, SecureCoder.EXAMPLE_RESPONSE]
    }
} as const;
