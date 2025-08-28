import {pgTable, timestamp, uuid} from "drizzle-orm/pg-core";
import {games} from "@/database/schema/game";
import {ScoreWithParticipant} from "@/database/schema/score";

export const rounds = pgTable('rounds', {
    id: uuid('id').primaryKey().defaultRandom(),
    gameId: uuid('game_id').notNull().references(() => games.id, {onDelete: 'cascade'}),
    createdAt: timestamp("created_at", {withTimezone: true}).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", {withTimezone: true})
        .notNull()
        .$onUpdate(() => new Date()),
});

export type Round = typeof rounds.$inferSelect;
export type RoundWithScores = Round & { scores: ScoreWithParticipant[] };