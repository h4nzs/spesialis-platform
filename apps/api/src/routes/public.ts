import { Hono } from 'hono';
import { eq, inArray, asc, ilike, and, desc, isNull } from 'drizzle-orm';
import {
  db,
  systemSettings,
  coverageAreas,
  serviceCategories,
  partnerProfiles,
} from '../lib/db.ts';
import { success } from '../lib/response.ts';
import { cmsCache } from '../lib/cache.ts';

const router = new Hono();

const PUBLIC_SETTING_KEYS = ['whatsapp_phone_number'];

// TTL pendek (15s) — data publik berubah jarang; Nginx meng-cache HTML
// 10s, jadi cache ini menjaga API tetap cepat untuk SSR tanpa staleness.
const PUBLIC_TTL_MS = 15_000;

router.get('/settings', async (c) => {
  const cached = await cmsCache.get<Record<string, string>>('cms:settings');
  if (cached.hit) {
    c.header('Cache-Control', 'public, max-age=15, stale-while-revalidate=30');
    return success(c, cached.data);
  }

  const items = await db
    .select({ key: systemSettings.key, value: systemSettings.value })
    .from(systemSettings)
    .where(inArray(systemSettings.key, PUBLIC_SETTING_KEYS));

  const result: Record<string, string> = {};
  for (const item of items) {
    result[item.key] = item.value;
  }

  await cmsCache.set('cms:settings', result, PUBLIC_TTL_MS);
  c.header('Cache-Control', 'public, max-age=15, stale-while-revalidate=30');
  return success(c, result);
});

router.get('/service-categories', async (c) => {
  const cached = await cmsCache.get<
    Array<{
      id: string;
      name: string;
      slug: string;
      icon: string | null;
      description: string | null;
      displayOrder: number;
    }>
  >('cms:service-categories');
  if (cached.hit) {
    c.header('Cache-Control', 'public, max-age=15, stale-while-revalidate=30');
    return success(c, cached.data);
  }

  const items = await db
    .select({
      id: serviceCategories.id,
      name: serviceCategories.name,
      slug: serviceCategories.slug,
      icon: serviceCategories.icon,
      description: serviceCategories.description,
      displayOrder: serviceCategories.displayOrder,
    })
    .from(serviceCategories)
    .where(eq(serviceCategories.isActive, true))
    .orderBy(asc(serviceCategories.displayOrder));

  await cmsCache.set('cms:service-categories', items, PUBLIC_TTL_MS);
  c.header('Cache-Control', 'public, max-age=15, stale-while-revalidate=30');
  return success(c, items);
});

router.get('/coverage-areas', async (c) => {
  // Key sama dengan CMS route → auto-invalidated saat admin edit area
  const cached =
    await cmsCache.get<Array<{ city: string; note: string | null; displayOrder: number }>>(
      'cms:coverage-areas',
    );
  if (cached.hit) {
    c.header('Cache-Control', 'public, max-age=15, stale-while-revalidate=30');
    return success(c, cached.data);
  }

  const items = await db
    .select({
      city: coverageAreas.city,
      note: coverageAreas.note,
      displayOrder: coverageAreas.displayOrder,
    })
    .from(coverageAreas)
    .where(eq(coverageAreas.isActive, true))
    .orderBy(asc(coverageAreas.displayOrder), asc(coverageAreas.createdAt));

  await cmsCache.set('cms:coverage-areas', items, PUBLIC_TTL_MS);
  c.header('Cache-Control', 'public, max-age=15, stale-while-revalidate=30');
  return success(c, items);
});

router.get('/partners', async (c) => {
  const city = c.req.query('city')?.trim();
  const limit = Math.min(Number(c.req.query('limit')) || 20, 50);
  const cacheKey = city
    ? `cms:partners:${city.toLowerCase()}:${limit}`
    : `cms:partners:all:${limit}`;

  const cached = await cmsCache.get<
    Array<{
      id: string;
      fullName: string;
      domicile: string;
      bio: string | null;
      ratingAverage: number;
      completedJobs: number;
      availability: string;
      experienceYear: number;
    }>
  >(cacheKey);
  if (cached.hit) {
    c.header('Cache-Control', 'public, max-age=15, stale-while-revalidate=30');
    return success(c, cached.data);
  }

  const conditions: ReturnType<typeof eq>[] = [
    eq(partnerProfiles.verificationStatus, 'Approved'),
    isNull(partnerProfiles.deletedAt),
  ];
  if (city) conditions.push(ilike(partnerProfiles.domicile, `%${city}%`));

  const items = await db
    .select({
      id: partnerProfiles.id,
      fullName: partnerProfiles.fullName,
      domicile: partnerProfiles.domicile,
      bio: partnerProfiles.bio,
      ratingAverage: partnerProfiles.ratingAverage,
      completedJobs: partnerProfiles.completedJobs,
      availability: partnerProfiles.availability,
      experienceYear: partnerProfiles.experienceYear,
    })
    .from(partnerProfiles)
    .where(and(...conditions))
    .orderBy(desc(partnerProfiles.ratingAverage))
    .limit(limit);

  await cmsCache.set(cacheKey, items, PUBLIC_TTL_MS);
  c.header('Cache-Control', 'public, max-age=15, stale-while-revalidate=30');
  return success(c, items);
});

export { router as publicRouter };
