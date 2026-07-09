import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Hono } from 'hono';

const mockExecute = vi.hoisted(() => vi.fn());

vi.mock('../lib/db.ts', () => ({
  db: {
    execute: mockExecute,
  },
}));

import { healthRouter } from './health.ts';

function mkApp() {
  const app = new Hono();
  app.route('/api/v1/health', healthRouter);
  return app;
}

describe('GET /', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('200 returns status ok when database is reachable', async () => {
    mockExecute.mockResolvedValue([]);

    const res = await mkApp().request('/api/v1/health');
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.success).toBe(true);
    expect(body.data.status).toBe('ok');
    expect(body.data.database).toBe('ok');
    expect(body.data.timestamp).toBeDefined();
    expect(body.data.uptime).toBeGreaterThan(0);
  });

  it('503 when database is unreachable', async () => {
    mockExecute.mockRejectedValue(new Error('Connection refused'));

    const res = await mkApp().request('/api/v1/health');
    expect(res.status).toBe(503);
    const body = await res.json();
    expect(body.success).toBe(false);
    expect(body.code).toBe('SERVICE_UNAVAILABLE');
  });
});
