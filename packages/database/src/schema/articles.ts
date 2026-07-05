import { pgTable, uuid, varchar, timestamp, text, boolean, index } from 'drizzle-orm/pg-core';
import { articleCategories } from './article-categories.ts';

export const articles = pgTable(
  'articles',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    categoryId: uuid('category_id').references(() => articleCategories.id),
    title: varchar('title', { length: 255 }).notNull(),
    slug: varchar('slug', { length: 255 }).notNull().unique(),
    summary: varchar('summary', { length: 500 }),
    content: text('content'),
    coverImage: varchar('cover_image', { length: 255 }),
    authorName: varchar('author_name', { length: 255 }),
    status: varchar('status', { length: 50 }).notNull().default('Draft'),
    isFeatured: boolean('is_featured').notNull().default(false),
    publishedAt: timestamp('published_at'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
    deletedAt: timestamp('deleted_at'),
  },
  (table) => ({
    slugIdx: index('idx_articles_slug').on(table.slug),
    statusIdx: index('idx_articles_status').on(table.status),
    publishedIdx: index('idx_articles_published_at').on(table.publishedAt),
    categoryIdIdx: index('idx_articles_category_id').on(table.categoryId),
  }),
);
