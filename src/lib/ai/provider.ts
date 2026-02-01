/**
 * AI Provider Utility - Supports both OpenAI and Groq APIs
 * Groq offers faster inference and free tier, making it ideal for development
 */

import OpenAI from "openai";

export type AIProvider = 'openai' | 'groq';

export interface AIClientConfig {
    apiKey?: string;
    provider?: AIProvider;
}

/**
 * Get the configured AI client (Groq or OpenAI)
 * Priority: GROQ_API_KEY > OPENAI_API_KEY
 */
export function getAIClient(config?: AIClientConfig): OpenAI {
    const provider = config?.provider || detectProvider();
    const apiKey = config?.apiKey || getAPIKey(provider);

    if (!apiKey) {
        throw new Error(
            `${provider.toUpperCase()}_API_KEY not configured. ` +
            `Add either GROQ_API_KEY or OPENAI_API_KEY to .env.local`
        );
    }

    if (provider === 'groq') {
        return new OpenAI({
            apiKey,
            baseURL: 'https://api.groq.com/openai/v1'
        });
    }

    return new OpenAI({ apiKey });
}

/**
 * Detect which AI provider is configured
 */
function detectProvider(): AIProvider {
    if (process.env.GROQ_API_KEY) return 'groq';
    if (process.env.OPENAI_API_KEY) return 'openai';
    return 'groq'; // default preference
}

/**
 * Get API key for the specified provider
 */
function getAPIKey(provider: AIProvider): string | undefined {
    return provider === 'groq'
        ? process.env.GROQ_API_KEY
        : process.env.OPENAI_API_KEY;
}

/**
 * Get the appropriate model name for the provider
 */
export function getModelName(provider?: AIProvider): string {
    const actualProvider = provider || detectProvider();

    if (actualProvider === 'groq') {
        // Groq's fastest models
        return 'llama-3.3-70b-versatile'; // Fast and capable
        // Alternative: 'mixtral-8x7b-32768' for longer contexts
    }

    return 'gpt-4-turbo'; // OpenAI default
}

/**
 * Check if any AI provider is configured
 */
export function isAIConfigured(): boolean {
    return !!(process.env.GROQ_API_KEY || process.env.OPENAI_API_KEY);
}

/**
 * Get current provider name for logging
 */
export function getCurrentProvider(): AIProvider {
    return detectProvider();
}
