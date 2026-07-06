import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Hono } from 'hono';
import { cmsRouter } from './cms.ts';
import { setTestEnv, makeChain } from '../test-utils.ts';

const { mockDb, em } = vi.hoisted(() => {
  const db = { select: vi.fn(), execute: vi.fn().mockResolvedValue([]) };
  const exps = (globalThis as Record<string, unknown>).__TABLE_EXPORTS as Record<string, unknown>;
  return { mockDb: db, em: exps };
});

vi.mock('../lib/db.ts', () => ({ db: mockDb, ...em }));

function mkApp() {
  const app = new Hono();
  app.route('/api/v1/cms', cmsRouter);
  return app;
}

beforeEach(() => {
  setTestEnv();
  vi.clearAllMocks();
  mockDb.select.mockReset();
});

describe('GET /faq', () => {
  it('200 list faq', async () => {
    mockDb.select.mockReturnValueOnce(
      makeChain([{ id: 'f1', question: 'Q?', answer: 'A.', category: null, displayOrder: 1 }]),
    );
    const res = await mkApp().request('/api/v1/cms/faq');
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.data).toHaveLength(1);
    expect(body.data[0].question).toBe('Q?');
  });

  it('200 empty on error', async () => {
    mockDb.select.mockImplementationOnce(() => {
      throw new Error('DB error');
    });
    const res = await mkApp().request('/api/v1/cms/faq');
    expect(res.status).toBe(200);
    expect((await res.json()).data).toEqual([]);
  });
});

describe('GET /articles', () => {
  it('200 list articles', async () => {
    mockDb.select.mockReturnValueOnce(
      makeChain([{ id: 'a1', title: 'Article', slug: 'article-1' }]),
    );
    const res = await mkApp().request('/api/v1/cms/articles');
    expect(res.status).toBe(200);
    expect((await res.json()).data).toHaveLength(1);
  });

  it('200 empty on error', async () => {
    mockDb.select.mockImplementationOnce(() => {
      throw new Error('DB error');
    });
    const res = await mkApp().request('/api/v1/cms/articles');
    expect(res.status).toBe(200);
    expect((await res.json()).data).toEqual([]);
  });
});

describe('GET /articles/:slug', () => {
  it('200 found', async () => {
    mockDb.select.mockReturnValueOnce(
      makeChain([{ id: 'a1', title: 'Article', slug: 'article-1' }]),
    );
    const res = await mkApp().request('/api/v1/cms/articles/article-1');
    expect(res.status).toBe(200);
  });

  it('200 null on not found', async () => {
    mockDb.select.mockReturnValueOnce(makeChain([]));
    const res = await mkApp().request('/api/v1/cms/articles/unknown');
    expect(res.status).toBe(200);
    expect((await res.json()).data).toBeNull();
  });

  it('200 null on error', async () => {
    mockDb.select.mockImplementationOnce(() => {
      throw new Error('DB error');
    });
    const res = await mkApp().request('/api/v1/cms/articles/article-1');
    expect(res.status).toBe(200);
    expect((await res.json()).data).toBeNull();
  });
});

describe('GET /homepage-sections', () => {
  it('200 returns empty array', async () => {
    const res = await mkApp().request('/api/v1/cms/homepage-sections');
    expect(res.status).toBe(200);
    expect((await res.json()).data).toEqual([]);
  });
});

describe('GET /pages/:slug', () => {
  it('200 returns null', async () => {
    const res = await mkApp().request('/api/v1/cms/pages/about');
    expect(res.status).toBe(200);
    expect((await res.json()).data).toBeNull();
  });
});
