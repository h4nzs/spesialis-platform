import { pgTable, uuid, varchar, text, integer, timestamp } from 'drizzle-orm/pg-core';

export const blogAds = pgTable('blog_ads', {
  id: uuid('id').defaultRandom().primaryKey(),
  title: varchar('title', { length: 255 }).notNull(),
  imageUrl: text('image_url').notNull(),
  caption: varchar('caption', { length: 500 }),
  linkUrl: text('link_url'),
  displayOrder: integer('display_order').notNull().default(0),
  isActive: varchar('is_active', { length: 20 }).notNull().default('true'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
  deletedAt: timestamp('deleted_at'),
});
