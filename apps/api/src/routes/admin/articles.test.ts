import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Hono } from 'hono';
import type { Context } from 'hono';
import type { UserRole } from '@specialist/types';
import { adminArticlesRouter } from './articles.ts';
import { errorHandler } from '../../middleware/error-handler.ts';
import { setTestEnv, makeChain, updateChain, insertChain } from '../../test-utils.ts';

const { mockDb, authState, em } = vi.hoisted(() => {
  const db = {
    select: vi.fn(),
    insert: vi.fn(),
    update: vi.fn(),
    delete: vi.fn().mockReturnValue({ where: vi.fn().mockResolvedValue(undefined) }),
    execute: vi.fn().mockResolvedValue([]),
    transaction: vi.fn((fn: (tx: unknown) => unknown) => fn(db)),
  };
  const st: { userId: string; userRole: UserRole } = { userId: 'uid', userRole: 'admin' };
  const exps = (globalThis as Record<string, unknown>).__TABLE_EXPORTS as Record<string, unknown>;
  return { mockDb: db, authState: st, em: exps };
});

vi.mock('../../lib/db.ts', () => ({ db: mockDb, ...em }));
vi.mock('../../middleware/auth.ts', () => ({
  authMiddleware: async (c: Context, next: () => Promise<void>) => {
    if (!c.req.header('Authorization')) {
      c.status(401);
      return c.json({ success: false, code: 'UNAUTHORIZED', message: 'No token' });
    }
    c.set('userId', authState.userId);
    c.set('userRole', authState.userRole);
    await next();
  },
  requireRole:
    (...roles: string[]) =>
    async (c: Context, next: () => Promise<void>) => {
      if (!roles.includes(authState.userRole)) {
        c.status(403);
        return c.json({ success: false, code: 'FORBIDDEN', message: 'Forbidden' });
      }
      await next();
    },
}));

function a() {
  return { Authorization: 'Bearer x', 'Content-Type': 'application/json' };
}

function mkApp(role: UserRole = 'admin') {
  authState.userRole = role;
  authState.userId = 'uid';
  const app = new Hono();
  app.onError(errorHandler);
  app.route('/api/v1/admin/articles', adminArticlesRouter);
  return app;
}

beforeEach(() => {
  setTestEnv();
  vi.clearAllMocks();
  mockDb.select.mockReset();
  mockDb.insert.mockReset();
  mockDb.update.mockReset();
});

describe('GET /categories', () => {
  it('200', async () => {
    mockDb.select.mockReturnValueOnce(makeChain([{ id: 'c1', name: 'News', slug: 'news' }]));
    const res = await mkApp().request('/api/v1/admin/articles/categories', { headers: a() });
    expect(res.status).toBe(200);
  });

  it('403 customer', async () => {
    const res = await mkApp('customer').request('/api/v1/admin/articles/categories', {
      headers: a(),
    });
    expect(res.status).toBe(403);
  });
});

describe('POST /categories', () => {
  it('201 created', async () => {
    mockDb.select.mockReturnValueOnce(makeChain([]));
    mockDb.insert.mockReturnValueOnce(insertChain([{ id: 'c1', name: 'News', slug: 'news' }]));
    const res = await mkApp().request('/api/v1/admin/articles/categories', {
      method: 'POST',
      headers: a(),
      body: JSON.stringify({ name: 'News', slug: 'news' }),
    });
    expect(res.status).toBe(201);
  });

  it('409 slug exists', async () => {
    mockDb.select.mockReturnValueOnce(makeChain([{ id: 'c1' }]));
    const res = await mkApp().request('/api/v1/admin/articles/categories', {
      method: 'POST',
      headers: a(),
      body: JSON.stringify({ name: 'News', slug: 'news' }),
    });
    expect(res.status).toBe(409);
  });

  it('422 validation', async () => {
    const res = await mkApp().request('/api/v1/admin/articles/categories', {
      method: 'POST',
      headers: a(),
      body: JSON.stringify({}),
    });
    expect(res.status).toBe(422);
  });
});

