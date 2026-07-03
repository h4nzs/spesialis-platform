import { Hono } from 'hono';
import { eq, desc } from 'drizzle-orm';
import { z } from 'zod';
import { db, systemSettings } from '../../lib/db.ts';
import { authMiddleware, requireRole } from '../../middleware/auth.ts';
import { success, error } from '../../lib/response.ts';
import { createAuditLog } from '../../lib/audit.ts';

const router = new Hono();

const updateSettingsSchema = z.object({
  settings: z.array(
    z.object({
      key: z.string().min(1).max(100),
      value: z.string(),
      category: z.string().min(1).max(50).optional(),
      description: z.string().optional(),
    }),
  ),
});

router.get('/', authMiddleware, requireRole('admin', 'super_admin'), async (c) => {
  const items = await db
    .select()
    .from(systemSettings)
    .orderBy(desc(systemSettings.category), desc(systemSettings.key));

  const grouped: Record<
    string,
    Array<{ key: string; value: string; description: string | null }>
  > = {};

  for (const item of items) {
    const cat = item.category;
    if (!grouped[cat]) grouped[cat] = [];
    grouped[cat]!.push({
      key: item.key,
      value: item.value,
      description: item.description,
    });
  }

  return success(c, grouped);
});

router.patch('/', authMiddleware, requireRole('admin', 'super_admin'), async (c) => {
  const body = await c.req.json();
  const parsed = updateSettingsSchema.safeParse(body);

  if (!parsed.success) {
    return error(
      c,
      'VALIDATION_ERROR',
      'Validation failed',
      422,
      parsed.error.issues.map((i) => ({ field: i.path.join('.'), message: i.message })),
    );
  }

  const userId = c.get('userId');
  const results: Array<{ key: string; updated: boolean }> = [];

  for (const setting of parsed.data.settings) {
    const [existing] = await db
      .select({ id: systemSettings.id, value: systemSettings.value })
      .from(systemSettings)
      .where(eq(systemSettings.key, setting.key))
      .limit(1);

    if (existing) {
      await db
        .update(systemSettings)
        .set({
          value: setting.value,
          updatedBy: userId,
          updatedAt: new Date(),
        })
        .where(eq(systemSettings.id, existing.id));
      results.push({ key: setting.key, updated: true });
    } else {
      await db.insert(systemSettings).values({
        key: setting.key,
        value: setting.value,
        category: setting.category ?? 'general',
        description: setting.description ?? null,
        updatedBy: userId,
      });
      results.push({ key: setting.key, updated: true });
    }
  }

  await createAuditLog(c, {
    userId,
    action: 'UPDATE_SETTINGS',
    entity: 'system_settings',
    entityId: 'bulk',
    oldValue: null,
    newValue: { updated: results.length },
  });

  return success(c, { updated: results.length });
});

export { router as adminSettingsRouter };
