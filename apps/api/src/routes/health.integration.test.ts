import { describe, it, expect } from 'vitest';
import { Hono } from 'hono';
import { healthRouter } from './health.ts';

function mkApp() {
  const app = new Hono();
  app.route('/api/v1/health', healthRouter);
  return app;
}

describe('GET /api/v1/health (integration)', () => {
  it('returns ok with database connection', async () => {
    const res = await mkApp().request('/api/v1/health');
    const body = await res.json();
    expect(res.status).toBe(200);
    expect(body.success).toBe(true);
    expect(body.data.status).toBe('ok');
  });
});
