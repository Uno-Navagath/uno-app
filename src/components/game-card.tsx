"use client";

import {formatDistanceToNow} from "date-fns";
import {Card, CardContent, CardFooter, CardHeader,} from "@/components/ui/card";
import {Badge} from "@/components/ui/badge";
import {Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger,} from "@/components/ui/dialog";
import {Avatar, AvatarFallback, AvatarImage} from "@/components/ui/avatar";
import {Separator} from "@/components/ui/separator";
import {GameDetails, Player, RoundWithScores} from "@/database/schema";
import {ScrollArea} from "@radix-ui/react-scroll-area";
import Link from "next/link";

// util: compute stats
const getPlayerStats = (game: GameDetails) => {
    const totals: Record<string, { sum: number; rounds: number }> = {};
    game.rounds.forEach((round: RoundWithScores) => {
        round.scores.forEach((score) => {
            const pid = score.participant.playerId;
            if (!totals[pid]) totals[pid] = {sum: 0, rounds: 0};
            totals[pid].sum += score.value;
            totals[pid].rounds++;
        });
    });

    return game.participants.map((p) => {
        const {sum, rounds} = totals[p.playerId] || {sum: 0, rounds: 0};
        return {
            player: p.player,
            avg: rounds > 0 ? sum / rounds : 0,
            total: sum,
        };
    });
};

const chooseWinner = (stats: { player: Player; avg: number; total: number }[]) => {
    stats.sort((a, b) => {
        if (a.avg !== b.avg) return a.avg - b.avg;
        if (a.total !== b.total) return a.total - b.total;
        return a.player.name.localeCompare(b.player.name);
    });

    const winner = stats[0];
    const runnerUp = stats[1];

    let reason = "Lowest avg score";
    if (runnerUp && winner.avg === runnerUp.avg) {
        reason = "Tie → Consistency";
    }
    return {winner, reason};
};

export function GameItemCard({game}: { game: GameDetails }) {
    const stats = getPlayerStats(game);
    const {winner, reason} = chooseWinner([...stats]);
    const isFinished = game.status === "finished";
    const leader = !isFinished
        ? [...stats].sort((a, b) => a.avg - b.avg)[0]
        : null;

    return (
        <Link href={`/game?id?${game.id}`} className={`w-full`}>
            <Card className="flex flex-col rounded-xl shadow-sm border border-border h-full">
                {/* HEADER */}
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <span className="text-xs text-muted-foreground">Game #{game.id}</span>
                    <span className="text-xs text-muted-foreground">Host {game.host.name}</span>
                </CardHeader>

                {/* BODY */}
                <CardContent className="flex-1 flex flex-col justify-between space-y-4">
                    {/* Stats row */}
                    <div className="grid grid-cols-3 text-center">
                        <div>
                            <p className="font-semibold">{game.participants.length}</p>
                            <p className="text-xs text-muted-foreground">Players</p>
                        </div>
                        <div>
                            <p className="font-semibold">{game.rounds.length}</p>
                            <p className="text-xs text-muted-foreground">Rounds</p>
                        </div>
                        <div>
                            <p className="font-semibold">
                                {formatDistanceToNow(new Date(game.createdAt), {addSuffix: true})}
                            </p>
                            <p className="text-xs text-muted-foreground">Played</p>
                        </div>
                    </div>

                    <Separator/>

                    {/* Outcome / status */}
                    <div className="flex items-center justify-between">
                        {isFinished ? (
                            <>
                                <div className="flex items-center gap-2">
                                    <Avatar className="h-8 w-8">
                                        <AvatarImage
                                            src={winner.player.imageUrl || "/default-avatar.png"}
                                            alt={winner.player.name}
                                        />
                                        <AvatarFallback>{winner.player.name[0]}</AvatarFallback>
                                    </Avatar>
                                    <div>
                                        <p className="text-sm font-medium">{winner.player.name}</p>
                                        <p className="text-xs text-muted-foreground">{reason}</p>
                                    </div>
                                </div>
                                <Badge variant="outline">Finished</Badge>
                            </>
                        ) : (
                            <>
                                <div className="flex items-center gap-2">
                                    {leader && (
                                        <>
                                            <Avatar className="h-8 w-8">
                                                <AvatarImage
                                                    src={leader.player.imageUrl || "/default-avatar.png"}
                                                    alt={leader.player.name}
                                                />
                                                <AvatarFallback>{leader.player.name[0]}</AvatarFallback>
                                            </Avatar>
                                            <p className="text-sm font-medium">
                                                Leading: {leader.player.name}
                                            </p>
                                        </>
                                    )}
                                </div>
                                <Badge className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300">
                                    Active
                                </Badge>
                            </>
                        )}
                    </div>
                </CardContent>

                {/* FOOTER */}
                <CardFooter className="pt-3 flex justify-end">
                    <RoundsDialog rounds={game.rounds}/>

                </CardFooter>
            </Card>
        </Link>
    );
}

const RoundsDialog = ({rounds}: { rounds: RoundWithScores[] }) => {
    return (
        <Dialog>
            <DialogTrigger asChild>
                <button className="text-xs text-primary underline">View rounds</button>
            </DialogTrigger>

            <DialogContent className="sm:max-w-[600px] max-h-[80vh] flex flex-col">
                <DialogHeader>
                    <DialogTitle>Game Rounds</DialogTitle>
                </DialogHeader>

                {/* ✅ scrollable section */}
                <div className="flex-1 overflow-y-auto">
                    <ScrollArea className="h-full w-full pr-4">
                        <div className="space-y-4 p-2">
                            {rounds.map((round, idx) => (
                                <RoundItem key={round.id} round={round} number={idx + 1}/>
                            ))}
                        </div>
                    </ScrollArea>
                </div>
            </DialogContent>
        </Dialog>
    );
};


const RoundItem = ({round, number}: { round: RoundWithScores, number: number }) => {
    return (
        <>
            <p className="text-sm font-medium mb-2">Round {number}</p>

            <div className="space-y-2">
                {round.scores.map((s) => (
                    <div key={s.id} className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2">
                            <Avatar className="h-6 w-6">
                                <AvatarImage
                                    src={s.participant.player.imageUrl || "/default-avatar.png"}
                                    alt={s.participant.player.name}
                                />
                                <AvatarFallback>{s.participant.player.name[0]}</AvatarFallback>
                            </Avatar>
                            <span>{s.participant.player.name}</span>
                        </div>
                        <span className="font-medium">{s.value}</span>
                    </div>
                ))}
            </div>
        </>
    )
}
