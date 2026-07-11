import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Hono } from 'hono';
import type { Context } from 'hono';
import type { UserRole } from '@ahlipanggilan/types';
import { partnersRouter } from './partners.ts';
import { errorHandler } from '../middleware/error-handler.ts';
import { setTestEnv, makeChain, insertChain, updateChain } from '../test-utils.ts';
import type { ApiTestResponse } from '../test-utils.ts';

const { mockDb, authState, mockAuth, em } = vi.hoisted(() => {
  const db = {
    select: vi.fn(),
    insert: vi.fn(),
    update: vi.fn(),
    delete: vi.fn().mockReturnValue({ where: vi.fn().mockResolvedValue(undefined) }),
    execute: vi.fn().mockResolvedValue([]),
    transaction: vi.fn((fn: (tx: unknown) => unknown) => fn(db)),
  };
  const st: { userId: string; userRole: UserRole } = { userId: 'puid', userRole: 'partner' };
  const mA = {
    hashPassword: vi.fn().mockResolvedValue('hashed-password'),
    verifyPassword: vi.fn().mockResolvedValue(true),
    signAccessToken: vi.fn().mockResolvedValue('mock-access-token'),
    verifyAccessToken: vi.fn().mockResolvedValue({ sub: 'puid', role: 'partner', exp: 9999999999 }),
    generateRefreshToken: vi.fn().mockReturnValue('mock-refresh-token'),
    hashToken: vi.fn().mockReturnValue('mock-hash-token'),
    getRefreshTokenExpiry: vi.fn().mockReturnValue(new Date(Date.now() + 7 * 86400000)),
  };
  const exps = (globalThis as Record<string, unknown>).__TABLE_EXPORTS as Record<string, unknown>;
  return { mockDb: db, authState: st, mockAuth: mA, em: exps };
});

vi.mock('../lib/db.ts', () => ({ db: mockDb, ...em }));
vi.mock('../lib/auth.ts', () => ({ ...mockAuth }));
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

function mkApp(role: UserRole = 'partner') {
  authState.userRole = role;
  authState.userId = 'puid';
  const app = new Hono();
  app.onError(errorHandler);
  app.route('/api/v1/partners', partnersRouter);
  return app;
}

beforeEach(() => {
  setTestEnv();
  vi.clearAllMocks();
  mockDb.select.mockReturnValue(makeChain([]));
  mockDb.insert.mockReturnValue(insertChain([]));
  mockDb.update.mockReturnValue(updateChain([]));
  mockDb.transaction.mockImplementation((fn: (tx: unknown) => unknown) => fn(mockDb));
});

const REG = {
  email: 'p@t.com',
  phone: '08123456789',
  password: 'Str0ng!P1',
  fullName: 'P',
  ktpNumber: '3201010101010001',
};
const CATEGORY_ID = '550e8400-e29b-41d4-a716-446655440010';
function a() {
  return { Authorization: 'Bearer x', 'Content-Type': 'application/json' };
}

describe('POST /register', () => {
  it('201', async () => {
    mockDb.select.mockReturnValue(makeChain([]));
    mockDb.insert.mockReturnValueOnce(
      insertChain([{ id: 'uid', email: 'p@t.com', role: 'partner' }]),
    );
    mockDb.insert.mockReturnValueOnce(insertChain([{ id: 'pp' }]));
    const res = await mkApp().request('/api/v1/partners/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(REG),
    });
    expect(res.status).toBe(201);
  });
  it('409 duplicate', async () => {
    mockDb.select.mockReturnValue(makeChain([{ id: 'x' }]));
    const res = await mkApp().request('/api/v1/partners/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(REG),
    });
    expect(res.status).toBe(409);
  });
  it('422 empty', async () => {
    const res = await mkApp().request('/api/v1/partners/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({}),
    });
    expect(res.status).toBe(422);
  });
});

describe('GET /', () => {
  it('200', async () => {
    mockDb.select.mockReturnValue(makeChain([]));
    const res = await mkApp().request('/api/v1/partners');
    expect(res.status).toBe(200);
    expect(((await res.json()) as ApiTestResponse).pagination).toBeDefined();
  });
  it('filter availability', async () => {
    mockDb.select.mockReturnValue(makeChain([]));
    const res = await mkApp().request('/api/v1/partners?availability=Available');
    expect(res.status).toBe(200);
  });
  it('422 bad pagination', async () => {
    const res = await mkApp().request('/api/v1/partners?page=-1');
    expect(res.status).toBe(422);
  });
});

