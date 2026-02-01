export interface AgentManifest {
    version: "1.0.0";
    name: string;
    description: string;
    author: { name: string; address: string };
    capabilities: AgentCapability[];
    payment: PaymentConfig;
    endpoints: AgentEndpoint[];
    verification: VerificationConfig;
}

export interface AgentCapability {
    tag: string;
    description: string;
    input_schema: JSONSchema;
    output_schema: JSONSchema;
    version?: string;
    sla?: { max_response_time_ms?: number; max_price_per_request?: number; uptime_guarantee?: number };
}

export interface PaymentConfig {
    protocol: "x402";
    currency: "APT";
    rate_per_request: string;
    settlement_address: string;
    supports_batching?: boolean;
    batch_discount?: number;
}

export interface AgentEndpoint {
    type: "http" | "websocket" | "mcp";
    url: string;
    authentication?: { type: "x402" | "jwt" | "none" };
}

export interface VerificationConfig {
    type: "aptos_keyless";
    principal: string;
}

export interface AgentCard {
    id: string;
    owner: string;
    agentAddress: string;
    name: string;
    description: string;
    capabilities: AgentCapability[];
    paymentEndpoint: string;
    paymentRate: string;
    settlementAddress: string;
    manifestUrl: string;
    verified: boolean;
    principalGoogleSub: string;
    createdAt: number;
    lastUpdated: number;
}

export interface JSONSchemaProperty {
    type?: string;
    pattern?: string;
    minimum?: number;
    maximum?: number;
}

export interface JSONSchema {
    type: string;
    properties?: Record<string, JSONSchemaProperty>;
    required?: string[];
    enum?: (string | number | boolean)[];
    items?: JSONSchema;
}

export interface DelegationSession {
    id: string;
    principal: string;
    agentAddress: string;
    allowanceAPT: number;
    allowanceOctas: bigint;
    maxRequests: number;
    requestsMade: number;
    createdAt: number;
    expiresAt: number;
    ephemeralPublicKey: string;
    nonce: number;
}

export interface SessionPaymentRequest {
    sessionId: string;
    fromAgent: string;
    toAgent: string;
    amount: string;
    taskType: string;
    nonce: number;
    timestamp: number;
    expiresAt: number;
}

export interface SessionPaymentSignature {
    sessionId: string;
    paymentSignature: string;
    ephemeralPublicKey: string;
    nonce: number;
}

export interface SessionTransaction {
    id: string;
    sessionId: string;
    fromAgent: string;
    toAgent: string;
    amount: string;
    taskType: string;
    timestamp: number;
    transactionHash: string;
    status: "pending" | "success" | "failed";
}

export interface DiscoveryQuery {
    capabilities?: string[];
    capability_any?: boolean;
    min_reputation?: number;
    min_availability?: number;
    max_price?: number;
    min_price?: number;
    intent?: string;
    limit?: number;
    offset?: number;
    sort_by?: "reputation" | "price" | "availability" | "speed";
    order?: "asc" | "desc";
}

export interface DiscoveryResult {
    agent: Agent;
    match_score: number;
    matched_capabilities: string[];
    estimated_response_time_ms: number;
}

export interface IntentAnalysis {
    capabilities_required: string[];
    confidence: number;
    keywords: string[];
}

export interface Agent {
    id: string;
    name: string;
    description: string;
    price: number;
    reputation: number;
    imageUrl: string;
    endpoint: string;
    category?: string;
    specs?: { architecture: string; tflops: string; vram: string; latency: string };
    isSwarm?: boolean;
    onChainData?: { registryId: string; ownerAddress: string; reputationScore: number; totalVolume: number; disputeRate: number };
}

export interface AgentReputation {
    agentId: string;
    agentAddress: string;
    totalTasks: number;
    successfulTasks: number;
    failedTasks: number;
    disputedTasks: number;
    stakedAmount: string;
    stakeLockedUntil: number;
    reputationScore: number;
    lastUpdated: number;
}

export interface TaskResult {
    id: string;
    agentId: string;
    taskType: string;
    resultHash: string;
    submissionTime: number;
    disputeDeadline: number;
    disputed: boolean;
    disputeResolution: string;
}

export interface Dispute {
    id: string;
    taskResultId: string;
    challengerAddress: string;
    reason: string;
    evidenceHash: string;
    createdAt: number;
    resolved: boolean;
    resolution: string;
}

