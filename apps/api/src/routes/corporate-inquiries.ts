import { Hono } from 'hono';
import { eq, desc, sql, and } from 'drizzle-orm';
import { db, corporateInquiries } from '../lib/db.ts';
import { authMiddleware, requireRole } from '../middleware/auth.ts';
import { validateBody } from '../middleware/validation.ts';
import {
  createCorporateInquirySchema,
  updateCorporateInquirySchema,
} from '@ahlipanggilan/validation';
import { success, created, notFound, serverError, successPaginated } from '../lib/response.ts';
import { buildPaginationMeta } from '../lib/pagination.ts';
import { omitUndefined } from '../lib/update.ts';
import { notifyAdmins } from '../lib/notification.ts';

const router = new Hono();

router.post('/', validateBody(createCorporateInquirySchema), async (c) => {
  const data = c.get('validated') as {
    companyName: string;
    legalName?: string;
    email: string;
    phone: string;
    industry?: string;
    employeeCount?: number;
    notes?: string;
  };

  const [inquiry] = await db
    .insert(corporateInquiries)
    .values({
      companyName: data.companyName,
      legalName: data.legalName ?? null,
      email: data.email,
      phone: data.phone,
      industry: data.industry ?? null,
      employeeCount: data.employeeCount ?? null,
      notes: data.notes ?? null,
    })
    .returning();

  if (!inquiry) return serverError(c, 'Gagal mengirim inquiry');

  notifyAdmins(
    'corporate.inquiry',
    'Inquiry Perusahaan Baru',
    `Inquiry baru dari ${data.companyName} (${data.email})`,
  );

  return created(c, inquiry, 'Inquiry berhasil dikirim');
});

router.get('/', authMiddleware, requireRole('admin', 'super_admin'), async (c) => {
  const page = Number(c.req.query('page') ?? 1);
  const limit = Number(c.req.query('limit') ?? 50);
  const status = c.req.query('status');

  const conditions = and(status ? eq(corporateInquiries.status, status) : undefined);

  const items = await db
    .select()
    .from(corporateInquiries)
    .where(conditions)
    .orderBy(desc(corporateInquiries.createdAt))
    .limit(limit)
    .offset((page - 1) * limit);

  const countResult = await db
    .select({ count: sql<number>`count(*)` })
    .from(corporateInquiries)
    .where(conditions);
  const total = Number(countResult[0]?.count ?? 0);
  const pagination = buildPaginationMeta(page, limit, total);

  return successPaginated(c, items, pagination);
});

router.get('/:id', authMiddleware, requireRole('admin', 'super_admin'), async (c) => {
  const id = c.req.param('id')!;
  const [inquiry] = await db
    .select()
    .from(corporateInquiries)
    .where(eq(corporateInquiries.id, id))
    .limit(1);

  if (!inquiry) return notFound(c, 'Inquiry tidak ditemukan');
  return success(c, inquiry);
});

router.patch(
  '/:id',
  authMiddleware,
  requireRole('admin', 'super_admin'),
  validateBody(updateCorporateInquirySchema),
  async (c) => {
    const id = c.req.param('id')!;
    const userId = c.get('userId');
    const data = c.get('validated') as { status: string; notes?: string };

    const [inquiry] = await db
      .select({ id: corporateInquiries.id })
      .from(corporateInquiries)
      .where(eq(corporateInquiries.id, id))
      .limit(1);
    if (!inquiry) return notFound(c, 'Inquiry tidak ditemukan');

    const updateData = {
      status: data.status,
      handledBy: userId,
      handledAt: new Date(),
      ...omitUndefined({ notes: data.notes }),
    };

    const [updated] = await db
      .update(corporateInquiries)
      .set(updateData)
      .where(eq(corporateInquiries.id, id))
      .returning();

    return success(c, updated, 'Inquiry berhasil diperbarui');
  },
);

export { router as corporateInquiriesRouter };
