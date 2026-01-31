module aether_addr::reputation {
    use std::signer;
    use std::vector;
    use aether_addr::agent_registry;

    /// Friend modules that can update reputation
    friend aether_addr::service_escrow;

    struct ReputationState has key {
        score: u64,             // 0 to 1000
        total_volume: u64,      // Total APT processed
        tasks_completed: u64,
        successful_tasks: u64,
        disputes: u64,
    }

    /// Initialize reputation for a new agent (called by Agent Registry ideally, or manually)
    public entry fun init_reputation(account: &signer) {
        let addr = signer::address_of(account);
        if (!exists<ReputationState>(addr)) {
            move_to(account, ReputationState {
                score: 500, // Start with neutral trust
                total_volume: 0,
                tasks_completed: 0,
                successful_tasks: 0,
                disputes: 0,
            });
        }
    }

    /// Update reputation after a task (Only callable by ServiceEscrow)
    public(friend) fun update_on_success(agent_addr: address, volume: u64) acquires ReputationState {
        let rep = borrow_global_mut<ReputationState>(agent_addr);
        
        rep.total_volume = rep.total_volume + volume;
        rep.tasks_completed = rep.tasks_completed + 1;
        rep.successful_tasks = rep.successful_tasks + 1;

        // Simple Score Logic: Cap at 1000
        // Bonus for success + volume
        let bonus = 10;
        if (rep.score + bonus <= 1000) {
            rep.score = rep.score + bonus;
        };
    }

    /// Update reputation on dispute/failure
    public(friend) fun update_on_failure(agent_addr: address) acquires ReputationState {
        let rep = borrow_global_mut<ReputationState>(agent_addr);
        rep.tasks_completed = rep.tasks_completed + 1;
        rep.disputes = rep.disputes + 1;

        // penalty
        let penalty = 50;
        if (rep.score > penalty) {
            rep.score = rep.score - penalty;
        } else {
            rep.score = 0;
        };
    }

    #[view]
    public fun get_score(agent_addr: address): u64 acquires ReputationState {
        if (exists<ReputationState>(agent_addr)) {
            borrow_global<ReputationState>(agent_addr).score
        } else {
            0
        }
    }
}
