import { Hono } from 'hono';
import { eq, and, asc, sql } from 'drizzle-orm';
import { db, services, serviceCategories } from '../../lib/db.ts';
import { authMiddleware, requireRole } from '../../middleware/auth.ts';
import { createServiceSchema, updateServiceSchema } from '@specialist/validation';
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

    const items = await db
      .select({
        id: services.id,
        categoryId: services.categoryId,
        categoryName: serviceCategories.name,
        name: services.name,
        slug: services.slug,
        basePrice: services.basePrice,
        isActive: services.isActive,
        isFeatured: services.isFeatured,
        displayOrder: services.displayOrder,
        estimatedDuration: services.estimatedDuration,
      })
      .from(services)
      .leftJoin(serviceCategories, eq(services.categoryId, serviceCategories.id))
      .orderBy(asc(services.displayOrder))
      .limit(limit)
      .offset((page - 1) * limit);

    const countResult = await db.select({ count: sql<number>`count(*)` }).from(services);
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

    const [service] = await db.select().from(services).where(eq(services.id, id)).limit(1);

    if (!service) return notFound(c, 'Layanan tidak ditemukan');
    return success(c, service);
  },
);

router.post('/', authMiddleware, requireRole('admin', 'super_admin'), async (c) => {
  const body = await c.req.json();
  const parsed = createServiceSchema.safeParse(body);
  if (!parsed.success) {
    return error(
      c,
      'VALIDATION_ERROR',
      'Validation failed',
      422,
      parsed.error.issues.map((i) => ({ field: i.path.join('.'), message: i.message })),
    );
  }

  const [existing] = await db
    .select({ id: services.id })
    .from(services)
    .where(eq(services.slug, parsed.data.slug))
    .limit(1);
  if (existing) return error(c, 'SLUG_EXISTS', 'Slug sudah digunakan', 409);

  const [created_service] = await db
    .insert(services)
    .values({
      categoryId: parsed.data.categoryId,
      name: parsed.data.name,
      slug: parsed.data.slug,
      shortDescription: parsed.data.shortDescription ?? null,
      description: parsed.data.description ?? null,
      basePrice: String(parsed.data.basePrice),
      estimatedDuration: parsed.data.estimatedDuration ?? null,
      warrantyDays: parsed.data.warrantyDays ?? null,
      isFeatured: parsed.data.isFeatured ?? false,
      displayOrder: parsed.data.displayOrder ?? 0,
    })
    .returning();

  if (!created_service) return serverError(c, 'Gagal membuat layanan');
  return created(c, created_service, 'Layanan berhasil dibuat');
});

router.patch('/:id', authMiddleware, requireRole('admin', 'super_admin'), async (c) => {
  const id = c.req.param('id')!;
  const body = await c.req.json();
  const parsed = updateServiceSchema.safeParse(body);
  if (!parsed.success) {
    return error(
      c,
      'VALIDATION_ERROR',
      'Validation failed',
      422,
      parsed.error.issues.map((i) => ({ field: i.path.join('.'), message: i.message })),
    );
  }

  const [service] = await db
    .select({ id: services.id })
    .from(services)
    .where(eq(services.id, id))
    .limit(1);
  if (!service) return notFound(c, 'Layanan tidak ditemukan');

  if (parsed.data.slug) {
    const [existing] = await db
      .select({ id: services.id })
      .from(services)
      .where(and(eq(services.slug, parsed.data.slug), sql`${services.id} != ${id}`))
      .limit(1);
    if (existing) return error(c, 'SLUG_EXISTS', 'Slug sudah digunakan', 409);
  }

  const updateData: Record<string, unknown> = {};
  if (parsed.data.name !== undefined) updateData.name = parsed.data.name;
  if (parsed.data.slug !== undefined) updateData.slug = parsed.data.slug;
  if (parsed.data.shortDescription !== undefined)
    updateData.shortDescription = parsed.data.shortDescription;
  if (parsed.data.description !== undefined) updateData.description = parsed.data.description;
  if (parsed.data.basePrice !== undefined) updateData.basePrice = String(parsed.data.basePrice);
  if (parsed.data.estimatedDuration !== undefined)
    updateData.estimatedDuration = parsed.data.estimatedDuration;
  if (parsed.data.warrantyDays !== undefined) updateData.warrantyDays = parsed.data.warrantyDays;
  if (parsed.data.isActive !== undefined) updateData.isActive = parsed.data.isActive;
  if (parsed.data.isFeatured !== undefined) updateData.isFeatured = parsed.data.isFeatured;
  if (parsed.data.displayOrder !== undefined) updateData.displayOrder = parsed.data.displayOrder;

  const [updated] = await db
    .update(services)
    .set(updateData)
    .where(eq(services.id, id))
    .returning();

  return success(c, updated, 'Layanan berhasil diperbarui');
});

router.delete('/:id', authMiddleware, requireRole('admin', 'super_admin'), async (c) => {
  const id = c.req.param('id')!;

  const [service] = await db
    .select({ id: services.id })
    .from(services)
    .where(eq(services.id, id))
    .limit(1);
  if (!service) return notFound(c, 'Layanan tidak ditemukan');

  await db.update(services).set({ isActive: false }).where(eq(services.id, id));
  return success(c, null, 'Layanan berhasil dinonaktifkan');
});

export { router as adminServicesRouter };
