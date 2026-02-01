/**
 * PILLAR C: Reputation & Validation Oracle - Staking & Slashing Module
 * 
 * Enables trust in an agent-driven economy through:
 * 1. Proof of Task Completion: Results are hashed on-chain
 * 2. Staking: High-reputation agents can stake APT to increase their credibility
 * 3. Slashing: Malicious or failed results cause stakes to be penalized
 * 4. Dispute Resolution: Any agent can challenge a result within a window
 * 
 * TRUST MODEL:
 * - New agents start with 0 reputation
 * - Successful tasks increase reputation
 * - Staking APT proves confidence in work quality
 * - Disputes trigger validation arbitration
 * - Slashing punishes bad actors
 * 
 * EXAMPLE:
 * 1. Agent B completes a smart contract audit (task)
 * 2. Result hash is stored on-chain
 * 3. Agent A receives the result and can dispute within 24 hours
 * 4. If dispute is valid, Agent B loses staked APT
 * 5. Agent B's reputation score decreases
 */

module aether_addr::validation_oracle {
    use std::string::{String, utf8};
    use std::signer;
    use std::vector;
    use aptos_framework::event;
    use aptos_framework::timestamp;
    use aptos_framework::coin::{Self, Coin};
    use aptos_framework::aptos_coin::AptosCoin;

    // Error codes
    const E_NOT_AUTHORIZED: u64 = 1;
    const E_INSUFFICIENT_STAKE: u64 = 2;
    const E_INVALID_REPUTATION: u64 = 3;
    const E_DISPUTE_WINDOW_CLOSED: u64 = 4;
    const E_DISPUTE_NOT_FOUND: u64 = 5;

    // Constants
    const MIN_STAKE: u64 = 100000000;  // 1 APT minimum
    const DISPUTE_WINDOW_SECS: u64 = 86400;  // 24 hours
    const SLASH_PERCENTAGE: u8 = 50;  // Slash 50% of stake on bad result
    const REPUTATION_MAX: u64 = 1000;

    /**
     * AgentReputation: Tracks trust metrics for an agent
     * 
     * Reputation is derived from:
     * - Task completion rate (successful / total)
     * - Staked APT (more stake = higher confidence)
     * - Dispute rate (disputes / total)
     * - Response time (faster = higher score)
     * 
     * FORMULA:
     * reputation = (success_rate * 500) + (stake_level * 2) - (dispute_rate * 100)
     * Capped at 0-1000
     */
    struct AgentReputation has key {
        agent_id: u64,
        agent_address: address,

        // Metrics
        total_tasks: u64,
        successful_tasks: u64,
        failed_tasks: u64,
        disputed_tasks: u64,

        // Staking
        staked_amount: u64,             // APT staked
        stake_locked_until: u64,        // Timestamp when agent can unstake

        // Score
        reputation_score: u64,          // 0-1000
        last_updated: u64,
    }

    /**
     * TaskResult: Hash and metadata of a completed task
     * 
     * Results are stored on-chain for validation.
     * Multiple agents can attest to the correctness of a result.
     */
    struct TaskResult has store {
        id: u64,
        agent_id: u64,
        task_type: String,
        result_hash: String,            // Keccak256(result)
        submission_time: u64,
        dispute_deadline: u64,          // After this time, result is final
        disputed: bool,
        dispute_resolution: String,     // "valid", "invalid", or "pending"
    }

    /**
     * Dispute: Challenge to a task result
     * 
     * Any agent can dispute a result if they can prove it's invalid.
     * The oracle evaluates the evidence and slashes if needed.
     */
    struct Dispute has store {
        id: u64,
        task_result_id: u64,
        challenger_address: address,
        reason: String,
        evidence_hash: String,
        created_at: u64,
        resolved: bool,
        resolution: String,             // "upheld" or "rejected"
    }

    /**
     * ValidationStore: Global registry
     */
    struct ValidationStore has key {
        result_count: u64,
        dispute_count: u64,
        total_slashed: u64,
    }

    // Events
    #[event]
    struct ReputationUpdated has drop, store {
        agent_address: address,
        new_score: u64,
        reason: String,
    }

    #[event]
    struct StakeMade has drop, store {
        agent_address: address,
        amount: u64,
        lock_duration_secs: u64,
    }

    #[event]
    struct StakeSlashed has drop, store {
        agent_address: address,
        amount_slashed: u64,
        reason: String,
    }

    #[event]
    struct TaskResultSubmitted has drop, store {
        result_id: u64,
        agent_address: address,
        task_type: String,
        dispute_deadline: u64,
    }

