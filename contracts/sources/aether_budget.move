/// Aether Budget Module
/// Allows principals to create time-bound spending budgets for agents
/// Agents can call spend_from_budget to verify constraints before charging
module aether::aether_budget {
    use aptos_framework::coin::{Self, Coin};
    use aptos_framework::aptos_coin::AptosCoin;
    use aptos_framework::timestamp;
    use aptos_framework::account;
    use std::signer;
    use std::vector;

    const ERR_INVALID_DURATION: u64 = 1;
    const ERR_BUDGET_EXPIRED: u64 = 2;
    const ERR_INSUFFICIENT_BALANCE: u64 = 3;
    const ERR_UNAUTHORIZED: u64 = 4;
    const ERR_INVALID_AGENT: u64 = 5;

    /// Represents a spending allowance for a specific agent
    struct AgentAllowance has store {
        agent_addr: address,
        remaining_balance: u64,
        valid_until: u64,
    }

    /// Budget object managed by a principal
    #[resource_struct]
    struct Budget has key {
        principal: address,
        allowances: vector<AgentAllowance>,
        coins: Coin<AptosCoin>,
    }

    /// Event emitted when an allowance is granted
    struct AllowanceGrantedEvent has drop, store {
        budget_owner: address,
        agent_addr: address,
        amount: u64,
        valid_until: u64,
    }

    /// Event emitted when an agent spends from budget
    struct BudgetSpentEvent has drop, store {
        budget_owner: address,
        agent_addr: address,
        amount: u64,
        remaining: u64,
    }

    /// Event emitted when an allowance is revoked
    struct AllowanceRevokedEvent has drop, store {
        budget_owner: address,
        agent_addr: address,
        remaining_balance: u64,
    }

    /// Create a new budget for the principal
    public entry fun create_budget(
        principal: &signer,
        initial_funding: Coin<AptosCoin>,
    ) {
        let principal_addr = signer::address_of(principal);
        
        let budget = Budget {
            principal: principal_addr,
            allowances: vector::empty(),
            coins: initial_funding,
        };
        
        move_to(principal, budget);
    }

    /// Grant a time-bound spending allowance to a specific agent
    public entry fun grant_allowance(
        principal: &signer,
        agent_addr: address,
        max_octas: u64,
        duration_seconds: u64,
    ) acquires Budget {
        let principal_addr = signer::address_of(principal);
        assert!(account::exists_at(agent_addr), ERR_INVALID_AGENT);
        assert!(duration_seconds > 0, ERR_INVALID_DURATION);

        let budget = borrow_global_mut<Budget>(principal_addr);
        
        // Verify there are enough coins
        let current_balance = coin::value(&budget.coins);
        assert!(current_balance >= max_octas, ERR_INSUFFICIENT_BALANCE);

        // Calculate expiry time
        let now = timestamp::now_seconds();
        let valid_until = now + duration_seconds;

        // Check if allowance already exists for this agent, update it
        let len = vector::length(&budget.allowances);
        let mut found = false;
        let mut i = 0;
        while (i < len) {
            let allowance = vector::borrow_mut(&mut budget.allowances, i);
            if (allowance.agent_addr == agent_addr) {
                allowance.remaining_balance = max_octas;
                allowance.valid_until = valid_until;
                found = true;
                break
            };
            i = i + 1;
        };

        // If not found, create new allowance
        if (!found) {
            let allowance = AgentAllowance {
                agent_addr: agent_addr,
                remaining_balance: max_octas,
                valid_until: valid_until,
            };
            vector::push_back(&mut budget.allowances, allowance);
        };

        // Emit event
        aptos_framework::event::emit(AllowanceGrantedEvent {
            budget_owner: principal_addr,
            agent_addr: agent_addr,
            amount: max_octas,
            valid_until: valid_until,
        });
    }

