import { Hono } from 'hono';
import { eq, and, asc, desc, inArray, sql, ilike, or, type SQL } from 'drizzle-orm';
import { db, services, reviews, orderItems } from '../lib/db.ts';
import { success, successPaginated, notFound } from '../lib/response.ts';
import { validateQuery } from '../middleware/validation.ts';
import { buildPaginationMeta } from '../lib/pagination.ts';
import { paginationQuerySchema } from '@ahlipanggilan/validation';

const router = new Hono();
const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

router.get('/', validateQuery(paginationQuerySchema), async (c) => {
  const query = c.get('validated') as { page: number; limit: number };

  const categoryId = c.req.query('categoryId');
  const featured = c.req.query('featured');
  const q = c.req.query('q');

  const conditions: SQL[] = [eq(services.isActive, true)];
  if (categoryId) conditions.push(eq(services.categoryId, categoryId));
  if (featured === 'true') conditions.push(eq(services.isFeatured, true));
  if (q) {
    const pattern = `%${q}%`;
    const searchCondition = or(
      ilike(services.name, pattern),
      ilike(services.shortDescription, pattern),
    );
    if (searchCondition) conditions.push(searchCondition);
  }

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
  const pagination = buildPaginationMeta(query.page, query.limit, total);

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

router.get('/:identifier/reviews', async (c) => {
  const identifier = c.req.param('identifier')!;
  const lookup = UUID_PATTERN.test(identifier)
    ? eq(services.id, identifier)
    : eq(services.slug, identifier);

  const [svc] = await db.select({ id: services.id }).from(services).where(lookup).limit(1);
  if (!svc) return notFound(c, 'Service tidak ditemukan');

  // Get order IDs that include this service, then fetch their reviews
  // Using subquery avoids duplicate reviews when an order has multiple items
  const ordersWithService = await db
    .select({ id: orderItems.orderId })
    .from(orderItems)
    .where(eq(orderItems.serviceId, svc.id));

  const orderIds = ordersWithService.map((o) => o.id);
  if (orderIds.length === 0) {
    return success(c, {
      items: [],
      aggregate: { averageRating: 0, totalReviews: 0 },
    });
  }

  const items = await db
    .select({
      id: reviews.id,
      rating: reviews.rating,
      review: reviews.review,
      createdAt: reviews.createdAt,
    })
    .from(reviews)
    .where(inArray(reviews.orderId, orderIds))
    .orderBy(desc(reviews.createdAt));

  const [aggregate] = await db
    .select({
      averageRating: sql<string>`COALESCE(ROUND(AVG(CAST(${reviews.rating} AS DECIMAL)), 1), '0')::text`,
      totalReviews: sql<number>`COUNT(*)::int`,
    })
    .from(reviews)
    .where(inArray(reviews.orderId, orderIds));

  return success(c, {
    items,
    aggregate: {
      averageRating: Number(aggregate?.averageRating ?? 0),
      totalReviews: Number(aggregate?.totalReviews ?? 0),
    },
  });
});

export { router as servicesRouter };
