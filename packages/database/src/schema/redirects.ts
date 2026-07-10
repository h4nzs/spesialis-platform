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

export const redirects = pgTable(
  'redirects',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    sourcePath: varchar('source_path', { length: 500 }).notNull().unique(),
    targetPath: text('target_path').notNull(),
    statusCode: integer('status_code').notNull().default(301),
    hitCount: integer('hit_count').notNull().default(0),
    isActive: boolean('is_active').notNull().default(true),
    notes: text('notes'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
  },
  (table) => ({
    sourcePathIdx: index('idx_redirects_source_path').on(table.sourcePath),
    activeIdx: index('idx_redirects_active').on(table.isActive),
  }),
);
