import { getRedis } from '../redis.ts';

interface WindowEntry {
  count: number;
  expiresAt: number;
}

const memoryStore = new Map<string, WindowEntry>();

/**
 * INCR dengan window TTL. Fallback ke in-memory store saat Redis tidak
 * tersedia (pola yang sama dengan rate limiter). Mengembalikan hitungan
 * terbaru dalam window.
 */
export async function incrWithWindow(key: string, windowMs: number): Promise<number> {
  const redis = getRedis();
  if (redis) {
    try {
      const count = await redis.incr(key);
      if (count === 1) await redis.pexpire(key, windowMs);
      return count;
    } catch {
      // Redis error — jatuh ke in-memory
    }
  }
  const now = Date.now();
  const entry = memoryStore.get(key);
  if (!entry || entry.expiresAt < now) {
    memoryStore.set(key, { count: 1, expiresAt: now + windowMs });
    return 1;
  }
  entry.count += 1;
  return entry.count;
}

/**
 * Reserve sekali dalam TTL: true jika belum pernah di-reserve dalam window
 * (lock berhasil), false jika sudah. Dipakai throttle/cooldown alert agar
 * tidak membombardir notifikasi.
 */
export async function reserveOnce(key: string, ttlMs: number): Promise<boolean> {
  const redis = getRedis();
  if (redis) {
    try {
      const result = await redis.set(key, '1', 'PX', ttlMs, 'NX');
      return result === 'OK';
    } catch {
      // Redis error — jatuh ke in-memory
    }
  }
  const now = Date.now();
  const entry = memoryStore.get(key);
  if (entry && entry.expiresAt >= now) return false;
  memoryStore.set(key, { count: 1, expiresAt: now + ttlMs });
  return true;
}

/** Hanya untuk test — kosongkan store in-memory. */
export function resetSecurityStore(): void {
  memoryStore.clear();
}
