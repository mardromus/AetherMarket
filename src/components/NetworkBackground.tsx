"use client";

export function NetworkBackground() {
    return (
        <div className="fixed inset-0 z-[-1] overflow-hidden bg-black pointer-events-none">
            {/* Base Grid */}
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:50px_50px] [mask-image:radial-gradient(ellipse_at_center,black_70%,transparent_100%)]" />

            {/* Glowing Orbs / Data Packets */}
            <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-[100px] animate-pulse" />
            <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-purple-500/10 rounded-full blur-[120px] animate-pulse [animation-delay:2s]" />

            {/* Moving Grid Lines (Simulated via CSS) */}
            <div className="absolute inset-0 opacity-20">
                <div className="absolute h-[1px] w-full bg-gradient-to-r from-transparent via-primary to-transparent top-1/3 animate-[scanline_10s_linear_infinite]" />
                <div className="absolute h-[1px] w-full bg-gradient-to-r from-transparent via-cyan-400 to-transparent top-2/3 animate-[scanline_15s_linear_infinite_reverse]" />
            </div>

            {/* Vignette */}
            <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black" />
        </div>
    );
}
