import { Redis } from 'ioredis';
import { promises as dns } from 'node:dns';

let client: Redis | null = null;
let connecting = false;

export function getRedis(): Redis | null {
  if (client) return client;
  if (connecting) return null;

  const host = process.env.REDIS_HOST ?? 'localhost';
  const port = Number(process.env.REDIS_PORT) || 6379;

  if (host === 'localhost' || host === '127.0.0.1') {
    return initClient(host, port);
  }

  connecting = true;

  dns.lookup(host).then(
    () => {
      connecting = false;
      initClient(host, port);
    },
    () => {
      connecting = false;
      console.warn('[redis] host tidak dijangkau — fallback ke in-memory store');
    },
  );

  return null;
}

function initClient(host: string, port: number): Redis | null {
  try {
    const instance = new Redis({
      host,
      port,
      lazyConnect: true,
      maxRetriesPerRequest: 0,
      retryStrategy: () => null,
      enableOfflineQueue: false,
    });

    instance.on('error', () => {
      /* swallow — handled by retryStrategy & dns pre-check */
    });

    client = instance;
    return client;
  } catch {
    console.warn('[redis] tidak tersedia — fallback ke in-memory store');
    return null;
  }
}