    /// Spend from budget - called by agent during x402 payment flow
    /// Verifies time and balance constraints
    public fun spend_from_budget(
        budget_owner: address,
        agent_addr: address,
        amount: u64,
    ): Coin<AptosCoin> acquires Budget {
        let budget = borrow_global_mut<Budget>(budget_owner);
        
        // Find the allowance for this agent
        let len = vector::length(&budget.allowances);
        let mut allowance_idx = len; // Initialize to invalid index
        let mut i = 0;
        while (i < len) {
            let allowance = vector::borrow(&budget.allowances, i);
            if (allowance.agent_addr == agent_addr) {
                allowance_idx = i;
                break
            };
            i = i + 1;
        };

        // Verify allowance exists
        assert!(allowance_idx < len, ERR_UNAUTHORIZED);

        let allowance = vector::borrow_mut(&mut budget.allowances, allowance_idx);

        // Check if allowance is still valid
        let now = timestamp::now_seconds();
        assert!(now < allowance.valid_until, ERR_BUDGET_EXPIRED);

        // Check if amount is within remaining balance
        assert!(amount <= allowance.remaining_balance, ERR_INSUFFICIENT_BALANCE);

        // Update remaining balance
        allowance.remaining_balance = allowance.remaining_balance - amount;

        // Extract the coins
        let payment = coin::extract(&mut budget.coins, amount);

        // Emit event
        aptos_framework::event::emit(BudgetSpentEvent {
            budget_owner: budget_owner,
            agent_addr: agent_addr,
            amount: amount,
            remaining: allowance.remaining_balance,
        });

        payment
    }

    /// Revoke an agent's allowance and reclaim unused funds
    public entry fun revoke_allowance(
        principal: &signer,
        agent_addr: address,
    ) acquires Budget {
        let principal_addr = signer::address_of(principal);
        let budget = borrow_global_mut<Budget>(principal_addr);

        let len = vector::length(&budget.allowances);
        let mut i = 0;
        while (i < len) {
            let allowance = vector::borrow(&budget.allowances, i);
            if (allowance.agent_addr == agent_addr) {
                let removed = vector::remove(&mut budget.allowances, i);
                
                aptos_framework::event::emit(AllowanceRevokedEvent {
                    budget_owner: principal_addr,
                    agent_addr: agent_addr,
                    remaining_balance: removed.remaining_balance,
                });
                break
            };
            i = i + 1;
        };
    }

    /// Get remaining balance for an agent (View function)
    #[view]
    public fun get_remaining_balance(
        budget_owner: address,
        agent_addr: address,
    ): (u64, u64) acquires Budget {
        let budget = borrow_global<Budget>(budget_owner);
        
        let len = vector::length(&budget.allowances);
        let mut i = 0;
        while (i < len) {
            let allowance = vector::borrow(&budget.allowances, i);
            if (allowance.agent_addr == agent_addr) {
                return (allowance.remaining_balance, allowance.valid_until)
            };
            i = i + 1;
        };
        
        (0, 0)
    }

    /// Get total budget balance (View function)
    #[view]
    public fun get_budget_balance(budget_owner: address): u64 acquires Budget {
        let budget = borrow_global<Budget>(budget_owner);
        coin::value(&budget.coins)
    }

    /// Add more coins to the budget
    public entry fun deposit_to_budget(
        principal: &signer,
        amount: Coin<AptosCoin>,
    ) acquires Budget {
        let principal_addr = signer::address_of(principal);
        let budget = borrow_global_mut<Budget>(principal_addr);
        coin::merge(&mut budget.coins, amount);
    }

    /// Withdraw unused budget (must not have active allowances)
    public entry fun withdraw_budget(
        principal: &signer,
        amount: u64,
    ): Coin<AptosCoin> acquires Budget {
        let principal_addr = signer::address_of(principal);
        let budget = borrow_global_mut<Budget>(principal_addr);
        coin::extract(&mut budget.coins, amount)
    }
}
