import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Hono } from 'hono';
import type { Context } from 'hono';
import type { UserRole } from '@specialist/types';
import { adminPenaltiesRouter } from './penalties.ts';
import { errorHandler } from '../../middleware/error-handler.ts';
import { setTestEnv, makeChain, insertChain, updateChain } from '../../test-utils.ts';

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
vi.mock('../../middleware/rate-limiter.ts', () => ({
  rateLimit: () => async (_c: unknown, next: () => unknown) => next(),
}));

function mkApp(role: UserRole = 'admin') {
  authState.userRole = role;
  authState.userId = 'uid';
  const app = new Hono();
  app.onError(errorHandler);
  app.route('/api/v1/admin/penalties', adminPenaltiesRouter);
  return app;
}

function a() {
  return { Authorization: 'Bearer x', 'Content-Type': 'application/json' };
}

const PARTNER_ID = '550e8400-e29b-41d4-a716-446655440010';
const ORDER_ID = '550e8400-e29b-41d4-a716-446655440020';
const PENALTY_ID = '550e8400-e29b-41d4-a716-446655440030';

beforeEach(() => {
  setTestEnv();
  vi.clearAllMocks();
  mockDb.select.mockReturnValue(makeChain([]));
  mockDb.insert.mockReturnValue(insertChain([]));
  mockDb.update.mockReturnValue(updateChain([]));
});

describe('GET /admin/penalties', () => {
  it('200 returns penalties list', async () => {
    mockDb.select.mockReturnValue(
      makeChain([
        {
          id: PENALTY_ID,
          partnerId: PARTNER_ID,
          partnerName: 'Budi',
          orderId: ORDER_ID,
          bookingNumber: 'SP-2026-0001',
          type: 'Late',
          amount: '50000',
          reason: 'Terlambat 2 jam',
          status: 'Pending',
          imposedAt: new Date(),
          paidAt: null,
          resolvedAt: null,
          notes: null,
        },
      ]),
    );
    const res = await mkApp().request('/api/v1/admin/penalties', { headers: a() });
    expect(res.status).toBe(200);
    const body = (await res.json()) as { success: boolean; data: unknown[] };
    expect(body.success).toBe(true);
    expect(body.data).toHaveLength(1);
  });

  it('200 filter by partnerId', async () => {
    mockDb.select.mockReturnValue(makeChain([]));
    const res = await mkApp().request(`/api/v1/admin/penalties?partnerId=${PARTNER_ID}`, {
      headers: a(),
    });
    expect(res.status).toBe(200);
  });

  it('403 customer role', async () => {
    const res = await mkApp('customer').request('/api/v1/admin/penalties', { headers: a() });
    expect(res.status).toBe(403);
  });

  it('401 no auth', async () => {
    const res = await mkApp().request('/api/v1/admin/penalties');
    expect(res.status).toBe(401);
  });
});

