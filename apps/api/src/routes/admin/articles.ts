import { Hono } from 'hono';
import { eq, and, asc, desc, sql, isNull } from 'drizzle-orm';
import { db, articles, articleCategories } from '../../lib/db.ts';
import { authMiddleware, requireRole } from '../../middleware/auth.ts';
import {
  createArticleSchema,
  updateArticleSchema,
  createArticleCategorySchema,
  updateArticleCategorySchema,
} from '@specialist/validation';
import {
  success,
  created,
  error,
  notFound,
  serverError,
  successPaginated,
} from '../../lib/response.ts';
import type { PaginationMeta } from '@specialist/types';

const router = new Hono();

router.get(
  '/categories',
  authMiddleware,
  requireRole('admin', 'super_admin', 'content_manager'),
  async (c) => {
    const items = await db
      .select()
      .from(articleCategories)
      .orderBy(asc(articleCategories.displayOrder));

    return c.json({ data: items });
  },
);

router.post(
  '/categories',
  authMiddleware,
  requireRole('admin', 'super_admin', 'content_manager'),
  async (c) => {
    const body = await c.req.json();
    const parsed = createArticleCategorySchema.safeParse(body);
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
      .select({ id: articleCategories.id })
      .from(articleCategories)
      .where(eq(articleCategories.slug, parsed.data.slug))
      .limit(1);
    if (existing) return error(c, 'SLUG_EXISTS', 'Slug sudah digunakan', 409);

    const [created_category] = await db
      .insert(articleCategories)
      .values({
        name: parsed.data.name,
        slug: parsed.data.slug,
        description: parsed.data.description ?? null,
        displayOrder: parsed.data.displayOrder ?? 0,
      })
      .returning();

    if (!created_category) return serverError(c, 'Gagal membuat kategori');
    return created(c, created_category, 'Kategori berhasil dibuat');
  },
);

router.patch(
  '/categories/:id',
  authMiddleware,
  requireRole('admin', 'super_admin', 'content_manager'),
  async (c) => {
    const id = c.req.param('id')!;
    const body = await c.req.json();
    const parsed = updateArticleCategorySchema.safeParse(body);
    if (!parsed.success) {
      return error(
        c,
        'VALIDATION_ERROR',
        'Validation failed',
        422,
        parsed.error.issues.map((i) => ({ field: i.path.join('.'), message: i.message })),
      );
    }

    const [category] = await db
      .select({ id: articleCategories.id })
      .from(articleCategories)
      .where(eq(articleCategories.id, id))
      .limit(1);
    if (!category) return notFound(c, 'Kategori tidak ditemukan');

    if (parsed.data.slug) {
      const [existing] = await db
        .select({ id: articleCategories.id })
        .from(articleCategories)
        .where(
          and(eq(articleCategories.slug, parsed.data.slug), sql`${articleCategories.id} != ${id}`),
        )
        .limit(1);
      if (existing) return error(c, 'SLUG_EXISTS', 'Slug sudah digunakan', 409);
    }

    const updateData: Record<string, unknown> = {};
    if (parsed.data.name !== undefined) updateData.name = parsed.data.name;
    if (parsed.data.slug !== undefined) updateData.slug = parsed.data.slug;
    if (parsed.data.description !== undefined) updateData.description = parsed.data.description;
    if (parsed.data.displayOrder !== undefined) updateData.displayOrder = parsed.data.displayOrder;

    const [updated] = await db
      .update(articleCategories)
      .set(updateData)
      .where(eq(articleCategories.id, id))
      .returning();

    return success(c, updated, 'Kategori berhasil diperbarui');
  },
);

router.delete('/categories/:id', authMiddleware, requireRole('admin', 'super_admin'), async (c) => {
  const id = c.req.param('id')!;

  const [category] = await db
    .select({ id: articleCategories.id })
    .from(articleCategories)
    .where(eq(articleCategories.id, id))
    .limit(1);
  if (!category) return notFound(c, 'Kategori tidak ditemukan');

  await db.delete(articleCategories).where(eq(articleCategories.id, id));
  return success(c, null, 'Kategori berhasil dihapus');
});

router.get(
  '/',
  authMiddleware,
  requireRole('admin', 'super_admin', 'content_manager'),
  async (c) => {
    const page = Number(c.req.query('page') ?? 1);
    const limit = Number(c.req.query('limit') ?? 50);
    const status = c.req.query('status');

    const conditions = and(
      isNull(articles.deletedAt),
      status ? eq(articles.status, status) : undefined,
    );

    const items = await db
      .select({
        id: articles.id,
        categoryId: articles.categoryId,
        categoryName: articleCategories.name,
        title: articles.title,
        slug: articles.slug,
        summary: articles.summary,
        authorName: articles.authorName,
        status: articles.status,
        isFeatured: articles.isFeatured,
        publishedAt: articles.publishedAt,
        createdAt: articles.createdAt,
        updatedAt: articles.updatedAt,
      })
      .from(articles)
      .leftJoin(articleCategories, eq(articles.categoryId, articleCategories.id))
      .where(conditions)
      .orderBy(desc(articles.createdAt))
      .limit(limit)
      .offset((page - 1) * limit);

    const countResult = await db
      .select({ count: sql<number>`count(*)` })
      .from(articles)
      .where(conditions);
    const total = Number(countResult[0]?.count ?? 0);
    const totalPages = Math.ceil(total / limit);

    const pagination: PaginationMeta = {
      page,
      limit,
      total,
      totalPages,
      hasNext: page < totalPages,
      hasPrev: page > 1,
    };

    return successPaginated(c, items, pagination);
  },
);

