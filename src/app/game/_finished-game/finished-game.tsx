'use client';

import React, {useMemo} from "react";
import {Avatar, AvatarFallback, AvatarImage} from "@/components/ui/avatar";
import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card";
import {Separator} from "@/components/ui/separator";
import {Legend, LegendPayload, Line, LineChart, ResponsiveContainer, XAxis, YAxis} from "recharts";
import {Badge} from "@/components/ui/badge";
import {GameDetails, ParticipantWithPlayer} from "@/database/schema";
import {Props} from "recharts/types/component/DefaultLegendContent";


// -----------------------
// Helper: Stats
// -----------------------
type PlayerStats = {
    participant: ParticipantWithPlayer;
    scores: number[];
    total: number;
    avg: number;
    best: number;
    worst: number;
    stddev: number;
    cumulative: number[];
};

const calculateStats = (game: GameDetails): PlayerStats[] => {
    return game.participants.map(p => {
        const scores = game.rounds.map(r => r.scores.find(s => s.participant.id === p.id)?.value || 0);
        const total = scores.reduce((a, b) => a + b, 0);
        const avg = scores.length ? total / scores.length : 0;
        const best = Math.min(...scores);
        const worst = Math.max(...scores);
        const stddev = scores.length > 1 ? Math.sqrt(scores.reduce((a, v) => a + Math.pow(v - avg, 2), 0) / (scores.length - 1)) : 0;
        const cumulative = scores.reduce((acc, val, i) => {
            acc.push((acc[i - 1] || 0) + val);
            return acc;
        }, [] as number[]);
        return {participant: p, scores, total, avg, best, worst, stddev, cumulative};
    }).sort((a, b) => a.total - b.total); // leaderboard low score first
};

// -----------------------
// Components
// -----------------------
const GameHeader: React.FC<{ game: GameDetails }> = ({game}) => (
    <div className="flex flex-croww justify-between items-start sm:items-center gap-2">
        <div className="flex flex-col gap-1">
            <span className="text-xs text-muted-foreground font-semibold">Game #{game.id.slice(0, 8)}</span>
            <span className="text-xs text-muted-foreground">{game.createdAt.toLocaleDateString()}</span>
        </div>
        <Badge className="capitalize">{game.status}</Badge>
    </div>
);

const Leaderboard: React.FC<{ stats: PlayerStats[] }> = ({stats}) => (
    <Card className="overflow-x-auto">
        <CardHeader>
            <CardTitle>Leaderboard</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
            <table className="w-full text-sm border-collapse table-auto">
                <thead className="bg-muted text-left">
                <tr>
                    <th className="p-2">#</th>
                    <th className="p-2">Player</th>
                    <th className="p-2">Total</th>
                    <th className="p-2 hidden sm:table-cell">Avg</th>
                    <th className="p-2 hidden sm:table-cell">Best</th>
                    <th className="p-2 hidden sm:table-cell">Worst</th>
                    <th className="p-2 hidden sm:table-cell">Consistency</th>
                </tr>
                </thead>
                <tbody>
                {stats.map((s, idx) => (
                    <tr key={s.participant.id} className="border-t hover:bg-muted/20">
                        <td className="p-2">{idx + 1}</td>
                        <td className="p-2 flex items-center gap-2">
                            <Avatar className="h-6 w-6">
                                <AvatarImage src={s.participant.player.imageUrl || "/default-avatar.png"}
                                             alt={s.participant.player.name}/>
                                <AvatarFallback>{s.participant.player.name[0]}</AvatarFallback>
                            </Avatar>
                            <span>{s.participant.player.name}</span>
                        </td>
                        <td className="p-2 font-mono">{s.total}</td>
                        <td className="p-2 hidden sm:table-cell font-mono">{s.avg.toFixed(1)}</td>
                        <td className="p-2 hidden sm:table-cell font-mono text-green-600">{s.best}</td>
                        <td className="p-2 hidden sm:table-cell font-mono text-red-600">{s.worst}</td>
                        <td className="p-2 hidden sm:table-cell font-mono">{s.stddev.toFixed(1)}</td>
                    </tr>
                ))}
                </tbody>
            </table>
        </CardContent>
    </Card>
);

