import { Hono } from 'hono';
import { eq, and, desc, sql } from 'drizzle-orm';
import { alias } from 'drizzle-orm/pg-core';
import { db, orders, payments, customerProfiles, users } from '../lib/db.ts';

// Alias untuk self-join ke users (verifier)
const usersVerified = alias(users, 'verifier');
import { authMiddleware, requireRole } from '../middleware/auth.ts';
import { validateBody } from '../middleware/validation.ts';
import { createPaymentSchema, verifyPaymentSchema } from '@ahlipanggilan/validation';
import type { CreatePaymentInput, VerifyPaymentInput } from '@ahlipanggilan/validation';
import {
  success,
  successPaginated,
  created,
  notFound,
  forbidden,
  conflict,
} from '../lib/response.ts';
import { buildPaginationMeta } from '../lib/pagination.ts';
import type { OrderStatus } from '@ahlipanggilan/types';
import { canTransition } from '@ahlipanggilan/shared';
import { createAuditLog } from '../lib/audit.ts';
import { recordStatusHistory } from '../lib/order-status.ts';
import { createNotification, notifyAdmins } from '../lib/notification.ts';
import { sendPaymentVerifiedEmail } from '../lib/email.ts';

const router = new Hono();

router.get('/', authMiddleware, requireRole('admin', 'super_admin', 'finance'), async (c) => {
  const page = Math.max(Number(c.req.query('page')) || 1, 1);
  const limit = Math.min(Number(c.req.query('limit')) || 20, 100);
  const status = c.req.query('status');
  const method = c.req.query('method');

  const conditions: ReturnType<typeof eq>[] = [];
  if (status) conditions.push(eq(payments.status, status as never));
  if (method) conditions.push(eq(payments.method, method as never));

  const items = await db
    .select({
      id: payments.id,
      orderId: payments.orderId,
      method: payments.method,
      amount: payments.amount,
      status: payments.status,
      paymentDate: payments.paymentDate,
      verifiedBy: payments.verifiedBy,
      verifiedAt: payments.verifiedAt,
      notes: payments.notes,
      createdAt: payments.createdAt,
    })
    .from(payments)
    .where(conditions.length > 0 ? and(...conditions) : undefined)
    .orderBy(desc(payments.createdAt))
    .limit(limit)
    .offset((page - 1) * limit);

  const countResult = await db
    .select({ count: sql<number>`count(*)` })
    .from(payments)
    .where(conditions.length > 0 ? and(...conditions) : undefined);
  const total = Number(countResult[0]?.count ?? 0);
  const pagination = buildPaginationMeta(page, limit, total);

  return successPaginated(c, items, pagination);
});

router.get('/stats', authMiddleware, requireRole('admin', 'super_admin', 'finance'), async (c) => {
  const [paidResult] = await db
    .select({ total: sql<string>`COALESCE(SUM(CAST(amount AS DECIMAL)), 0)` })
    .from(payments)
    .where(eq(payments.status, 'Paid'));
  const [waitingResult] = await db
    .select({ count: sql<number>`count(*)` })
    .from(payments)
    .where(eq(payments.status, 'Waiting'));
  const [failedResult] = await db
    .select({ count: sql<number>`count(*)` })
    .from(payments)
    .where(eq(payments.status, 'Failed'));

  return success(c, {
    totalPaid: Number(paidResult?.total ?? 0),
    waitingVerification: Number(waitingResult?.count ?? 0),
    failedCount: Number(failedResult?.count ?? 0),
  });
});

router.patch('/:id/refund', authMiddleware, requireRole('admin', 'super_admin'), async (c) => {
  const paymentId = c.req.param('id')!;
  const userId = c.get('userId');

  const [payment] = await db
    .select({ id: payments.id, status: payments.status, orderId: payments.orderId })
    .from(payments)
    .where(eq(payments.id, paymentId))
    .limit(1);
  if (!payment) return notFound(c, 'Pembayaran tidak ditemukan');
  if (payment.status !== 'Paid') return conflict(c, 'Hanya pembayaran lunas yang bisa di-refund');

  await db.transaction(async (tx) => {
    await tx.update(payments).set({ status: 'Refunded' }).where(eq(payments.id, paymentId));
    await tx.update(orders).set({ status: 'Cancelled' }).where(eq(orders.id, payment.orderId));
    await recordStatusHistory(
      payment.orderId,
      'Paid' as OrderStatus,
      'Cancelled' as OrderStatus,
      userId,
      'Refund pembayaran',
      tx,
    );
  });

  await createAuditLog(c, {
    userId,
    action: 'payment.refund',
    entity: 'payment',
    entityId: paymentId,
    newValue: { status: 'Refunded' },
    oldValue: { status: payment.status },
  });

  return success(c, { id: paymentId, status: 'Refunded' }, 'Pembayaran berhasil di-refund');
});

router.post('/', authMiddleware, validateBody(createPaymentSchema), async (c) => {
  const userId = c.get('userId');
  const userRole = c.get('userRole');
  const data = c.get('validated') as CreatePaymentInput;

  const [order] = await db
    .select({
      id: orders.id,
      status: orders.status,
      customerId: orders.customerId,
    })
    .from(orders)
    .where(eq(orders.id, data.orderId))
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
      method: data.method,
      amount: String(data.amount),
      proofMediaId: data.proofMediaId ?? null,
      notes: data.notes ?? null,
      status: 'Waiting',
    })
    .returning();

  if (canTransition(order.status, 'Waiting Payment')) {
    await db.update(orders).set({ status: 'Waiting Payment' }).where(eq(orders.id, order.id));
    await recordStatusHistory(
      order.id,
      order.status as OrderStatus,
      'Waiting Payment',
      userId,
      'Pembayaran diajukan',
    );
  }

  notifyAdmins(
    'payment.submitted',
    'Pembayaran Baru',
    `Pembayaran baru untuk order #${order.id} — ${data.method} ${data.amount}`,
  );

  return created(c, payment, 'Pembayaran berhasil diajukan');
});

