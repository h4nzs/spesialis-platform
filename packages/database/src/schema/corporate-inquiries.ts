import { pgTable, uuid, varchar, timestamp, text, integer, index } from 'drizzle-orm/pg-core';

export const corporateInquiries = pgTable(
  'corporate_inquiries',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    companyName: varchar('company_name', { length: 255 }).notNull(),
    legalName: varchar('legal_name', { length: 255 }),
    email: varchar('email', { length: 255 }).notNull(),
    phone: varchar('phone', { length: 50 }).notNull(),
    industry: varchar('industry', { length: 255 }),
    employeeCount: integer('employee_count'),
    notes: text('notes'),
    status: varchar('status', { length: 30 }).notNull().default('Pending'),
    handledBy: uuid('handled_by'),
    handledAt: timestamp('handled_at'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
    deletedAt: timestamp('deleted_at'),
  },
  (table) => ({
    statusIdx: index('idx_corporate_inquiries_status').on(table.status),
    emailIdx: index('idx_corporate_inquiries_email').on(table.email),
  }),
);
