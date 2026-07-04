import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Hono } from 'hono';
import { articlesRouter } from './articles.ts';
import { errorHandler } from '../middleware/error-handler.ts';
import { setTestEnv, makeChain } from '../test-utils.ts';

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
  app.route('/api/v1/articles', articlesRouter);
  return app;
}

beforeEach(() => {
  setTestEnv();
  vi.clearAllMocks();
  mockDb.select.mockReset();
});

describe('GET /', () => {
  it('200 list published articles', async () => {
    mockDb.select
      .mockReturnValueOnce(
        makeChain([
          {
            id: 'a1',
            title: 'Article 1',
            slug: 'article-1',
            status: 'Published',
            categoryName: 'News',
            categorySlug: 'news',
            publishedAt: '2025-01-01',
          },
        ]),
      )
      .mockReturnValueOnce(makeChain([{ count: 1 }]));
    const res = await mkApp().request('/api/v1/articles');
    expect(res.status).toBe(200);
    const j = (await res.json()) as { success: boolean; data: unknown[] };
    expect(j.success).toBe(true);
  });

  it('200 filter by category', async () => {
    mockDb.select.mockReturnValueOnce(makeChain([])).mockReturnValueOnce(makeChain([{ count: 0 }]));
    const res = await mkApp().request('/api/v1/articles?category=news');
    expect(res.status).toBe(200);
  });

  it('200 pagination params', async () => {
    mockDb.select
      .mockReturnValueOnce(
        makeChain([
          {
            id: 'a1',
            title: 'A',
            slug: 'a',
            status: 'Published',
            categoryName: 'News',
            categorySlug: 'news',
            publishedAt: '2025-01-01',
          },
        ]),
      )
      .mockReturnValueOnce(makeChain([{ count: 1 }]));
    const res = await mkApp().request('/api/v1/articles?page=2&limit=10');
    expect(res.status).toBe(200);
  });
});

describe('GET /categories', () => {
  it('200 list categories', async () => {
    mockDb.select.mockReturnValueOnce(
      makeChain([{ id: 'c1', name: 'News', slug: 'news', description: null }]),
    );
    const res = await mkApp().request('/api/v1/articles/categories');
    expect(res.status).toBe(200);
    const j = (await res.json()) as { data: unknown[] };
    expect(Array.isArray(j.data)).toBe(true);
  });
});

describe('GET /:slug', () => {
  it('200 found', async () => {
    mockDb.select.mockReturnValueOnce(
      makeChain([
        {
          id: 'a1',
          title: 'Article 1',
          slug: 'article-1',
          content: 'Hello',
          status: 'Published',
          categoryName: 'News',
          categorySlug: 'news',
        },
      ]),
    );
    const res = await mkApp().request('/api/v1/articles/article-1');
    expect(res.status).toBe(200);
    const j = (await res.json()) as { data: { title: string } };
    expect(j.data.title).toBe('Article 1');
  });

  it('404 not found', async () => {
    mockDb.select.mockReturnValueOnce(makeChain([]));
    const res = await mkApp().request('/api/v1/articles/unknown');
    expect(res.status).toBe(404);
  });
});
