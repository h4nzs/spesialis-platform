import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Hono } from 'hono';
import type { Context } from 'hono';
import type { UserRole } from '@specialist/types';
import { adminOrdersRouter } from './orders.ts';
import { errorHandler } from '../../middleware/error-handler.ts';
import { setTestEnv, makeChain, insertChain, updateChain } from '../../test-utils.ts';

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
  hashPassword: vi.fn().mockResolvedValue('h'),
  verifyPassword: vi.fn().mockResolvedValue(true),
  signAccessToken: vi.fn().mockResolvedValue('t'),
  verifyAccessToken: vi.fn().mockResolvedValue({ sub: 'uid', role: 'admin', exp: 9999999999 }),
  generateRefreshToken: vi.fn().mockReturnValue('r'),
  hashToken: vi.fn().mockReturnValue('h'),
  getRefreshTokenExpiry: vi.fn().mockReturnValue(new Date(Date.now() + 86400000)),
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
  app.route('/api/v1/admin/orders', adminOrdersRouter);
  return app;
}

function a() {
  return { Authorization: 'Bearer x', 'Content-Type': 'application/json' };
}

const orderId = '00000000-0000-0000-0000-000000000001';

beforeEach(() => {
  setTestEnv();
  vi.clearAllMocks();
  mockDb.select.mockReturnValue(makeChain([]));
  mockDb.insert.mockReturnValue(insertChain([]));
  mockDb.update.mockReturnValue(updateChain([]));
});

describe('PATCH /api/v1/admin/orders/:id/discount', () => {
  it('200 discount percent', async () => {
    mockDb.select.mockReturnValue(
      makeChain([{ id: orderId, discountPercent: null, discountAmount: '0' }]),
    );
    mockDb.update.mockReturnValue(updateChain([{ id: orderId, discountPercent: '10' }]));
    const res = await mkApp().request(`/api/v1/admin/orders/${orderId}/discount`, {
      method: 'PATCH',
      headers: a(),
      body: JSON.stringify({ discountPercent: 10 }),
    });
    expect(res.status).toBe(200);
  });

  it('200 discount amount', async () => {
    mockDb.select.mockReturnValue(
      makeChain([{ id: orderId, discountPercent: null, discountAmount: '0' }]),
    );
    mockDb.update.mockReturnValue(updateChain([{ id: orderId, discountAmount: '50000' }]));
    const res = await mkApp().request(`/api/v1/admin/orders/${orderId}/discount`, {
      method: 'PATCH',
      headers: a(),
      body: JSON.stringify({ discountAmount: 50000 }),
    });
    expect(res.status).toBe(200);
  });

  it('200 both percent and amount', async () => {
    mockDb.select.mockReturnValue(
      makeChain([{ id: orderId, discountPercent: null, discountAmount: '0' }]),
    );
    const res = await mkApp().request(`/api/v1/admin/orders/${orderId}/discount`, {
      method: 'PATCH',
      headers: a(),
      body: JSON.stringify({ discountPercent: 10, discountAmount: 20000 }),
    });
    expect(res.status).toBe(200);
  });

  it('404 order not found', async () => {
    mockDb.select.mockReturnValue(makeChain([]));
    const res = await mkApp().request(`/api/v1/admin/orders/${orderId}/discount`, {
      method: 'PATCH',
      headers: a(),
      body: JSON.stringify({ discountPercent: 10 }),
    });
    expect(res.status).toBe(404);
  });

  it('422 neither percent nor amount', async () => {
    mockDb.select.mockReturnValue(
      makeChain([{ id: orderId, discountPercent: null, discountAmount: '0' }]),
    );
    const res = await mkApp().request(`/api/v1/admin/orders/${orderId}/discount`, {
      method: 'PATCH',
      headers: a(),
      body: JSON.stringify({}),
    });
    expect(res.status).toBe(422);
  });

  it('422 percent > 100', async () => {
    mockDb.select.mockReturnValue(
      makeChain([{ id: orderId, discountPercent: null, discountAmount: '0' }]),
    );
    const res = await mkApp().request(`/api/v1/admin/orders/${orderId}/discount`, {
      method: 'PATCH',
      headers: a(),
      body: JSON.stringify({ discountPercent: 150 }),
    });
    expect(res.status).toBe(422);
  });

  it('403 customer role', async () => {
    const res = await mkApp('customer').request(`/api/v1/admin/orders/${orderId}/discount`, {
      method: 'PATCH',
      headers: a(),
      body: JSON.stringify({ discountPercent: 10 }),
    });
    expect(res.status).toBe(403);
  });

  it('401 no auth', async () => {
    const res = await mkApp().request(`/api/v1/admin/orders/${orderId}/discount`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ discountPercent: 10 }),
    });
    expect(res.status).toBe(401);
  });
});
