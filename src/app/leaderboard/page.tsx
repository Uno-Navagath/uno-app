'use client'
import {LeaderboardEntry} from "@/database/actions";
import {useEffect, useState} from "react";
import {LeaderboardCard} from "@/components/leaderboard-card";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from "@/components/ui/select";
import Loader from "@/components/loader";

function Page() {
    const [loading, setLoading] = useState(true);
    const [selectedPeriod, setSelectedPeriod] = useState("all");
    const [topPlayers, setTopPlayers] = useState<LeaderboardEntry[]>([]);

    const fetchTopPlayers = async (period: string) => {
        setLoading(true);
        try {
            const response = await fetch(`/api/leaderboard/top-players?period=${period}`);
            const data = await response.json();
            setTopPlayers(data);
        } catch (err) {
            console.error("Failed to fetch leaderboard:", err);
            setTopPlayers([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTopPlayers(selectedPeriod);
    }, [selectedPeriod]);

    return (
        <main className="max-w-3xl mx-auto px-4 py-8 flex flex-col gap-6">
            {/* Header */}
            <div className="flex flex-row items-center justify-between gap-4">
                <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
                    Leaderboard
                </h1>
                <Select
                    value={selectedPeriod}
                    onValueChange={(value) => setSelectedPeriod(value)}
                >
                    <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Select period"/>
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All time</SelectItem>
                        <SelectItem value="today">Today</SelectItem>
                        <SelectItem value="this_week">This week</SelectItem>
                        <SelectItem value="last_week">Last week</SelectItem>
                        <SelectItem value="last_30_days">Last 30 days</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            {/* Content */}
            {loading ? (
                <div className="flex items-center justify-center h-40">
                    <Loader/>
                </div>
            ) : topPlayers.length === 0 ? (
                <div className="flex items-center justify-center h-40 text-muted-foreground">
                    No players yet
                </div>
            ) : (
                <div className="flex flex-col gap-3">
                    {topPlayers.map((player, index) => (
                        <LeaderboardCard
                            key={player.playerId}
                            entry={player}
                            rank={index + 1}
                        />
                    ))}
                </div>
            )}
        </main>
    );
}

export default Page;
