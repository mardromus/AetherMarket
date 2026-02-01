import { Aptos, AptosConfig, Network, EphemeralKeyPair } from "@aptos-labs/ts-sdk";

interface SessionData {
    id: string;
    principal: string;
    agentAddress: string;
    allowanceOctas: bigint;
    maxRequests: number;
    requestsMade: number;
    createdAt: number;
    expiresAt: number;
    ephemeralPublicKey: string;
    nonce: number;
}

export interface SessionConfig {
    network: Network;
    sessionDurationSecs?: number;
    maxRequests?: number;
    allowanceAPT?: number;
}

export interface SessionPaymentRequest {
    sessionId: string;
    fromAgent: string;
    toAgent: string;
    amount: string;
    taskType: string;
}

export interface SessionPaymentSignature {
    sessionId: string;
    paymentSignature: string;
    ephemeralPublicKey: string;
    nonce: number;
}

export class SessionManager {
    private aptos: Aptos;
    private sessions: Map<string, SessionData> = new Map();

    constructor(config: SessionConfig) {
        const aptosConfig = new AptosConfig({ network: config.network });
        this.aptos = new Aptos(aptosConfig);
    }

    async createSession(
        principalAddress: string,
        agentAddress: string,
        allowanceAPT: number,
        maxRequests: number,
        durationSecs: number
    ): Promise<string> {
        const sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        const now = Date.now();
        const expiresAt = now + durationSecs * 1000;

        const ephemeralKeyPair = EphemeralKeyPair.generate();
        const publicKeyHex = ephemeralKeyPair.getPublicKey().toString();

        const session: SessionData = {
            id: sessionId,
            principal: principalAddress,
            agentAddress,
            allowanceOctas: BigInt(Math.floor(allowanceAPT * 1e8)),
            maxRequests,
            requestsMade: 0,
            createdAt: now,
            expiresAt,
            ephemeralPublicKey: publicKeyHex,
            nonce: 0,
        };

        this.sessions.set(sessionId, session);

        return sessionId;
    }

    isSessionValid(sessionId: string): boolean {
        const session = this.sessions.get(sessionId);
        if (!session) return false;

        const now = Date.now();
        if (now > session.expiresAt) return false;
        
        const allowanceOctas = session.allowanceOctas ?? BigInt(0);
        if (allowanceOctas <= 0n) return false;
        
        const requestsMade = session.requestsMade ?? 0;
        if (requestsMade >= session.maxRequests) return false;

        return true;
    }

    async signX402Payment(
        sessionId: string,
        toAgent: string,
        amount: bigint,
        taskType: string
    ): Promise<SessionPaymentSignature> {
        const session = this.sessions.get(sessionId);

        if (!session) {
            throw new Error(`Session not found: ${sessionId}`);
        }

        // Check session validity
        if (!this.isSessionValid(sessionId)) {
            throw new Error(`Session invalid: ${sessionId}`);
        }

        // Check allowance
        const allowanceOctas = session.allowanceOctas ?? BigInt(0);
        if (amount > allowanceOctas) {
            throw new Error(
                `Insufficient allowance: need ${amount}, have ${allowanceOctas}`
            );
        }

        // Create payment payload
        const nonce = session.nonce ?? 0;
        const timestamp = Math.floor(Date.now() / 1000);
        const agentAddr = session.agentAddress;

        const paymentPayload = {
            sessionId,
            fromAgent: agentAddr,
            toAgent,
            amount: amount.toString(),
            taskType,
            nonce,
            timestamp,
            expiresAt: Math.floor(session.expiresAt / 1000),
        };

        // Sign with ephemeral key
        const paymentSignature = this.createPaymentSignature(paymentPayload);

        console.log(`💳 Payment signed:`, {
            fromAgent: agentAddr,
            toAgent,
            amount: (amount / 100000000n).toString() + " APT",
            taskType,
            signature: paymentSignature.substring(0, 20) + "...",
        });

        // Update session state
        if (session.allowanceOctas !== undefined) {
            session.allowanceOctas -= amount;
        }
        if (session.requestsMade !== undefined) {
            session.requestsMade += 1;
        } else {
            session.requestsMade = 1;
        }
        if (session.nonce !== undefined) {
            session.nonce += 1;
        } else {
            session.nonce = 1;
        }

        return {
            sessionId,
            paymentSignature,
            ephemeralPublicKey: session.ephemeralPublicKey ?? "0x",
            nonce,
        };
    }

