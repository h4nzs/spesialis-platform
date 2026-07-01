import { Hono } from 'hono';
import { eq, desc } from 'drizzle-orm';
import { db, customerProfiles, users } from '../lib/db.ts';
import { authMiddleware, requireRole } from '../middleware/auth.ts';
import { updateCustomerSchema } from '@specialist/validation';
import { success, error, notFound, serverError } from '../lib/response.ts';
import { createAuditLog } from '../lib/audit.ts';
import type { UserStatus } from '@specialist/types';

const router = new Hono();

router.get('/me', authMiddleware, async (c) => {
  const userId = c.get('userId');

  const [profile] = await db
    .select({
      id: customerProfiles.id,
      userId: customerProfiles.userId,
      fullName: customerProfiles.fullName,
      avatar: customerProfiles.avatar,
      birthDate: customerProfiles.birthDate,
      gender: customerProfiles.gender,
      defaultAddressId: customerProfiles.defaultAddressId,
      createdAt: customerProfiles.createdAt,
    })
    .from(customerProfiles)
    .where(eq(customerProfiles.userId, userId))
    .limit(1);

  if (!profile) {
    return error(c, 'PROFILE_NOT_FOUND', 'Profil tidak ditemukan', 404);
  }

  return success(c, profile);
});

router.patch('/me', authMiddleware, async (c) => {
  const userId = c.get('userId');
  const body = await c.req.json();

  const parsed = updateCustomerSchema.safeParse(body);
  if (!parsed.success) {
    return error(
      c,
      'VALIDATION_ERROR',
      'Validation failed',
      422,
      parsed.error.issues.map((i) => ({ field: i.path.join('.'), message: i.message })),
    );
  }

  const updateData: Record<string, unknown> = {};
  if (parsed.data.fullName !== undefined) updateData.fullName = parsed.data.fullName;
  if (parsed.data.avatar !== undefined) updateData.avatar = parsed.data.avatar;
  if (parsed.data.birthDate !== undefined) updateData.birthDate = parsed.data.birthDate;
  if (parsed.data.gender !== undefined) updateData.gender = parsed.data.gender;
  if (parsed.data.defaultAddressId !== undefined)
    updateData.defaultAddressId = parsed.data.defaultAddressId;

  const [updated] = await db
    .update(customerProfiles)
    .set(updateData)
    .where(eq(customerProfiles.userId, userId))
    .returning({
      id: customerProfiles.id,
      fullName: customerProfiles.fullName,
      avatar: customerProfiles.avatar,
      birthDate: customerProfiles.birthDate,
      gender: customerProfiles.gender,
      defaultAddressId: customerProfiles.defaultAddressId,
    });

  if (!updated) return serverError(c, 'Gagal update profil');

  return success(c, updated, 'Profil berhasil diperbarui');
});

router.get('/', authMiddleware, requireRole('admin', 'super_admin'), async (c) => {
  const items = await db
    .select({
      id: users.id,
      email: users.email,
      phone: users.phone,
      fullName: customerProfiles.fullName,
      status: users.status,
      createdAt: users.createdAt,
    })
    .from(users)
    .innerJoin(customerProfiles, eq(customerProfiles.userId, users.id))
    .where(eq(users.role, 'customer'))
    .orderBy(desc(users.createdAt));

  return success(c, items);
});

router.patch('/:id/status', authMiddleware, requireRole('admin', 'super_admin'), async (c) => {
  const targetUserId = c.req.param('id')!;
  const adminId = c.get('userId');
  const body = await c.req.json();
  const newStatus: string = body.status;

  if (!['active', 'suspended', 'blocked'].includes(newStatus)) {
    return error(c, 'VALIDATION_ERROR', 'Status tidak valid', 422);
  }

  const [target] = await db
    .select({ id: users.id, role: users.role, status: users.status })
    .from(users)
    .where(eq(users.id, targetUserId))
    .limit(1);
  if (!target) return notFound(c, 'User tidak ditemukan');
  if (target.role !== 'customer') return error(c, 'INVALID_ROLE', 'Bukan customer', 400);

  await db
    .update(users)
    .set({ status: newStatus as UserStatus })
    .where(eq(users.id, targetUserId));

  await createAuditLog(c, {
    userId: adminId,
    action: `customer.${newStatus}`,
    entity: 'user',
    entityId: targetUserId,
    newValue: { status: newStatus },
    oldValue: { status: target.status },
  });

  return success(
    c,
    { id: targetUserId, status: newStatus },
    `Status customer diubah ke ${newStatus}`,
  );
});

router.get('/guest-convert', authMiddleware, async (c) => {
  const userId = c.get('userId');

  const [profile] = await db
    .select({ id: customerProfiles.id, guestPhone: customerProfiles.guestPhone })
    .from(customerProfiles)
    .where(eq(customerProfiles.userId, userId))
    .limit(1);

  if (!profile?.guestPhone) {
    return success(c, { needsConversion: false }, 'Akun sudah terdaftar penuh');
  }

  return success(c, { needsConversion: true }, 'Guest booking terdeteksi, lengkapi data');
});

export { router as customersRouter };