router.get(
  '/:id',
  authMiddleware,
  requireRole('admin', 'super_admin', 'content_manager'),
  async (c) => {
    const id = c.req.param('id')!;

    const [article] = await db
      .select({
        id: articles.id,
        categoryId: articles.categoryId,
        categoryName: articleCategories.name,
        title: articles.title,
        slug: articles.slug,
        summary: articles.summary,
        content: articles.content,
        coverImage: articles.coverImage,
        authorName: articles.authorName,
        status: articles.status,
        isFeatured: articles.isFeatured,
        publishedAt: articles.publishedAt,
        createdAt: articles.createdAt,
        updatedAt: articles.updatedAt,
      })
      .from(articles)
      .leftJoin(articleCategories, eq(articles.categoryId, articleCategories.id))
      .where(eq(articles.id, id))
      .limit(1);

    if (!article) return notFound(c, 'Artikel tidak ditemukan');
    return success(c, article);
  },
);

router.post(
  '/',
  authMiddleware,
  requireRole('admin', 'super_admin', 'content_manager'),
  async (c) => {
    const body = await c.req.json();
    const parsed = createArticleSchema.safeParse(body);
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
      .select({ id: articles.id })
      .from(articles)
      .where(eq(articles.slug, parsed.data.slug))
      .limit(1);
    if (existing) return error(c, 'SLUG_EXISTS', 'Slug sudah digunakan', 409);

    const now = new Date();
    const isPublished = parsed.data.status === 'Published';

    const [created_article] = await db
      .insert(articles)
      .values({
        categoryId: parsed.data.categoryId ?? null,
        title: parsed.data.title,
        slug: parsed.data.slug,
        summary: parsed.data.summary ?? null,
        content: parsed.data.content ?? null,
        coverImage: parsed.data.coverImage ?? null,
        authorName: parsed.data.authorName ?? null,
        status: parsed.data.status ?? 'Draft',
        isFeatured: parsed.data.isFeatured ?? false,
        publishedAt: isPublished ? now : null,
      })
      .returning();

    if (!created_article) return serverError(c, 'Gagal membuat artikel');
    return created(c, created_article, 'Artikel berhasil dibuat');
  },
);

router.patch(
  '/:id',
  authMiddleware,
  requireRole('admin', 'super_admin', 'content_manager'),
  async (c) => {
    const id = c.req.param('id')!;
    const body = await c.req.json();
    const parsed = updateArticleSchema.safeParse(body);
    if (!parsed.success) {
      return error(
        c,
        'VALIDATION_ERROR',
        'Validation failed',
        422,
        parsed.error.issues.map((i) => ({ field: i.path.join('.'), message: i.message })),
      );
    }

    const [article] = await db
      .select({ id: articles.id, status: articles.status, publishedAt: articles.publishedAt })
      .from(articles)
      .where(eq(articles.id, id))
      .limit(1);
    if (!article) return notFound(c, 'Artikel tidak ditemukan');

    if (parsed.data.slug) {
      const [existing] = await db
        .select({ id: articles.id })
        .from(articles)
        .where(and(eq(articles.slug, parsed.data.slug), sql`${articles.id} != ${id}`))
        .limit(1);
      if (existing) return error(c, 'SLUG_EXISTS', 'Slug sudah digunakan', 409);
    }

    const updateData: Record<string, unknown> = {};
    if (parsed.data.categoryId !== undefined) updateData.categoryId = parsed.data.categoryId;
    if (parsed.data.title !== undefined) updateData.title = parsed.data.title;
    if (parsed.data.slug !== undefined) updateData.slug = parsed.data.slug;
    if (parsed.data.summary !== undefined) updateData.summary = parsed.data.summary;
    if (parsed.data.content !== undefined) updateData.content = parsed.data.content;
    if (parsed.data.coverImage !== undefined) updateData.coverImage = parsed.data.coverImage;
    if (parsed.data.authorName !== undefined) updateData.authorName = parsed.data.authorName;
    if (parsed.data.isFeatured !== undefined) updateData.isFeatured = parsed.data.isFeatured;

    if (parsed.data.status !== undefined) {
      updateData.status = parsed.data.status;
      if (parsed.data.status === 'Published' && article.status !== 'Published') {
        updateData.publishedAt = new Date();
      }
    }

    const [updated] = await db
      .update(articles)
      .set(updateData)
      .where(eq(articles.id, id))
      .returning();

    return success(c, updated, 'Artikel berhasil diperbarui');
  },
);

router.delete('/:id', authMiddleware, requireRole('admin', 'super_admin'), async (c) => {
  const id = c.req.param('id')!;

  const [article] = await db
    .select({ id: articles.id })
    .from(articles)
    .where(eq(articles.id, id))
    .limit(1);
  if (!article) return notFound(c, 'Artikel tidak ditemukan');

  await db.update(articles).set({ deletedAt: new Date() }).where(eq(articles.id, id));
  return success(c, null, 'Artikel berhasil dihapus');
});

export { router as adminArticlesRouter };
