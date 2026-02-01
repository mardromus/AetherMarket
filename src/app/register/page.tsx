"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useRouter } from "next/navigation";
import { useAgentStore } from "@/store/agentStore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { NetworkBackground } from "@/components/NetworkBackground";
import { Navbar } from "@/components/Navbar";
import { Cpu, ShieldCheck, Upload, Activity } from "lucide-react";

// Schema for the Agent Identity
const agentSchema = z.object({
    name: z.string().min(3, "Name must be at least 3 characters"),
    description: z.string().min(10, "Description must be at least 10 characters"),
    price: z.coerce.number().min(0.01, "Price must be at least 0.01 APT"),
    endpoint: z.string().url("Must be a valid URL"),
    architecture: z.string().min(3, "Architecture is required"),
});

export default function RegisterAgent() {
    const router = useRouter();
    const addAgent = useAgentStore((state) => state.addAgent);
    const [isMinting, setIsMinting] = useState(false);

    const form = useForm({
        resolver: zodResolver(agentSchema) as any,
        defaultValues: {
            name: "",
            description: "",
            price: 0.1,
            endpoint: "https://agent-api.example.com",
            architecture: "Llama-3-70B-Quantized",
        },
    });

    async function onSubmit(values: z.infer<typeof agentSchema>) {
        setIsMinting(true);
        toast.info("Initiating On-Chain Transaction...", {
            description: "Interacting with AgentRegistry::register_agent"
        });

        // Simulate Network Delay
        await new Promise(resolve => setTimeout(resolve, 2500));

        const newId = crypto.randomUUID();
        const mockRegistryId = `0x1::agent_registry::${Math.floor(Math.random() * 1000)}`;

        addAgent({
            id: newId,
            name: values.name,
            description: values.description,
            price: values.price,
            reputation: 50, // Initial Score
            imageUrl: `https://robohash.org/${newId}?set=set1&bgset=bg1`,
            endpoint: values.endpoint,
            category: "General Intelligence",
            specs: {
                architecture: values.architecture,
                tflops: "100 TFLOPS (Est)",
                vram: "Unknown",
                latency: "500ms"
            },
            onChainData: {
                registryId: mockRegistryId,
                ownerAddress: "0x...UserWallet",
                reputationScore: 500, // Start Neutral
                totalVolume: 0,
                disputeRate: 0
            }
        });

        setIsMinting(false);
        toast.success("Identity Minted Successfully!", {
            description: `Agent ID: ${mockRegistryId}`
        });

        router.push("/dashboard");
    }

    return (
        <main className="min-h-screen relative text-foreground bg-black overflow-hidden">
            <NetworkBackground />
            <Navbar />

            <div className="pt-32 px-6 max-w-3xl mx-auto pb-20 relative z-10 animate-in fade-in slide-in-from-bottom-10 duration-700">
                <div className="mb-8 text-center">
                    <h1 className="text-4xl font-black tracking-tighter text-white mb-2">
                        MINT <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-primary">AGENT IDENTITY</span>
                    </h1>
                    <p className="text-muted-foreground">
                        Deploy your Agent Capability Object (AIS) to the Aptos Neural Grid.
                    </p>
                </div>

                <Card className="glass-card border-primary/20 bg-black/60 backdrop-blur-xl">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <ShieldCheck className="w-5 h-5 text-green-400" />
                            Identity Protocol v1
                        </CardTitle>
                        <CardDescription>
                            Fill in the technical specifications for your autonomous agent.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Agent Alias</Label>
                                    <Input {...form.register("name")} placeholder="e.g. Oracle-Alpha" className="bg-white/5 border-white/10 text-white" />
                                    {form.formState.errors.name && <p className="text-red-400 text-xs">{form.formState.errors.name.message}</p>}
                                </div>
                                <div className="space-y-2">
                                    <Label>Rate (APT / Request)</Label>
                                    <Input {...form.register("price")} type="number" step="0.01" className="bg-white/5 border-white/10 text-white" />
                                    {form.formState.errors.price && <p className="text-red-400 text-xs">{form.formState.errors.price.message}</p>}
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label>Architecture / Model Hash</Label>
                                <Input {...form.register("architecture")} placeholder="SHA256 Hash or Model Name" className="bg-white/5 border-white/10 text-white font-mono text-xs" />
                                {form.formState.errors.architecture && <p className="text-red-400 text-xs">{form.formState.errors.architecture.message}</p>}
                            </div>

                            <div className="space-y-2">
                                <Label>Endpoint URL (https)</Label>
                                <Input {...form.register("endpoint")} placeholder="https://api.my-agent.com/v1" className="bg-white/5 border-white/10 text-white font-mono text-xs" />
                                {form.formState.errors.endpoint && <p className="text-red-400 text-xs">{form.formState.errors.endpoint.message}</p>}
                            </div>

                            <div className="space-y-2">
                                <Label>Capability Description</Label>
                                <Textarea {...form.register("description")} placeholder="Describe what tasks this agent can perform..." className="bg-white/5 border-white/10 text-white min-h-[100px]" />
                                {form.formState.errors.description && <p className="text-red-400 text-xs">{form.formState.errors.description.message}</p>}
                            </div>

                            <Button type="submit" disabled={isMinting} className="w-full h-12 text-lg font-bold bg-primary hover:bg-cyan-400 text-black transition-all shadow-[0_0_20px_rgba(14,165,233,0.3)]">
                                {isMinting ? (
                                    <>
                                        <Activity className="w-5 h-5 mr-2 animate-spin" /> MINTING ON-CHAIN...
                                    </>
                                ) : (
                                    <>
                                        <Cpu className="w-5 h-5 mr-2" /> DEPLOY TO MAINNET
                                    </>
                                )}
                            </Button>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </main>
    );
}
