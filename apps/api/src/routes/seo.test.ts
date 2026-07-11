import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Hono } from 'hono';
import type { Context } from 'hono';
import type { UserRole } from '@ahlipanggilan/types';
import { seoRouter } from './seo.ts';
import { errorHandler } from '../middleware/error-handler.ts';
import { setTestEnv, makeChain, insertChain, updateChain } from '../test-utils.ts';
import type { ApiTestResponse } from '../test-utils.ts';

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

vi.mock('../lib/db.ts', () => ({ db: mockDb, ...em }));

vi.mock('../middleware/auth.ts', () => ({
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

// Mock the requirePermission middleware to mirror the old requireRole for seo routes
vi.mock('../middleware/seo-permissions.ts', () => ({
  requirePermission: (_permission: string) => async (c: Context, next: () => Promise<void>) => {
    // Allow admin, super_admin, content_manager for seo routes (matching DEFAULT_PERMISSIONS)
    const allowedRoles = ['admin', 'super_admin', 'content_manager'];
    if (!allowedRoles.includes(authState.userRole)) {
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
  app.route('/api/v1/seo', seoRouter);
  return app;
}

beforeEach(() => {
  setTestEnv();
  vi.clearAllMocks();
  mockDb.select.mockReset();
  mockDb.insert.mockReset();
  mockDb.update.mockReset();
});

const validBody = { entityType: 'Article', entityId: UUID, metaTitle: 'SEO Title' };

describe('GET /', () => {
  it('200 list all', async () => {
    mockDb.select.mockReturnValueOnce(
      makeChain([{ id: UUID, entityType: 'Article', entityId: UUID }]),
    );
    const res = await mkApp().request('/api/v1/seo', { headers: a() });
    const body = (await res.json()) as ApiTestResponse;
    expect(res.status).toBe(200);
    expect(body.success).toBe(true);
    expect(Array.isArray(body.data)).toBe(true);
  });

  it('200 empty', async () => {
    mockDb.select.mockReturnValueOnce(makeChain([]));
    const res = await mkApp().request('/api/v1/seo', { headers: a() });
    const body = (await res.json()) as ApiTestResponse;
    expect(res.status).toBe(200);
    expect(body.success).toBe(true);
    expect(body.data).toEqual([]);
  });

  it('403 customer', async () => {
    const res = await mkApp('customer').request('/api/v1/seo', { headers: a() });
    const body = (await res.json()) as ApiTestResponse;
    expect(res.status).toBe(403);
    expect(body.success).toBe(false);
  });

  it('200 content_manager', async () => {
    mockDb.select.mockReturnValueOnce(makeChain([]));
    const res = await mkApp('content_manager').request('/api/v1/seo', { headers: a() });
    const body = (await res.json()) as ApiTestResponse;
    expect(res.status).toBe(200);
    expect(body.success).toBe(true);
  });
});

describe('GET /:id', () => {
  it('200 found', async () => {
    mockDb.select.mockReturnValueOnce(makeChain([{ id: UUID }]));
    const res = await mkApp().request(`/api/v1/seo/${UUID}`, { headers: a() });
    const body = (await res.json()) as ApiTestResponse;
    expect(res.status).toBe(200);
    expect(body.success).toBe(true);
    expect(body.data).toBeDefined();
  });

  it('404 not found', async () => {
    mockDb.select.mockReturnValueOnce(makeChain([]));
    const res = await mkApp().request(`/api/v1/seo/${UUID}`, { headers: a() });
    const body = (await res.json()) as ApiTestResponse;
    expect(res.status).toBe(404);
    expect(body.success).toBe(false);
  });
});

describe('POST /', () => {
  it('201 created', async () => {
    mockDb.select.mockReturnValueOnce(makeChain([]));
    mockDb.insert.mockReturnValueOnce(insertChain([{ id: UUID, ...validBody }]));
    const res = await mkApp().request('/api/v1/seo', {
      method: 'POST',
      headers: a(),
      body: JSON.stringify(validBody),
    });
    const body = (await res.json()) as ApiTestResponse;
    expect(res.status).toBe(201);
    expect(body.success).toBe(true);
    expect(body.data).toBeDefined();
  });

  it('200 updated existing', async () => {
    mockDb.select.mockReturnValueOnce(makeChain([{ id: UUID }]));
    mockDb.update.mockReturnValueOnce(updateChain([{ id: UUID, ...validBody }]));
    const res = await mkApp().request('/api/v1/seo', {
      method: 'POST',
      headers: a(),
      body: JSON.stringify(validBody),
    });
    const body = (await res.json()) as ApiTestResponse;
    expect(res.status).toBe(200);
    expect(body.success).toBe(true);
    expect(body.data).toBeDefined();
  });

  it('422 validation', async () => {
    const res = await mkApp().request('/api/v1/seo', {
      method: 'POST',
      headers: a(),
      body: JSON.stringify({}),
    });
    const body = (await res.json()) as ApiTestResponse;
    expect(res.status).toBe(422);
    expect(body.success).toBe(false);
  });
});

describe('PATCH /:id', () => {
  it('200 updated', async () => {
    mockDb.select.mockReturnValueOnce(makeChain([{ id: UUID }]));
    mockDb.update.mockReturnValueOnce(updateChain([{ id: UUID, metaTitle: 'Updated' }]));
    const res = await mkApp().request(`/api/v1/seo/${UUID}`, {
      method: 'PATCH',
      headers: a(),
      body: JSON.stringify({ metaTitle: 'Updated' }),
    });
    const body = (await res.json()) as ApiTestResponse;
    expect(res.status).toBe(200);
    expect(body.success).toBe(true);
    expect(body.data).toBeDefined();
  });

  it('404 not found', async () => {
    mockDb.select.mockReturnValueOnce(makeChain([]));
    const res = await mkApp().request(`/api/v1/seo/${UUID}`, {
      method: 'PATCH',
      headers: a(),
      body: JSON.stringify({ metaTitle: 'Updated' }),
    });
    const body = (await res.json()) as ApiTestResponse;
    expect(res.status).toBe(404);
    expect(body.success).toBe(false);
  });
});

describe('DELETE /:id', () => {
  it('200 deleted', async () => {
    mockDb.delete = vi.fn().mockReturnValue({ where: vi.fn().mockResolvedValue(undefined) });
    mockDb.select.mockReturnValueOnce(makeChain([{ id: UUID }]));
    const res = await mkApp().request(`/api/v1/seo/${UUID}`, {
      method: 'DELETE',
      headers: a(),
    });
    const body = (await res.json()) as ApiTestResponse;
    expect(res.status).toBe(200);
    expect(body.success).toBe(true);
  });

  it('404 not found', async () => {
    mockDb.select.mockReturnValueOnce(makeChain([]));
    const res = await mkApp().request(`/api/v1/seo/${UUID}`, {
      method: 'DELETE',
      headers: a(),
    });
    const body = (await res.json()) as ApiTestResponse;
    expect(res.status).toBe(404);
    expect(body.success).toBe(false);
  });
});
