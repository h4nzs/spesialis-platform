import { Hono } from 'hono';
import { eq, and, desc, like, gte, lte, sql } from 'drizzle-orm';
import { db, auditLogs, users } from '../../lib/db.ts';
import { authMiddleware, requireRole } from '../../middleware/auth.ts';
import { successPaginated } from '../../lib/response.ts';
import { buildPaginationMeta } from '../../lib/pagination.ts';

const router = new Hono();

router.get('/', authMiddleware, requireRole('admin', 'super_admin'), async (c) => {
  const page = Math.max(1, Number(c.req.query('page')) || 1);
  const limit = Math.min(100, Math.max(1, Number(c.req.query('limit')) || 20));
  const offset = (page - 1) * limit;

  const action = c.req.query('action');
  const entity = c.req.query('entity');
  const userId = c.req.query('userId');
  const dateFrom = c.req.query('dateFrom');
  const dateTo = c.req.query('dateTo');

  const filters: ReturnType<typeof eq>[] = [];

  if (action) filters.push(like(auditLogs.action, `%${action}%`));
  if (entity) filters.push(eq(auditLogs.entity, entity));
  if (userId) filters.push(eq(auditLogs.userId, userId));
  if (dateFrom) filters.push(gte(auditLogs.createdAt, new Date(dateFrom)));
  if (dateTo) filters.push(lte(auditLogs.createdAt, new Date(dateTo)));

  const where = filters.length > 0 ? and(...filters) : undefined;

  const [countResult] = await db
    .select({ total: sql<number>`count(*)` })
    .from(auditLogs)
    .where(where);

  const total = countResult?.total ?? 0;

  const items = await db
    .select({
      id: auditLogs.id,
      action: auditLogs.action,
      entity: auditLogs.entity,
      entityId: auditLogs.entityId,
      oldValue: auditLogs.oldValue,
      newValue: auditLogs.newValue,
      ipAddress: auditLogs.ipAddress,
      userAgent: auditLogs.userAgent,
      createdAt: auditLogs.createdAt,
      userEmail: users.email,
      userRole: users.role,
    })
    .from(auditLogs)
    .leftJoin(users, eq(auditLogs.userId, users.id))
    .where(where)
    .orderBy(desc(auditLogs.createdAt))
    .limit(limit)
    .offset(offset);

  const pagination = buildPaginationMeta(page, limit, total);

  return successPaginated(c, items, pagination, 'Daftar audit log berhasil diambil');
});

export { router as adminAuditLogsRouter };
