"use client";

import React from 'react';
import { Navbar } from '@/components/Navbar';
import { NetworkBackground } from '@/components/NetworkBackground';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { ArrowRight, Map, Users, Zap, Code2, BookOpen, Cpu, Settings, Sparkles, CheckCircle2 } from 'lucide-react';

export default function SitemapPage() {
  const sections = [
    {
      title: "🚀 Getting Started",
      description: "New to Aether? Start here",
      icon: Zap,
      color: "from-cyan-500 to-blue-500",
      items: [
        { name: "Home", href: "/", desc: "Main landing page" },
        { name: "Features", href: "/features", desc: "Core platform features" },
        { name: "Documentation Hub", href: "/docs", desc: "All documentation and guides" },
        { name: "Quick Start", href: "/docs#quick-start", desc: "Get started in 5 minutes" }
      ]
    },
    {
      title: "🤖 Agents",
      description: "Browse and interact with agents",
      icon: Cpu,
      color: "from-purple-500 to-pink-500",
      items: [
        { name: "Agents Marketplace", href: "/agents", desc: "Browse and execute all available agents" }
      ]
    },
    {
      title: "🛠️ Building & Development",
      description: "Create your own agents",
      icon: Code2,
      color: "from-green-500 to-emerald-500",
      items: [
        { name: "Build Guide", href: "/develop", desc: "Complete development guide" },
        { name: "Register Agent", href: "/register", desc: "Register a new agent" },
        { name: "Publish Agent", href: "/publish", desc: "Deploy your agent to the network" },
        { name: "Code Examples", href: "/docs#code-examples", desc: "Ready-to-use code samples" }
      ]
    },
    {
      title: "📚 Documentation",
      description: "Learn everything in detail",
      icon: BookOpen,
      color: "from-orange-500 to-red-500",
      items: [
        { name: "System Architecture", href: "/docs#system-architecture", desc: "How the system works" },
        { name: "Developer Guide", href: "/docs#agent-development", desc: "Build production agents" },
        { name: "User Guide", href: "/docs#user-guides", desc: "Using the platform as an end user" },
        { name: "API Reference", href: "/docs#system-architecture", desc: "Complete API documentation" }
      ]
    },
    {
      title: "💳 Protocol & Payment",
      description: "Learn about x402 and payments",
      icon: Sparkles,
      color: "from-yellow-500 to-orange-500",
      items: [
        { name: "Protocol Explainer", href: "/protocol", desc: "How x402 payment protocol works" },
        { name: "Payment Flow", href: "/protocol#flow", desc: "8-step payment verification" },
        { name: "M2M Demo", href: "/demo", desc: "Interactive M2M payment demo" }
      ]
    },
    {
      title: "👤 User Account",
      description: "Manage your profile and wallet",
      icon: Users,
      color: "from-pink-500 to-rose-500",
      items: [
        { name: "Dashboard", href: "/dashboard", desc: "Your personal dashboard" },
        { name: "Authentication", href: "/auth/callback", desc: "Login and authentication" },
        { name: "Wallet Settings", href: "/dashboard#wallet", desc: "Configure your wallet" }
      ]
    },
    {
      title: "⚙️ Configuration & Setup",
      description: "Technical setup information",
      icon: Settings,
      color: "from-slate-500 to-gray-500",
      items: [
        { name: "Environment Setup", href: "/docs#getting-started", desc: "Configure your environment" },
        { name: "API Keys", href: "/docs#api-reference", desc: "Manage API credentials" },
        { name: "Troubleshooting", href: "/docs#troubleshooting", desc: "Fix common issues" }
      ]
    }
  ];

  return (
    <div className="min-h-screen relative text-foreground bg-black">
      <NetworkBackground />
      <Navbar />

      <div className="pt-32 px-6 max-w-6xl mx-auto pb-20 relative z-10">
        {/* Header */}
        <div className="text-center mb-16 animate-in slide-in-from-top duration-700">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="p-3 rounded-full bg-cyan-500/20">
              <Map className="w-8 h-8 text-cyan-400" />
            </div>
          </div>
          <h1 className="text-5xl md:text-6xl font-black tracking-tighter text-white mb-4">
            Site <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-primary">Map</span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Complete navigation guide for the Aether Market platform. Find what you need quickly.
          </p>
        </div>

        {/* Overview Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-16">
          {[
            { label: "Pages", value: "15+" },
            { label: "APIs", value: "8" },
            { label: "Agents", value: "9+" },
            { label: "Guides", value: "20+" }
          ].map((stat, idx) => (
            <Card key={idx} className="border-white/10 bg-white/5">
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-primary">{stat.value}</div>
                <div className="text-xs text-muted-foreground mt-1">{stat.label}</div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Navigation Sections */}
        <div className="grid gap-8 mb-16">
          {sections.map((section, sectionIdx) => {
            const Icon = section.icon;
            return (
              <Card 
                key={sectionIdx}
                className="border-white/10 bg-white/5 hover:bg-white/10 transition-colors animate-in fade-in slide-in-from-bottom-5 duration-700"
                style={{ animationDelay: `${sectionIdx * 50}ms` }}
              >
                <CardHeader className={`bg-gradient-to-r ${section.color} bg-clip-text text-transparent`}>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-white/10">
                        <Icon className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <CardTitle className="text-white">{section.title}</CardTitle>
                        <CardDescription>{section.description}</CardDescription>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {section.items.map((item, itemIdx) => (
                      <Link key={itemIdx} href={item.href}>
                        <div className="p-4 rounded-lg border border-white/10 hover:border-white/30 hover:bg-white/5 transition-all cursor-pointer h-full group">
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex-1">
                              <h4 className="font-semibold text-white group-hover:text-primary transition-colors">{item.name}</h4>
                              <p className="text-xs text-muted-foreground mt-1">{item.desc}</p>
                            </div>
                            <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors flex-shrink-0 mt-1" />
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Quick Access Section */}
        <Card className="border-primary/30 bg-gradient-to-r from-primary/10 to-cyan-500/10 mb-16">
          <CardHeader>
            <CardTitle className="text-2xl">Quick Access Shortcuts</CardTitle>
            <CardDescription>Most commonly used paths</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Link href="/agents" className="group">
                <Button className="w-full justify-between group-hover:bg-cyan-600" variant="outline">
                  <span>Browse Agents</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
              <Link href="/docs" className="group">
                <Button className="w-full justify-between group-hover:bg-blue-600" variant="outline">
                  <span>Documentation</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
              <Link href="/develop" className="group">
                <Button className="w-full justify-between group-hover:bg-green-600" variant="outline">
                  <span>Start Building</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
              <Link href="/protocol" className="group">
                <Button className="w-full justify-between group-hover:bg-purple-600" variant="outline">
                  <span>Learn Protocol</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
              <Link href="/demo" className="group">
                <Button className="w-full justify-between group-hover:bg-yellow-600" variant="outline">
                  <span>Interactive Demo</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
              <Link href="/dashboard" className="group">
                <Button className="w-full justify-between group-hover:bg-pink-600" variant="outline">
                  <span>My Dashboard</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* API Routes Reference */}
        <Card className="border-white/10 bg-white/5 mb-16">
          <CardHeader>
            <CardTitle className="text-2xl">API Routes Reference</CardTitle>
            <CardDescription>Backend endpoints available for integration</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { 
                  method: "POST", 
                  path: "/api/agent/execute", 
                  desc: "Execute an agent with payment verification"
                },
                { 
                  method: "POST", 
                  path: "/api/agents/discover", 
                  desc: "Search and discover agents by capability"
                },
                { 
                  method: "POST", 
                  path: "/api/sessions/config", 
                  desc: "Manage user sessions and budgets"
                },
                { 
                  method: "POST", 
                  path: "/api/sessions/create", 
                  desc: "Create a new user session"
                },
                { 
                  method: "POST", 
                  path: "/api/sessions/sign-payment", 
                  desc: "Sign payment transactions"
                },
                { 
                  method: "GET", 
                  path: "/api/mock-agent", 
                  desc: "Testing endpoint with mock agents"
                }
              ].map((endpoint, idx) => (
                <div key={idx} className="p-4 rounded-lg border border-white/10 hover:border-white/20 transition-colors font-mono text-sm">
                  <div className="flex items-center gap-4">
                    <Badge variant="outline" className="bg-cyan-500/20 text-cyan-300 border-cyan-500/30">
                      {endpoint.method}
                    </Badge>
                    <div className="flex-1">
                      <div className="text-white">{endpoint.path}</div>
                      <div className="text-xs text-muted-foreground mt-1">{endpoint.desc}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Search & Help */}
        <Card className="border-white/10 bg-white/5">
          <CardHeader>
            <CardTitle>Can't Find What You're Looking For?</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground">
              Check out the comprehensive documentation hub with guides, tutorials, and API references.
            </p>
            <div className="flex gap-3">
              <Link href="/docs">
                <Button className="gap-2">
                  <BookOpen className="w-4 h-4" />
                  Go to Documentation
                </Button>
              </Link>
              <Link href="/features">
                <Button variant="outline">
                  View Features
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
