/**
 * STANDARDIZED AGENT INTERFACE
 * All agents must implement this interface with clear requirements
 * Ensures consistency across the entire application
 */

// ============================================
// AGENT EXECUTION INTERFACE
// ============================================

export interface AgentParameter {
    name: string;
    type: "string" | "number" | "boolean" | "array" | "object";
    description: string;
    required: boolean;
    minLength?: number;
    maxLength?: number;
    minValue?: number;
    maxValue?: number;
    enum?: (string | number | boolean)[];
    example?: any;
}

export interface AgentCapabilitySpec {
    id: string;
    name: string;
    description: string;
    inputParameters: AgentParameter[];
    outputSchema: {
        type: string;
        properties: Record<string, any>;
        required?: string[];
    };
    costOctas: string;
    executionTimeMs: {
        min: number;
        max: number;
        average: number;
    };
    maxInputSize: number; // bytes
    timeoutMs: number;
    examples: Array<{
        input: Record<string, any>;
        output: Record<string, any>;
        description: string;
    }>;
    errorCases: Array<{
        error: string;
        cause: string;
        solution: string;
    }>;
}

export interface AgentSpec {
    // Identity
    id: string;
    name: string;
    version: string;
    description: string;
    owner: string;

    // Classification
    category: "ai-generation" | "analysis" | "data-retrieval" | "code" | "composite" | "utility";
    tags: string[];

    // Capabilities
    capabilities: Record<string, AgentCapabilitySpec>;

    // Execution
    model?: string;
    provider?: "openai" | "anthropic" | "google" | "groq" | "coingecko" | "serpapi" | "multi-agent";
    baseUrl?: string;
    executorUrl?: string;

    // Requirements
    requiredApiKeys?: string[];
    requiredEnvVars?: string[];
    rateLimit?: {
        requestsPerMinute: number;
        requestsPerDay: number;
    };

    // Metadata
    successRate: number; // 0-100
    averageExecutionTimeMs: number;
    totalExecutions: number;
    averageRating: number; // 0-5
    isVerified: boolean;
    verifiedAt?: number;
    deprecatedAt?: number;
    maintenanceMode?: boolean;

    // Pricing & Reputation (optional, for UI display)
    price?: string;
    reputation?: number;

    // Composition
    isComposite?: boolean;
    usesAgents?: string[];
    dependsOnAgents?: string[];
    canInvokeOtherAgents?: boolean;
}

// ============================================
// EXECUTION REQUEST/RESPONSE
// ============================================

export interface AgentExecutionRequest {
    agentId: string;
    capabilityId: string;
    parameters: Record<string, any>;

    // Payment info
    budgetId?: string;
    maxCostOctas?: string;

    // Metadata
    userId?: string;
    sessionId?: string;
    correlationId?: string;
    timeout?: number;
}

export interface AgentExecutionResponse<T = any> {
    success: boolean;
    result?: T;
    error?: {
        code: string;
        message: string;
        details?: Record<string, any>;
    };

    // Execution info
    agentId: string;
    capabilityId: string;
    executionTimeMs: number;
    costOctas: string;

    // Metadata
    model?: string;
    tokensUsed?: number;
    transactionHash?: string;
    timestamp: number;
    correlationId?: string;
}

// ============================================
// PARAMETER VALIDATION
// ============================================

export interface ValidationError {
    field: string;
    issue: string;
    expected?: any;
    received?: any;
}

export interface ValidationResult {
    valid: boolean;
    errors?: ValidationError[];
}

// ============================================
// MINTING INTERFACE
// ============================================

export interface AgentMintRequest {
    agentSpec: AgentSpec;
    ownerAddress: string;
    initialBudget: string; // in octas
    metadata?: {
        documentation?: string;
        sourceCode?: string;
        auditReport?: string;
    };
}

export interface AgentMintResponse {
    success: boolean;
    agentId?: string;
    registryAddress?: string;
    transactionHash?: string;
    error?: string;
}

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Validate parameters against spec
 */
