import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Hono } from 'hono';
import type { Context } from 'hono';
import type { UserRole } from '@specialist/types';
import { customersRouter } from './customers.ts';
import { errorHandler } from '../middleware/error-handler.ts';
import { setTestEnv, makeChain, updateChain } from '../test-utils.ts';

const { mockDb, authState, mockAudit, em } = vi.hoisted(() => {
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
  const exps = (globalThis as Record<string, unknown>).__TABLE_EXPORTS as Record<string, unknown>;
  return { mockDb: db, authState: st, mockAudit: ax, em: exps };
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
  app.route('/api/v1/customers', customersRouter);
  return app;
}

beforeEach(() => {
  setTestEnv();
  vi.clearAllMocks();
  mockDb.select.mockReset();
  mockDb.update.mockReset();
  mockDb.insert.mockReset();
});

describe('GET /me', () => {
  it('200 own profile', async () => {
    mockDb.select.mockReturnValueOnce(
      makeChain([
        {
          id: 'cp1',
          userId: 'uid',
          fullName: 'John',
          avatar: null,
          birthDate: null,
          gender: null,
          defaultAddressId: null,
          createdAt: '2025-01-01',
        },
      ]),
    );
    const res = await mkApp().request('/api/v1/customers/me', { headers: a() });
    expect(res.status).toBe(200);
  });

  it('404 profile not found', async () => {
    mockDb.select.mockReturnValueOnce(makeChain([]));
    const res = await mkApp().request('/api/v1/customers/me', { headers: a() });
    expect(res.status).toBe(404);
  });
});

describe('PATCH /me', () => {
  it('200 updated', async () => {
    mockDb.select.mockReturnValueOnce(makeChain([]));
    mockDb.update.mockReturnValueOnce(updateChain([{ id: 'cp1', fullName: 'John Updated' }]));
    const res = await mkApp().request('/api/v1/customers/me', {
      method: 'PATCH',
      headers: a(),
      body: JSON.stringify({ fullName: 'John Updated' }),
    });
    expect(res.status).toBe(200);
  });

  it('422 validation', async () => {
    const res = await mkApp().request('/api/v1/customers/me', {
      method: 'PATCH',
      headers: a(),
      body: JSON.stringify({ gender: 'invalid' }),
    });
    expect(res.status).toBe(422);
  });
});

describe('GET / (admin)', () => {
  it('200 admin list', async () => {
    mockDb.select.mockReturnValueOnce(
      makeChain([
        {
          id: 'u1',
          email: 'a@b.com',
          phone: '123',
          fullName: 'A',
          status: 'active',
          createdAt: '2025-01-01',
        },
      ]),
    );
    const res = await mkApp('admin').request('/api/v1/customers', { headers: a() });
    expect(res.status).toBe(200);
  });

  it('403 customer', async () => {
    const res = await mkApp('customer').request('/api/v1/customers', { headers: a() });
    expect(res.status).toBe(403);
  });
});

describe('PATCH /:id/status (admin)', () => {
  it('200 suspended', async () => {
    mockDb.select.mockReturnValueOnce(
      makeChain([{ id: 'target-id', role: 'customer', status: 'active' }]),
    );
    mockDb.update.mockReturnValueOnce(updateChain([]));
    const res = await mkApp('admin').request('/api/v1/customers/target-id/status', {
      method: 'PATCH',
      headers: a(),
      body: JSON.stringify({ status: 'suspended' }),
    });
    expect(res.status).toBe(200);
  });

  it('404 user not found', async () => {
    mockDb.select.mockReturnValueOnce(makeChain([]));
    const res = await mkApp('admin').request('/api/v1/customers/target-id/status', {
      method: 'PATCH',
      headers: a(),
      body: JSON.stringify({ status: 'suspended' }),
    });
    expect(res.status).toBe(404);
  });

  it('403 customer', async () => {
    const res = await mkApp('customer').request('/api/v1/customers/target-id/status', {
      method: 'PATCH',
      headers: a(),
      body: JSON.stringify({ status: 'suspended' }),
    });
    expect(res.status).toBe(403);
  });

  it('400 not a customer role', async () => {
    mockDb.select.mockReturnValueOnce(
      makeChain([{ id: 'target-id', role: 'partner', status: 'active' }]),
    );
    const res = await mkApp('admin').request('/api/v1/customers/target-id/status', {
      method: 'PATCH',
      headers: a(),
      body: JSON.stringify({ status: 'suspended' }),
    });
    expect(res.status).toBe(400);
  });

  it('422 invalid status', async () => {
    const res = await mkApp('admin').request('/api/v1/customers/target-id/status', {
      method: 'PATCH',
      headers: a(),
      body: JSON.stringify({ status: 'invalid' }),
    });
    expect(res.status).toBe(422);
  });
});

describe('GET /guest-convert', () => {
  it('200 needs conversion', async () => {
    mockDb.select.mockReturnValueOnce(makeChain([{ id: 'cp1', guestPhone: '08123456789' }]));
    const res = await mkApp().request('/api/v1/customers/guest-convert', { headers: a() });
    expect(res.status).toBe(200);
  });

  it('200 already registered', async () => {
    mockDb.select.mockReturnValueOnce(makeChain([{ id: 'cp1', guestPhone: null }]));
    const res = await mkApp().request('/api/v1/customers/guest-convert', { headers: a() });
    expect(res.status).toBe(200);
  });

  it('200 no profile', async () => {
    mockDb.select.mockReturnValueOnce(makeChain([]));
    const res = await mkApp().request('/api/v1/customers/guest-convert', { headers: a() });
    expect(res.status).toBe(200);
  });
});
