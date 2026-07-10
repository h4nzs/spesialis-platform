import type { APIRoute } from 'astro';

const SITE = 'https://spesialis.id';
const API_BASE = process.env.PUBLIC_API_URL ?? 'http://localhost:3000';

// ISO date for lastmod — updates when this file is regenerated
const NOW = new Date().toISOString();

const staticPages = [
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

export const GET: APIRoute = async () => {
  let dynamicUrls = '';

  try {
    const [servicesRes, articlesRes] = await Promise.all([
      fetch(`${API_BASE}/api/v1/services?limit=100`).catch(() => null),
      fetch(`${API_BASE}/api/v1/cms/articles?limit=100`).catch(() => null),
    ]);

    if (servicesRes?.ok) {
      const servicesData = await servicesRes.json();
      const services = servicesData.data ?? [];
      for (const s of services as Array<{ slug: string; updatedAt?: string }>) {
        const lastmod = s.updatedAt ? `<lastmod>${s.updatedAt}</lastmod>` : '';
        dynamicUrls += `
  <url>
    <loc>${SITE}/services/${s.slug}</loc>
    ${lastmod}
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>`;
      }
    }

    if (articlesRes?.ok) {
      const articlesData = await articlesRes.json();
      const articles = articlesData.data ?? [];
      for (const a of articles as Array<{ slug: string; updatedAt?: string }>) {
        const lastmod = a.updatedAt ? `<lastmod>${a.updatedAt}</lastmod>` : '';
        dynamicUrls += `
  <url>
    <loc>${SITE}/blog/${a.slug}</loc>
    ${lastmod}
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
  </url>`;
      }
    }
  } catch {
    // If API unavailable, serve only static pages
  }

  const staticXml = staticPages
    .map(
      (p) => `
  <url>
    <loc>${SITE}${p.loc}</loc>
    <lastmod>${NOW}</lastmod>
    <changefreq>${p.changefreq}</changefreq>
    <priority>${p.priority}</priority>
  </url>`,
    )
    .join('');

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  ${staticXml}
  ${dynamicUrls}
</urlset>`;

  return new Response(xml, {
    status: 200,
    headers: { 'Content-Type': 'application/xml' },
  });
};
