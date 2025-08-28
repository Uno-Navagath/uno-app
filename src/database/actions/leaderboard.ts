import {db} from "@/database/client";
import {games, participants, players, rounds, scores} from "@/database/schema";
import {eq, gte} from "drizzle-orm";

export type LeaderboardEntry = {
    playerId: string;
    name: string;
    imageUrl?: string;
    totalGames: number;
    totalScore: number;
    avgScore: number;
};

export const getTopPlayers = async (): Promise<LeaderboardEntry[]> => {
    return (await getLeaderboard(undefined)).slice(0, 5);
};

export type LeaderboardDateFilter = 'today' | 'this_week' | 'last_30_days';

export const getLeaderboard = async (
    dateFilter?: 'today' | 'this_week' | 'last_30_days',
): Promise<LeaderboardEntry[]> => {
    // 1. Date filter
    let fromDate: Date | undefined;
    const now = new Date();

    switch (dateFilter) {
        case "today":
            fromDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
            break;
        case "this_week": {
            const day = now.getDay();
            fromDate = new Date(now);
            fromDate.setDate(now.getDate() - day);
            break;
        }
        case "last_30_days":
            fromDate = new Date(now);
            fromDate.setDate(now.getDate() - 30);
            break;
    }

    // 2. Query all relevant scores with joins
    const rows = await db
        .select({
            playerId: players.id,
            playerName: players.name,
            playerImageUrl: players.imageUrl,
            gameId: games.id,
            score: scores.value,
        })
        .from(players)
        .innerJoin(participants, eq(participants.playerId, players.id))
        .innerJoin(scores, eq(scores.participantId, participants.id))
        .innerJoin(rounds, eq(rounds.id, scores.roundId))
        .innerJoin(games, eq(games.id, rounds.gameId))
        .where(fromDate ? gte(games.createdAt, fromDate) : undefined);

    // 3. Aggregate in-memory
    const stats: Record<string, LeaderboardEntry> = {};
    const gameScores: Record<string, Record<string, number>> = {};

    for (const row of rows) {
        if (!stats[row.playerId]) {
            stats[row.playerId] = {
                playerId: row.playerId,
                name: row.playerName,
                totalGames: 0,
                totalScore: 0,
                avgScore: 0,
            };
        }

        stats[row.playerId].totalScore += row.score;

        // per-game aggregation
        if (!gameScores[row.gameId]) gameScores[row.gameId] = {};
        gameScores[row.gameId][row.playerId] =
            (gameScores[row.gameId][row.playerId] || 0) + row.score;
    }

    // count totalGames
    for (const [, playerTotals] of Object.entries(gameScores)) {
        for (const playerId of Object.keys(playerTotals)) {
            stats[playerId].totalGames++;
        }
    }

    // finalize averages
    for (const s of Object.values(stats)) {
        s.avgScore = s.totalGames > 0 ? s.totalScore / s.totalGames : 0;
    }

    // 4. Sort leaderboard
    return Object.values(stats)
        .filter(s => s.totalGames > 0) // 🚨 exclude 0-game players
        .sort((a, b) =>
            a.avgScore - b.avgScore ||   // lowest avg score is better
            b.totalGames - a.totalGames || // more games = better
            a.totalScore - b.totalScore    // tie-breaker: lowest total score
        );
};
