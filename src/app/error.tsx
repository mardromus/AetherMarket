"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { AlertTriangle, Power, RotateCcw } from "lucide-react";
import Link from "next/link";

export default function Error({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        console.error(error);
    }, [error]);

    return (
        <div className="min-h-screen flex flex-col items-center justify-center space-y-8 bg-background relative overflow-hidden">
            {/* Background elements */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-red-500/5 rounded-full blur-3xl pointer-events-none" />

            <div className="relative z-10 flex flex-col items-center text-center space-y-6 max-w-md px-4">
                <div className="relative">
                    <div className="absolute inset-0 bg-red-500/20 blur-xl rounded-full" />
                    <AlertTriangle className="w-24 h-24 text-red-500 relative z-10 animate-pulse" />
                </div>

                <div className="space-y-2">
                    <h2 className="text-3xl font-black text-white tracking-widest uppercase">System Failure</h2>
                    <p className="text-red-400/80 font-mono text-sm border border-red-500/20 bg-red-950/20 p-4 rounded-lg backdrop-blur-sm">
                        {error.message || "CRITICAL ERROR: Unknown system exception detected."}
                    </p>
                </div>

                <div className="flex flex-col sm:flex-row gap-4 w-full">
                    <Button
                        onClick={() => reset()}
                        variant="destructive"
                        className="flex-1 bg-red-600 hover:bg-red-700 shadow-[0_0_20px_rgba(220,38,38,0.4)]"
                    >
                        <RotateCcw className="w-4 h-4 mr-2" />
                        REBOOT SYSTEM
                    </Button>
                    <Link href="/" className="flex-1">
                        <Button
                            variant="outline"
                            className="w-full border-red-500/30 hover:bg-red-500/10 text-red-400"
                        >
                            <Power className="w-4 h-4 mr-2" />
                            EMERGENCY EXIT
                        </Button>
                    </Link>
                </div>
            </div>

            <div className="absolute bottom-8 text-[10px] text-red-900/40 font-mono">
                ERROR_CODE: {error.digest || "0xUNKNOWN"}
            </div>
        </div>
    );
}
