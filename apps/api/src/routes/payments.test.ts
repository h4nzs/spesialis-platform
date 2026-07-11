import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Hono } from 'hono';
import type { Context } from 'hono';
import type { UserRole } from '@ahlipanggilan/types';
import { paymentsRouter } from './payments.ts';
import { errorHandler } from '../middleware/error-handler.ts';
import { setTestEnv, makeChain, insertChain, updateChain } from '../test-utils.ts';
import type { ApiTestResponse } from '../test-utils.ts';

const { mockDb, authState, mockAudit, mockNotif, mockEmail, em } = vi.hoisted(() => {
  const db = {
    select: vi.fn(),
    insert: vi.fn(),
    update: vi.fn(),
    delete: vi.fn().mockReturnValue({ where: vi.fn().mockResolvedValue(undefined) }),
    execute: vi.fn().mockResolvedValue([]),
    transaction: vi.fn((fn: (tx: unknown) => unknown) => fn(db)),
  };
  const st: { userId: string; userRole: UserRole } = { userId: 'uid', userRole: 'customer' };
  const ax = { createAuditLog: vi.fn().mockResolvedValue(undefined) };
  const nx = {
    createNotification: vi.fn().mockResolvedValue(undefined),
    notifyAdmins: vi.fn().mockResolvedValue(undefined),
  };
  const eml = { sendPaymentVerifiedEmail: vi.fn().mockResolvedValue(undefined) };
  const exps = (globalThis as Record<string, unknown>).__TABLE_EXPORTS as Record<string, unknown>;
  return { mockDb: db, authState: st, mockAudit: ax, mockNotif: nx, mockEmail: eml, em: exps };
});

vi.mock('../lib/db.ts', () => ({ db: mockDb, ...em }));
vi.mock('../lib/auth.ts', () => ({
  hashPassword: vi.fn().mockResolvedValue('h'),
  verifyPassword: vi.fn().mockResolvedValue(true),
  signAccessToken: vi.fn().mockResolvedValue('t'),
  verifyAccessToken: vi.fn().mockResolvedValue({ sub: 'uid', role: 'customer', exp: 9999999999 }),
  generateRefreshToken: vi.fn().mockReturnValue('r'),
  hashToken: vi.fn().mockReturnValue('h'),
  getRefreshTokenExpiry: vi.fn().mockReturnValue(new Date(Date.now() + 86400000)),
}));
vi.mock('../lib/audit.ts', () => ({ ...mockAudit }));
vi.mock('../lib/notification.ts', () => ({ ...mockNotif }));
vi.mock('../lib/email.ts', () => ({ ...mockEmail }));
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

function a() {
  return { Authorization: 'Bearer x', 'Content-Type': 'application/json' };
}

function mkApp(role: UserRole = 'customer') {
  authState.userRole = role;
  authState.userId = 'uid';
  const app = new Hono();
  app.onError(errorHandler);
  app.route('/api/v1/payments', paymentsRouter);
  return app;
}

beforeEach(() => {
  setTestEnv();
  vi.clearAllMocks();
  mockDb.transaction.mockImplementation((fn: (tx: unknown) => unknown) => fn(mockDb));
  mockDb.select.mockReturnValue(makeChain([]));
  mockDb.insert.mockReturnValue(insertChain([]));
  mockDb.update.mockReturnValue(updateChain([]));
});

