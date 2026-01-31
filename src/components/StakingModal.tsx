"use client";
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Loader2, Coins, TrendingUp, X } from 'lucide-react';

interface StakingModalProps {
    isOpen: boolean;
    onClose: () => void;
    agentName: string;
    agentId: string;
}

export function StakingModal({ isOpen, onClose, agentName }: StakingModalProps) {
    const [amount, setAmount] = useState("10");
    const [isStaking, setIsStaking] = useState(false);

    if (!isOpen) return null;

    const handleStake = async () => {
        setIsStaking(true);
        // Simulate tx
        await new Promise(r => setTimeout(r, 1500));

        toast.success(`Successfully Staked ${amount} APT on ${agentName}`);
        setIsStaking(false);
        onClose();
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm animate-in fade-in duration-200" onClick={onClose}>
            <div
                className="w-full max-w-md bg-black border border-purple-500/30 rounded-xl shadow-[0_0_50px_rgba(168,85,247,0.15)] overflow-hidden animate-in zoom-in-95 duration-200 p-6 relative"
                onClick={e => e.stopPropagation()}
            >
                <div className="absolute top-4 right-4 text-muted-foreground hover:text-white cursor-pointer" onClick={onClose}>
                    <X className="w-4 h-4" />
                </div>

                <div className="mb-6">
                    <h2 className="flex items-center gap-2 text-xl font-bold text-purple-400 mb-1">
                        <Coins className="w-5 h-5" /> STAKE ON COMPUTE
                    </h2>
                    <p className="text-muted-foreground text-sm">
                        Stake APT to earn a share of {agentName}'s inference revenue.
                        Current APY: <span className="text-green-400 font-bold">14.2%</span>
                    </p>
                </div>

                <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="amount" className="text-right text-xs uppercase text-muted-foreground">
                            Amount (APT)
                        </Label>
                        <Input
                            id="amount"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                            className="col-span-3 bg-white/5 border-white/10 text-white font-mono"
                        />
                    </div>
                </div>

                <div className="bg-purple-900/20 p-3 rounded-lg border border-purple-500/20 mb-6">
                    <div className="flex justify-between text-xs text-muted-foreground mb-1">
                        <span>Daily Earnings Est.</span>
                        <span className="text-white font-mono">{(parseFloat(amount || "0") * 0.142 / 365).toFixed(4)} APT</span>
                    </div>
                    <div className="flex justify-between text-xs text-muted-foreground">
                        <span>Lockup Period</span>
                        <span className="text-white font-mono">7 Days</span>
                    </div>
                </div>

                <div className="flex justify-end gap-2">
                    <Button variant="outline" onClick={onClose} className="border-white/10 text-muted-foreground hover:bg-white/5 hover:text-white">Cancel</Button>
                    <Button onClick={handleStake} disabled={isStaking} className="bg-purple-600 hover:bg-purple-500 text-white font-bold">
                        {isStaking ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> SIGNING TX...</> : <><TrendingUp className="w-4 h-4 mr-2" /> CONFIRM STAKE</>}
                    </Button>
                </div>
            </div>
        </div>
    );
}
