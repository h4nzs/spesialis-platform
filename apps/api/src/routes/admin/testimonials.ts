import { Hono } from 'hono';
import { eq, and, asc, sql, isNull } from 'drizzle-orm';
import { db, cmsTestimonials } from '../../lib/db.ts';
import { authMiddleware, requireRole } from '../../middleware/auth.ts';
import { validateBody } from '../../middleware/validation.ts';
import { createTestimonialSchema, updateTestimonialSchema } from '@ahlipanggilan/validation';
import type { CreateTestimonialInput, UpdateTestimonialInput } from '@ahlipanggilan/validation';
import { success, created, notFound, serverError, successPaginated } from '../../lib/response.ts';
import { buildPaginationMeta } from '../../lib/pagination.ts';
import { omitUndefined } from '../../lib/update.ts';

const router = new Hono();

router.get(
  '/',
  authMiddleware,
  requireRole('admin', 'super_admin', 'content_manager'),
  async (c) => {
    const page = Number(c.req.query('page') ?? 1);
    const limit = Number(c.req.query('limit') ?? 50);

    const conditions = and(isNull(cmsTestimonials.deletedAt));

    const items = await db
      .select()
      .from(cmsTestimonials)
      .where(conditions)
      .orderBy(asc(cmsTestimonials.displayOrder), asc(cmsTestimonials.createdAt))
      .limit(limit)
      .offset((page - 1) * limit);

    const countResult = await db
      .select({ count: sql<number>`count(*)` })
      .from(cmsTestimonials)
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
      .from(cmsTestimonials)
      .where(and(eq(cmsTestimonials.id, id), isNull(cmsTestimonials.deletedAt)))
      .limit(1);

    if (!item) return notFound(c, 'Testimonial tidak ditemukan');
    return success(c, item);
  },
);

router.post(
  '/',
  authMiddleware,
  requireRole('admin', 'super_admin', 'content_manager'),
  validateBody(createTestimonialSchema),
  async (c) => {
    const data = c.get('validated') as CreateTestimonialInput;

    const [created_item] = await db
      .insert(cmsTestimonials)
      .values({
        name: data.name,
        location: data.location ?? null,
        role: data.role ?? null,
        quote: data.quote,
        rating: data.rating !== undefined ? String(data.rating) : '5',
        avatar: data.avatar ?? null,
        displayOrder: data.displayOrder ?? 0,
        isActive: data.isActive ?? 'true',
      })
      .returning();

    if (!created_item) return serverError(c, 'Gagal membuat testimonial');
    return created(c, created_item, 'Testimonial berhasil dibuat');
  },
);

router.patch(
  '/:id',
  authMiddleware,
  requireRole('admin', 'super_admin', 'content_manager'),
  validateBody(updateTestimonialSchema),
  async (c) => {
    const id = c.req.param('id')!;
    const data = c.get('validated') as UpdateTestimonialInput;

    const [item] = await db
      .select({ id: cmsTestimonials.id })
      .from(cmsTestimonials)
      .where(and(eq(cmsTestimonials.id, id), isNull(cmsTestimonials.deletedAt)))
      .limit(1);
    if (!item) return notFound(c, 'Testimonial tidak ditemukan');

    const updateData = omitUndefined(data);
    if (data.rating !== undefined) {
      updateData.rating = String(data.rating);
    }

    const [updated] = await db
      .update(cmsTestimonials)
      .set(updateData)
      .where(eq(cmsTestimonials.id, id))
      .returning();

    return success(c, updated, 'Testimonial berhasil diperbarui');
  },
);

router.delete('/:id', authMiddleware, requireRole('admin', 'super_admin'), async (c) => {
  const id = c.req.param('id')!;

  const [item] = await db
    .select({ id: cmsTestimonials.id })
    .from(cmsTestimonials)
    .where(and(eq(cmsTestimonials.id, id), isNull(cmsTestimonials.deletedAt)))
    .limit(1);
  if (!item) return notFound(c, 'Testimonial tidak ditemukan');

  await db.update(cmsTestimonials).set({ deletedAt: new Date() }).where(eq(cmsTestimonials.id, id));
  return success(c, null, 'Testimonial berhasil dihapus');
});

export { router as adminTestimonialsRouter };
