import { Hono } from 'hono';
import { eq, and, desc, asc, sql, isNull } from 'drizzle-orm';
import { db, faq } from '../../lib/db.ts';
import { authMiddleware, requireRole } from '../../middleware/auth.ts';
import { validateBody } from '../../middleware/validation.ts';
import { createFaqSchema, updateFaqSchema } from '@ahlipanggilan/validation';
import type { CreateFaqInput, UpdateFaqInput } from '@ahlipanggilan/validation';
import { success, created, notFound, serverError, successPaginated } from '../../lib/response.ts';
import { buildPaginationMeta } from '../../lib/pagination.ts';
import { omitUndefined } from '../../lib/update.ts';
import { invalidateCollectionCache } from '../../lib/cache.ts';

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
    const pagination = buildPaginationMeta(page, limit, total);

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
  validateBody(createFaqSchema),
  async (c) => {
    const data = c.get('validated') as CreateFaqInput;

    const [created_item] = await db
      .insert(faq)
      .values({
        question: data.question,
        answer: data.answer,
        category: data.category ?? null,
        displayOrder: data.displayOrder ?? 0,
        isActive: data.isActive ?? 'true',
      })
      .returning();

    if (!created_item) return serverError(c, 'Gagal membuat FAQ');
    invalidateCollectionCache('cms_faq');
    return created(c, created_item, 'FAQ berhasil dibuat');
  },
);

router.patch(
  '/:id',
  authMiddleware,
  requireRole('admin', 'super_admin', 'content_manager'),
  validateBody(updateFaqSchema),
  async (c) => {
    const id = c.req.param('id')!;
    const data = c.get('validated') as UpdateFaqInput;

    const [item] = await db
      .select({ id: faq.id })
      .from(faq)
      .where(and(eq(faq.id, id), isNull(faq.deletedAt)))
      .limit(1);
    if (!item) return notFound(c, 'FAQ tidak ditemukan');

    const [updated] = await db
      .update(faq)
      .set(omitUndefined(data))
      .where(eq(faq.id, id))
      .returning();

    invalidateCollectionCache('cms_faq');
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
  invalidateCollectionCache('cms_faq');
  return success(c, null, 'FAQ berhasil dihapus');
});

export { router as adminFaqRouter };