router.get('/:id', authMiddleware, async (c) => {
  const paymentId = c.req.param('id')!;
  const userId = c.get('userId');
  const userRole = c.get('userRole');

  const [rows] = await db
    .select({
      id: payments.id,
      orderId: payments.orderId,
      method: payments.method,
      amount: payments.amount,
      status: payments.status,
      paymentDate: payments.paymentDate,
      proofMediaId: payments.proofMediaId,
      verifiedBy: payments.verifiedBy,
      verifiedAt: payments.verifiedAt,
      notes: payments.notes,
      createdAt: payments.createdAt,
      // ── Join: Order info ──────────────────────────────
      bookingNumber: orders.bookingNumber,
      orderStatus: orders.status,
      orderBasePrice: orders.basePrice,
      orderFinalPrice: orders.finalPrice,
      orderCreatedAt: orders.createdAt,
      // ── Join: Customer info ───────────────────────────
      customerName: customerProfiles.fullName,
      customerEmail: users.email,
      customerPhone: users.phone,
      // ── Join: Verifier info ────────────────────────────
      verifierEmail: usersVerified.email,
    })
    .from(payments)
    .leftJoin(orders, eq(payments.orderId, orders.id))
    .leftJoin(customerProfiles, eq(orders.customerId, customerProfiles.id))
    .leftJoin(users, eq(customerProfiles.userId, users.id))
    .leftJoin(usersVerified, eq(payments.verifiedBy, usersVerified.id))
    .where(eq(payments.id, paymentId))
    .limit(1);

  if (!rows) return notFound(c, 'Pembayaran tidak ditemukan');

  // Customer authorization check
  if (userRole === 'customer') {
    if (!rows.orderId) return forbidden(c);
    const [order] = await db
      .select({ customerId: orders.customerId })
      .from(orders)
      .where(eq(orders.id, rows.orderId))
      .limit(1);
    if (!order) return notFound(c, 'Order tidak ditemukan');
    const [profile] = await db
      .select({ id: customerProfiles.id })
      .from(customerProfiles)
      .where(eq(customerProfiles.userId, userId))
      .limit(1);
    if (!profile || order.customerId !== profile.id) return forbidden(c);
  }

  // Structure the response
  return success(c, {
    payment: {
      id: rows.id,
      orderId: rows.orderId,
      method: rows.method,
      amount: rows.amount,
      status: rows.status,
      proofMediaId: rows.proofMediaId,
      verifiedBy: rows.verifiedBy,
      verifiedAt: rows.verifiedAt,
      notes: rows.notes,
      createdAt: rows.createdAt,
    },
    order: rows.orderId
      ? {
          id: rows.orderId,
          bookingNumber: rows.bookingNumber,
          status: rows.orderStatus,
          basePrice: rows.orderBasePrice,
          finalPrice: rows.orderFinalPrice,
          createdAt: rows.orderCreatedAt,
        }
      : null,
    customer: rows.customerName
      ? {
          name: rows.customerName,
          email: rows.customerEmail,
          phone: rows.customerPhone,
        }
      : null,
    verifier: rows.verifierEmail ? { email: rows.verifierEmail } : null,
  });
});

router.post(
  '/:id/verify',
  authMiddleware,
  requireRole('admin', 'super_admin', 'finance'),
  validateBody(verifyPaymentSchema),
  async (c) => {
    const paymentId = c.req.param('id')!;
    const userId = c.get('userId');
    const data = c.get('validated') as VerifyPaymentInput;

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
      if (data.status === 'Paid') {
        await tx
          .update(payments)
          .set({
            status: 'Paid',
            verifiedBy: userId,
            verifiedAt: new Date(),
            notes: data.notes ?? null,
          })
          .where(eq(payments.id, paymentId));

        await tx.update(orders).set({ status: 'Paid' }).where(eq(orders.id, order.id));
        await recordStatusHistory(
          order.id,
          order.status as OrderStatus,
          'Paid',
          userId,
          data.notes,
          tx,
        );
      } else {
        await tx
          .update(payments)
          .set({
            status: 'Failed',
            verifiedBy: userId,
            verifiedAt: new Date(),
            notes: data.notes ?? null,
          })
          .where(eq(payments.id, paymentId));

        await recordStatusHistory(
          order.id,
          order.status as OrderStatus,
          'Completed',
          userId,
          `Pembayaran ditolak: ${data.notes ?? ''}`,
          tx,
        );
      }
    });

    await createAuditLog(c, {
      userId,
      action: `payment.${data.status === 'Paid' ? 'verify' : 'reject'}`,
      entity: 'payment',
      entityId: paymentId,
      newValue: { status: data.status, verifiedBy: userId },
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
        title: data.status === 'Paid' ? 'Pembayaran Diterima' : 'Pembayaran Ditolak',
        message:
          data.status === 'Paid'
            ? 'Pembayaran Anda telah dikonfirmasi. Terima kasih!'
            : `Pembayaran ditolak: ${data.notes ?? ''}`,
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
          data.status as 'Paid' | 'Failed',
          data.notes ?? null,
        );
      }
    }

    return success(c, { id: paymentId, status: data.status }, 'Pembayaran diverifikasi');
  },
);

export { router as paymentsRouter };
