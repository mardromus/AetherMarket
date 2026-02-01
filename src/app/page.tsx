"use client";
import { Navbar } from "@/components/Navbar";
import { NetworkBackground } from "@/components/NetworkBackground";
import Link from "next/link";
import { Activity, Zap, Shield, Rocket, Code2, CreditCard, Users, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <main className="min-h-screen relative text-foreground">
      <NetworkBackground />
      <Navbar />

      <div className="pt-32 px-6 max-w-6xl mx-auto pb-20 relative z-10">

        {/* HERO SECTION */}
        <div className="mb-20 animate-in slide-in-from-top duration-700">
          <div className="flex items-center gap-2 text-primary/80 font-mono text-xs mb-4 tracking-[0.2em]">
            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            AUTONOMOUS AI AGENTS ON BLOCKCHAIN
          </div>
          <h1 className="text-6xl md:text-7xl font-black tracking-tighter text-white mb-6">
            AETHER <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">MARKET</span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mb-8">
            Execute autonomous AI agents with verified payments on the Aptos blockchain. 
            Pay only for what you use with the x402 protocol. No subscriptions. No middlemen.
          </p>
          <div className="flex gap-4 flex-wrap">
            <Link href="/agents">
              <Button size="lg" className="gap-2">
                <Rocket className="w-5 h-5" />
                Browse Agents
              </Button>
            </Link>
            <Link href="/docs/guides/quickstart">
              <Button size="lg" variant="outline" className="gap-2">
                <Code2 className="w-5 h-5" />
                Get Started
              </Button>
            </Link>
          </div>
        </div>

        {/* HOW IT WORKS */}
        <div className="mb-20">
          <h2 className="text-4xl font-bold mb-12 text-white">How It Works</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[
              {
                num: "1",
                title: "Select Agent",
                desc: "Choose from 9+ AI agents with different capabilities",
                icon: <Users className="w-6 h-6" />
              },
              {
                num: "2",
                title: "Authorize Payment",
                desc: "Create a session with your budget limit",
                icon: <CreditCard className="w-6 h-6" />
              },
              {
                num: "3",
                title: "Execute Task",
                desc: "Send your request with verified payment",
                icon: <Zap className="w-6 h-6" />
              },
              {
                num: "4",
                title: "Get Result",
                desc: "Receive results instantly, pay only what you used",
                icon: <TrendingUp className="w-6 h-6" />
              }
            ].map((step, i) => (
              <div key={i} className="bg-slate-800/50 border border-slate-700 rounded-lg p-6 hover:border-cyan-400/50 transition-colors">
                <div className="w-10 h-10 bg-cyan-500/20 border border-cyan-500 rounded-full flex items-center justify-center font-bold text-cyan-400 mb-4">
                  {step.num}
                </div>
                <div className="text-cyan-400 mb-3">{step.icon}</div>
                <h3 className="font-bold text-white mb-2">{step.title}</h3>
                <p className="text-sm text-slate-300">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* KEY FEATURES */}
        <div className="mb-20">
          <h2 className="text-4xl font-bold mb-12 text-white">Why Aether Market?</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                title: "Real Autonomous Agents",
                desc: "9+ AI agents powered by GPT-4, DALL-E 3, and more. True autonomy with x402 payment verification.",
                icon: <Rocket className="w-8 h-8 text-purple-400" />
              },
              {
                title: "Pay Per Request",
                desc: "No subscriptions. No hidden fees. Only pay for what you use. 0.01 - 0.05 APT per agent call.",
                icon: <CreditCard className="w-8 h-8 text-green-400" />
              },
              {
                title: "On-Chain Verification",
                desc: "All payments verified on Aptos blockchain. Cryptographically signed. Transparent and secure.",
                icon: <Shield className="w-8 h-8 text-blue-400" />
              },
              {
                title: "Composable",
                desc: "Chain multiple agents together. Create complex workflows. Agents can invoke other agents.",
                icon: <Code2 className="w-8 h-8 text-cyan-400" />
              },
              {
                title: "Fast Execution",
                desc: "Instant agent execution. Average latency under 1 second. High-performance backend.",
                icon: <Zap className="w-8 h-8 text-yellow-400" />
              },
              {
                title: "Developer Friendly",
                desc: "Easy APIs. Comprehensive documentation. Build and deploy your own agents.",
                icon: <Activity className="w-8 h-8 text-orange-400" />
              }
            ].map((feature, i) => (
              <div key={i} className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 border border-slate-700 rounded-lg p-8 hover:border-slate-600 transition-colors">
                <div className="mb-4">{feature.icon}</div>
                <h3 className="font-bold text-white mb-3 text-lg">{feature.title}</h3>
                <p className="text-slate-300 text-sm leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* AVAILABLE AGENTS PREVIEW */}
        <div className="mb-20">
          <h2 className="text-4xl font-bold mb-12 text-white">Available Agents</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            {[
              { name: "Neural Alpha", desc: "Generate images with DALL-E 3", cost: "0.05 APT" },
              { name: "Quantum Sage", desc: "Code audit and security analysis", cost: "0.03 APT" },
              { name: "Syntax Wizard", desc: "Generate production-ready code", cost: "0.03 APT" },
              { name: "Atlas AI", desc: "General text generation and analysis", cost: "0.02 APT" },
              { name: "Oracle Prime", desc: "Real-time cryptocurrency data", cost: "0.02 APT" },
              { name: "Search Sage", desc: "Real-time web search", cost: "0.01 APT" }
            ].map((agent, i) => (
              <div key={i} className="bg-slate-800/30 border border-slate-700 rounded-lg p-6 hover:border-cyan-400/50 transition-colors">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-bold text-cyan-300">{agent.name}</h3>
                  <span className="text-sm font-mono bg-slate-700/50 px-2 py-1 rounded text-slate-300">{agent.cost}</span>
                </div>
                <p className="text-sm text-slate-300">{agent.desc}</p>
              </div>
            ))}
          </div>
          <Link href="/agents" className="inline-block">
            <Button size="lg" className="gap-2">
              <Rocket className="w-5 h-5" />
              View All Agents & Execute
            </Button>
          </Link>
        </div>

        {/* CTA SECTION */}
        <div className="bg-gradient-to-r from-cyan-900/20 to-blue-900/20 border border-cyan-800/50 rounded-lg p-12 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">Ready to Get Started?</h2>
          <p className="text-slate-300 mb-8 max-w-2xl mx-auto">
            Create a session, authorize payment, and start using AI agents in minutes.
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <Link href="/agents">
              <Button size="lg" className="gap-2">
                <Rocket className="w-5 h-5" />
                Browse Agents
              </Button>
            </Link>
            <Link href="/docs/guides/quickstart">
              <Button size="lg" variant="outline" className="gap-2">
                <Code2 className="w-5 h-5" />
                Quick Start
              </Button>
            </Link>
            <Link href="/docs/guides">
              <Button size="lg" variant="outline" className="gap-2">
                Learn More
              </Button>
            </Link>
          </div>
        </div>

      </div>
    </main>
  );
}
