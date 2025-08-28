import {db} from "@/database/client";
import {eq} from "drizzle-orm";
import {Player, players} from "@/database/schema";
import {Game, games, participants} from "@/database/schema/game";

export const createPlayer = async (data: {
    firebaseId: string;
    name: string;
    email: string;
    imageUrl?: string;
}): Promise<Player> => {
    const [player] = await db
        .insert(players)
        .values({
            firebaseId: data.firebaseId,
            name: data.name,
            email: data.email,
            imageUrl: data.imageUrl,
        })
        .returning();
    return player;
};

export const getAllPlayers = async (): Promise<Player[]> => {
    return db.select().from(players);
};


export const getPlayerByFirebaseId = async (
    firebaseId: string
): Promise<Player | undefined> => {
    const [player] = await db
        .select()
        .from(players)
        .where(eq(players.firebaseId, firebaseId))
        .limit(1);
    return player;
};

export interface PlayerDetails {
    player: Player;
    gamesPlayed: number;
    gamesHosted: number;
    gameHistory: Game[];

    // Basic stats
    winRate: number;
    totalScore: number;
    averageScore: number;
    bestScore: number;
    worstScore: number;
    medianScore: number;

    // Placement stats
    averagePlacement: number;
    bestPlacement: number;
    worstPlacement: number;
    top3Finishes: number;

    // Time-based trends
    weeklyScores: Array<{ week: string; avgScore: number }>;
    recentScores: Array<{ date: string; score: number }>;
    placementTrend: Array<{ date: string; placement: number }>;

    // Distribution
    scoreDistribution: Array<{ scoreRange: string; count: number }>;
}

export const getPlayerDetails = async (
    playerId: string
): Promise<PlayerDetails | undefined> => {
    const [player] = await db
        .select()
        .from(players)
        .where(eq(players.id, playerId))
        .limit(1);

    if (!player) return undefined;

    const gameHistory = await db
        .select()
        .from(games)
        .leftJoin(participants, eq(games.id, participants.gameId))
        .where(eq(participants.playerId, playerId));

    const hostedGames = await db
        .select()
        .from(games)
        .where(eq(games.hostId, playerId));

    const totalGamesPlayed = gameHistory.length;
    const totalGamesHosted = hostedGames.length;

    // --- Extract scores & placements (stub: depends on schema) ---
    const scores: number[] = []; // TODO: collect from rounds.scores
    const placements: number[] = []; // TODO: derive from comparing scores with other players
    const dates: string[] = []; // TODO: collect game dates

    // --- Basic Stats ---
    const totalScore = scores.reduce((a, b) => a + b, 0);
    const averageScore = scores.length ? totalScore / scores.length : 0;
    const bestScore = scores.length ? Math.min(...scores) : 0;
    const worstScore = scores.length ? Math.max(...scores) : 0;
    const medianScore = scores.length
        ? [...scores].sort((a, b) => a - b)[Math.floor(scores.length / 2)]
        : 0;

    // --- Placement Stats ---
    const averagePlacement = placements.length
        ? placements.reduce((a, b) => a + b, 0) / placements.length
        : 0;
    const bestPlacement = placements.length ? Math.min(...placements) : 0;
    const worstPlacement = placements.length ? Math.max(...placements) : 0;
    const top3Finishes = placements.filter(p => p <= 3).length;

    // --- Graph Data ---
    const weeklyScores = groupByWeek(scores, dates);
    const recentScores = scores.slice(-10).map((score, i) => ({
        date: dates[dates.length - 10 + i],
        score,
    }));
    const placementTrend = placements.map((p, i) => ({
        date: dates[i],
        placement: p,
    }));
    const scoreDistribution = buildScoreHistogram(scores);

    // --- Win rate (lower score = win) ---
    const wins = placements.filter(p => p === 1).length;
    const winRate = totalGamesPlayed ? (wins / totalGamesPlayed) * 100 : 0;

    return {
        player,
        gamesPlayed: totalGamesPlayed,
        gamesHosted: totalGamesHosted,
        gameHistory: gameHistory.map(gh => gh.games),

        winRate,
        totalScore,
        averageScore,
        bestScore,
        worstScore,
        medianScore,

        averagePlacement,
        bestPlacement,
        worstPlacement,
        top3Finishes,

        weeklyScores,
        recentScores,
        placementTrend,
        scoreDistribution,
    };
};

/* ----------------- Helpers ----------------- */

function groupByWeek(scores: number[], dates: string[]) {
    const byWeek: Record<string, number[]> = {};
    scores.forEach((score, i) => {
        const week = getWeekKey(dates[i]);
        if (!byWeek[week]) byWeek[week] = [];
        byWeek[week].push(score);
    });
    return Object.entries(byWeek).map(([week, sc]) => ({
        week,
        avgScore: sc.reduce((a, b) => a + b, 0) / sc.length,
    }));
}

function getWeekKey(dateStr: string) {
    const d = new Date(dateStr);
    const year = d.getFullYear();
    const week = Math.ceil(
        ((+d - +new Date(year, 0, 1)) / 86400000 + new Date(year, 0, 1).getDay() + 1) /
        7
    );
    return `${year}-W${week}`;
}

function buildScoreHistogram(scores: number[]) {
    const buckets: Record<string, number> = {};
    const step = 10; // bucket width
    scores.forEach(s => {
        const bucket = `${Math.floor(s / step) * step}-${Math.floor(s / step) * step + step - 1}`;
        buckets[bucket] = (buckets[bucket] || 0) + 1;
    });
    return Object.entries(buckets).map(([scoreRange, count]) => ({scoreRange, count}));
}


