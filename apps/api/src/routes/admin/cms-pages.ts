import { Hono } from 'hono';
import { eq, and, desc, sql, isNull } from 'drizzle-orm';
import { db, cmsPages } from '../../lib/db.ts';
import { authMiddleware, requireRole } from '../../middleware/auth.ts';
import { validateBody } from '../../middleware/validation.ts';
import { createCmsPageSchema, updateCmsPageSchema } from '@specialist/validation';
import type { CreateCmsPageInput, UpdateCmsPageInput } from '@specialist/validation';
import {
  success,
  created,
  error,
  notFound,
  serverError,
  successPaginated,
} from '../../lib/response.ts';
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
    const status = c.req.query('status');

    const conditions = and(
      isNull(cmsPages.deletedAt),
      status ? eq(cmsPages.status, status) : undefined,
    );

    const items = await db
      .select({
        id: cmsPages.id,
        title: cmsPages.title,
        slug: cmsPages.slug,
        status: cmsPages.status,
        createdAt: cmsPages.createdAt,
        updatedAt: cmsPages.updatedAt,
      })
      .from(cmsPages)
      .where(conditions)
      .orderBy(desc(cmsPages.createdAt))
      .limit(limit)
      .offset((page - 1) * limit);

    const countResult = await db
      .select({ count: sql<number>`count(*)` })
      .from(cmsPages)
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

    const [page] = await db.select().from(cmsPages).where(eq(cmsPages.id, id)).limit(1);

    if (!page) return notFound(c, 'Halaman tidak ditemukan');
    return success(c, page);
  },
);

router.post(
  '/',
  authMiddleware,
  requireRole('admin', 'super_admin', 'content_manager'),
  validateBody(createCmsPageSchema),
  async (c) => {
    const data = c.get('validated') as CreateCmsPageInput;

    const [existing] = await db
      .select({ id: cmsPages.id })
      .from(cmsPages)
      .where(eq(cmsPages.slug, data.slug))
      .limit(1);
    if (existing) return error(c, 'SLUG_EXISTS', 'Slug sudah digunakan', 409);

    const [record] = await db
      .insert(cmsPages)
      .values({
        title: data.title,
        slug: data.slug,
        content: data.content ?? null,
        meta: data.meta ?? null,
        status: data.status ?? 'Published',
      })
      .returning();

    if (!record) return serverError(c, 'Gagal membuat halaman');

    // Invalidate CMS cache so public endpoints reflect the new page
    invalidateCollectionCache('cms_pages');

    return created(c, record, 'Halaman berhasil dibuat');
  },
);

router.patch(
  '/:id',
  authMiddleware,
  requireRole('admin', 'super_admin', 'content_manager'),
  validateBody(updateCmsPageSchema),
  async (c) => {
    const id = c.req.param('id')!;
    const data = c.get('validated') as UpdateCmsPageInput;

    const [page] = await db
      .select({ id: cmsPages.id })
      .from(cmsPages)
      .where(eq(cmsPages.id, id))
      .limit(1);
    if (!page) return notFound(c, 'Halaman tidak ditemukan');

    if (data.slug) {
      const [existing] = await db
        .select({ id: cmsPages.id })
        .from(cmsPages)
        .where(and(eq(cmsPages.slug, data.slug), sql`${cmsPages.id} != ${id}`))
        .limit(1);
      if (existing) return error(c, 'SLUG_EXISTS', 'Slug sudah digunakan', 409);
    }

    const [record] = await db
      .update(cmsPages)
      .set(omitUndefined(data))
      .where(eq(cmsPages.id, id))
      .returning();

    // Invalidate CMS cache — content or status may have changed
    invalidateCollectionCache('cms_pages');

    return success(c, record, 'Halaman berhasil diperbarui');
  },
);

router.delete('/:id', authMiddleware, requireRole('admin', 'super_admin'), async (c) => {
  const id = c.req.param('id')!;

  const [page] = await db
    .select({ id: cmsPages.id })
    .from(cmsPages)
    .where(eq(cmsPages.id, id))
    .limit(1);
  if (!page) return notFound(c, 'Halaman tidak ditemukan');

  await db.update(cmsPages).set({ deletedAt: new Date() }).where(eq(cmsPages.id, id));

  // Invalidate CMS cache after deletion
  invalidateCollectionCache('cms_pages');

  return success(c, null, 'Halaman berhasil dihapus');
});

export { router as adminCmsPagesRouter };
