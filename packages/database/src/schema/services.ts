import {
  pgTable,
  uuid,
  varchar,
  timestamp,
  text,
  integer,
  boolean,
  index,
} from 'drizzle-orm/pg-core';
import { serviceCategories } from './service-categories.ts';

export const services = pgTable(
  'services',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    categoryId: uuid('category_id')
      .references(() => serviceCategories.id, { onDelete: 'restrict' })
      .notNull(),
    name: varchar('name', { length: 255 }).notNull(),
    slug: varchar('slug', { length: 255 }).notNull().unique(),
    shortDescription: varchar('short_description', { length: 300 }),
    description: text('description'),
    basePrice: text('base_price').notNull(),
    estimatedDuration: integer('estimated_duration'),
    warrantyDays: integer('warranty_days'),
    thumbnail: varchar('thumbnail', { length: 255 }),
    isActive: boolean('is_active').notNull().default(true),
    isFeatured: boolean('is_featured').notNull().default(false),
    displayOrder: integer('display_order').notNull().default(0),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
    deletedAt: timestamp('deleted_at'),
  },
  (table) => ({
    categoryIdIdx: index('idx_services_category_id').on(table.categoryId),
  }),
);
