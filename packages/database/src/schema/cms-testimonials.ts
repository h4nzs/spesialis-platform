import { pgTable, uuid, varchar, text, numeric, integer, timestamp } from 'drizzle-orm/pg-core';

export const cmsTestimonials = pgTable('cms_testimonials', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: varchar('name', { length: 200 }).notNull(),
  location: varchar('location', { length: 200 }),
  role: varchar('role', { length: 200 }),
  quote: text('quote').notNull(),
  rating: numeric('rating', { precision: 2, scale: 1 }).notNull().default('5'),
  avatar: text('avatar'),
  displayOrder: integer('display_order').notNull().default(0),
  isActive: varchar('is_active', { length: 20 }).notNull().default('true'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
  deletedAt: timestamp('deleted_at'),
});
