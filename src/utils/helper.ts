// helper: create fake player
import {GameDetails, ParticipantWithPlayer, Player, RoundWithScores, ScoreWithParticipant} from "@/database/schema";

export const createPlayer = (id: string, name: string, imgId: number): Player => ({
    id,
    firebaseId: `fb-${id}`,
    name,
    email: `${name.toLowerCase().replace(" ", ".")}@example.com`,
    imageUrl: `https://i.pravatar.cc/150?img=${imgId}`,
    createdAt: new Date(),
    updatedAt: new Date(),
});

// helper: random int
const rand = (min: number, max: number) =>
    Math.floor(Math.random() * (max - min + 1)) + min;

// generator for a game
export const createGame = (
    id: string,
    host: Player,
    players: Player[],
    roundsCount: number
): GameDetails => {
    const participants: ParticipantWithPlayer[] = players.map((p, idx) => ({
        id: `part-${id}-${idx}`,
        gameId: id,
        playerId: p.id,
        player: p,
    }));

    const rounds: RoundWithScores[] = Array.from({length: roundsCount}, (_, r) => {
        const roundId = `round-${id}-${r}`;
        const scores: ScoreWithParticipant[] = participants.map((part, pi) => ({
            id: pi + r * 1000, // just unique serial-like id
            participantId: part.id,
            roundId,
            value: rand(10, 80),
            createdAt: new Date(),
            updatedAt: new Date(),
            participant: part,
        }));

        return {
            id: roundId,
            gameId: id,
            createdAt: new Date(),
            updatedAt: new Date(),
            scores,
        };
    });

    return {
        id,
        status: rand(0, 1) ? "active" : "finished",
        hostId: host.id,
        host,
        participants,
        rounds,
        createdAt: new Date(),
        updatedAt: new Date(),
    };
};

// ---- Dummy Games ----
export const playersPool: Player[] = [
    createPlayer("p1", "Alice Johnson", 1),
    createPlayer("p2", "Bob Smith", 2),
    createPlayer("p3", "Charlie Brown", 3),
    createPlayer("p4", "Diana Prince", 4),
    createPlayer("p5", "Ethan Hunt", 5),
    createPlayer("p6", "Fiona Gallagher", 6),
    createPlayer("p7", "George Miller", 7),
    createPlayer("p8", "Hannah Wilson", 8),
];

export const dummyGames: GameDetails[] = [
    createGame("game-1", playersPool[0], playersPool.slice(0, 5), 6),
    createGame("game-2", playersPool[2], playersPool.slice(2, 7), 8),
    createGame("game-3", playersPool[5], playersPool.slice(1, 7), 10),
];