describe('POST /', () => {
  it('201 created', async () => {
    mockDb.select.mockReturnValueOnce(
      makeChain([{ id: 'o1', customerId: 'cp1', status: 'Completed' }]),
    );
    mockDb.select.mockReturnValueOnce(makeChain([{ id: 'cp1' }]));
    mockDb.select.mockReturnValue(makeChain([]));
    mockDb.insert.mockReturnValue(insertChain([{ id: 'p1' }]));
    const res = await mkApp().request('/api/v1/payments', {
      method: 'POST',
      headers: a(),
      body: JSON.stringify({
        orderId: '550e8400-e29b-41d4-a716-446655440001',
        method: 'Transfer',
        amount: '150000',
      }),
    });
    const body = (await res.json()) as ApiTestResponse;
    expect(res.status).toBe(201);
    expect(body.success).toBe(true);
    expect(body.data).toBeDefined();
  });
  it('404 order not found', async () => {
    mockDb.select.mockReturnValueOnce(makeChain([]));
    const res = await mkApp().request('/api/v1/payments', {
      method: 'POST',
      headers: a(),
      body: JSON.stringify({
        orderId: '550e8400-e29b-41d4-a716-446655440001',
        method: 'Transfer',
        amount: '150000',
      }),
    });
    const body = (await res.json()) as ApiTestResponse;
    expect(res.status).toBe(404);
    expect(body.success).toBe(false);
  });
  it('409 duplicate payment', async () => {
    mockDb.select.mockReturnValueOnce(
      makeChain([{ id: 'o1', customerId: 'cp1', status: 'Completed' }]),
    );
    mockDb.select.mockReturnValueOnce(makeChain([{ id: 'cp1' }]));
    mockDb.select.mockReturnValueOnce(makeChain([{ id: 'p1' }]));
    const res = await mkApp().request('/api/v1/payments', {
      method: 'POST',
      headers: a(),
      body: JSON.stringify({
        orderId: '550e8400-e29b-41d4-a716-446655440001',
        method: 'Transfer',
        amount: '150000',
      }),
    });
    const body = (await res.json()) as ApiTestResponse;
    expect(res.status).toBe(409);
    expect(body.success).toBe(false);
  });
  it('422 validation', async () => {
    const res = await mkApp().request('/api/v1/payments', {
      method: 'POST',
      headers: a(),
      body: JSON.stringify({}),
    });
    const body = (await res.json()) as ApiTestResponse;
    expect(res.status).toBe(422);
    expect(body.success).toBe(false);
  });
  it('404 partner (route has no role restriction)', async () => {
    const res = await mkApp('partner').request('/api/v1/payments', {
      method: 'POST',
      headers: a(),
      body: JSON.stringify({
        orderId: '550e8400-e29b-41d4-a716-446655440001',
        method: 'Transfer',
        amount: '150000',
      }),
    });
    const body = (await res.json()) as ApiTestResponse;
    expect(res.status).toBe(404);
    expect(body.success).toBe(false);
  });
});

describe('GET /:id', () => {
  it('200', async () => {
    mockDb.select.mockReturnValueOnce(
      makeChain([{ id: 'p1', orderId: '550e8400-e29b-41d4-a716-446655440001' }]),
    );
    mockDb.select.mockReturnValueOnce(makeChain([{ customerId: 'cp1' }]));
    mockDb.select.mockReturnValue(makeChain([{ id: 'cp1' }]));
    const res = await mkApp().request('/api/v1/payments/p1', { headers: a() });
    const body = (await res.json()) as ApiTestResponse;
    expect(res.status).toBe(200);
    expect(body.success).toBe(true);
    expect(body.data).toBeDefined();
  });
  it('404', async () => {
    mockDb.select.mockReturnValue(makeChain([]));
    const res = await mkApp().request('/api/v1/payments/p1', { headers: a() });
    const body = (await res.json()) as ApiTestResponse;
    expect(res.status).toBe(404);
    expect(body.success).toBe(false);
  });
});

