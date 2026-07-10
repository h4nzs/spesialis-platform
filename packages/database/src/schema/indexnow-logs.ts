import {
  pgTable,
  uuid,
  varchar,
  text,
  integer,
  boolean,
  timestamp,
  index,
} from 'drizzle-orm/pg-core';

export const indexnowLogs = pgTable(
  'indexnow_logs',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    url: text('url').notNull(),
    status: varchar('status', { length: 20 }).notNull().default('pending'),
    httpStatus: integer('http_status'),
    error: text('error'),
    duration: integer('duration'),
    keyUsed: varchar('key_used', { length: 100 }),
    destination: varchar('destination', { length: 50 }).notNull().default('indexnow'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
  },
  (table) => ({
    createdAtIdx: index('idx_indexnow_logs_created_at').on(table.createdAt),
    statusIdx: index('idx_indexnow_logs_status').on(table.status),
    urlIdx: index('idx_indexnow_logs_url').on(table.url),
  }),
);