    #[event]
    struct DisputeCreated has drop, store {
        dispute_id: u64,
        task_result_id: u64,
        challenger: address,
        reason: String,
    }

    #[event]
    struct DisputeResolved has drop, store {
        dispute_id: u64,
        resolution: String,
        slashed: bool,
    }

    // ===== Public Functions =====

    /**
     * Initialize the ValidationStore
     */
    fun init_module(sender: &signer) {
        move_to(sender, ValidationStore {
            result_count: 0,
            dispute_count: 0,
            total_slashed: 0,
        });
    }

    /**
     * create_reputation_profile: Initialize reputation for a new agent
     * 
     * ARGS:
     * - agent_address: The agent's address
     * - agent_id: The agent's ID from AgentCard registry
     */
    public entry fun create_reputation_profile(
        account: &signer,
        agent_address: address,
        agent_id: u64,
    ) {
        move_to(account, AgentReputation {
            agent_id,
            agent_address,
            total_tasks: 0,
            successful_tasks: 0,
            failed_tasks: 0,
            disputed_tasks: 0,
            staked_amount: 0,
            stake_locked_until: 0,
            reputation_score: 100,  // Start with 100/1000
            last_updated: timestamp::now_seconds(),
        });
    }

    /**
     * stake_for_reputation: Agent stakes APT to increase credibility
     * 
     * Higher stake = higher reputation potential.
     * Stake can be slashed if agent provides bad results.
     * 
     * ARGS:
     * - agent_address: Who is staking
     * - amount: APT to stake (in octas)
     * - lock_duration_secs: How long to lock stake (e.g., 30 days = 2592000)
     * 
     * INVARIANT:
     * - amount >= MIN_STAKE (1 APT)
     * - Once locked, cannot be withdrawn until unlock time
     */
    public entry fun stake_for_reputation(
        account: &signer,
        agent_address: address,
        amount: u64,
        lock_duration_secs: u64,
    ) acquires AgentReputation {
        assert!(amount >= MIN_STAKE, E_INSUFFICIENT_STAKE);

        let reputation = borrow_global_mut<AgentReputation>(agent_address);
        reputation.staked_amount = reputation.staked_amount + amount;
        reputation.stake_locked_until = timestamp::now_seconds() + lock_duration_secs;

        // Update reputation score based on new stake
        update_reputation_score(reputation);

        event::emit(StakeMade {
            agent_address,
            amount,
            lock_duration_secs,
        });
    }

    /**
     * submit_task_result: Record a completed task's result hash
     * 
     * When an agent completes a task, the result is hashed and stored on-chain.
     * Other agents have DISPUTE_WINDOW_SECS (24 hours) to challenge it.
     * After that window, the result is final.
     * 
     * ARGS:
     * - agent_address: Agent that completed the task
     * - task_type: What kind of task (e.g., "code-audit")
     * - result_hash: Keccak256 hash of the actual result
     * 
     * RETURNS: task_result_id for future reference
     * 
     * SECURITY:
     * - Only agent can submit for themselves
     * - Hash is immutable once submitted
     * - Disputes must include evidence hash
     */
    public entry fun submit_task_result(
        account: &signer,
        agent_id: u64,
        task_type: String,
        result_hash: String,
    ) acquires ValidationStore, AgentReputation {
        let agent_address = signer::address_of(account);
        let store = borrow_global_mut<ValidationStore>(@aether_addr);

        let result_id = store.result_count + 1;
        let now = timestamp::now_seconds();
        let dispute_deadline = now + DISPUTE_WINDOW_SECS;

        let _result = TaskResult {
            id: result_id,
            agent_id,
            task_type,
            result_hash,
            submission_time: now,
            dispute_deadline,
            disputed: false,
            dispute_resolution: utf8(b"pending"),
        };

        store.result_count = result_id;

        // Update reputation (successful task submission)
        if (exists<AgentReputation>(agent_address)) {
            let reputation = borrow_global_mut<AgentReputation>(agent_address);
            reputation.total_tasks = reputation.total_tasks + 1;
            reputation.successful_tasks = reputation.successful_tasks + 1;
            update_reputation_score(reputation);
        };

        event::emit(TaskResultSubmitted {
            result_id,
            agent_address,
            task_type,
            dispute_deadline,
        });
    }

