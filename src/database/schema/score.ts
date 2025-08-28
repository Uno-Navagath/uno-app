import {integer, pgTable, serial, timestamp, uuid} from 'drizzle-orm/pg-core';
import {rounds} from "@/database/schema/round";
import {participants, ParticipantWithPlayer} from "@/database/schema/game";

export const scores = pgTable('scores', {
    id: serial('id').primaryKey(),
    participantId: uuid('participant_id').notNull().references(() => participants.id, {onDelete: 'cascade'}),
    roundId: uuid('round_id').notNull().references(() => rounds.id, {onDelete: 'cascade'}),
    value: integer('value').notNull(),
    createdAt: timestamp("created_at", {withTimezone: true}).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", {withTimezone: true})
        .notNull()
        .$onUpdate(() => new Date()),
});

export type Score = typeof scores.$inferSelect;
export type ScoreWithParticipant = Score & {
    participant: ParticipantWithPlayer;
};