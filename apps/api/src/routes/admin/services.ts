import { Hono } from 'hono';
import { eq, and, asc, sql } from 'drizzle-orm';
import { db, services, serviceCategories } from '../../lib/db.ts';
import { authMiddleware, requireRole } from '../../middleware/auth.ts';
import { validateBody } from '../../middleware/validation.ts';
import { createServiceSchema, updateServiceSchema } from '@ahlipanggilan/validation';
import type { CreateServiceInput, UpdateServiceInput } from '@ahlipanggilan/validation';
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
        thumbnail: services.thumbnail,
        basePrice: services.basePrice,
        isActive: services.isActive,
        isFeatured: services.isFeatured,
        showInHero: services.showInHero,
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

    const [service] = await db.select().from(services).where(eq(services.id, id)).limit(1);

    if (!service) return notFound(c, 'Layanan tidak ditemukan');
    return success(c, service);
  },
);

router.post(
  '/',
  authMiddleware,
  requireRole('admin', 'super_admin'),
  validateBody(createServiceSchema),
  async (c) => {
    const data = c.get('validated') as CreateServiceInput;

    const [existing] = await db
      .select({ id: services.id })
      .from(services)
      .where(eq(services.slug, data.slug))
      .limit(1);
    if (existing) return error(c, 'SLUG_EXISTS', 'Slug sudah digunakan', 409);

    const [created_service] = await db
      .insert(services)
      .values({
        categoryId: data.categoryId ?? null,
        name: data.name,
        slug: data.slug,
        shortDescription: data.shortDescription ?? null,
        description: data.description ?? null,
        thumbnail: data.thumbnail ?? null,
        basePrice: data.basePrice,
        estimatedDuration: data.estimatedDuration ?? null,
        warrantyDays: data.warrantyDays ?? null,
        isFeatured: data.isFeatured ?? false,
        showInHero: data.showInHero ?? false,
        displayOrder: data.displayOrder ?? 0,
      })
      .returning();

    if (!created_service) return serverError(c, 'Gagal membuat layanan');
    return created(c, created_service, 'Layanan berhasil dibuat');
  },
);

router.patch(
  '/:id',
  authMiddleware,
  requireRole('admin', 'super_admin'),
  validateBody(updateServiceSchema),
  async (c) => {
    const id = c.req.param('id')!;
    const data = c.get('validated') as UpdateServiceInput;

    const [service] = await db
      .select({ id: services.id })
      .from(services)
      .where(eq(services.id, id))
      .limit(1);
    if (!service) return notFound(c, 'Layanan tidak ditemukan');

    if (data.slug) {
      const [existing] = await db
        .select({ id: services.id })
        .from(services)
        .where(and(eq(services.slug, data.slug), sql`${services.id} != ${id}`))
        .limit(1);
      if (existing) return error(c, 'SLUG_EXISTS', 'Slug sudah digunakan', 409);
    }

    const [updated] = await db
      .update(services)
      .set(
        omitUndefined({
          ...data,
          basePrice: data.basePrice,
        }),
      )
      .where(eq(services.id, id))
      .returning();

    return success(c, updated, 'Layanan berhasil diperbarui');
  },
);

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
