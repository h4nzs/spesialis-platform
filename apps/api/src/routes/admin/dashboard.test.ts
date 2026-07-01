import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Hono } from 'hono';
import { dashboardRouter } from './dashboard.ts';
import { errorHandler } from '../../middleware/error-handler.ts';
import { setTestEnv, makeChain } from '../../test-utils.ts';

const { mockDb, authState, em } = vi.hoisted(() => {
  const db = {
    select: vi.fn(),
    insert: vi.fn(),
    update: vi.fn(),
    delete: vi.fn().mockReturnValue({ where: vi.fn().mockResolvedValue(undefined) }),
    execute: vi.fn().mockResolvedValue([]),
    transaction: vi.fn((fn: (tx: unknown) => unknown) => fn(db)),
  };
  const st = { userId: 'aid', userRole: 'admin' };
  const exps = (globalThis as any).__TABLE_EXPORTS as Record<string, unknown>;
  return { mockDb: db, authState: st, em: exps };
});

vi.mock('../../lib/db.ts', () => ({ db: mockDb, ...em }));
vi.mock('../../middleware/auth.ts', () => ({
  authMiddleware: async (c: any, next: any) => {
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
    async (c: any, next: any) => {
      if (!roles.includes(authState.userRole)) {
        c.status(403);
        return c.json({ success: false, code: 'FORBIDDEN', message: 'Forbidden' });
      }
      await next();
    },
}));

function mkApp(role: string) {
  authState.userRole = role;
  authState.userId = 'aid';
  const app = new Hono();
  app.onError(errorHandler);
  app.route('/api/v1/admin/dashboard', dashboardRouter);
  return app;
}

beforeEach(() => {
  setTestEnv();
  vi.clearAllMocks();
  mockDb.transaction.mockImplementation((fn: (tx: unknown) => unknown) => fn(mockDb));
});

function withAuth() {
  return { headers: { Authorization: 'Bearer x' } };
}

describe('GET /api/v1/admin/dashboard', () => {
  it('full stats for admin', async () => {
    mockDb.select.mockReturnValue(makeChain([{ count: 0 }]));
    const res = await mkApp('admin').request('/api/v1/admin/dashboard', withAuth());
    expect(res.status).toBe(200);
    const d = ((await res.json()) as any).data;
    expect(d.users).toBeDefined();
    expect(d.orders).toBeDefined();
    expect(d.revenue).toBeDefined();
    expect(d.complaints).toBeDefined();
    expect(d.companies).toBeDefined();
  });
  it('full stats for super_admin', async () => {
    mockDb.select.mockReturnValue(makeChain([{ count: 0 }]));
    const res = await mkApp('super_admin').request('/api/v1/admin/dashboard', withAuth());
    expect(res.status).toBe(200);
    expect(((await res.json()) as any).data.users).toBeDefined();
  });
  it('scoped for dispatcher', async () => {
    mockDb.select.mockReturnValue(makeChain([{ count: 0 }]));
    const res = await mkApp('dispatcher').request('/api/v1/admin/dashboard', withAuth());
    expect(res.status).toBe(200);
    const d = ((await res.json()) as any).data;
    expect(d.partners).toBeDefined();
    expect(d.orders).toBeDefined();
    expect(d.users).toBeUndefined();
    expect(d.revenue).toBeUndefined();
  });
  it('revenue-only for finance', async () => {
    mockDb.select.mockReturnValue(makeChain([{ count: 0 }]));
    const res = await mkApp('finance').request('/api/v1/admin/dashboard', withAuth());
    expect(res.status).toBe(200);
    const d = ((await res.json()) as any).data;
    expect(d.revenue).toBeDefined();
    expect(d.users).toBeUndefined();
    expect(d.orders).toBeUndefined();
  });
  it('403 for customer', async () => {
    const res = await mkApp('customer').request('/api/v1/admin/dashboard', withAuth());
    expect(res.status).toBe(403);
  });
  it('403 for partner', async () => {
    const res = await mkApp('partner').request('/api/v1/admin/dashboard', withAuth());
    expect(res.status).toBe(403);
  });
  it('401 without auth', async () => {
    const res = await mkApp('admin').request('/api/v1/admin/dashboard');
    expect(res.status).toBe(401);
  });
});
