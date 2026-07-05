import { pgTable, uuid, varchar, timestamp, text, index } from 'drizzle-orm/pg-core';
import { users } from './users.ts';

export const systemSettings = pgTable(
  'system_settings',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    category: varchar('category', { length: 50 }).notNull(),
    key: varchar('key', { length: 100 }).notNull().unique(),
    value: text('value').notNull(),
    description: text('description'),
    updatedBy: uuid('updated_by').references(() => users.id),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
  },
  (table) => ({
    updatedByIdx: index('idx_system_settings_updated_by').on(table.updatedBy),
  }),
);
