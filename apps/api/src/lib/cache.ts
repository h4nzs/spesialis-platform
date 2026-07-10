/**
 * Simple in-memory cache with TTL support.
 * Used to reduce load on CMS from frequent SSR requests.
 * Cache is invalidated when the revalidation endpoint is triggered.
 */

interface CacheEntry<T> {
  data: T;
  expiresAt: number;
}

class MemoryCache {
  private store = new Map<string, CacheEntry<unknown>>();
  private defaultTtlMs: number;

  constructor(defaultTtlMs = 60_000) {
    this.defaultTtlMs = defaultTtlMs;
  }

  get<T>(key: string): { data: T; hit: boolean } {
    const entry = this.store.get(key);
    if (!entry) return { data: undefined as unknown as T, hit: false };
    if (Date.now() > entry.expiresAt) {
      this.store.delete(key);
      return { data: undefined as unknown as T, hit: false };
    }
    return { data: entry.data as T, hit: true };
  }

  set<T>(key: string, data: T, ttlMs?: number): void {
    this.store.set(key, {
      data,
      expiresAt: Date.now() + (ttlMs ?? this.defaultTtlMs),
    });
  }

  /** Delete a single key */
  delete(key: string): void {
    this.store.delete(key);
  }

  /** Delete all keys whose prefix matches */
  invalidateByPrefix(prefix: string): void {
    for (const key of this.store.keys()) {
      if (key.startsWith(prefix)) {
        this.store.delete(key);
      }
    }
  }

  /** Clear all entries */
  clear(): void {
    this.store.clear();
  }

  get size(): number {
    return this.store.size;
  }
}

/** Global CMS cache instance — 60-second TTL */
export const cmsCache = new MemoryCache(60_000);

/** Map CMS collection names to cache key prefixes */
const COLLECTION_CACHE_PREFIXES: Record<string, string> = {
  cms_articles: 'cms:articles:',
  cms_faq: 'cms:faq:',
  cms_homepage_sections: 'cms:homepage-sections:',
  cms_pages: 'cms:pages:',
};

/**
 * Invalidate cache entries for a given CMS collection.
 * When collection is unrecognized, clears all CMS cache.
 */
export function invalidateCollectionCache(collection?: string): void {
  if (!collection) {
    cmsCache.clear();
    console.info('[CMS Cache] Cleared all entries (no collection specified)');
    return;
  }

  const prefix = COLLECTION_CACHE_PREFIXES[collection];
  if (prefix) {
    cmsCache.invalidateByPrefix(prefix);
    console.info(`[CMS Cache] Invalidated entries for "${collection}"`);
  } else {
    // Unknown collection — clear all to be safe
    cmsCache.clear();
    console.info(`[CMS Cache] Unknown collection "${collection}" — cleared all`);
  }
}
