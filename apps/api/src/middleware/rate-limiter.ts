import type { Context, Next } from 'hono';
import { error } from '../lib/response.ts';
import { getRedis } from '../lib/redis.ts';

interface InMemoryEntry {
  count: number;
  resetAt: number;
}

const inMemory = new Map<string, InMemoryEntry>();
const WINDOW_MS = 60_000;
const MAX_REQUESTS = 20;

setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of inMemory) {
    if (entry.resetAt < now) inMemory.delete(key);
  }
}, 60_000);

function getIp(c: Context): string {
  return (
    c.req.header('x-forwarded-for')?.split(',')[0]?.trim() ?? c.req.header('x-real-ip') ?? 'unknown'
  );
}

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

async function memoryRateLimit(c: Context, maxRequests: number, windowMs: number) {
  const key = `${getIp(c)}:${c.req.path}`;
  const now = Date.now();

  const entry = inMemory.get(key);
  if (!entry || entry.resetAt < now) {
    inMemory.set(key, { count: 1, resetAt: now + windowMs });
    return false;
  }

  entry.count++;
  return entry.count > maxRequests;
}

export function rateLimit(maxRequests = MAX_REQUESTS, windowMs = WINDOW_MS) {
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
