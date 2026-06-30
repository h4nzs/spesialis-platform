import { pgTable, uuid, varchar, timestamp, text, integer, numeric } from 'drizzle-orm/pg-core';
import { orders } from './orders.ts';
import { services } from './services.ts';

export const orderItems = pgTable('order_items', {
  id: uuid('id').defaultRandom().primaryKey(),
  orderId: uuid('order_id')
    .references(() => orders.id)
    .notNull(),
  serviceId: uuid('service_id')
    .references(() => services.id)
    .notNull(),
  serviceNameSnapshot: varchar('service_name_snapshot', { length: 255 }).notNull(),
  quantity: integer('quantity').notNull(),
  unitPrice: numeric('unit_price', { precision: 12, scale: 2 }).notNull(),
  subtotal: numeric('subtotal', { precision: 12, scale: 2 }).notNull(),
  notes: text('notes'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});
