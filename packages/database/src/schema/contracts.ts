import {
  pgTable,
  uuid,
  varchar,
  timestamp,
  date,
  text,
  integer,
  numeric,
} from 'drizzle-orm/pg-core';
import { companies } from './companies.ts';

export const contracts = pgTable('contracts', {
  id: uuid('id').defaultRandom().primaryKey(),
  companyId: uuid('company_id')
    .references(() => companies.id)
    .notNull(),
  contractNumber: varchar('contract_number', { length: 30 }).notNull().unique(),
  startDate: date('start_date').notNull(),
  endDate: date('end_date').notNull(),
  slaResponseHours: integer('sla_response_hours'),
  slaResolutionHours: integer('sla_resolution_hours'),
  discountPercent: numeric('discount_percent', { precision: 5, scale: 2 }),
  discountAmount: numeric('discount_amount', { precision: 12, scale: 2 }),
  status: varchar('status', { length: 30 }).notNull().default('Draft'),
  notes: text('notes'),
  createdBy: uuid('created_by'),
  updatedBy: uuid('updated_by'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
  deletedAt: timestamp('deleted_at'),
});
