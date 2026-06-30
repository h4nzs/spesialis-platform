import { Hono } from 'hono';
import { eq, and, desc, sql } from 'drizzle-orm';
import { db, reviews, orders, customerProfiles, partnerProfiles } from '../lib/db.ts';
import { authMiddleware } from '../middleware/auth.ts';
import { createReviewSchema } from '@specialist/validation';
import type { PaginationMeta, OrderStatus } from '@specialist/types';
import {
  success,
  successPaginated,
  created,
  error,
  notFound,
  forbidden,
  conflict,
  serverError,
} from '../lib/response.ts';

const router = new Hono();

router.post('/', authMiddleware, async (c) => {
  const userId = c.get('userId');
  const body = await c.req.json();
  const parsed = createReviewSchema.safeParse(body);
  if (!parsed.success) {
    return error(
      c,
      'VALIDATION_ERROR',
      'Validation failed',
      422,
      parsed.error.issues.map((i) => ({ field: i.path.join('.'), message: i.message })),
    );
  }

  const [profile] = await db
    .select({ id: customerProfiles.id })
    .from(customerProfiles)
    .where(eq(customerProfiles.userId, userId))
    .limit(1);
  if (!profile) return forbidden(c, 'Hanya customer yang bisa review');

  const [order] = await db
    .select({
      id: orders.id,
      customerId: orders.customerId,
      partnerId: orders.partnerId,
      status: orders.status,
    })
    .from(orders)
    .where(eq(orders.id, parsed.data.orderId))
    .limit(1);

  if (!order) return notFound(c, 'Order tidak ditemukan');
  if (order.customerId !== profile.id) return forbidden(c);

  const paidStatuses: OrderStatus[] = ['Paid', 'Closed'];
  if (!paidStatuses.includes(order.status as OrderStatus)) {
    return conflict(c, 'Review hanya bisa untuk order yang sudah selesai');
  }
  if (!order.partnerId) return conflict(c, 'Order belum memiliki partner');

  const existing = await db
    .select({ id: reviews.id })
    .from(reviews)
    .where(eq(reviews.orderId, order.id))
    .limit(1);
  if (existing[0]) return conflict(c, 'Review sudah ada untuk order ini');

  const [review] = await db
    .insert(reviews)
    .values({
      orderId: order.id,
      customerId: profile.id,
      partnerId: order.partnerId,
      rating: String(parsed.data.rating),
      review: parsed.data.review ?? null,
    })
    .returning();

  return created(c, review, 'Review berhasil ditambahkan');
});

router.get('/', async (c) => {
  const partnerId = c.req.query('partnerId');

  const conditions: ReturnType<typeof eq>[] = [];
  if (partnerId) conditions.push(eq(reviews.partnerId, partnerId));

  const items = await db
    .select({
      id: reviews.id,
      orderId: reviews.orderId,
      customerId: reviews.customerId,
      partnerId: reviews.partnerId,
      rating: reviews.rating,
      review: reviews.review,
      createdAt: reviews.createdAt,
    })
    .from(reviews)
    .where(conditions.length > 0 ? and(...conditions) : undefined)
    .orderBy(desc(reviews.createdAt));

  return success(c, items);
});

router.get('/:id', async (c) => {
  const reviewId = c.req.param('id')!;

  const [review] = await db
    .select({
      id: reviews.id,
      orderId: reviews.orderId,
      customerId: reviews.customerId,
      partnerId: reviews.partnerId,
      rating: reviews.rating,
      review: reviews.review,
      createdAt: reviews.createdAt,
    })
    .from(reviews)
    .where(eq(reviews.id, reviewId))
    .limit(1);

  if (!review) return notFound(c, 'Review tidak ditemukan');
  return success(c, review);
});

export { router as reviewsRouter };
