import { Hono } from 'hono';
import { inArray } from 'drizzle-orm';
import { db, systemSettings } from '../lib/db.ts';
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

export { router as publicRouter };
