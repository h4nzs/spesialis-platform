import { Hono } from 'hono';
import { eq, and } from 'drizzle-orm';
import { db, seoMetadata } from '../lib/db.ts';
import { authMiddleware, requireRole } from '../middleware/auth.ts';
import { upsertSeoSchema } from '@specialist/validation';
import { success, created, error, notFound } from '../lib/response.ts';

const router = new Hono();

router.use('*', authMiddleware, requireRole('admin', 'super_admin', 'content_manager'));

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

router.post('/', async (c) => {
  const body = await c.req.json();
  const parsed = upsertSeoSchema.safeParse(body);
  if (!parsed.success) {
    return error(
      c,
      'VALIDATION_ERROR',
      'Validation failed',
      422,
      parsed.error.issues.map((i) => ({ field: i.path.join('.'), message: i.message })),
    );
  }

  const [existing] = await db
    .select({ id: seoMetadata.id })
    .from(seoMetadata)
    .where(
      and(
        eq(seoMetadata.entityType, parsed.data.entityType),
        eq(seoMetadata.entityId, parsed.data.entityId),
      ),
    )
    .limit(1);

  if (existing) {
    const [updated] = await db
      .update(seoMetadata)
      .set(parsed.data)
      .where(eq(seoMetadata.id, existing.id))
      .returning();
    return success(c, updated, 'SEO metadata berhasil diperbarui');
  }

  const [created_item] = await db.insert(seoMetadata).values(parsed.data).returning();
  return created(c, created_item, 'SEO metadata berhasil dibuat');
});

router.patch('/:id', async (c) => {
  const id = c.req.param('id')!;
  const body = await c.req.json();
  const parsed = upsertSeoSchema.partial().safeParse(body);
  if (!parsed.success) {
    return error(
      c,
      'VALIDATION_ERROR',
      'Validation failed',
      422,
      parsed.error.issues.map((i) => ({ field: i.path.join('.'), message: i.message })),
    );
  }

  const [existing] = await db
    .select({ id: seoMetadata.id })
    .from(seoMetadata)
    .where(eq(seoMetadata.id, id))
    .limit(1);
  if (!existing) return notFound(c, 'SEO metadata tidak ditemukan');

  const [updated] = await db
    .update(seoMetadata)
    .set(parsed.data)
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
