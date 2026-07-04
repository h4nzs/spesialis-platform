import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Hono } from 'hono';
import type { Context } from 'hono';
import type { UserRole } from '@specialist/types';
import { adminUsersRouter } from './users.ts';
import { errorHandler } from '../../middleware/error-handler.ts';
import { setTestEnv, makeChain, updateChain } from '../../test-utils.ts';

const mockRateLimit = vi.hoisted(() => ({
  rateLimit: () => async (_c: unknown, next: () => unknown) => next(),
}));

const { mockDb, authState, mockAudit, em } = vi.hoisted(() => {
  const db = {
    select: vi.fn(),
    insert: vi.fn(),
    update: vi.fn(),
    delete: vi.fn().mockReturnValue({ where: vi.fn().mockResolvedValue(undefined) }),
    execute: vi.fn().mockResolvedValue([]),
    transaction: vi.fn((fn: (tx: unknown) => unknown) => fn(db)),
  };
  const st: { userId: string; userRole: UserRole } = { userId: 'uid', userRole: 'admin' };
  const ax = { createAuditLog: vi.fn().mockResolvedValue(undefined) };
  const exps = (globalThis as Record<string, unknown>).__TABLE_EXPORTS as Record<string, unknown>;
  return { mockDb: db, authState: st, mockAudit: ax, em: exps };
});

vi.mock('../../lib/db.ts', () => ({ db: mockDb, ...em }));
vi.mock('../../lib/auth.ts', () => ({
  verifyAccessToken: vi.fn().mockResolvedValue({ sub: 'uid', role: 'admin', exp: 9999999999 }),
}));
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
vi.mock('../../lib/audit.ts', () => ({ ...mockAudit }));
vi.mock('../../middleware/rate-limiter.ts', () => mockRateLimit);

function mkApp(role: UserRole = 'admin') {
  authState.userRole = role;
  authState.userId = 'uid';
  const app = new Hono();
  app.onError(errorHandler);
  app.route('/api/v1/admin/users', adminUsersRouter);
  return app;
}

function a() {
  return { Authorization: 'Bearer x', 'Content-Type': 'application/json' };
}

beforeEach(() => {
  setTestEnv();
  vi.clearAllMocks();
  mockDb.select.mockReturnValue(makeChain([]));
  mockDb.update.mockReturnValue(updateChain([]));
});

const USER_ID = '550e8400-e29b-41d4-a716-446655440001';

describe('GET /api/v1/admin/users', () => {
  it('200 paginated', async () => {
    mockDb.select.mockReturnValueOnce(
      makeChain([
        {
          id: USER_ID,
          email: 'user@test.com',
          phone: '08123456789',
          role: 'customer',
          status: 'Active',
          emailVerifiedAt: null,
          lastLoginAt: null,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ]),
    );
    mockDb.select.mockReturnValueOnce(makeChain([{ count: 1 }]));

    const res = await mkApp().request('/api/v1/admin/users?page=1&limit=10', { headers: a() });
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.data).toHaveLength(1);
    expect(body.pagination).toBeDefined();
    expect(body.pagination.total).toBe(1);
  });

  it('200 filtered by role', async () => {
    mockDb.select.mockReturnValueOnce(makeChain([]));
    mockDb.select.mockReturnValueOnce(makeChain([{ count: 0 }]));

    const res = await mkApp().request('/api/v1/admin/users?role=partner', { headers: a() });
    expect(res.status).toBe(200);
  });

  it('200 search', async () => {
    mockDb.select.mockReturnValueOnce(makeChain([]));
    mockDb.select.mockReturnValueOnce(makeChain([{ count: 0 }]));

    const res = await mkApp().request('/api/v1/admin/users?search=test@', { headers: a() });
    expect(res.status).toBe(200);
  });

  it('401 without auth', async () => {
    const res = await mkApp().request('/api/v1/admin/users');
    expect(res.status).toBe(401);
  });

  it('403 for customer', async () => {
    const res = await mkApp('customer').request('/api/v1/admin/users', { headers: a() });
    expect(res.status).toBe(403);
  });
});

describe('PATCH /api/v1/admin/users/:id/status', () => {
  it('200 update status', async () => {
    mockDb.select.mockReturnValueOnce(makeChain([{ id: USER_ID, status: 'Active' }]));
    mockDb.update.mockReturnValue(
      updateChain([{ id: USER_ID, email: 'u@t.com', role: 'customer', status: 'suspended' }]),
    );

    const res = await mkApp().request(`/api/v1/admin/users/${USER_ID}/status`, {
      method: 'PATCH',
      headers: a(),
      body: JSON.stringify({ status: 'suspended' }),
    });
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.data.status).toBe('suspended');
  });

  it('404 user not found', async () => {
    const res = await mkApp().request(`/api/v1/admin/users/${USER_ID}/status`, {
      method: 'PATCH',
      headers: a(),
      body: JSON.stringify({ status: 'suspended' }),
    });
    expect(res.status).toBe(404);
  });

  it('422 invalid status', async () => {
    const res = await mkApp().request(`/api/v1/admin/users/${USER_ID}/status`, {
      method: 'PATCH',
      headers: a(),
      body: JSON.stringify({ status: 'invalid' }),
    });
    expect(res.status).toBe(422);
  });

  it('401 without auth', async () => {
    const res = await mkApp().request(`/api/v1/admin/users/${USER_ID}/status`, {
      method: 'PATCH',
    });
    expect(res.status).toBe(401);
  });
});