export interface PaymentRequired {
    amount: string;
    recipient: string;
    expiresAt: number;
    requestId: string;
    description: string;
    metadata?: Record<string, string | number | boolean>;
}

export interface PaymentSignature {
    txnHash: string;
    signature: string;
    nonce: number;
    timestamp: number;
}

export interface PaymentResponse {
    transactionHash: string;
    blockHeight: number;
    gasFee: string;
    amount: string;
    settledAt: number;
    success: boolean;
}

export interface PaymentVerification {
    isValid: boolean;
    error?: string;
    transaction?: PaymentResponse;
}

export interface AgentTaskRequest {
    agentId: string;
    taskType: string;
    parameters: Record<string, string | number | boolean | object>;
    maxPrice?: string;
    requestId?: string;
}

export interface AgentTaskResponse {
    result: string | number | boolean | object;
    executionTime: number;
    agentId: string;
    taskType: string;
    metadata?: Record<string, string | number | boolean>;
    cost: string;
}

export type BazaarMessageType =
    | "heartbeat"
    | "subscribe"
    | "order"
    | "settlement"
    | "error"
    | "price_update";

export interface AgentHeartbeat {
    type: "heartbeat";
    agent_id: string;
    agent_address: string;
    capabilities: string[];
    price_apt: number;
    availability: number;
    queue_length: number;
    response_time_ms: number;
    reputation: number;
    timestamp: number;
}

export interface OrderRequest {
    type: "order";
    order_id: string;
    requester_agent: string;
    target_agent: string;
    capability: string;
    task_parameters: Record<string, string | number | boolean>;
    max_price_apt: number;
    timestamp: number;
}

export interface Settlement {
    type: "settlement";
    order_id: string;
    agent_a: string;
    agent_b: string;
    amount_apt: number;
    transaction_hash: string;
    status: "success" | "failed";
    timestamp: number;
}

export interface PriceUpdate {
    type: "price_update";
    agent_id: string;
    old_price: number;
    new_price: number;
    reason: string;
    timestamp: number;
}

export type BazaarMessage = AgentHeartbeat | OrderRequest | Settlement | PriceUpdate;

export interface KeylessAccount {
    address: string;
    publicKey: string;
    ephemeralKeyPair?: EphemeralKeyPair;
    pepper?: Uint8Array;
    jwtPayload?: GoogleJWTPayload;
}

export interface GoogleJWTPayload {
    sub: string;
    aud: string;
    iss: string;
    iat: number;
    exp: number;
    email?: string;
    email_verified?: boolean;
    name?: string;
}

export interface KeylessConfig {
    network: "testnet" | "mainnet";
    providerUrl?: string;
    pepperUrl?: string;
    sessionMaxRequests?: number;
    sessionDurationMs?: number;
}

export interface EphemeralKeyPair {
    publicKey: string;
    privateKey: string;
    expiryDateSecs: number;
}

export interface DelegationSession {
    id: string;
    principal: string;
    agentAddress: string;
    allowanceAPT: number;
    allowanceOctas: bigint;
    maxRequests: number;
    requestsMade: number;
    createdAt: number;
    expiresAt: number;
    ephemeralPublicKey: string;
    nonce: number;
}

export interface ApiResponse<T> {
    data?: T;
    error?: string;
    statusCode: number;
    timestamp: number;
}

export enum ReputationLevel {
    UNKNOWN = "UNKNOWN",
    LOW = "LOW",
    MEDIUM = "MEDIUM",
    HIGH = "HIGH",
    EXCELLENT = "EXCELLENT",
}

export enum TaskStatus {
    PENDING = "pending",
    EXECUTING = "executing",
    COMPLETED = "completed",
    FAILED = "failed",
    DISPUTED = "disputed",
}

export enum DisputeResolution {
    PENDING = "pending",
    UPHELD = "upheld",
    REJECTED = "rejected",
}

export function aptToOctas(apt: number): bigint {
    return BigInt(Math.floor(apt * 1e8));
}

export function octasToApt(octas: bigint): number {
    return Number(octas) / 1e8;
}

export function isSessionValid(session: DelegationSession): boolean {
    const now = Date.now();
    return (
        now <= session.expiresAt &&
        session.allowanceOctas > 0n &&
        session.requestsMade < session.maxRequests
    );
}


