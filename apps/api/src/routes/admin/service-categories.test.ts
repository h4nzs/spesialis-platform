import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Hono } from 'hono';
import type { Context } from 'hono';
import type { UserRole } from '@ahlipanggilan/types';
import { adminServiceCategoriesRouter } from './service-categories.ts';
import { setTestEnv, makeChain, insertChain, updateChain } from '../../test-utils.ts';

const { mockDb, authState, em } = vi.hoisted(() => {
  const db = {
    select: vi.fn(),
    insert: vi.fn(),
    update: vi.fn(),
    delete: vi.fn().mockReturnValue({ where: vi.fn().mockResolvedValue(undefined) }),
    execute: vi.fn().mockResolvedValue([]),
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
  app.route('/api/v1/admin/service-categories', adminServiceCategoriesRouter);
  return app;
}

beforeEach(() => {
  setTestEnv();
  vi.clearAllMocks();
  mockDb.select.mockReset();
  mockDb.insert.mockReset();
  mockDb.update.mockReset();
});

describe('GET /', () => {
  it('200 list all', async () => {
    mockDb.select.mockReturnValueOnce(makeChain([{ id: 'c1', name: 'AC', slug: 'ac' }]));
    const res = await mkApp().request('/api/v1/admin/service-categories', { headers: a() });
    expect(res.status).toBe(200);
  });

  it('200 content_manager', async () => {
    mockDb.select.mockReturnValueOnce(makeChain([]));
    const res = await mkApp('content_manager').request('/api/v1/admin/service-categories', {
      headers: a(),
    });
    expect(res.status).toBe(200);
  });

  it('403 customer', async () => {
    const res = await mkApp('customer').request('/api/v1/admin/service-categories', {
      headers: a(),
    });
    expect(res.status).toBe(403);
  });
});

describe('POST /', () => {
  it('201 created', async () => {
    mockDb.select.mockReturnValueOnce(makeChain([]));
    mockDb.insert.mockReturnValueOnce(insertChain([{ id: 'c1', name: 'AC', slug: 'ac' }]));
    const res = await mkApp().request('/api/v1/admin/service-categories', {
      method: 'POST',
      headers: a(),
      body: JSON.stringify({ name: 'AC', slug: 'ac' }),
    });
    expect(res.status).toBe(201);
  });

  it('409 slug exists', async () => {
    mockDb.select.mockReturnValueOnce(makeChain([{ id: 'existing' }]));
    const res = await mkApp().request('/api/v1/admin/service-categories', {
      method: 'POST',
      headers: a(),
      body: JSON.stringify({ name: 'AC', slug: 'ac' }),
    });
    expect(res.status).toBe(409);
  });

  it('422 empty name', async () => {
    const res = await mkApp().request('/api/v1/admin/service-categories', {
      method: 'POST',
      headers: a(),
      body: JSON.stringify({}),
    });
    expect(res.status).toBe(422);
  });

  it('403 customer', async () => {
    const res = await mkApp('customer').request('/api/v1/admin/service-categories', {
      method: 'POST',
      headers: a(),
      body: JSON.stringify({ name: 'AC' }),
    });
    expect(res.status).toBe(403);
  });
});

describe('PATCH /:id', () => {
  it('200 updated', async () => {
    mockDb.select.mockReturnValueOnce(makeChain([{ id: 'c1' }]));
    mockDb.update.mockReturnValueOnce(updateChain([{ id: 'c1', name: 'Updated' }]));
    const res = await mkApp().request('/api/v1/admin/service-categories/c1', {
      method: 'PATCH',
      headers: a(),
      body: JSON.stringify({ name: 'Updated' }),
    });
    expect(res.status).toBe(200);
  });

  it('404 not found', async () => {
    mockDb.select.mockReturnValueOnce(makeChain([]));
    const res = await mkApp().request('/api/v1/admin/service-categories/c1', {
      method: 'PATCH',
      headers: a(),
      body: JSON.stringify({ name: 'Updated' }),
    });
    expect(res.status).toBe(404);
  });

  it('422 invalid slug', async () => {
    mockDb.select.mockReturnValueOnce(makeChain([{ id: 'c1' }]));
    const res = await mkApp().request('/api/v1/admin/service-categories/c1', {
      method: 'PATCH',
      headers: a(),
      body: JSON.stringify({ slug: '' }),
    });
    expect(res.status).toBe(422);
  });
});

describe('DELETE /:id', () => {
  it('200 deactivated', async () => {
    mockDb.select.mockReturnValueOnce(makeChain([{ id: 'c1' }]));
    mockDb.update.mockReturnValueOnce({
      set: vi.fn().mockReturnValue({ where: vi.fn().mockResolvedValue(undefined) }),
    });
    const res = await mkApp().request('/api/v1/admin/service-categories/c1', {
      method: 'DELETE',
      headers: a(),
    });
    expect(res.status).toBe(200);
  });

  it('404 not found', async () => {
    mockDb.select.mockReturnValueOnce(makeChain([]));
    const res = await mkApp().request('/api/v1/admin/service-categories/c1', {
      method: 'DELETE',
      headers: a(),
    });
    expect(res.status).toBe(404);
  });
});