describe('PATCH /categories/:id', () => {
  it('200 updated', async () => {
    mockDb.select.mockReturnValueOnce(makeChain([{ id: 'c1' }]));
    mockDb.update.mockReturnValueOnce(updateChain([{ id: 'c1', name: 'Updated' }]));
    const res = await mkApp().request('/api/v1/admin/articles/categories/c1', {
      method: 'PATCH',
      headers: a(),
      body: JSON.stringify({ name: 'Updated' }),
    });
    expect(res.status).toBe(200);
  });

  it('404 not found', async () => {
    mockDb.select.mockReturnValueOnce(makeChain([]));
    const res = await mkApp().request('/api/v1/admin/articles/categories/c1', {
      method: 'PATCH',
      headers: a(),
      body: JSON.stringify({ name: 'X' }),
    });
    expect(res.status).toBe(404);
  });

  it('409 slug conflict', async () => {
    mockDb.select
      .mockReturnValueOnce(makeChain([{ id: 'c1' }]))
      .mockReturnValueOnce(makeChain([{ id: 'c2' }]));
    const res = await mkApp().request('/api/v1/admin/articles/categories/c1', {
      method: 'PATCH',
      headers: a(),
      body: JSON.stringify({ slug: 'taken' }),
    });
    expect(res.status).toBe(409);
  });
});

describe('DELETE /categories/:id', () => {
  it('200 deleted', async () => {
    mockDb.select.mockReturnValueOnce(makeChain([{ id: 'c1' }]));
    const res = await mkApp('super_admin').request('/api/v1/admin/articles/categories/c1', {
      method: 'DELETE',
      headers: a(),
    });
    expect(res.status).toBe(200);
  });

  it('404 not found', async () => {
    mockDb.select.mockReturnValueOnce(makeChain([]));
    const res = await mkApp('super_admin').request('/api/v1/admin/articles/categories/c1', {
      method: 'DELETE',
      headers: a(),
    });
    expect(res.status).toBe(404);
  });

  it('403 content_manager cannot delete', async () => {
    const res = await mkApp('content_manager').request('/api/v1/admin/articles/categories/c1', {
      method: 'DELETE',
      headers: a(),
    });
    expect(res.status).toBe(403);
  });
});

describe('GET /', () => {
  it('200 list all', async () => {
    mockDb.select
      .mockReturnValueOnce(makeChain([{ id: 'a1', title: 'Article 1', slug: 'article-1' }]))
      .mockReturnValueOnce(makeChain([{ count: 1 }]));
    const res = await mkApp().request('/api/v1/admin/articles', { headers: a() });
    expect(res.status).toBe(200);
  });

  it('200 filter by status', async () => {
    mockDb.select.mockReturnValueOnce(makeChain([])).mockReturnValueOnce(makeChain([{ count: 0 }]));
    const res = await mkApp().request('/api/v1/admin/articles?status=Draft', { headers: a() });
    expect(res.status).toBe(200);
  });
});

describe('GET /:id', () => {
  it('200 found', async () => {
    mockDb.select.mockReturnValueOnce(
      makeChain([{ id: 'a1', title: 'Article 1', slug: 'article-1', content: 'Hello' }]),
    );
    const res = await mkApp().request('/api/v1/admin/articles/a1', { headers: a() });
    expect(res.status).toBe(200);
  });

  it('404 not found', async () => {
    mockDb.select.mockReturnValueOnce(makeChain([]));
    const res = await mkApp().request('/api/v1/admin/articles/a1', { headers: a() });
    expect(res.status).toBe(404);
  });
});

