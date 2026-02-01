/// Aether Registry Module
/// Allows developers to register AI agents as searchable objects on Aptos
/// Uses Aptos Objects for decentralized agent registry
module aether::aether_registry {
    use aptos_framework::object::{Self, Object, ExtendRef, DeleteRef};
    use aptos_framework::account;
    use std::string::String;
    use std::vector;
    use std::signer;

    /// Agent metadata stored in the object
    #[resource_struct]
    struct AgentCard has key {
        /// Unique identifier for the agent
        handle: String,
        /// HTTP endpoint for the agent service
        endpoint: String,
        /// Skills/capabilities this agent provides
        skills: vector<String>,
        /// Price per call in octas
        price_per_call: u64,
        /// Owner's address
        owner: address,
    }

    /// Controller that holds deletion rights
    #[resource_struct]
    struct RegistryController has key {
        /// Delete reference for burning the object
        delete_ref: DeleteRef,
    }

    /// Registry index for skill-based lookup
    #[resource_struct]
    struct SkillIndex has key {
        /// Maps skill → list of agent object addresses
        skill_agents: vector<(String, vector<address>)>,
    }

    /// Event emitted when an agent is registered
    struct AgentRegisteredEvent has drop, store {
        agent_addr: address,
        handle: String,
        owner: address,
    }

    /// Event emitted when an agent is deleted
    struct AgentDeletedEvent has drop, store {
        agent_addr: address,
        handle: String,
        owner: address,
    }

    /// Initialize the registry on first use
    fun init_module(account: &signer) {
        let skill_index = SkillIndex {
            skill_agents: vector::empty(),
        };
        move_to(account, skill_index);
    }

    /// Register a new agent in the marketplace
    /// Creates an Aptos Object with AgentCard resource
    public entry fun register_agent(
        owner: &signer,
        handle: String,
        endpoint: String,
        skills: vector<String>,
        price_per_call: u64,
    ) {
        let owner_addr = signer::address_of(owner);
        
        // Create a new object
        let constructor_ref = object::create_object(owner_addr);
        let object_signer = object::generate_signer(&constructor_ref);
        let object_addr = signer::address_of(&object_signer);

        // Store AgentCard in the object
        let agent_card = AgentCard {
            handle: handle,
            endpoint: endpoint,
            skills: skills,
            price_per_call: price_per_call,
            owner: owner_addr,
        };
        move_to(&object_signer, agent_card);

        // Store deletion rights in a controller
        let delete_ref = object::generate_delete_ref(&constructor_ref);
        let controller = RegistryController {
            delete_ref: delete_ref,
        };
        move_to(&object_signer, controller);

        // Update skill index
        update_skill_index(object_addr, skills);

        // Emit event
        aptos_framework::event::emit(AgentRegisteredEvent {
            agent_addr: object_addr,
            handle: handle,
            owner: owner_addr,
        });
    }

    /// Delete an agent from the registry
    /// Only the owner can delete their own agent
    public entry fun delete_agent(
        owner: &signer,
        agent_addr: address,
    ) acquires AgentCard, RegistryController, SkillIndex {
        let agent_card = move_from<AgentCard>(agent_addr);
        
        // Verify ownership
        assert!(agent_card.owner == signer::address_of(owner), 401);

        let controller = move_from<RegistryController>(agent_addr);
        
        // Burn the object using the DeleteRef
        object::delete(controller.delete_ref);

        // Remove from skill index
        remove_from_skill_index(agent_addr, agent_card.skills);

        // Emit event
        aptos_framework::event::emit(AgentDeletedEvent {
            agent_addr: agent_addr,
            handle: agent_card.handle,
            owner: agent_card.owner,
        });
    }

    /// Get all agents with a specific skill (View function)
    #[view]
    public fun get_agents_by_skill(
        skill: String,
    ): vector<address> acquires SkillIndex {
        let skill_index = borrow_global<SkillIndex>(@aether);
        
        let mut result = vector::empty();
        let len = vector::length(&skill_index.skill_agents);
        let mut i = 0;
        while (i < len) {
            let (indexed_skill, agents) = vector::borrow(&skill_index.skill_agents, i);
            if (indexed_skill == &skill) {
                result = *agents;
                break
            };
            i = i + 1;
        };
        result
    }

    /// Get agent card details (View function)
    #[view]
    public fun get_agent_details(
        agent_addr: address,
    ): (String, String, vector<String>, u64, address) acquires AgentCard {
        let agent = borrow_global<AgentCard>(agent_addr);
        (
            agent.handle,
            agent.endpoint,
            agent.skills,
            agent.price_per_call,
            agent.owner,
        )
    }

    /// Helper: Update skill index when registering an agent
    fun update_skill_index(agent_addr: address, skills: vector<String>) acquires SkillIndex {
        let skill_index = borrow_global_mut<SkillIndex>(@aether);
        
        let len = vector::length(&skills);
        let mut i = 0;
        while (i < len) {
            let skill = vector::borrow(&skills, i);
            let mut found = false;
            
            let skill_len = vector::length(&skill_index.skill_agents);
            let mut j = 0;
            while (j < skill_len) {
                let (indexed_skill, agents) = vector::borrow_mut(&mut skill_index.skill_agents, j);
                if (indexed_skill == skill) {
                    vector::push_back(agents, agent_addr);
                    found = true;
                    break
                };
                j = j + 1;
            };
            
            if (!found) {
                let mut new_agents = vector::empty();
                vector::push_back(&mut new_agents, agent_addr);
                vector::push_back(&mut skill_index.skill_agents, (*skill, new_agents));
            };
            i = i + 1;
        };
    }

    /// Helper: Remove agent from skill index when deleting
    fun remove_from_skill_index(agent_addr: address, skills: vector<String>) acquires SkillIndex {
        let skill_index = borrow_global_mut<SkillIndex>(@aether);
        
        let len = vector::length(&skills);
        let mut i = 0;
        while (i < len) {
            let skill = vector::borrow(&skills, i);
            
            let skill_len = vector::length(&skill_index.skill_agents);
            let mut j = 0;
            while (j < skill_len) {
                let (indexed_skill, agents) = vector::borrow_mut(&mut skill_index.skill_agents, j);
                if (indexed_skill == skill) {
                    let agent_len = vector::length(agents);
                    let mut k = 0;
                    while (k < agent_len) {
                        if (vector::borrow(agents, k) == &agent_addr) {
                            vector::remove(agents, k);
                            break
                        };
                        k = k + 1;
                    };
                    break
                };
                j = j + 1;
            };
            i = i + 1;
        };
    }
}
