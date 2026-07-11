import { pgTable, uuid, varchar, timestamp, text, index } from 'drizzle-orm/pg-core';
import { type AssignmentStatus } from '@ahlipanggilan/types';
import { orders } from './orders.ts';
import { partnerProfiles } from './partner-profiles.ts';

export const assignments = pgTable(
  'assignments',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    orderId: uuid('order_id')
      .references(() => orders.id, { onDelete: 'cascade' })
      .notNull(),
    partnerId: uuid('partner_id')
      .references(() => partnerProfiles.id, { onDelete: 'restrict' })
      .notNull(),
    status: varchar('status', { length: 30 }).notNull().$type<AssignmentStatus>(),
    assignedAt: timestamp('assigned_at').defaultNow().notNull(),
    acceptedAt: timestamp('accepted_at'),
    rejectedAt: timestamp('rejected_at'),
    startedAt: timestamp('started_at'),
    completedAt: timestamp('completed_at'),
    rejectionReason: text('rejection_reason'),
    notes: text('notes'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
  },
  (table) => ({
    orderIdIdx: index('idx_assignments_order_id').on(table.orderId),
    partnerIdIdx: index('idx_assignments_partner_id').on(table.partnerId),
  }),
);