describe('POST /:id/verify', () => {
  it('200 verified', async () => {
    mockDb.select.mockReturnValueOnce(
      makeChain([
        {
          id: 'p1',
          orderId: '550e8400-e29b-41d4-a716-446655440001',
          status: 'Waiting',
          amount: '150000',
        },
      ]),
    );
    mockDb.select.mockReturnValue(
      makeChain([
        {
          id: '550e8400-e29b-41d4-a716-446655440001',
          status: 'Waiting Payment',
          customerId: 'cp1',
        },
      ]),
    );
    const res = await mkApp('admin').request('/api/v1/payments/p1/verify', {
      method: 'POST',
      headers: a(),
      body: JSON.stringify({ status: 'Paid' }),
    });
    const body = (await res.json()) as ApiTestResponse;
    expect(res.status).toBe(200);
    expect(body.success).toBe(true);
    expect(body.data).toBeDefined();
  });
  it('403 customer', async () => {
    const res = await mkApp('customer').request('/api/v1/payments/p1/verify', {
      method: 'POST',
      headers: a(),
      body: JSON.stringify({ status: 'Paid' }),
    });
    const body = (await res.json()) as ApiTestResponse;
    expect(res.status).toBe(403);
    expect(body.success).toBe(false);
  });
  it('404 not found', async () => {
    mockDb.select.mockReturnValue(makeChain([]));
    const res = await mkApp('admin').request('/api/v1/payments/p1/verify', {
      method: 'POST',
      headers: a(),
      body: JSON.stringify({ status: 'Paid' }),
    });
    const body = (await res.json()) as ApiTestResponse;
    expect(res.status).toBe(404);
    expect(body.success).toBe(false);
  });

  it('200 verified as Failed', async () => {
    mockDb.select.mockReturnValueOnce(
      makeChain([
        {
          id: 'p1',
          orderId: '550e8400-e29b-41d4-a716-446655440001',
          status: 'Waiting',
          amount: '150000',
          method: 'Transfer',
        },
      ]),
    );
    mockDb.select.mockReturnValueOnce(
      makeChain([
        {
          id: '550e8400-e29b-41d4-a716-446655440001',
          status: 'Waiting Payment',
          customerId: 'cp1',
        },
      ]),
    );
    const res = await mkApp('admin').request('/api/v1/payments/p1/verify', {
      method: 'POST',
      headers: a(),
      body: JSON.stringify({ status: 'Failed', notes: 'Saldo tidak cukup' }),
    });
    const body = (await res.json()) as ApiTestResponse;
    expect(res.status).toBe(200);
    expect(body.success).toBe(true);
    expect(mockAudit.createAuditLog).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({ action: 'payment.reject' }),
    );
  });

  it('409 duplicate verify', async () => {
    mockDb.select.mockReturnValueOnce(
      makeChain([
        {
          id: 'p1',
          orderId: '550e8400-e29b-41d4-a716-446655440001',
          status: 'Paid',
          amount: '150000',
        },
      ]),
    );
    const res = await mkApp('admin').request('/api/v1/payments/p1/verify', {
      method: 'POST',
      headers: a(),
      body: JSON.stringify({ status: 'Paid' }),
    });
    const body = (await res.json()) as ApiTestResponse;
    expect(res.status).toBe(409);
    expect(body.success).toBe(false);
  });

  it('422 validation', async () => {
    const res = await mkApp('admin').request('/api/v1/payments/p1/verify', {
      method: 'POST',
      headers: a(),
      body: JSON.stringify({}),
    });
    const body = (await res.json()) as ApiTestResponse;
    expect(res.status).toBe(422);
    expect(body.success).toBe(false);
  });

  it('500 transaction rollback when payment update fails (Paid path)', async () => {
    mockDb.select.mockReturnValueOnce(
      makeChain([
        {
          id: 'p1',
          orderId: '550e8400-e29b-41d4-a716-446655440001',
          status: 'Waiting',
          amount: '150000',
          method: 'Transfer',
        },
      ]),
    );
    mockDb.select.mockReturnValueOnce(
      makeChain([
        {
          id: '550e8400-e29b-41d4-a716-446655440001',
          status: 'Waiting Payment',
          customerId: 'cp1',
        },
      ]),
    );
    mockDb.update.mockReturnValueOnce({
      set: vi.fn().mockReturnValue({
        where: vi.fn().mockRejectedValue(new Error('DB error')),
      }),
    });
    const res = await mkApp('admin').request('/api/v1/payments/p1/verify', {
      method: 'POST',
      headers: a(),
      body: JSON.stringify({ status: 'Paid' }),
    });
    const body = (await res.json()) as ApiTestResponse;
    expect(res.status).toBe(500);
    expect(body.success).toBe(false);
  });

  it('500 transaction rollback when payment update fails (Failed path)', async () => {
    mockDb.select.mockReturnValueOnce(
      makeChain([
        {
          id: 'p1',
          orderId: '550e8400-e29b-41d4-a716-446655440001',
          status: 'Waiting',
          amount: '150000',
          method: 'Transfer',
        },
      ]),
    );
    mockDb.select.mockReturnValueOnce(
      makeChain([
        {
          id: '550e8400-e29b-41d4-a716-446655440001',
          status: 'Waiting Payment',
          customerId: 'cp1',
        },
      ]),
    );
    mockDb.update.mockReturnValueOnce({
      set: vi.fn().mockReturnValue({
        where: vi.fn().mockRejectedValue(new Error('DB error')),
      }),
    });
    const res = await mkApp('admin').request('/api/v1/payments/p1/verify', {
      method: 'POST',
      headers: a(),
      body: JSON.stringify({ status: 'Failed', notes: 'Test rollback' }),
    });
    const body = (await res.json()) as ApiTestResponse;
    expect(res.status).toBe(500);
    expect(body.success).toBe(false);
  });
});
