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

const router = new Hono();

const PUBLIC_SETTING_KEYS = ['whatsapp_phone_number'];

router.get('/settings', async (c) => {
  const items = await db
    .select({ key: systemSettings.key, value: systemSettings.value })
    .from(systemSettings)
    .where(inArray(systemSettings.key, PUBLIC_SETTING_KEYS));

  const result: Record<string, string> = {};
  for (const item of items) {
    result[item.key] = item.value;
  }

  return success(c, result);
});

router.get('/service-categories', async (c) => {
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

  return success(c, items);
});

router.get('/coverage-areas', async (c) => {
  const items = await db
    .select({
      city: coverageAreas.city,
      note: coverageAreas.note,
      displayOrder: coverageAreas.displayOrder,
    })
    .from(coverageAreas)
    .where(eq(coverageAreas.isActive, true))
    .orderBy(asc(coverageAreas.displayOrder), asc(coverageAreas.createdAt));

  return success(c, items);
});

router.get('/partners', async (c) => {
  const city = c.req.query('city')?.trim();
  const limit = Math.min(Number(c.req.query('limit')) || 20, 50);

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

  return success(c, items);
});

export { router as publicRouter };
