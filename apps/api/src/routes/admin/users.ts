import { Hono } from 'hono';
import { eq, and, or, like, sql, desc, isNull } from 'drizzle-orm';
import type { UserRole, UserStatus } from '@ahlipanggilan/types';
import { db, users, customerProfiles, partnerProfiles } from '../../lib/db.ts';
import { authMiddleware, requireRole } from '../../middleware/auth.ts';
import { validateBody } from '../../middleware/validation.ts';
import {
  updateUserStatusSchema,
  updateUserRoleSchema,
  adminCreateUserSchema,
} from '@ahlipanggilan/validation';
import type { AdminCreateUserInput } from '@ahlipanggilan/validation';
import { hashPassword } from '../../lib/auth.ts';
import {
  success,
  successPaginated,
  created,
  notFound,
  forbidden,
  conflict,
} from '../../lib/response.ts';
import { buildPaginationMeta } from '../../lib/pagination.ts';
import { createAuditLog } from '../../lib/audit.ts';

const router = new Hono();

router.post(
  '/',
  authMiddleware,
  requireRole('super_admin'),
  validateBody(adminCreateUserSchema),
  async (c) => {
    const { email, phone, password, fullName, role, ktpNumber } = c.get(
      'validated',
    ) as AdminCreateUserInput;

    // Validasi: jika role partner, ktpNumber wajib
    if (role === 'partner' && !ktpNumber) {
      return conflict(c, 'Nomor KTP wajib diisi untuk role Partner');
    }

    // Cek duplikat email atau phone
    const existing = await db
      .select({ id: users.id })
      .from(users)
      .where(or(eq(users.email, email), eq(users.phone, phone)))
      .limit(1);

    if (existing[0]) {
      return conflict(c, 'Email atau nomor HP sudah terdaftar');
    }

    const passwordHash = await hashPassword(password);

    const { user } = await db.transaction(async (tx) => {
      const [createdUser] = await tx
        .insert(users)
        .values({
          email,
          phone,
          passwordHash,
          role: role as UserRole,
          status: 'active',
        })
        .returning({ id: users.id, email: users.email, role: users.role });

      if (!createdUser) throw new Error('Gagal membuat user');

      // Buat profile sesuai role
      if (role === 'customer') {
        await tx.insert(customerProfiles).values({
          userId: createdUser.id,
          fullName,
        });
      } else if (role === 'partner') {
        await tx.insert(partnerProfiles).values({
          userId: createdUser.id,
          fullName,
          phone,
          ktpNumber: ktpNumber!,
        });
      }

      return { user: createdUser };
    });

    await createAuditLog(c, {
      userId: c.get('userId'),
      action: 'CREATE_USER',
      entity: 'user',
      entityId: user.id,
      newValue: { email, role },
    });

    return created(c, { user }, `User ${role} berhasil dibuat`);
  },
);

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
  const pagination = buildPaginationMeta(page, limit, total);

  return successPaginated(c, items, pagination);
});

router.patch(
  '/:id/status',
  authMiddleware,
  requireRole('admin', 'super_admin'),
  validateBody(updateUserStatusSchema),
  async (c) => {
    const id = c.req.param('id')!;
    const data = c.get('validated') as { status: string };

    const [user] = await db
      .select({ id: users.id, status: users.status })
      .from(users)
      .where(and(eq(users.id, id), isNull(users.deletedAt)))
      .limit(1);
    if (!user) return notFound(c, 'User tidak ditemukan');

    const oldStatus = user.status;

    const [updated] = await db
      .update(users)
      .set({ status: data.status as UserStatus })
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
      newValue: { status: data.status },
    });

    return success(c, updated, `Status user berhasil diubah menjadi ${data.status}`);
  },
);

router.patch(
  '/:id/role',
  authMiddleware,
  requireRole('admin', 'super_admin'),
  validateBody(updateUserRoleSchema),
  async (c) => {
    const id = c.req.param('id')!;
    const data = c.get('validated') as { role: string };
    const currentUserRole = c.get('userRole') as string;

    // Admin biasa tidak boleh mengubah role ke super_admin
    if (currentUserRole !== 'super_admin' && data.role === 'super_admin') {
      return forbidden(c, 'Anda tidak memiliki izin untuk memberikan role Super Admin');
    }

    const [user] = await db
      .select({ id: users.id, role: users.role })
      .from(users)
      .where(and(eq(users.id, id), isNull(users.deletedAt)))
      .limit(1);
    if (!user) return notFound(c, 'User tidak ditemukan');

    const oldRole = user.role;

    const [updated] = await db
      .update(users)
      .set({ role: data.role as UserRole })
      .where(eq(users.id, id))
      .returning({
        id: users.id,
        email: users.email,
        role: users.role,
        status: users.status,
      });

    await createAuditLog(c, {
      userId: c.get('userId'),
      action: 'UPDATE_USER_ROLE',
      entity: 'user',
      entityId: id,
      oldValue: { role: oldRole },
      newValue: { role: data.role },
    });

    return success(
      c,
      updated,
      `Role user berhasil diubah menjadi ${ROLE_LABELS[data.role as keyof typeof ROLE_LABELS] ?? data.role}`,
    );
  },
);

export { router as adminUsersRouter };

const ROLE_LABELS: Record<string, string> = {
  customer: 'Customer',
  partner: 'Partner',
  corporate: 'Corporate',
  admin: 'Admin',
  super_admin: 'Super Admin',
  dispatcher: 'Dispatcher',
  finance: 'Finance',
  content_manager: 'Content Manager',
};
