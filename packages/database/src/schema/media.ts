import { pgTable, uuid, varchar, timestamp, text, integer, index } from 'drizzle-orm/pg-core';
import { type MediaDisk } from '@ahlipanggilan/types';
import { users } from './users.ts';

export const media = pgTable(
  'media',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    disk: varchar('disk', { length: 30 }).notNull().$type<MediaDisk>(),
    path: text('path').notNull(),
    filename: varchar('filename', { length: 255 }).notNull(),
    mimeType: varchar('mime_type', { length: 100 }).notNull(),
    extension: varchar('extension', { length: 10 }).notNull(),
    size: integer('size').notNull(),
    width: integer('width'),
    height: integer('height'),
    uploadedBy: uuid('uploaded_by')
      .references(() => users.id)
      .notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
  },
  (table) => ({
    uploadedByIdx: index('idx_media_uploaded_by').on(table.uploadedBy),
  }),
);
