import { pgTable, uuid, varchar, timestamp, text, date, index } from 'drizzle-orm/pg-core';
import { users } from './users.ts';

export const customerProfiles = pgTable(
  'customer_profiles',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    userId: uuid('user_id').references(() => users.id),
    fullName: varchar('full_name', { length: 255 }).notNull(),
    avatar: text('avatar'),
    birthDate: date('birth_date'),
    gender: varchar('gender', { length: 20 }),
    defaultAddressId: uuid('default_address_id'),
    guestPhone: varchar('guest_phone', { length: 30 }),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
    deletedAt: timestamp('deleted_at'),
  },
  (table) => ({
    userIdIdx: index('idx_customer_profiles_user_id').on(table.userId),
  }),
);
