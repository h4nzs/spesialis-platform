import { pgTable, uuid, varchar, text, integer, timestamp } from 'drizzle-orm/pg-core';

export const faq = pgTable('faq', {
  id: uuid('id').defaultRandom().primaryKey(),
  question: varchar('question', { length: 500 }).notNull(),
  answer: text('answer').notNull(),
  category: varchar('category', { length: 100 }),
  displayOrder: integer('display_order').notNull().default(0),
  isActive: varchar('is_active', { length: 20 }).notNull().default('true'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
  deletedAt: timestamp('deleted_at'),
});
