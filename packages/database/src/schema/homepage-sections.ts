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

export const homepageSections = pgTable(
  'homepage_sections',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    sectionType: varchar('section_type', { length: 50 }).notNull(),
    title: varchar('title', { length: 255 }),
    content: text('content'),
    imageMediaId: uuid('image_media_id'),
    sortOrder: integer('sort_order').notNull().default(0),
    isActive: boolean('is_active').notNull().default(true),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
  },
  (table) => ({
    sectionTypeIdx: index('idx_homepage_sections_section_type').on(table.sectionType),
    sortOrderIdx: index('idx_homepage_sections_sort_order').on(table.sortOrder),
  }),
);
