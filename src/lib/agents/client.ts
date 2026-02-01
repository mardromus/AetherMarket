/**
 * Aether Agent SDK - Simple wrapper for agent execution
 * Use this in your own projects to easily call agents
 * 
 * Installation: Copy this file to your project
 * Usage: 
 *   const client = new AetherClient({ baseUrl: 'https://aether-market.xyz' });
 *   const result = await client.agent('atlas-ai').execute({ prompt: '...' });
 */

export interface AgentConfig {
    baseUrl?: string;
    timeout?: number;
    apiKey?: string;
}

export interface AgentRequest {
    agentId: string;
    capability: string;
    parameters: any;
    sessionId?: string;
    maxPrice?: string;
}

export interface AgentResponse {
    success: boolean;
    result?: any;
    error?: string;
    costInOctas?: string;
    executionTimeMs?: number;
    transactionHash?: string;
}

export interface SessionLimits {
    maxTransactionAmount?: string;
    maxDailySpend?: string;
    maxMonthlySpend?: string;
    maxConcurrentTasks?: number;
    taskTimeoutMs?: number;
}

/**
 * Simple fluent API for executing agents
 */
export class AgentClient {
    private baseUrl: string;
    private timeout: number;
    private apiKey?: string;

    constructor(config: AgentConfig = {}) {
        this.baseUrl = config.baseUrl || 'http://localhost:3000';
        this.timeout = config.timeout || 30000;
        this.apiKey = config.apiKey;
    }

    /**
     * Execute an agent with fluent API
     * Example: client.agent('atlas-ai').text('Hello world').execute()
     */
    agent(agentId: string) {
        return new FluentAgent(this, agentId);
    }

    /**
     * Direct execution with full config
     */
    async execute(request: AgentRequest): Promise<AgentResponse> {
        try {
            const response = await fetch(`${this.baseUrl}/api/agent/execute`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    ...(this.apiKey && { 'Authorization': `Bearer ${this.apiKey}` })
                },
                body: JSON.stringify(request),
                signal: AbortSignal.timeout(this.timeout)
            });

            if (!response.ok) {
                throw new Error(`Agent execution failed: ${response.statusText}`);
            }

            return await response.json();
        } catch (error) {
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error'
            };
        }
    }

    /**
     * Create or get user session
     */
    async createSession(userId: string, limits?: SessionLimits) {
        const response = await fetch(`${this.baseUrl}/api/sessions/config`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                action: 'create',
                userId,
                ...limits
            })
        });

        if (!response.ok) throw new Error('Session creation failed');
        return await response.json();
    }

    /**
     * Get session with budget info
     */
    async getSession(sessionId: string) {
        const response = await fetch(
            `${this.baseUrl}/api/sessions/config?action=get&sessionId=${sessionId}`
        );

        if (!response.ok) throw new Error('Session not found');
        return await response.json();
    }

    /**
     * Get budget status
     */
    async getBudgetStatus(sessionId: string) {
        const response = await fetch(
            `${this.baseUrl}/api/sessions/config?action=budget-status&sessionId=${sessionId}`
        );

        if (!response.ok) throw new Error('Budget status unavailable');
        return await response.json();
    }

    /**
     * Discover agents
     */
    async discoverAgents(capability?: string) {
        let url = `${this.baseUrl}/api/agents/discover?action=list`;
        if (capability) {
            url = `${this.baseUrl}/api/agents/discover?action=by-capability&capability=${capability}`;
        }

        const response = await fetch(url);
        if (!response.ok) throw new Error('Agent discovery failed');
        return await response.json();
    }

    /**
     * Find best agent for a task
     */
    async findBestAgent(capability: string, maxPrice?: string) {
        const response = await fetch(`${this.baseUrl}/api/agents/discover`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                action: 'find-best',
                capability,
                maxPrice
            })
        });

        if (!response.ok) throw new Error('Agent search failed');
        return await response.json();
    }
}

/**
 * Fluent builder for agent execution
 */
class FluentAgent {
    private client: AgentClient;
    private agentId: string;
    private capability: string = '';
    private parameters: any = {};
    private sessionId?: string;
    private _maxPrice?: string;

    constructor(client: AgentClient, agentId: string) {
        this.client = client;
        this.agentId = agentId;
    }

    /**
     * Text generation
     */
    text(prompt: string) {
        this.capability = 'text-generation';
        this.parameters = { prompt };
        return this;
    }

    /**
     * Image generation
     */
    image(prompt: string, size: string = '1024x1024') {
        this.capability = 'image-generation';
        this.parameters = { prompt, size };
        return this;
    }

    /**
     * Code generation
     */
    code(prompt: string, language: string = 'typescript') {
        this.capability = 'code-generation';
        this.parameters = { prompt, language };
        return this;
    }

    /**
     * Code audit
     */
    audit(code: string, language: string = 'typescript') {
        this.capability = 'code-audit';
        this.parameters = { code, language };
        return this;
    }

    /**
     * Financial analysis
     */
    finance(symbol: string) {
        this.capability = 'financial-analysis';
        this.parameters = { symbol };
        return this;
    }

    /**
     * Web search
     */
    search(query: string) {
        this.capability = 'web-search';
        this.parameters = { query };
        return this;
    }

    /**
     * Sentiment analysis
     */
    sentiment(text: string) {
        this.capability = 'sentiment-analysis';
        this.parameters = { text };
        return this;
    }

    /**
     * Custom parameters
     */
    param(key: string, value: any) {
        this.parameters[key] = value;
        return this;
    }

    /**
     * Set session for budget tracking
     */
    session(sessionId: string) {
        this.sessionId = sessionId;
        return this;
    }

    /**
     * Set max price
     */
    maxPrice(price: string) {
        this._maxPrice = price;
        return this;
    }

    /**
     * Execute the agent
     */
    async execute(): Promise<AgentResponse> {
        if (!this.capability) {
            throw new Error('No capability set. Use .text(), .image(), .code(), etc.');
        }

        return this.client.execute({
            agentId: this.agentId,
            capability: this.capability,
            parameters: this.parameters,
            sessionId: this.sessionId,
            maxPrice: this._maxPrice
        });
    }
}

// Export for easy importing
export default AgentClient;
export { FluentAgent };
