import { Hono } from 'hono';
import { eq, asc } from 'drizzle-orm';
import { db, homepageSections } from '../../lib/db.ts';
import { authMiddleware, requireRole } from '../../middleware/auth.ts';
import { validateBody } from '../../middleware/validation.ts';
import {
  createHomepageSectionSchema,
  updateHomepageSectionSchema,
  reorderHomepageSectionsSchema,
} from '@specialist/validation';
import type {
  CreateHomepageSectionInput,
  UpdateHomepageSectionInput,
  ReorderHomepageSectionsInput,
} from '@specialist/validation';
import { success, created, notFound, serverError } from '../../lib/response.ts';
import { omitUndefined } from '../../lib/update.ts';

const router = new Hono();

router.get(
  '/',
  authMiddleware,
  requireRole('admin', 'super_admin', 'content_manager'),
  async (c) => {
    const items = await db.select().from(homepageSections).orderBy(asc(homepageSections.sortOrder));

    return success(c, items);
  },
);

router.get(
  '/:id',
  authMiddleware,
  requireRole('admin', 'super_admin', 'content_manager'),
  async (c) => {
    const id = c.req.param('id')!;

    const [section] = await db
      .select()
      .from(homepageSections)
      .where(eq(homepageSections.id, id))
      .limit(1);

    if (!section) return notFound(c, 'Section tidak ditemukan');
    return success(c, section);
  },
);

router.post(
  '/',
  authMiddleware,
  requireRole('admin', 'super_admin', 'content_manager'),
  validateBody(createHomepageSectionSchema),
  async (c) => {
    const data = c.get('validated') as CreateHomepageSectionInput;

    const [record] = await db
      .insert(homepageSections)
      .values({
        sectionType: data.sectionType,
        title: data.title ?? null,
        content: data.content ?? null,
        imageMediaId: data.imageMediaId ?? null,
        sortOrder: data.sortOrder ?? 0,
        isActive: data.isActive ?? true,
      })
      .returning();

    if (!record) return serverError(c, 'Gagal membuat section');
    return created(c, record, 'Section berhasil dibuat');
  },
);

router.patch(
  '/:id',
  authMiddleware,
  requireRole('admin', 'super_admin', 'content_manager'),
  validateBody(updateHomepageSectionSchema),
  async (c) => {
    const id = c.req.param('id')!;
    const data = c.get('validated') as UpdateHomepageSectionInput;

    const [section] = await db
      .select({ id: homepageSections.id })
      .from(homepageSections)
      .where(eq(homepageSections.id, id))
      .limit(1);
    if (!section) return notFound(c, 'Section tidak ditemukan');

    const [record] = await db
      .update(homepageSections)
      .set(omitUndefined(data))
      .where(eq(homepageSections.id, id))
      .returning();

    return success(c, record, 'Section berhasil diperbarui');
  },
);

router.post(
  '/reorder',
  authMiddleware,
  requireRole('admin', 'super_admin', 'content_manager'),
  validateBody(reorderHomepageSectionsSchema),
  async (c) => {
    const data = c.get('validated') as ReorderHomepageSectionsInput;

    for (const item of data.items) {
      await db
        .update(homepageSections)
        .set({ sortOrder: item.sortOrder })
        .where(eq(homepageSections.id, item.id));
    }

    return success(c, null, 'Urutan berhasil diperbarui');
  },
);

router.delete('/:id', authMiddleware, requireRole('admin', 'super_admin'), async (c) => {
  const id = c.req.param('id')!;

  const [section] = await db
    .select({ id: homepageSections.id })
    .from(homepageSections)
    .where(eq(homepageSections.id, id))
    .limit(1);
  if (!section) return notFound(c, 'Section tidak ditemukan');

  await db.delete(homepageSections).where(eq(homepageSections.id, id));
  return success(c, null, 'Section berhasil dihapus');
});

export { router as adminHomepageSectionsRouter };
