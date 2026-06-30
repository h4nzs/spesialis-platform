import { Hono } from 'hono';
import { success } from '../lib/response.ts';

const router = new Hono();

router.get('/', (c) => {
  return success(c, {
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

export { router as healthRouter };
