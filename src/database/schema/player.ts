import {pgTable, timestamp, uuid, varchar} from "drizzle-orm/pg-core";

export const players = pgTable('players', {
    id: uuid('id').primaryKey().defaultRandom(),
    firebaseId: varchar('firebase_id', {length: 256}).notNull(),
    name: varchar('name', {length: 256}).notNull(),
    email: varchar('email', {length: 256}).notNull(),
    imageUrl: varchar('image_url', {length: 1024}),
    createdAt: timestamp("created_at", {withTimezone: true}).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", {withTimezone: true})
        .notNull()
        .$onUpdate(() => new Date()),
});

export type Player = typeof players.$inferSelect;