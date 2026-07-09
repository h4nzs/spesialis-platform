import { pgTable, uuid, varchar, timestamp, boolean, index } from 'drizzle-orm/pg-core';
import { users } from './users.ts';

export const passwordResets = pgTable(
  'password_resets',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    userId: uuid('user_id')
      .references(() => users.id, { onDelete: 'cascade' })
      .notNull(),
    tokenHash: varchar('token_hash', { length: 255 }).notNull().unique(),
    expiresAt: timestamp('expires_at').notNull(),
    used: boolean('used').notNull().default(false),
    createdAt: timestamp('created_at').defaultNow().notNull(),
  },
  (table) => ({
    userIdIdx: index('idx_password_resets_user_id').on(table.userId),
  }),
);
