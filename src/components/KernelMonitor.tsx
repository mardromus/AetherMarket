"use client";
import React, { useEffect, useState, useRef } from 'react';
import { Activity, Cpu, HardDrive, Terminal } from 'lucide-react';

const HEX_CHARS = "0123456789ABCDEF";
const THREAD_ACTIONS = [
    "Load: Tensor_Block_A12", "Quantize: FP16->INT8", "Attn: Head-7 [Self]",
    "RAG: Index_0xFF Lookup", "Compute: MatrixMul", "Sync: Consenus_Node_9"
];

export function KernelMonitor({ active }: { active: boolean }) {
    const [hexStream, setHexStream] = useState<string[]>([]);
    const [telemetry, setTelemetry] = useState({ temp: 65, vram: 24.1, fan: 40 });
    const [process, setProcess] = useState("IDLE_KERNEL");
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!active) return;

        const interval = setInterval(() => {
            // Update Hex Stream
            const line = Array(8).fill(0).map(() =>
                Array(2).fill(0).map(() => HEX_CHARS[Math.floor(Math.random() * 16)]).join("")
            ).join(" ");

            setHexStream(prev => [`0x${Math.floor(Math.random() * 65535).toString(16).padStart(4, '0')}: ${line}`, ...prev.slice(0, 15)]);

            // Update Telemetry
            setTelemetry(prev => ({
                temp: Math.min(92, Math.max(60, prev.temp + (Math.random() - 0.4) * 5)),
                vram: Math.min(80, prev.vram + Math.random() * 0.5),
                fan: Math.min(100, Math.max(30, prev.fan + (Math.random() - 0.2) * 10))
            }));

            // Update Process
            setProcess(THREAD_ACTIONS[Math.floor(Math.random() * THREAD_ACTIONS.length)]);

        }, 100);

        return () => clearInterval(interval);
    }, [active]);

    if (!active) return null;

    return (
        <div className="w-full bg-black border border-green-500/20 rounded-lg overflow-hidden font-mono text-[10px] my-4 shadow-[0_0_30px_rgba(34,197,94,0.1)]">
            {/* Header / Telemetry */}
            <div className="bg-green-900/10 border-b border-green-500/20 p-2 flex justify-between items-center text-green-400">
                <div className="flex gap-4">
                    <span className="flex items-center gap-1"><Cpu className="w-3 h-3" /> {telemetry.temp.toFixed(1)}°C</span>
                    <span className="flex items-center gap-1"><HardDrive className="w-3 h-3" /> {telemetry.vram.toFixed(1)}GB</span>
                    <span className="flex items-center gap-1 animate-spin duration-[3000ms]"><Activity className="w-3 h-3" /> {Math.floor(telemetry.fan)}%</span>
                </div>
                <div className="flex items-center gap-2">
                    <span className="text-muted-foreground">KERNEL_PID: 9942</span>
                    <span className="animate-pulse text-green-500">● LIVE</span>
                </div>
            </div>

            {/* Main Monitor Grid */}
            <div className="grid grid-cols-3 h-48">

                {/* Visualizer (Fake Graph) */}
                <div className="col-span-1 border-r border-green-500/20 p-2 relative overflow-hidden">
                    <div className="absolute inset-0 bg-[url('https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExM3Z0Z3Z0Z3Z0Z3Z0Z3Z0Z3Z0Z3Z0Z3Z0Z3Z0Z3Z0Z3Z0Z3Z0/L2L3LzE2MDAxOTc4OTcvZGF0YS5naWY/giphy.gif')] opacity-20 bg-cover mix-blend-screen pointer-events-none"></div>
                    <div className="text-green-500 mb-1">Active Thread:</div>
                    <div className="text-white font-bold text-xs mb-4"> &gt; {process}</div>

                    <div className="flex flex-col gap-1 mt-auto">
                        {Array(10).fill(0).map((_, i) => (
                            <div key={i} className="h-1 bg-green-900/30 rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-green-500 transition-all duration-300"
                                    style={{ width: `${Math.random() * 100}%` }}
                                />
                            </div>
                        ))}
                    </div>
                </div>

                {/* Hex Dump */}
                <div className="col-span-2 bg-black p-2 overflow-hidden relative">
                    <div className="absolute top-2 right-2 text-green-700 select-none">MEMORY_DUMP</div>
                    <div className="flex flex-col gap-0.5">
                        {hexStream.map((line, i) => (
                            <div key={i} className={`font-mono ${i === 0 ? 'text-white' : 'text-green-600/60'}`}>
                                {line}
                            </div>
                        ))}
                    </div>
                    {/* Scanline overlay */}
                    <div className="absolute inset-0 bg-gradient-to-b from-transparent via-green-500/5 to-transparent h-4 animate-scanline pointer-events-none" />
                </div>
            </div>
        </div>
    );
}
