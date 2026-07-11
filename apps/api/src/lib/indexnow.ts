import { eq } from 'drizzle-orm';
import { db, systemSettings, indexnowLogs } from './db.ts';
import { pingIndexNow, generateIndexNowKey } from '@ahlipanggilan/shared';

/**
 * Ping IndexNow for article URLs when an article is published.
 * Fire-and-forget — never throws.
 * Logs each ping attempt to indexnow_logs for the dashboard widget.
 */
export async function notifyArticlePublished(slug: string): Promise<void> {
  try {
    const [setting] = await db
      .select({ value: systemSettings.value })
      .from(systemSettings)
      .where(eq(systemSettings.key, 'indexnow_key'))
      .limit(1);

    const key = setting?.value;
    if (!key) return; // No key configured

    const [enabledSetting] = await db
      .select({ value: systemSettings.value })
      .from(systemSettings)
      .where(eq(systemSettings.key, 'indexnow_enabled'))
      .limit(1);

    if (enabledSetting?.value === 'false') return; // Disabled

    const host = process.env.SITE_URL ?? 'https://ahlipanggilan.id';
    const keyLocation = `${host}/${key}.txt`;
    const url = `${host}/blog/${slug}`;

    const startTime = Date.now();
    const results = await pingIndexNow([url], key, keyLocation, host);
    const duration = Date.now() - startTime;

    // Log to database (best-effort, fire-and-forget)
    try {
      await db.insert(indexnowLogs).values(
        results.map((r) => ({
          url,
          keyUsed: key,
          destination: r.destination,
          status:
            r.error || !r.status
              ? 'error'
              : r.status >= 200 && r.status < 400
                ? 'success'
                : 'error',
          httpStatus: r.status,
          error: r.error,
          duration,
        })),
      );
    } catch {
      // Logging failure is non-critical
    }
  } catch {
    // Best-effort — never break the article publish flow
  }
}

/**
 * Ensure IndexNow key exists in settings (auto-generate if missing).
 */
export async function ensureIndexNowKey(): Promise<string> {
  const [existing] = await db
    .select({ value: systemSettings.value })
    .from(systemSettings)
    .where(eq(systemSettings.key, 'indexnow_key'))
    .limit(1);

  if (existing) return existing.value;

  const key = generateIndexNowKey();
  await db.insert(systemSettings).values({
    category: 'sitemap',
    key: 'indexnow_key',
    value: key,
    description: 'IndexNow API key untuk notifikasi konten baru ke search engine',
  });

  // Also set enabled by default (ignore if already exists)
  try {
    await db.insert(systemSettings).values({
      category: 'sitemap',
      key: 'indexnow_enabled',
      value: 'true',
      description: 'Auto-ping IndexNow saat artikel dipublikasikan',
    });
  } catch {
    // Entry already exists — ignore
  }

  return key;
}
