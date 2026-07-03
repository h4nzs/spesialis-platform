import { Hono } from 'hono';
import { eq, and, or, like, sql, desc, isNull } from 'drizzle-orm';
import type { UserRole, UserStatus } from '@specialist/types';
import type { PaginationMeta } from '@specialist/types';
import { db, users } from '../../lib/db.ts';
import { authMiddleware, requireRole } from '../../middleware/auth.ts';
import { updateUserStatusSchema } from '@specialist/validation';
import { success, successPaginated, error, notFound } from '../../lib/response.ts';
import { createAuditLog } from '../../lib/audit.ts';

const router = new Hono();

router.get('/', authMiddleware, requireRole('admin', 'super_admin'), async (c) => {
  const page = Number(c.req.query('page') ?? 1);
  const limit = Number(c.req.query('limit') ?? 50);
  const search = c.req.query('search');
  const role = c.req.query('role');
  const status = c.req.query('status');

  const conditions = and(
    isNull(users.deletedAt),
    search ? or(like(users.email, `%${search}%`), like(users.phone, `%${search}%`)) : undefined,
    role ? eq(users.role, role as UserRole) : undefined,
    status ? eq(users.status, status as UserStatus) : undefined,
  );

  const items = await db
    .select({
      id: users.id,
      email: users.email,
      phone: users.phone,
      role: users.role,
      status: users.status,
      emailVerifiedAt: users.emailVerifiedAt,
      lastLoginAt: users.lastLoginAt,
      createdAt: users.createdAt,
      updatedAt: users.updatedAt,
    })
    .from(users)
    .where(conditions)
    .orderBy(desc(users.createdAt))
    .limit(limit)
    .offset((page - 1) * limit);

  const countResult = await db
    .select({ count: sql<number>`count(*)` })
    .from(users)
    .where(conditions);
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

router.patch('/:id/status', authMiddleware, requireRole('admin', 'super_admin'), async (c) => {
  const id = c.req.param('id')!;
  const body = await c.req.json();
  const parsed = updateUserStatusSchema.safeParse(body);
  if (!parsed.success) {
    return error(
      c,
      'VALIDATION_ERROR',
      'Validation failed',
      422,
      parsed.error.issues.map((i) => ({ field: i.path.join('.'), message: i.message })),
    );
  }

  const [user] = await db
    .select({ id: users.id, status: users.status })
    .from(users)
    .where(and(eq(users.id, id), isNull(users.deletedAt)))
    .limit(1);
  if (!user) return notFound(c, 'User tidak ditemukan');

  const oldStatus = user.status;

  const [updated] = await db
    .update(users)
    .set({ status: parsed.data.status })
    .where(eq(users.id, id))
    .returning({
      id: users.id,
      email: users.email,
      role: users.role,
      status: users.status,
    });

  await createAuditLog(c, {
    userId: c.get('userId'),
    action: 'UPDATE_USER_STATUS',
    entity: 'user',
    entityId: id,
    oldValue: { status: oldStatus },
    newValue: { status: parsed.data.status },
  });

  return success(c, updated, `Status user berhasil diubah menjadi ${parsed.data.status}`);
});

export { router as adminUsersRouter };
