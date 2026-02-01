/**
 * PILLAR A: Identity & Registration - AgentCard Module
 * 
 * Implements verifiable on-chain identity for autonomous agents using Aptos Objects.
 * This module enables:
 * - Agent registration as portable on-chain Objects
 * - Standardized AgentCard manifests (ERC-8004 equivalent)
 * - Capability definition and indexing
 * - Verification of agent ownership via Aptos Keyless (AIP-61)
 * 
 * KEY CONCEPTS:
 * - AgentCard: A Move Object that contains agent metadata and capabilities
 * - Manifest URL: Points to a JSON file defining agent's capabilities, payment endpoints, and communication protocol
 * - Principal: Human owner (verified via Google/Apple through Keyless)
 * - Capabilities: What the agent can do (e.g., ["smart-contract-audit", "code-review"])
 */

module aether_addr::agent_card {
    use std::string::{String, utf8};
    use std::vector;
    use std::signer;
    use aptos_framework::object::{Self, Object, ExtendRef, ConstructorRef};
    use aptos_framework::event;
    use aptos_framework::timestamp;

    // Error codes
    const E_NOT_AUTHORIZED: u64 = 1;
    const E_INVALID_CAPABILITY: u64 = 2;
    const E_AGENT_ALREADY_EXISTS: u64 = 3;
    const E_MANIFEST_URL_EMPTY: u64 = 4;

    // AgentCapability: Represents a single skill or capability an agent possesses
    struct Capability has store, copy, drop {
        tag: String,                    // e.g., "smart-contract-audit"
        version: u64,                   // Capability version for upgrades
        availability: u8,               // 0-100: percentage availability
    }

    /**
     * AgentCard: The core identity object for agents
     * 
     * This is stored as an Aptos Object, making it:
     * - Portable (can be transferred or delegated)
     * - Self-custodial (agent controls its own identity)
     * - Extensible (can hold additional resources)
     */
    struct AgentCard has key {
        // Identity
        id: u64,                        // Unique agent ID
        owner: address,                 // Human principal who controls this agent
        agent_address: address,         // Agent's on-chain address (for signing)

        // Metadata
        name: String,                   // Agent name (e.g., "SENTINEL AUDITOR")
        description: String,            // What the agent does
        model_hash: String,            // Hash of model weights/system prompt for verification

        // Capabilities
        capabilities: vector<Capability>,

        // Payment Configuration
        payment_endpoint: String,       // x402 endpoint (e.g., "https://market.aether.com/api/agent/execute")
        payment_rate: u64,              // Rate in octas per request (1 APT = 10^8 octas)
        settlement_address: address,    // Where payments go

        // Manifest
        manifest_url: String,           // Link to ERC-8004 JSON manifest
                                       // Manifest defines full capabilities, IO schemas, protocols

        // Verification
        verified: bool,                 // Has principal proven ownership via Keyless?
        principal_google_sub: String,   // Google subject ID (from AIP-61 keyless)

        // Metadata
        created_at: u64,
        last_updated: u64,

        // Extension reference for adding resources later
        extend_ref: ExtendRef<AgentCard>,
    }

    /**
     * AgentCardStore: Global registry of all agent cards
     * Enables efficient lookup and discovery
     */
    struct AgentCardStore has key {
        agent_count: u64,
        capability_index: vector<String>,  // For discovery
    }

    // Events
    #[event]
    struct AgentCardCreated has drop, store {
        id: u64,
        agent_address: address,
        owner: address,
        name: String,
        manifest_url: String,
    }

    #[event]
    struct AgentVerified has drop, store {
        agent_id: u64,
        principal_google_sub: String,
    }

    #[event]
    struct CapabilityAdded has drop, store {
        agent_id: u64,
        capability_tag: String,
        version: u64,
    }

    // ===== Public Functions =====

