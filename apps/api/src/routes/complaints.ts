import { Hono } from 'hono';
import { eq, desc } from 'drizzle-orm';
import { db, complaints, orders, customerProfiles, users } from '../lib/db.ts';
import { authMiddleware, requireRole } from '../middleware/auth.ts';
import { createComplaintSchema, resolveComplaintSchema } from '@specialist/validation';
import { success, created, error, notFound, forbidden, conflict } from '../lib/response.ts';
import { createAuditLog } from '../lib/audit.ts';
import { createNotification, notifyAdmins } from '../lib/notification.ts';

const router = new Hono();

router.post('/', authMiddleware, async (c) => {
  const userId = c.get('userId');
  const body = await c.req.json();
  const parsed = createComplaintSchema.safeParse(body);
  if (!parsed.success) {
    return error(
      c,
      'VALIDATION_ERROR',
      'Validation failed',
      422,
      parsed.error.issues.map((i) => ({ field: i.path.join('.'), message: i.message })),
    );
  }

  const [profile] = await db
    .select({ id: customerProfiles.id })
    .from(customerProfiles)
    .where(eq(customerProfiles.userId, userId))
    .limit(1);
  if (!profile) return forbidden(c, 'Hanya customer yang bisa komplain');

  const [order] = await db
    .select({ id: orders.id, customerId: orders.customerId })
    .from(orders)
    .where(eq(orders.id, parsed.data.orderId))
    .limit(1);
  if (!order) return notFound(c, 'Order tidak ditemukan');
  if (order.customerId !== profile.id) return forbidden(c);

  const [complaint] = await db
    .insert(complaints)
    .values({
      orderId: order.id,
      customerId: profile.id,
      title: parsed.data.title,
      description: parsed.data.description,
    })
    .returning();

  notifyAdmins('complaint.new', 'Komplain Baru', `Komplain baru: ${parsed.data.title}`);

  return created(c, complaint, 'Komplain berhasil diajukan');
});

router.get('/', authMiddleware, async (c) => {
  const userId = c.get('userId');
  const userRole = c.get('userRole');

  if (userRole === 'admin' || userRole === 'super_admin') {
    const items = await db.select().from(complaints).orderBy(desc(complaints.createdAt));
    return success(c, items);
  }

  const [profile] = await db
    .select({ id: customerProfiles.id })
    .from(customerProfiles)
    .where(eq(customerProfiles.userId, userId))
    .limit(1);
  if (!profile) return forbidden(c);

  const items = await db
    .select()
    .from(complaints)
    .where(eq(complaints.customerId, profile.id))
    .orderBy(desc(complaints.createdAt));

  return success(c, items);
});

router.get('/:id', authMiddleware, async (c) => {
  const complaintId = c.req.param('id')!;
  const userId = c.get('userId');
  const userRole = c.get('userRole');

  const [complaint] = await db
    .select()
    .from(complaints)
    .where(eq(complaints.id, complaintId))
    .limit(1);
  if (!complaint) return notFound(c, 'Komplain tidak ditemukan');

  if (userRole !== 'admin' && userRole !== 'super_admin') {
    const [profile] = await db
      .select({ id: customerProfiles.id })
      .from(customerProfiles)
      .where(eq(customerProfiles.userId, userId))
      .limit(1);
    if (!profile || complaint.customerId !== profile.id) return forbidden(c);
  }

  return success(c, complaint);
});

router.patch('/:id/resolve', authMiddleware, requireRole('admin', 'super_admin'), async (c) => {
  const complaintId = c.req.param('id')!;
  const userId = c.get('userId');
  const body = await c.req.json();
  const parsed = resolveComplaintSchema.safeParse(body);
  if (!parsed.success) {
    return error(
      c,
      'VALIDATION_ERROR',
      'Validation failed',
      422,
      parsed.error.issues.map((i) => ({ field: i.path.join('.'), message: i.message })),
    );
  }

  const [complaint] = await db
    .select({ id: complaints.id, status: complaints.status, customerId: complaints.customerId })
    .from(complaints)
    .where(eq(complaints.id, complaintId))
    .limit(1);
  if (!complaint) return notFound(c, 'Komplain tidak ditemukan');

  if (complaint.status === 'Resolved' || complaint.status === 'Closed') {
    return conflict(c, 'Komplain sudah selesai');
  }

  const [updated] = await db
    .update(complaints)
    .set({
      status: parsed.data.status,
      resolution: parsed.data.resolution,
      resolvedBy: userId,
      resolvedAt: new Date(),
    })
    .where(eq(complaints.id, complaintId))
    .returning();

  await createAuditLog(c, {
    userId,
    action: `complaint.${parsed.data.status === 'Resolved' ? 'resolve' : 'close'}`,
    entity: 'complaint',
    entityId: complaintId,
    newValue: { status: parsed.data.status, resolution: parsed.data.resolution },
    oldValue: { status: complaint.status },
  });

  const [cp] = await db
    .select({ userId: customerProfiles.userId, fullName: customerProfiles.fullName })
    .from(customerProfiles)
    .where(eq(customerProfiles.id, complaint.customerId))
    .limit(1);
  if (cp?.userId) {
    const [user] = await db
      .select({ email: users.email })
      .from(users)
      .where(eq(users.id, cp.userId))
      .limit(1);

    await createNotification({
      userId: cp.userId,
      type: 'complaint.resolved',
      title: 'Komplain Selesai',
      message: `Komplain Anda telah ${parsed.data.status === 'Resolved' ? 'diselesaikan' : 'ditutup'}: ${parsed.data.resolution ?? ''}`,
      channel: 'Email',
      email: user?.email ?? undefined,
      fullName: cp.fullName ?? undefined,
    });
  }

  return success(c, updated, 'Komplain berhasil diselesaikan');
});

export { router as complaintsRouter };
