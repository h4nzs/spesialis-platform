import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Hono } from 'hono';
import type { Context } from 'hono';
import type { UserRole } from '@ahlipanggilan/types';
import { adminServicesRouter } from './services.ts';
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

const UUID = '550e8400-e29b-41d4-a716-446655440000';
function a() {
  return { Authorization: 'Bearer x', 'Content-Type': 'application/json' };
}

function mkApp(role: UserRole = 'admin') {
  authState.userRole = role;
  authState.userId = 'uid';
  const app = new Hono();
  app.onError(errorHandler);
  app.route('/api/v1/admin/services', adminServicesRouter);
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
    mockDb.select
      .mockReturnValueOnce(
        makeChain([
          {
            id: 's1',
            name: 'Service 1',
            slug: 'service-1',
            basePrice: '100000',
            categoryName: 'Category',
          },
        ]),
      )
      .mockReturnValueOnce(makeChain([{ count: 1 }]));
    const res = await mkApp().request('/api/v1/admin/services', { headers: a() });
    expect(res.status).toBe(200);
  });

  it('200 content_manager', async () => {
    mockDb.select.mockReturnValueOnce(makeChain([])).mockReturnValueOnce(makeChain([{ count: 0 }]));
    const res = await mkApp('content_manager').request('/api/v1/admin/services', { headers: a() });
    expect(res.status).toBe(200);
  });

  it('403 customer', async () => {
    const res = await mkApp('customer').request('/api/v1/admin/services', { headers: a() });
    expect(res.status).toBe(403);
  });
});

describe('GET /:id', () => {
  it('200 found', async () => {
    mockDb.select.mockReturnValueOnce(makeChain([{ id: 's1', name: 'Service 1' }]));
    const res = await mkApp().request('/api/v1/admin/services/s1', { headers: a() });
    expect(res.status).toBe(200);
  });

  it('404 not found', async () => {
    mockDb.select.mockReturnValueOnce(makeChain([]));
    const res = await mkApp().request('/api/v1/admin/services/s1', { headers: a() });
    expect(res.status).toBe(404);
  });
});

describe('POST /', () => {
  const validBody = { categoryId: UUID, name: 'Service 1', slug: 'service-1', basePrice: '100000' };

  it('201 created', async () => {
    mockDb.select.mockReturnValueOnce(makeChain([]));
    mockDb.insert.mockReturnValueOnce(
      insertChain([{ id: 's1', name: 'Service 1', slug: 'service-1' }]),
    );
    const res = await mkApp().request('/api/v1/admin/services', {
      method: 'POST',
      headers: a(),
      body: JSON.stringify(validBody),
    });
    expect(res.status).toBe(201);
  });

  it('409 slug exists', async () => {
    mockDb.select.mockReturnValueOnce(makeChain([{ id: 'existing' }]));
    const res = await mkApp().request('/api/v1/admin/services', {
      method: 'POST',
      headers: a(),
      body: JSON.stringify(validBody),
    });
    expect(res.status).toBe(409);
  });

  it('422 validation', async () => {
    const res = await mkApp().request('/api/v1/admin/services', {
      method: 'POST',
      headers: a(),
      body: JSON.stringify({}),
    });
    expect(res.status).toBe(422);
  });

  it('403 customer', async () => {
    const res = await mkApp('customer').request('/api/v1/admin/services', {
      method: 'POST',
      headers: a(),
      body: JSON.stringify(validBody),
    });
    expect(res.status).toBe(403);
  });
});

describe('PATCH /:id', () => {
  it('200 updated', async () => {
    mockDb.select.mockReturnValueOnce(makeChain([{ id: 's1' }]));
    mockDb.update.mockReturnValueOnce(updateChain([{ id: 's1', name: 'Updated' }]));
    const res = await mkApp().request('/api/v1/admin/services/s1', {
      method: 'PATCH',
      headers: a(),
      body: JSON.stringify({ name: 'Updated' }),
    });
    expect(res.status).toBe(200);
  });

  it('404 not found', async () => {
    mockDb.select.mockReturnValueOnce(makeChain([]));
    const res = await mkApp().request('/api/v1/admin/services/s1', {
      method: 'PATCH',
      headers: a(),
      body: JSON.stringify({ name: 'Updated' }),
    });
    expect(res.status).toBe(404);
  });

  it('409 slug conflict', async () => {
    mockDb.select
      .mockReturnValueOnce(makeChain([{ id: 's1' }]))
      .mockReturnValueOnce(makeChain([{ id: 'other' }]));
    const res = await mkApp().request('/api/v1/admin/services/s1', {
      method: 'PATCH',
      headers: a(),
      body: JSON.stringify({ slug: 'taken-slug' }),
    });
    expect(res.status).toBe(409);
  });

  it('422 validation', async () => {
    const res = await mkApp().request('/api/v1/admin/services/s1', {
      method: 'PATCH',
      headers: a(),
      body: JSON.stringify({ slug: '' }),
    });
    expect(res.status).toBe(422);
  });
});

describe('DELETE /:id', () => {
  it('200 deactivated', async () => {
    mockDb.select.mockReturnValueOnce(makeChain([{ id: 's1' }]));
    mockDb.update.mockReturnValueOnce(updateChain([]));
    const res = await mkApp().request('/api/v1/admin/services/s1', {
      method: 'DELETE',
      headers: a(),
    });
    expect(res.status).toBe(200);
  });

  it('404 not found', async () => {
    mockDb.select.mockReturnValueOnce(makeChain([]));
    const res = await mkApp().request('/api/v1/admin/services/s1', {
      method: 'DELETE',
      headers: a(),
    });
    expect(res.status).toBe(404);
  });
});
