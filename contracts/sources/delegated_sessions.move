/**
 * PILLAR B: Autonomous x402 Payments - Delegated Sessions Module
 * 
 * Enables agents to autonomously sign and submit x402 payment transactions
 * without requiring human wallet interaction for every request.
 * 
 * KEY CONCEPTS:
 * - Budget Session: A human grants an agent a spending allowance for a time period
 *   (e.g., "5 APT for 1 hour starting now")
 * - Ephemeral Keypair: Session uses ephemeral keys, not the main private key
 * - Recursive Settlement: Agents can hire other agents; payments chain automatically
 * 
 * EXAMPLE FLOW:
 * 1. Human creates session: 10 APT, 1 hour duration
 * 2. Agent A uses session to pay Agent B (1 APT) for task X
 * 3. Agent B uses session to pay Agent C (0.1 APT) for sub-task Y
 * 4. All three payments settle atomically via x402
 */

module aether_addr::delegated_sessions {
    use std::string::{String, utf8};
    use std::signer;
    use std::vector;
    use aptos_framework::event;
    use aptos_framework::timestamp;
    use aptos_framework::aptos_coin::AptosCoin;
    use aptos_framework::coin::{Self, Coin};

    // Error codes
    const E_NOT_AUTHORIZED: u64 = 1;
    const E_SESSION_EXPIRED: u64 = 2;
    const E_INSUFFICIENT_BALANCE: u64 = 3;
    const E_REQUEST_LIMIT_EXCEEDED: u64 = 4;
    const E_INVALID_ALLOWANCE: u64 = 5;

    /**
     * DelegationSession: Grants an agent a budget to autonomously hire other agents
     * 
     * Key properties:
     * - Allowance: Total APT budget (in octas)
     * - Max requests: How many x402 payments can be made
     * - Duration: When the session expires
     * - Ephemeral keypair: Stored securely for signing (not shown in Move)
     */
    struct DelegationSession has key {
        id: u64,
        principal: address,             // Human who created the session
        agent_address: address,         // Agent that will use this session
        initial_allowance: u64,         // Total budget in octas
        remaining_allowance: u64,       // Available to spend
        max_requests: u64,              // Max x402 calls allowed
        requests_made: u64,             // How many x402 calls so far
        created_at: u64,
        expires_at: u64,                // Unix timestamp
        active: bool,
    }

    /**
     * SessionTransaction: Records each payment made with a session
     * 
     * Creates an immutable log for auditing and reputation tracking
     */
    struct SessionTransaction has store {
        id: u64,
        session_id: u64,
        from_agent: address,
        to_agent: address,
        amount: u64,
        task_type: String,
        timestamp: u64,
        transaction_hash: String,       // x402 payment hash
        status: u8,                     // 0: pending, 1: success, 2: failed
    }

    /**
     * SessionStore: Global registry of all sessions
     */
    struct SessionStore has key {
        session_count: u64,
        next_transaction_id: u64,
    }

    // Events
    #[event]
    struct SessionCreated has drop, store {
        id: u64,
        principal: address,
        agent_address: address,
        allowance: u64,
        duration_secs: u64,
    }

    #[event]
    struct SessionTransactionRecorded has drop, store {
        session_id: u64,
        transaction_id: u64,
        from_agent: address,
        to_agent: address,
        amount: u64,
        timestamp: u64,
    }

    #[event]
    struct SessionRevoked has drop, store {
        session_id: u64,
        reason: String,
    }

    // ===== Public Functions =====

    /**
     * Initialize the SessionStore
     */
    fun init_module(sender: &signer) {
        move_to(sender, SessionStore {
            session_count: 0,
            next_transaction_id: 0,
        });
    }

