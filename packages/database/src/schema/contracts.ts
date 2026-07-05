import {
  pgTable,
  uuid,
  varchar,
  timestamp,
  date,
  text,
  integer,
  numeric,
  index,
} from 'drizzle-orm/pg-core';
import { companies } from './companies.ts';
import { users } from './users.ts';

export const contracts = pgTable(
  'contracts',
  {
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
    createdBy: uuid('created_by').references(() => users.id),
    updatedBy: uuid('updated_by').references(() => users.id),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
    deletedAt: timestamp('deleted_at'),
  },
  (table) => ({
    companyIdIdx: index('idx_contracts_company_id').on(table.companyId),
  }),
);
