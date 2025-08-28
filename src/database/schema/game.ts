import {pgEnum, pgTable, timestamp, uuid} from 'drizzle-orm/pg-core';
import {Player, players} from './player';
import {RoundWithScores} from "@/database/schema/round";

export const gameStatusEnum = pgEnum('game_status', ['active', 'finished']);

export const games = pgTable('games', {
    id: uuid('id').primaryKey().defaultRandom(),
    hostId: uuid('host_id').references(() => players.id, {onDelete: 'set null'}),
    status: gameStatusEnum('status').notNull().default('active'),
    createdAt: timestamp("created_at", {withTimezone: true}).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", {withTimezone: true})
        .notNull()
        .$onUpdate(() => new Date()),
});

export const participants = pgTable('participants', {
    id: uuid('id').primaryKey().defaultRandom(),
    gameId: uuid('game_id').notNull().references(() => games.id, {onDelete: 'cascade'}),
    playerId: uuid('player_id').notNull().references(() => players.id, {onDelete: 'cascade'}),
})

export type Participant = typeof participants.$inferSelect;
export type ParticipantWithPlayer = Participant & { player: Player };
export type Game = typeof games.$inferSelect;
export type GameDetails = Game & { host: Player, participants: ParticipantWithPlayer[], rounds: RoundWithScores[] };