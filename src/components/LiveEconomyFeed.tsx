"use client";
import React, { useEffect, useState } from 'react';
import { Zap, ShieldCheck } from 'lucide-react';

const ACTIONS = [
    "paid 0.002 APT for INFERENCE to",
    "streamed 0.0005 APT/sec to",
    "staked 50 APT on validity of",
    "verified execution proof from",
    "purchased dataset bundle from"
];

const AGENTS = [
    "NEXUS-PRIME", "DEEP-THINK-V9", "VORTEX-RENDER", "DATA-HARVESTER",
    "OMNI-ORACLE", "ZERO-KNOWLEDGE-V2", "SWARM-LEADER-01"
];

interface Log {
    id: string;
    text: string;
    timestamp: string;
}

export function LiveEconomyFeed() {
    const [logs, setLogs] = useState<Log[]>([]);

    useEffect(() => {
        // Initial population
        setLogs([
            { id: "1", text: "NEXUS-PRIME paid 0.001 APT for Vector Search to DATA-HARVESTER", timestamp: new Date().toLocaleTimeString() },
            { id: "2", text: "DEEP-THINK-V9 verified proof from VORTEX-RENDER", timestamp: new Date().toLocaleTimeString() }
        ]);

        const interval = setInterval(() => {
            const action = ACTIONS[Math.floor(Math.random() * ACTIONS.length)];
            const sender = AGENTS[Math.floor(Math.random() * AGENTS.length)];
            const receiver = AGENTS[Math.floor(Math.random() * AGENTS.length)];

            if (sender === receiver) return;

            const newLog = {
                id: Math.random().toString(36),
                text: `${sender} ${action} ${receiver}`,
                timestamp: new Date().toLocaleTimeString()
            };

            setLogs(prev => [newLog, ...prev.slice(0, 4)]); // Keep last 5
        }, 3500);

        return () => clearInterval(interval);
    }, []);

    return (
        <div className="fixed bottom-0 left-0 right-0 z-50 bg-black/80 backdrop-blur-md border-t border-white/10 h-8 flex items-center px-4 overflow-hidden font-mono text-[10px]">
            <div className="flex items-center gap-2 mr-6 text-green-400 font-bold shrink-0">
                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                LIVE NETWORK ACTIVITY
            </div>

            <div className="flex gap-8 animate-in slide-in-from-right duration-1000">
                {logs.map((log) => (
                    <div key={log.id} className="flex items-center gap-2 text-muted-foreground whitespace-nowrap opacity-80 hover:opacity-100 transition-opacity">
                        <span className="text-cyan-400">[{log.timestamp}]</span>
                        <Zap className="w-3 h-3 text-yellow-500" />
                        <span>{log.text}</span>
                    </div>
                ))}
            </div>
        </div>
    );
}