const TrendChart: React.FC<{ stats: PlayerStats[], roundsCount: number }> = ({stats, roundsCount}) => {
    const data = Array.from({length: roundsCount}, (_, i) => ({
        round: i + 1,
        ...Object.fromEntries(stats.map(s => [s.participant.player.name, s.cumulative[i]])),
    }));

    const renderLegend = (props: Props) => {
        const {payload} = props;
        if (!payload) return null;

        return (
            <div className="flex flex-wrap gap-2 mt-2">
                {payload.map((entry: LegendPayload) => (
                    <div key={entry.value} className="flex items-center gap-1">
                        <span style={{backgroundColor: entry.color}} className="w-3 h-3 rounded-full block"/>
                        <span className="text-xs truncate max-w-[70px]">{entry.value}</span>
                    </div>
                ))}
            </div>
        );
    };

    return (
        <Card className="w-full h-fit">
            <CardHeader>
                <CardTitle>Cumulative Score Trend</CardTitle>
            </CardHeader>
            <CardContent className="h-100">
                <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={data} margin={{top: 10, right: 20, left: 0, bottom: 10}}>
                        <XAxis dataKey="round" tick={{fontSize: 10}}/>
                        <YAxis width={30} tick={{fontSize: 10}}/>
                        {/*<Tooltip />*/}
                        <Legend content={renderLegend}/>
                        {stats.map((s, idx) => (
                            <Line
                                key={s.participant.id}
                                type="monotone"
                                dataKey={s.participant.player.name}
                                stroke={`hsl(${(idx * 137.5) % 360}, 70%, 50%)`}
                                strokeWidth={2}
                                dot={{r: 2}}
                                activeDot={{r: 4}}
                            />
                        ))}
                    </LineChart>
                </ResponsiveContainer>
            </CardContent>
        </Card>
    );
};

const PlayerKPICards: React.FC<{ stats: PlayerStats[] }> = ({stats}) => (
    <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        {stats.map(s => (
            <Card key={s.participant.id} className="p-3">
                <div className="flex items-center gap-2 mb-2">
                    <Avatar>
                        <AvatarImage src={s.participant.player.imageUrl || "/default-avatar.png"}
                                     alt={s.participant.player.name}/>
                        <AvatarFallback>{s.participant.player.name[0]}</AvatarFallback>
                    </Avatar>
                    <span className="font-semibold">{s.participant.player.name}</span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-center">
                    <Card className="bg-muted p-2"><CardContent><p className="text-xs text-muted-foreground">Total</p><p
                        className="font-mono">{s.total}</p></CardContent></Card>
                    <Card className="bg-muted p-2"><CardContent><p className="text-xs text-muted-foreground">Avg</p><p
                        className="font-mono">{s.avg.toFixed(1)}</p></CardContent></Card>
                    <Card className="bg-green-900/10 p-2"><CardContent><p className="text-xs text-green-600">Best</p><p
                        className="font-mono text-green-700">{s.best}</p></CardContent></Card>
                    <Card className="bg-red-900/10 p-2"><CardContent><p className="text-xs text-red-600">Worst</p><p
                        className="font-mono text-red-700">{s.worst}</p></CardContent></Card>
                    <Card className="bg-yellow-900/10 p-2 col-span-2"><CardContent><p
                        className="text-xs text-yellow-600">Consistency (σ)</p><p
                        className="font-mono text-yellow-700">{s.stddev.toFixed(1)}</p></CardContent></Card>
                </div>
            </Card>
        ))}
    </div>
);

// -----------------------
// Page Component
// -----------------------
const FinishedGamePage = (
    {game}: {
        game: GameDetails;
    }
) => {
    const playerStats = useMemo(() => calculateStats(game), [game]);
    const roundsCount = game.rounds.length;

    return (
        <div className="p-4 space-y-6">
            <GameHeader game={game}/>
            <Separator/>
            <Leaderboard stats={playerStats}/>
            <Separator/>
            <TrendChart stats={playerStats} roundsCount={roundsCount}/>
            <Separator/>
            <PlayerKPICards stats={playerStats}/>
        </div>
    );
};

export default FinishedGamePage;