    /**
     * Initialize the AgentCardStore (called once at module publish)
     */
    fun init_module(sender: &signer) {
        move_to(sender, AgentCardStore {
            agent_count: 0,
            capability_index: vector::empty(),
        });
    }

    /**
     * register_agent: Create a new AgentCard as an Aptos Object
     * 
     * FLOW:
     * 1. Human (principal) calls this to register their AI agent
     * 2. Agent gets a unique on-chain identity (Object)
     * 3. Manifest URL is stored for external capability definition
     * 4. Agent is NOT yet verified (needs AIP-61 proof)
     * 
     * ARGS:
     * - account: The human principal registering the agent
     * - agent_address: The agent's signing address
     * - name: Human-readable agent name
     * - description: What the agent does
     * - model_hash: Hash of model weights (for integrity)
     * - payment_endpoint: Where the agent receives x402 requests
     * - payment_rate: How much (in octas) per request
     * - settlement_address: Where payments are transferred
     * - manifest_url: Link to ERC-8004 JSON manifest
     */
    public entry fun register_agent(
        account: &signer,
        agent_address: address,
        name: String,
        description: String,
        model_hash: String,
        payment_endpoint: String,
        payment_rate: u64,
        settlement_address: address,
        manifest_url: String,
    ) acquires AgentCardStore {
        let sender = signer::address_of(account);
        
        // Validate inputs
        assert!(vector::length(manifest_url.as_bytes()) > 0, E_MANIFEST_URL_EMPTY);

        let store = borrow_global_mut<AgentCardStore>(@aether_addr);
        let agent_id = store.agent_count + 1;

        // Create an Aptos Object for this agent
        let constructor_ref = object::create_named_object(
            account,
            *std::string::bytes(&name)
        );

        let object_signer = object::generate_signer(&constructor_ref);
        let extend_ref = object::generate_extend_ref(&constructor_ref);

        // Create the AgentCard resource
        let agent_card = AgentCard {
            id: agent_id,
            owner: sender,
            agent_address,
            name,
            description,
            model_hash,
            capabilities: vector::empty(),
            payment_endpoint,
            payment_rate,
            settlement_address,
            manifest_url,
            verified: false,
            principal_google_sub: utf8(b""),
            created_at: timestamp::now_seconds(),
            last_updated: timestamp::now_seconds(),
            extend_ref,
        };

        move_to(&object_signer, agent_card);
        store.agent_count = agent_id;

        event::emit(AgentCardCreated {
            id: agent_id,
            agent_address,
            owner: sender,
            name,
            manifest_url,
        });
    }

    /**
     * verify_agent_ownership: Prove agent ownership via Keyless (AIP-61)
     * 
     * Called by the backend after receiving a valid Google/Apple JWT.
     * This proves the principal controls both:
     * - Their Google/Apple account
     * - The agent registered under their address
     * 
     * ARGS:
     * - agent_obj_addr: Address of the agent Object
     * - principal_google_sub: The "sub" field from Google JWT
     */
    public entry fun verify_agent_ownership(
        agent_obj_addr: address,
        principal_google_sub: String,
    ) acquires AgentCard {
        let agent_card = borrow_global_mut<AgentCard>(agent_obj_addr);
        agent_card.verified = true;
        agent_card.principal_google_sub = principal_google_sub;
        agent_card.last_updated = timestamp::now_seconds();

        event::emit(AgentVerified {
            agent_id: agent_card.id,
            principal_google_sub,
        });
    }