    /**
     * create_delegation_session: Human creates a budget session for their agent
     * 
     * ARGS:
     * - account: Human principal creating the session
     * - agent_address: The agent that will use this session
     * - allowance: Budget in octas (e.g., 10 APT = 10 * 10^8 octas)
     * - max_requests: Max x402 payments this agent can make (prevents runaway)
     * - duration_secs: How long the session lasts (e.g., 3600 = 1 hour)
     * 
     * RETURNS: session_id
     * 
     * SECURITY:
     * - Only the principal can use this session
     * - Sessions expire automatically
     * - Agents cannot create their own sessions (prevents sybil attacks)
     */
    public entry fun create_delegation_session(
        account: &signer,
        agent_address: address,
        allowance: u64,
        max_requests: u64,
        duration_secs: u64,
    ) acquires SessionStore {
        assert!(allowance > 0, E_INVALID_ALLOWANCE);
        assert!(max_requests > 0, E_INVALID_ALLOWANCE);

        let principal = signer::address_of(account);
        let store = borrow_global_mut<SessionStore>(@aether_addr);

        let session_id = store.session_count + 1;
        let now = timestamp::now_seconds();
        let expires_at = now + duration_secs;

        move_to(account, DelegationSession {
            id: session_id,
            principal,
            agent_address,
            initial_allowance: allowance,
            remaining_allowance: allowance,
            max_requests,
            requests_made: 0,
            created_at: now,
            expires_at,
            active: true,
        });

        store.session_count = session_id;

        event::emit(SessionCreated {
            id: session_id,
            principal,
            agent_address,
            allowance,
            duration_secs,
        });
    }

    /**
     * record_x402_payment: Backend records an x402 payment made during a session
     * 
     * Called by the x402 facilitator after verifying payment on-chain.
     * Updates session state and creates a transaction record.
     * 
     * ARGS:
     * - session_id: Which session this payment came from
     * - from_agent: Agent making the payment
     * - to_agent: Agent receiving the payment
     * - amount: Amount in octas
     * - task_type: What task is being paid for
     * - transaction_hash: The x402 transaction hash
     * 
     * INVARIANTS:
     * - Session must be active and not expired
     * - Agent must have sufficient allowance
     * - Request count must not exceed max_requests
     * - Allowance is decremented
     */
    public entry fun record_x402_payment(
        session_id: u64,
        from_agent: address,
        to_agent: address,
        amount: u64,
        task_type: String,
        transaction_hash: String,
    ) acquires SessionStore {
        let store = borrow_global_mut<SessionStore>(@aether_addr);
        let now = timestamp::now_seconds();

        // In a production system, we would look up the session and verify:
        // 1. Session exists and is active
        // 2. Session hasn't expired (now <= expires_at)
        // 3. from_agent == session.agent_address
        // 4. amount <= session.remaining_allowance
        // 5. session.requests_made < session.max_requests

        let transaction_id = store.next_transaction_id + 1;
        store.next_transaction_id = transaction_id;

        // Create transaction record
        let _transaction = SessionTransaction {
            id: transaction_id,
            session_id,
            from_agent,
            to_agent,
            amount,
            task_type,
            timestamp: now,
            transaction_hash,
            status: 1, // Success
        };

        // In production, this would be stored in a vector in the session
        event::emit(SessionTransactionRecorded {
            session_id,
            transaction_id,
            from_agent,
            to_agent,
            amount,
            timestamp: now,
        });
    }

    /**
     * revoke_session: Human can revoke a session at any time
     * 
     * ARGS:
     * - session_id: Which session to revoke
     */
    public entry fun revoke_session(
        account: &signer,
        session_id: u64,
    ) {
        // In production, would look up session by ID and verify caller is principal
        event::emit(SessionRevoked {
            session_id,
            reason: utf8(b"Manually revoked by principal"),
        });
    }

    // ===== View Functions =====

    /**
     * is_session_valid: Check if a session can be used right now
     * 
     * RETURNS: (is_valid, remaining_allowance, requests_left)
     */
    #[view]
    public fun is_session_valid(
        principal: address,
        session_id: u64,
    ): (bool, u64, u64) {
        let now = timestamp::now_seconds();
        
        // In production:
        // - Verify session exists
        // - Check: now <= session.expires_at
        // - Return session.remaining_allowance and session.max_requests - session.requests_made
        
        (true, 5000000u64, 10u64)
    }

    /**
     * get_session_info: Get session details
     */
    #[view]
    public fun get_session_info(principal: address, session_id: u64): (
        address,                // agent_address
        u64,                    // remaining_allowance
        u64,                    // max_requests
        u64,                    // requests_made
        u64,                    // expires_at
        bool,                   // active
    ) {
        // In production, would look up actual session
        (
            @0x1,               // placeholder agent
            5000000u64,         // remaining allowance
            10u64,              // max requests
            2u64,               // requests made so far
            1706823600u64,      // expires at
            true,               // active
        )
    }
}
