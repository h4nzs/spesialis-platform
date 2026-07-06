import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Hono } from 'hono';
import { serviceCategoriesRouter } from './service-categories.ts';
import { setTestEnv, makeChain } from '../test-utils.ts';

const { mockDb, em } = vi.hoisted(() => {
  const db = { select: vi.fn(), execute: vi.fn().mockResolvedValue([]) };
  const exps = (globalThis as Record<string, unknown>).__TABLE_EXPORTS as Record<string, unknown>;
  return { mockDb: db, em: exps };
});

vi.mock('../lib/db.ts', () => ({ db: mockDb, ...em }));

function mkApp() {
  const app = new Hono();
  app.route('/api/v1/service-categories', serviceCategoriesRouter);
  return app;
}

beforeEach(() => {
  setTestEnv();
  vi.clearAllMocks();
  mockDb.select.mockReset();
});

describe('GET /', () => {
  it('200 list categories', async () => {
    mockDb.select.mockReturnValueOnce(
      makeChain([
        { id: 'c1', name: 'AC', slug: 'ac', description: null, icon: null, displayOrder: 1 },
      ]),
    );
    const res = await mkApp().request('/api/v1/service-categories');
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.data).toHaveLength(1);
    expect(body.data[0].name).toBe('AC');
  });

  it('200 empty list', async () => {
    mockDb.select.mockReturnValueOnce(makeChain([]));
    const res = await mkApp().request('/api/v1/service-categories');
    expect(res.status).toBe(200);
    expect((await res.json()).data).toEqual([]);
  });
});

describe('GET /:slug', () => {
  it('200 found with services', async () => {
    mockDb.select.mockReturnValueOnce(makeChain([{ id: 'c1', name: 'AC', slug: 'ac' }]));
    mockDb.select.mockReturnValueOnce(
      makeChain([{ id: 's1', name: 'Service 1', slug: 'service-1' }]),
    );
    const res = await mkApp().request('/api/v1/service-categories/ac');
    expect(res.status).toBe(200);
  });

  it('404 not found', async () => {
    mockDb.select.mockReturnValueOnce(makeChain([]));
    const res = await mkApp().request('/api/v1/service-categories/unknown');
    expect(res.status).toBe(404);
  });
});
