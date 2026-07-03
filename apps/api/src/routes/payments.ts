import { Hono } from 'hono';
import { eq } from 'drizzle-orm';
import { db, orders, payments, orderStatusHistory, customerProfiles, users } from '../lib/db.ts';
import { authMiddleware, requireRole } from '../middleware/auth.ts';
import { createPaymentSchema, verifyPaymentSchema } from '@specialist/validation';
import { success, created, error, notFound, forbidden, conflict } from '../lib/response.ts';
import type { OrderStatus } from '@specialist/types';
import { createAuditLog } from '../lib/audit.ts';
import { createNotification } from '../lib/notification.ts';
import { sendPaymentVerifiedEmail } from '../lib/email.ts';

async function recordStatusHistory(
  orderId: string,
  from: OrderStatus | null,
  to: OrderStatus,
  changedBy: string,
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

const router = new Hono();

router.post('/', authMiddleware, async (c) => {
  const userId = c.get('userId');
  const userRole = c.get('userRole');
  const body = await c.req.json();
  const parsed = createPaymentSchema.safeParse(body);
  if (!parsed.success) {
    return error(
      c,
      'VALIDATION_ERROR',
      'Validation failed',
      422,
      parsed.error.issues.map((i) => ({ field: i.path.join('.'), message: i.message })),
    );
  }

  const [order] = await db
    .select({
      id: orders.id,
      status: orders.status,
      customerId: orders.customerId,
    })
    .from(orders)
    .where(eq(orders.id, parsed.data.orderId))
    .limit(1);

  if (!order) return notFound(c, 'Order tidak ditemukan');

  if (userRole === 'customer') {
    const [profile] = await db
      .select({ id: customerProfiles.id })
      .from(customerProfiles)
      .where(eq(customerProfiles.userId, userId))
      .limit(1);
    if (!profile || order.customerId !== profile.id) return forbidden(c);
  }

  const existingPayment = await db
    .select({ id: payments.id })
    .from(payments)
    .where(eq(payments.orderId, order.id))
    .limit(1);
  if (existingPayment[0]) return conflict(c, 'Pembayaran sudah ada untuk order ini');

  const [payment] = await db
    .insert(payments)
    .values({
      orderId: order.id,
      method: parsed.data.method,
      amount: String(parsed.data.amount),
      proofMediaId: parsed.data.proofMediaId ?? null,
      notes: parsed.data.notes ?? null,
      status: 'Waiting',
    })
    .returning();

  if (order.status === 'Completed' || order.status === 'Waiting Payment') {
    await db.update(orders).set({ status: 'Waiting Payment' }).where(eq(orders.id, order.id));
    await recordStatusHistory(
      order.id,
      order.status as OrderStatus,
      'Waiting Payment',
      userId,
      'Pembayaran diajukan',
    );
  }

  return created(c, payment, 'Pembayaran berhasil diajukan');
});

router.get('/:id', authMiddleware, async (c) => {
  const paymentId = c.req.param('id')!;
  const userId = c.get('userId');
  const userRole = c.get('userRole');

  const [payment] = await db
    .select({
      id: payments.id,
      orderId: payments.orderId,
      method: payments.method,
      amount: payments.amount,
      status: payments.status,
      proofMediaId: payments.proofMediaId,
      verifiedBy: payments.verifiedBy,
      verifiedAt: payments.verifiedAt,
      notes: payments.notes,
      createdAt: payments.createdAt,
    })
    .from(payments)
    .where(eq(payments.id, paymentId))
    .limit(1);

  if (!payment) return notFound(c, 'Pembayaran tidak ditemukan');

  if (userRole === 'customer') {
    const [order] = await db
      .select({ customerId: orders.customerId })
      .from(orders)
      .where(eq(orders.id, payment.orderId))
      .limit(1);
    if (!order) return notFound(c, 'Order tidak ditemukan');
    const [profile] = await db
      .select({ id: customerProfiles.id })
      .from(customerProfiles)
      .where(eq(customerProfiles.userId, userId))
      .limit(1);
    if (!profile || order.customerId !== profile.id) return forbidden(c);
  }

  return success(c, payment);
});

router.post(
  '/:id/verify',
  authMiddleware,
  requireRole('admin', 'super_admin', 'finance'),
  async (c) => {
    const paymentId = c.req.param('id')!;
    const userId = c.get('userId');
    const body = await c.req.json();
    const parsed = verifyPaymentSchema.safeParse(body);
    if (!parsed.success) {
      return error(
        c,
        'VALIDATION_ERROR',
        'Validation failed',
        422,
        parsed.error.issues.map((i) => ({ field: i.path.join('.'), message: i.message })),
      );
    }

    const [payment] = await db
      .select({
        id: payments.id,
        status: payments.status,
        orderId: payments.orderId,
        amount: payments.amount,
        method: payments.method,
      })
      .from(payments)
      .where(eq(payments.id, paymentId))
      .limit(1);

    if (!payment) return notFound(c, 'Pembayaran tidak ditemukan');
    if (payment.status !== 'Waiting' && payment.status !== 'Pending Verification') {
      return conflict(c, `Tidak bisa verifikasi dari status ${payment.status}`);
    }

    const [order] = await db
      .select({ id: orders.id, status: orders.status, customerId: orders.customerId })
      .from(orders)
      .where(eq(orders.id, payment.orderId))
      .limit(1);
    if (!order) return notFound(c, 'Order tidak ditemukan');

    await db.transaction(async (tx) => {
      if (parsed.data.status === 'Paid') {
        await tx
          .update(payments)
          .set({
            status: 'Paid',
            verifiedBy: userId,
            verifiedAt: new Date(),
            notes: parsed.data.notes ?? null,
          })
          .where(eq(payments.id, paymentId));

        await tx.update(orders).set({ status: 'Paid' }).where(eq(orders.id, order.id));
        await recordStatusHistory(
          order.id,
          order.status as OrderStatus,
          'Paid',
          userId,
          parsed.data.notes,
        );
      } else {
        await tx
          .update(payments)
          .set({
            status: 'Failed',
            verifiedBy: userId,
            verifiedAt: new Date(),
            notes: parsed.data.notes ?? null,
          })
          .where(eq(payments.id, paymentId));

        await recordStatusHistory(
          order.id,
          order.status as OrderStatus,
          'Completed',
          userId,
          `Pembayaran ditolak: ${parsed.data.notes ?? ''}`,
        );
      }
    });

    await createAuditLog(c, {
      userId,
      action: `payment.${parsed.data.status === 'Paid' ? 'verify' : 'reject'}`,
      entity: 'payment',
      entityId: paymentId,
      newValue: { status: parsed.data.status, verifiedBy: userId },
      oldValue: { status: payment.status },
    });

    const [cp] = await db
      .select({ userId: customerProfiles.userId, fullName: customerProfiles.fullName })
      .from(customerProfiles)
      .where(eq(customerProfiles.id, order.customerId))
      .limit(1);

    if (cp?.userId) {
      await createNotification({
        userId: cp.userId,
        type: 'payment.received',
        title: parsed.data.status === 'Paid' ? 'Pembayaran Diterima' : 'Pembayaran Ditolak',
        message:
          parsed.data.status === 'Paid'
            ? 'Pembayaran Anda telah dikonfirmasi. Terima kasih!'
            : `Pembayaran ditolak: ${parsed.data.notes ?? ''}`,
      });

      const [customerUser] = await db
        .select({ email: users.email })
        .from(users)
        .where(eq(users.id, cp.userId))
        .limit(1);

      if (customerUser?.email) {
        const [orderInfo] = await db
          .select({ bookingNumber: orders.bookingNumber })
          .from(orders)
          .where(eq(orders.id, payment.orderId))
          .limit(1);

        sendPaymentVerifiedEmail(
          customerUser.email,
          cp.fullName ?? 'Pelanggan',
          orderInfo?.bookingNumber ?? '',
          `Rp${Number(payment.amount).toLocaleString('id-ID')}`,
          payment.method,
          parsed.data.status as 'Paid' | 'Failed',
          parsed.data.notes ?? null,
        );
      }
    }

    return success(c, { id: paymentId, status: parsed.data.status }, 'Pembayaran diverifikasi');
  },
);

export { router as paymentsRouter };
