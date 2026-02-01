/**
 * Facilitator Bazaar - WebSocket Real-time Agent Marketplace
 * 
 * A real-time marketplace where:
 * - Agents broadcast their availability and current pricing
 * - Agents subscribe to monitor other agents
 * - Payment orders are settled with sub-second latency
 * - Supply and demand drive dynamic pricing
 * 
 * ARCHITECTURE:
 * - Single WebSocket server
 * - Agents connect and send heartbeats
 * - Price updates broadcast to all subscribers
 * - Orders are matched and settled on-chain
 * 
 * EXAMPLE FLOW:
 * 1. Agent NEURAL-ALPHA connects and announces: "Available, 0.05 APT/request"
 * 2. Agent QUANTUM-SAGE subscribes: "Interested in NEURAL-ALPHA"
 * 3. QUANTUM-SAGE sends order: "Execute code-audit, pay 0.05 APT"
 * 4. Bazaar matches order to NEURAL-ALPHA
 * 5. Payment settled via x402
 * 6. Both agents updated with transaction
 */

import { WebSocketServer } from "ws";
import type { WebSocket } from "ws";
import type { IncomingMessage } from "http";
import { EventEmitter } from "events";

// Message types for bazaar protocol
export type BazaarMessageType =
    | "heartbeat"        // Agent online + pricing
    | "subscribe"        // Request updates about agent
    | "order"            // Request task from agent
    | "settlement"       // Notify of completed transaction
    | "error"            // Error response
    | "price_update";    // Price changed

export interface AgentHeartbeat {
    type: "heartbeat";
    agent_id: string;
    agent_address: string;
    capabilities: string[];
    price_apt: number;              // Current price per request
    availability: number;           // 0-100 % available
    queue_length: number;          // How many pending requests
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

export interface SubscribeMessage {
    type: "subscribe";
    agent_id: string;
    target_agents: string[];
}

export type BazaarMessage = AgentHeartbeat | SubscribeMessage | OrderRequest | Settlement | PriceUpdate;

/**
 * FacilitatorBazaar: WebSocket server for real-time agent marketplace
 */
export class FacilitatorBazaar extends EventEmitter {
    private wss: WebSocketServer;
    private agents: Map<string, AgentSession> = new Map();
    private orders: Map<string, OrderRequest> = new Map();
    private subscriptions: Map<string, Set<WebSocket>> = new Map();

    constructor(port: number = 3001) {
        super();

        this.wss = new WebSocketServer({ port });
        this.setupServer();

        console.log(`🏪 Facilitator Bazaar listening on ws://localhost:${port}`);
    }

    private setupServer() {
        this.wss.on("connection", (ws: WebSocket, req: IncomingMessage) => {
            const clientIp = req.socket.remoteAddress;
            console.log(`📡 New connection from ${clientIp}`);

            // Track this connection
            const clientId = this.generateClientId();

            ws.on("message", async (data: Buffer) => {
                try {
                    const message = JSON.parse(data.toString()) as BazaarMessage;
                    await this.handleMessage(ws, message, clientId);
                } catch (error) {
                    console.error("Message parsing error:", error);
                    ws.send(
                        JSON.stringify({
                            type: "error",
                            message: "Invalid message format",
                        })
                    );
                }
            });

            ws.on("close", () => {
                this.handleClientDisconnect(clientId);
            });

            ws.on("error", (error: Error) => {
                console.error("WebSocket error:", error);
            });
        });
    }

    /**
     * handleMessage: Process incoming bazaar message
     */
    private async handleMessage(
        ws: WebSocket,
        message: BazaarMessage,
        clientId: string
    ) {
        switch (message.type) {
            case "heartbeat":
                await this.handleHeartbeat(ws, message, clientId);
                break;

            case "subscribe":
                this.handleSubscribe(ws, message);
                break;

            case "order":
                await this.handleOrder(ws, message);
                break;

            case "settlement":
                await this.handleSettlement(ws, message);
                break;

            default:
                console.warn(`Unknown message type: ${(message as { type: string }).type}`);
        }
    }

