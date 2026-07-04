import { Hono } from 'hono';
import { cms } from '../lib/cms.ts';
import { success, error } from '../lib/response.ts';

const cmsRouter = new Hono();

cmsRouter.get('/faq', async (c) => {
  try {
    const items = await cms.faq.list();
    return success(c, items);
  } catch {
    return error(c, 'CMS_ERROR', 'Gagal memuat FAQ');
  }
});

cmsRouter.get('/articles', async (c) => {
  try {
    const status = c.req.query('status') ?? 'published';
    const limit = Number(c.req.query('limit')) || 50;
    const items = await cms.articles.list({ status, limit });
    return success(c, items);
  } catch {
    return error(c, 'CMS_ERROR', 'Gagal memuat artikel');
  }
});

cmsRouter.get('/articles/:slug', async (c) => {
  try {
    const slug = c.req.param('slug');
    const items = await cms.articles.bySlug(slug);
    if (!items[0]) return error(c, 'NOT_FOUND', 'Artikel tidak ditemukan');
    return success(c, items[0]);
  } catch {
    return error(c, 'NOT_FOUND', 'Artikel tidak ditemukan');
  }
});

cmsRouter.get('/homepage-sections', async (c) => {
  try {
    const items = await cms.homepageSections.list();
    return success(c, items);
  } catch {
    return error(c, 'CMS_ERROR', 'Gagal memuat homepage sections');
  }
});

cmsRouter.get('/pages/:slug', async (c) => {
  try {
    const slug = c.req.param('slug');
    const items = await cms.pages.bySlug(slug);
    if (!items[0]) return error(c, 'NOT_FOUND', 'Halaman tidak ditemukan');
    return success(c, items[0]);
  } catch {
    return error(c, 'NOT_FOUND', 'Halaman tidak ditemukan');
  }
});

export { cmsRouter };
