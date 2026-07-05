import {
  pgTable,
  uuid,
  varchar,
  timestamp,
  text,
  boolean,
  numeric,
  index,
} from 'drizzle-orm/pg-core';
import { customerProfiles } from './customer-profiles.ts';

export const addresses = pgTable(
  'addresses',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    customerId: uuid('customer_id')
      .references(() => customerProfiles.id)
      .notNull(),
    label: varchar('label', { length: 100 }),
    receiverName: varchar('receiver_name', { length: 255 }).notNull(),
    receiverPhone: varchar('receiver_phone', { length: 30 }).notNull(),
    province: varchar('province', { length: 255 }).notNull(),
    city: varchar('city', { length: 255 }).notNull(),
    district: varchar('district', { length: 255 }).notNull(),
    postalCode: varchar('postal_code', { length: 10 }).notNull(),
    address: text('address').notNull(),
    latitude: numeric('latitude', { precision: 10, scale: 7 }),
    longitude: numeric('longitude', { precision: 10, scale: 7 }),
    isDefault: boolean('is_default').notNull().default(false),
    notes: text('notes'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
    deletedAt: timestamp('deleted_at'),
  },
  (table) => ({
    customerIdIdx: index('idx_addresses_customer_id').on(table.customerId),
  }),
);
