'use client';

import Link from 'next/link';
import { BookOpen, Zap, Code2, Rocket, Shield, GitBranch } from 'lucide-react';

export default function GuidesPage() {
  const guides = [
    {
      title: "Quick Start Guide",
      description: "Get up and running in 30 seconds. Setup your environment, configure credentials, and make your first agent call.",
      icon: <Zap className="w-6 h-6" />,
      link: "/docs/guides/quickstart",
      tags: ["setup", "beginners", "5 min"]
    },
    {
      title: "Agent Developer Guide",
      description: "Comprehensive guide to building autonomous agents. Learn how to create, register, and deploy your own agents.",
      icon: <Code2 className="w-6 h-6" />,
      link: "/docs/guides/agent-development",
      tags: ["agents", "development", "advanced"]
    },
    {
      title: "M2M Protocol Guide",
      description: "Deep dive into the Machine-to-Machine protocol. Understand payment verification, sessions, and autonomous execution.",
      icon: <GitBranch className="w-6 h-6" />,
      link: "/docs/guides/m2m-protocol",
      tags: ["protocol", "payment", "security"]
    },
    {
      title: "Agents Marketplace",
      description: "Learn how to browse, use, and integrate different agents. Understand capabilities, pricing, and how to compose agents.",
      icon: <Rocket className="w-6 h-6" />,
      link: "/docs/guides/agents-marketplace",
      tags: ["agents", "marketplace", "usage"]
    },
    {
      title: "System Architecture",
      description: "Technical overview of the entire Aether Market system. Components, data flow, and architectural decisions.",
      icon: <Shield className="w-6 h-6" />,
      link: "/docs/guides/architecture",
      tags: ["architecture", "technical", "advanced"]
    },
    {
      title: "Troubleshooting Guide",
      description: "Common issues and solutions. Payment errors, authentication problems, agent execution failures, and more.",
      icon: <BookOpen className="w-6 h-6" />,
      link: "/docs/guides/troubleshooting",
      tags: ["help", "errors", "debugging"]
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white">
      {/* Header */}
      <div className="border-b border-slate-800 bg-slate-900/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center gap-3 mb-4">
            <BookOpen className="w-8 h-8 text-blue-400" />
            <h1 className="text-4xl font-bold">Documentation Guides</h1>
          </div>
          <p className="text-slate-300 text-lg">Learn everything you need to know about Aether Market</p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Guides Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
          {guides.map((guide, index) => (
            <Link key={index} href={guide.link}>
              <div className="h-full p-6 rounded-lg bg-slate-800/50 border border-slate-700 hover:border-blue-400 hover:bg-slate-800/80 transition-all cursor-pointer group">
                <div className="text-blue-400 mb-4 group-hover:scale-110 transition-transform">
                  {guide.icon}
                </div>
                <h3 className="text-xl font-bold mb-2 group-hover:text-blue-300 transition-colors">
                  {guide.title}
                </h3>
                <p className="text-slate-300 text-sm mb-4">
                  {guide.description}
                </p>
                <div className="flex flex-wrap gap-2">
                  {guide.tags.map((tag, i) => (
                    <span key={i} className="px-2 py-1 text-xs bg-slate-700/50 text-slate-300 rounded">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Quick Reference */}
        <div className="bg-blue-900/20 border border-blue-800/50 rounded-lg p-8 mb-16">
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
            <BookOpen className="w-6 h-6 text-blue-400" />
            Quick Reference
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-lg font-semibold mb-4 text-blue-300">Common Tasks</h3>
              <ul className="space-y-3">
                <li className="flex items-start gap-2">
                  <span className="text-blue-400 mt-1">→</span>
                  <span><strong>First Time?</strong> Start with Quick Start Guide</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-400 mt-1">→</span>
                  <span><strong>Building Agents?</strong> See Agent Developer Guide</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-400 mt-1">→</span>
                  <span><strong>Using Agents?</strong> Check Agents Marketplace Guide</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-400 mt-1">→</span>
                  <span><strong>Got an Error?</strong> See Troubleshooting Guide</span>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4 text-blue-300">Learning Paths</h3>
              <ul className="space-y-3">
                <li className="flex items-start gap-2">
                  <span className="text-blue-400 mt-1">📚</span>
                  <span><strong>Beginner Path:</strong> Quick Start → Agents Marketplace → User Guide</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-400 mt-1">🔧</span>
                  <span><strong>Developer Path:</strong> Agent Dev Guide → Architecture → Examples</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-400 mt-1">⚙️</span>
                  <span><strong>Advanced Path:</strong> M2M Protocol → System Architecture</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Tips */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 rounded-lg bg-green-900/20 border border-green-800/50">
            <h3 className="font-bold text-green-300 mb-2">💡 Pro Tip</h3>
            <p className="text-sm text-slate-300">
              Use the search functionality on the docs page to quickly find what you need.
            </p>
          </div>
          <div className="p-6 rounded-lg bg-yellow-900/20 border border-yellow-800/50">
            <h3 className="font-bold text-yellow-300 mb-2">⏱️ Time Estimates</h3>
            <p className="text-sm text-slate-300">
              Quick Start: 5 min | Basic Usage: 15 min | Full Learning: 1-2 hours
            </p>
          </div>
          <div className="p-6 rounded-lg bg-purple-900/20 border border-purple-800/50">
            <h3 className="font-bold text-purple-300 mb-2">📖 Need More?</h3>
            <p className="text-sm text-slate-300">
              Check the main docs page for code examples, API reference, and FAQs.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
