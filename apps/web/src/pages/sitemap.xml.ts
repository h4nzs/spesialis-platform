import type { APIRoute } from 'astro';

const SITE = 'https://spesialis.id';
const API_BASE = process.env.PUBLIC_API_URL ?? process.env.API_URL ?? 'http://localhost:3000';

interface SitemapConfig {
  staticPages: { priority: string; changefreq: string };
  services: { priority: string; changefreq: string };
  articles: { priority: string; changefreq: string };
  blogListing: { priority: string; changefreq: string };
  cmsPages: { priority: string; changefreq: string };
}

// ── Default config (fallback if API unavailable) ───────────────
const DEFAULT_CONFIG: SitemapConfig = {
  staticPages: { priority: '1.0', changefreq: 'weekly' },
  services: { priority: '0.8', changefreq: 'weekly' },
  articles: { priority: '0.7', changefreq: 'weekly' },
  blogListing: { priority: '0.8', changefreq: 'daily' },
  cmsPages: { priority: '0.6', changefreq: 'monthly' },
};

// ── Static pages ───────────────────────────────────────────────
const STATIC_PAGES = [
  { loc: '/', changefreq: 'weekly', priority: '1.0' },
  { loc: '/tentang-kami', changefreq: 'monthly', priority: '0.7' },
  { loc: '/services', changefreq: 'weekly', priority: '0.9' },
  { loc: '/blog', changefreq: 'daily', priority: '0.8' },
  { loc: '/faq', changefreq: 'monthly', priority: '0.6' },
  { loc: '/kontak', changefreq: 'monthly', priority: '0.6' },
  { loc: '/book', changefreq: 'monthly', priority: '0.8' },
  { loc: '/tracking', changefreq: 'monthly', priority: '0.5' },
  { loc: '/corporate', changefreq: 'monthly', priority: '0.5' },
  { loc: '/kebijakan-privasi', changefreq: 'monthly', priority: '0.3' },
  { loc: '/syarat-ketentuan', changefreq: 'monthly', priority: '0.3' },
];

// ── Helpers ────────────────────────────────────────────────────

function escapeXml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

export const GET: APIRoute = async () => {
  const NOW = new Date().toISOString();
  let config = DEFAULT_CONFIG;
  let dynamicUrls = '';

  try {
    // ── Fetch config ────────────────────────────────────────────
    const configRes = await fetch(`${API_BASE}/api/v1/sitemap-settings`).catch(() => null);
    if (configRes?.ok) {
      const configData = await configRes.json();
      if (configData?.data) {
        config = {
          staticPages: {
            priority: configData.data.staticPages?.priority ?? DEFAULT_CONFIG.staticPages.priority,
            changefreq:
              configData.data.staticPages?.changefreq ?? DEFAULT_CONFIG.staticPages.changefreq,
          },
          services: {
            priority: configData.data.services?.priority ?? DEFAULT_CONFIG.services.priority,
            changefreq: configData.data.services?.changefreq ?? DEFAULT_CONFIG.services.changefreq,
          },
          articles: {
            priority: configData.data.articles?.priority ?? DEFAULT_CONFIG.articles.priority,
            changefreq: configData.data.articles?.changefreq ?? DEFAULT_CONFIG.articles.changefreq,
          },
          blogListing: {
            priority: configData.data.blogListing?.priority ?? DEFAULT_CONFIG.blogListing.priority,
            changefreq:
              configData.data.blogListing?.changefreq ?? DEFAULT_CONFIG.blogListing.changefreq,
          },
          cmsPages: {
            priority: configData.data.cmsPages?.priority ?? DEFAULT_CONFIG.cmsPages.priority,
            changefreq: configData.data.cmsPages?.changefreq ?? DEFAULT_CONFIG.cmsPages.changefreq,
          },
        };
      }
    }

    // ── Fetch data from APIs ────────────────────────────────────
    const [servicesRes, articlesRes] = await Promise.all([
      fetch(`${API_BASE}/api/v1/services?limit=200`).catch(() => null),
      fetch(`${API_BASE}/api/v1/cms/articles?limit=200`).catch(() => null),
    ]);

    // ── Services ────────────────────────────────────────────────
    if (servicesRes?.ok) {
      const servicesData = await servicesRes.json();
      const services = servicesData.data ?? [];
      for (const s of services as Array<{ slug: string; updatedAt?: string; image?: string }>) {
        const lastmod = s.updatedAt ? `<lastmod>${s.updatedAt}</lastmod>` : '';
        dynamicUrls += `
  <url>
    <loc>${SITE}/services/${s.slug}</loc>
    ${lastmod}
    <changefreq>${config.services.changefreq}</changefreq>
    <priority>${config.services.priority}</priority>
  </url>`;
      }
    }

    // ── Articles (with image tags) ──────────────────────────────
    if (articlesRes?.ok) {
      const articlesData = await articlesRes.json();
      const arts = articlesData.data ?? [];
      for (const a of arts as Array<{
        slug: string;
        updatedAt?: string;
        cover_image?: string;
        title?: string;
      }>) {
        const lastmod = a.updatedAt ? `<lastmod>${a.updatedAt}</lastmod>` : '';
        const imageTag = a.cover_image
          ? `\n    <image:image>\n      <image:loc>${escapeXml(a.cover_image)}</image:loc>\n      ${a.title ? `<image:title>${escapeXml(a.title)}</image:title>` : ''}\n    </image:image>`
          : '';
        dynamicUrls += `
  <url>
    <loc>${SITE}/blog/${a.slug}</loc>
    ${lastmod}
    <changefreq>${config.articles.changefreq}</changefreq>
    <priority>${config.articles.priority}</priority>${imageTag}
  </url>`;
      }
    }
  } catch {
    // If API unavailable, serve only static pages
  }

  // ── Static pages ─────────────────────────────────────────────
  const staticXml = STATIC_PAGES.map(
    (p) => `
  <url>
    <loc>${SITE}${p.loc}</loc>
    <lastmod>${NOW}</lastmod>
    <changefreq>${config.staticPages.changefreq}</changefreq>
    <priority>${config.staticPages.priority}</priority>
  </url>`,
  ).join('');

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
  ${staticXml}
  ${dynamicUrls}
</urlset>`;

  return new Response(xml, {
    status: 200,
    headers: { 'Content-Type': 'application/xml' },
  });
};
