/**
 * Aptos GraphQL Client
 * 
 * Provides GraphQL queries for advanced Aptos blockchain operations
 * Supports both testnet and mainnet
 */

export type AptosNetwork = "testnet" | "mainnet";

const GRAPHQL_ENDPOINTS: Record<AptosNetwork, string> = {
    testnet: "https://api.testnet.aptoslabs.com/v1/graphql",
    mainnet: "https://api.mainnet.aptoslabs.com/v1/graphql"
};

interface GraphQLResponse<T> {
    data?: T;
    errors?: Array<{ message: string }>;
}

export class AptosGraphQL {
    private endpoint: string;
    private network: AptosNetwork;

    constructor(network: AptosNetwork = "testnet") {
        this.network = network;
        this.endpoint = GRAPHQL_ENDPOINTS[network];
    }

    /**
     * Execute a GraphQL query
     */
    async query<T>(gql: string, variables?: Record<string, string | number>): Promise<T | null> {
        try {
            const response = await fetch(this.endpoint, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    query: gql,
                    variables: variables || {},
                }),
            });

            if (!response.ok) {
                throw new Error(`GraphQL request failed: ${response.statusText}`);
            }

            const result: GraphQLResponse<T> = await response.json();

            if (result.errors) {
                throw new Error(`GraphQL error: ${result.errors.map(e => e.message).join(", ")}`);
            }

            return result.data as T;
        } catch (error) {
            console.error("GraphQL query error:", error);
            throw error;
        }
    }

    /**
     * Get transaction details by hash
     */
    async getTransaction(txnHash: string) {
        const query = `
            query GetTransaction($hash: String!) {
                transactions(where: { hash: { _eq: $hash } }, limit: 1) {
                    hash
                    version
                    block_height
                    success
                    vm_status
                    sender
                    sequence_number
                    max_gas_amount
                    gas_unit_price
                    gas_used
                    timestamp
                }
            }
        `;

        const result = await this.query<{
            transactions: Array<{
                hash: string;
                version: string;
                block_height: string;
                success: boolean;
                vm_status: string;
                sender: string;
                sequence_number: string;
                max_gas_amount: string;
                gas_unit_price: string;
                gas_used: string;
                timestamp: string;
            }>;
        }>(query, { hash: txnHash });

        return result?.transactions?.[0] || null;
    }

    /**
     * Get account details
     */
    async getAccount(address: string) {
        const query = `
            query GetAccount($address: String!) {
                current_objects(
                    where: { owner_address: { _eq: $address } }
                    limit: 100
                ) {
                    address
                    owner_address
                    state_key_hash
                    object_version
                }
            }
        `;

        const result = await this.query<{
            current_objects: Array<Record<string, unknown>>;
        }>(query, { address });

        return result?.current_objects || [];
    }

    /**
     * Get balance for an account
     */
    async getBalance(address: string, coinType: string = "0x1::aptos_coin::AptosCoin") {
        const query = `
            query GetBalance($address: String!, $coinType: String!) {
                current_fungible_asset_balances(
                    where: {
                        owner_address: { _eq: $address }
                        asset_type: { _eq: $coinType }
                    }
                ) {
                    balance
                    asset_type
                }
            }
        `;

        const result = await this.query<{
            current_fungible_asset_balances: Array<{
                balance: string;
                asset_type: string;
            }>;
        }>(query, { address, coinType });

        const balance = result?.current_fungible_asset_balances?.[0];
        return balance ? BigInt(balance.balance) : BigInt(0);
    }

    /**
     * Get transaction events
     */
    async getTransactionEvents(txnHash: string) {
        const query = `
            query GetEvents($txn_hash: String!) {
                events(
                    where: { transaction_hash: { _eq: $txn_hash } }
                    limit: 100
                ) {
                    transaction_hash
                    event_index
                    type
                    data
                    account_address
                    sequence_number
                }
            }
        `;

        const result = await this.query<{
            events: Array<{
                transaction_hash: string;
                event_index: number;
                type: string;
                data: string;
                account_address: string;
                sequence_number: string;
            }>;
        }>(query, { txn_hash: txnHash });

        return result?.events || [];
    }

    /**
     * Check if transaction is confirmed (finalized)
     */
    async isTransactionFinalized(txnHash: string): Promise<boolean> {
        try {
            const txn = await this.getTransaction(txnHash);
            if (!txn) return false;

            // Transaction is finalized if it has a block height and success status
            return txn.success && !!txn.block_height;
        } catch (error) {
            console.error("Error checking transaction finalization:", error);
            return false;
        }
    }

    /**
     * Get multiple transactions
     */
    async getTransactions(addresses: string[], limit: number = 10) {
        const addressList = addresses.map(a => `"${a}"`).join(",");
        const query = `
            query GetTransactions($limit: Int!) {
                transactions(
                    where: { sender: { _in: [${addressList}] } }
                    limit: $limit
                    order_by: { timestamp: desc }
                ) {
                    hash
                    version
                    success
                    sender
                    timestamp
                }
            }
        `;

        const result = await this.query<{
            transactions: Array<Record<string, unknown>>;
        }>(query, { limit });

        return result?.transactions || [];
    }

    /**
     * Get module information
     */
    async getModule(address: string, moduleName: string) {
        const query = `
            query GetModule($address: String!, $module: String!) {
                move_modules(
                    where: {
                        address: { _eq: $address }
                        name: { _eq: $module }
                    }
                    limit: 1
                ) {
                    address
                    name
                    abi
                    bytecode
                }
            }
        `;

        const result = await this.query<{
            move_modules: Array<Record<string, unknown>>;
        }>(query, { address, module: moduleName });

        return result?.move_modules?.[0] || null;
    }

    /**
     * Get network info
     */
    async getChainInfo() {
        const query = `
            query GetChainInfo {
                ledger_infos(limit: 1, order_by: { chain_id: desc }) {
                    chain_id
                    ledger_version
                    ledger_timestamp
                }
            }
        `;

        const result = await this.query<{
            ledger_infos: Array<{
                chain_id: string;
                ledger_version: string;
                ledger_timestamp: string;
            }>;
        }>(query);

        return result?.ledger_infos?.[0] || null;
    }

    /**
     * Get the current network
     */
    getNetwork(): AptosNetwork {
        return this.network;
    }
}

/**
 * Singleton instance
 */
let graphqlInstance: AptosGraphQL | null = null;

export function getAptosGraphQL(network: AptosNetwork = "testnet"): AptosGraphQL {
    if (!graphqlInstance || graphqlInstance.getNetwork() !== network) {
        graphqlInstance = new AptosGraphQL(network);
    }
    return graphqlInstance;
}