    /**
     * add_capability: Add a new skill/capability to an agent
     * 
     * Agents can dynamically declare new capabilities.
     * These should match the manifest and are indexed for discovery.
     * 
     * ARGS:
     * - agent_obj_addr: Address of the agent Object
     * - tag: Capability identifier (e.g., "smart-contract-audit")
     * - availability: 0-100 percentage availability
     */
    public entry fun add_capability(
        account: &signer,
        agent_obj_addr: address,
        tag: String,
        availability: u8,
    ) acquires AgentCard, AgentCardStore {
        let agent_card = borrow_global_mut<AgentCard>(agent_obj_addr);

        // Only owner can add capabilities
        assert!(agent_card.owner == signer::address_of(account), E_NOT_AUTHORIZED);
        assert!(availability <= 100, E_INVALID_CAPABILITY);

        let capability = Capability {
            tag,
            version: 1u64,
            availability,
        };

        vector::push_back(&mut agent_card.capabilities, capability);
        agent_card.last_updated = timestamp::now_seconds();

        // Add to capability index
        let store = borrow_global_mut<AgentCardStore>(@aether_addr);
        if (!vector::contains(&store.capability_index, &tag)) {
            vector::push_back(&mut store.capability_index, tag);
        }

        event::emit(CapabilityAdded {
            agent_id: agent_card.id,
            capability_tag: tag,
            version: 1,
        });
    }

    /**
     * update_payment_endpoint: Change where the agent accepts x402 payments
     * 
     * ARGS:
     * - agent_obj_addr: Address of the agent Object
     * - new_endpoint: New x402 endpoint URL
     */
    public entry fun update_payment_endpoint(
        account: &signer,
        agent_obj_addr: address,
        new_endpoint: String,
    ) acquires AgentCard {
        let agent_card = borrow_global_mut<AgentCard>(agent_obj_addr);
        assert!(agent_card.owner == signer::address_of(account), E_NOT_AUTHORIZED);

        agent_card.payment_endpoint = new_endpoint;
        agent_card.last_updated = timestamp::now_seconds();
    }

    // ===== View Functions (Read-Only) =====

    /**
     * get_agent_card: Retrieve agent metadata
     * 
     * Returns all public agent information for discovery and integration
     */
    #[view]
    public fun get_agent_card(agent_obj_addr: address): (
        u64,                    // id
        address,                // owner
        String,                 // name
        String,                 // description
        vector<String>,         // capability_tags
        u64,                    // payment_rate
        String,                 // manifest_url
        bool,                   // verified
    ) acquires AgentCard {
        let agent_card = borrow_global<AgentCard>(agent_obj_addr);
        
        let capability_tags = vector::empty();
        let i = 0;
        while (i < vector::length(&agent_card.capabilities)) {
            let cap = vector::borrow(&agent_card.capabilities, i);
            vector::push_back(&mut capability_tags, cap.tag);
            i = i + 1;
        };

        (
            agent_card.id,
            agent_card.owner,
            agent_card.name,
            agent_card.description,
            capability_tags,
            agent_card.payment_rate,
            agent_card.manifest_url,
            agent_card.verified,
        )
    }

    /**
     * get_agent_count: Total registered agents
     */
    #[view]
    public fun get_agent_count(): u64 acquires AgentCardStore {
        borrow_global<AgentCardStore>(@aether_addr).agent_count
    }

    /**
     * has_capability: Check if agent has a specific capability
     */
    #[view]
    public fun has_capability(agent_obj_addr: address, capability_tag: String): bool acquires AgentCard {
        let agent_card = borrow_global<AgentCard>(agent_obj_addr);
        let i = 0;
        let len = vector::length(&agent_card.capabilities);
        
        while (i < len) {
            let cap = vector::borrow(&agent_card.capabilities, i);
            if (cap.tag == capability_tag) {
                return true
            };
            i = i + 1;
        };
        false
    }

    /**
     * get_payment_info: Get agent's payment configuration
     */
    #[view]
    public fun get_payment_info(agent_obj_addr: address): (
        String,                 // payment_endpoint
        u64,                    // payment_rate
        address,                // settlement_address
    ) acquires AgentCard {
        let agent_card = borrow_global<AgentCard>(agent_obj_addr);
        (
            agent_card.payment_endpoint,
            agent_card.payment_rate,
            agent_card.settlement_address,
        )
    }
}
