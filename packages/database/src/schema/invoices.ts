import { pgTable, uuid, varchar, timestamp, date, text, numeric } from 'drizzle-orm/pg-core';
import { companies } from './companies.ts';
import { orders } from './orders.ts';

export const invoices = pgTable('invoices', {
  id: uuid('id').defaultRandom().primaryKey(),
  companyId: uuid('company_id')
    .references(() => companies.id)
    .notNull(),
  invoiceNumber: varchar('invoice_number', { length: 30 }).notNull().unique(),
  orderId: uuid('order_id').references(() => orders.id),
  amount: numeric('amount', { precision: 12, scale: 2 }).notNull(),
  status: varchar('status', { length: 30 }).notNull().default('Draft'),
  issuedAt: timestamp('issued_at'),
  paidAt: timestamp('paid_at'),
  dueDate: date('due_date').notNull(),
  notes: text('notes'),
  createdBy: uuid('created_by'),
  updatedBy: uuid('updated_by'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
  deletedAt: timestamp('deleted_at'),
});
