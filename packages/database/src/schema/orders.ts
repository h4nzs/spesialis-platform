import { pgTable, uuid, varchar, timestamp, text, date, numeric } from 'drizzle-orm/pg-core';
import { type OrderStatus } from '@specialist/types';
import { customerProfiles } from './customer-profiles.ts';
import { partnerProfiles } from './partner-profiles.ts';
import { companies } from './companies.ts';
import { addresses } from './addresses.ts';

export const orders = pgTable('orders', {
  id: uuid('id').defaultRandom().primaryKey(),
  bookingNumber: varchar('booking_number', { length: 30 }).notNull().unique(),
  customerId: uuid('customer_id')
    .references(() => customerProfiles.id)
    .notNull(),
  companyId: uuid('company_id').references(() => companies.id),
  addressId: uuid('address_id')
    .references(() => addresses.id)
    .notNull(),
  partnerId: uuid('partner_id').references(() => partnerProfiles.id),
  status: varchar('status', { length: 40 }).notNull().$type<OrderStatus>(),
  bookingDate: date('booking_date').notNull(),
  bookingTime: varchar('booking_time', { length: 20 }).notNull(),
  basePrice: numeric('base_price', { precision: 12, scale: 2 }).notNull(),
  finalPrice: numeric('final_price', { precision: 12, scale: 2 }),
  discountAmount: numeric('discount_amount', { precision: 12, scale: 2 }).notNull().default('0'),
  notes: text('notes'),
  internalNotes: text('internal_notes'),
  completedAt: timestamp('completed_at'),
  closedAt: timestamp('closed_at'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
  deletedAt: timestamp('deleted_at'),
});