export function validateParameters(
    parameters: Record<string, any>,
    spec: AgentParameter[]
): ValidationResult {
    const errors: ValidationError[] = [];

    for (const param of spec) {
        const value = parameters[param.name];

        // Check required
        if (param.required && (value === undefined || value === null)) {
            errors.push({
                field: param.name,
                issue: "Parameter is required",
                expected: param.type,
                received: value
            });
            continue;
        }

        if (value === undefined || value === null) {
            continue;
        }

        // Check type
        if (typeof value !== param.type) {
            errors.push({
                field: param.name,
                issue: `Expected type ${param.type}`,
                expected: param.type,
                received: typeof value
            });
            continue;
        }

        // Check constraints
        if (param.type === "string") {
            if (param.minLength && value.length < param.minLength) {
                errors.push({
                    field: param.name,
                    issue: `Minimum length is ${param.minLength}`,
                    expected: `>= ${param.minLength}`,
                    received: value.length
                });
            }
            if (param.maxLength && value.length > param.maxLength) {
                errors.push({
                    field: param.name,
                    issue: `Maximum length is ${param.maxLength}`,
                    expected: `<= ${param.maxLength}`,
                    received: value.length
                });
            }
            if (param.enum && !param.enum.includes(value)) {
                errors.push({
                    field: param.name,
                    issue: `Must be one of: ${param.enum.join(", ")}`,
                    expected: param.enum,
                    received: value
                });
            }
        }

        if (param.type === "number") {
            if (param.minValue !== undefined && value < param.minValue) {
                errors.push({
                    field: param.name,
                    issue: `Minimum value is ${param.minValue}`,
                    expected: `>= ${param.minValue}`,
                    received: value
                });
            }
            if (param.maxValue !== undefined && value > param.maxValue) {
                errors.push({
                    field: param.name,
                    issue: `Maximum value is ${param.maxValue}`,
                    expected: `<= ${param.maxValue}`,
                    received: value
                });
            }
        }
    }

    return {
        valid: errors.length === 0,
        errors: errors.length > 0 ? errors : undefined
    };
}

/**
 * Get capability by ID from agent spec
 */
export function getCapability(
    agent: AgentSpec,
    capabilityId: string
): AgentCapabilitySpec | null {
    return agent.capabilities[capabilityId] || null;
}

/**
 * Check if agent can execute capability
 */
export function canExecuteCapability(
    agent: AgentSpec,
    capabilityId: string,
    parameters?: Record<string, any>
): { can: boolean; reason?: string } {
    if (!agent.capabilities[capabilityId]) {
        return {
            can: false,
            reason: `Agent "${agent.name}" does not support capability "${capabilityId}"`
        };
    }

    if (agent.maintenanceMode) {
        return {
            can: false,
            reason: `Agent "${agent.name}" is in maintenance mode`
        };
    }

    if (agent.deprecatedAt && agent.deprecatedAt <= Date.now()) {
        return {
            can: false,
            reason: `Agent "${agent.name}" has been deprecated`
        };
    }

    if (parameters) {
        const capability = agent.capabilities[capabilityId];
        const validation = validateParameters(parameters, capability.inputParameters);
        if (!validation.valid) {
            return {
                can: false,
                reason: `Invalid parameters: ${validation.errors?.[0]?.issue}`
            };
        }
    }

    return { can: true };
}

/**
 * Format cost for display
 */
export function formatCost(octas: string): { apt: number; octas: string } {
    const octasNum = BigInt(octas);
    const apt = Number(octasNum) / 100_000_000;
    return { apt, octas };
}

/**
 * Check if agent is composite
 */
export function isCompositeAgent(agent: AgentSpec): boolean {
    return agent.isComposite === true && !!agent.usesAgents?.length;
}

/**
 * Get all dependencies for agent
 */
export function getAgentDependencies(agent: AgentSpec): string[] {
    return [...(agent.usesAgents || []), ...(agent.dependsOnAgents || [])];
}
