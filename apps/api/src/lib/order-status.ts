import type { OrderStatus } from '@specialist/types';
import { db, orderStatusHistory } from './db.ts';

/**
 * Record a status transition in order_status_history.
 *
 * Replaces duplicated implementations in bookings.ts and payments.ts.
 *
 * @param orderId - The order UUID
 * @param from - Previous status (null for initial creation)
 * @param to - New status
 * @param changedBy - User UUID who performed the change (null for guest bookings)
 * @param note - Optional note describing the reason for the transition
 */
export async function recordStatusHistory(
  orderId: string,
  from: OrderStatus | null,
  to: OrderStatus,
  changedBy: string | null,
  note?: string,
) {
  await db.insert(orderStatusHistory).values({
    orderId,
    fromStatus: from,
    toStatus: to,
    changedBy,
    note: note ?? null,
  });
}
