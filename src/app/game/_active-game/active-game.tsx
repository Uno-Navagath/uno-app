import React from 'react';
import {Separator} from '@/components/ui/separator';
import {GameDetails} from '@/database/schema';
import {Avatar, AvatarFallback, AvatarImage} from '@/components/ui/avatar';
import AddPlayer from "@/app/game/_active-game/components/add-player";
import {usePlayerStore} from "@/lib/stores/player-store";
import {Button} from "@/components/ui/button";

const ActiveGame = ({game}: { game: GameDetails }) => {
    const player = usePlayerStore.getState().player;
    const isHost = (player && player.id === game.host.id) ?? false;
    // const isHost = true;
    return (
        <div className="p-4 space-y-6 max-w-3xl mx-auto">
            <GameHeader game={game}/>
            <Separator/>
            <CurrentRound game={game} isHost={isHost}/>
            <Separator/>
            {game && (<AddPlayer gameId={game.id}/>)}
            <Separator/>
            <GameStats game={game}/>
            <Separator/>
            <PreviousRounds game={game}/>
            <Separator/>
            <EndGameButton/>
        </div>
    );
};

/* ------------------- Components ------------------- */

const GameHeader = ({game}: { game: GameDetails }) => (
    <div className="flex flex-row justify-between sm:items-center gap-2">
        <div>
            <h2 className="text-xs text-muted-foreground font-semibold">#{game.id}</h2>
        </div>
    </div>
);

const CurrentRound = ({game, isHost}: { game: GameDetails, isHost: boolean }) => (
    <div className="space-y-4">
        <h3 className="text-md font-medium">Current Round</h3>
        <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3">
            {game.participants.map((p) => (
                <div key={p.id} className="flex flex-col gap-2 bg-muted/50 p-3 rounded-lg">
                    <div className="flex justify-between items-center">
                        <div className="flex items-center gap-2">
                            <Avatar className="h-6 w-6">
                                <AvatarImage
                                    src={p.player.imageUrl || '/default-avatar.png'}
                                    alt={p.player.name}
                                />
                                <AvatarFallback>{p.player.name[0]}</AvatarFallback>
                            </Avatar>
                            <p className="text-sm font-medium">{p.player.name}</p>
                        </div>
                        {isHost && (
                            <button className="text-destructive hover:text-destructive/80 transition">
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24"
                                     fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"
                                     strokeLinejoin="round">
                                    <path d="M3 6h18"/>
                                    <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/>
                                    <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/>
                                </svg>
                            </button>
                        )}
                    </div>
                    <input
                        type="number"
                        placeholder="Score"
                        className="border border-border rounded-md px-2 py-1 text-sm w-full focus:outline-none focus:ring-2 focus:ring-primary/50"
                    />
                </div>
            ))}
        </div>
        <Button className="w-full">
            Submit

        </Button>
    </div>
);

const PreviousRounds = ({game}: { game: GameDetails }) => (
    <div className="space-y-2">
        <h3 className="text-md font-medium">Previous Rounds</h3>
        <div className="max-h-64 overflow-y-auto space-y-2">
            {game.rounds.map((round, idx) => (
                <div key={round.id} className="p-2 border border-border rounded-md">
                    <p className="text-sm font-medium mb-1">Round {idx + 1}</p>
                    <div className="flex flex-col gap-1">
                        {round.scores.map((s) => (
                            <div key={s.id} className="flex justify-between text-sm">
                <span className="flex items-center gap-2">
                  <Avatar className="h-5 w-5">
                    <AvatarImage
                        src={s.participant.player.imageUrl || '/default-avatar.png'}
                        alt={s.participant.player.name}
                    />
                    <AvatarFallback>{s.participant.player.name[0]}</AvatarFallback>
                  </Avatar>
                    {s.participant.player.name}
                </span>
                                <span className="font-medium">{s.value}</span>
                            </div>
                        ))}
                    </div>
                </div>
            ))}
        </div>
    </div>
);

const GameStats = ({game}: { game: GameDetails }) => {
    const allScores = game.rounds.flatMap((r) => r.scores.map((s) => ({
        value: s.value,
        player: s.participant.player
    })));

    const avg = allScores.length ? allScores.reduce((a, b) => a + b.value, 0) / allScores.length : 0;

    const bestScore = allScores.length ? Math.min(...allScores.map(s => s.value)) : '-';
    const bestPlayers = allScores
        .filter(s => s.value === bestScore)
        .map(s => s.player.name)
        .join(', ');

    const worstScore = allScores.length ? Math.max(...allScores.map(s => s.value)) : '-';
    const worstPlayers = allScores
        .filter(s => s.value === worstScore)
        .map(s => s.player.name)
        .join(', ');

    const totals = allScores.reduce((acc, score) => {
        const playerName = score.player.name;
        acc[playerName] = (acc[playerName] || 0) + score.value;
        return acc;
    }, {} as Record<string, number>);

    const leader = Object.entries(totals).sort(([, a], [, b]) => b - a)[0];

    return (
        <div className="space-y-3">
            <h3 className="text-md font-medium">Game Stats</h3>
            <div className="grid grid-cols-2 gap-2 text-center">
                <div className="bg-muted p-2 rounded-md">
                    <p className="text-xs text-muted-foreground">Avg Score</p>
                    <p className="font-semibold">{avg.toFixed(1)}</p>
                </div>
                <div className="bg-muted p-2 rounded-md">
                    <p className="text-xs text-muted-foreground">Best Score</p>
                    <p className="font-semibold">{bestScore}</p>
                    <p className="text-xs text-muted-foreground">{bestPlayers}</p>
                </div>
                <div className="bg-muted p-2 rounded-md">
                    <p className="text-xs text-muted-foreground">Worst Score</p>
                    <p className="font-semibold">{worstScore}</p>
                    <p className="text-xs text-muted-foreground">{worstPlayers}</p>
                </div>
                <div className="bg-muted p-2 rounded-md">
                    <p className="text-xs text-muted-foreground">Current Leader</p>
                    <p className="font-semibold">{leader ? leader[0] : '-'}</p>
                    <p className="text-xs text-muted-foreground">{leader ? `Total: ${leader[1]}` : ''}</p>
                </div>
            </div>
        </div>
    );
};
const EndGameButton = () => (
    <Button variant='destructive' className="w-full">
        End Game
    </Button>
);

export default ActiveGame;
