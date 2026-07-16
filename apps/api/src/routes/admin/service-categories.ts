import { Hono } from 'hono';
import { eq, asc } from 'drizzle-orm';
import { db, serviceCategories } from '../../lib/db.ts';
import { authMiddleware, requireRole } from '../../middleware/auth.ts';
import { validateBody } from '../../middleware/validation.ts';
import {
  createServiceCategorySchema,
  updateServiceCategorySchema,
} from '@ahlipanggilan/validation';
import type {
  CreateServiceCategoryInput,
  UpdateServiceCategoryInput,
} from '@ahlipanggilan/validation';
import { slugSchema } from '@ahlipanggilan/validation';
import { success, created, error, notFound } from '../../lib/response.ts';
import { omitUndefined } from '../../lib/update.ts';

const router = new Hono();

router.get(
  '/',
  authMiddleware,
  requireRole('admin', 'super_admin', 'content_manager'),
  async (c) => {
    const items = await db
      .select()
      .from(serviceCategories)
      .orderBy(asc(serviceCategories.displayOrder));

    return success(c, items);
  },
);

router.post(
  '/',
  authMiddleware,
  requireRole('admin', 'super_admin'),
  validateBody(createServiceCategorySchema),
  async (c) => {
    const data = c.get('validated') as CreateServiceCategoryInput;

    const slug =
      data.slug ??
      data.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '');

    const slugParsed = slugSchema.safeParse(slug);
    if (!slugParsed.success) {
      return error(c, 'VALIDATION_ERROR', 'Slug tidak valid', 422);
    }

    const [existing] = await db
      .select({ id: serviceCategories.id })
      .from(serviceCategories)
      .where(eq(serviceCategories.slug, slugParsed.data))
      .limit(1);
    if (existing) return error(c, 'SLUG_EXISTS', 'Slug sudah digunakan', 409);

    const [category] = await db
      .insert(serviceCategories)
      .values({
        name: data.name,
        slug,
        description: data.description ?? null,
        icon: data.icon ?? null,
        image: data.image ?? null,
        displayOrder: data.displayOrder ?? 0,
        isActive: true,
      })
      .returning();

    return created(c, category, 'Kategori berhasil dibuat');
  },
);

router.patch(
  '/:id',
  authMiddleware,
  requireRole('admin', 'super_admin'),
  validateBody(updateServiceCategorySchema),
  async (c) => {
    const id = c.req.param('id')!;
    const data = c.get('validated') as UpdateServiceCategoryInput;

    const [category] = await db
      .select({ id: serviceCategories.id })
      .from(serviceCategories)
      .where(eq(serviceCategories.id, id))
      .limit(1);
    if (!category) return notFound(c, 'Kategori tidak ditemukan');

    if (data.slug) {
      const [existing] = await db
        .select({ id: serviceCategories.id })
        .from(serviceCategories)
        .where(eq(serviceCategories.slug, data.slug))
        .limit(1);
      if (existing && existing.id !== id)
        return error(c, 'SLUG_EXISTS', 'Slug sudah digunakan', 409);
    }

    const [updated] = await db
      .update(serviceCategories)
      .set(omitUndefined(data))
      .where(eq(serviceCategories.id, id))
      .returning();

    return success(c, updated, 'Kategori berhasil diperbarui');
  },
);

router.delete('/:id', authMiddleware, requireRole('admin', 'super_admin'), async (c) => {
  const id = c.req.param('id')!;

  const [category] = await db
    .select({ id: serviceCategories.id })
    .from(serviceCategories)
    .where(eq(serviceCategories.id, id))
    .limit(1);
  if (!category) return notFound(c, 'Kategori tidak ditemukan');

  await db.update(serviceCategories).set({ isActive: false }).where(eq(serviceCategories.id, id));
  return success(c, null, 'Kategori berhasil dinonaktifkan');
});

export { router as adminServiceCategoriesRouter };
