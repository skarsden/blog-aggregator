import { pgTable, timestamp, uuid, text } from 'drizzle-orm/pg-core';

export const users = pgTable("users", {
    id: uuid("id").primaryKey().defaultRandom().notNull(),
    createdAt: timestamp("createdAt").notNull().defaultNow(),
    updatedAt: timestamp("updatedAt").notNull().defaultNow().$onUpdate(() => new Date()),
    name: text("name").notNull().unique(),
});