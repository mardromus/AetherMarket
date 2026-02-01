/**
 * Session and Transaction Limit Types
 */

export interface SessionConfig {
    id: string;
    userId: string;
    createdAt: number;
    expiresAt: number;
    
    // Transaction limits
    maxTransactionAmount: string; // in octas
    maxDailySpend: string; // in octas
    maxMonthlySpend: string; // in octas
    remainingDailyBudget: string;
    remainingMonthlyBudget: string;
    
    // Per-agent limits
    agentCallLimits: Record<string, {
        maxCallsPerDay: number;
        maxCallsPerHour: number;
        currentCallsToday: number;
        currentCallsThisHour: number;
        lastCallTime?: number;
    }>;
    
    // Time-based limits
    maxConcurrentTasks: number;
    taskTimeoutMs: number; // how long before task auto-cancels
    requestRateLimit: number; // requests per second
    
    // Security
    allowedAgentIds?: string[]; // whitelist, if empty = all allowed
    requireManualApprovalOver?: string; // require approval for transactions over this amount
    
    // Session status
    isPaused: boolean;
    pauseReason?: string;
}

export interface TransactionRecord {
    id: string;
    sessionId: string;
    agentId: string;
    amount: string; // in octas
    timestamp: number;
    taskType: string;
    status: 'pending' | 'completed' | 'failed' | 'cancelled';
    errorMessage?: string;
    executionTimeMs?: number;
    callingAgentId?: string; // if agent-to-agent call
}

export interface SessionLimitExceeded {
    type: 'daily' | 'monthly' | 'perAgent' | 'perTransaction' | 'rateLimit' | 'concurrent';
    limit: string | number;
    current: string | number;
    message: string;
}

export interface BudgetStatus {
    dailySpent: string;
    monthlySpent: string;
    dailyRemaining: string;
    monthlyRemaining: string;
    percentageUsedDaily: number;
    percentageUsedMonthly: number;
}
