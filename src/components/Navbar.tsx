import { KeylessWalletSelector } from "./KeylessWalletSelector";
import Link from "next/link";
import { Cpu, LayoutDashboard, Settings, Bot, BookOpen, Code2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export function Navbar() {
    return (
        <nav className="w-full h-16 border-b border-white/10 bg-black/50 backdrop-blur-md flex items-center justify-between px-6 fixed top-0 z-50">
            <div className="flex items-center gap-2">
                <div className="p-2 rounded-full bg-primary/20">
                    <Cpu className="w-6 h-6 text-primary animate-pulse" />
                </div>
                <Link href="/" className="text-xl font-bold tracking-tighter text-glow text-white group mr-8">
                    AETHER <span className="text-primary group-hover:text-pink-500 transition-colors">MARKET</span>
                </Link>

                {/* Essential Navigation Links */}
                <div className="hidden md:flex gap-6 items-center border-l border-white/10 pl-6 h-8">
                    <Link href="/agents" className="text-xs font-bold tracking-wider text-muted-foreground hover:text-cyan-400 transition-colors flex items-center gap-2">
                        <Bot className="w-3 h-3" /> AGENTS
                    </Link>
                    <Link href="/admin" className="text-xs font-bold tracking-wider text-muted-foreground hover:text-purple-400 transition-colors flex items-center gap-2">
                        <Settings className="w-3 h-3" /> ADMIN
                    </Link>
                    <Link href="/dashboard" className="text-xs font-bold tracking-wider text-muted-foreground hover:text-green-400 transition-colors flex items-center gap-2">
                        <LayoutDashboard className="w-3 h-3" /> DASHBOARD
                    </Link>
                    <Link href="/docs" className="text-xs font-bold tracking-wider text-muted-foreground hover:text-blue-400 transition-colors flex items-center gap-2">
                        <BookOpen className="w-3 h-3" /> DOCS
                    </Link>
                    <Link href="/integration" className="text-xs font-bold tracking-wider text-muted-foreground hover:text-teal-400 transition-colors flex items-center gap-2">
                        <Code2 className="w-3 h-3" /> INTEGRATION
                    </Link>
                </div>
            </div>
            <div className="flex gap-4 items-center">
                <KeylessWalletSelector />
            </div>
        </nav>
    );
} 
