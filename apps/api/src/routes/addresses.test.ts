import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Hono } from 'hono';
import type { Context } from 'hono';
import type { UserRole } from '@ahlipanggilan/types';
import { addressesRouter } from './addresses.ts';
import { errorHandler } from '../middleware/error-handler.ts';
import { setTestEnv, makeChain, insertChain, updateChain } from '../test-utils.ts';

const { mockDb, authState, em } = vi.hoisted(() => {
  const db = {
    select: vi.fn(),
    insert: vi.fn(),
    update: vi.fn(),
    delete: vi.fn().mockReturnValue({ where: vi.fn().mockResolvedValue(undefined) }),
    execute: vi.fn().mockResolvedValue([]),
    transaction: vi.fn((fn: (tx: unknown) => unknown) => fn(db)),
  };
  const st: { userId: string; userRole: UserRole } = { userId: 'uid', userRole: 'customer' };
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
}));

function a() {
  return { Authorization: 'Bearer x', 'Content-Type': 'application/json' };
}

function mkApp(role: UserRole = 'customer') {
  authState.userRole = role;
  authState.userId = 'uid';
  const app = new Hono();
  app.onError(errorHandler);
  app.route('/api/v1/addresses', addressesRouter);
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

describe('GET /', () => {
  it('200', async () => {
    mockDb.select.mockReturnValue(makeChain([{ id: 'a1' }]));
    const res = await mkApp().request('/api/v1/addresses', { headers: a() });
    expect(res.status).toBe(200);
  });
  it('401', async () => {
    const res = await mkApp().request('/api/v1/addresses');
    expect(res.status).toBe(401);
  });
});

describe('POST /', () => {
  it('201 created', async () => {
    mockDb.select.mockReturnValue(makeChain([{ id: 'cp1' }]));
    mockDb.insert.mockReturnValue(insertChain([{ id: 'a1' }]));
    const res = await mkApp().request('/api/v1/addresses', {
      method: 'POST',
      headers: a(),
      body: JSON.stringify({
        label: 'Rumah',
        receiverName: 'Andi',
        receiverPhone: '08123456789',
        province: 'DKI Jakarta',
        city: 'Jakarta Selatan',
        district: 'Kebayoran Baru',
        postalCode: '12110',
        address: 'Jl. Contoh No. 1',
      }),
    });
    expect(res.status).toBe(201);
  });
  it('422 validation', async () => {
    mockDb.select.mockReturnValue(makeChain([{ id: 'cp1' }]));
    const res = await mkApp().request('/api/v1/addresses', {
      method: 'POST',
      headers: a(),
      body: JSON.stringify({ receiverName: 'A' }),
    });
    expect(res.status).toBe(422);
  });
});

describe('GET /:id', () => {
  it('200', async () => {
    mockDb.select.mockReturnValue(makeChain([{ id: 'a1', customerProfileId: 'cp1' }]));
    const res = await mkApp().request('/api/v1/addresses/a1', { headers: a() });
    expect(res.status).toBe(200);
  });
  it('404', async () => {
    mockDb.select.mockReturnValue(makeChain([]));
    const res = await mkApp().request('/api/v1/addresses/a1', { headers: a() });
    expect(res.status).toBe(404);
  });
});

describe('PATCH /:id', () => {
  it('200', async () => {
    mockDb.select.mockReturnValue(makeChain([{ id: 'a1', customerProfileId: 'cp1' }]));
    const res = await mkApp().request('/api/v1/addresses/a1', {
      method: 'PATCH',
      headers: a(),
      body: JSON.stringify({ label: 'Kantor' }),
    });
    expect(res.status).toBe(200);
  });
});

describe('DELETE /:id', () => {
  it('200', async () => {
    mockDb.select.mockReturnValue(makeChain([{ id: 'a1', customerProfileId: 'cp1' }]));
    const res = await mkApp().request('/api/v1/addresses/a1', { method: 'DELETE', headers: a() });
    expect(res.status).toBe(200);
  });
});
