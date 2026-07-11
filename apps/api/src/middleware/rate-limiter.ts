import type { Context, Next } from 'hono';
import { error } from '../lib/response.ts';
import { getRedis } from '../lib/redis.ts';

// ── Configuration ──────────────────────────────────────────────────

/** Maximum number of in-memory rate-limit entries before eviction. */
const MAX_ENTRIES = 10_000;

/** Default window (60 seconds). */
const DEFAULT_WINDOW_MS = 60_000;

/** Default max requests per window. */
const DEFAULT_MAX_REQUESTS = 20;

/** Fraction of `windowMs` at which the stale-entry scrubber runs. */
const CLEANUP_INTERVAL_RATIO = 0.5;

// ── In-memory store ───────────────────────────────────────────────

interface InMemoryEntry {
  count: number;
  resetAt: number;
}

const inMemory = new Map<string, InMemoryEntry>();

/**
 * Periodic scrubber that evicts expired entries from the in-memory Map.
 * Runs at half the default window interval (every 30s by default).
 */
setInterval(
  () => {
    const now = Date.now();
    for (const [key, entry] of inMemory) {
      if (entry.resetAt < now) {
        inMemory.delete(key);
      }
    }
  },
  Math.round(DEFAULT_WINDOW_MS * CLEANUP_INTERVAL_RATIO),
);

// ── Helpers ────────────────────────────────────────────────────────

function getIp(c: Context): string {
  return (
    c.req.header('x-forwarded-for')?.split(',')[0]?.trim() ?? c.req.header('x-real-ip') ?? 'unknown'
  );
}

/**
 * Evict stale (expired) entries to make room.
 * Returns the number of entries remaining.
 */
function evictStaleEntries(): number {
  const now = Date.now();
  for (const [key, entry] of inMemory) {
    if (entry.resetAt < now) {
      inMemory.delete(key);
    }
  }
  return inMemory.size;
}

/**
 * Evict the oldest entries (by insertion order) until `targetSize` is reached.
 * Map in modern JS engines preserves insertion order, so the first keys are
 * the oldest.
 */
function evictOldest(targetSize: number): void {
  const toDelete = inMemory.size - targetSize;
  if (toDelete <= 0) return;

  let deleted = 0;
  for (const key of inMemory.keys()) {
    if (deleted >= toDelete) break;
    inMemory.delete(key);
    deleted++;
  }
}

/**
 * Ensure the in-memory Map stays within the configured limit.
 * First removes expired entries, then evicts oldest if still over.
 */
function ensureCapacity(): void {
  if (inMemory.size < MAX_ENTRIES) return;

  const afterExpiry = evictStaleEntries();
  if (afterExpiry < MAX_ENTRIES) return;

  // Still over limit — evict the oldest 25% of entries
  const target = Math.floor(MAX_ENTRIES * 0.75);
  evictOldest(target);
}

// ── Redis-backed rate limiter ──────────────────────────────────────

async function redisRateLimit(c: Context, maxRequests: number, windowMs: number) {
  const redis = getRedis();
  if (!redis) return false;

  const ip = getIp(c);
  const path = c.req.path;
  const key = `ratelimit:${ip}:${path}`;

  try {
    const result = await redis
      .multi()
      .set(key, 1, 'PX', windowMs, 'NX')
      .incr(key)
      .pexpire(key, windowMs, 'GT')
      .exec();

    if (!result) return false;

    const incrResult = result[1];
    const count =
      Array.isArray(incrResult) && typeof incrResult[1] === 'number' ? incrResult[1] : undefined;

    if (count && count > maxRequests + 1) return true;

    return false;
  } catch {
    return false;
  }
}

// ── In-memory rate limiter (fallback when Redis is unavailable) ─────

async function memoryRateLimit(c: Context, maxRequests: number, windowMs: number) {
  const key = `${getIp(c)}:${c.req.path}`;
  const now = Date.now();

  const entry = inMemory.get(key);

  // First access or window expired — create / reset
  if (!entry || entry.resetAt < now) {
    // Check capacity before inserting to prevent unbounded growth
    ensureCapacity();

    inMemory.set(key, { count: 1, resetAt: now + windowMs });
    return false;
  }

  entry.count++;
  return entry.count > maxRequests;
}

// ── Exported middleware ────────────────────────────────────────────

export function rateLimit(maxRequests = DEFAULT_MAX_REQUESTS, windowMs = DEFAULT_WINDOW_MS) {
  return async (c: Context, next: Next) => {
    if (process.env['RATE_LIMIT_DISABLED'] === 'true') {
      await next();
      return;
    }

    const limited =
      (await redisRateLimit(c, maxRequests, windowMs)) ||
      (await memoryRateLimit(c, maxRequests, windowMs));

    if (limited) {
      return error(
        c,
        'RATE_LIMIT_EXCEEDED',
        'Terlalu banyak permintaan. Silakan coba lagi nanti.',
        429,
      );
    }

    await next();
  };
}
