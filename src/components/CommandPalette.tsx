"use client";
import * as React from "react";
import { useRouter } from "next/navigation";
import { Zap, Terminal, Globe, Home, Search, X } from "lucide-react";

export function CommandPalette() {
    const [open, setOpen] = React.useState(false);
    const router = useRouter();

    React.useEffect(() => {
        const down = (e: KeyboardEvent) => {
            if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
                e.preventDefault();
                setOpen((open) => !open);
            }
        };

        document.addEventListener("keydown", down);
        return () => document.removeEventListener("keydown", down);
    }, []);

    const run = (path: string) => {
        setOpen(false);
        router.push(path);
    }

    if (!open) return (
        <div className="fixed bottom-4 right-4 z-50 pointer-events-none hidden md:block opacity-50">
            <div className="bg-black/80 backdrop-blur border border-white/20 rounded-md px-2 py-1 text-[10px] text-muted-foreground font-mono flex items-center gap-1">
                <span className="text-xs">⌘</span>K
            </div>
        </div>
    );

    return (
        <div className="fixed inset-0 z-[100] flex items-start justify-center pt-[20vh] bg-black/60 backdrop-blur-sm animate-in fade-in duration-200" onClick={() => setOpen(false)}>
            <div className="w-full max-w-lg bg-black border border-white/20 rounded-xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200" onClick={e => e.stopPropagation()}>
                <div className="flex items-center px-4 border-b border-white/10">
                    <Search className="w-4 h-4 text-muted-foreground mr-2" />
                    <input
                        autoFocus
                        className="flex-1 bg-transparent border-none py-4 text-white placeholder:text-muted-foreground focus:outline-none text-sm"
                        placeholder="Type a command..."
                    />
                    <div className="text-[10px] text-muted-foreground border border-white/10 px-1.5 py-0.5 rounded">ESC</div>
                </div>

                <div className="p-2">
                    <div className="text-[10px] uppercase tracking-wider text-muted-foreground px-2 py-2 font-bold mb-1">System</div>

                    <button onClick={() => run('/')} className="w-full flex items-center gap-3 px-3 py-2 text-sm text-gray-300 hover:bg-white/10 hover:text-white rounded-lg transition-colors text-left group">
                        <Home className="w-4 h-4 group-hover:text-primary" />
                        <span>Command Center</span>
                    </button>

                    <button onClick={() => run('/dashboard')} className="w-full flex items-center gap-3 px-3 py-2 text-sm text-gray-300 hover:bg-white/10 hover:text-white rounded-lg transition-colors text-left group">
                        <Zap className="w-4 h-4 group-hover:text-yellow-400" />
                        <span>User Dashboard</span>
                    </button>

                    <button onClick={() => run('/protocol')} className="w-full flex items-center gap-3 px-3 py-2 text-sm text-gray-300 hover:bg-white/10 hover:text-white rounded-lg transition-colors text-left group">
                        <Globe className="w-4 h-4 group-hover:text-blue-400" />
                        <span>Protocol Status</span>
                    </button>

                    <div className="h-px bg-white/10 my-2" />

                    <div className="text-[10px] uppercase tracking-wider text-muted-foreground px-2 py-2 font-bold mb-1">Actions</div>

                    <button onClick={() => run('/publish')} className="w-full flex items-center gap-3 px-3 py-2 text-sm text-gray-300 hover:bg-white/10 hover:text-white rounded-lg transition-colors text-left group">
                        <Terminal className="w-4 h-4 group-hover:text-green-400" />
                        <span>Mint New Node</span>
                    </button>
                </div>

                <div className="bg-white/5 px-4 py-2 text-[10px] text-muted-foreground border-t border-white/10 flex justify-between">
                    <span>AETHER OS v4.1.0</span>
                    <span>CONNECTED: 12ms</span>
                </div>
            </div>
        </div>
    );
}