describe('POST /', () => {
  it('201 created draft', async () => {
    mockDb.select.mockReturnValueOnce(makeChain([]));
    mockDb.insert.mockReturnValueOnce(
      insertChain([{ id: 'a1', title: 'My Article', slug: 'my-article', status: 'Draft' }]),
    );
    const res = await mkApp().request('/api/v1/admin/articles', {
      method: 'POST',
      headers: a(),
      body: JSON.stringify({ title: 'My Article', slug: 'my-article', content: 'Hello' }),
    });
    expect(res.status).toBe(201);
  });

  it('201 created published', async () => {
    mockDb.select.mockReturnValueOnce(makeChain([]));
    mockDb.insert.mockReturnValueOnce(
      insertChain([
        {
          id: 'a1',
          title: 'Published',
          slug: 'pub',
          status: 'Published',
          publishedAt: new Date().toISOString(),
        },
      ]),
    );
    const res = await mkApp().request('/api/v1/admin/articles', {
      method: 'POST',
      headers: a(),
      body: JSON.stringify({
        title: 'Published',
        slug: 'pub',
        content: 'Hello',
        status: 'Published',
      }),
    });
    expect(res.status).toBe(201);
  });

  it('409 slug exists', async () => {
    mockDb.select.mockReturnValueOnce(makeChain([{ id: 'existing' }]));
    const res = await mkApp().request('/api/v1/admin/articles', {
      method: 'POST',
      headers: a(),
      body: JSON.stringify({ title: 'My Article', slug: 'my-article', content: 'Hello' }),
    });
    expect(res.status).toBe(409);
  });

  it('422 validation', async () => {
    const res = await mkApp().request('/api/v1/admin/articles', {
      method: 'POST',
      headers: a(),
      body: JSON.stringify({}),
    });
    expect(res.status).toBe(422);
  });
});

describe('PATCH /:id', () => {
  it('200 updated', async () => {
    mockDb.select.mockReturnValueOnce(
      makeChain([{ id: 'a1', status: 'Draft', publishedAt: null }]),
    );
    mockDb.update.mockReturnValueOnce(updateChain([{ id: 'a1', title: 'Updated' }]));
    const res = await mkApp().request('/api/v1/admin/articles/a1', {
      method: 'PATCH',
      headers: a(),
      body: JSON.stringify({ title: 'Updated' }),
    });
    expect(res.status).toBe(200);
  });

  it('200 published sets publishedAt', async () => {
    mockDb.select.mockReturnValueOnce(
      makeChain([{ id: 'a1', status: 'Draft', publishedAt: null }]),
    );
    mockDb.update.mockReturnValueOnce(
      updateChain([{ id: 'a1', title: 'Published', status: 'Published' }]),
    );
    const res = await mkApp().request('/api/v1/admin/articles/a1', {
      method: 'PATCH',
      headers: a(),
      body: JSON.stringify({ status: 'Published' }),
    });
    expect(res.status).toBe(200);
  });

  it('404 not found', async () => {
    mockDb.select.mockReturnValueOnce(makeChain([]));
    const res = await mkApp().request('/api/v1/admin/articles/a1', {
      method: 'PATCH',
      headers: a(),
      body: JSON.stringify({ title: 'X' }),
    });
    expect(res.status).toBe(404);
  });

  it('409 slug conflict', async () => {
    mockDb.select
      .mockReturnValueOnce(makeChain([{ id: 'a1', status: 'Draft', publishedAt: null }]))
      .mockReturnValueOnce(makeChain([{ id: 'other' }]));
    const res = await mkApp().request('/api/v1/admin/articles/a1', {
      method: 'PATCH',
      headers: a(),
      body: JSON.stringify({ slug: 'taken' }),
    });
    expect(res.status).toBe(409);
  });

  it('422 validation', async () => {
    const res = await mkApp().request('/api/v1/admin/articles/a1', {
      method: 'PATCH',
      headers: a(),
      body: JSON.stringify({ slug: '' }),
    });
    expect(res.status).toBe(422);
  });
});

describe('DELETE /:id', () => {
  it('200 soft deleted', async () => {
    mockDb.select.mockReturnValueOnce(makeChain([{ id: 'a1' }]));
    mockDb.update.mockReturnValueOnce(updateChain([]));
    const res = await mkApp('super_admin').request('/api/v1/admin/articles/a1', {
      method: 'DELETE',
      headers: a(),
    });
    expect(res.status).toBe(200);
  });

  it('404 not found', async () => {
    mockDb.select.mockReturnValueOnce(makeChain([]));
    const res = await mkApp('super_admin').request('/api/v1/admin/articles/a1', {
      method: 'DELETE',
      headers: a(),
    });
    expect(res.status).toBe(404);
  });

  it('403 customer', async () => {
    const res = await mkApp('customer').request('/api/v1/admin/articles/a1', {
      method: 'DELETE',
      headers: a(),
    });
    expect(res.status).toBe(403);
  });
});
