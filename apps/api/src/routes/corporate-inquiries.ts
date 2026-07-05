import { Hono } from 'hono';
import { eq, desc, sql, and } from 'drizzle-orm';
import { db, corporateInquiries } from '../lib/db.ts';
import { authMiddleware, requireRole } from '../middleware/auth.ts';
import { createCorporateInquirySchema, updateCorporateInquirySchema } from '@specialist/validation';
import type { PaginationMeta } from '@specialist/types';
import {
  success,
  created,
  error,
  notFound,
  serverError,
  successPaginated,
} from '../lib/response.ts';
import { notifyAdmins } from '../lib/notification.ts';

const router = new Hono();

router.post('/', async (c) => {
  const body = await c.req.json();
  const parsed = createCorporateInquirySchema.safeParse(body);
  if (!parsed.success) {
    return error(
      c,
      'VALIDATION_ERROR',
      'Validation failed',
      422,
      parsed.error.issues.map((i) => ({ field: i.path.join('.'), message: i.message })),
    );
  }

  const [inquiry] = await db
    .insert(corporateInquiries)
    .values({
      companyName: parsed.data.companyName,
      legalName: parsed.data.legalName ?? null,
      email: parsed.data.email,
      phone: parsed.data.phone,
      industry: parsed.data.industry ?? null,
      employeeCount: parsed.data.employeeCount ?? null,
      notes: parsed.data.notes ?? null,
    })
    .returning();

  if (!inquiry) return serverError(c, 'Gagal mengirim inquiry');

  notifyAdmins(
    'corporate.inquiry',
    'Inquiry Perusahaan Baru',
    `Inquiry baru dari ${parsed.data.companyName} (${parsed.data.email})`,
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
  const totalPages = Math.ceil(total / limit);

  const pagination: PaginationMeta = {
    page,
    limit,
    total,
    totalPages,
    hasNext: page < totalPages,
    hasPrev: page > 1,
  };

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

router.patch('/:id', authMiddleware, requireRole('admin', 'super_admin'), async (c) => {
  const id = c.req.param('id')!;
  const userId = c.get('userId');
  const body = await c.req.json();
  const parsed = updateCorporateInquirySchema.safeParse(body);
  if (!parsed.success) {
    return error(
      c,
      'VALIDATION_ERROR',
      'Validation failed',
      422,
      parsed.error.issues.map((i) => ({ field: i.path.join('.'), message: i.message })),
    );
  }

  const [inquiry] = await db
    .select({ id: corporateInquiries.id })
    .from(corporateInquiries)
    .where(eq(corporateInquiries.id, id))
    .limit(1);
  if (!inquiry) return notFound(c, 'Inquiry tidak ditemukan');

  const updateData: Record<string, unknown> = {
    status: parsed.data.status,
    handledBy: userId,
    handledAt: new Date(),
  };
  if (parsed.data.notes !== undefined) updateData.notes = parsed.data.notes;

  const [updated] = await db
    .update(corporateInquiries)
    .set(updateData)
    .where(eq(corporateInquiries.id, id))
    .returning();

  return success(c, updated, 'Inquiry berhasil diperbarui');
});

export { router as corporateInquiriesRouter };
