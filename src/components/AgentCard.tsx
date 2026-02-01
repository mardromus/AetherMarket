"use client";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Zap, ShieldCheck, Cpu, Box, Info } from "lucide-react";
import Link from "next/link";
import { Agent } from "@/store/agentStore";
import { useState } from "react";
import { StakingModal } from "./StakingModal";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "sonner";

export function AgentCard({ agent }: { agent: Agent }) {
    const [isStakingOpen, setIsStakingOpen] = useState(false);

    return (
        <Card className="glass-card hover:scale-105 transition-transform duration-300 border-primary/30 group relative overflow-hidden bg-black/60">
            {/* Hover Glow Effect */}
            <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />

            <CardHeader className="flex flex-row items-center gap-4 pb-2">
                <Avatar className="h-14 w-14 ring-2 ring-primary ring-offset-2 ring-offset-black">
                    <AvatarImage src={agent.imageUrl} />
                    <AvatarFallback className="bg-secondary text-primary font-bold">{agent.name.substring(0, 2).toUpperCase()}</AvatarFallback>
                </Avatar>
                <div>
                    <CardTitle className="text-white text-lg font-bold tracking-tight">{agent.name}</CardTitle>
                    <div className="flex gap-2 mt-1">
                        <Badge variant="outline" className="border-primary/50 text-primary bg-primary/10 text-[10px] px-1 py-0 h-5">
                            <Zap className="w-3 h-3 mr-1 fill-current" /> {agent.price} APT/req
                        </Badge>
                        {agent.isSwarm && (
                            <Badge variant="outline" className="border-purple-500/50 text-purple-400 bg-purple-500/10 text-[10px] px-1 py-0 h-5 animate-pulse">
                                SWARM
                            </Badge>
                        )}
                    </div>
                </div>
            </CardHeader>
            <CardContent className="space-y-4">
                <p className="text-muted-foreground text-xs line-clamp-2 min-h-[32px]">{agent.description}</p>

                {/* Tech Specs Data Grid */}
                {agent.specs && (
                    <div className="grid grid-cols-2 gap-2 text-[10px] font-mono border-t border-white/10 pt-3">
                        <div className="text-muted-foreground">ARCH: <span className="text-white">{agent.specs.architecture}</span></div>
                        <div className="text-muted-foreground">TFLOPS: <span className="text-cyan-400">{agent.specs.tflops}</span></div>
                        <div className="text-muted-foreground">VRAM: <span className="text-white">{agent.specs.vram}</span></div>
                        <div className="text-muted-foreground">LATENCY: <span className="text-green-400">{agent.specs.latency}</span></div>
                    </div>
                )}

                <div className="grid grid-cols-2 gap-2 mt-3 pt-3 border-t border-white/10 text-[10px] font-mono">
                    {agent.onChainData ? (
                        <>
                            <div className="flex items-center text-green-400 gap-1">
                                <ShieldCheck className="w-3 h-3" />
                                SCORE: {agent.onChainData.reputationScore}/1000
                            </div>
                            <div className="text-right text-muted-foreground">
                                ID: <span className="text-white">#{agent.onChainData.registryId.split('::')[1]}</span>
                            </div>
                            <div className="text-muted-foreground">
                                VOL: <span className="text-yellow-400">{agent.onChainData.totalVolume.toLocaleString()} APT</span>
                            </div>
                            <div className="text-right text-red-400/80">
                                DISPUTE: {agent.onChainData.disputeRate}%
                            </div>
                        </>
                    ) : (
                        <div className="col-span-2 text-center text-yellow-500/50 flex items-center justify-center gap-1">
                            <ShieldCheck className="w-3 h-3" /> OFF-CHAIN (UNVERIFIED)
                        </div>
                    )}
                </div>
            </CardContent>
            <CardFooter className="pt-0 flex gap-2">
                <Link href={`/agent/${agent.id}`} className="flex-1">
                    <Button
                        className="w-full bg-primary/90 hover:bg-cyan-400 text-black font-bold shadow-[0_0_15px_rgba(14,165,233,0.2)] group-hover:shadow-[0_0_25px_rgba(14,165,233,0.5)] transition-all h-9 text-xs"
                    >
                        <Cpu className="w-3 h-3 mr-2" /> INITIALIZE
                    </Button>
                </Link>

                {/* Info Dialog */}
                <Dialog>
                    <DialogTrigger asChild>
                        <Button variant="outline" className="w-[48px] border-white/10 text-white text-[10px] h-9">
                            <Info className="w-3 h-3" />
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>How to use {agent.name}</DialogTitle>
                            <DialogDescription className="mt-2">Quick copyable example and integration guide for this agent.</DialogDescription>
                        </DialogHeader>

                        <pre className="mt-4 bg-[#07111a] p-3 rounded text-xs overflow-auto"><code>{`const result = await client.executeAgentTask({\n  agentId: "${agent.id}",\n  taskType: "${agent.specs ? agent.specs.architecture : 'task'}",\n  parameters: { /* ... */ }\n});`}</code></pre>

                        <div className="mt-4 flex gap-2">
                            <Link href="/integration">
                                <Button className="text-xs">Open Integration Guide</Button>
                            </Link>
                            <Button className="text-xs" onClick={() => { navigator.clipboard.writeText(`const result = await client.executeAgentTask({ agentId: "${agent.id}", taskType: "${agent.specs ? agent.specs.architecture : 'task'}", parameters: { /* ... */ } });`); toast.success('Copied to clipboard'); }}>Copy</Button>
                        </div>
                    </DialogContent>
                </Dialog>

                {/* Mock Staking Button */}
                <Button
                    variant="outline"
                    className="w-[80px] border-purple-500/50 text-purple-400 text-[10px] h-9 hover:bg-purple-500/20 font-mono"
                    onClick={() => setIsStakingOpen(true)}
                >
                    STAKE
                </Button>
            </CardFooter>

            <StakingModal
                isOpen={isStakingOpen}
                onClose={() => setIsStakingOpen(false)}
                agentName={agent.name}
                agentId={agent.id}
            />
        </Card>
    );
}
