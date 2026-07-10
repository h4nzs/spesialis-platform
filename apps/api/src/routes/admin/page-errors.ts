import { Hono } from 'hono';
import { eq, desc, sql } from 'drizzle-orm';
import { db, pageErrors } from '../../lib/db.ts';
import { authMiddleware } from '../../middleware/auth.ts';
import { requirePermission } from '../../middleware/seo-permissions.ts';
import { success, successPaginated, notFound } from '../../lib/response.ts';
import { buildPaginationMeta } from '../../lib/pagination.ts';

const router = new Hono();

router.use('*', authMiddleware);
router.use('*', requirePermission('seo.404_monitor'));

router.get('/', async (c) => {
  const page = Number(c.req.query('page') ?? 1);
  const limit = Number(c.req.query('limit') ?? 20);
  const search = c.req.query('search');

  const searchCondition = search ? sql`path ILIKE ${'%' + search + '%'}` : undefined;

  const items = await db
    .select()
    .from(pageErrors)
    .where(searchCondition)
    .orderBy(desc(pageErrors.lastSeen))
    .limit(limit)
    .offset((page - 1) * limit);

  const countResult = await db
    .select({ count: sql<number>`count(*)` })
    .from(pageErrors)
    .where(searchCondition);
  const total = Number(countResult[0]?.count ?? 0);
  const pagination = buildPaginationMeta(page, limit, total);

  return successPaginated(c, items, pagination);
});

router.get('/stats', async (c) => {
  const totalErrors = await db.select({ count: sql<number>`count(*)` }).from(pageErrors);

  const topPaths = await db.select().from(pageErrors).orderBy(desc(pageErrors.count)).limit(10);

  const last24h = await db
    .select({ count: sql<number>`count(*)` })
    .from(pageErrors)
    .where(sql`last_seen > now() - interval '24 hours'`);

  return success(c, {
    total: Number(totalErrors[0]?.count ?? 0),
    topPaths,
    last24h: Number(last24h[0]?.count ?? 0),
  });
});

router.delete('/:id', async (c) => {
  const id = c.req.param('id')!;

  const [existing] = await db
    .select({ id: pageErrors.id })
    .from(pageErrors)
    .where(eq(pageErrors.id, id))
    .limit(1);
  if (!existing) return notFound(c, 'Error entry tidak ditemukan');

  await db.delete(pageErrors).where(eq(pageErrors.id, id));
  return success(c, null, 'Error entry berhasil dihapus');
});

router.delete('/all', async (c) => {
  await db.delete(pageErrors);
  return success(c, null, 'Semua error entry berhasil dihapus');
});

export { router as adminPageErrorsRouter };
