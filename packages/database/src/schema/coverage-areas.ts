import { pgTable, uuid, varchar, text, integer, timestamp } from 'drizzle-orm/pg-core';

export const coverageAreas = pgTable('coverage_areas', {
  id: uuid('id').defaultRandom().primaryKey(),
  city: varchar('city', { length: 100 }).notNull(),
  note: text('note'),
  displayOrder: integer('display_order').notNull().default(0),
  isActive: varchar('is_active', { length: 20 }).notNull().default('true'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});
