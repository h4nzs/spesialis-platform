import { Hono } from 'hono';
import { eq } from 'drizzle-orm';
import { db, customerProfiles } from '../lib/db.ts';
import { authMiddleware } from '../middleware/auth.ts';
import { updateCustomerSchema } from '@specialist/validation';
import { success, error, serverError } from '../lib/response.ts';

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
