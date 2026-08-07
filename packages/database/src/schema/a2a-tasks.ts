import { jsonb, pgTable, text, timestamp, uuid, varchar } from 'drizzle-orm/pg-core';

/**
 * A2A protocol tasks (Agent-to-Agent, v1.0).
 * Persists task state + full message history as JSONB so the SDK's
 * TaskStore contract is satisfied and tasks survive restarts.
 */
export const a2aTasks = pgTable('a2a_tasks', {
  id: uuid('id').defaultRandom().primaryKey(),
  taskId: varchar('task_id', { length: 64 }).notNull().unique(),
  contextId: varchar('context_id', { length: 64 }).notNull(),
  status: varchar('status', { length: 32 }).notNull(),
  task: jsonb('task').notNull(),
  userId: uuid('user_id'),
  tenant: varchar('tenant', { length: 64 }),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true })
    .defaultNow()
    .notNull()
    .$onUpdate(() => new Date()),
});

/**
 * A2A push notification configuration per task (webhook endpoint where
 * the agent posts TaskStatusUpdateEvent / TaskArtifactUpdateEvent).
 */
export const a2aPushConfigs = pgTable('a2a_push_configs', {
  id: uuid('id').defaultRandom().primaryKey(),
  configId: varchar('config_id', { length: 64 }).notNull().unique(),
  taskId: varchar('task_id', { length: 64 }).notNull().unique(),
  url: text('url').notNull(),
  token: text('token'),
  authentication: jsonb('authentication'),
  tenant: varchar('tenant', { length: 64 }),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});
