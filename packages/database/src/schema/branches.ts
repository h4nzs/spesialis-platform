import { pgTable, uuid, varchar, index } from 'drizzle-orm/pg-core';
import { companies } from './companies.ts';

export const branches = pgTable(
  'branches',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    companyId: uuid('company_id')
      .references(() => companies.id, { onDelete: 'cascade' })
      .notNull(),
    name: varchar('name', { length: 255 }).notNull(),
    address: varchar('address', { length: 500 }).notNull(),
    city: varchar('city', { length: 255 }).notNull(),
    phone: varchar('phone', { length: 30 }),
  },
  (table) => ({
    companyIdIdx: index('idx_branches_company_id').on(table.companyId),
  }),
);
