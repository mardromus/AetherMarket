module aether_addr::service_escrow {
    use std::signer;
    use aptos_framework::coin;
    use aptos_framework::aptos_coin::AptosCoin;
    use aptos_framework::timestamp;
    use aether_addr::reputation;

    struct EscrowStore has key {
        locked_funds: u64,
    }

    /// Error codes
    const E_INSUFFICIENT_BALANCE: u64 = 1;
    const E_TASK_NOT_FOUND: u64 = 2;

    struct TaskEscrow has key {
        requester: address,
        provider: address,
        amount: u64,
        status: u8, // 0: Created, 1: Completed, 2: Disputed
        created_at: u64,
    }

    /// Deposit funds to hire an agent
    public entry fun hire_agent(
        account: &signer,
        provider: address,
        amount: u64
    ) {
        let requester_addr = signer::address_of(account);
        
        // Transfer funds to the Module Account (Simplified for hackathon)
        // In prod, we'd use a resource account
        // coin::transfer<AptosCoin>(account, @aether_addr, amount);

        // For now, simpler logic: just lock it in a resource under the requester
        move_to(account, TaskEscrow {
            requester: requester_addr,
            provider,
            amount,
            status: 0,
            created_at: timestamp::now_seconds(),
        });
    }

    /// Release funds upon completion
    public entry fun complete_task(
        account: &signer, // Ideally called by requester to confirm
        task_owner: address 
    ) acquires TaskEscrow {
        let escrow = borrow_global_mut<TaskEscrow>(task_owner);
        
        // Logic to transfer coin would go here
        // coin::transfer...

        escrow.status = 1; // Completed

        // Update Reputation
        reputation::update_on_success(escrow.provider, escrow.amount);
    }
}
