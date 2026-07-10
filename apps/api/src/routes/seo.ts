import { Hono } from 'hono';
import { eq, and } from 'drizzle-orm';
import { db, seoMetadata } from '../lib/db.ts';
import { authMiddleware, requireRole } from '../middleware/auth.ts';
import { requirePermission } from '../middleware/seo-permissions.ts';
import { validateBody } from '../middleware/validation.ts';
import { upsertSeoSchema } from '@specialist/validation';
import type { UpsertSeoInput } from '@specialist/validation';
import { success, created, notFound } from '../lib/response.ts';

const router = new Hono();

router.use('*', authMiddleware, requirePermission('seo.meta'));

router.get('/', async (c) => {
  const entityType = c.req.query('entityType');
  const entityId = c.req.query('entityId');

  const conditions: ReturnType<typeof eq>[] = [];
  if (entityType) conditions.push(eq(seoMetadata.entityType, entityType));
  if (entityId) conditions.push(eq(seoMetadata.entityId, entityId));

  const items = await db
    .select()
    .from(seoMetadata)
    .where(conditions.length > 0 ? and(...conditions) : undefined);

  return success(c, items);
});

router.get('/:id', async (c) => {
  const id = c.req.param('id')!;

  const [item] = await db.select().from(seoMetadata).where(eq(seoMetadata.id, id)).limit(1);
  if (!item) return notFound(c, 'SEO metadata tidak ditemukan');

  return success(c, item);
});

router.post('/', validateBody(upsertSeoSchema), async (c) => {
  const data = c.get('validated') as UpsertSeoInput;

  const [existing] = await db
    .select({ id: seoMetadata.id })
    .from(seoMetadata)
    .where(
      and(eq(seoMetadata.entityType, data.entityType), eq(seoMetadata.entityId, data.entityId)),
    )
    .limit(1);

  if (existing) {
    const [updated] = await db
      .update(seoMetadata)
      .set(data)
      .where(eq(seoMetadata.id, existing.id))
      .returning();
    return success(c, updated, 'SEO metadata berhasil diperbarui');
  }

  const [created_item] = await db.insert(seoMetadata).values(data).returning();
  return created(c, created_item, 'SEO metadata berhasil dibuat');
});

router.patch('/:id', validateBody(upsertSeoSchema.partial()), async (c) => {
  const id = c.req.param('id')!;
  const data = c.get('validated') as UpsertSeoInput;

  const [existing] = await db
    .select({ id: seoMetadata.id })
    .from(seoMetadata)
    .where(eq(seoMetadata.id, id))
    .limit(1);
  if (!existing) return notFound(c, 'SEO metadata tidak ditemukan');

  const [updated] = await db
    .update(seoMetadata)
    .set(data)
    .where(eq(seoMetadata.id, id))
    .returning();

  return success(c, updated, 'SEO metadata berhasil diperbarui');
});

router.delete('/:id', async (c) => {
  const id = c.req.param('id')!;

  const [existing] = await db
    .select({ id: seoMetadata.id })
    .from(seoMetadata)
    .where(eq(seoMetadata.id, id))
    .limit(1);
  if (!existing) return notFound(c, 'SEO metadata tidak ditemukan');

  await db.delete(seoMetadata).where(eq(seoMetadata.id, id));
  return success(c, null, 'SEO metadata berhasil dihapus');
});

export { router as seoRouter };
