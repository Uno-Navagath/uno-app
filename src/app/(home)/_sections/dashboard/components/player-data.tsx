'use client'
import React, { useEffect, useState } from 'react';
import { PlayerDetails } from "@/database/actions";
import { Player } from "@/database/schema";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Loader from "@/components/loader";

import {
    Bar, BarChart, Line, LineChart, Area, AreaChart,
    ResponsiveContainer, Tooltip, XAxis, YAxis, CartesianGrid
} from "recharts";

const PlayerData = ({ player }: { player: Player }) => {
    const [playerData, setPlayerData] = useState<PlayerDetails | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            const response = await fetch(`/api/player/details?id=${player.id}`);
            if (response.ok) {
                const data = await response.json();
                setPlayerData(data);
            } else {
                console.log(response.status);
            }
            setLoading(false);
        };
        fetchData();
    }, [player.id]);

    if (loading || !playerData) {
        return <Loader />;
    }

    // Chart colors
    const colors = {
        violet: "#8b5cf6",
        blue: "#3b82f6",
        cyan: "#22d3ee",
        grid: "rgba(255,255,255,0.08)",
        text: "rgba(255,255,255,0.7)"
    };

    const renderEmpty = () => (
        <p className="text-muted-foreground text-sm">No data available</p>
    );

    return (
        <div className="p-4 space-y-6">
            {/* Player Header */}
            <div className="flex items-center gap-4">
                <Avatar className="h-14 w-14 border border-border">
                    <AvatarImage src={playerData.player.imageUrl ?? ""} alt={playerData.player.name} />
                    <AvatarFallback className="bg-muted font-bold text-lg">
                        {playerData.player.name[0]}
                    </AvatarFallback>
                </Avatar>
                <div>
                    <h2 className="text-lg font-semibold">{playerData.player.name}</h2>
                    <p className="text-xs text-muted-foreground">
                        {playerData.gamesPlayed} Games • {playerData.gamesHosted} Hosted
                    </p>
                </div>
            </div>

            {/* KPIs */}
            <div className="grid grid-cols-3 gap-3 text-center">
                <div className="bg-muted rounded-md p-2">
                    <p className="text-xs text-muted-foreground">Win Rate</p>
                    <p className="text-base font-semibold text-primary">
                        {playerData.winRate?.toFixed(0) ?? 0}%
                    </p>
                </div>
                <div className="bg-muted rounded-md p-2">
                    <p className="text-xs text-muted-foreground">Avg Score</p>
                    <p className="text-base font-semibold">{playerData.averageScore?.toFixed(0) ?? "0"}</p>
                </div>
                <div className="bg-muted rounded-md p-2">
                    <p className="text-xs text-muted-foreground">Placement</p>
                    <p className="text-base font-semibold">
                        #{playerData.averagePlacement?.toFixed(0) ?? "-"}
                    </p>
                </div>
            </div>

            {/* Charts */}
            <div className="space-y-4">
                {/* Weekly Scores (Bar Chart) */}
                <Card>
                    <CardHeader className="py-2">
                        <CardTitle className="text-sm font-medium">Weekly Avg Score</CardTitle>
                    </CardHeader>
                    <CardContent className="h-48 flex items-center justify-center">
                        {playerData.weeklyScores?.length ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={playerData.weeklyScores}>
                                    <CartesianGrid stroke={colors.grid} vertical={false} />
                                    <XAxis dataKey="week" tick={{ fontSize: 10, fill: colors.text }} />
                                    <YAxis tick={{ fontSize: 10, fill: colors.text }} />
                                    <Tooltip contentStyle={{ backgroundColor: "#1e1e2f", border: "none" }} />
                                    <Bar dataKey="avgScore" fill={colors.violet} radius={[4, 4, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        ) : renderEmpty()}
                    </CardContent>
                </Card>

                {/* Recent Scores (Line Chart) */}
                <Card>
                    <CardHeader className="py-2">
                        <CardTitle className="text-sm font-medium">Recent Scores</CardTitle>
                    </CardHeader>
                    <CardContent className="h-48 flex items-center justify-center">
                        {playerData.recentScores?.length ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={playerData.recentScores}>
                                    <CartesianGrid stroke={colors.grid} vertical={false} />
                                    <XAxis dataKey="date" tick={{ fontSize: 10, fill: colors.text }} />
                                    <YAxis tick={{ fontSize: 10, fill: colors.text }} />
                                    <Tooltip contentStyle={{ backgroundColor: "#1e1e2f", border: "none" }} />
                                    <Line
                                        type="monotone"
                                        dataKey="score"
                                        stroke={colors.cyan}
                                        strokeWidth={2}
                                        dot={false}
                                    />
                                </LineChart>
                            </ResponsiveContainer>
                        ) : renderEmpty()}
                    </CardContent>
                </Card>

                {/* Placement Trend (Area Chart) */}
                <Card>
                    <CardHeader className="py-2">
                        <CardTitle className="text-sm font-medium">Placement Trend</CardTitle>
                    </CardHeader>
                    <CardContent className="h-48 flex items-center justify-center">
                        {playerData.placementTrend?.length ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={playerData.placementTrend}>
                                    <defs>
                                        <linearGradient id="placementFill" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor={colors.blue} stopOpacity={0.5} />
                                            <stop offset="95%" stopColor={colors.blue} stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid stroke={colors.grid} vertical={false} />
                                    <XAxis dataKey="date" tick={{ fontSize: 10, fill: colors.text }} />
                                    <YAxis reversed tick={{ fontSize: 10, fill: colors.text }} />
                                    <Tooltip contentStyle={{ backgroundColor: "#1e1e2f", border: "none" }} />
                                    <Area
                                        type="monotone"
                                        dataKey="placement"
                                        stroke={colors.blue}
                                        fill="url(#placementFill)"
                                        strokeWidth={2}
                                    />
                                </AreaChart>
                            </ResponsiveContainer>
                        ) : renderEmpty()}
                    </CardContent>
                </Card>

                {/* Score Distribution (Horizontal Bar Chart) */}
                <Card>
                    <CardHeader className="py-2">
                        <CardTitle className="text-sm font-medium">Score Distribution</CardTitle>
                    </CardHeader>
                    <CardContent className="h-56 flex items-center justify-center">
                        {playerData.scoreDistribution?.length ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart
                                    layout="vertical"
                                    data={playerData.scoreDistribution}
                                    margin={{ left: 30 }}
                                >
                                    <CartesianGrid stroke={colors.grid} horizontal={false} />
                                    <XAxis type="number" tick={{ fontSize: 10, fill: colors.text }} />
                                    <YAxis
                                        dataKey="scoreRange"
                                        type="category"
                                        tick={{ fontSize: 10, fill: colors.text }}
                                    />
                                    <Tooltip contentStyle={{ backgroundColor: "#1e1e2f", border: "none" }} />
                                    <Bar dataKey="count" fill={colors.violet} radius={[0, 4, 4, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        ) : renderEmpty()}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default PlayerData;
