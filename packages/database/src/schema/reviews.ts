import { pgTable, uuid, timestamp, text, numeric } from 'drizzle-orm/pg-core';
import { orders } from './orders.ts';
import { customerProfiles } from './customer-profiles.ts';
import { partnerProfiles } from './partner-profiles.ts';

export const reviews = pgTable('reviews', {
  id: uuid('id').defaultRandom().primaryKey(),
  orderId: uuid('order_id')
    .references(() => orders.id)
    .notNull()
    .unique(),
  customerId: uuid('customer_id')
    .references(() => customerProfiles.id)
    .notNull(),
  partnerId: uuid('partner_id')
    .references(() => partnerProfiles.id)
    .notNull(),
  rating: numeric('rating', { precision: 2, scale: 1 }).notNull(),
  review: text('review'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});
