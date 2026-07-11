import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Hono } from 'hono';
import type { Context } from 'hono';
import type { UserRole } from '@ahlipanggilan/types';
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

describe('GET /export', () => {
  it('200 returns CSV with BOM and header', async () => {
    mockDb.select.mockReturnValue(
      makeChain([
        {
          bookingNumber: 'SP-2026-0001',
          status: 'Paid',
          basePrice: '150000',
          finalPrice: '150000',
          discountAmount: '0',
          bookingDate: '2026-07-01',
          bookingTime: '10:00',
          createdAt: new Date('2026-07-01T10:00:00Z'),
          completedAt: new Date('2026-07-01T15:00:00Z'),
          customerName: 'John Doe',
          customerEmail: 'john@test.com',
        },
      ]),
    );
    const res = await mkApp().request('/api/v1/admin/orders/export', { headers: a() });
    expect(res.status).toBe(200);
    expect(res.headers.get('Content-Type')).toBe('text/csv; charset=utf-8');
    expect(res.headers.get('Content-Disposition')).toBe('attachment; filename="orders-export.csv"');
    const text = await res.text();
    expect(text).toContain('No.Booking');
    expect(text).toContain('SP-2026-0001');
    expect(text).toContain('John Doe');
    expect(text).toContain('john@test.com');
  });

  it('200 empty CSV when no orders', async () => {
    mockDb.select.mockReturnValue(makeChain([]));
    const res = await mkApp().request('/api/v1/admin/orders/export', { headers: a() });
    expect(res.status).toBe(200);
    const text = await res.text();
    expect(text).toContain('No.Booking');
    // Only header, no data rows
    expect(text.split('\n')).toHaveLength(2);
  });

  it('403 customer role', async () => {
    const res = await mkApp('customer').request('/api/v1/admin/orders/export', { headers: a() });
    expect(res.status).toBe(403);
  });

  it('401 no auth', async () => {
    const res = await mkApp().request('/api/v1/admin/orders/export');
    expect(res.status).toBe(401);
  });
});

describe('PATCH /:id/tags', () => {
  it('200 updates tags', async () => {
    mockDb.select.mockReturnValueOnce(makeChain([{ id: orderId }]));
    mockDb.update.mockReturnValue(updateChain([{ id: orderId }]));
    const res = await mkApp().request(`/api/v1/admin/orders/${orderId}/tags`, {
      method: 'PATCH',
      headers: a(),
      body: JSON.stringify({ tags: 'urgent,vip' }),
    });
    expect(res.status).toBe(200);
    expect(mockAudit.createAuditLog).toHaveBeenCalledTimes(1);
  });

  it('404 order not found', async () => {
    mockDb.select.mockReturnValue(makeChain([]));
    const res = await mkApp().request(`/api/v1/admin/orders/${orderId}/tags`, {
      method: 'PATCH',
      headers: a(),
      body: JSON.stringify({ tags: 'urgent' }),
    });
    expect(res.status).toBe(404);
  });

  it('422 too long', async () => {
    const res = await mkApp().request(`/api/v1/admin/orders/${orderId}/tags`, {
      method: 'PATCH',
      headers: a(),
      body: JSON.stringify({ tags: 'x'.repeat(501) }),
    });
    expect(res.status).toBe(422);
  });

  it('422 missing field', async () => {
    const res = await mkApp().request(`/api/v1/admin/orders/${orderId}/tags`, {
      method: 'PATCH',
      headers: a(),
      body: JSON.stringify({}),
    });
    expect(res.status).toBe(422);
  });

  it('403 customer role', async () => {
    const res = await mkApp('customer').request(`/api/v1/admin/orders/${orderId}/tags`, {
      method: 'PATCH',
      headers: a(),
      body: JSON.stringify({ tags: 'urgent' }),
    });
    expect(res.status).toBe(403);
  });

  it('401 no auth', async () => {
    const res = await mkApp().request(`/api/v1/admin/orders/${orderId}/tags`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tags: 'urgent' }),
    });
    expect(res.status).toBe(401);
  });
});

describe('PATCH /:id/internal-notes', () => {
  it('200 updates internal notes', async () => {
    mockDb.select.mockReturnValueOnce(makeChain([{ id: orderId }]));
    mockDb.update.mockReturnValue(updateChain([{ id: orderId }]));
    const res = await mkApp().request(`/api/v1/admin/orders/${orderId}/internal-notes`, {
      method: 'PATCH',
      headers: a(),
      body: JSON.stringify({ internalNotes: 'Customer request: datang setelah maghrib' }),
    });
    expect(res.status).toBe(200);
    expect(mockAudit.createAuditLog).toHaveBeenCalledTimes(1);
  });

  it('404 order not found', async () => {
    mockDb.select.mockReturnValue(makeChain([]));
    const res = await mkApp().request(`/api/v1/admin/orders/${orderId}/internal-notes`, {
      method: 'PATCH',
      headers: a(),
      body: JSON.stringify({ internalNotes: 'Test' }),
    });
    expect(res.status).toBe(404);
  });

  it('422 empty string', async () => {
    const res = await mkApp().request(`/api/v1/admin/orders/${orderId}/internal-notes`, {
      method: 'PATCH',
      headers: a(),
      body: JSON.stringify({ internalNotes: '' }),
    });
    expect(res.status).toBe(422);
  });

  it('422 missing field', async () => {
    const res = await mkApp().request(`/api/v1/admin/orders/${orderId}/internal-notes`, {
      method: 'PATCH',
      headers: a(),
      body: JSON.stringify({}),
    });
    expect(res.status).toBe(422);
  });

  it('403 customer role', async () => {
    const res = await mkApp('customer').request(`/api/v1/admin/orders/${orderId}/internal-notes`, {
      method: 'PATCH',
      headers: a(),
      body: JSON.stringify({ internalNotes: 'Test' }),
    });
    expect(res.status).toBe(403);
  });

  it('401 no auth', async () => {
    const res = await mkApp().request(`/api/v1/admin/orders/${orderId}/internal-notes`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ internalNotes: 'Test' }),
    });
    expect(res.status).toBe(401);
  });
});
