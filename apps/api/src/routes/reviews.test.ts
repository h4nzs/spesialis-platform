import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Hono } from 'hono';
import type { Context } from 'hono';
import type { UserRole } from '@ahlipanggilan/types';
import { reviewsRouter } from './reviews.ts';
import { errorHandler } from '../middleware/error-handler.ts';
import { setTestEnv, makeChain, insertChain } from '../test-utils.ts';

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
vi.mock('../lib/auth.ts', () => ({
  hashPassword: vi.fn().mockResolvedValue('h'),
  verifyPassword: vi.fn().mockResolvedValue(true),
  signAccessToken: vi.fn().mockResolvedValue('t'),
  verifyAccessToken: vi.fn().mockResolvedValue({ sub: 'uid', role: 'customer', exp: 9999999999 }),
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

const UUID = '550e8400-e29b-41d4-a716-446655440000';
function a() {
  return { Authorization: 'Bearer x', 'Content-Type': 'application/json' };
}

function mkApp(role: UserRole = 'customer') {
  authState.userRole = role;
  authState.userId = 'uid';
  const app = new Hono();
  app.onError(errorHandler);
  app.route('/api/v1/reviews', reviewsRouter);
  return app;
}

beforeEach(() => {
  setTestEnv();
  vi.clearAllMocks();
  mockDb.select.mockReset();
  mockDb.insert.mockReset();
});

describe('POST /', () => {
  it('201 created', async () => {
    mockDb.select
      .mockReturnValueOnce(makeChain([{ id: 'cp1' }]))
      .mockReturnValueOnce(
        makeChain([{ id: 'o1', customerId: 'cp1', partnerId: 'pp1', status: 'Paid' }]),
      )
      .mockReturnValueOnce(makeChain([]));
    mockDb.insert.mockReturnValueOnce(
      insertChain([
        {
          id: 'r1',
          orderId: 'o1',
          customerId: 'cp1',
          partnerId: 'pp1',
          rating: '5',
          review: 'Bagus',
        },
      ]),
    );
    const res = await mkApp().request('/api/v1/reviews', {
      method: 'POST',
      headers: a(),
      body: JSON.stringify({ orderId: UUID, rating: 5, review: 'Bagus' }),
    });
    expect(res.status).toBe(201);
  });

  it('403 not a customer profile', async () => {
    mockDb.select.mockReturnValueOnce(makeChain([]));
    const res = await mkApp().request('/api/v1/reviews', {
      method: 'POST',
      headers: a(),
      body: JSON.stringify({ orderId: UUID, rating: 5 }),
    });
    expect(res.status).toBe(403);
  });

  it('404 order not found', async () => {
    mockDb.select
      .mockReturnValueOnce(makeChain([{ id: 'cp1' }]))
      .mockReturnValueOnce(makeChain([]));
    const res = await mkApp().request('/api/v1/reviews', {
      method: 'POST',
      headers: a(),
      body: JSON.stringify({ orderId: UUID, rating: 5 }),
    });
    expect(res.status).toBe(404);
  });

  it('409 order not paid/closed', async () => {
    mockDb.select
      .mockReturnValueOnce(makeChain([{ id: 'cp1' }]))
      .mockReturnValueOnce(
        makeChain([{ id: UUID, customerId: 'cp1', partnerId: 'pp1', status: 'Working' }]),
      );
    const res = await mkApp().request('/api/v1/reviews', {
      method: 'POST',
      headers: a(),
      body: JSON.stringify({ orderId: UUID, rating: 5 }),
    });
    expect(res.status).toBe(409);
  });

  it('409 duplicate', async () => {
    mockDb.select
      .mockReturnValueOnce(makeChain([{ id: 'cp1' }]))
      .mockReturnValueOnce(
        makeChain([{ id: UUID, customerId: 'cp1', partnerId: 'pp1', status: 'Paid' }]),
      )
      .mockReturnValueOnce(makeChain([{ id: 'r1' }]));
    const res = await mkApp().request('/api/v1/reviews', {
      method: 'POST',
      headers: a(),
      body: JSON.stringify({ orderId: UUID, rating: 5 }),
    });
    expect(res.status).toBe(409);
  });

  it('422 validation', async () => {
    const res = await mkApp().request('/api/v1/reviews', {
      method: 'POST',
      headers: a(),
      body: JSON.stringify({}),
    });
    expect(res.status).toBe(422);
  });
});

describe('GET /', () => {
  it('200 list all', async () => {
    mockDb.select.mockReturnValueOnce(makeChain([{ id: 'r1', orderId: 'o1', rating: '5' }]));
    const res = await mkApp().request('/api/v1/reviews');
    expect(res.status).toBe(200);
    const j = (await res.json()) as { success: boolean; data: unknown[] };
    expect(j.success).toBe(true);
  });

  it('200 filter by partnerId', async () => {
    mockDb.select.mockReturnValueOnce(makeChain([{ id: 'r1' }]));
    const res = await mkApp().request('/api/v1/reviews?partnerId=pp1');
    expect(res.status).toBe(200);
  });
});

describe('GET /:id', () => {
  it('200 found', async () => {
    mockDb.select.mockReturnValueOnce(makeChain([{ id: 'r1', orderId: 'o1', rating: '5' }]));
    const res = await mkApp().request('/api/v1/reviews/r1');
    expect(res.status).toBe(200);
  });

  it('404 not found', async () => {
    mockDb.select.mockReturnValueOnce(makeChain([]));
    const res = await mkApp().request('/api/v1/reviews/r1');
    expect(res.status).toBe(404);
  });
});
