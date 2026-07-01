import { pgTable, uuid, varchar, timestamp, integer } from 'drizzle-orm/pg-core';
import { type CompanyStatus } from '@specialist/types';

export const companies = pgTable('companies', {
  id: uuid('id').defaultRandom().primaryKey(),
  companyName: varchar('company_name', { length: 255 }).notNull(),
  legalName: varchar('legal_name', { length: 255 }).notNull(),
  taxNumber: varchar('tax_number', { length: 50 }),
  email: varchar('email', { length: 255 }).notNull(),
  phone: varchar('phone', { length: 30 }).notNull(),
  website: varchar('website', { length: 255 }),
  industry: varchar('industry', { length: 255 }),
  employeeCount: integer('employee_count'),
  logoMediaId: uuid('logo_media_id'),
  status: varchar('status', { length: 30 }).notNull().$type<CompanyStatus>().default('Pending'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
  deletedAt: timestamp('deleted_at'),
});
