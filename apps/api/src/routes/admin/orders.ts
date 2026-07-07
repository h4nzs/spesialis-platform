import { Hono } from 'hono';
import { eq } from 'drizzle-orm';
import { db, orders } from '../../lib/db.ts';
import { authMiddleware, requireRole } from '../../middleware/auth.ts';
import { validateBody } from '../../middleware/validation.ts';
import { discountOrderSchema } from '@specialist/validation';
import { success, notFound } from '../../lib/response.ts';
import { omitUndefined } from '../../lib/update.ts';
import { createAuditLog } from '../../lib/audit.ts';

const router = new Hono();

router.patch(
  '/:id/discount',
  authMiddleware,
  requireRole('admin', 'super_admin'),
  validateBody(discountOrderSchema),
  async (c) => {
    const orderId = c.req.param('id')!;
    const userId = c.get('userId');
    const data = c.get('validated') as { discountPercent?: number; discountAmount?: number };

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
      newValue: updateData,
      oldValue: { discountPercent: oldPercent, discountAmount: oldAmount },
    });

    return success(c, { id: orderId, ...updateData }, 'Diskon berhasil diperbarui');
  },
);

export { router as adminOrdersRouter };
