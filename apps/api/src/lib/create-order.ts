import { eq, and, inArray } from 'drizzle-orm';
import { db, orders, orderItems, services, media, orderMedia } from './db.ts';
import { recordStatusHistory } from './order-status.ts';

/**
 * Type that accepts both the main `db` client and a transaction handle.
 * Extracted from the `db.transaction()` callback parameter so it stays in sync
 * with whatever Drizzle driver is used.
 */
type TransactionLike = Parameters<Parameters<typeof db.transaction>[0]>[0];

/**
 * Input data for the shared order creation transaction.
 */
export interface CreateOrderTransactionParams {
  /** Pre-generated unique booking number */
  bookingNumber: string;
  /** Customer profile ID (from customer_profiles) */
  customerId: string;
  /** Address ID (freshly created or existing) */
  addressId: string;
  /** Requested booking date (YYYY-MM-DD) */
  bookingDate: string;
  /** Requested booking time (HH:mm) */
  bookingTime: string;
  /** Order items (service + quantity) */
  items: Array<{ serviceId: string; quantity: number }>;
  /** Optional media UUIDs to attach */
  mediaIds?: string[];
  /**
   * If set, media ownership is validated against this user ID
   * (used by authenticated customers; guest bookings pass `null`).
   */
  mediaOwnershipUserId?: string | null;
  /** Optional notes from customer */
  notes?: string | null;
  /** User who performed this action (null for guest bookings) */
  changedBy: string | null;
  /**
   * Optional existing transaction to reuse.
   * When provided, the order creation runs inside the caller's transaction
   * instead of creating its own. This is needed by `createGuestBooking`
   * which creates the customer profile + address in the same transaction.
   */
  tx?: TransactionLike;
}

/**
 * Result returned by the shared order creation transaction.
 */
export interface CreateOrderTransactionResult {
  /** The created order's UUID */
  orderId: string;
  /** The booking number (passed through) */
  bookingNumber: string;
  /** Item summaries for notification messages */
  items: Array<{ name: string; qty: number }>;
}

/**
 * Execute the core order-creation database transaction.
 *
 * Handles:
 * - Price lookup from services table
 * - Base price calculation
 * - Order & order-items insertion
 * - Media attachment (with existence validation)
 * - Status history recording
 *
 * Both `createGuestBooking` and `createCustomerBooking` call this
 * instead of duplicating the logic.
 *
 * @throws `Error` with message 'Media tidak ditemukan: ...' if any
 *   media IDs are invalid. The caller should catch this and return
 *   a 422 response.
 */
export async function createOrderTransaction(
  params: CreateOrderTransactionParams,
): Promise<CreateOrderTransactionResult> {
  const {
    bookingNumber,
    customerId,
    addressId,
    bookingDate,
    bookingTime,
    items,
    mediaIds,
    notes,
    changedBy,
    mediaOwnershipUserId,
    tx: outerTx,
  } = params;

  const run = async (tx: TransactionLike) => {
    // ── 1. Look up service prices ─────────────────────────────
    const serviceIds = items.map((i) => i.serviceId);
    const prices = serviceIds.length
      ? await tx
          .select({ id: services.id, name: services.name, price: services.basePrice })
          .from(services)
          .where(inArray(services.id, serviceIds))
      : [];
    const priceLookup = new Map(
      prices.map((s) => [
        s.id,
        {
          name: s.name,
          // Hapus karakter non-digit (Rp, ., spasi, dll) lalu konversi ke number
          // Contoh: "Rp 150.000" → "150000" → 150000
          price: Number(String(s.price ?? '').replace(/\D/g, '')) || 0,
        },
      ]),
    );
    const basePrice = items.reduce(
      (sum, item) => sum + (priceLookup.get(item.serviceId)?.price ?? 0) * item.quantity,
      0,
    );

    // ── 2. Create order ───────────────────────────────────────
    const [order] = await tx
      .insert(orders)
      .values({
        bookingNumber,
        customerId,
        addressId,
        status: 'Pending Confirmation',
        bookingDate,
        bookingTime,
        basePrice: String(basePrice),
        discountAmount: '0',
        notes: notes ?? null,
      })
      .returning({ id: orders.id });

    if (!order) throw new Error('Gagal membuat booking');

    // ── 3. Create order items (with service name snapshot) ────
    for (const item of items) {
      const svc = priceLookup.get(item.serviceId);
      const snapName = svc?.name ?? '';
      const unitPrice = (svc?.price ?? 0) * item.quantity;

      await tx.insert(orderItems).values({
        orderId: order.id,
        serviceId: item.serviceId,
        serviceNameSnapshot: snapName,
        quantity: item.quantity,
        unitPrice: String(unitPrice),
        subtotal: String(unitPrice),
      });
    }

    // ── 4. Attach media (validate exist + ownership) ──────────
    if (mediaIds?.length) {
      const mediaCond = mediaOwnershipUserId
        ? and(inArray(media.id, mediaIds), eq(media.uploadedBy, mediaOwnershipUserId))
        : inArray(media.id, mediaIds);

      const existing = await tx.select({ id: media.id }).from(media).where(mediaCond);

      const found = new Set(existing.map((m) => m.id));
      const invalid = mediaIds.filter((id) => !found.has(id));
      if (invalid.length > 0) {
        throw new Error(`Media tidak ditemukan: ${invalid.join(', ')}`);
      }

      await tx
        .insert(orderMedia)
        .values(mediaIds.map((mediaId) => ({ orderId: order.id, mediaId })));
    }

    // ── 5. Record initial status history ──────────────────────
    await recordStatusHistory(order.id, null, 'Pending Confirmation', changedBy, undefined, tx);

    // ── 6. Build item summary for notifications ───────────────
    const itemSummaries = items.map((i) => ({
      name: priceLookup.get(i.serviceId)?.name ?? 'Layanan',
      qty: i.quantity,
    }));

    return {
      bookingNumber,
      orderId: order.id,
      items: itemSummaries,
    };
  };

  return outerTx ? run(outerTx) : db.transaction(run);
}
