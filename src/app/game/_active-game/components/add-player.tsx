'use client'
import React, {useEffect} from 'react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import {Loader, Plus} from "lucide-react";
import {Button} from "@/components/ui/button";
import {Player} from "@/database/schema";
import {Input} from "@/components/ui/input";
import {Avatar, AvatarFallback, AvatarImage} from "@/components/ui/avatar";
import {playersPool} from "@/utils/helper";
import {useRouter} from "next/navigation";

const AddPlayer = ({gameId}: { gameId: string }) => {
    const router = useRouter();
    const [isOpen, setIsOpen] = React.useState(false);
    const [players, setPlayers] = React.useState<Player[]>([]);
    const [searchQuery, setSearchQuery] = React.useState('');

    const filteredPlayers = React.useMemo(() => {
        return players.filter(player =>
            player.name?.toLowerCase().includes(searchQuery.toLowerCase())
        );
    }, [players, searchQuery]);

    const onAddPlayer = async (player: Player) => {
        if (!gameId) return;
        await fetch(`/api/game/add-player`, {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({gameId, playerId: player.id}),
        });
        router.refresh();
        setIsOpen(false);
        setSearchQuery('');
    };

    useEffect(() => {
        setPlayers(playersPool);
    }, []);

    if (players.length === 0) return <Loader className="h-4 w-4 animate-spin"/>;

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                <Button variant="outline" className="w-full" asChild>
                    <div>
                        <Plus className="h-4 w-4"/>
                        <span>Add Player</span>
                    </div>
                </Button>
            </DialogTrigger>

            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Add Player</DialogTitle>
                    <DialogDescription>Add a new player to the game.</DialogDescription>
                </DialogHeader>

                <div className="grid gap-4 py-4">
                    <Input
                        placeholder="Search players..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />

                    <div className="flex flex-col gap-2 max-h-64 overflow-y-auto mt-2">
                        {filteredPlayers.length > 0 ? (
                            filteredPlayers.map((player) => (
                                <Button
                                    key={player.id}
                                    variant="outline"
                                    className="justify-start"
                                    onClick={() => onAddPlayer(player)}
                                >
                                    {player.imageUrl ? (
                                        <Avatar className="h-6 w-6 mr-2">
                                            <AvatarImage src={player.imageUrl}/>
                                            <AvatarFallback>{player.name[0]}</AvatarFallback>
                                        </Avatar>
                                    ) : null}
                                    {player.name}
                                </Button>
                            ))
                        ) : (
                            <div className="text-sm text-muted-foreground">No players found</div>
                        )}
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
};

export default AddPlayer;
