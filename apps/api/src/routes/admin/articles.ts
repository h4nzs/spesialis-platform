import { Hono } from 'hono';
import { eq, and, asc, desc, sql, isNull } from 'drizzle-orm';
import { db, articles, articleCategories } from '../../lib/db.ts';
import { authMiddleware, requireRole } from '../../middleware/auth.ts';
import { validateBody } from '../../middleware/validation.ts';
import {
  createArticleSchema,
  updateArticleSchema,
  createArticleCategorySchema,
  updateArticleCategorySchema,
} from '@ahlipanggilan/validation';
import type {
  CreateArticleCategoryInput,
  UpdateArticleCategoryInput,
  CreateArticleInput,
  UpdateArticleInput,
} from '@ahlipanggilan/validation';
import {
  success,
  created,
  error,
  notFound,
  serverError,
  successPaginated,
} from '../../lib/response.ts';
import { buildPaginationMeta } from '../../lib/pagination.ts';
import { omitUndefined } from '../../lib/update.ts';
import { notifyArticlePublished } from '../../lib/indexnow.ts';
import { invalidateCollectionCache } from '../../lib/cache.ts';

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
  validateBody(createArticleCategorySchema),
  async (c) => {
    const data = c.get('validated') as CreateArticleCategoryInput;

    const [existing] = await db
      .select({ id: articleCategories.id })
      .from(articleCategories)
      .where(eq(articleCategories.slug, data.slug))
      .limit(1);
    if (existing) return error(c, 'SLUG_EXISTS', 'Slug sudah digunakan', 409);

    const [created_category] = await db
      .insert(articleCategories)
      .values({
        name: data.name,
        slug: data.slug,
        description: data.description ?? null,
        displayOrder: data.displayOrder ?? 0,
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
  validateBody(updateArticleCategorySchema),
  async (c) => {
    const id = c.req.param('id')!;
    const data = c.get('validated') as UpdateArticleCategoryInput;

    const [category] = await db
      .select({ id: articleCategories.id })
      .from(articleCategories)
      .where(eq(articleCategories.id, id))
      .limit(1);
    if (!category) return notFound(c, 'Kategori tidak ditemukan');

    if (data.slug) {
      const [existing] = await db
        .select({ id: articleCategories.id })
        .from(articleCategories)
        .where(and(eq(articleCategories.slug, data.slug), sql`${articleCategories.id} != ${id}`))
        .limit(1);
      if (existing) return error(c, 'SLUG_EXISTS', 'Slug sudah digunakan', 409);
    }

    const [updated] = await db
      .update(articleCategories)
      .set(omitUndefined(data))
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
        content: articles.content,
        coverImage: articles.coverImage,
        authorName: articles.authorName,
        status: articles.status,
        isFeatured: articles.isFeatured,
        tags: articles.tags,
        metaTitle: articles.metaTitle,
        metaDescription: articles.metaDescription,
        ogTitle: articles.ogTitle,
        ogDescription: articles.ogDescription,
        ogImage: articles.ogImage,
        canonicalUrl: articles.canonicalUrl,
        robots: articles.robots,
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
    const pagination = buildPaginationMeta(page, limit, total);

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
        tags: articles.tags,
        metaTitle: articles.metaTitle,
        metaDescription: articles.metaDescription,
        ogTitle: articles.ogTitle,
        ogDescription: articles.ogDescription,
        ogImage: articles.ogImage,
        canonicalUrl: articles.canonicalUrl,
        robots: articles.robots,
        schemaJson: articles.schemaJson,
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
  validateBody(createArticleSchema),
  async (c) => {
    const data = c.get('validated') as CreateArticleInput;

    const [existing] = await db
      .select({ id: articles.id })
      .from(articles)
      .where(eq(articles.slug, data.slug))
      .limit(1);
    if (existing) return error(c, 'SLUG_EXISTS', 'Slug sudah digunakan', 409);

    const now = new Date();
    const isPublished = data.status === 'Published';

    const [created_article] = await db
      .insert(articles)
      .values({
        categoryId: data.categoryId ?? null,
        title: data.title,
        slug: data.slug,
        summary: data.summary ?? null,
        content: data.content ?? null,
        coverImage: data.coverImage ?? null,
        authorName: data.authorName ?? null,
        status: data.status ?? 'Draft',
        isFeatured: data.isFeatured ?? false,
        tags: data.tags ?? [],
        metaTitle: data.metaTitle ?? null,
        metaDescription: data.metaDescription ?? null,
        ogTitle: data.ogTitle ?? null,
        ogDescription: data.ogDescription ?? null,
        ogImage: data.ogImage ?? null,
        canonicalUrl: data.canonicalUrl ?? null,
        robots: data.robots ?? 'index, follow',
        schemaJson: data.schemaJson ?? null,
        publishedAt: isPublished ? now : null,
      })
      .returning();

    if (!created_article) return serverError(c, 'Gagal membuat artikel');

    // Ping IndexNow for newly published article
    if (isPublished && created_article.slug) {
      notifyArticlePublished(created_article.slug).catch(() => {});
    }

    // Invalidate CMS cache so public endpoints reflect the new article
    invalidateCollectionCache('cms_articles');

    return created(c, created_article, 'Artikel berhasil dibuat');
  },
);

router.patch(
  '/:id',
  authMiddleware,
  requireRole('admin', 'super_admin', 'content_manager'),
  validateBody(updateArticleSchema),
  async (c) => {
    const id = c.req.param('id')!;
    const data = c.get('validated') as UpdateArticleInput;

    const [article] = await db
      .select({ id: articles.id, status: articles.status, publishedAt: articles.publishedAt })
      .from(articles)
      .where(eq(articles.id, id))
      .limit(1);
    if (!article) return notFound(c, 'Artikel tidak ditemukan');

    if (data.slug) {
      const [existing] = await db
        .select({ id: articles.id })
        .from(articles)
        .where(and(eq(articles.slug, data.slug), sql`${articles.id} != ${id}`))
        .limit(1);
      if (existing) return error(c, 'SLUG_EXISTS', 'Slug sudah digunakan', 409);
    }

    const updateData = omitUndefined({
      categoryId: data.categoryId,
      title: data.title,
      slug: data.slug,
      summary: data.summary,
      content: data.content,
      coverImage: data.coverImage,
      authorName: data.authorName,
      isFeatured: data.isFeatured,
      tags: data.tags,
      metaTitle: data.metaTitle,
      metaDescription: data.metaDescription,
      ogTitle: data.ogTitle,
      ogDescription: data.ogDescription,
      ogImage: data.ogImage,
      canonicalUrl: data.canonicalUrl,
      robots: data.robots,
      schemaJson: data.schemaJson,
    });

    if (data.status !== undefined) {
      updateData.status = data.status;
      if (data.status === 'Published' && article.status !== 'Published') {
        updateData.publishedAt = new Date();
      }
    }

    const [updated] = await db
      .update(articles)
      .set(updateData)
      .where(eq(articles.id, id))
      .returning();

    // Ping IndexNow if article was just published
    if (data.status === 'Published' && article.status !== 'Published' && updated?.slug) {
      notifyArticlePublished(updated.slug).catch(() => {});
    }

    // Invalidate CMS cache — content or status may have changed
    invalidateCollectionCache('cms_articles');

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

  // Invalidate CMS cache after deletion
  invalidateCollectionCache('cms_articles');

  return success(c, null, 'Artikel berhasil dihapus');
});

export { router as adminArticlesRouter };
