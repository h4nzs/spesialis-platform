import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Hono } from 'hono';
import { cmsRevalidationRouter } from './cms-revalidation.ts';
import type { ApiTestResponse } from '../test-utils.ts';

function mkApp() {
  const app = new Hono();
  app.route('/api/v1/cms', cmsRevalidationRouter);
  return app;
}

beforeEach(() => {
  vi.clearAllMocks();
  process.env.REVALIDATION_TOKEN = 'test-token';
});

describe('POST /revalidate', () => {
  it('200 triggers revalidation', async () => {
    const res = await mkApp().request('/api/v1/cms/revalidate', {
      method: 'POST',
      headers: {
        Authorization: 'Bearer test-token',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ collection: 'cms_articles', event: 'update', key: '1' }),
    });
    const body = (await res.json()) as ApiTestResponse;
    expect(res.status).toBe(200);
    expect(body.success).toBe(true);
    expect(body.data).toEqual({ revalidated: true });
  });

  it('401 invalid token', async () => {
    const res = await mkApp().request('/api/v1/cms/revalidate', {
      method: 'POST',
      headers: {
        Authorization: 'Bearer wrong-token',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ collection: 'cms_articles' }),
    });
    const body = (await res.json()) as ApiTestResponse;
    expect(res.status).toBe(401);
    expect(body.success).toBe(false);
  });

  it('401 no token', async () => {
    const res = await mkApp().request('/api/v1/cms/revalidate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ collection: 'cms_articles' }),
    });
    const body = (await res.json()) as ApiTestResponse;
    expect(res.status).toBe(401);
    expect(body.success).toBe(false);
  });
});
