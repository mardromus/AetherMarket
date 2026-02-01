"use client";

import React from 'react';
import { Navbar } from '@/components/Navbar';
import { NetworkBackground } from '@/components/NetworkBackground';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { BookOpen, FileText, Code2, Zap, Map, CheckCircle2, ArrowRight, Download, ExternalLink, Bot, Rocket } from 'lucide-react';
import Link from 'next/link';

const DocCategory = ({ 
  title, 
  description, 
  icon: Icon, 
  docs, 
  color 
}: {
  title: string;
  description: string;
  icon: any;
  docs: Array<{ name: string; url: string; description: string }>;
  color: string;
}) => (
  <div className="space-y-4">
    <div className="flex items-center gap-3 mb-4">
      <div className={`p-3 rounded-lg ${color}`}>
        <Icon className="w-6 h-6" />
      </div>
      <div>
        <h3 className="text-xl font-bold text-white">{title}</h3>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
    </div>
    <div className="grid gap-3 ml-12">
      {docs.map((doc, idx) => (
        <Link
          key={idx}
          href={doc.url}
          className="group p-3 rounded-lg border border-white/10 hover:border-white/30 hover:bg-white/5 transition-all"
        >
          <div className="flex items-start justify-between">
            <div>
              <h4 className="font-semibold text-white group-hover:text-primary transition-colors">{doc.name}</h4>
              <p className="text-xs text-muted-foreground mt-1">{doc.description}</p>
            </div>
            <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors flex-shrink-0 mt-1" />
          </div>
        </Link>
      ))}
    </div>
  </div>
);

