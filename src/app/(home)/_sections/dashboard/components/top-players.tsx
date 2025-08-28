import React, {useEffect} from 'react';
import {LeaderboardCard} from "@/components/leaderboard-card";
import Link from "next/link";
import {ChevronRightIcon} from "lucide-react";
import {Button} from "@/components/ui/button";
import {LeaderboardEntry} from "@/database/actions";
import Loader from "@/components/loader";

const TopPlayers = () => {

    const [loading, setLoading] = React.useState(false);
    const [topPlayers, setTopPlayers] = React.useState<LeaderboardEntry[]>([]);

    useEffect(() => {
        const fetchTopPlayers = async () => {
            setLoading(true);
            const response = await fetch('/api/leaderboard/top-players');
            const data = await response.json();
            setTopPlayers(data);
            setLoading(false);
        };
        fetchTopPlayers();
    }, [])


    if (loading)
        return <Loader/>

    if (topPlayers.length === 0)
        return (
            <div className="flex flex-col gap-2 p-4">
                <div className="flex justify-between items-center">
                    <h2 className="text-lg font-semibold">Top Players</h2>
                    <Button variant="outline" size="sm" asChild>
                        <Link href="/leaderboard" className="text-sm">
                            <div className="flex items-center">
                                Leaderboard
                                <ChevronRightIcon className="ml-2 h-4 w-4"/>
                            </div>
                        </Link>
                    </Button>
                </div>

                <div className="flex items-center justify-center h-full m-10">No players yet</div>
            </div>
        )

    return (
        <div className="flex flex-col gap-2 p-4">
            <div className="flex justify-between items-center">
                <h2 className="text-lg font-semibold">Top Players</h2>
                <Button variant="outline" size="sm" asChild>
                    <Link href="/leaderboard" className="text-sm">
                        <div className="flex items-center">
                            Leaderboard
                            <ChevronRightIcon className="ml-2 h-4 w-4"/>
                        </div>
                    </Link>
                </Button>
            </div>
            <div className="flex overflow-x-auto snap-x snap-mandatory gap-4 p-2">
                {topPlayers.map((player, i) => (
                    <div key={player.playerId} className="snap-start shrink-0">
                        <LeaderboardCard entry={player} rank={i + 1}/>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default TopPlayers;