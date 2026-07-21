import { pgTable, uuid, varchar, timestamp, index, unique } from 'drizzle-orm/pg-core';
import { articles } from './articles.ts';

export const articleLinks = pgTable(
  'article_links',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    sourceArticleId: uuid('source_article_id')
      .notNull()
      .references(() => articles.id, { onDelete: 'cascade' }),
    targetArticleId: uuid('target_article_id')
      .notNull()
      .references(() => articles.id, { onDelete: 'cascade' }),
    linkType: varchar('link_type', { length: 20 }).notNull().default('internal'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
  },
  (table) => ({
    sourceIdx: index('idx_article_links_source').on(table.sourceArticleId),
    targetIdx: index('idx_article_links_target').on(table.targetArticleId),
    sourceTargetUnique: unique('uq_article_links_source_target').on(
      table.sourceArticleId,
      table.targetArticleId,
    ),
  }),
);
