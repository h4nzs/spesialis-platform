import { Hono } from 'hono';
import { eq } from 'drizzle-orm';
import { db, systemSettings } from '../lib/db.ts';
import { success } from '../lib/response.ts';

const router = new Hono();

/**
 * Public endpoint returning sitemap priority/changefreq configuration.
 * No auth required — used by the public sitemap.xml at build/request time.
 */
router.get('/', async (c) => {
  const items = await db
    .select()
    .from(systemSettings)
    .where(eq(systemSettings.category, 'sitemap'));

  const config: Record<string, string> = {};
  for (const item of items) {
    config[item.key] = item.value;
  }

  // Merge with defaults
  return success(c, {
    staticPages: {
      priority: config.sitemap_static_pages_priority ?? '1.0',
      changefreq: config.sitemap_static_pages_changefreq ?? 'weekly',
    },
    services: {
      priority: config.sitemap_services_priority ?? '0.8',
      changefreq: config.sitemap_services_changefreq ?? 'weekly',
    },
    articles: {
      priority: config.sitemap_articles_priority ?? '0.7',
      changefreq: config.sitemap_articles_changefreq ?? 'weekly',
    },
    blogListing: {
      priority: config.sitemap_blog_listing_priority ?? '0.8',
      changefreq: config.sitemap_blog_listing_changefreq ?? 'daily',
    },
    cmsPages: {
      priority: config.sitemap_cms_pages_priority ?? '0.6',
      changefreq: config.sitemap_cms_pages_changefreq ?? 'monthly',
    },
    indexnow: {
      key: config.indexnow_key ?? '',
      enabled: config.indexnow_enabled !== 'false',
    },
  });
});

export { router as sitemapSettingsRouter };
