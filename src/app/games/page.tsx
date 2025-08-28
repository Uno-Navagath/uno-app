'use client'

import React, {useEffect, useState} from "react";
import {GameDetails} from "@/database/schema";
import {GameItemCard} from "@/components/game-card";
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectLabel,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {ScrollArea} from "@/components/ui/scroll-area";
import Loader from "@/components/loader";
import {GameStatus} from "@/database/actions";

function GamesPage() {
    const [games, setGames] = useState<GameDetails[]>([]);
    const [loading, setLoading] = useState(false);
    const [selectedPeriod, setSelectedPeriod] = useState("all");
    const [selectedType, setSelectedType] = useState<GameStatus | "all">("all");

    const fetchGames = async (period: string, type: GameStatus | "all") => {
        setLoading(true);
        try {
            const query = new URLSearchParams();
            if (period !== "all") query.set("date", period);
            if (type !== "all") query.set("status", type);

            const res = await fetch(`/api/game/all?${query.toString()}`);
            const data = await res.json();
            setGames(data);
        } catch (err) {
            console.error("Error fetching games", err);
            setGames([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchGames(selectedPeriod, selectedType);
    }, [selectedPeriod, selectedType]);

    return (
        <div className="h-screen flex flex-col p-4 max-w-3xl mx-auto">
            {/* Header with filters */}
            <div className="flex-none flex flex-col sm:flex-row justify-between gap-4 mb-4">
                <h1 className="text-2xl font-bold flex-1">Games</h1>

                <div className="flex gap-2">
                    {/* Game type filter */}
                    <Select value={selectedType} onValueChange={
                        (value) => {
                            setSelectedType(value as GameStatus | "all");
                        }
                    }>
                        <SelectTrigger className="w-[150px]">
                            <SelectValue placeholder="Game type"/>
                        </SelectTrigger>
                        <SelectContent>
                            <SelectGroup>
                                <SelectLabel>Game Type</SelectLabel>
                                <SelectItem value="all">All</SelectItem>
                                <SelectItem value="active">Active</SelectItem>
                                <SelectItem value="finished">Finished</SelectItem>
                            </SelectGroup>
                        </SelectContent>
                    </Select>

                    {/* Time range filter */}
                    <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
                        <SelectTrigger className="w-[180px]">
                            <SelectValue placeholder="Select time range"/>
                        </SelectTrigger>
                        <SelectContent>
                            <SelectGroup>
                                <SelectLabel>Time Range</SelectLabel>
                                <SelectItem value="all">All time</SelectItem>
                                <SelectItem value="today">Today</SelectItem>
                                <SelectItem value="this_week">This week</SelectItem>
                                <SelectItem value="last_week">Last week</SelectItem>
                                <SelectItem value="last_30_days">Last 30 days</SelectItem>
                            </SelectGroup>
                        </SelectContent>
                    </Select>
                </div>
            </div>

            {/* Scrollable content */}
            <div className="flex-1 min-h-0">
                {loading ? (
                    <div className="flex items-center justify-center h-full">
                        <Loader/>
                    </div>
                ) : games.length === 0 ? (
                    <div className="flex items-center justify-center h-full text-muted-foreground">
                        No games found
                    </div>
                ) : (
                    <ScrollArea className="h-full pr-4">
                        <div className="flex flex-col gap-4">
                            {games.map((game, index) => (
                                <GameItemCard key={game.id ?? index} game={game}/>
                            ))}
                        </div>
                    </ScrollArea>
                )}
            </div>
        </div>
    );
}

export default GamesPage;
