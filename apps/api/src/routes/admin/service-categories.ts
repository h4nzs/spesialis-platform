import { Hono } from 'hono';
import { eq, asc } from 'drizzle-orm';
import { db, serviceCategories } from '../../lib/db.ts';
import { authMiddleware, requireRole } from '../../middleware/auth.ts';
import { success, created, error, notFound } from '../../lib/response.ts';
import { slugSchema } from '@specialist/validation';

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

router.post('/', authMiddleware, requireRole('admin', 'super_admin'), async (c) => {
  const body = await c.req.json();

  if (!body.name || typeof body.name !== 'string') {
    return error(c, 'VALIDATION_ERROR', 'Nama kategori wajib diisi', 422);
  }

  const slugParsed = slugSchema.safeParse(
    body.slug ??
      body.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, ''),
  );
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
      name: body.name,
      slug: slugParsed.data,
      description: body.description ?? null,
      icon: body.icon ?? null,
      displayOrder: Number(body.displayOrder) || 0,
      isActive: true,
    })
    .returning();

  return created(c, category, 'Kategori berhasil dibuat');
});

router.patch('/:id', authMiddleware, requireRole('admin', 'super_admin'), async (c) => {
  const id = c.req.param('id')!;
  const body = await c.req.json();

  const [category] = await db
    .select({ id: serviceCategories.id })
    .from(serviceCategories)
    .where(eq(serviceCategories.id, id))
    .limit(1);
  if (!category) return notFound(c, 'Kategori tidak ditemukan');

  const updateData: Record<string, unknown> = {};
  if (body.name !== undefined) updateData.name = body.name;
  if (body.slug !== undefined) {
    const slugParsed = slugSchema.safeParse(body.slug);
    if (!slugParsed.success) return error(c, 'VALIDATION_ERROR', 'Slug tidak valid', 422);
    updateData.slug = slugParsed.data;
  }
  if (body.description !== undefined) updateData.description = body.description;
  if (body.icon !== undefined) updateData.icon = body.icon;
  if (body.displayOrder !== undefined) updateData.displayOrder = Number(body.displayOrder);
  if (body.isActive !== undefined) updateData.isActive = body.isActive;

  const [updated] = await db
    .update(serviceCategories)
    .set(updateData)
    .where(eq(serviceCategories.id, id))
    .returning();

  return success(c, updated, 'Kategori berhasil diperbarui');
});

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
