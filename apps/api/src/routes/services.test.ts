import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Hono } from 'hono';
import { servicesRouter } from './services.ts';
import { errorHandler } from '../middleware/error-handler.ts';
import { setTestEnv, makeChain } from '../test-utils.ts';
import type { ApiTestResponse } from '../test-utils.ts';

const { mockDb, em } = vi.hoisted(() => {
  const db = {
    select: vi.fn(),
    insert: vi.fn(),
    update: vi.fn(),
    delete: vi.fn().mockReturnValue({ where: vi.fn().mockResolvedValue(undefined) }),
    execute: vi.fn().mockResolvedValue([]),
    transaction: vi.fn((fn: (tx: unknown) => unknown) => fn(db)),
  };
  const exps = (globalThis as Record<string, unknown>).__TABLE_EXPORTS as Record<string, unknown>;
  return { mockDb: db, em: exps };
});

vi.mock('../lib/db.ts', () => ({ db: mockDb, ...em }));

function mkApp() {
  const app = new Hono();
  app.onError(errorHandler);
  app.route('/api/v1/services', servicesRouter);
  return app;
}

beforeEach(() => {
  setTestEnv();
  vi.clearAllMocks();
});

describe('GET /api/v1/services', () => {
  it('200 paginated', async () => {
    mockDb.select.mockReturnValue(makeChain([]));
    const res = await mkApp().request('/api/v1/services');
    expect(res.status).toBe(200);
    const j = (await res.json()) as ApiTestResponse;
    expect(j.success).toBe(true);
    expect(j.pagination).toBeDefined();
  });
  it('filter category', async () => {
    mockDb.select.mockReturnValue(makeChain([]));
    const res = await mkApp().request('/api/v1/services?categoryId=c1');
    const body = (await res.json()) as ApiTestResponse;
    expect(res.status).toBe(200);
    expect(body.success).toBe(true);
  });
  it('filter featured', async () => {
    mockDb.select.mockReturnValue(makeChain([]));
    const res = await mkApp().request('/api/v1/services?featured=true');
    const body = (await res.json()) as ApiTestResponse;
    expect(res.status).toBe(200);
    expect(body.success).toBe(true);
  });
  it('pagination params', async () => {
    mockDb.select.mockReturnValue(makeChain([]));
    const res = await mkApp().request('/api/v1/services?page=2&limit=5');
    const body = (await res.json()) as ApiTestResponse;
    expect(res.status).toBe(200);
    expect(body.success).toBe(true);
  });
  it('422 bad params', async () => {
    const res = await mkApp().request('/api/v1/services?page=-1');
    const body = (await res.json()) as ApiTestResponse;
    expect(res.status).toBe(422);
    expect(body.success).toBe(false);
  });
  it('returns data', async () => {
    mockDb.select.mockReturnValue(
      makeChain([
        {
          id: 's1',
          categoryId: 'c1',
          name: 'AC',
          slug: 'ac',
          shortDescription: 'Clean',
          basePrice: '150000',
          estimatedDuration: '2',
          thumbnail: null,
          isFeatured: false,
        },
      ]),
    );
    const res = await mkApp().request('/api/v1/services');
    const j = (await res.json()) as ApiTestResponse;
    expect(j.success).toBe(true);
    expect(j.data).toHaveLength(1);
  });
});

describe('GET /:slug', () => {
  it('200', async () => {
    mockDb.select.mockReturnValue(
      makeChain([
        {
          id: 's1',
          categoryId: 'c1',
          name: 'AC',
          slug: 'ac',
          shortDescription: 'C',
          description: 'D',
          basePrice: '150000',
          estimatedDuration: '2',
          warrantyDays: 30,
          thumbnail: null,
          isFeatured: false,
        },
      ]),
    );
    const res = await mkApp().request('/api/v1/services/ac');
    const body = (await res.json()) as ApiTestResponse;
    expect(res.status).toBe(200);
    expect(body.success).toBe(true);
    expect(body.data).toBeDefined();
  });
  it('404', async () => {
    mockDb.select.mockReturnValue(makeChain([]));
    const res = await mkApp().request('/api/v1/services/nope');
    const body = (await res.json()) as ApiTestResponse;
    expect(res.status).toBe(404);
    expect(body.success).toBe(false);
  });
});