describe('POST /admin/penalties', () => {
  it('201 imposes penalty', async () => {
    mockDb.select.mockReturnValue(makeChain([{ id: PARTNER_ID }]));
    mockDb.insert.mockReturnValue(
      insertChain([{ id: PENALTY_ID, partnerId: PARTNER_ID, type: 'Late', amount: '50000' }]),
    );
    const res = await mkApp().request('/api/v1/admin/penalties', {
      method: 'POST',
      headers: a(),
      body: JSON.stringify({
        partnerId: PARTNER_ID,
        type: 'Late',
        amount: 50000,
        reason: 'Terlambat 2 jam',
      }),
    });
    expect(res.status).toBe(201);
    expect(mockAudit.createAuditLog).toHaveBeenCalledTimes(1);
  });

  it('201 with orderId', async () => {
    mockDb.select.mockReturnValueOnce(makeChain([{ id: PARTNER_ID }]));
    mockDb.select.mockReturnValueOnce(makeChain([{ id: ORDER_ID }]));
    mockDb.insert.mockReturnValue(
      insertChain([{ id: PENALTY_ID, partnerId: PARTNER_ID, orderId: ORDER_ID }]),
    );
    const res = await mkApp().request('/api/v1/admin/penalties', {
      method: 'POST',
      headers: a(),
      body: JSON.stringify({
        partnerId: PARTNER_ID,
        orderId: ORDER_ID,
        type: 'Complaint',
        amount: 100000,
        reason: 'Komplain customer',
      }),
    });
    expect(res.status).toBe(201);
  });

  it('404 partner not found', async () => {
    mockDb.select.mockReturnValue(makeChain([]));
    const res = await mkApp().request('/api/v1/admin/penalties', {
      method: 'POST',
      headers: a(),
      body: JSON.stringify({
        partnerId: PARTNER_ID,
        type: 'Late',
        amount: 50000,
        reason: 'Test',
      }),
    });
    expect(res.status).toBe(404);
  });

  it('404 order not found', async () => {
    mockDb.select.mockReturnValueOnce(makeChain([{ id: PARTNER_ID }]));
    mockDb.select.mockReturnValueOnce(makeChain([]));
    const res = await mkApp().request('/api/v1/admin/penalties', {
      method: 'POST',
      headers: a(),
      body: JSON.stringify({
        partnerId: PARTNER_ID,
        orderId: ORDER_ID,
        type: 'Late',
        amount: 50000,
        reason: 'Test',
      }),
    });
    expect(res.status).toBe(404);
  });

  it('422 invalid type', async () => {
    const res = await mkApp().request('/api/v1/admin/penalties', {
      method: 'POST',
      headers: a(),
      body: JSON.stringify({
        partnerId: PARTNER_ID,
        type: 'BadType',
        amount: 50000,
        reason: 'Test',
      }),
    });
    expect(res.status).toBe(422);
  });

  it('422 negative amount', async () => {
    const res = await mkApp().request('/api/v1/admin/penalties', {
      method: 'POST',
      headers: a(),
      body: JSON.stringify({
        partnerId: PARTNER_ID,
        type: 'Late',
        amount: -100,
        reason: 'Test',
      }),
    });
    expect(res.status).toBe(422);
  });

  it('422 empty reason', async () => {
    const res = await mkApp().request('/api/v1/admin/penalties', {
      method: 'POST',
      headers: a(),
      body: JSON.stringify({
        partnerId: PARTNER_ID,
        type: 'Late',
        amount: 50000,
        reason: '',
      }),
    });
    expect(res.status).toBe(422);
  });
});

describe('PATCH /admin/penalties/:id/status', () => {
  it('200 apply penalty', async () => {
    mockDb.select.mockReturnValue(makeChain([{ id: PENALTY_ID, status: 'Pending' }]));
    mockDb.update.mockReturnValue(updateChain([{ id: PENALTY_ID }]));
    const res = await mkApp().request(`/api/v1/admin/penalties/${PENALTY_ID}/status`, {
      method: 'PATCH',
      headers: a(),
      body: JSON.stringify({ status: 'Applied' }),
    });
    expect(res.status).toBe(200);
    expect(mockAudit.createAuditLog).toHaveBeenCalledTimes(1);
  });

  it('200 waive penalty', async () => {
    mockDb.select.mockReturnValue(makeChain([{ id: PENALTY_ID, status: 'Pending' }]));
    mockDb.update.mockReturnValue(updateChain([{ id: PENALTY_ID }]));
    const res = await mkApp().request(`/api/v1/admin/penalties/${PENALTY_ID}/status`, {
      method: 'PATCH',
      headers: a(),
      body: JSON.stringify({ status: 'Waived', notes: 'Maaf, ada miskomunikasi' }),
    });
    expect(res.status).toBe(200);
  });

  it('404 penalty not found', async () => {
    mockDb.select.mockReturnValue(makeChain([]));
    const res = await mkApp().request(`/api/v1/admin/penalties/${PENALTY_ID}/status`, {
      method: 'PATCH',
      headers: a(),
      body: JSON.stringify({ status: 'Applied' }),
    });
    expect(res.status).toBe(404);
  });

  it('422 invalid status', async () => {
    const res = await mkApp().request(`/api/v1/admin/penalties/${PENALTY_ID}/status`, {
      method: 'PATCH',
      headers: a(),
      body: JSON.stringify({ status: 'Disputed' }),
    });
    expect(res.status).toBe(422);
  });
});
