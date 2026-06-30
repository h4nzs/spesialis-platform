import { pgTable, uuid, varchar, timestamp, text } from 'drizzle-orm/pg-core';
import { type OrderStatus } from '@specialist/types';
import { orders } from './orders.ts';
import { users } from './users.ts';

export const orderStatusHistory = pgTable('order_status_history', {
  id: uuid('id').defaultRandom().primaryKey(),
  orderId: uuid('order_id')
    .references(() => orders.id)
    .notNull(),
  fromStatus: varchar('from_status', { length: 40 }).$type<OrderStatus>(),
  toStatus: varchar('to_status', { length: 40 }).notNull().$type<OrderStatus>(),
  changedBy: uuid('changed_by')
    .references(() => users.id)
    .notNull(),
  note: text('note'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});
