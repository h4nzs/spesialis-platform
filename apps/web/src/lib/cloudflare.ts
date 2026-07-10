/**
 * Cloudflare CDN Cache Purge Client
 *
 * Purges cached pages from Cloudflare CDN when CMS content changes.
 * Used by the Astro revalidation endpoint.
 *
 * Architecture:
 *   Internet → Cloudflare CDN → Nginx → Astro (SSR)
 *
 * When CMS content is updated, we need to purge the Cloudflare cache
 * so the next visitor gets the fresh SSR-rendered page.
 *
 * API: POST /zones/{zone_id}/purge_cache
 * Docs: https://developers.cloudflare.com/api/operations/zone-purge
 */

// ── Env vars ─────────────────────────────────────────────────────────────

const CF_API_TOKEN = typeof process !== 'undefined' ? (process.env.CLOUDFLARE_API_TOKEN ?? '') : '';

const CF_ZONE_ID = typeof process !== 'undefined' ? (process.env.CLOUDFLARE_ZONE_ID ?? '') : '';

const SITE_URL =
  typeof process !== 'undefined'
    ? (process.env.SITE_URL ?? 'https://spesialis.id')
    : 'https://spesialis.id';

// ── Collection-to-URL mapping ────────────────────────────────────────────
// Maps CMS content types to the URL paths they affect.

const COLLECTION_PATHS: Record<string, string[]> = {
  cms_pages: ['/'],
  cms_articles: ['/blog', '/blog/'],
  cms_faq: ['/faq'],
};

// ── Types ────────────────────────────────────────────────────────────────

export interface PurgeResult {
  success: boolean;
  urls: string[];
  error?: string;
}

export interface PurgeOptions {
  collection: string;
  key?: string;
}

// ── Purge by URL files ───────────────────────────────────────────────────

async function purgeUrls(urls: string[]): Promise<PurgeResult> {
  if (!CF_API_TOKEN || !CF_ZONE_ID) {
    // Cloudflare not configured — revalidation is acknowledge-only
    return { success: true, urls, error: undefined };
  }

  try {
    const res = await fetch(
      `https://api.cloudflare.com/client/v4/zones/${CF_ZONE_ID}/purge_cache`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${CF_API_TOKEN}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ files: urls }),
      },
    );

    const json = (await res.json()) as { success: boolean; errors?: Array<{ message: string }> };

    if (!res.ok || !json.success) {
      const errMsg = json.errors?.[0]?.message ?? `HTTP ${res.status}`;
      console.error('[Cloudflare] Purge failed:', errMsg);
      return { success: false, urls, error: errMsg };
    }

    console.info('[Cloudflare] Purged', urls.length, 'URLs from cache');
    return { success: true, urls };
  } catch (err) {
    const errMsg = err instanceof Error ? err.message : String(err);
    console.error('[Cloudflare] Purge error:', errMsg);
    return { success: false, urls, error: errMsg };
  }
}

// ── Main purge function ──────────────────────────────────────────────────

export async function purgeCollectionCache(options: PurgeOptions): Promise<PurgeResult> {
  const { collection, key } = options;

  // Determine which URLs to purge based on the collection
  const basePaths = COLLECTION_PATHS[collection];
  if (!basePaths || basePaths.length === 0) {
    console.warn('[Cloudflare] No paths mapped for collection:', collection);
    return { success: true, urls: [] };
  }

  const urls: string[] = [];

  for (const path of basePaths) {
    // Always purge the base path
    urls.push(`${SITE_URL}${path}`);

    // If a specific key (slug/ID) is provided, purge that specific page
    if (key) {
      if (collection === 'cms_articles') {
        urls.push(`${SITE_URL}/blog/${key}`);
      } else if (collection === 'cms_pages') {
        urls.push(`${SITE_URL}/${key}`);
      }
    }
  }

  // Remove duplicates
  const uniqueUrls = [...new Set(urls)];

  return purgeUrls(uniqueUrls);
}
