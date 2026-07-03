import { Hono } from 'hono';
import { eq, and, desc, sql, isNull } from 'drizzle-orm';
import type { PaginationMeta } from '@specialist/types';
import { db, articles, articleCategories } from '../lib/db.ts';
import { successPaginated } from '../lib/response.ts';

const router = new Hono();

router.get('/', async (c) => {
  const page = Number(c.req.query('page') ?? 1);
  const limit = Number(c.req.query('limit') ?? 20);
  const category = c.req.query('category');

  const conditions = and(
    eq(articles.status, 'Published'),
    isNull(articles.deletedAt),
    category ? eq(articleCategories.slug, category) : undefined,
  );

  const items = await db
    .select({
      id: articles.id,
      categoryId: articles.categoryId,
      categoryName: articleCategories.name,
      categorySlug: articleCategories.slug,
      title: articles.title,
      slug: articles.slug,
      summary: articles.summary,
      coverImage: articles.coverImage,
      authorName: articles.authorName,
      publishedAt: articles.publishedAt,
    })
    .from(articles)
    .leftJoin(articleCategories, eq(articles.categoryId, articleCategories.id))
    .where(conditions)
    .orderBy(desc(articles.publishedAt))
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
});

router.get('/categories', async (c) => {
  const items = await db
    .select({
      id: articleCategories.id,
      name: articleCategories.name,
      slug: articleCategories.slug,
      description: articleCategories.description,
    })
    .from(articleCategories)
    .orderBy(articleCategories.displayOrder);

  return c.json({ data: items });
});

router.get('/:slug', async (c) => {
  const slug = c.req.param('slug')!;

  const [article] = await db
    .select({
      id: articles.id,
      categoryId: articles.categoryId,
      categoryName: articleCategories.name,
      categorySlug: articleCategories.slug,
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
    .where(
      and(eq(articles.slug, slug), eq(articles.status, 'Published'), isNull(articles.deletedAt)),
    )
    .limit(1);

  if (!article) {
    return c.json({ error: 'Artikel tidak ditemukan', status: 404 }, 404);
  }

  return c.json({ data: article });
});

export { router as articlesRouter };
