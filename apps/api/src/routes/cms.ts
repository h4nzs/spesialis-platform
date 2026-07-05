import { Hono } from 'hono';
import { eq, and, asc, desc, isNull } from 'drizzle-orm';
import { db, faq, articles, articleCategories } from '../lib/db.ts';
import { success } from '../lib/response.ts';

const cmsRouter = new Hono();

cmsRouter.get('/faq', async (c) => {
  try {
    const category = c.req.query('category');
    const conditions = and(
      eq(faq.isActive, 'true'),
      isNull(faq.deletedAt),
      category ? eq(faq.category, category) : undefined,
    );
    const items = await db
      .select({
        id: faq.id,
        question: faq.question,
        answer: faq.answer,
        category: faq.category,
        displayOrder: faq.displayOrder,
      })
      .from(faq)
      .where(conditions)
      .orderBy(asc(faq.displayOrder));
    return success(c, items);
  } catch {
    return success(c, []);
  }
});

cmsRouter.get('/articles', async (c) => {
  try {
    const limit = Number(c.req.query('limit')) || 50;
    const items = await db
      .select({
        id: articles.id,
        title: articles.title,
        slug: articles.slug,
        summary: articles.summary,
        coverImage: articles.coverImage,
        authorName: articles.authorName,
        categoryName: articleCategories.name,
        categorySlug: articleCategories.slug,
        publishedAt: articles.publishedAt,
      })
      .from(articles)
      .leftJoin(articleCategories, eq(articles.categoryId, articleCategories.id))
      .where(and(eq(articles.status, 'Published'), isNull(articles.deletedAt)))
      .orderBy(desc(articles.publishedAt))
      .limit(limit);
    return success(c, items);
  } catch {
    return success(c, []);
  }
});

cmsRouter.get('/articles/:slug', async (c) => {
  try {
    const slug = c.req.param('slug');
    const [item] = await db
      .select({
        id: articles.id,
        title: articles.title,
        slug: articles.slug,
        summary: articles.summary,
        content: articles.content,
        coverImage: articles.coverImage,
        authorName: articles.authorName,
        categoryName: articleCategories.name,
        categorySlug: articleCategories.slug,
        publishedAt: articles.publishedAt,
      })
      .from(articles)
      .leftJoin(articleCategories, eq(articles.categoryId, articleCategories.id))
      .where(
        and(eq(articles.slug, slug), eq(articles.status, 'Published'), isNull(articles.deletedAt)),
      )
      .limit(1);
    if (!item) return success(c, null);
    return success(c, item);
  } catch {
    return success(c, null);
  }
});

cmsRouter.get('/homepage-sections', async (c) => {
  return success(c, []);
});

cmsRouter.get('/pages/:slug', async (c) => {
  return success(c, null);
});

export { cmsRouter };
