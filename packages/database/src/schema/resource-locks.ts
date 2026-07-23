import { pgTable, uuid, varchar, timestamp, uniqueIndex } from 'drizzle-orm/pg-core';
import { users } from './users.ts';

/**
 * Tracks active editing locks on resources (articles, CMS pages, FAQ, etc.).
 *
 * When a user opens an editor, a lock is acquired. While editing, the
 * frontend sends heartbeats every 30s to keep the lock alive. If the
 * user navigates away, the lock is released. If the browser closes
 * unexpectedly, the lock expires automatically after 60 seconds
 * (checked before any lock operation).
 */
export const resourceLocks = pgTable(
  'resource_locks',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    /** The type of resource being locked — 'article' | 'cms_page' | 'faq' */
    resourceType: varchar('resource_type', { length: 50 }).notNull(),
    /** The UUID of the resource being edited */
    resourceId: uuid('resource_id').notNull(),
    /** The user who holds the lock */
    lockedBy: uuid('locked_by')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    /** When the lock was first acquired */
    lockedAt: timestamp('locked_at').defaultNow().notNull(),
    /** Last heartbeat — updated every 30s while editing */
    heartbeatAt: timestamp('heartbeat_at').defaultNow().notNull(),
  },
  (table) => ({
    /** Only one lock per resource at a time */
    uniqueResourceIdx: uniqueIndex('idx_resource_locks_resource').on(
      table.resourceType,
      table.resourceId,
    ),
  }),
);
