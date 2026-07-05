import { Hono } from 'hono';
import { eq } from 'drizzle-orm';
import { db, orders } from '../../lib/db.ts';
import { authMiddleware, requireRole } from '../../middleware/auth.ts';
import { discountOrderSchema } from '@specialist/validation';
import { success, error, notFound } from '../../lib/response.ts';
import { createAuditLog } from '../../lib/audit.ts';

const router = new Hono();

router.patch('/:id/discount', authMiddleware, requireRole('admin', 'super_admin'), async (c) => {
  const orderId = c.req.param('id')!;
  const userId = c.get('userId');
  const body = await c.req.json();
  const parsed = discountOrderSchema.safeParse(body);
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
      discountPercent: orders.discountPercent,
      discountAmount: orders.discountAmount,
    })
    .from(orders)
    .where(eq(orders.id, orderId))
    .limit(1);
  if (!order) return notFound(c, 'Order tidak ditemukan');

  const oldPercent = order.discountPercent;
  const oldAmount = order.discountAmount;

  const updateData: Record<string, unknown> = {};
  if (parsed.data.discountPercent !== undefined) {
    updateData.discountPercent = String(parsed.data.discountPercent);
  }
  if (parsed.data.discountAmount !== undefined) {
    updateData.discountAmount = String(parsed.data.discountAmount);
  }

  await db.update(orders).set(updateData).where(eq(orders.id, orderId));

  await createAuditLog(c, {
    userId,
    action: 'order.discount',
    entity: 'order',
    entityId: orderId,
    newValue: updateData,
    oldValue: { discountPercent: oldPercent, discountAmount: oldAmount },
  });

  return success(c, { id: orderId, ...updateData }, 'Diskon berhasil diperbarui');
});

export { router as adminOrdersRouter };
