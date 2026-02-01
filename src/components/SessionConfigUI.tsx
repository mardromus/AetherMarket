"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, Settings, Lock, Zap, TrendingUp } from "lucide-react";
import type { SessionConfig, BudgetStatus } from "@/types/session";

interface SessionConfigUIProps {
    sessionId?: string;
    userId: string;
    onConfigSaved?: (session: SessionConfig) => void;
}

export function SessionConfigUI({ sessionId, userId, onConfigSaved }: SessionConfigUIProps) {
    const [session, setSession] = useState<SessionConfig | null>(null);
    const [budgetStatus, setBudgetStatus] = useState<BudgetStatus | null>(null);
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Form state
    const [maxTransactionAmount, setMaxTransactionAmount] = useState("50");
    const [maxDailySpend, setMaxDailySpend] = useState("500");
    const [maxMonthlySpend, setMaxMonthlySpend] = useState("5000");
    const [maxConcurrentTasks, setMaxConcurrentTasks] = useState("5");
    const [taskTimeoutSeconds, setTaskTimeoutSeconds] = useState("120");
    const [requireApprovalOver, setRequireApprovalOver] = useState("100");

    // Load session
    useEffect(() => {
        loadSession();
    }, [sessionId, userId]);

    async function loadSession() {
        setLoading(true);
        setError(null);

        try {
            const action = sessionId ? "get" : "get-or-create";
            const response = await fetch("/api/sessions/config", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    action,
                    sessionId,
                    userId
                })
            });

            if (!response.ok) throw new Error("Failed to load session");
            const data = await response.json();
            setSession(data);

            // Load budget status
            const budgetRes = await fetch(
                `/api/sessions/config?action=budget-status&sessionId=${data.id}`
            );
            if (budgetRes.ok) {
                const budget = await budgetRes.json();
                setBudgetStatus(budget);
            }

            // Update form with session values
            setMaxTransactionAmount((BigInt(data.maxTransactionAmount) / 1000000n).toString());
            setMaxDailySpend((BigInt(data.maxDailySpend) / 1000000n).toString());
            setMaxMonthlySpend((BigInt(data.maxMonthlySpend) / 1000000n).toString());
            setMaxConcurrentTasks(data.maxConcurrentTasks.toString());
            setTaskTimeoutSeconds((data.taskTimeoutMs / 1000).toString());
            setRequireApprovalOver((BigInt(data.requireManualApprovalOver || "100000000") / 1000000n).toString());

        } catch (err) {
            setError(err instanceof Error ? err.message : "Unknown error");
        } finally {
            setLoading(false);
        }
    }

    async function handleSaveConfig() {
        if (!session) return;

        setSaving(true);
        setError(null);

        try {
            const response = await fetch("/api/sessions/config", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    action: "update",
                    sessionId: session.id,
                    maxTransactionAmount: (BigInt(maxTransactionAmount) * 1000000n).toString(),
                    maxDailySpend: (BigInt(maxDailySpend) * 1000000n).toString(),
                    maxMonthlySpend: (BigInt(maxMonthlySpend) * 1000000n).toString(),
                    maxConcurrentTasks: parseInt(maxConcurrentTasks),
                    taskTimeoutMs: parseInt(taskTimeoutSeconds) * 1000,
                    requireManualApprovalOver: (BigInt(requireApprovalOver) * 1000000n).toString()
                })
            });

            if (!response.ok) throw new Error("Failed to save configuration");
            const updated = await response.json();
            setSession(updated);
            onConfigSaved?.(updated);

        } catch (err) {
            setError(err instanceof Error ? err.message : "Unknown error");
        } finally {
            setSaving(false);
        }
    }

    async function handlePauseSession() {
        if (!session) return;

        try {
            const response = await fetch("/api/sessions/config", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    action: "pause",
                    sessionId: session.id,
                    reason: "User paused session"
                })
            });

            if (!response.ok) throw new Error("Failed to pause session");
            const data = await response.json();
            setSession(data.session);

        } catch (err) {
            setError(err instanceof Error ? err.message : "Unknown error");
        }
    }

    async function handleResumeSession() {
        if (!session) return;

        try {
            const response = await fetch("/api/sessions/config", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    action: "resume",
                    sessionId: session.id
                })
            });

            if (!response.ok) throw new Error("Failed to resume session");
            const data = await response.json();
            setSession(data.session);

        } catch (err) {
            setError(err instanceof Error ? err.message : "Unknown error");
        }
    }

    if (loading) {
        return (
            <Card className="bg-black/40 border-white/10 backdrop-blur-md">
                <CardContent className="pt-6">
                    <p className="text-muted-foreground">Loading session configuration...</p>
                </CardContent>
            </Card>
        );
    }

    if (!session) {
        return (
            <Card className="bg-black/40 border-white/10 backdrop-blur-md">
                <CardContent className="pt-6">
                    <p className="text-red-400">Failed to load session</p>
                </CardContent>
            </Card>
        );
    }

    return (
        <div className="space-y-6">
            {/* Budget Status */}
            {budgetStatus && (
                <Card className="bg-gradient-to-r from-cyan-500/10 to-blue-500/10 border-cyan-500/20">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <TrendingUp className="w-5 h-5" />
                            Budget Status
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <Label className="text-xs text-muted-foreground">Daily Budget</Label>
                                <div className="mt-1">
                                    <div className="text-lg font-bold">
                                        {(BigInt(budgetStatus.dailyRemaining) / 1000000n).toString()} APT
                                    </div>
                                    <div className="text-xs text-muted-foreground">
                                        Used: {(BigInt(budgetStatus.dailySpent) / 1000000n).toString()} APT ({budgetStatus.percentageUsedDaily.toFixed(1)}%)
                                    </div>
                                </div>
                            </div>
                            <div>
                                <Label className="text-xs text-muted-foreground">Monthly Budget</Label>
                                <div className="mt-1">
                                    <div className="text-lg font-bold">
                                        {(BigInt(budgetStatus.monthlyRemaining) / 1000000n).toString()} APT
                                    </div>
                                    <div className="text-xs text-muted-foreground">
                                        Used: {(BigInt(budgetStatus.monthlySpent) / 1000000n).toString()} APT ({budgetStatus.percentageUsedMonthly.toFixed(1)}%)
                                    </div>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Session Status */}
            <Card className="bg-black/40 border-white/10 backdrop-blur-md">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Lock className="w-5 h-5" />
                        Session Status
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                    <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">Status</span>
                        <Badge variant={session.isPaused ? "destructive" : "default"}>
                            {session.isPaused ? "PAUSED" : "ACTIVE"}
                        </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">Session ID</span>
                        <code className="text-xs bg-white/5 px-2 py-1 rounded">
                            {session.id.substring(0, 16)}...
                        </code>
                    </div>
                    <div className="flex gap-2 mt-4">
                        {!session.isPaused ? (
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={handlePauseSession}
                                className="border-red-500/50 text-red-400 hover:bg-red-500/10"
                            >
                                Pause Session
                            </Button>
                        ) : (
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={handleResumeSession}
                                className="border-green-500/50 text-green-400 hover:bg-green-500/10"
                            >
                                Resume Session
                            </Button>
                        )}
                    </div>
                </CardContent>
            </Card>

            {/* Transaction Limits */}
            <Card className="bg-black/40 border-white/10 backdrop-blur-md">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Zap className="w-5 h-5" />
                        Transaction Limits
                    </CardTitle>
                    <CardDescription>Configure how much you can spend per transaction and time period</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    {error && (
                        <div className="flex gap-2 p-3 bg-red-500/10 border border-red-500/20 rounded">
                            <AlertCircle className="w-4 h-4 text-red-400 mt-0.5 flex-shrink-0" />
                            <span className="text-sm text-red-400">{error}</span>
                        </div>
                    )}

                    {/* Max Transaction Amount */}
                    <div className="space-y-2">
                        <Label>Max Per Transaction (APT)</Label>
                        <div className="flex gap-2">
                            <Input
                                type="number"
                                step="0.1"
                                min="0.01"
                                value={maxTransactionAmount}
                                onChange={(e) => setMaxTransactionAmount(e.target.value)}
                                placeholder="0"
                                className="bg-white/5 border-white/10"
                            />
                            <span className="text-muted-foreground text-sm py-2">APT</span>
                        </div>
                        <p className="text-xs text-muted-foreground">
                            Maximum single transaction: {maxTransactionAmount} APT
                        </p>
                    </div>

                    {/* Daily Spend */}
                    <div className="space-y-2">
                        <Label>Max Daily Spend (APT)</Label>
                        <Slider
                            value={[parseFloat(maxDailySpend)]}
                            onValueChange={(value) => setMaxDailySpend(value[0].toString())}
                            min={10}
                            max={1000}
                            step={10}
                            className="w-full"
                        />
                        <p className="text-xs text-muted-foreground">
                            Daily limit: {maxDailySpend} APT
                        </p>
                    </div>

                    {/* Monthly Spend */}
                    <div className="space-y-2">
                        <Label>Max Monthly Spend (APT)</Label>
                        <Slider
                            value={[parseFloat(maxMonthlySpend)]}
                            onValueChange={(value) => setMaxMonthlySpend(value[0].toString())}
                            min={100}
                            max={10000}
                            step={100}
                            className="w-full"
                        />
                        <p className="text-xs text-muted-foreground">
                            Monthly limit: {maxMonthlySpend} APT
                        </p>
                    </div>

                    {/* Approval Threshold */}
                    <div className="space-y-2">
                        <Label>Require Manual Approval Over (APT)</Label>
                        <Input
                            type="number"
                            step="0.1"
                            min="0"
                            value={requireApprovalOver}
                            onChange={(e) => setRequireApprovalOver(e.target.value)}
                            placeholder="0"
                            className="bg-white/5 border-white/10"
                        />
                        <p className="text-xs text-muted-foreground">
                            Transactions over {requireApprovalOver} APT will require confirmation
                        </p>
                    </div>

                    {/* Concurrent Tasks */}
                    <div className="space-y-2">
                        <Label>Max Concurrent Tasks</Label>
                        <Input
                            type="number"
                            min="1"
                            max="20"
                            value={maxConcurrentTasks}
                            onChange={(e) => setMaxConcurrentTasks(e.target.value)}
                            className="bg-white/5 border-white/10"
                        />
                        <p className="text-xs text-muted-foreground">
                            Maximum simultaneous agent executions
                        </p>
                    </div>

                    {/* Task Timeout */}
                    <div className="space-y-2">
                        <Label>Task Timeout (Seconds)</Label>
                        <Input
                            type="number"
                            min="30"
                            max="600"
                            step="10"
                            value={taskTimeoutSeconds}
                            onChange={(e) => setTaskTimeoutSeconds(e.target.value)}
                            className="bg-white/5 border-white/10"
                        />
                        <p className="text-xs text-muted-foreground">
                            Tasks will auto-cancel after {taskTimeoutSeconds} seconds
                        </p>
                    </div>
                </CardContent>
            </Card>

            {/* Save Button */}
            <Button
                onClick={handleSaveConfig}
                disabled={saving}
                className="w-full bg-primary hover:bg-primary/90"
            >
                {saving ? "Saving..." : "Save Configuration"}
            </Button>
        </div>
    );
}
