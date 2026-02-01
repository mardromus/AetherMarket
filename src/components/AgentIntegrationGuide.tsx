"use client";

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Copy, Check, Code2 } from 'lucide-react';
import type { AgentSpec } from '@/lib/agents/interface';
import { toast } from 'sonner';

interface AgentIntegrationGuideProps {
    agent?: AgentSpec | null;
    className?: string;
}

export function AgentIntegrationGuide({ agent, className = '' }: AgentIntegrationGuideProps) {
    const [copiedId, setCopiedId] = useState<string | null>(null);

    const copyToClipboard = (text: string, id: string) => {
        navigator.clipboard.writeText(text);
        setCopiedId(id);
        toast.success('Copied to clipboard!');
        setTimeout(() => setCopiedId(null), 2000);
    };

    // Early return if no agent provided
    if (!agent || !agent.capabilities || Object.keys(agent.capabilities).length === 0) {
        return (
            <Card className={`bg-black/40 border-white/10 ${className}`}>
                <CardContent className="pt-6 text-center text-muted-foreground">
                    <p>No agent selected or agent data not available.</p>
                </CardContent>
            </Card>
        );
    }

    const firstCapability = Object.values(agent.capabilities)[0];
    const firstCapabilityId = Object.keys(agent.capabilities)[0];
    const exampleParams = firstCapability.inputParameters.reduce((acc, param) => {
        acc[param.name] = param.example;
        return acc;
    }, {} as Record<string, any>);

    // TypeScript/JavaScript Example
    const typescriptExample = `import { AetherSDK } from '@aether/sdk';

// Initialize SDK
const aether = new AetherSDK('mainnet'); // or 'testnet'

// Call ${agent.name}
async function call${agent.name.replace(/\s+/g, '')}() {
  try {
    const result = await aether.callAgent({
      agentId: '${agent.id}',
      taskType: '${firstCapabilityId}',
      parameters: ${JSON.stringify(exampleParams, null, 6).replace(/\n/g, '\n      ')}
    });

    if (result.success) {
      console.log('Success!');
      console.log('Result:', result.result);
      console.log('Cost:', result.cost, 'octas');
      console.log('Execution time:', result.executionTime, 'ms');
      return result.result;
    } else {
      console.error('Error:', result.error);
      throw new Error(result.error);
    }
  } catch (error) {
    console.error('Failed to call agent:', error);
    throw error;
  }
}

// Use the function
call${agent.name.replace(/\s+/g, '')}()
  .then(result => {
    // Handle successful result
    console.log('Agent completed successfully:', result);
  })
  .catch(error => {
    // Handle error
    console.error('Agent failed:', error);
  });`;

    // Python Example
    const pythonExample = `from aether_sdk import AetherSDK
import json

# Initialize SDK
aether = AetherSDK('mainnet')  # or 'testnet'

def call_${agent.id.replace(/-/g, '_')}():
    """
    Call ${agent.name}
    """
    try:
        result = aether.call_agent(
            agent_id='${agent.id}',
            task_type='${firstCapabilityId}',
            parameters=${JSON.stringify(exampleParams, null, 12).replace(/\n/g, '\n            ')}
        )
        
        if result['success']:
            print('Success!')
            print(f"Result: {result['result']}")
            print(f"Cost: {result['cost']} octas")
            print(f"Execution time: {result['executionTime']}ms")
            return result['result']
        else:
            print(f"Error: {result.get('error')}")
            raise Exception(result.get('error'))
            
    except Exception as error:
        print(f"Failed to call agent: {error}")
        raise error

# Use the function
if __name__ == '__main__':
    try:
        result = call_${agent.id.replace(/-/g, '_')}()
        print(f"Agent completed successfully: {result}")
    except Exception as e:
        print(f"Agent failed: {e}")`;

    // cURL Example
    const curlExample = `# Call ${agent.name} via REST API

# Set your API endpoint and key
API_URL="https://aether-market.app/api/agent/call"
API_KEY="your_api_key_here"

# Make the request
curl -X POST "$API_URL" \\
  -H "Content-Type: application/json" \\
  -H "Authorization: Bearer $API_KEY" \\
  -H "X-Aptos-Wallet: YOUR_WALLET_ADDRESS" \\
  -d '{
  "agentId": "${agent.id}",
  "taskType": "${firstCapabilityId}",
  "parameters": ${JSON.stringify(exampleParams, null, 4).replace(/\n/g, '\n    ')}
}'

# Response format:
# {
#   "success": true,
#   "result": { ... },
#   "executionTime": 1234,
#   "cost": "3000000",
#   "agentId": "${agent.id}",
#   "taskType": "${firstCapabilityId}"
# }`;

    // REST API Documentation
    const restApiDoc = `# REST API Endpoint

**Endpoint**: \`POST /api/agent/call\`  
**Authentication**: Bearer token required  
**Content-Type**: \`application/json\`

## Headers
\`\`\`
Authorization: Bearer YOUR_API_KEY
Content-Type: application/json
X-Aptos-Wallet: YOUR_WALLET_ADDRESS
\`\`\`

## Request Body
\`\`\`json
{
  "agentId": "${agent.id}",
  "taskType": "${firstCapabilityId}",
  "parameters": {
    // See Input Schema tab for all parameters
  },
  "maxPrice": "10000000", // Optional: max price in octas
  "budgetId": "budget-123" // Optional: use existing budget
}
\`\`\`

## Response (Success)
\`\`\`json
{
  "success": true,
  "result": {
    // Agent-specific result data
  },
  "executionTime": 1234,
  "cost": "${firstCapability.costOctas}",
  "agentId": "${agent.id}",
  "taskType": "${firstCapabilityId}",
  "metadata": {
    "tokensUsed": 342,
    "model": "${agent.model || agent.provider}",
    "timestamp": 1706745600000
  }
}
\`\`\`

## Response (Error)
\`\`\`json
{
  "success": false,
  "error": "Error message here",
  "agentId": "${agent.id}",
  "taskType": "${firstCapabilityId}",
  "executionTime": 123,
  "cost": "0"
}
\`\`\`

## Error Codes
- \`INSUFFICIENT_BALANCE\`: Not enough APT in wallet
- \`INVALID_PARAMETERS\`: Missing or invalid input parameters
- \`AGENT_TIMEOUT\`: Agent execution exceeded timeout
- \`AGENT_ERROR\`: Agent execution failed
- \`RATE_LIMIT_EXCEEDED\`: Too many requests`;

    // SDK Installation
    const installationGuide = `# Installation Guide

## TypeScript/JavaScript

### Install via npm
\`\`\`bash
npm install @aether/sdk
\`\`\`

### Install via yarn
\`\`\`bash
yarn add @aether/sdk
\`\`\`

### Basic Setup
\`\`\`typescript
import { AetherSDK } from '@aether/sdk';

// Initialize with network
const aether = new AetherSDK('mainnet', {
  apiKey: process.env.AETHER_API_KEY, // Optional for public endpoints
  walletAddress: 'YOUR_WALLET_ADDRESS'
});

// Configure timeouts and retries
aether.configure({
  timeout: 30000, // 30 seconds
  retries: 3,
  retryDelay: 1000 // 1 second between retries
});
\`\`\`

## Python

### Install via pip
\`\`\`bash
pip install aether-sdk
\`\`\`

### Basic Setup
\`\`\`python
from aether_sdk import AetherSDK

# Initialize with network
aether = AetherSDK('mainnet', 
    api_key=os.getenv('AETHER_API_KEY'),  # Optional
    wallet_address='YOUR_WALLET_ADDRESS'
)

# Configure timeouts and retries
aether.configure(
    timeout=30000,  # 30 seconds
    retries=3,
    retry_delay=1000  # 1 second between retries
)
\`\`\`

## cURL (No Installation Required)
Just use the REST API directly with curl or any HTTP client.`;

    return (
        <div className={`space-y-6 ${className}`}>
            <Card className="bg-gradient-to-r from-cyan-500/10 to-blue-500/10 border-cyan-500/20">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Code2 className="w-6 h-6 text-cyan-400" />
                        Integration Guide: {agent.name}
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-muted-foreground">
                        Complete code examples and API documentation for integrating {agent.name} into your application.
                    </p>
                </CardContent>
            </Card>

            <Tabs defaultValue="typescript" className="w-full">
                <TabsList className="grid w-full grid-cols-5">
                    <TabsTrigger value="typescript">TypeScript</TabsTrigger>
                    <TabsTrigger value="python">Python</TabsTrigger>
                    <TabsTrigger value="curl">cURL</TabsTrigger>
                    <TabsTrigger value="rest">REST API</TabsTrigger>
                    <TabsTrigger value="install">Installation</TabsTrigger>
                </TabsList>

                {/* TypeScript Tab */}
                <TabsContent value="typescript">
                    <Card className="bg-black/40 border-white/10">
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <CardTitle className="text-base">TypeScript/JavaScript Example</CardTitle>
                                <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => copyToClipboard(typescriptExample, 'ts')}
                                    className="gap-2"
                                >
                                    {copiedId === 'ts' ? (
                                        <>
                                            <Check className="w-3 h-3" />
                                            Copied!
                                        </>
                                    ) : (
                                        <>
                                            <Copy className="w-3 h-3" />
                                            Copy Code
                                        </>
                                    )}
                                </Button>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <pre className="bg-black/80 p-4 rounded border border-white/10 overflow-x-auto text-xs font-mono">
                                <code className="text-cyan-400">{typescriptExample}</code>
                            </pre>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Python Tab */}
                <TabsContent value="python">
                    <Card className="bg-black/40 border-white/10">
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <CardTitle className="text-base">Python Example</CardTitle>
                                <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => copyToClipboard(pythonExample, 'py')}
                                    className="gap-2"
                                >
                                    {copiedId === 'py' ? (
                                        <>
                                            <Check className="w-3 h-3" />
                                            Copied!
                                        </>
                                    ) : (
                                        <>
                                            <Copy className="w-3 h-3" />
                                            Copy Code
                                        </>
                                    )}
                                </Button>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <pre className="bg-black/80 p-4 rounded border border-white/10 overflow-x-auto text-xs font-mono">
                                <code className="text-green-400">{pythonExample}</code>
                            </pre>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* cURL Tab */}
                <TabsContent value="curl">
                    <Card className="bg-black/40 border-white/10">
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <CardTitle className="text-base">cURL Example</CardTitle>
                                <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => copyToClipboard(curlExample, 'curl')}
                                    className="gap-2"
                                >
                                    {copiedId === 'curl' ? (
                                        <>
                                            <Check className="w-3 h-3" />
                                            Copied!
                                        </>
                                    ) : (
                                        <>
                                            <Copy className="w-3 h-3" />
                                            Copy Code
                                        </>
                                    )}
                                </Button>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <pre className="bg-black/80 p-4 rounded border border-white/10 overflow-x-auto text-xs font-mono">
                                <code className="text-yellow-400">{curlExample}</code>
                            </pre>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* REST API Tab */}
                <TabsContent value="rest">
                    <Card className="bg-black/40 border-white/10">
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <CardTitle className="text-base">REST API Documentation</CardTitle>
                                <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => copyToClipboard(restApiDoc, 'rest')}
                                    className="gap-2"
                                >
                                    {copiedId === 'rest' ? (
                                        <>
                                            <Check className="w-3 h-3" />
                                            Copied!
                                        </>
                                    ) : (
                                        <>
                                            <Copy className="w-3 h-3" />
                                            Copy Docs
                                        </>
                                    )}
                                </Button>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="prose prose-invert max-w-none">
                                <pre className="bg-black/80 p-4 rounded border border-white/10 overflow-x-auto text-xs font-mono whitespace-pre-wrap">
                                    <code className="text-purple-400">{restApiDoc}</code>
                                </pre>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Installation Tab */}
                <TabsContent value="install">
                    <Card className="bg-black/40 border-white/10">
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <CardTitle className="text-base">Installation & Setup</CardTitle>
                                <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => copyToClipboard(installationGuide, 'install')}
                                    className="gap-2"
                                >
                                    {copiedId === 'install' ? (
                                        <>
                                            <Check className="w-3 h-3" />
                                            Copied!
                                        </>
                                    ) : (
                                        <>
                                            <Copy className="w-3 h-3" />
                                            Copy Guide
                                        </>
                                    )}
                                </Button>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="prose prose-invert max-w-none">
                                <pre className="bg-black/80 p-4 rounded border border-white/10 overflow-x-auto text-xs font-mono whitespace-pre-wrap">
                                    <code className="text-blue-400">{installationGuide}</code>
                                </pre>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>

            {/* Quick Tips */}
            <Card className="bg-yellow-500/5 border-yellow-500/20">
                <CardHeader>
                    <CardTitle className="text-base">💡 Integration Tips</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                    <p>✓ Always validate input parameters before calling the agent</p>
                    <p>✓ Handle both success and error cases in your code</p>
                    <p>✓ Set appropriate timeouts based on the agent's average execution time</p>
                    <p>✓ Check the <code className="bg-black/50 px-2 py-1 rounded text-cyan-400">cost</code> field in the response to track spending</p>
                    <p>✓ Use budgets to control and limit agent spending automatically</p>
                    <p>✓ Monitor the <code className="bg-black/50 px-2 py-1 rounded text-cyan-400">executionTime</code> for performance tracking</p>
                </CardContent>
            </Card>
        </div>
    );
}
