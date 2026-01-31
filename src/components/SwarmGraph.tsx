"use client";
import React, { useEffect, useState } from 'react';
import { motion } from "framer-motion"; // Assuming framer-motion is available or I can use CSS. 
// Actually, I should stick to standard React+CSS/Tailwind to avoid dependency issues unless I check package.json.
// I'll use standard CSS animations.

import { Box, Database, Cpu, Globe, Share2, CheckCircle2 } from 'lucide-react';

interface Node {
    id: string;
    label: string;
    icon: React.ReactNode;
    status: 'idle' | 'active' | 'complete';
    x: number;
    y: number;
}

export function SwarmGraph({ active, step }: { active: boolean, step: number }) {
    const [nodes, setNodes] = useState<Node[]>([
        { id: 'hub', label: 'NEXUS PRIME', icon: <Share2 className="w-6 h-6" />, status: 'idle', x: 50, y: 50 },
        { id: 'w1', label: 'ORACLE-7', icon: <Globe className="w-4 h-4" />, status: 'idle', x: 20, y: 20 },
        { id: 'w2', label: 'LOGIC-CORE', icon: <Cpu className="w-4 h-4" />, status: 'idle', x: 80, y: 20 },
        { id: 'w3', label: 'MEM-BANK', icon: <Database className="w-4 h-4" />, status: 'idle', x: 50, y: 80 },
    ]);

    useEffect(() => {
        if (!active) return;

        // Simple state machine for demo
        setNodes(prev => prev.map(n => {
            if (n.id === 'hub') return { ...n, status: 'active' };

            // Logic Core activates early
            if (n.id === 'w2' && step > 0) return { ...n, status: step > 3 ? 'complete' : 'active' };

            // Oracle activates mid
            if (n.id === 'w1' && step > 1) return { ...n, status: step > 4 ? 'complete' : 'active' };

            // Mem bank activates late
            if (n.id === 'w3' && step > 2) return { ...n, status: step > 5 ? 'complete' : 'active' };

            return n;
        }));

    }, [active, step]);

    if (!active) return null;

    return (
        <div className="w-full h-[300px] bg-black/50 border border-white/10 rounded-xl relative overflow-hidden mb-4 backdrop-blur-sm">
            <div className="absolute top-4 left-4 text-xs font-mono text-muted-foreground flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
                SWARM_TOPOLOGY_V4
            </div>

            {/* Connecting Lines */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none">
                {nodes.filter(n => n.id !== 'hub').map(node => (
                    <line
                        key={node.id}
                        x1="50%" y1="50%"
                        x2={`${node.x}%`} y2={`${node.y}%`}
                        stroke={node.status === 'active' ? "#3b82f6" : node.status === 'complete' ? "#22c55e" : "#333"}
                        strokeWidth="2"
                        strokeDasharray={node.status === 'active' ? "4 4" : "0"}
                        className={node.status === 'active' ? "animate-pulse" : ""}
                    />
                ))}
            </svg>

            {/* Nodes */}
            {nodes.map(node => (
                <div
                    key={node.id}
                    className={`absolute transform -translate-x-1/2 -translate-y-1/2 flex flex-col items-center transition-all duration-500`}
                    style={{ left: `${node.x}%`, top: `${node.y}%` }}
                >
                    <div className={`w-12 h-12 rounded-full border-2 flex items-center justify-center bg-black z-10 
                        ${node.status === 'active' ? 'border-blue-500 shadow-[0_0_20px_rgba(59,130,246,0.5)]' :
                            node.status === 'complete' ? 'border-green-500 bg-green-900/20' : 'border-white/10 text-muted-foreground'}`}
                    >
                        <div className={node.status === 'active' ? "animate-ping absolute w-full h-full rounded-full bg-blue-500/20" : ""} />
                        {node.status === 'complete' ? <CheckCircle2 className="w-6 h-6 text-green-500" /> :
                            <div className={node.status === 'active' ? "text-blue-400" : ""}>{node.icon}</div>
                        }
                    </div>
                    <div className={`mt-2 text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-black/80 border 
                        ${node.status === 'active' ? 'text-blue-400 border-blue-500/50' :
                            node.status === 'complete' ? 'text-green-400 border-green-500/50' : 'text-muted-foreground border-white/10'}`}>
                        {node.label}
                    </div>
                    {node.status === 'active' && (
                        <div className="absolute -top-4 text-[9px] text-blue-300 animate-bounce whitespace-nowrap">
                            PROCESSING...
                        </div>
                    )}
                </div>
            ))}
        </div>
    );
}
