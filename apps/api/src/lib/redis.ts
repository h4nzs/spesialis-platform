import { Redis } from 'ioredis';

let client: Redis | null = null;

export function getRedis(): Redis | null {
  if (client) return client;

  const host = process.env.REDIS_HOST ?? 'localhost';
  const port = Number(process.env.REDIS_PORT) || 6379;

  try {
    client = new Redis({ host, port, lazyConnect: true, maxRetriesPerRequest: 0 });

    client.on('error', (err: Error) => {
      console.warn('[redis]', err.message);
    });

    return client;
  } catch {
    console.warn('[redis] tidak tersedia — fallback ke in-memory store');
    return null;
  }
}
