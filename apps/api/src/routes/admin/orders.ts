import { Hono } from 'hono';
import { eq, and as drizzleAnd, asc } from 'drizzle-orm';
import { db, orders, customerProfiles, users } from '../../lib/db.ts';
import { authMiddleware, requireRole } from '../../middleware/auth.ts';
import { validateBody } from '../../middleware/validation.ts';
import {
  discountOrderSchema,
  updateInternalNotesSchema,
  updateOrderTagsSchema,
} from '@ahlipanggilan/validation';
import type { UpdateOrderTagsInput } from '@ahlipanggilan/validation';
import { success, notFound } from '../../lib/response.ts';
import { omitUndefined } from '../../lib/update.ts';
import { createAuditLog } from '../../lib/audit.ts';

const router = new Hono();

router.get('/export', authMiddleware, requireRole('admin', 'super_admin'), async (c) => {
  const statusFilter = c.req.query('status');

  const conditions: ReturnType<typeof eq>[] = [];
  if (statusFilter) conditions.push(eq(orders.status, statusFilter as never));

  const items = await db
    .select({
      bookingNumber: orders.bookingNumber,
      status: orders.status,
      basePrice: orders.basePrice,
      finalPrice: orders.finalPrice,
      discountAmount: orders.discountAmount,
      bookingDate: orders.bookingDate,
      bookingTime: orders.bookingTime,
      createdAt: orders.createdAt,
      completedAt: orders.completedAt,
      customerName: customerProfiles.fullName,
      customerEmail: users.email,
    })
    .from(orders)
    .leftJoin(customerProfiles, eq(customerProfiles.id, orders.customerId))
    .leftJoin(users, eq(users.id, customerProfiles.userId))
    .where(conditions.length > 0 ? drizzleAnd(...conditions) : undefined)
    .orderBy(asc(orders.createdAt));

  const header =
    'No.Booking,Status,Harga Dasar,Total,Disc,Tgl Booking,Jam,Dirilis,Selesai,Pelanggan,Email';
  const rows = items.map(
    (o) =>
      `"${o.bookingNumber}","${o.status}",${o.basePrice},${o.finalPrice ?? ''},${o.discountAmount},"${o.bookingDate}","${o.bookingTime}","${o.createdAt?.toISOString() ?? ''}","${o.completedAt?.toISOString() ?? ''}","${o.customerName ?? ''}","${o.customerEmail ?? ''}"`,
  );

  const csv = `\uFEFF${header}\n${rows.join('\n')}`;

  return new Response(csv, {
    status: 200,
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': 'attachment; filename="orders-export.csv"',
    },
  });
});

router.patch(
  '/:id/discount',
  authMiddleware,
  requireRole('admin', 'super_admin'),
  validateBody(discountOrderSchema),
  async (c) => {
    const orderId = c.req.param('id')!;
    const userId = c.get('userId');
    const data = c.get('validated') as {
      discountPercent?: number;
      discountAmount?: number;
      note?: string;
    };

    const [order] = await db
      .select({
        id: orders.id,
        discountPercent: orders.discountPercent,
        discountAmount: orders.discountAmount,
      })
      .from(orders)
      .where(eq(orders.id, orderId))
      .limit(1);
    if (!order) return notFound(c, 'Order tidak ditemukan');

    const oldPercent = order.discountPercent;
    const oldAmount = order.discountAmount;

    const updateData = omitUndefined({
      discountPercent:
        data.discountPercent !== undefined ? String(data.discountPercent) : undefined,
      discountAmount: data.discountAmount !== undefined ? String(data.discountAmount) : undefined,
    });

    await db.update(orders).set(updateData).where(eq(orders.id, orderId));

    await createAuditLog(c, {
      userId,
      action: 'order.discount',
      entity: 'order',
      entityId: orderId,
      newValue: { ...updateData, ...(data.note !== undefined ? { note: data.note } : {}) },
      oldValue: { discountPercent: oldPercent, discountAmount: oldAmount },
    });

    return success(c, { id: orderId, ...updateData }, 'Diskon berhasil diperbarui');
  },
);

router.patch(
  '/:id/tags',
  authMiddleware,
  requireRole('admin', 'super_admin'),
  validateBody(updateOrderTagsSchema),
  async (c) => {
    const orderId = c.req.param('id')!;
    const userId = c.get('userId');
    const data = c.get('validated') as UpdateOrderTagsInput;

    const [order] = await db
      .select({ id: orders.id })
      .from(orders)
      .where(eq(orders.id, orderId))
      .limit(1);
    if (!order) return notFound(c, 'Order tidak ditemukan');

    await db.update(orders).set({ tags: data.tags }).where(eq(orders.id, orderId));

    await createAuditLog(c, {
      userId,
      action: 'order.tags',
      entity: 'order',
      entityId: orderId,
      newValue: { tags: data.tags },
    });

    return success(c, { id: orderId, tags: data.tags }, 'Tags berhasil diperbarui');
  },
);

router.patch(
  '/:id/internal-notes',
  authMiddleware,
  requireRole('admin', 'super_admin'),
  validateBody(updateInternalNotesSchema),
  async (c) => {
    const orderId = c.req.param('id')!;
    const userId = c.get('userId');
    const data = c.get('validated') as { internalNotes: string };

    const [order] = await db
      .select({ id: orders.id })
      .from(orders)
      .where(eq(orders.id, orderId))
      .limit(1);
    if (!order) return notFound(c, 'Order tidak ditemukan');

    await db
      .update(orders)
      .set({ internalNotes: data.internalNotes })
      .where(eq(orders.id, orderId));

    await createAuditLog(c, {
      userId,
      action: 'order.internal-notes',
      entity: 'order',
      entityId: orderId,
      newValue: { internalNotes: data.internalNotes },
    });

    return success(c, { id: orderId }, 'Catatan internal berhasil diperbarui');
  },
);

export { router as adminOrdersRouter };
