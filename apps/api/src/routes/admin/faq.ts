import { Hono } from 'hono';
import { eq, and, desc, asc, sql, isNull } from 'drizzle-orm';
import { db, faq } from '../../lib/db.ts';
import { authMiddleware, requireRole } from '../../middleware/auth.ts';
import { createFaqSchema, updateFaqSchema } from '@specialist/validation';
import {
  success,
  created,
  error,
  notFound,
  serverError,
  successPaginated,
} from '../../lib/response.ts';
import type { PaginationMeta } from '@specialist/types';

const router = new Hono();

router.get(
  '/',
  authMiddleware,
  requireRole('admin', 'super_admin', 'content_manager'),
  async (c) => {
    const page = Number(c.req.query('page') ?? 1);
    const limit = Number(c.req.query('limit') ?? 50);
    const category = c.req.query('category');

    const conditions = and(
      isNull(faq.deletedAt),
      category ? eq(faq.category, category) : undefined,
    );

    const items = await db
      .select()
      .from(faq)
      .where(conditions)
      .orderBy(asc(faq.displayOrder), desc(faq.createdAt))
      .limit(limit)
      .offset((page - 1) * limit);

    const countResult = await db
      .select({ count: sql<number>`count(*)` })
      .from(faq)
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
  },
);

router.get(
  '/:id',
  authMiddleware,
  requireRole('admin', 'super_admin', 'content_manager'),
  async (c) => {
    const id = c.req.param('id')!;
    const [item] = await db
      .select()
      .from(faq)
      .where(and(eq(faq.id, id), isNull(faq.deletedAt)))
      .limit(1);

    if (!item) return notFound(c, 'FAQ tidak ditemukan');
    return success(c, item);
  },
);

router.post(
  '/',
  authMiddleware,
  requireRole('admin', 'super_admin', 'content_manager'),
  async (c) => {
    const body = await c.req.json();
    const parsed = createFaqSchema.safeParse(body);
    if (!parsed.success) {
      return error(
        c,
        'VALIDATION_ERROR',
        'Validation failed',
        422,
        parsed.error.issues.map((i) => ({ field: i.path.join('.'), message: i.message })),
      );
    }

    const [created_item] = await db
      .insert(faq)
      .values({
        question: parsed.data.question,
        answer: parsed.data.answer,
        category: parsed.data.category ?? null,
        displayOrder: parsed.data.displayOrder ?? 0,
        isActive: parsed.data.isActive ?? 'true',
      })
      .returning();

    if (!created_item) return serverError(c, 'Gagal membuat FAQ');
    return created(c, created_item, 'FAQ berhasil dibuat');
  },
);

router.patch(
  '/:id',
  authMiddleware,
  requireRole('admin', 'super_admin', 'content_manager'),
  async (c) => {
    const id = c.req.param('id')!;
    const body = await c.req.json();
    const parsed = updateFaqSchema.safeParse(body);
    if (!parsed.success) {
      return error(
        c,
        'VALIDATION_ERROR',
        'Validation failed',
        422,
        parsed.error.issues.map((i) => ({ field: i.path.join('.'), message: i.message })),
      );
    }

    const [item] = await db
      .select({ id: faq.id })
      .from(faq)
      .where(and(eq(faq.id, id), isNull(faq.deletedAt)))
      .limit(1);
    if (!item) return notFound(c, 'FAQ tidak ditemukan');

    const updateData: Record<string, unknown> = {};
    if (parsed.data.question !== undefined) updateData.question = parsed.data.question;
    if (parsed.data.answer !== undefined) updateData.answer = parsed.data.answer;
    if (parsed.data.category !== undefined) updateData.category = parsed.data.category;
    if (parsed.data.displayOrder !== undefined) updateData.displayOrder = parsed.data.displayOrder;
    if (parsed.data.isActive !== undefined) updateData.isActive = parsed.data.isActive;

    const [updated] = await db.update(faq).set(updateData).where(eq(faq.id, id)).returning();

    return success(c, updated, 'FAQ berhasil diperbarui');
  },
);

router.delete('/:id', authMiddleware, requireRole('admin', 'super_admin'), async (c) => {
  const id = c.req.param('id')!;

  const [item] = await db
    .select({ id: faq.id })
    .from(faq)
    .where(and(eq(faq.id, id), isNull(faq.deletedAt)))
    .limit(1);
  if (!item) return notFound(c, 'FAQ tidak ditemukan');

  await db.update(faq).set({ deletedAt: new Date() }).where(eq(faq.id, id));
  return success(c, null, 'FAQ berhasil dihapus');
});

export { router as adminFaqRouter };
