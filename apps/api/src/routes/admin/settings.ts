import { Hono } from 'hono';
import { eq, desc } from 'drizzle-orm';
import { z } from 'zod';
import { db, systemSettings, users } from '../../lib/db.ts';
import { authMiddleware, requireRole } from '../../middleware/auth.ts';
import { validateBody } from '../../middleware/validation.ts';
import { success } from '../../lib/response.ts';
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

router.patch(
  '/',
  authMiddleware,
  requireRole('admin', 'super_admin'),
  validateBody(updateSettingsSchema),
  async (c) => {
    const data = c.get('validated') as {
      settings: Array<{ key: string; value: string; category?: string; description?: string }>;
    };

    const userId = c.get('userId');
    const [userExists] = await db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);
    const updatedBy = userExists ? userId : undefined;
    const results: Array<{ key: string; updated: boolean }> = [];

    for (const setting of data.settings) {
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
            ...(updatedBy ? { updatedBy } : {}),
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
          ...(updatedBy ? { updatedBy } : {}),
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
  },
);

export { router as adminSettingsRouter };