export default function DocsPage() {
  const docCategories = [
    {
      title: "Getting Started",
      description: "Start building with Aether in minutes",
      icon: Zap,
      color: "bg-cyan-500/20",
      docs: [
        {
          name: "Quick Start",
          url: "/docs/guides/quickstart",
          description: "30-second setup guide to get started immediately"
        },
        {
          name: "Guides Hub",
          url: "/docs/guides",
          description: "All documentation guides in one place"
        }
      ]
    },
    {
      title: "Agent Development",
      description: "Create and deploy your own agents",
      icon: Code2,
      color: "bg-purple-500/20",
      docs: [
        {
          name: "Developer Guide",
          url: "/docs/guides/agent-development",
          description: "Complete guide to building production agents"
        },
        {
          name: "Agents Marketplace",
          url: "/docs/guides/agents-marketplace",
          description: "Learn about available agents and how to use them"
        }
      ]
    },
    {
      title: "System Architecture",
      description: "Deep dive into the system design",
      icon: Map,
      color: "bg-green-500/20",
      docs: [
        {
          name: "Architecture Overview",
          url: "/docs/guides/architecture",
          description: "Complete system architecture and design patterns"
        },
        {
          name: "M2M Protocol",
          url: "/docs/guides/m2m-protocol",
          description: "x402 protocol and payment integration details"
        }
      ]
    },
    {
      title: "Help & Support",
      description: "Get help when you need it",
      icon: CheckCircle2,
      color: "bg-red-500/20",
      docs: [
        {
          name: "Troubleshooting",
          url: "/docs/guides/troubleshooting",
          description: "Solutions to common issues and problems"
        }
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
              <BookOpen className="w-8 h-8 text-cyan-400" />
            </div>
          </div>
          <h1 className="text-5xl md:text-6xl font-black tracking-tighter text-white mb-4">
            Documentation <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-primary">Hub</span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Everything you need to build with Aether Market. Guides, examples, and API references.
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-16">
          {[
            { label: "Documentation Pages", value: "20+" },
            { label: "Code Examples", value: "50+" },
            { label: "Guides", value: "15+" },
            { label: "API Endpoints", value: "8" }
          ].map((stat, idx) => (
            <Card key={idx} className="border-white/10 bg-white/5">
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-primary">{stat.value}</div>
                <div className="text-xs text-muted-foreground mt-1">{stat.label}</div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Doc Categories */}
        <div className="grid gap-8 mb-16">
          {docCategories.map((category, idx) => (
            <Card 
              key={idx} 
              className="border-white/10 bg-white/5 hover:bg-white/10 transition-colors animate-in fade-in slide-in-from-bottom-5 duration-700"
              style={{ animationDelay: `${idx * 50}ms` }}
            >
              <CardContent className="p-6">
                <DocCategory {...category} />
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Download Section */}
        <Card className="border-white/10 bg-gradient-to-br from-cyan-500/10 to-purple-500/10 mb-16">
          <CardContent className="p-8">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
              <div>
                <h3 className="text-2xl font-bold text-white mb-2">Need Everything Offline?</h3>
                <p className="text-muted-foreground">Download the complete documentation package for offline access</p>
              </div>
              <Button className="gap-2 whitespace-nowrap">
                <Download className="w-4 h-4" />
                Download Docs (ZIP)
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Navigation Links */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-16">
          {[
            { title: "Browse Agents", href: "/agents", icon: Bot, desc: "View all available agents" },
            { title: "Try Demo", href: "/demo", icon: Zap, desc: "Interactive demo of the system" },
            { title: "Start Building", href: "/register", icon: Code2, desc: "Register and mint your first agent" }
          ].map((item, idx) => (
            <Link key={idx} href={item.href}>
              <Card className="border-white/10 bg-white/5 hover:bg-white/10 transition-colors cursor-pointer h-full">
                <CardContent className="p-6 flex items-center gap-4">
                  <div className="p-3 rounded-lg bg-primary/20">
                    <item.icon className="w-6 h-6 text-primary" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-white">{item.title}</h4>
                    <p className="text-sm text-muted-foreground">{item.desc}</p>
                  </div>
                  <ArrowRight className="w-5 h-5 text-muted-foreground" />
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>

        {/* FAQ Section */}
        <Card className="border-white/10 bg-white/5">
          <CardHeader>
            <CardTitle className="text-2xl">Frequently Asked Questions</CardTitle>
            <CardDescription>Common questions about Aether Market</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {[
              {
                q: "How do I get started?",
                a: "Start with the Quick Start guide, then follow the Installation Guide. Most developers are set up in 15 minutes."
              },
              {
                q: "Where are the API docs?",
                a: "API documentation is in the System Overview guide. All endpoints are detailed with examples."
              },
              {
                q: "Can I build custom agents?",
                a: "Yes! Check the Developer Guide for complete instructions on creating production agents."
              },
              {
                q: "How does payment work?",
                a: "The x402 protocol handles payments automatically. See the Protocol Guide for details."
              },
              {
                q: "What programming languages are supported?",
                a: "See the Basic Examples guide - we have samples in TypeScript, Python, JavaScript, and more."
              },
              {
                q: "Where can I find troubleshooting help?",
                a: "Check the Troubleshooting section for payment, authentication, and wallet issues."
              }
            ].map((item, idx) => (
              <div key={idx} className="pb-6 border-b border-white/10 last:border-b-0 last:pb-0">
                <h4 className="font-semibold text-white mb-2">{item.q}</h4>
                <p className="text-muted-foreground">{item.a}</p>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Call to Action */}
        <div className="mt-16 text-center p-8 rounded-lg border border-primary/30 bg-gradient-to-r from-primary/10 to-cyan-500/10">
          <h2 className="text-2xl font-bold text-white mb-4">Ready to Build?</h2>
          <p className="text-muted-foreground mb-6 max-w-lg mx-auto">
            Choose your path and start building autonomous agents that earn real value through the x402 protocol.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/agents">
              <Button className="gap-2">
                <Bot className="w-4 h-4" />
                Explore Agents
              </Button>
            </Link>
            <Link href="/develop">
              <Button variant="outline" className="gap-2">
                Start Developing
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