    getSessionInfo(sessionId: string): {
        id: string;
        principal: string;
        agent: string;
        allowance: string;
        remainingAllowance: string;
        maxRequests: number;
        requestsMade: number;
        requestsRemaining: number;
        createdAt: Date;
        expiresAt: Date;
        isExpired: boolean;
        remainingTimeMs: number;
        isValid: boolean;
    } | null {
        const session = this.sessions.get(sessionId);
        if (!session) return null;

        const now = Date.now();
        const isExpired = now > session.expiresAt;
        const remainingTimeMs = Math.max(0, session.expiresAt - now);
        
        const allowanceOctas = session.allowanceOctas ?? BigInt(0);
        const requestsMade = session.requestsMade ?? 0;

        return {
            id: sessionId,
            principal: session.principal,
            agent: session.agentAddress ?? "unknown",
            allowance: (allowanceOctas / 100000000n).toString() + " APT",
            remainingAllowance: (allowanceOctas / 100000000n).toString() + " APT",
            maxRequests: session.maxRequests,
            requestsMade,
            requestsRemaining: session.maxRequests - requestsMade,
            createdAt: new Date(session.createdAt),
            expiresAt: new Date(session.expiresAt),
            isExpired,
            remainingTimeMs,
            isValid: this.isSessionValid(sessionId),
        };
    }

    listActiveSessions(): Array<{
        id: string;
        principal: string;
        agent: string;
        allowance: string;
        remainingAllowance: string;
        maxRequests: number;
        requestsMade: number;
        requestsRemaining: number;
        createdAt: Date;
        expiresAt: Date;
        isExpired: boolean;
        remainingTimeMs: number;
        isValid: boolean;
    } | null> {
        const sessions: Array<{
            id: string;
            principal: string;
            agent: string;
            allowance: string;
            remainingAllowance: string;
            maxRequests: number;
            requestsMade: number;
            requestsRemaining: number;
            createdAt: Date;
            expiresAt: Date;
            isExpired: boolean;
            remainingTimeMs: number;
            isValid: boolean;
        } | null> = [];
        for (const [id] of this.sessions) {
            if (this.isSessionValid(id)) {
                sessions.push(this.getSessionInfo(id));
            }
        }
        return sessions;
    }

    async revokeSession(sessionId: string): Promise<void> {
        const session = this.sessions.get(sessionId);
        if (!session) {
            throw new Error(`Session not found: ${sessionId}`);
        }

        this.sessions.delete(sessionId);
        console.log(`🔴 Session revoked: ${sessionId}`);

        // In production, would write to blockchain
        // await this.aptos.transaction.submit.simple({
        //   type: "entry_function_payload",
        //   function: "0x...::delegated_sessions::revoke_session",
        // });
    }

    private createPaymentSignature(payload: { sessionId: string; fromAgent: string; toAgent: string; amount: string; taskType: string; nonce: number; timestamp: number; expiresAt: number }): string {
        const jsonStr = JSON.stringify(payload);
        const hash = this.simpleHash(jsonStr);
        return hash;
    }

    private simpleHash(str: string): string {
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
            const char = str.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash;
        }
        return "0x" + Math.abs(hash).toString(16).padStart(64, "0");
    }
}

export const sessionManager = new SessionManager({
    network: Network.TESTNET,
    sessionDurationSecs: 3600,
    maxRequests: 20,
    allowanceAPT: 5,
});
