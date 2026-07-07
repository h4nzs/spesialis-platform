import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Hono } from 'hono';
import type { ApiTestResponse } from '../test-utils.ts';

// Set env vars before module is imported
vi.hoisted(() => {
  process.env.REVALIDATION_TOKEN = 'test-token';
  return 'test-token';
});

// Mock fetch to prevent actual network calls
const mockFetch = vi.hoisted(() => vi.fn().mockResolvedValue({ ok: true }));
vi.stubGlobal('fetch', mockFetch);

// Import after env is set
const { cmsRevalidationRouter } = await import('./cms-revalidation.ts');

function mkApp() {
  const app = new Hono();
  app.route('/api/v1/cms', cmsRevalidationRouter);
  return app;
}

beforeEach(() => {
  vi.clearAllMocks();
  mockFetch.mockResolvedValue({ ok: true, status: 200, text: () => Promise.resolve('OK') });
});

describe('POST /revalidate', () => {
  it('200 triggers revalidation', async () => {
    const res = await mkApp().request('/api/v1/cms/revalidate', {
      method: 'POST',
      headers: {
        Authorization: 'Bearer test-token',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ collection: 'cms_articles', event: 'items.update', key: '1' }),
    });
    const body = (await res.json()) as ApiTestResponse;
    expect(res.status).toBe(200);
    expect(body.success).toBe(true);
    expect(body.data).toEqual({ revalidated: true });
    // Verify it forwarded the revalidation to Astro
    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining('/api/revalidate'),
      expect.objectContaining({
        method: 'POST',
        headers: expect.objectContaining({
          Authorization: 'Bearer test-token',
        }),
      }),
    );
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
    expect(mockFetch).not.toHaveBeenCalled();
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
    expect(mockFetch).not.toHaveBeenCalled();
  });

  it('502 when Astro revalidation fails', async () => {
    mockFetch.mockResolvedValue({
      ok: false,
      status: 500,
      text: () => Promise.resolve('Internal Server Error'),
    });

    const res = await mkApp().request('/api/v1/cms/revalidate', {
      method: 'POST',
      headers: {
        Authorization: 'Bearer test-token',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ collection: 'cms_articles', event: 'items.update' }),
    });
    expect(res.status).toBe(502);
    const body = (await res.json()) as ApiTestResponse;
    expect(body.success).toBe(false);
  });
});
