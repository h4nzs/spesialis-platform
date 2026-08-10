import { getRedis } from '../redis.ts';

/**
 * Hapus semua key `security:*` dari Redis. Dipakai test agar deterministik
 * terlepas dari state Redis lokal (cooldown/counter window antar test).
 */
export async function resetSecurityRedis(): Promise<void> {
  const redis = getRedis();
  if (!redis) return;
  try {
    let cursor = '0';
    do {
      const [next, keys] = await redis.scan(cursor, 'MATCH', 'security:*', 'COUNT', 100);
      cursor = next;
      if (keys.length > 0) await redis.del(...keys);
    } while (cursor !== '0');
  } catch {
    // Redis tidak tersedia — fallback in-memory sudah di-reset oleh caller
  }
}
