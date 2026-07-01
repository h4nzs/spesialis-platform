import { pgTable, uuid, varchar, jsonb } from 'drizzle-orm/pg-core';

export const seoMetadata = pgTable('seo_metadata', {
  id: uuid('id').defaultRandom().primaryKey(),
  entityType: varchar('entity_type', { length: 50 }).notNull(),
  entityId: uuid('entity_id').notNull(),
  metaTitle: varchar('meta_title', { length: 60 }),
  metaDescription: varchar('meta_description', { length: 160 }),
  canonicalUrl: varchar('canonical_url', { length: 255 }),
  robots: varchar('robots', { length: 100 }),
  ogTitle: varchar('og_title', { length: 100 }),
  ogDescription: varchar('og_description', { length: 300 }),
  ogImage: varchar('og_image', { length: 255 }),
  twitterTitle: varchar('twitter_title', { length: 100 }),
  twitterDescription: varchar('twitter_description', { length: 300 }),
  twitterImage: varchar('twitter_image', { length: 255 }),
  schemaJson: jsonb('schema_json'),
});
