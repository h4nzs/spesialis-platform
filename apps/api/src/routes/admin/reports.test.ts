import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Hono } from 'hono';
import type { Context } from 'hono';
import type { UserRole } from '@specialist/types';
import { adminReportsRouter } from './reports.ts';
import { setTestEnv, makeChain } from '../../test-utils.ts';

const { mockDb, authState, em } = vi.hoisted(() => {
  const db = {
    select: vi.fn(),
    insert: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
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
  app.route('/api/v1/admin/reports', adminReportsRouter);
  return app;
}

beforeEach(() => {
  setTestEnv();
  vi.clearAllMocks();
  mockDb.execute.mockResolvedValue([]);
});

describe('GET /', () => {
  it('200 returns all report sections', async () => {
    const res = await mkApp().request('/api/v1/admin/reports', { headers: a() });
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.success).toBe(true);
    expect(body.data).toBeDefined();
    expect(body.data.summary).toBeDefined();
    expect(body.data.revenueByMonth).toBeDefined();
    expect(body.data.ordersByStatus).toBeDefined();
    expect(body.data.ordersByDay).toBeDefined();
    expect(body.data.topServices).toBeDefined();
  });

  it('200 summary has correct fields', async () => {
    const res = await mkApp().request('/api/v1/admin/reports', { headers: a() });
    expect(res.status).toBe(200);
    const { data } = await res.json();
    expect(data.summary).toHaveProperty('totalOrders');
    expect(data.summary).toHaveProperty('totalPartners');
    expect(data.summary).toHaveProperty('avgRating');
    expect(data.summary).toHaveProperty('totalCompletedJobs');
  });

  it('403 customer', async () => {
    const res = await mkApp('customer').request('/api/v1/admin/reports', { headers: a() });
    expect(res.status).toBe(403);
  });

  it('403 content_manager', async () => {
    const res = await mkApp('content_manager').request('/api/v1/admin/reports', { headers: a() });
    expect(res.status).toBe(403);
  });
});
