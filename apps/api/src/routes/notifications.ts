import { Hono } from 'hono';
import { eq, and, desc, sql } from 'drizzle-orm';
import { db, notifications } from '../lib/db.ts';
import { authMiddleware } from '../middleware/auth.ts';
import { markNotificationReadSchema } from '@specialist/validation';
import type { PaginationMeta } from '@specialist/types';
import { success, successPaginated, error } from '../lib/response.ts';

const router = new Hono();

router.get('/', authMiddleware, async (c) => {
  const userId = c.get('userId');
  const limit = Math.min(Number(c.req.query('limit')) || 20, 100);
  const page = Math.max(Number(c.req.query('page')) || 1, 1);

  const items = await db
    .select({
      id: notifications.id,
      type: notifications.type,
      channel: notifications.channel,
      title: notifications.title,
      message: notifications.message,
      isRead: notifications.isRead,
      createdAt: notifications.createdAt,
    })
    .from(notifications)
    .where(eq(notifications.userId, userId))
    .orderBy(desc(notifications.createdAt))
    .limit(limit)
    .offset((page - 1) * limit);

  const countResult = await db
    .select({ count: sql<number>`count(*)` })
    .from(notifications)
    .where(eq(notifications.userId, userId));
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
});

router.get('/unread-count', authMiddleware, async (c) => {
  const userId = c.get('userId');
  const [result] = await db
    .select({ count: sql<number>`count(*)` })
    .from(notifications)
    .where(and(eq(notifications.userId, userId), eq(notifications.isRead, false)));
  return success(c, { unread: Number(result?.count ?? 0) });
});

router.patch('/read', authMiddleware, async (c) => {
  const userId = c.get('userId');
  const body = await c.req.json();
  const parsed = markNotificationReadSchema.safeParse(body);
  if (!parsed.success) {
    return error(
      c,
      'VALIDATION_ERROR',
      'Validation failed',
      422,
      parsed.error.issues.map((i) => ({ field: i.path.join('.'), message: i.message })),
    );
  }

  for (const id of parsed.data.notificationIds) {
    await db
      .update(notifications)
      .set({ isRead: true })
      .where(and(eq(notifications.id, id), eq(notifications.userId, userId)));
  }

  return success(c, null, `${parsed.data.notificationIds.length} notifikasi ditandai dibaca`);
});

export { router as notificationsRouter };
