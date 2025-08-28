import { relations } from "drizzle-orm";
import { games, participants, players } from "@/database/schema";
import { rounds } from "@/database/schema/round";
import { scores } from "@/database/schema/score";

// --- Games Relations ---
export const gamesRelations = relations(games, ({ one, many }) => ({
    host: one(players, {
        fields: [games.hostId],
        references: [players.id],
    }),
    participants: many(participants),
    rounds: many(rounds),
}));

// --- Participants Relations ---
export const participantsRelations = relations(participants, ({ one, many }) => ({
    game: one(games, {
        fields: [participants.gameId],
        references: [games.id],
    }),
    player: one(players, {
        fields: [participants.playerId],
        references: [players.id],
    }),
    scores: many(scores),
}));

// --- Players Relations ---
export const playersRelations = relations(players, ({ many }) => ({
    hostedGames: many(games), // via games.hostId
    participants: many(participants),
}));

// --- Rounds Relations ---
export const roundsRelations = relations(rounds, ({ one, many }) => ({
    game: one(games, {
        fields: [rounds.gameId],
        references: [games.id],
    }),
    scores: many(scores),
}));

// --- Scores Relations ---
export const scoresRelations = relations(scores, ({ one }) => ({
    round: one(rounds, {
        fields: [scores.roundId],
        references: [rounds.id],
    }),
    participant: one(participants, {
        fields: [scores.participantId],
        references: [participants.id],
    }),
}));
