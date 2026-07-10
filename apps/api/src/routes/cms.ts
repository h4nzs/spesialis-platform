import { Hono } from 'hono';
import { eq, and, desc, asc, isNull } from 'drizzle-orm';
import { db, articles, articleCategories, faq, cmsPages } from '../lib/db.ts';
import { success } from '../lib/response.ts';
import { cmsCache } from '../lib/cache.ts';

const cmsRouter = new Hono();

// Set Cache-Control header on all successful CMS responses
cmsRouter.use('*', async (c, next) => {
  await next();
  if (c.res.status >= 200 && c.res.status < 400) {
    c.header('Cache-Control', 'public, max-age=60, stale-while-revalidate=30');
  }
});

cmsRouter.get('/faq', async (c) => {
  const cacheKey = 'cms:faq';
  const cached = cmsCache.get(cacheKey);
  if (cached.hit) return success(c, cached.data);

  try {
    const items = await db
      .select({
        id: faq.id,
        question: faq.question,
        answer: faq.answer,
        category: faq.category,
        sort: faq.displayOrder,
      })
      .from(faq)
      .where(eq(faq.isActive, 'true'))
      .orderBy(asc(faq.displayOrder));

    cmsCache.set(cacheKey, items);
    return success(c, items);
  } catch {
    return success(c, []);
  }
});

cmsRouter.get('/articles', async (c) => {
  const limit = Number(c.req.query('limit')) || 50;
  const cacheKey = `cms:articles:limit:${limit}`;
  const cached = cmsCache.get(cacheKey);
  if (cached.hit) return success(c, cached.data);

  try {
    const items = await db
      .select({
        id: articles.id,
        title: articles.title,
        slug: articles.slug,
        summary: articles.summary,
        cover_image: articles.coverImage,
        category: articleCategories.name,
        author: articles.authorName,
        tags: articles.tags,
        published_at: articles.publishedAt,
      })
      .from(articles)
      .leftJoin(articleCategories, eq(articles.categoryId, articleCategories.id))
      .where(and(eq(articles.status, 'Published'), isNull(articles.deletedAt)))
      .orderBy(desc(articles.publishedAt))
      .limit(limit);

    cmsCache.set(cacheKey, items);
    return success(c, items);
  } catch {
    return success(c, []);
  }
});

cmsRouter.get('/articles/:slug', async (c) => {
  const slug = c.req.param('slug')!;
  const cacheKey = `cms:articles:slug:${slug}`;
  const cached = cmsCache.get(cacheKey);
  if (cached.hit) return success(c, cached.data);

  try {
    const [item] = await db
      .select({
        id: articles.id,
        title: articles.title,
        slug: articles.slug,
        summary: articles.summary,
        content: articles.content,
        cover_image: articles.coverImage,
        category: articleCategories.name,
        author: articles.authorName,
        tags: articles.tags,
        meta_title: articles.metaTitle,
        meta_description: articles.metaDescription,
        og_title: articles.ogTitle,
        og_description: articles.ogDescription,
        og_image: articles.ogImage,
        canonical_url: articles.canonicalUrl,
        published_at: articles.publishedAt,
        date_created: articles.createdAt,
        date_updated: articles.updatedAt,
      })
      .from(articles)
      .leftJoin(articleCategories, eq(articles.categoryId, articleCategories.id))
      .where(
        and(eq(articles.slug, slug), eq(articles.status, 'Published'), isNull(articles.deletedAt)),
      )
      .limit(1);

    cmsCache.set(cacheKey, item ?? null);
    return success(c, item ?? null);
  } catch {
    return success(c, null);
  }
});

cmsRouter.get('/pages/:slug', async (c) => {
  const slug = c.req.param('slug')!;
  const cacheKey = `cms:pages:slug:${slug}`;
  const cached = cmsCache.get(cacheKey);
  if (cached.hit) return success(c, cached.data);

  try {
    const [item] = await db
      .select({
        id: cmsPages.id,
        title: cmsPages.title,
        slug: cmsPages.slug,
        content: cmsPages.content,
        meta: cmsPages.meta,
      })
      .from(cmsPages)
      .where(
        and(eq(cmsPages.slug, slug), eq(cmsPages.status, 'Published'), isNull(cmsPages.deletedAt)),
      )
      .limit(1);

    cmsCache.set(cacheKey, item ?? null);
    return success(c, item ?? null);
  } catch {
    return success(c, null);
  }
});

export { cmsRouter };
