import { pgTable, uuid, varchar, text, integer, timestamp, index } from 'drizzle-orm/pg-core';

export const pageErrors = pgTable(
  'page_errors',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    path: varchar('path', { length: 500 }).notNull().unique(),
    referer: text('referer'),
    userAgent: text('user_agent'),
    count: integer('count').notNull().default(1),
    firstSeen: timestamp('first_seen').defaultNow().notNull(),
    lastSeen: timestamp('last_seen').defaultNow().notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
  },
  (table) => ({
    pathIdx: index('idx_page_errors_path').on(table.path),
    lastSeenIdx: index('idx_page_errors_last_seen').on(table.lastSeen),
  }),
);
