import { Hono } from 'hono';
import { eq, and, isNull } from 'drizzle-orm';
import { db, addresses, customerProfiles } from '../lib/db.ts';
import { authMiddleware } from '../middleware/auth.ts';
import { createAddressSchema, updateAddressSchema } from '@specialist/validation';
import { success, created, error, notFound, serverError } from '../lib/response.ts';

const router = new Hono();

router.use('*', authMiddleware);

async function getCustomerProfile(userId: string) {
  const [profile] = await db
    .select({ id: customerProfiles.id })
    .from(customerProfiles)
    .where(eq(customerProfiles.userId, userId))
    .limit(1);
  return profile;
}

router.get('/', async (c) => {
  const userId = c.get('userId');
  const profile = await getCustomerProfile(userId);
  if (!profile) return notFound(c, 'Profil tidak ditemukan');

  const items = await db
    .select()
    .from(addresses)
    .where(and(eq(addresses.customerId, profile.id), isNull(addresses.deletedAt)))
    .orderBy(addresses.isDefault);

  return success(c, items);
});

router.post('/', async (c) => {
  const userId = c.get('userId');
  const profile = await getCustomerProfile(userId);
  if (!profile) return notFound(c, 'Profil tidak ditemukan');

  const body = await c.req.json();
  const parsed = createAddressSchema.safeParse(body);
  if (!parsed.success) {
    return error(
      c,
      'VALIDATION_ERROR',
      'Validation failed',
      422,
      parsed.error.issues.map((i) => ({ field: i.path.join('.'), message: i.message })),
    );
  }

  if (parsed.data.isDefault) {
    await db
      .update(addresses)
      .set({ isDefault: false })
      .where(eq(addresses.customerId, profile.id));
  }

  const [address] = await db
    .insert(addresses)
    .values({
      customerId: profile.id,
      label: parsed.data.label,
      receiverName: parsed.data.receiverName,
      receiverPhone: parsed.data.receiverPhone,
      province: parsed.data.province,
      city: parsed.data.city,
      district: parsed.data.district,
      postalCode: parsed.data.postalCode,
      address: parsed.data.address,
      isDefault: parsed.data.isDefault ?? false,
    })
    .returning();

  return created(c, address, 'Alamat berhasil ditambahkan');
});

router.get('/:id', async (c) => {
  const userId = c.get('userId');
  const profile = await getCustomerProfile(userId);
  if (!profile) return notFound(c, 'Profil tidak ditemukan');

  const addressId = c.req.param('id')!;
  const [address] = await db
    .select()
    .from(addresses)
    .where(and(eq(addresses.id, addressId), eq(addresses.customerId, profile.id)))
    .limit(1);

  if (!address) return notFound(c, 'Alamat tidak ditemukan');
  return success(c, address);
});

router.patch('/:id', async (c) => {
  const userId = c.get('userId');
  const profile = await getCustomerProfile(userId);
  if (!profile) return notFound(c, 'Profil tidak ditemukan');

  const addressId = c.req.param('id')!;
  const body = await c.req.json();

  const parsed = updateAddressSchema.safeParse(body);
  if (!parsed.success) {
    return error(
      c,
      'VALIDATION_ERROR',
      'Validation failed',
      422,
      parsed.error.issues.map((i) => ({ field: i.path.join('.'), message: i.message })),
    );
  }

  const existing = await db
    .select({ id: addresses.id })
    .from(addresses)
    .where(and(eq(addresses.id, addressId), eq(addresses.customerId, profile.id)))
    .limit(1);

  if (!existing[0]) return notFound(c, 'Alamat tidak ditemukan');

  if (parsed.data.isDefault) {
    await db
      .update(addresses)
      .set({ isDefault: false })
      .where(eq(addresses.customerId, profile.id));
  }

  const [updated] = await db
    .update(addresses)
    .set(parsed.data)
    .where(eq(addresses.id, addressId))
    .returning();

  return success(c, updated, 'Alamat berhasil diperbarui');
});

router.delete('/:id', async (c) => {
  const userId = c.get('userId');
  const profile = await getCustomerProfile(userId);
  if (!profile) return notFound(c, 'Profil tidak ditemukan');

  const addressId = c.req.param('id')!;
  const [existing] = await db
    .select({ id: addresses.id })
    .from(addresses)
    .where(and(eq(addresses.id, addressId), eq(addresses.customerId, profile.id)))
    .limit(1);

  if (!existing) return notFound(c, 'Alamat tidak ditemukan');

  await db.update(addresses).set({ deletedAt: new Date() }).where(eq(addresses.id, addressId));

  return success(c, null, 'Alamat berhasil dihapus');
});

export { router as addressesRouter };
