import {db} from "@/database/client";
import {and, eq} from "drizzle-orm";
import {
    Game as BaseGame,
    GameDetails,
    GameDetails as Game,
    games,
    Participant,
    participants,
    scores
} from "@/database/schema";

export const createGame = async (hostId: string, participantIds: string[]): Promise<BaseGame> => {
    const [game] = await db
        .insert(games)
        .values({
            hostId: hostId,
        })
        .returning();

    for (const participantId of participantIds) {
        db.insert(participants).values({
            gameId: game.id,
            playerId: participantId,
        });
    }

    return game;
}

export const finishGame = async (gameId: string): Promise<BaseGame> => {
    const [game] = await db
        .update(games)
        .set({
            status: 'finished',
        })
        .where(eq(games.id, gameId))
        .returning();
    return game;
}

export const addPlayerToGame = async (
    gameId: string,
    playerId: string
): Promise<Participant | undefined> => {
    const [participant] = await db
        .insert(participants)
        .values({
            gameId: gameId,
            playerId: playerId,
        })
        .returning();

    const game = await getGameById(gameId);

    const roundScores = game?.rounds.map(round => {
        const scores = round.scores.map(s => s.value);

        if (scores.length === 0) return 0; // no scores yet in this round

        // average of existing players in this round
        const avg = scores.reduce((sum, v) => sum + v, 0) / scores.length;
        return avg;
    }) ?? [];

    for (let i = 0; i < roundScores.length; i++) {
        const roundScore = roundScores[i];
        const round = game?.rounds[i];
        if (!round) continue;
        await db.insert(scores).values({
            participantId: participant.id,
            roundId: round.id,
            value: roundScore,
        });
    }

    return participant;
};

export const removePlayerFromGame = async (
    gameId: string,
    playerId: string
): Promise<void> => {
    await db
        .delete(participants)
        .where(
            and(
                eq(participants.gameId, gameId),
                eq(participants.playerId, playerId)
            )
        );
};

export const getGameById = async (id: string): Promise<GameDetails | undefined> => {
    return db.query.games.findFirst({
        where: eq(games.id, id),
        with: {
            host: true,
            participants: {
                with: {
                    player: true
                }
            },
            rounds: {
                with: {
                    scores: {
                        with: {
                            participant: {
                                with: {
                                    player: true,
                                },
                            }
                        }
                    }
                }
            }
        }
    });
}

export type GameStatus = 'active' | 'finished';
export type GameDateFilter = 'today' | 'this_week' | 'last_30_days';

export const getGames = async (
    status?: GameStatus,
    dateFilter?: GameDateFilter,
    limit?: number
): Promise<GameDetails[]> => {
    return db.query.games.findMany({
        where: (games, { and, eq, gte }) => {
            const conditions = [];

            if (status) {
                conditions.push(eq(games.status, status));
            }

            if (dateFilter) {
                const now = new Date();
                const startDate = new Date();

                switch (dateFilter) {
                    case "today":
                        startDate.setHours(0, 0, 0, 0);
                        break;
                    case "this_week":
                        startDate.setDate(now.getDate() - 7);
                        break;
                    case "last_30_days":
                        startDate.setDate(now.getDate() - 30);
                        break;
                }

                conditions.push(gte(games.createdAt, startDate));
            }

            return conditions.length > 0 ? and(...conditions) : undefined;
        },
        with: {
            host: true,
            participants: {
                with: {
                    player: true,
                },
            },
            rounds: {
                with: {
                    scores: {
                        with: {
                            participant: {
                                with: {
                                    player: true,
                                },
                            },
                        },
                    },
                },
            },
        },
        limit: limit ?? undefined,
    });
};
