import { Hono } from 'hono';
import { eq, and, or, desc, sql, ilike } from 'drizzle-orm';
import { db, redirects } from '../../lib/db.ts';
import { authMiddleware } from '../../middleware/auth.ts';
import { requirePermission } from '../../middleware/seo-permissions.ts';
import { validateBody } from '../../middleware/validation.ts';
import { createRedirectSchema, updateRedirectSchema } from '@specialist/validation';
import type { CreateRedirectInput, UpdateRedirectInput } from '@specialist/validation';
import { success, successPaginated, created, notFound } from '../../lib/response.ts';
import { buildPaginationMeta } from '../../lib/pagination.ts';
import { omitUndefined } from '../../lib/update.ts';

const router = new Hono();

router.use('*', authMiddleware);
router.use('*', requirePermission('seo.redirects'));

router.get('/', async (c) => {
  const page = Number(c.req.query('page') ?? 1);
  const limit = Number(c.req.query('limit') ?? 20);
  const search = c.req.query('search');

  const searchCondition = search
    ? or(ilike(redirects.sourcePath, `%${search}%`), ilike(redirects.targetPath, `%${search}%`))
    : undefined;

  const items = await db
    .select()
    .from(redirects)
    .where(searchCondition)
    .orderBy(desc(redirects.createdAt))
    .limit(limit)
    .offset((page - 1) * limit);

  const countResult = await db
    .select({ count: sql<number>`count(*)` })
    .from(redirects)
    .where(searchCondition);
  const total = Number(countResult[0]?.count ?? 0);
  const pagination = buildPaginationMeta(page, limit, total);

  return successPaginated(c, items, pagination);
});

router.get('/:id', async (c) => {
  const id = c.req.param('id')!;

  const [item] = await db.select().from(redirects).where(eq(redirects.id, id)).limit(1);

  if (!item) return notFound(c, 'Redirect tidak ditemukan');
  return success(c, item);
});

router.post('/', validateBody(createRedirectSchema), async (c) => {
  const data = c.get('validated') as CreateRedirectInput;

  // Check for duplicate source path
  const [existing] = await db
    .select({ id: redirects.id })
    .from(redirects)
    .where(eq(redirects.sourcePath, data.sourcePath))
    .limit(1);
  if (existing) {
    return c.json(
      { success: false, code: 'DUPLICATE_SOURCE', message: 'Source path sudah digunakan' },
      409,
    );
  }

  const [created_item] = await db
    .insert(redirects)
    .values({
      sourcePath: data.sourcePath,
      targetPath: data.targetPath,
      statusCode: data.statusCode,
      isActive: data.isActive,
      notes: data.notes ?? null,
    })
    .returning();

  return created(c, created_item, 'Redirect berhasil dibuat');
});

router.patch('/:id', validateBody(updateRedirectSchema), async (c) => {
  const id = c.req.param('id')!;
  const data = c.get('validated') as UpdateRedirectInput;

  const [existing] = await db
    .select({ id: redirects.id })
    .from(redirects)
    .where(eq(redirects.id, id))
    .limit(1);
  if (!existing) return notFound(c, 'Redirect tidak ditemukan');

  // Check for duplicate source path if changing
  if (data.sourcePath) {
    const [dup] = await db
      .select({ id: redirects.id })
      .from(redirects)
      .where(and(eq(redirects.sourcePath, data.sourcePath), sql`${redirects.id} != ${id}`))
      .limit(1);
    if (dup) {
      return c.json(
        {
          success: false,
          code: 'DUPLICATE_SOURCE',
          message: 'Source path sudah digunakan oleh redirect lain',
        },
        409,
      );
    }
  }

  const [updated] = await db
    .update(redirects)
    .set({
      ...omitUndefined(data),
      updatedAt: new Date(),
    })
    .where(eq(redirects.id, id))
    .returning();

  return success(c, updated, 'Redirect berhasil diperbarui');
});

router.delete('/:id', async (c) => {
  const id = c.req.param('id')!;

  const [existing] = await db
    .select({ id: redirects.id })
    .from(redirects)
    .where(eq(redirects.id, id))
    .limit(1);
  if (!existing) return notFound(c, 'Redirect tidak ditemukan');

  await db.delete(redirects).where(eq(redirects.id, id));
  return success(c, null, 'Redirect berhasil dihapus');
});

export { router as adminRedirectsRouter };
