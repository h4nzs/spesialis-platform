import { Hono } from 'hono';
import { eq, and, asc, isNull } from 'drizzle-orm';
import { db, blogAds } from '../../lib/db.ts';
import { authMiddleware, requireRole } from '../../middleware/auth.ts';
import { validateBody } from '../../middleware/validation.ts';
import { createBlogAdSchema, updateBlogAdSchema } from '@ahlipanggilan/validation';
import type { CreateBlogAdInput, UpdateBlogAdInput } from '@ahlipanggilan/validation';
import { success, created, notFound, serverError } from '../../lib/response.ts';
import { omitUndefined } from '../../lib/update.ts';
import { invalidateCollectionCache } from '../../lib/cache.ts';

const router = new Hono();

router.get(
  '/',
  authMiddleware,
  requireRole('admin', 'super_admin', 'content_manager'),
  async (c) => {
    const items = await db
      .select()
      .from(blogAds)
      .where(isNull(blogAds.deletedAt))
      .orderBy(asc(blogAds.displayOrder), asc(blogAds.createdAt));

    return success(c, items);
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
      .from(blogAds)
      .where(and(eq(blogAds.id, id), isNull(blogAds.deletedAt)))
      .limit(1);

    if (!item) return notFound(c, 'Iklan tidak ditemukan');
    return success(c, item);
  },
);

router.post(
  '/',
  authMiddleware,
  requireRole('admin', 'super_admin', 'content_manager'),
  validateBody(createBlogAdSchema),
  async (c) => {
    const data = c.get('validated') as CreateBlogAdInput;

    const [created_item] = await db
      .insert(blogAds)
      .values({
        title: data.title,
        imageUrl: data.imageUrl,
        caption: data.caption ?? null,
        linkUrl: data.linkUrl ?? null,
        displayOrder: data.displayOrder ?? 0,
        isActive: data.isActive ?? 'true',
      })
      .returning();

    if (!created_item) return serverError(c, 'Gagal membuat iklan');
    await invalidateCollectionCache('cms_blog_ads');
    return created(c, created_item, 'Iklan berhasil dibuat');
  },
);

router.patch(
  '/:id',
  authMiddleware,
  requireRole('admin', 'super_admin', 'content_manager'),
  validateBody(updateBlogAdSchema),
  async (c) => {
    const id = c.req.param('id')!;
    const data = c.get('validated') as UpdateBlogAdInput;

    const [item] = await db
      .select({ id: blogAds.id })
      .from(blogAds)
      .where(and(eq(blogAds.id, id), isNull(blogAds.deletedAt)))
      .limit(1);
    if (!item) return notFound(c, 'Iklan tidak ditemukan');

    const [updated] = await db
      .update(blogAds)
      .set(omitUndefined(data))
      .where(eq(blogAds.id, id))
      .returning();

    await invalidateCollectionCache('cms_blog_ads');
    return success(c, updated, 'Iklan berhasil diperbarui');
  },
);

router.delete('/:id', authMiddleware, requireRole('admin', 'super_admin'), async (c) => {
  const id = c.req.param('id')!;

  const [item] = await db
    .select({ id: blogAds.id })
    .from(blogAds)
    .where(and(eq(blogAds.id, id), isNull(blogAds.deletedAt)))
    .limit(1);
  if (!item) return notFound(c, 'Iklan tidak ditemukan');

  await db.update(blogAds).set({ deletedAt: new Date() }).where(eq(blogAds.id, id));
  await invalidateCollectionCache('cms_blog_ads');
  return success(c, null, 'Iklan berhasil dihapus');
});

export { router as adminBlogAdsRouter };
