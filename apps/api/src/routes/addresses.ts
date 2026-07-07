import { Hono } from 'hono';
import { eq, and, isNull } from 'drizzle-orm';
import { db, addresses, customerProfiles } from '../lib/db.ts';
import { authMiddleware } from '../middleware/auth.ts';
import { validateBody } from '../middleware/validation.ts';
import { createAddressSchema, updateAddressSchema } from '@specialist/validation';
import type { CreateAddressInput, UpdateAddressInput } from '@specialist/validation';
import { success, created, notFound } from '../lib/response.ts';

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

router.post('/', validateBody(createAddressSchema), async (c) => {
  const userId = c.get('userId');
  const profile = await getCustomerProfile(userId);
  if (!profile) return notFound(c, 'Profil tidak ditemukan');

  const data = c.get('validated') as CreateAddressInput;

  if (data.isDefault) {
    await db
      .update(addresses)
      .set({ isDefault: false })
      .where(eq(addresses.customerId, profile.id));
  }

  const [address] = await db
    .insert(addresses)
    .values({
      customerId: profile.id,
      label: data.label,
      receiverName: data.receiverName,
      receiverPhone: data.receiverPhone,
      province: data.province,
      city: data.city,
      district: data.district,
      postalCode: data.postalCode,
      address: data.address,
      isDefault: data.isDefault ?? false,
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

router.patch('/:id', validateBody(updateAddressSchema), async (c) => {
  const userId = c.get('userId');
  const profile = await getCustomerProfile(userId);
  if (!profile) return notFound(c, 'Profil tidak ditemukan');

  const addressId = c.req.param('id')!;
  const data = c.get('validated') as UpdateAddressInput;

  const existing = await db
    .select({ id: addresses.id })
    .from(addresses)
    .where(and(eq(addresses.id, addressId), eq(addresses.customerId, profile.id)))
    .limit(1);

  if (!existing[0]) return notFound(c, 'Alamat tidak ditemukan');

  if (data.isDefault) {
    await db
      .update(addresses)
      .set({ isDefault: false })
      .where(eq(addresses.customerId, profile.id));
  }

  const [updated] = await db
    .update(addresses)
    .set(data)
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
