import {
  pgTable,
  uuid,
  varchar,
  timestamp,
  text,
  boolean,
  jsonb,
  index,
} from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';
import { articleCategories } from './article-categories.ts';
import { users } from './users.ts';

export const articles = pgTable(
  'articles',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    categoryId: uuid('category_id').references(() => articleCategories.id, {
      onDelete: 'set null',
    }),
    authorId: uuid('author_id').references(() => users.id, {
      onDelete: 'set null',
    }),
    title: varchar('title', { length: 255 }).notNull(),
    slug: varchar('slug', { length: 255 }).notNull().unique(),
    summary: varchar('summary', { length: 500 }),
    content: text('content'),
    coverImage: varchar('cover_image', { length: 255 }),
    authorName: varchar('author_name', { length: 255 }),
    status: varchar('status', { length: 50 }).notNull().default('Draft'),
    isFeatured: boolean('is_featured').notNull().default(false),
    isPillarContent: boolean('is_pillar_content').notNull().default(false),
    tags: text('tags')
      .array()
      .notNull()
      .default(sql`'{}'::text[]`),
    metaTitle: varchar('meta_title', { length: 255 }),
    metaDescription: varchar('meta_description', { length: 320 }),
    ogTitle: varchar('og_title', { length: 255 }),
    ogDescription: varchar('og_description', { length: 500 }),
    ogImage: varchar('og_image', { length: 500 }),
    canonicalUrl: varchar('canonical_url', { length: 500 }),
    robots: varchar('robots', { length: 100 }).notNull().default('index, follow'),
    schemaJson: jsonb('schema_json'),
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
    authorIdIdx: index('idx_articles_author_id').on(table.authorId),
    isPillarContentIdx: index('idx_articles_is_pillar_content').on(table.isPillarContent),
  }),
);
