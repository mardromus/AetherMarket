"use client";
import { Navbar } from "@/components/Navbar";
import { AgentCard } from "@/components/AgentCard";
import { useAgentStore } from "@/store/agentStore";
import { useEffect, useState } from "react";
import { NetworkBackground } from "@/components/NetworkBackground";
import { Activity, Cpu, Globe, Zap } from "lucide-react";
import { Separator } from "@/components/ui/separator";

export default function Home() {
  const { agents } = useAgentStore();
  const [mounted, setMounted] = useState(false);

  // Hydration fix for Persist middleware
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return <div className="min-h-screen bg-black" />;

  return (
    <main className="min-h-screen relative text-foreground">
      <NetworkBackground />
      <Navbar />

      <div className="pt-32 px-6 max-w-[1600px] mx-auto pb-20 relative z-10">

        {/* HERO SECTION: Command Center Header */}
        <div className="flex flex-col md:flex-row justify-between items-end mb-12 border-b border-white/10 pb-8 animate-in slide-in-from-top duration-700">
          <div>
            <div className="flex items-center gap-2 text-primary/80 font-mono text-xs mb-2 tracking-[0.2em]">
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              SYSTEM STATUS: OPTIMAL
            </div>
            <h1 className="text-5xl md:text-7xl font-black tracking-tighter text-white">
              NEURAL <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-primary">GRID</span>
            </h1>
            <p className="text-muted-foreground mt-2 max-w-xl text-lg">
              Decentralized Swarm Orchestration Protocol. <br />
              Verifiable Compute. Micro-Latency. Zero Trust.
            </p>
          </div>

          {/* Global Stats Dashboard */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-8 md:mt-0 font-mono text-sm">
            <div className="flex flex-col">
              <span className="text-muted-foreground text-xs uppercase">Active Nodes</span>
              <span className="text-2xl font-bold text-white flex items-center gap-2">
                <Globe className="w-4 h-4 text-primary" /> 4,821
              </span>
            </div>
            <div className="flex flex-col">
              <span className="text-muted-foreground text-xs uppercase">24h Volume</span>
              <span className="text-2xl font-bold text-white flex items-center gap-2">
                <Activity className="w-4 h-4 text-green-400" /> 8.5M APT
              </span>
            </div>
            <div className="flex flex-col">
              <span className="text-muted-foreground text-xs uppercase">Avg Latency</span>
              <span className="text-2xl font-bold text-white flex items-center gap-2">
                <Zap className="w-4 h-4 text-yellow-400" /> 12ms
              </span>
            </div>
            <div className="flex flex-col">
              <span className="text-muted-foreground text-xs uppercase">Total TFLOPS</span>
              <span className="text-2xl font-bold text-white flex items-center gap-2">
                <Cpu className="w-4 h-4 text-purple-400" /> 542 P
              </span>
            </div>
          </div>
        </div>

        {/* SWARM GRID */}
        <div className="space-y-6">
          <div className="flex items-center gap-4">
            <h2 className="text-xl font-bold tracking-widest text-white border-l-4 border-primary pl-4">DEPLOYED SWARMS</h2>
            <Separator className="flex-1 bg-white/10" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {agents.map((agent, i) => (
              <div key={agent.id} className={`animate-in fade-in slide-in-from-bottom-5 duration-700`} style={{ animationDelay: `${i * 100}ms` }}>
                <AgentCard agent={agent} />
              </div>
            ))}
          </div>
        </div>

      </div>
    </main>
  );
}