describe('GET /me', () => {
  it('200', async () => {
    mockDb.select.mockReturnValue(makeChain([{ id: 'pp', fullName: 'P' }]));
    const res = await mkApp().request('/api/v1/partners/me', { headers: a() });
    expect(res.status).toBe(200);
  });
  it('404 missing', async () => {
    mockDb.select.mockReturnValue(makeChain([]));
    const res = await mkApp().request('/api/v1/partners/me', { headers: a() });
    expect(res.status).toBe(404);
  });
});

describe('PATCH /me', () => {
  it('200', async () => {
    mockDb.update.mockReturnValue(
      updateChain([{ id: 'pp', fullName: 'U', phone: '081', bio: 'Pro', experienceYear: 5 }]),
    );
    const res = await mkApp().request('/api/v1/partners/me', {
      method: 'PATCH',
      headers: a(),
      body: JSON.stringify({ fullName: 'U' }),
    });
    expect(res.status).toBe(200);
  });
});

describe('PATCH /me/availability', () => {
  it('200', async () => {
    mockDb.update.mockReturnValue(updateChain([{ availability: 'Available' }]));
    const res = await mkApp().request('/api/v1/partners/me/availability', {
      method: 'PATCH',
      headers: a(),
      body: JSON.stringify({ availability: 'Available' }),
    });
    expect(res.status).toBe(200);
  });
  it('422 invalid', async () => {
    const res = await mkApp().request('/api/v1/partners/me/availability', {
      method: 'PATCH',
      headers: a(),
      body: JSON.stringify({ availability: 'Bad' }),
    });
    expect(res.status).toBe(422);
  });
});

describe('GET /:id', () => {
  it('200', async () => {
    mockDb.select.mockReturnValueOnce(
      makeChain([
        {
          id: 'pid',
          fullName: 'P',
          userId: 'uid',
          avatar: null,
          experienceYear: 5,
          bio: 'Pro',
          ratingAverage: '4.5',
          completedJobs: 10,
          availability: 'Available',
          verificationStatus: 'Approved',
          createdAt: new Date(),
        },
      ]),
    );
    mockDb.select.mockReturnValueOnce(makeChain([]));
    const res = await mkApp().request('/api/v1/partners/pid');
    expect(res.status).toBe(200);
  });
  it('404', async () => {
    mockDb.select.mockReturnValue(makeChain([]));
    const res = await mkApp().request('/api/v1/partners/nope');
    expect(res.status).toBe(404);
  });
});

describe('GET /me/skills', () => {
  it('200', async () => {
    mockDb.select.mockReturnValueOnce(makeChain([{ id: 'pp' }]));
    mockDb.select.mockReturnValueOnce(
      makeChain([
        {
          id: 's1',
          categoryId: 'c1',
          categoryName: 'AC',
          proficiency: 'Expert',
          createdAt: new Date(),
        },
      ]),
    );
    const res = await mkApp().request('/api/v1/partners/me/skills', { headers: a() });
    expect(res.status).toBe(200);
  });
  it('404 no profile', async () => {
    mockDb.select.mockReturnValue(makeChain([]));
    const res = await mkApp().request('/api/v1/partners/me/skills', { headers: a() });
    expect(res.status).toBe(404);
  });
});

describe('POST /me/skills', () => {
  it('201', async () => {
    mockDb.select.mockReturnValueOnce(makeChain([{ id: 'pp' }]));
    mockDb.select.mockReturnValueOnce(makeChain([]));
    mockDb.insert.mockReturnValue(
      insertChain([{ id: 's1', categoryId: CATEGORY_ID, proficiency: 'Intermediate' }]),
    );
    const res = await mkApp().request('/api/v1/partners/me/skills', {
      method: 'POST',
      headers: a(),
      body: JSON.stringify({ categoryId: CATEGORY_ID }),
    });
    expect(res.status).toBe(201);
  });
  it('409 duplicate', async () => {
    mockDb.select.mockReturnValueOnce(makeChain([{ id: 'pp' }]));
    mockDb.select.mockReturnValueOnce(makeChain([{ id: 's1' }]));
    const res = await mkApp().request('/api/v1/partners/me/skills', {
      method: 'POST',
      headers: a(),
      body: JSON.stringify({ categoryId: CATEGORY_ID }),
    });
    expect(res.status).toBe(409);
  });
});

