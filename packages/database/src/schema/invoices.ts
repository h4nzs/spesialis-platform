import { pgTable, uuid, varchar, timestamp, date, text, numeric, index } from 'drizzle-orm/pg-core';
import { companies } from './companies.ts';
import { orders } from './orders.ts';
import { users } from './users.ts';

export const invoices = pgTable(
  'invoices',
  {
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
    createdBy: uuid('created_by').references(() => users.id),
    updatedBy: uuid('updated_by').references(() => users.id),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
    deletedAt: timestamp('deleted_at'),
  },
  (table) => ({
    companyIdIdx: index('idx_invoices_company_id').on(table.companyId),
    orderIdIdx: index('idx_invoices_order_id').on(table.orderId),
  }),
);
