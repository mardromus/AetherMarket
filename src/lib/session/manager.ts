/**
 * Session Manager - Handles transaction limits, budgets, and rate limiting
 * This runs on the server side and tracks user sessions
 */

import type { SessionConfig, TransactionRecord, SessionLimitExceeded, BudgetStatus } from "@/types/session";

// In-memory session store (in production, use Redis/Database)
const sessionStore = new Map<string, SessionConfig>();
const transactionStore = new Map<string, TransactionRecord[]>();

/**
 * Create a new session for a user with default limits
 */
export function createSession(
    userId: string,
    overrides?: Partial<SessionConfig>
): SessionConfig {
    const now = Date.now();
    const sessionId = `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    const session: SessionConfig = {
        id: sessionId,
        userId,
        createdAt: now,
        expiresAt: now + 24 * 60 * 60 * 1000, // 24 hours default
        
        // Default transaction limits
        maxTransactionAmount: "50000000", // 0.5 APT max per transaction
        maxDailySpend: "500000000", // 5 APT per day
        maxMonthlySpend: "5000000000", // 50 APT per month
        remainingDailyBudget: "500000000",
        remainingMonthlyBudget: "5000000000",
        
        // Per-agent limits
        agentCallLimits: {},
        
        // Time-based limits
        maxConcurrentTasks: 5,
        taskTimeoutMs: 120000, // 2 minutes
        requestRateLimit: 10, // 10 requests per second
        
        // Security
        allowedAgentIds: undefined, // all agents allowed by default
        requireManualApprovalOver: "100000000", // require approval for >1 APT transactions
        
        isPaused: false,
        ...overrides
    };

    sessionStore.set(sessionId, session);
    transactionStore.set(sessionId, []);

    return session;
}

/**
 * Get or create session for user
 */
export function getOrCreateSession(userId: string): SessionConfig {
    // Find existing active session for this user
    for (const [, session] of sessionStore) {
        if (session.userId === userId && !session.isPaused && session.expiresAt > Date.now()) {
            return session;
        }
    }
    // Create new session
    return createSession(userId);
}

/**
 * Get a session by ID
 */
export function getSession(sessionId: string): SessionConfig | null {
    return sessionStore.get(sessionId) || null;
}

/**
 * Check if a transaction would exceed limits
 * Returns null if OK, or error details if it would exceed
 */
export function checkTransactionLimits(
    sessionId: string,
    agentId: string,
    amount: string
): SessionLimitExceeded | null {
    const session = getSession(sessionId);
    if (!session) {
        return {
            type: "daily",
            limit: "0",
            current: amount,
            message: "Session not found"
        };
    }

    // Check if session is paused
    if (session.isPaused) {
        return {
            type: "daily",
            limit: "0",
            current: amount,
            message: `Session paused: ${session.pauseReason || "No reason provided"}`
        };
    }

    // Check session expiration
    if (session.expiresAt < Date.now()) {
        return {
            type: "daily",
            limit: "0",
            current: amount,
            message: "Session expired"
        };
    }

    const amountBigInt = BigInt(amount);

    // 1. Check max transaction amount
    const maxTx = BigInt(session.maxTransactionAmount);
    if (amountBigInt > maxTx) {
        return {
            type: "perTransaction",
            limit: session.maxTransactionAmount,
            current: amount,
            message: `Transaction exceeds max amount of ${maxTx / 1000000n} APT`
        };
    }

    // 2. Check agent whitelist
    if (session.allowedAgentIds && !session.allowedAgentIds.includes(agentId)) {
        return {
            type: "daily",
            limit: "0",
            current: amount,
            message: `Agent ${agentId} not in whitelist`
        };
    }

    // 3. Check daily budget
    const dailyBudget = BigInt(session.remainingDailyBudget);
    if (amountBigInt > dailyBudget) {
        return {
            type: "daily",
            limit: session.remainingDailyBudget,
            current: amount,
            message: `Daily budget exceeded. Remaining: ${dailyBudget / 1000000n} APT`
        };
    }

    // 4. Check monthly budget
    const monthlyBudget = BigInt(session.remainingMonthlyBudget);
    if (amountBigInt > monthlyBudget) {
        return {
            type: "monthly",
            limit: session.remainingMonthlyBudget,
            current: amount,
            message: `Monthly budget exceeded. Remaining: ${monthlyBudget / 1000000n} APT`
        };
    }

    // 5. Check per-agent call limits
    const agentLimit = session.agentCallLimits[agentId];
    if (agentLimit) {
        const now = Date.now();
        const oneHourAgo = now - 60 * 60 * 1000;
        
        // Reset hour counter if needed
        if (!agentLimit.lastCallTime || agentLimit.lastCallTime < oneHourAgo) {
            agentLimit.currentCallsThisHour = 0;
        }

        if (agentLimit.currentCallsThisHour >= agentLimit.maxCallsPerHour) {
            return {
                type: "perAgent",
                limit: agentLimit.maxCallsPerHour,
                current: agentLimit.currentCallsThisHour,
                message: `Agent ${agentId} hourly call limit exceeded`
            };
        }

        if (agentLimit.currentCallsToday >= agentLimit.maxCallsPerDay) {
            return {
                type: "perAgent",
                limit: agentLimit.maxCallsPerDay,
                current: agentLimit.currentCallsToday,
                message: `Agent ${agentId} daily call limit exceeded`
            };
        }
    }

    // 6. Check concurrent tasks (simplified - count pending transactions)
    const transactions = transactionStore.get(sessionId) || [];
    const pendingCount = transactions.filter(t => t.status === 'pending').length;
    if (pendingCount >= session.maxConcurrentTasks) {
        return {
            type: "concurrent",
            limit: session.maxConcurrentTasks,
            current: pendingCount,
            message: `Too many concurrent tasks (${pendingCount}/${session.maxConcurrentTasks})`
        };
    }

    return null; // All checks passed
}

/**
 * Record a transaction and update budgets
 */
export function recordTransaction(
    sessionId: string,
    agentId: string,
    amount: string,
    taskType: string,
    status: 'pending' | 'completed' | 'failed',
    callingAgentId?: string
): TransactionRecord {
    const transaction: TransactionRecord = {
        id: `tx-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        sessionId,
        agentId,
        amount,
        timestamp: Date.now(),
        taskType,
        status,
        callingAgentId
    };

    // Add to transaction store
    if (!transactionStore.has(sessionId)) {
        transactionStore.set(sessionId, []);
    }
    transactionStore.get(sessionId)!.push(transaction);

    // Update budgets if completed
    if (status === 'completed') {
        const session = getSession(sessionId);
        if (session) {
            const amountBigInt = BigInt(amount);
            session.remainingDailyBudget = (BigInt(session.remainingDailyBudget) - amountBigInt).toString();
            session.remainingMonthlyBudget = (BigInt(session.remainingMonthlyBudget) - amountBigInt).toString();

            // Update per-agent limits
            if (!session.agentCallLimits[agentId]) {
                session.agentCallLimits[agentId] = {
                    maxCallsPerDay: 100,
                    maxCallsPerHour: 10,
                    currentCallsToday: 0,
                    currentCallsThisHour: 0
                };
            }
            session.agentCallLimits[agentId].currentCallsToday += 1;
            session.agentCallLimits[agentId].currentCallsThisHour += 1;
            session.agentCallLimits[agentId].lastCallTime = Date.now();
        }
    }

    return transaction;
}

