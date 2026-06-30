import { pgTable, uuid, varchar, timestamp, text, numeric } from 'drizzle-orm/pg-core';
import { type PaymentMethod, type PaymentStatus } from '@specialist/types';
import { orders } from './orders.ts';
import { users } from './users.ts';

export const payments = pgTable('payments', {
  id: uuid('id').defaultRandom().primaryKey(),
  orderId: uuid('order_id')
    .references(() => orders.id)
    .notNull(),
  method: varchar('method', { length: 30 }).notNull().$type<PaymentMethod>(),
  amount: numeric('amount', { precision: 12, scale: 2 }).notNull(),
  status: varchar('status', { length: 30 }).notNull().$type<PaymentStatus>().default('Waiting'),
  paymentDate: timestamp('payment_date'),
  proofMediaId: uuid('proof_media_id'),
  verifiedBy: uuid('verified_by').references(() => users.id),
  verifiedAt: timestamp('verified_at'),
  notes: text('notes'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});
