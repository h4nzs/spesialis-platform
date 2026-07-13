import { Hono } from 'hono';
import { eq, inArray, asc } from 'drizzle-orm';
import { db, systemSettings, coverageAreas } from '../lib/db.ts';
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

router.get('/coverage-areas', async (c) => {
  const items = await db
    .select({
      city: coverageAreas.city,
      note: coverageAreas.note,
      displayOrder: coverageAreas.displayOrder,
    })
    .from(coverageAreas)
    .where(eq(coverageAreas.isActive, 'true'))
    .orderBy(asc(coverageAreas.displayOrder), asc(coverageAreas.createdAt));

  return success(c, items);
});

export { router as publicRouter };