/**
 * Update transaction with execution results
 */
export function updateTransaction(
    sessionId: string,
    transactionId: string,
    updates: Partial<TransactionRecord>
): TransactionRecord | null {
    const transactions = transactionStore.get(sessionId);
    if (!transactions) return null;

    const transaction = transactions.find(t => t.id === transactionId);
    if (!transaction) return null;

    Object.assign(transaction, updates);
    return transaction;
}

/**
 * Get budget status for a session
 */
export function getBudgetStatus(sessionId: string): BudgetStatus | null {
    const session = getSession(sessionId);
    if (!session) return null;

    const maxDaily = BigInt(session.maxDailySpend);
    const maxMonthly = BigInt(session.maxMonthlySpend);
    const remainingDaily = BigInt(session.remainingDailyBudget);
    const remainingMonthly = BigInt(session.remainingMonthlyBudget);

    const spentDaily = maxDaily - remainingDaily;
    const spentMonthly = maxMonthly - remainingMonthly;

    return {
        dailySpent: spentDaily.toString(),
        monthlySpent: spentMonthly.toString(),
        dailyRemaining: remainingDaily.toString(),
        monthlyRemaining: remainingMonthly.toString(),
        percentageUsedDaily: Number((spentDaily * 100n) / maxDaily),
        percentageUsedMonthly: Number((spentMonthly * 100n) / maxMonthly)
    };
}

/**
 * Update session configuration
 */
export function updateSessionConfig(
    sessionId: string,
    updates: Partial<SessionConfig>
): SessionConfig | null {
    const session = getSession(sessionId);
    if (!session) return null;

    Object.assign(session, {
        ...updates,
        id: session.id, // Don't allow changing ID
        userId: session.userId,
        createdAt: session.createdAt
    });

    return session;
}

/**
 * Pause a session
 */
export function pauseSession(sessionId: string, reason: string): SessionConfig | null {
    return updateSessionConfig(sessionId, {
        isPaused: true,
        pauseReason: reason
    });
}

/**
 * Resume a session
 */
export function resumeSession(sessionId: string): SessionConfig | null {
    return updateSessionConfig(sessionId, {
        isPaused: false,
        pauseReason: undefined
    });
}

/**
 * Get transaction history for a session
 */
export function getTransactionHistory(sessionId: string, limit = 50): TransactionRecord[] {
    const transactions = transactionStore.get(sessionId) || [];
    return transactions.slice(-limit);
}

/**
 * Clean up expired sessions
 */
export function cleanupExpiredSessions(): number {
    let cleaned = 0;
    const now = Date.now();

    for (const [id, session] of sessionStore) {
        if (session.expiresAt < now) {
            sessionStore.delete(id);
            transactionStore.delete(id);
            cleaned++;
        }
    }

    return cleaned;
}
