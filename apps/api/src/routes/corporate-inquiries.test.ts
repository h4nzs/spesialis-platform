import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Hono } from 'hono';
import type { Context } from 'hono';
import type { UserRole } from '@ahlipanggilan/types';
import { corporateInquiriesRouter } from './corporate-inquiries.ts';
import { errorHandler } from '../middleware/error-handler.ts';
import { setTestEnv, makeChain, insertChain, updateChain } from '../test-utils.ts';

const mockRateLimit = vi.hoisted(() => ({
  rateLimit: () => async (_c: unknown, next: () => unknown) => next(),
}));

const { mockDb, authState, mockAudit, mockNotif, em } = vi.hoisted(() => {
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
  const nx = {
    createNotification: vi.fn().mockResolvedValue(undefined),
    notifyAdmins: vi.fn().mockResolvedValue(undefined),
  };
  const exps = (globalThis as Record<string, unknown>).__TABLE_EXPORTS as Record<string, unknown>;
  return { mockDb: db, authState: st, mockAudit: ax, mockNotif: nx, em: exps };
});

vi.mock('../lib/db.ts', () => ({ db: mockDb, ...em }));
vi.mock('../lib/auth.ts', () => ({
  hashPassword: vi.fn().mockResolvedValue('h'),
  verifyPassword: vi.fn().mockResolvedValue(true),
  signAccessToken: vi.fn().mockResolvedValue('t'),
  verifyAccessToken: vi.fn().mockResolvedValue({ sub: 'uid', role: 'admin', exp: 9999999999 }),
  generateRefreshToken: vi.fn().mockReturnValue('r'),
  hashToken: vi.fn().mockReturnValue('h'),
  getRefreshTokenExpiry: vi.fn().mockReturnValue(new Date(Date.now() + 86400000)),
}));
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
vi.mock('../lib/audit.ts', () => ({ ...mockAudit }));
vi.mock('../lib/notification.ts', () => ({ ...mockNotif }));
vi.mock('../middleware/rate-limiter.ts', () => mockRateLimit);

function mkApp(role: UserRole = 'admin') {
  authState.userRole = role;
  authState.userId = 'uid';
  const app = new Hono();
  app.onError(errorHandler);
  app.route('/api/v1/corporate-inquiries', corporateInquiriesRouter);
  return app;
}

function a() {
  return { Authorization: 'Bearer x', 'Content-Type': 'application/json' };
}

const inquiryId = '00000000-0000-0000-0000-000000000001';

beforeEach(() => {
  setTestEnv();
  vi.clearAllMocks();
  mockDb.select.mockReturnValue(makeChain([]));
  mockDb.insert.mockReturnValue(insertChain([]));
  mockDb.update.mockReturnValue(updateChain([]));
});

const INQ = {
  companyName: 'PT Maju Jaya',
  email: 'info@majujaya.com',
  phone: '08123456789',
};

describe('POST / — public submission', () => {
  it('201 created', async () => {
    mockDb.insert.mockReturnValue(insertChain([{ id: inquiryId, ...INQ, status: 'Pending' }]));
    const res = await mkApp().request('/api/v1/corporate-inquiries', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(INQ),
    });
    expect(res.status).toBe(201);
  });

  it('422 validation', async () => {
    const res = await mkApp().request('/api/v1/corporate-inquiries', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({}),
    });
    expect(res.status).toBe(422);
  });
});

describe('GET / — admin list', () => {
  it('200 list', async () => {
    mockDb.select.mockReturnValue(makeChain([{ id: inquiryId, ...INQ, status: 'Pending' }]));
    const res = await mkApp().request('/api/v1/corporate-inquiries', {
      method: 'GET',
      headers: a(),
    });
    expect(res.status).toBe(200);
  });

  it('403 customer', async () => {
    const res = await mkApp('customer').request('/api/v1/corporate-inquiries', {
      method: 'GET',
      headers: a(),
    });
    expect(res.status).toBe(403);
  });
});

describe('GET /:id — admin detail', () => {
  it('200 detail', async () => {
    mockDb.select.mockReturnValue(makeChain([{ id: inquiryId, ...INQ, status: 'Pending' }]));
    const res = await mkApp().request(`/api/v1/corporate-inquiries/${inquiryId}`, {
      method: 'GET',
      headers: a(),
    });
    expect(res.status).toBe(200);
  });

  it('404 not found', async () => {
    mockDb.select.mockReturnValue(makeChain([]));
    const res = await mkApp().request(`/api/v1/corporate-inquiries/${inquiryId}`, {
      method: 'GET',
      headers: a(),
    });
    expect(res.status).toBe(404);
  });
});

describe('PATCH /:id — admin update status', () => {
  it('200 update', async () => {
    mockDb.select.mockReturnValue(makeChain([{ id: inquiryId }]));
    mockDb.update.mockReturnValue(updateChain([{ id: inquiryId, status: 'Contacted' }]));
    const res = await mkApp().request(`/api/v1/corporate-inquiries/${inquiryId}`, {
      method: 'PATCH',
      headers: a(),
      body: JSON.stringify({ status: 'Contacted' }),
    });
    expect(res.status).toBe(200);
  });

  it('404 not found', async () => {
    mockDb.select.mockReturnValue(makeChain([]));
    const res = await mkApp().request(`/api/v1/corporate-inquiries/${inquiryId}`, {
      method: 'PATCH',
      headers: a(),
      body: JSON.stringify({ status: 'Contacted' }),
    });
    expect(res.status).toBe(404);
  });

  it('422 invalid status', async () => {
    mockDb.select.mockReturnValue(makeChain([{ id: inquiryId }]));
    const res = await mkApp().request(`/api/v1/corporate-inquiries/${inquiryId}`, {
      method: 'PATCH',
      headers: a(),
      body: JSON.stringify({ status: 'Invalid' }),
    });
    expect(res.status).toBe(422);
  });
});
