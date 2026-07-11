import { Hono } from 'hono';
import { eq, desc, sql } from 'drizzle-orm';
import { db, systemSettings, indexnowLogs } from '../lib/db.ts';
import { authMiddleware } from '../middleware/auth.ts';
import { requirePermission } from '../middleware/seo-permissions.ts';
import { generateIndexNowKey } from '@ahlipanggilan/shared';
const router = new Hono();

/**
 * Get or create the IndexNow API key.
 * Admin only — exposes the key.
 */
router.get('/key', authMiddleware, requirePermission('seo.indexnow'), async (c) => {
  const [found] = await db
    .select()
    .from(systemSettings)
    .where(eq(systemSettings.key, 'indexnow_key'))
    .limit(1);

  const setting = found ?? null;

  if (!setting) {
    const key = generateIndexNowKey();
    const [created] = await db
      .insert(systemSettings)
      .values({
        category: 'sitemap',
        key: 'indexnow_key',
        value: key,
        description: 'IndexNow API key untuk notifikasi konten baru ke search engine',
      })
      .returning();

    return c.json({
      success: true,
      data: {
        key: created!.value,
        keyLocation: `https://ahlipanggilan.id/${created!.value}.txt`,
        enabled: true,
      },
    });
  }

  // Also check whether auto-ping is enabled
  const [enabledSetting] = await db
    .select({ value: systemSettings.value })
    .from(systemSettings)
    .where(eq(systemSettings.key, 'indexnow_enabled'))
    .limit(1);

  return c.json({
    success: true,
    data: {
      key: setting.value,
      keyLocation: `https://ahlipanggilan.id/${setting.value}.txt`,
      enabled: enabledSetting?.value !== 'false',
    },
  });
});

/**
 * Get recent IndexNow ping logs.
 * Admin only — shows last 50 ping attempts.
 */
router.get('/logs', authMiddleware, requirePermission('seo.indexnow'), async (c) => {
  const logs = await db.select().from(indexnowLogs).orderBy(desc(indexnowLogs.createdAt)).limit(50);

  const stats = await db
    .select({
      status: indexnowLogs.status,
      count: sql<number>`count(*)::int`,
    })
    .from(indexnowLogs)
    .groupBy(indexnowLogs.status);

  const total = stats.reduce((sum, s) => sum + s.count, 0);
  const successCount = stats.find((s) => s.status === 'success')?.count ?? 0;
  const errorCount = stats.find((s) => s.status === 'error')?.count ?? 0;

  return c.json({
    success: true,
    data: {
      logs,
      stats: {
        total,
        success: successCount,
        error: errorCount,
        successRate: total > 0 ? Math.round((successCount / total) * 100) : 100,
      },
    },
  });
});

export { router as indexnowRouter };
