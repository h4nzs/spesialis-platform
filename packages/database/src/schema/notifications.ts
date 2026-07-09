import { pgTable, uuid, varchar, timestamp, text, boolean, index } from 'drizzle-orm/pg-core';
import { type NotificationChannel } from '@specialist/types';
import { users } from './users.ts';

export const notifications = pgTable(
  'notifications',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    userId: uuid('user_id')
      .references(() => users.id, { onDelete: 'cascade' })
      .notNull(),
    type: varchar('type', { length: 100 }).notNull(),
    channel: varchar('channel', { length: 30 }).notNull().$type<NotificationChannel>(),
    title: varchar('title', { length: 255 }).notNull(),
    message: text('message').notNull(),
    isRead: boolean('is_read').notNull().default(false),
    sentAt: timestamp('sent_at'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
  },
  (table) => ({
    userIdIdx: index('idx_notifications_user_id').on(table.userId),
  }),
);
