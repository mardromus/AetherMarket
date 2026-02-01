/**
 * Real Agent Registry
 * Defines all available agents with their capabilities, pricing, and verification
 */

export interface AgentCapability {
    name: string;
    description: string;
    costInOctas: string; // pricing per execution
    modelUsed: string;
    timeoutMs: number;
    maxInputSize: number; // bytes
    tags: string[];
}

export interface AgentRegistry {
    id: string;
    name: string;
    description: string;
    owner: string;
    createdAt: number;
    version: string;
    
    // Runtime info
    capabilities: Record<string, AgentCapability>;
    supportedLanguages?: string[];
    
    // Execution
    executorUrl?: string; // webhook URL for custom execution
    isOnChain: boolean;
    
    // Stats
    totalExecutions: number;
    successRate: number; // 0-100
    averageExecutionTimeMs: number;
    averageRating: number; // 0-5
    
    // Discovery
    isPublic: boolean;
    isVerified: boolean;
    verificationMetadata?: {
        verifiedBy: string;
        verifiedAt: number;
        auditResults: string;
    };
    
    // Composability
    canInvokeOtherAgents: boolean;
    dependsOnAgents?: string[]; // other agent IDs this agent uses
}

export const AGENT_REGISTRY: Record<string, AgentRegistry> = {
    // ========== TEXT & ANALYSIS AGENTS ==========
    "atlas-ai": {
        id: "atlas-ai",
        name: "Atlas AI",
        description: "General-purpose text generation, analysis, and reasoning using GPT-4o",
        owner: "aether-labs",
        createdAt: Date.now() - 90 * 24 * 60 * 60 * 1000, // 90 days ago
        version: "1.0.0",
        capabilities: {
            "text-generation": {
                name: "Text Generation",
                description: "Generate high-quality text content",
                costInOctas: "2000000",
                modelUsed: "gpt-4-turbo",
                timeoutMs: 30000,
                maxInputSize: 100000,
                tags: ["writing", "content", "general"]
            },
            "analysis": {
                name: "Analysis",
                description: "Analyze and summarize content",
                costInOctas: "1500000",
                modelUsed: "gpt-4-turbo",
                timeoutMs: 25000,
                maxInputSize: 200000,
                tags: ["analysis", "summary"]
            }
        },
        isOnChain: true,
        totalExecutions: 1250,
        successRate: 98.5,
        averageExecutionTimeMs: 3200,
        averageRating: 4.7,
        isPublic: true,
        isVerified: true,
        canInvokeOtherAgents: true,
        dependsOnAgents: []
    },

    "neural-alpha": {
        id: "neural-alpha",
        name: "Neural Alpha",
        description: "High-quality image generation using DALL-E 3",
        owner: "aether-labs",
        createdAt: Date.now() - 60 * 24 * 60 * 60 * 1000,
        version: "2.1.0",
        capabilities: {
            "image-generation": {
                name: "Image Generation",
                description: "Generate images from text descriptions",
                costInOctas: "5000000",
                modelUsed: "dall-e-3",
                timeoutMs: 45000,
                maxInputSize: 5000,
                tags: ["image", "art", "visual"]
            }
        },
        isOnChain: true,
        totalExecutions: 890,
        successRate: 99.2,
        averageExecutionTimeMs: 8500,
        averageRating: 4.9,
        isPublic: true,
        isVerified: true,
        canInvokeOtherAgents: false,
        dependsOnAgents: []
    },

    "quantum-sage": {
        id: "quantum-sage",
        name: "Quantum Sage",
        description: "Code security auditing and vulnerability detection",
        owner: "aether-labs",
        createdAt: Date.now() - 45 * 24 * 60 * 60 * 1000,
        version: "1.5.0",
        capabilities: {
            "code-audit": {
                name: "Code Audit",
                description: "Analyze code for security vulnerabilities",
                costInOctas: "3000000",
                modelUsed: "gpt-4-turbo",
                timeoutMs: 60000,
                maxInputSize: 51200, // 50KB max
                tags: ["security", "audit", "code"]
            },
            "performance-analysis": {
                name: "Performance Analysis",
                description: "Analyze code performance characteristics",
                costInOctas: "2500000",
                modelUsed: "gpt-4-turbo",
                timeoutMs: 45000,
                maxInputSize: 51200,
                tags: ["performance", "optimization"]
            }
        },
        supportedLanguages: ["javascript", "typescript", "python", "java", "cpp", "rust", "go", "solidity"],
        isOnChain: true,
        totalExecutions: 567,
        successRate: 97.8,
        averageExecutionTimeMs: 12000,
        averageRating: 4.6,
        isPublic: true,
        isVerified: true,
        canInvokeOtherAgents: false,
        dependsOnAgents: []
    },

    "syntax-wizard": {
        id: "syntax-wizard",
        name: "Syntax Wizard",
        description: "Production-ready code generation for any language",
        owner: "aether-labs",
        createdAt: Date.now() - 30 * 24 * 60 * 60 * 1000,
        version: "1.2.0",
        capabilities: {
            "code-generation": {
                name: "Code Generation",
                description: "Generate complete, production-ready code",
                costInOctas: "3000000",
                modelUsed: "gpt-4-turbo",
                timeoutMs: 40000,
                maxInputSize: 10000,
                tags: ["code", "generation", "development"]
            }
        },
        supportedLanguages: ["javascript", "typescript", "python", "java", "rust", "go", "cpp"],
        isOnChain: true,
        totalExecutions: 2100,
        successRate: 96.3,
        averageExecutionTimeMs: 5800,
        averageRating: 4.5,
        isPublic: true,
        isVerified: true,
        canInvokeOtherAgents: true,
        dependsOnAgents: ["quantum-sage"] // uses security audit for generated code
    },

    // ========== DATA & ANALYSIS AGENTS ==========
    "oracle-prime": {
        id: "oracle-prime",
        name: "Oracle Prime",
        description: "Real-time financial and cryptocurrency data analysis",
        owner: "aether-labs",
        createdAt: Date.now() - 90 * 24 * 60 * 60 * 1000,
        version: "3.0.0",
        capabilities: {
            "financial-analysis": {
                name: "Financial Analysis",
                description: "Get real-time crypto prices and market data",
                costInOctas: "2000000",
                modelUsed: "coingecko-api",
                timeoutMs: 15000,
                maxInputSize: 1000,
                tags: ["finance", "crypto", "data"]
            }
        },
        isOnChain: true,
        totalExecutions: 5420,
        successRate: 99.7,
        averageExecutionTimeMs: 800,
        averageRating: 4.8,
        isPublic: true,
        isVerified: true,
        canInvokeOtherAgents: false,
        dependsOnAgents: []
    },

    "search-sage": {
        id: "search-sage",
        name: "Search Sage",
        description: "Real-time web search and information retrieval",
        owner: "aether-labs",
        createdAt: Date.now() - 60 * 24 * 60 * 60 * 1000,
        version: "1.1.0",
        capabilities: {
            "web-search": {
                name: "Web Search",
                description: "Search the web for current information",
                costInOctas: "1000000",
                modelUsed: "serp-api",
                timeoutMs: 20000,
                maxInputSize: 2000,
                tags: ["search", "information", "web"]
            }
        },
        isOnChain: true,
        totalExecutions: 3200,
        successRate: 98.1,
        averageExecutionTimeMs: 2100,
        averageRating: 4.4,
        isPublic: true,
        isVerified: true,
        canInvokeOtherAgents: false,
        dependsOnAgents: []
    },

    "sentiment-bot": {
        id: "sentiment-bot",
        name: "Sentiment Bot",
        description: "Emotion and sentiment analysis using advanced NLP",
        owner: "aether-labs",
        createdAt: Date.now() - 45 * 24 * 60 * 60 * 1000,
        version: "1.3.0",
        capabilities: {
            "sentiment-analysis": {
                name: "Sentiment Analysis",
                description: "Analyze sentiment, emotion, and tone",
                costInOctas: "1000000",
                modelUsed: "gpt-4-turbo",
                timeoutMs: 15000,
                maxInputSize: 50000,
                tags: ["sentiment", "emotion", "nlp"]
            }
        },
        isOnChain: true,
        totalExecutions: 1850,
        successRate: 95.4,
        averageExecutionTimeMs: 2300,
        averageRating: 4.3,
        isPublic: true,
        isVerified: true,
        canInvokeOtherAgents: false,
        dependsOnAgents: []
    },

    // ========== COMPOSITE AGENTS (use other agents) ==========
    "research-assistant": {
        id: "research-assistant",
        name: "Research Assistant",
        description: "Comprehensive research using web search and analysis",
        owner: "aether-labs",
        createdAt: Date.now() - 15 * 24 * 60 * 60 * 1000,
        version: "1.0.0",
        capabilities: {
            "research": {
                name: "Research",
                description: "Conduct comprehensive research on a topic",
                costInOctas: "4000000", // search + analysis combined
                modelUsed: "multi-agent",
                timeoutMs: 60000,
                maxInputSize: 2000,
                tags: ["research", "composite", "analysis"]
            }
        },
        isOnChain: true,
        totalExecutions: 320,
        successRate: 96.9,
        averageExecutionTimeMs: 15000,
        averageRating: 4.6,
        isPublic: true,
        isVerified: true,
        canInvokeOtherAgents: true,
        dependsOnAgents: ["search-sage", "atlas-ai"]
    },

    "secure-coder": {
        id: "secure-coder",
        name: "Secure Coder",
        description: "Generate secure code with automatic vulnerability checking",
        owner: "aether-labs",
        createdAt: Date.now() - 20 * 24 * 60 * 60 * 1000,
        version: "1.0.0",
        capabilities: {
            "secure-generation": {
                name: "Secure Code Generation",
                description: "Generate code with security verification",
                costInOctas: "6000000", // code gen + audit combined
                modelUsed: "multi-agent",
                timeoutMs: 90000,
                maxInputSize: 5000,
                tags: ["code", "security", "composite"]
            }
        },
        supportedLanguages: ["javascript", "typescript", "python", "rust"],
        isOnChain: true,
        totalExecutions: 180,
        successRate: 98.3,
        averageExecutionTimeMs: 22000,
        averageRating: 4.8,
        isPublic: true,
        isVerified: true,
        canInvokeOtherAgents: true,
        dependsOnAgents: ["syntax-wizard", "quantum-sage"]
    }
};

// Helper to get agent by ID
export function getAgent(agentId: string): AgentRegistry | undefined {
    return AGENT_REGISTRY[agentId];
}

// Helper to find agents by capability
export function findAgentsByCapability(capability: string): AgentRegistry[] {
    return Object.values(AGENT_REGISTRY).filter(agent =>
        agent.capabilities[capability] !== undefined
    );
}

// Helper to get cost for a specific agent capability
export function getCapabilityCost(agentId: string, capability: string): string | null {
    const agent = getAgent(agentId);
    if (!agent) return null;
    return agent.capabilities[capability]?.costInOctas || null;
}
