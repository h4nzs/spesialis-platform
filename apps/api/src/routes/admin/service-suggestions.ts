import { Hono } from 'hono';
import { eq, desc, sql } from 'drizzle-orm';
import { db, serviceSuggestions } from '../../lib/db.ts';
import { authMiddleware, requireRole } from '../../middleware/auth.ts';
import { success, successPaginated, notFound } from '../../lib/response.ts';
import { buildPaginationMeta } from '../../lib/pagination.ts';
import { z } from 'zod';
import { validateBody } from '../../middleware/validation.ts';

const router = new Hono();

const updateSuggestionStatusSchema = z.object({
  status: z.enum(['pending', 'approved', 'rejected']),
});

// GET /admin/service-suggestions — list all suggestions
router.get('/', authMiddleware, requireRole('admin', 'super_admin'), async (c) => {
  const page = Number(c.req.query('page') ?? 1);
  const limit = Number(c.req.query('limit') ?? 50);
  const status = c.req.query('status'); // optional filter

  const conditions = status ? sql`${serviceSuggestions.status} = ${status}` : undefined;

  const items = await db
    .select()
    .from(serviceSuggestions)
    .where(conditions)
    .orderBy(desc(serviceSuggestions.createdAt))
    .limit(limit)
    .offset((page - 1) * limit);

  const countResult = await db
    .select({ count: sql<number>`count(*)` })
    .from(serviceSuggestions)
    .where(conditions);
  const total = Number(countResult[0]?.count ?? 0);
  const pagination = buildPaginationMeta(page, limit, total);

  return successPaginated(c, items, pagination);
});

// PATCH /admin/service-suggestions/:id/status — approve/reject
router.patch(
  '/:id/status',
  authMiddleware,
  requireRole('admin', 'super_admin'),
  validateBody(updateSuggestionStatusSchema),
  async (c) => {
    const id = c.req.param('id')!;
    const { status } = c.get('validated') as { status: string };

    const [item] = await db
      .select({ id: serviceSuggestions.id })
      .from(serviceSuggestions)
      .where(eq(serviceSuggestions.id, id))
      .limit(1);

    if (!item) return notFound(c, 'Usulan tidak ditemukan');

    const [updated] = await db
      .update(serviceSuggestions)
      .set({
        status,
        updatedAt: new Date(),
      })
      .where(eq(serviceSuggestions.id, id))
      .returning();

    return success(
      c,
      updated,
      `Usulan berhasil ${status === 'approved' ? 'disetujui' : 'ditolak'}`,
    );
  },
);

// DELETE /admin/service-suggestions/:id — hapus usulan
router.delete('/:id', authMiddleware, requireRole('admin', 'super_admin'), async (c) => {
  const id = c.req.param('id')!;

  const [item] = await db
    .select({ id: serviceSuggestions.id })
    .from(serviceSuggestions)
    .where(eq(serviceSuggestions.id, id))
    .limit(1);

  if (!item) return notFound(c, 'Usulan tidak ditemukan');

  await db.delete(serviceSuggestions).where(eq(serviceSuggestions.id, id));
  return success(c, null, 'Usulan berhasil dihapus');
});

export { router as adminServiceSuggestionsRouter };
