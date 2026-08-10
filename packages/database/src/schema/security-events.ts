import {
  pgTable,
  uuid,
  varchar,
  timestamp,
  text,
  jsonb,
  inet,
  smallint,
  index,
} from 'drizzle-orm/pg-core';
import { users } from './users.ts';

export const securityEvents = pgTable(
  'security_events',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    eventType: varchar('event_type', { length: 100 }).notNull(),
    userId: uuid('user_id').references(() => users.id),
    ipAddress: inet('ip_address'),
    userAgent: text('user_agent'),
    path: text('path'),
    severity: smallint('severity').notNull(),
    metadata: jsonb('metadata').$type<Record<string, unknown>>(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
  },
  (table) => ({
    ipCreatedIdx: index('idx_security_events_ip_created').on(table.ipAddress, table.createdAt),
    typeCreatedIdx: index('idx_security_events_type_created').on(table.eventType, table.createdAt),
  }),
);
