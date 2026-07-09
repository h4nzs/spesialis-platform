import { Hono } from 'hono';
import { sql } from 'drizzle-orm';
import { db } from '../lib/db.ts';
import { success, error } from '../lib/response.ts';

const router = new Hono();

router.get('/', async (c) => {
  // Verify database connectivity
  let dbStatus = 'ok';
  try {
    await db.execute(sql`SELECT 1`);
  } catch {
    dbStatus = 'unreachable';
  }

  if (dbStatus !== 'ok') {
    return error(c, 'SERVICE_UNAVAILABLE', 'Database unreachable', 503);
  }

  return success(c, {
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    database: dbStatus,
  });
});

export { router as healthRouter };
