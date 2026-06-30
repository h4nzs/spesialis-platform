import { pgTable, uuid, varchar } from 'drizzle-orm/pg-core';
import { companies } from './companies.ts';
import { users } from './users.ts';

export const companyUsers = pgTable('company_users', {
  id: uuid('id').defaultRandom().primaryKey(),
  companyId: uuid('company_id')
    .references(() => companies.id)
    .notNull(),
  userId: uuid('user_id')
    .references(() => users.id)
    .notNull(),
  role: varchar('role', { length: 50 }).notNull(),
});
