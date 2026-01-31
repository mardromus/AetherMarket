module aether_addr::agent_registry {
    use std::string::{String};
    use std::vector;
    use std::signer;
    use aptos_framework::event;
    use aptos_framework::timestamp;

    /// Error codes
    const E_AGENT_ALREADY_EXISTS: u64 = 1;
    const E_NOT_AUTHORIZED: u64 = 2;

    /// The Soulbound Capability representing an Agent
    struct AgentCap has key, store {
        id: u64,
        owner: address,
        name: String,
        model_hash: String,
        capabilities: vector<String>,
        payment_rate: u64, // Rate in Octas (APT satellites)
        created_at: u64,
    }

    /// Global Registry tracking all agents
    struct Registry has key {
        agents: vector<AgentCap>,
        agent_count: u64,
    }

    /// Event emitted when a new agent is registered
    #[event]
    struct AgentRegistered has drop, store {
        agent_id: u64,
        owner: address,
        name: String,
    }

    /// Initialize the module (run once by deployer)
    fun init_module(sender: &signer) {
        move_to(sender, Registry {
            agents: vector::empty(),
            agent_count: 0,
        });
    }

    /// Register a new AI Agent identity on-chain
    public entry fun register_agent(
        account: &signer,
        name: String,
        model_hash: String,
        capabilities: vector<String>,
        payment_rate: u64
    ) acquires Registry {
        let sender_addr = signer::address_of(account);
        let registry = borrow_global_mut<Registry>(@aether_addr);
        
        let new_id = registry.agent_count + 1;

        let new_agent = AgentCap {
            id: new_id,
            owner: sender_addr,
            name,
            model_hash,
            capabilities,
            payment_rate,
            created_at: timestamp::now_seconds(),
        };

        vector::push_back(&mut registry.agents, new_agent);
        registry.agent_count = new_id;

        event::emit(AgentRegistered {
            agent_id: new_id,
            owner: sender_addr,
            name,
        });
    }

    /// Read-only function to get total agent count
    #[view]
    public fun get_agent_count(): u64 acquires Registry {
        borrow_global<Registry>(@aether_addr).agent_count
    }
}
