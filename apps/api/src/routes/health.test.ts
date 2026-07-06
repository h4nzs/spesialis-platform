import { describe, it, expect } from 'vitest';
import { Hono } from 'hono';
import { healthRouter } from './health.ts';

function mkApp() {
  const app = new Hono();
  app.route('/api/v1/health', healthRouter);
  return app;
}

describe('GET /', () => {
  it('200 returns status ok', async () => {
    const res = await mkApp().request('/api/v1/health');
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.success).toBe(true);
    expect(body.data.status).toBe('ok');
    expect(body.data.timestamp).toBeDefined();
    expect(body.data.uptime).toBeGreaterThan(0);
  });
});
