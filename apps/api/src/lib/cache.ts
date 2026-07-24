/**
 * CMS Cache — Redis-backed dengan in-memory fallback.
 *
 * Layer:
 *   1. Redis (L2) — shared antar instance API, TTL native via PX
 *   2. Memory (L1) — fallback saat Redis tidak tersedia
 *
 * Semua operasi cache bersifat async karena Redis ops.
 * Caller (route handlers) sudah dalam konteks async.
 */

import { getRedis } from './redis.ts';

// ── Constants ────────────────────────────────────────────────────

const DEFAULT_TTL_MS = 60_000;

/**
 * Set of CMS key prefixes for invalidation.
 * Entries not in this list are ignored by invalidateCollectionCache.
 */
const COLLECTION_CACHE_PREFIXES: Record<string, string> = {
  cms_articles: 'cms:articles:',
  cms_faq: 'cms:faq',
  cms_pages: 'cms:pages:',
  cms_testimonials: 'cms:testimonials',
  cms_coverage_areas: 'cms:coverage-areas',
};

// ── In-Memory Cache (fallback) ───────────────────────────────────

interface CacheEntry<T> {
  data: T;
  expiresAt: number;
}

class MemoryCache {
  private store = new Map<string, CacheEntry<unknown>>();
  private defaultTtlMs: number;

  constructor(defaultTtlMs = DEFAULT_TTL_MS) {
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

  delete(key: string): void {
    this.store.delete(key);
  }

  invalidateByPrefix(prefix: string): void {
    for (const key of this.store.keys()) {
      if (key.startsWith(prefix)) {
        this.store.delete(key);
      }
    }
  }

  clear(): void {
    this.store.clear();
  }

  get size(): number {
    return this.store.size;
  }
}

// ── Hybrid Cache (Redis + Memory fallback) ─────────────────────

class CmsCache {
  private memory: MemoryCache;
  private defaultTtlMs: number;

  constructor(defaultTtlMs = DEFAULT_TTL_MS) {
    this.memory = new MemoryCache(defaultTtlMs);
    this.defaultTtlMs = defaultTtlMs;
  }

  /**
   * Get cached data.
   * Priority: Memory (fast) → Redis (shared) → miss
   * Jika miss di Memory tapi hit di Redis, populate Memory untuk下次.
   */
  async get<T>(key: string): Promise<{ data: T; hit: boolean }> {
    // 1. Cek memory dulu (fast path)
    const mem = this.memory.get<T>(key);
    if (mem.hit) return mem;

    // 2. Cek Redis (shared cache)
    const redis = getRedis();
    if (redis) {
      try {
        const raw = await redis.get(key);
        if (raw !== null) {
          const data = JSON.parse(raw) as T;
          // Populate memory untuk fast path berikutnya
          this.memory.set(key, data, this.defaultTtlMs);
          return { data, hit: true };
        }
      } catch {
        // Redis error — fallback ke memory (yang sudah miss)
      }
    }

    return { data: undefined as unknown as T, hit: false };
  }

  /**
   * Set cached data.
   * Menulis ke Redis (shared) + Memory (fast).
   */
  async set<T>(key: string, data: T, ttlMs?: number): Promise<void> {
    const ttl = ttlMs ?? this.defaultTtlMs;

    // 1. Tulis ke memory (fast path)
    this.memory.set(key, data, ttl);

    // 2. Tulis ke Redis (shared)
    const redis = getRedis();
    if (!redis) return;

    try {
      await redis.set(key, JSON.stringify(data), 'PX', ttl);
    } catch {
      // Best-effort — memory fallback tetap jalan
    }
  }

  /**
   * Delete a single cache key.
   */
  async delete(key: string): Promise<void> {
    this.memory.delete(key);

    const redis = getRedis();
    if (!redis) return;

    try {
      await redis.del(key);
    } catch {
      // best-effort
    }
  }

  /**
   * Delete all keys matching a prefix.
   */
  async invalidateByPrefix(prefix: string): Promise<void> {
    // 1. Hapus dari memory
    this.memory.invalidateByPrefix(prefix);

    // 2. Hapus dari Redis via SCAN + DEL
    const redis = getRedis();
    if (!redis) return;

    try {
      let cursor = '0';
      do {
        const [nextCursor, keys] = await redis.scan(cursor, 'MATCH', `${prefix}*`, 'COUNT', '100');
        if (keys.length > 0) {
          await redis.del(...keys);
        }
        cursor = nextCursor;
      } while (cursor !== '0');
    } catch {
      // best-effort
    }
  }

  /**
   * Clear ALL cache entries (both memory and Redis).
   * Hanya menghapus key dengan prefix cms: — aman untuk Redis yang
   * menyimpan data non-CMS (rate-limit, lock events, dll).
   */
  async clear(): Promise<void> {
    this.memory.clear();

    const redis = getRedis();
    if (!redis) return;

    try {
      // Hapus semua key dengan prefix cms:
      let cursor = '0';
      do {
        const [nextCursor, keys] = await redis.scan(cursor, 'MATCH', 'cms:*', 'COUNT', '200');
        if (keys.length > 0) {
          await redis.del(...keys);
        }
        cursor = nextCursor;
      } while (cursor !== '0');
    } catch {
      // best-effort
    }
  }
}

// ── Singleton ────────────────────────────────────────────────────

/** Global CMS cache instance — Redis + in-memory hybrid, 60-second TTL */
export const cmsCache = new CmsCache(DEFAULT_TTL_MS);

// ── Invalidation Helper ──────────────────────────────────────────

/**
 * Invalidate cache entries for a given CMS collection.
 * Dipanggil dari admin routes setiap kali konten CMS berubah.
 *
 * Ketika collection tidak dikenal, clear semua cache CMS.
 */
export async function invalidateCollectionCache(collection?: string): Promise<void> {
  if (!collection) {
    await cmsCache.clear();
    console.info('[CMS Cache] Cleared all entries (no collection specified)');
    return;
  }

  const prefix = COLLECTION_CACHE_PREFIXES[collection];
  if (prefix) {
    await cmsCache.invalidateByPrefix(prefix);
    console.info(`[CMS Cache] Invalidated entries for "${collection}" (prefix: ${prefix})`);
  } else {
    // Unknown collection — clear all to be safe
    await cmsCache.clear();
    console.info(`[CMS Cache] Unknown collection "${collection}" — cleared all`);
  }
}
