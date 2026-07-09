import { pgTable, uuid, varchar, index } from 'drizzle-orm/pg-core';
import { companies } from './companies.ts';
import { users } from './users.ts';

export const companyUsers = pgTable(
  'company_users',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    companyId: uuid('company_id')
      .references(() => companies.id, { onDelete: 'cascade' })
      .notNull(),
    userId: uuid('user_id')
      .references(() => users.id, { onDelete: 'cascade' })
      .notNull(),
    role: varchar('role', { length: 50 }).notNull(),
  },
  (table) => ({
    companyIdIdx: index('idx_company_users_company_id').on(table.companyId),
    userIdIdx: index('idx_company_users_user_id').on(table.userId),
  }),
);
