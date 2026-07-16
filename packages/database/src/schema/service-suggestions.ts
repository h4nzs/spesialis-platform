import { pgTable, uuid, varchar, text, timestamp } from 'drizzle-orm/pg-core';

export const serviceSuggestions = pgTable('service_suggestions', {
  id: uuid('id').defaultRandom().primaryKey(),
  partnerName: varchar('partner_name', { length: 255 }).notNull(),
  partnerEmail: varchar('partner_email', { length: 255 }).notNull(),
  serviceName: varchar('service_name', { length: 255 }).notNull(),
  description: text('description'),
  status: varchar('status', { length: 20 }).notNull().default('pending'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});