    /**
     * handleHeartbeat: Agent announces its availability
     * 
     * When an agent connects or updates status:
     * - Register/update agent in registry
     * - Broadcast availability to subscribers
     * - Check for pending orders
     * 
     * EXAMPLE MESSAGE:
     * {
     *   "type": "heartbeat",
     *   "agent_id": "neural-alpha",
     *   "agent_address": "0x1234...",
     *   "capabilities": ["image-generation", "vision-analysis"],
     *   "price_apt": 0.05,
     *   "availability": 95,
     *   "queue_length": 3,
     *   "response_time_ms": 120,
     *   "reputation": 950,
     *   "timestamp": 1706823456000
     * }
     */
    private async handleHeartbeat(
        ws: WebSocket,
        heartbeat: AgentHeartbeat,
        clientId: string
    ) {
        const { agent_id, price_apt } = heartbeat;

        // Check if price changed (dynamic pricing)
        const existingAgent = this.agents.get(agent_id);
        const priceChanged = existingAgent && existingAgent.heartbeat.price_apt !== price_apt;

        // Store agent session
        this.agents.set(agent_id, {
            clientId,
            ws,
            heartbeat,
            connectedAt: Date.now(),
        });

        console.log(`💚 Agent online: ${agent_id} (${price_apt} APT/req, ${heartbeat.availability}% available)`);

        // Broadcast heartbeat to subscribers
        const subscribers = this.subscriptions.get(agent_id) || new Set();
        subscribers.forEach((subscriberWs) => {
            subscriberWs.send(
                JSON.stringify({
                    type: "agent_update",
                    agent_id,
                    status: "online",
                    price: price_apt,
                    availability: heartbeat.availability,
                })
            );
        });

        // If price changed, notify all subscribers
        if (priceChanged) {
            this.broadcastPriceUpdate(
                agent_id,
                existingAgent!.heartbeat.price_apt,
                price_apt,
                "Dynamic pricing adjustment"
            );
        }

        // Check for pending orders for this agent
        await this.matchOrdersForAgent(agent_id);

        // Send acknowledgment
        ws.send(
            JSON.stringify({
                type: "heartbeat_ack",
                message: `Agent ${agent_id} registered`,
                agent_count: this.agents.size,
                pending_orders: this.orders.size,
            })
        );
    }

    /**
     * handleSubscribe: Agent wants to monitor another agent
     * 
     * EXAMPLE MESSAGE:
     * {
     *   "type": "subscribe",
     *   "agent_id": "quantum-sage",
     *   "target_agents": ["neural-alpha", "sentinel-auditor"]
     * }
     */
    private handleSubscribe(ws: WebSocket, message: { agent_id: string; target_agents: string[] }) {
        const { agent_id, target_agents } = message;

        console.log(
            `👁️  Agent ${agent_id} subscribing to: ${target_agents.join(", ")}`
        );

        // Register subscriptions
        for (const targetAgent of target_agents) {
            if (!this.subscriptions.has(targetAgent)) {
                this.subscriptions.set(targetAgent, new Set());
            }
            this.subscriptions.get(targetAgent)!.add(ws);

            // Send current status of target agent
            const agent = this.agents.get(targetAgent);
            if (agent) {
                ws.send(
                    JSON.stringify({
                        type: "agent_status",
                        agent_id: targetAgent,
                        status: "online",
                        price: agent.heartbeat.price_apt,
                        availability: agent.heartbeat.availability,
                        reputation: agent.heartbeat.reputation,
                    })
                );
            } else {
                ws.send(
                    JSON.stringify({
                        type: "agent_status",
                        agent_id: targetAgent,
                        status: "offline",
                    })
                );
            }
        }
    }

    /**
     * handleOrder: Agent submits task order to another agent
     * 
     * FLOW:
     * 1. Order received from requester
     * 2. Check if target agent is online
     * 3. If yes: route to agent for acceptance
     * 4. If no: queue order for when agent comes online
     * 5. Agent accepts/rejects within timeout
     * 6. If accepted: trigger x402 payment
     * 
     * EXAMPLE MESSAGE:
     * {
     *   "type": "order",
     *   "order_id": "order_xyz123",
     *   "requester_agent": "quantum-sage",
     *   "target_agent": "neural-alpha",
     *   "capability": "image-generation",
     *   "task_parameters": {
     *     "prompt": "A beautiful landscape with mountains"
     *   },
     *   "max_price_apt": 0.1,
     *   "timestamp": 1706823456000
     * }
     */
    private async handleOrder(
        ws: WebSocket,
        message: OrderRequest
    ) {
        const { order_id, requester_agent, target_agent, max_price_apt } = message;

        console.log(
            `📦 Order created: ${requester_agent} → ${target_agent} (max ${max_price_apt} APT)`
        );

        // Check if target agent is online
        const targetAgentSession = this.agents.get(target_agent);

        if (!targetAgentSession) {
            // Queue order for later
            this.orders.set(order_id, message);
            ws.send(
                JSON.stringify({
                    type: "order_queued",
                    order_id,
                    reason: `Agent ${target_agent} is offline. Order will be routed when agent comes online.`,
                })
            );
            return;
        }

        // Check price
        if (targetAgentSession.heartbeat.price_apt > max_price_apt) {
            ws.send(
                JSON.stringify({
                    type: "order_rejected",
                    order_id,
                    reason: `Price mismatch: agent asking ${targetAgentSession.heartbeat.price_apt} APT, max allowed ${max_price_apt} APT`,
                })
            );
            return;
        }

        // Route order to target agent
        this.orders.set(order_id, message);
        targetAgentSession.ws.send(
            JSON.stringify({
                type: "incoming_order",
                order_id,
                requester: requester_agent,
                capability: message.capability,
                price: targetAgentSession.heartbeat.price_apt,
                timeout_ms: 30000, // Agent has 30 seconds to respond
            })
        );

        // Send confirmation to requester
        ws.send(
            JSON.stringify({
                type: "order_routed",
                order_id,
                target_agent,
                status: "waiting_for_agent_response",
                timeout_ms: 30000,
            })
        );
    }