describe('POST /:id/verify', () => {
  it('200 admin', async () => {
    mockDb.select.mockReturnValue(makeChain([{ id: 'pid', verificationStatus: 'Pending' }]));
    mockDb.update.mockReturnValue(updateChain([]));
    const res = await mkApp('admin').request('/api/v1/partners/pid/verify', {
      method: 'POST',
      headers: a(),
      body: JSON.stringify({ verificationStatus: 'Approved' }),
    });
    expect(res.status).toBe(200);
  });
  it('403 partner', async () => {
    const res = await mkApp('partner').request('/api/v1/partners/pid/verify', {
      method: 'POST',
      headers: a(),
      body: JSON.stringify({ verificationStatus: 'Approved' }),
    });
    expect(res.status).toBe(403);
  });
  it('404 missing', async () => {
    mockDb.select.mockReturnValue(makeChain([]));
    const res = await mkApp('admin').request('/api/v1/partners/nope/verify', {
      method: 'POST',
      headers: a(),
      body: JSON.stringify({ verificationStatus: 'Approved' }),
    });
    expect(res.status).toBe(404);
  });
  it('422 bad status', async () => {
    const res = await mkApp('admin').request('/api/v1/partners/pid/verify', {
      method: 'POST',
      headers: a(),
      body: JSON.stringify({ verificationStatus: 'Bad' }),
    });
    expect(res.status).toBe(422);
  });
});

describe('GET /me/penalties', () => {
  it('200 returns penalties list', async () => {
    mockDb.select.mockReturnValueOnce(makeChain([{ id: 'pp' }]));
    mockDb.select.mockReturnValueOnce(
      makeChain([
        {
          id: 'pen1',
          orderId: null,
          type: 'Late',
          amount: '50000',
          reason: 'Terlambat',
          status: 'Pending',
          imposedAt: new Date(),
          resolvedAt: null,
          notes: null,
        },
      ]),
    );
    const res = await mkApp().request('/api/v1/partners/me/penalties', { headers: a() });
    expect(res.status).toBe(200);
    const body = (await res.json()) as { success: boolean; data: unknown[] };
    expect(body.success).toBe(true);
    expect(body.data).toHaveLength(1);
  });

  it('200 empty when no penalties', async () => {
    mockDb.select.mockReturnValueOnce(makeChain([{ id: 'pp' }]));
    mockDb.select.mockReturnValueOnce(makeChain([]));
    const res = await mkApp().request('/api/v1/partners/me/penalties', { headers: a() });
    expect(res.status).toBe(200);
    const body = (await res.json()) as { success: boolean; data: unknown[] };
    expect(body.data).toHaveLength(0);
  });

  it('404 no profile', async () => {
    mockDb.select.mockReturnValue(makeChain([]));
    const res = await mkApp().request('/api/v1/partners/me/penalties', { headers: a() });
    expect(res.status).toBe(404);
  });

  it('401 no auth', async () => {
    const res = await mkApp().request('/api/v1/partners/me/penalties');
    expect(res.status).toBe(401);
  });
});

describe('GET /me/earnings', () => {
  it('200 with earnings data', async () => {
    mockDb.select.mockReturnValueOnce(makeChain([{ id: 'pp' }]));
    mockDb.select.mockReturnValueOnce(
      makeChain([
        {
          id: 'o1',
          bookingNumber: 'SP-2026-0001',
          status: 'Paid',
          finalPrice: '200000',
          completedAt: new Date(),
        },
        {
          id: 'o2',
          bookingNumber: 'SP-2026-0002',
          status: 'Paid',
          finalPrice: '150000',
          completedAt: new Date(),
        },
      ]),
    );
    const res = await mkApp().request('/api/v1/partners/me/earnings', { headers: a() });
    const body = (await res.json()) as {
      success: boolean;
      data: { totalEarnings: number; paidCount: number; recentEarnings: unknown[] };
    };
    expect(res.status).toBe(200);
    expect(body.success).toBe(true);
    expect(body.data.totalEarnings).toBe(350000);
    expect(body.data.paidCount).toBe(2);
    expect(body.data.recentEarnings).toHaveLength(2);
  });

  it('200 zero earnings when no paid orders', async () => {
    mockDb.select.mockReturnValueOnce(makeChain([{ id: 'pp' }]));
    mockDb.select.mockReturnValueOnce(makeChain([]));
    const res = await mkApp().request('/api/v1/partners/me/earnings', { headers: a() });
    const body = (await res.json()) as {
      success: boolean;
      data: { totalEarnings: number; paidCount: number };
    };
    expect(res.status).toBe(200);
    expect(body.data.totalEarnings).toBe(0);
    expect(body.data.paidCount).toBe(0);
  });

  it('404 no profile', async () => {
    mockDb.select.mockReturnValue(makeChain([]));
    const res = await mkApp().request('/api/v1/partners/me/earnings', { headers: a() });
    expect(res.status).toBe(404);
  });

  it('401 no auth', async () => {
    const res = await mkApp().request('/api/v1/partners/me/earnings');
    expect(res.status).toBe(401);
  });
});
