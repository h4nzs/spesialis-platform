import { Hono } from 'hono';
import { eq, desc, and } from 'drizzle-orm';
import { db, partnerPenalties, partnerProfiles, orders } from '../../lib/db.ts';
import { authMiddleware, requireRole } from '../../middleware/auth.ts';
import { validateBody } from '../../middleware/validation.ts';
import { imposePenaltySchema, updatePenaltyStatusSchema } from '@ahlipanggilan/validation';
import type { ImposePenaltyInput, UpdatePenaltyStatusInput } from '@ahlipanggilan/validation';
import { success, notFound, created, serverError } from '../../lib/response.ts';
import { createAuditLog } from '../../lib/audit.ts';

const router = new Hono();

router.get('/', authMiddleware, requireRole('admin', 'super_admin'), async (c) => {
  const partnerId = c.req.query('partnerId');

  const conditions: ReturnType<typeof eq>[] = [];
  if (partnerId) conditions.push(eq(partnerPenalties.partnerId, partnerId));

  const items = await db
    .select({
      id: partnerPenalties.id,
      partnerId: partnerPenalties.partnerId,
      partnerName: partnerProfiles.fullName,
      orderId: partnerPenalties.orderId,
      bookingNumber: orders.bookingNumber,
      type: partnerPenalties.type,
      amount: partnerPenalties.amount,
      reason: partnerPenalties.reason,
      status: partnerPenalties.status,
      imposedAt: partnerPenalties.imposedAt,
      paidAt: partnerPenalties.paidAt,
      resolvedAt: partnerPenalties.resolvedAt,
      notes: partnerPenalties.notes,
    })
    .from(partnerPenalties)
    .leftJoin(partnerProfiles, eq(partnerPenalties.partnerId, partnerProfiles.id))
    .leftJoin(orders, eq(partnerPenalties.orderId, orders.id))
    .where(conditions.length > 0 ? and(...conditions) : undefined)
    .orderBy(desc(partnerPenalties.imposedAt));

  return success(c, items);
});

router.post(
  '/',
  authMiddleware,
  requireRole('admin', 'super_admin'),
  validateBody(imposePenaltySchema),
  async (c) => {
    const userId = c.get('userId');
    const data = c.get('validated') as ImposePenaltyInput;

    const [partner] = await db
      .select({ id: partnerProfiles.id })
      .from(partnerProfiles)
      .where(eq(partnerProfiles.id, data.partnerId))
      .limit(1);
    if (!partner) return notFound(c, 'Partner tidak ditemukan');

    if (data.orderId) {
      const [order] = await db
        .select({ id: orders.id })
        .from(orders)
        .where(eq(orders.id, data.orderId))
        .limit(1);
      if (!order) return notFound(c, 'Order tidak ditemukan');
    }

    const [penalty] = await db
      .insert(partnerPenalties)
      .values({
        partnerId: data.partnerId,
        orderId: data.orderId ?? null,
        type: data.type,
        amount: String(data.amount),
        reason: data.reason,
        status: 'Pending',
        imposedBy: userId,
        notes: data.notes ?? null,
      })
      .returning();

    if (!penalty) return serverError(c, 'Gagal membuat penalty');

    await createAuditLog(c, {
      userId,
      action: 'partner.penalty.imposed',
      entity: 'partner_penalty',
      entityId: penalty.id,
      newValue: { penalty: { ...data, amount: String(data.amount) } },
    });

    return created(c, penalty, 'Penalty berhasil diberikan');
  },
);

router.patch(
  '/:id/status',
  authMiddleware,
  requireRole('admin', 'super_admin'),
  validateBody(updatePenaltyStatusSchema),
  async (c) => {
    const penaltyId = c.req.param('id')!;
    const userId = c.get('userId');
    const data = c.get('validated') as UpdatePenaltyStatusInput;

    const [penalty] = await db
      .select({ id: partnerPenalties.id, status: partnerPenalties.status })
      .from(partnerPenalties)
      .where(eq(partnerPenalties.id, penaltyId))
      .limit(1);
    if (!penalty) return notFound(c, 'Penalty tidak ditemukan');

    const updates: Record<string, unknown> = {
      status: data.status,
    };
    if (data.notes !== undefined) updates.notes = data.notes;
    if (data.status === 'Applied') updates.paidAt = new Date();
    if (data.status === 'Waived') updates.resolvedAt = new Date();

    await db.update(partnerPenalties).set(updates).where(eq(partnerPenalties.id, penaltyId));

    await createAuditLog(c, {
      userId,
      action: 'partner.penalty.status',
      entity: 'partner_penalty',
      entityId: penaltyId,
      oldValue: { status: penalty.status },
      newValue: { status: data.status, notes: data.notes },
    });

    return success(c, { id: penaltyId, ...updates }, 'Status penalty berhasil diperbarui');
  },
);

export { router as adminPenaltiesRouter };
