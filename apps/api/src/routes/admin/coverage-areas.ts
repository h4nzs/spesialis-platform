import { Hono } from 'hono';
import { eq, and, asc, sql, isNull } from 'drizzle-orm';
import { db, coverageAreas } from '../../lib/db.ts';
import { authMiddleware, requireRole } from '../../middleware/auth.ts';
import { validateBody } from '../../middleware/validation.ts';
import { createCoverageAreaSchema, updateCoverageAreaSchema } from '@ahlipanggilan/validation';
import type { CreateCoverageAreaInput, UpdateCoverageAreaInput } from '@ahlipanggilan/validation';
import { success, created, notFound, serverError } from '../../lib/response.ts';
import { omitUndefined } from '../../lib/update.ts';

const router = new Hono();

router.get('/', authMiddleware, requireRole('admin', 'super_admin'), async (c) => {
  const items = await db
    .select()
    .from(coverageAreas)
    .orderBy(asc(coverageAreas.displayOrder), asc(coverageAreas.createdAt));

  return success(c, items);
});

router.get('/:id', authMiddleware, requireRole('admin', 'super_admin'), async (c) => {
  const id = c.req.param('id')!;
  const [item] = await db.select().from(coverageAreas).where(eq(coverageAreas.id, id)).limit(1);

  if (!item) return notFound(c, 'Area layanan tidak ditemukan');
  return success(c, item);
});

router.post(
  '/',
  authMiddleware,
  requireRole('admin', 'super_admin'),
  validateBody(createCoverageAreaSchema),
  async (c) => {
    const data = c.get('validated') as CreateCoverageAreaInput;

    const [created_item] = await db
      .insert(coverageAreas)
      .values({
        city: data.city,
        note: data.note ?? null,
        displayOrder: data.displayOrder ?? 0,
        isActive: data.isActive ?? 'true',
      })
      .returning();

    if (!created_item) return serverError(c, 'Gagal membuat area layanan');
    return created(c, created_item, 'Area layanan berhasil dibuat');
  },
);

router.patch(
  '/:id',
  authMiddleware,
  requireRole('admin', 'super_admin'),
  validateBody(updateCoverageAreaSchema),
  async (c) => {
    const id = c.req.param('id')!;
    const data = c.get('validated') as UpdateCoverageAreaInput;

    const [item] = await db
      .select({ id: coverageAreas.id })
      .from(coverageAreas)
      .where(eq(coverageAreas.id, id))
      .limit(1);
    if (!item) return notFound(c, 'Area layanan tidak ditemukan');

    const [updated] = await db
      .update(coverageAreas)
      .set(omitUndefined(data))
      .where(eq(coverageAreas.id, id))
      .returning();

    return success(c, updated, 'Area layanan berhasil diperbarui');
  },
);

router.delete('/:id', authMiddleware, requireRole('admin', 'super_admin'), async (c) => {
  const id = c.req.param('id')!;

  const [item] = await db
    .select({ id: coverageAreas.id })
    .from(coverageAreas)
    .where(eq(coverageAreas.id, id))
    .limit(1);
  if (!item) return notFound(c, 'Area layanan tidak ditemukan');

  await db.delete(coverageAreas).where(eq(coverageAreas.id, id));
  return success(c, null, 'Area layanan berhasil dihapus');
});

export { router as adminCoverageAreasRouter };
