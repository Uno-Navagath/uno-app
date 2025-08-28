'use client'
import React, {useEffect, useState} from 'react';
import {GameDetails} from "@/database/schema";
import {GameItemCard} from "@/components/game-card";
import {Button} from "@/components/ui/button";
import Link from "next/link";
import {ChevronRightIcon} from "lucide-react";
import Loader from "@/components/loader";

const RecentGames = () => {
    const [loading, setLoading] = useState(false);
    const [games, setGames] = useState<GameDetails[]>([]);

    useEffect(() => {
        const fetchGames = async () => {
            setLoading(true);

            const response = await fetch('/api/game/all?limit=3');
            const data = await response.json();
            setGames(data);

            setLoading(false);
        };
        fetchGames();
    }, []);

    if (loading) return <div className="flex items-center justify-center h-full"><Loader/></div>;

    if (games.length === 0) return (
        <div className="flex flex-col gap-2 p-4">
            <div className="flex justify-between items-center">
                <h2 className="text-lg font-semibold">Recent Games</h2>
            </div>
            <div className="flex items-center justify-center h-full m-10">No games yet</div>
        </div>
    )

    return (
        <div className="flex flex-col gap-2 p-4">
            <div className="flex justify-between items-center">
                <h2 className="text-lg font-semibold">Recent Games</h2>
                <Button variant="outline" size="sm" asChild>
                    <Link href="/games" className="text-sm">
                        <div className="flex items-center">
                            View All
                            <ChevronRightIcon className="ml-2 h-4 w-4"/>
                        </div>
                    </Link>
                </Button>
            </div>
            <div className="flex flex-row gap-4 overflow-x-auto snap-x snap-mandatory scrollbar-hide">
                {games.map((game, index) => (
                    <div key={index} className="snap-center shrink-0">
                        <GameItemCard game={game}/>
                    </div>
                ))}
            </div>
        </div>
    );
};
export default RecentGames;