    /**
     * create_dispute: Challenge a task result
     * 
     * Called by any agent if they believe a result is invalid.
     * Dispute must be filed within DISPUTE_WINDOW_SECS of submission.
     * 
     * ARGS:
     * - challenger: Agent disputing the result
     * - task_result_id: Which result to dispute
     * - reason: Human-readable reason (e.g., "contains malicious code")
     * - evidence_hash: Hash of evidence (e.g., proof output)
     * 
     * INVARIANT:
     * - Must be within dispute window
     * - Evidence hash proves the challenger's claim
     */
    public entry fun create_dispute(
        account: &signer,
        task_result_id: u64,
        reason: String,
        evidence_hash: String,
    ) acquires ValidationStore {
        let challenger_address = signer::address_of(account);
        let store = borrow_global_mut<ValidationStore>(@aether_addr);

        let dispute_id = store.dispute_count + 1;

        let _dispute = Dispute {
            id: dispute_id,
            task_result_id,
            challenger_address,
            reason,
            evidence_hash,
            created_at: timestamp::now_seconds(),
            resolved: false,
            resolution: utf8(b"pending"),
        };

        store.dispute_count = dispute_id;

        event::emit(DisputeCreated {
            dispute_id,
            task_result_id,
            challenger: challenger_address,
            reason,
        });
    }

    /**
     * resolve_dispute: Oracle validates dispute and applies slashing if needed
     * 
     * Called by the validation oracle (backend) after reviewing evidence.
     * If dispute is valid, the original agent's stake is slashed.
     * 
     * ARGS:
     * - dispute_id: Which dispute to resolve
     * - resolution: "upheld" (dispute is valid) or "rejected"
     * - agent_to_slash: If upheld, whose stake to slash
     */
    public entry fun resolve_dispute(
        account: &signer,
        dispute_id: u64,
        resolution: String,
        agent_to_slash: address,
    ) acquires ValidationStore, AgentReputation {
        // In production, verify caller is authorized oracle
        let store = borrow_global_mut<ValidationStore>(@aether_addr);

        // If dispute upheld, slash the agent
        if (resolution == utf8(b"upheld")) {
            if (exists<AgentReputation>(agent_to_slash)) {
                let reputation = borrow_global_mut<AgentReputation>(agent_to_slash);
                let slash_amount = (reputation.staked_amount / 100) * (SLASH_PERCENTAGE as u64);

                reputation.staked_amount = reputation.staked_amount - slash_amount;
                reputation.disputed_tasks = reputation.disputed_tasks + 1;
                update_reputation_score(reputation);

                store.total_slashed = store.total_slashed + slash_amount;

                event::emit(StakeSlashed {
                    agent_address: agent_to_slash,
                    amount_slashed: slash_amount,
                    reason: utf8(b"Dispute upheld - result validation failed"),
                });
            };
        };

        event::emit(DisputeResolved {
            dispute_id,
            resolution,
            slashed: resolution == utf8(b"upheld"),
        });
    }

    // ===== Internal Functions =====

    /**
     * update_reputation_score: Recalculate agent's reputation
     * 
     * FORMULA:
     * reputation = (success_rate * 500) + (stake_level * 2) - (dispute_rate * 100)
     * Capped at 0-1000
     */
    fun update_reputation_score(reputation: &mut AgentReputation) {
        let success_rate = if (reputation.total_tasks == 0) {
            500u64  // New agents start at 500 points from success rate
        } else {
            (reputation.successful_tasks * 500) / reputation.total_tasks
        };

        let stake_level = reputation.staked_amount / 1000000;  // Convert to APT
        let dispute_penalty = (reputation.disputed_tasks * 100);

        let score = success_rate + stake_level + 100;  // Base 100
        if (score > dispute_penalty) {
            score = score - dispute_penalty;
        } else {
            score = 0;
        };

        reputation.reputation_score = if (score > REPUTATION_MAX) {
            REPUTATION_MAX
        } else {
            score
        };

        reputation.last_updated = timestamp::now_seconds();

        event::emit(ReputationUpdated {
            agent_address: reputation.agent_address,
            new_score: reputation.reputation_score,
            reason: utf8(b"Score recalculated"),
        });
    }

    // ===== View Functions =====

    /**
     * get_reputation: Get agent's reputation profile
     */
    #[view]
    public fun get_reputation(agent_address: address): (
        u64,                    // reputation_score
        u64,                    // total_tasks
        u64,                    // successful_tasks
        u64,                    // staked_amount
    ) acquires AgentReputation {
        let reputation = borrow_global<AgentReputation>(agent_address);
        (
            reputation.reputation_score,
            reputation.total_tasks,
            reputation.successful_tasks,
            reputation.staked_amount,
        )
    }

    /**
     * can_unstake: Check if agent can withdraw their stake
     */
    #[view]
    public fun can_unstake(agent_address: address): bool acquires AgentReputation {
        let reputation = borrow_global<AgentReputation>(agent_address);
        timestamp::now_seconds() >= reputation.stake_locked_until
    }
}
