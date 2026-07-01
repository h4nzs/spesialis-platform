import { Hono } from 'hono';
import { eq, and, asc, sql } from 'drizzle-orm';
import { db, services } from '../lib/db.ts';
import type { PaginationMeta } from '@specialist/types';
import { success, successPaginated, notFound, error } from '../lib/response.ts';
import { paginationQuerySchema } from '@specialist/validation';

const router = new Hono();
const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

router.get('/', async (c) => {
  const parsed = paginationQuerySchema.safeParse(c.req.query());
  if (!parsed.success) {
    return error(c, 'VALIDATION_ERROR', 'Parameter tidak valid', 422);
  }
  const query = parsed.data;

  const categoryId = c.req.query('categoryId');
  const featured = c.req.query('featured');

  const conditions: ReturnType<typeof eq>[] = [eq(services.isActive, true)];
  if (categoryId) conditions.push(eq(services.categoryId, categoryId));
  if (featured === 'true') conditions.push(eq(services.isFeatured, true));

  const items = await db
    .select({
      id: services.id,
      categoryId: services.categoryId,
      name: services.name,
      slug: services.slug,
      shortDescription: services.shortDescription,
      basePrice: services.basePrice,
      estimatedDuration: services.estimatedDuration,
      thumbnail: services.thumbnail,
      isFeatured: services.isFeatured,
    })
    .from(services)
    .where(and(...conditions))
    .orderBy(asc(services.displayOrder))
    .limit(query.limit)
    .offset((query.page - 1) * query.limit);

  const countResult = await db
    .select({ count: sql<number>`count(*)` })
    .from(services)
    .where(and(...conditions));
  const total = Number(countResult[0]?.count ?? 0);
  const totalPages = Math.ceil(total / query.limit);

  const pagination: PaginationMeta = {
    page: query.page,
    limit: query.limit,
    total,
    totalPages,
    hasNext: query.page < totalPages,
    hasPrev: query.page > 1,
  };

  return successPaginated(c, items, pagination);
});

router.get('/:identifier', async (c) => {
  const identifier = c.req.param('identifier')!;
  const lookup = UUID_PATTERN.test(identifier)
    ? eq(services.id, identifier)
    : eq(services.slug, identifier);

  const [service] = await db
    .select({
      id: services.id,
      categoryId: services.categoryId,
      name: services.name,
      slug: services.slug,
      shortDescription: services.shortDescription,
      description: services.description,
      basePrice: services.basePrice,
      estimatedDuration: services.estimatedDuration,
      warrantyDays: services.warrantyDays,
      thumbnail: services.thumbnail,
      isFeatured: services.isFeatured,
    })
    .from(services)
    .where(lookup)
    .limit(1);

  if (!service) return notFound(c, 'Service tidak ditemukan');

  return success(c, service);
});

export { router as servicesRouter };
