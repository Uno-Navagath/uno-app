'use client'
import React, {useEffect, useState} from 'react';
import {Button} from '@/components/ui/button';
import {Input} from '@/components/ui/input';
import {Avatar, AvatarFallback, AvatarImage} from '@/components/ui/avatar';
import {Player} from '@/database/schema';
import {ScrollArea} from '@/components/ui/scroll-area';
import Loader from '@/components/loader';

export default function Page() {
    const [loading, setLoading] = useState(false);
    const [players, setPlayers] = useState<Player[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedPlayers, setSelectedPlayers] = useState<Player[]>([]);

    useEffect(() => {
        const fetchPlayers = async () => {
            setLoading(true);
            const response = await fetch('/api/player/all');
            const data = await response.json();
            setPlayers(data);
            setLoading(false);
        };
        fetchPlayers();
    }, []);

    const filteredPlayers = players.filter(
        (p) =>
            p.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
            !selectedPlayers.some((sp) => sp.id === p.id)
    );

    const togglePlayer = (player: Player) => {
        if (!selectedPlayers.some((p) => p.id === player.id)) {
            setSelectedPlayers((prev) => [...prev, player]);
        }
    };

    const removePlayer = (player: Player) => {
        setSelectedPlayers((prev) => prev.filter((p) => p.id !== player.id));
    };

    const createGame = () => {
        console.log('Creating game with players:', selectedPlayers);
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-screen">
                <Loader/>
            </div>
        );
    }

    return (
        <div className="h-screen max-w-md mx-auto flex flex-col p-4">
            {/* Header */}
            <h1 className="text-xl font-bold mb-4 flex-shrink-0">Create Game</h1>

            {/* Search input */}
            <div className="mb-2 flex-shrink-0">
                <Input
                    placeholder="Search players..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                />
            </div>

            {/* Selected chips */}
            <div className="flex flex-wrap gap-2 mb-2 flex-shrink-0 my-2">
                {selectedPlayers.map((player) => (
                    <div
                        key={player.id}
                        className="flex items-center gap-1 bg-muted px-2 py-1 rounded-full text-sm"
                    >
                        <Avatar className="h-5 w-5">
                            {player.imageUrl ? (
                                <AvatarImage src={player.imageUrl}/>
                            ) : (
                                <AvatarFallback>{player.name[0]}</AvatarFallback>
                            )}
                        </Avatar>
                        <span>{player.name}</span>
                        <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => removePlayer(player)}
                            className="h-4 w-4 p-0"
                        >
                            ✕
                        </Button>
                    </div>
                ))}
            </div>

            {/* Scrollable player list (flex-1 + min-h-0) */}
            <div className="flex-1 min-h-0 mb-20">
                <ScrollArea className="h-full">
                    <div className="flex flex-col gap-2">
                        {filteredPlayers.length > 0 ? (
                            filteredPlayers.map((player) => (
                                <Button
                                    key={player.id}
                                    variant="outline"
                                    className="justify-start"
                                    onClick={() => togglePlayer(player)}
                                >
                                    <Avatar className="h-6 w-6 mr-2">
                                        {player.imageUrl ? (
                                            <AvatarImage src={player.imageUrl}/>
                                        ) : (
                                            <AvatarFallback>{player.name[0]}</AvatarFallback>
                                        )}
                                    </Avatar>
                                    {player.name}
                                </Button>
                            ))
                        ) : (
                            <>
                                {
                                    (selectedPlayers.length) === 0 ? (
                                        <p className="text-sm text-muted-foreground">No players found</p>
                                    ) : (

                                        <p className="text-sm text-muted-foreground">All players added</p>
                                    )

                                }
                            </>
                        )}
                    </div>
                </ScrollArea>
            </div>

            {/* Fixed create button */}
            <div className="fixed bottom-0 left-0 right-0 bg-background max-w-md mx-auto p-4 border-t">
                <Button
                    onClick={createGame}
                    disabled={selectedPlayers.length < 2}
                    className="w-full"
                >
                    {selectedPlayers.length < 2
                        ? 'Select at least 2 players'
                        : 'Create Game'}
                </Button>
            </div>
        </div>
    );
}
