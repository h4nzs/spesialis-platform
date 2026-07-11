import { pgTable, uuid, varchar, timestamp, text, numeric, index } from 'drizzle-orm/pg-core';
import { type PenaltyType, type PenaltyStatus } from '@ahlipanggilan/types';
import { partnerProfiles } from './partner-profiles.ts';
import { orders } from './orders.ts';
import { users } from './users.ts';

export const partnerPenalties = pgTable(
  'partner_penalties',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    partnerId: uuid('partner_id')
      .references(() => partnerProfiles.id)
      .notNull(),
    orderId: uuid('order_id').references(() => orders.id),
    type: varchar('type', { length: 30 }).notNull().$type<PenaltyType>(),
    amount: numeric('amount', { precision: 12, scale: 2 }).notNull(),
    reason: text('reason').notNull(),
    status: varchar('status', { length: 30 }).notNull().$type<PenaltyStatus>().default('Pending'),
    imposedBy: uuid('imposed_by')
      .references(() => users.id)
      .notNull(),
    imposedAt: timestamp('imposed_at').defaultNow().notNull(),
    paidAt: timestamp('paid_at'),
    resolvedAt: timestamp('resolved_at'),
    notes: text('notes'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
    deletedAt: timestamp('deleted_at'),
  },
  (table) => ({
    partnerIdIdx: index('idx_partner_penalties_partner_id').on(table.partnerId),
    orderIdIdx: index('idx_partner_penalties_order_id').on(table.orderId),
    statusIdx: index('idx_partner_penalties_status').on(table.status),
  }),
);
