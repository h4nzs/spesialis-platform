import { Hono } from 'hono';
import { sql } from 'drizzle-orm';
import { db } from '../lib/db.ts';
import { getRedis } from '../lib/redis.ts';
import { success, error } from '../lib/response.ts';

const router = new Hono();

router.get('/', async (c) => {
  let dbStatus = 'ok';
  let redisStatus = 'ok';

  try {
    await db.execute(sql`SELECT 1`);
  } catch {
    dbStatus = 'unreachable';
  }

  try {
    const redis = getRedis();
    if (redis) await redis.ping();
    else redisStatus = 'unavailable';
  } catch {
    redisStatus = 'unreachable';
  }

  if (dbStatus !== 'ok') {
    return error(c, 'SERVICE_UNAVAILABLE', 'Database unreachable', 503);
  }

  return success(c, {
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    database: dbStatus,
    redis: redisStatus,
  });
});

export { router as healthRouter };
