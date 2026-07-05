import { pgTable, uuid, timestamp, index } from 'drizzle-orm/pg-core';
import { orders } from './orders.ts';
import { media } from './media.ts';

export const orderMedia = pgTable(
  'order_media',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    orderId: uuid('order_id')
      .references(() => orders.id)
      .notNull(),
    mediaId: uuid('media_id')
      .references(() => media.id)
      .notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
  },
  (table) => ({
    orderIdIdx: index('idx_order_media_order_id').on(table.orderId),
    mediaIdIdx: index('idx_order_media_media_id').on(table.mediaId),
  }),
);
