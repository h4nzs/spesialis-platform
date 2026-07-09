import { pgTable, uuid, varchar, timestamp, index } from 'drizzle-orm/pg-core';
import { partnerProfiles } from './partner-profiles.ts';

export const partnerDocuments = pgTable(
  'partner_documents',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    partnerId: uuid('partner_id')
      .references(() => partnerProfiles.id, { onDelete: 'cascade' })
      .notNull(),
    type: varchar('type', { length: 50 }).notNull(),
    mediaId: uuid('media_id'),
    fileName: varchar('file_name', { length: 255 }).notNull(),
    status: varchar('status', { length: 30 }).notNull().default('Pending'),
    verifiedAt: timestamp('verified_at'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
  },
  (table) => ({
    partnerIdIdx: index('idx_partner_documents_partner_id').on(table.partnerId),
  }),
);
