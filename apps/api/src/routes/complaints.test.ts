import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Hono } from 'hono';
import type { Context } from 'hono';
import type { UserRole } from '@ahlipanggilan/types';
import { complaintsRouter } from './complaints.ts';
import { errorHandler } from '../middleware/error-handler.ts';
import { setTestEnv, makeChain, insertChain, updateChain } from '../test-utils.ts';

const { mockDb, authState, mockAudit, mockNotif, em } = vi.hoisted(() => {
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
  const exps = (globalThis as Record<string, unknown>).__TABLE_EXPORTS as Record<string, unknown>;
  return { mockDb: db, authState: st, mockAudit: ax, mockNotif: nx, em: exps };
});

vi.mock('../lib/db.ts', () => ({ db: mockDb, ...em }));
vi.mock('../lib/audit.ts', () => ({ ...mockAudit }));
vi.mock('../lib/notification.ts', () => ({ ...mockNotif }));
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
  app.route('/api/v1/complaints', complaintsRouter);
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
    mockDb.select.mockReturnValueOnce(makeChain([{ id: 'cp1' }]));
    mockDb.select.mockReturnValue(
      makeChain([{ id: '550e8400-e29b-41d4-a716-446655440001', customerId: 'cp1' }]),
    );
    mockDb.insert.mockReturnValue(insertChain([{ id: 'c1' }]));
    const res = await mkApp().request('/api/v1/complaints', {
      method: 'POST',
      headers: a(),
      body: JSON.stringify({
        orderId: '550e8400-e29b-41d4-a716-446655440001',
        title: 'Tidak sesuai',
        description: 'Hasil pekerjaan tidak sesuai dengan yang dijanjikan',
      }),
    });
    expect(res.status).toBe(201);
  });
  it('422 validation', async () => {
    const res = await mkApp().request('/api/v1/complaints', {
      method: 'POST',
      headers: a(),
      body: JSON.stringify({}),
    });
    expect(res.status).toBe(422);
  });
});

describe('GET /', () => {
  it('200 customer', async () => {
    mockDb.select.mockReturnValue(makeChain([{ id: 'c1' }]));
    const res = await mkApp().request('/api/v1/complaints', { headers: a() });
    expect(res.status).toBe(200);
  });
  it('200 admin sees all', async () => {
    mockDb.select.mockReturnValue(makeChain([{ id: 'c1' }]));
    const res = await mkApp('admin').request('/api/v1/complaints', { headers: a() });
    expect(res.status).toBe(200);
  });
});

describe('GET /:id', () => {
  it('200', async () => {
    mockDb.select.mockReturnValueOnce(makeChain([{ id: 'c1', customerId: 'cp1' }]));
    mockDb.select.mockReturnValue(makeChain([{ id: 'cp1' }]));
    const res = await mkApp().request('/api/v1/complaints/c1', { headers: a() });
    expect(res.status).toBe(200);
  });
  it('404', async () => {
    mockDb.select.mockReturnValue(makeChain([]));
    const res = await mkApp().request('/api/v1/complaints/c1', { headers: a() });
    expect(res.status).toBe(404);
  });
});

describe('PATCH /:id/resolve', () => {
  it('200 resolved', async () => {
    mockDb.select.mockReturnValue(
      makeChain([{ id: 'c1', status: 'Open', customerProfileId: 'cp1' }]),
    );
    const res = await mkApp('admin').request('/api/v1/complaints/c1/resolve', {
      method: 'PATCH',
      headers: a(),
      body: JSON.stringify({ status: 'Resolved', resolution: 'Sudah diperbaiki' }),
    });
    expect(res.status).toBe(200);
  });
  it('403 customer', async () => {
    const res = await mkApp('customer').request('/api/v1/complaints/c1/resolve', {
      method: 'PATCH',
      headers: a(),
      body: JSON.stringify({ status: 'Resolved', resolution: 'Ok' }),
    });
    expect(res.status).toBe(403);
  });
  it('409 if already resolved', async () => {
    mockDb.select.mockReturnValue(makeChain([{ id: 'c1', status: 'Resolved' }]));
    const res = await mkApp('admin').request('/api/v1/complaints/c1/resolve', {
      method: 'PATCH',
      headers: a(),
      body: JSON.stringify({ status: 'Closed', resolution: 'Done' }),
    });
    expect(res.status).toBe(409);
  });
});
