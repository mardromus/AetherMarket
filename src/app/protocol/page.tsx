"use client";
import React, { useState } from 'react';
import { Navbar } from '@/components/Navbar';
import { NetworkBackground } from '@/components/NetworkBackground';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { ArrowRight, Lock, Key, Zap, CheckCircle2 } from 'lucide-react';

export default function ProtocolPage() {
    const [status, setStatus] = useState("idle"); // idle, pending, success

    const simulateFlow = async () => {
        setStatus("pending");
        toast.info("Initiating x402 Payment Challenge...");

        await new Promise(r => setTimeout(r, 1000));
        toast("Server responds: 402 Payment Required");

        await new Promise(r => setTimeout(r, 1500));
        toast("Wallet signs transaction...");

        await new Promise(r => setTimeout(r, 1000));
        setStatus("success");
        toast.success("Payment Verified! Resource Unlocked.");
    };

    return (
        <div className="min-h-screen relative text-foreground">
            <NetworkBackground />
            <Navbar />

            <div className="pt-32 px-6 max-w-4xl mx-auto pb-20 relative z-10">
                <div className="text-center mb-16">
                    <h1 className="text-5xl font-black text-white tracking-tighter mb-4">THE X402 PROTOCOL</h1>
                    <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                        The HTTP standard for machine-to-machine payments.
                        Enabling autonomous agents to trade compute for capital in real-time.
                    </p>
                </div>

                {/* The Flow Visualization */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16 relative">
                    {/* Connecting Line */}
                    <div className="absolute top-1/2 left-0 w-full h-1 bg-gradient-to-r from-primary/20 via-cyan-400/20 to-purple-500/20 -translate-y-1/2 hidden md:block" />

                    <StepCard
                        icon={<Lock className="w-8 h-8 text-pink-500" />}
                        title="1. Request"
                        desc="Client requests a resource. Server checks for payment headers."
                        step={1}
                    />
                    <StepCard
                        icon={<Zap className="w-8 h-8 text-yellow-400" />}
                        title="2. Challenge (402)"
                        desc="Server halts and responds with HTTP 402: Payment Required + Price."
                        step={2}
                    />
                    <StepCard
                        icon={<Key className="w-8 h-8 text-cyan-400" />}
                        title="3. Unlock"
                        desc="Client signs tx, sends proof in header. Server streams response."
                        step={3}
                    />
                </div>

                {/* Interactive Demo */}
                <Card className="glass-card border-primary/30 bg-black/60 backdrop-blur-xl overflow-hidden">
                    <CardHeader className="text-center border-b border-white/10">
                        <CardTitle className="text-2xl text-white">INTERACTIVE VERIFICATION</CardTitle>
                        <CardDescription>Test the handshake mechanism directly.</CardDescription>
                    </CardHeader>
                    <CardContent className="p-12 flex flex-col items-center">
                        <div className={`w-24 h-24 rounded-full flex items-center justify-center mb-8 transition-all duration-500 ${status === 'idle' ? 'bg-white/5 border border-white/10' :
                                status === 'pending' ? 'bg-yellow-500/20 border-yellow-500 animate-pulse' :
                                    'bg-green-500/20 border-green-500 shadow-[0_0_30px_rgba(34,197,94,0.3)]'
                            }`}>
                            {status === 'idle' && <Lock className="w-8 h-8 text-muted-foreground" />}
                            {status === 'pending' && <Zap className="w-8 h-8 text-yellow-500" />}
                            {status === 'success' && <CheckCircle2 className="w-10 h-10 text-green-500" />}
                        </div>

                        <Button
                            size="lg"
                            className="text-lg px-8 font-bold bg-white text-black hover:bg-cyan-400 hover:text-black transition-all"
                            onClick={simulateFlow}
                            disabled={status === 'pending'}
                        >
                            {status === 'idle' ? 'TRIGGER 402 EVENT' :
                                status === 'pending' ? 'NEGOTIATING...' : 'VERIFIED'}
                        </Button>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}

function StepCard({ icon, title, desc, step }: { icon: React.ReactNode, title: string, desc: string, step: number }) {
    return (
        <div className="relative z-10 bg-black border border-white/10 p-6 rounded-xl flex flex-col items-center text-center group hover:border-primary/50 transition-colors">
            <div className="mb-4 transform group-hover:scale-110 transition-transform duration-300">{icon}</div>
            <h3 className="text-lg font-bold text-white mb-2">{title}</h3>
            <p className="text-sm text-muted-foreground">{desc}</p>
            <div className="absolute -top-3 -right-3 w-8 h-8 bg-white/10 rounded-full flex items-center justify-center text-xs font-mono border border-white/20">
                0{step}
            </div>
        </div>
    )
}
