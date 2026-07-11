import type { Context } from 'hono';
import { eq } from 'drizzle-orm';
import { db, systemSettings } from '../lib/db.ts';

/**
 * Serve the IndexNow verification key at /{key}.txt.
 * Mounted on the root Hono app so it's accessible at the domain root
 * (e.g. https://ahlipanggilan.id/abc123.txt) as required by search engines.
 */
export async function indexnowKeyHandler(c: Context) {
  const key = c.req.param('key')!;

  try {
    const [setting] = await db
      .select({ value: systemSettings.value })
      .from(systemSettings)
      .where(eq(systemSettings.key, 'indexnow_key'))
      .limit(1);

    if (!setting || setting.value !== key) {
      return c.text('', 404);
    }

    return c.text(key, 200, {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, max-age=3600',
    });
  } catch {
    return c.text('', 404);
  }
}