    /**
     * handleSettlement: Record completed transaction
     * 
     * Called after x402 payment succeeds on-chain.
     * Updates agent stats and broadcasts settlement to both parties.
     * 
     * EXAMPLE MESSAGE:
     * {
     *   "type": "settlement",
     *   "order_id": "order_xyz123",
     *   "agent_a": "quantum-sage",
     *   "agent_b": "neural-alpha",
     *   "amount_apt": 0.05,
     *   "transaction_hash": "0x1234...",
     *   "status": "success",
     *   "timestamp": 1706823456000
     * }
     */
    private async handleSettlement(
        ws: WebSocket,
        settlement: Settlement
    ) {
        const { order_id, agent_a, agent_b, amount_apt, status } = settlement;

        console.log(
            `✅ Settlement: ${agent_a} → ${agent_b} (${amount_apt} APT) [${status}]`
        );

        // Remove order from pending
        this.orders.delete(order_id);

        // Update agent stats
        this.updateAgentStats(agent_a, { ordered: 1, ordered_volume: amount_apt });
        this.updateAgentStats(agent_b, { received: 1, received_volume: amount_apt });

        // Notify both agents
        const agentASession = this.agents.get(agent_a);
        const agentBSession = this.agents.get(agent_b);

        if (agentASession) {
            agentASession.ws.send(
                JSON.stringify({
                    type: "order_completed",
                    order_id,
                    status,
                    transaction_hash: settlement.transaction_hash,
                })
            );
        }

        if (agentBSession) {
            agentBSession.ws.send(
                JSON.stringify({
                    type: "payment_received",
                    order_id,
                    from: agent_a,
                    amount: amount_apt,
                    transaction_hash: settlement.transaction_hash,
                })
            );
        }

        // Emit event for monitoring
        this.emit("settlement", settlement);
    }

    // ===== Helper Methods =====

    private handleClientDisconnect(clientId: string) {
        // Find and remove agent
        let disconnectedAgent = "";
        for (const [agentId, session] of this.agents) {
            if (session.clientId === clientId) {
                this.agents.delete(agentId);
                disconnectedAgent = agentId;
                break;
            }
        }

        if (disconnectedAgent) {
            console.log(`🔴 Agent disconnected: ${disconnectedAgent}`);
            // Broadcast offline status to subscribers
            const subscribers = this.subscriptions.get(disconnectedAgent);
            if (subscribers) {
                subscribers.forEach((ws) => {
                    ws.send(
                        JSON.stringify({
                            type: "agent_update",
                            agent_id: disconnectedAgent,
                            status: "offline",
                        })
                    );
                });
            }
        }
    }

    private generateClientId(): string {
        return `client_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    private async matchOrdersForAgent(agentId: string) {
        // Find pending orders for this agent
        const pendingOrders: OrderRequest[] = [];
        for (const [, order] of this.orders) {
            if (order.target_agent === agentId) {
                pendingOrders.push(order);
            }
        }

        console.log(
            `🔄 Matching ${pendingOrders.length} pending orders to ${agentId}`
        );

        // Route pending orders to agent
        const agentSession = this.agents.get(agentId);
        if (agentSession) {
            for (const order of pendingOrders) {
                agentSession.ws.send(
                    JSON.stringify({
                        type: "incoming_order",
                        order_id: order.order_id,
                        requester: order.requester_agent,
                        capability: order.capability,
                        timeout_ms: 30000,
                    })
                );
            }
        }
    }

    private broadcastPriceUpdate(
        agentId: string,
        oldPrice: number,
        newPrice: number,
        reason: string
    ) {
        const subscribers = this.subscriptions.get(agentId) || new Set();
        const update: PriceUpdate = {
            type: "price_update",
            agent_id: agentId,
            old_price: oldPrice,
            new_price: newPrice,
            reason,
            timestamp: Date.now(),
        };

        subscribers.forEach((ws) => {
            ws.send(JSON.stringify(update));
        });
    }

    private updateAgentStats(
        agentId: string,
        stats: Record<string, number>
    ) {
        const agent = this.agents.get(agentId);
        if (agent) {
            // Update heartbeat with new stats
            Object.assign(agent.heartbeat, stats);
        }
    }

    /**
     * getMarketStats: Get overall marketplace statistics
     */
    public getMarketStats() {
        return {
            active_agents: this.agents.size,
            pending_orders: this.orders.size,
            subscriptions: this.subscriptions.size,
            avg_price: this.calculateAvgPrice(),
            total_orders_settled: 0, // Would track this
        };
    }

    private calculateAvgPrice(): number {
        if (this.agents.size === 0) return 0;
        let total = 0;
        for (const session of this.agents.values()) {
            total += session.heartbeat.price_apt;
        }
        return total / this.agents.size;
    }

    /**
     * close: Shutdown the bazaar
     */
    public close() {
        this.wss.close();
        console.log("🏪 Facilitator Bazaar closed");
    }
}

// Internal session tracking
interface AgentSession {
    clientId: string;
    ws: WebSocket;
    heartbeat: AgentHeartbeat;
    connectedAt: number;
}

/**
 * Export singleton bazaar
 */
export const facilitatorBazaar = new FacilitatorBazaar(3001);
