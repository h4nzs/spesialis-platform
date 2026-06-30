import { pgTable, uuid, varchar, timestamp, text } from 'drizzle-orm/pg-core';
import { type ComplaintStatus } from '@specialist/types';
import { orders } from './orders.ts';
import { customerProfiles } from './customer-profiles.ts';
import { users } from './users.ts';

export const complaints = pgTable('complaints', {
  id: uuid('id').defaultRandom().primaryKey(),
  orderId: uuid('order_id')
    .references(() => orders.id)
    .notNull(),
  customerId: uuid('customer_id')
    .references(() => customerProfiles.id)
    .notNull(),
  status: varchar('status', { length: 30 }).notNull().$type<ComplaintStatus>().default('Open'),
  title: varchar('title', { length: 255 }).notNull(),
  description: text('description').notNull(),
  resolution: text('resolution'),
  resolvedBy: uuid('resolved_by').references(() => users.id),
  resolvedAt: timestamp('resolved_at'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});
