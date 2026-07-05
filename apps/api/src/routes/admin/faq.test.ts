import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Hono } from 'hono';
import type { Context } from 'hono';
import type { UserRole } from '@specialist/types';
import { adminFaqRouter } from './faq.ts';
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
  app.route('/api/v1/admin/faq', adminFaqRouter);
  return app;
}

function a() {
  return { Authorization: 'Bearer x', 'Content-Type': 'application/json' };
}

beforeEach(() => {
  setTestEnv();
  vi.clearAllMocks();
  mockDb.select.mockReturnValue(makeChain([]));
  mockDb.insert.mockReturnValue(insertChain([]));
  mockDb.update.mockReturnValue(updateChain([]));
});

const faqId = '00000000-0000-0000-0000-000000000001';

describe('GET /api/v1/admin/faq', () => {
  it('200 list', async () => {
    mockDb.select.mockReturnValue(
      makeChain([
        {
          id: faqId,
          question: 'Test?',
          answer: 'Answer.',
          category: 'Umum',
          displayOrder: 1,
          isActive: 'true',
        },
      ]),
    );
    const res = await mkApp().request('/api/v1/admin/faq', { headers: a() });
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.data).toHaveLength(1);
    expect(body.data[0].question).toBe('Test?');
  });

  it('401 without auth', async () => {
    const res = await mkApp().request('/api/v1/admin/faq');
    expect(res.status).toBe(401);
  });

  it('403 for customer', async () => {
    const res = await mkApp('customer').request('/api/v1/admin/faq', { headers: a() });
    expect(res.status).toBe(403);
  });
});

describe('GET /api/v1/admin/faq/:id', () => {
  it('200 detail', async () => {
    mockDb.select.mockReturnValue(
      makeChain([
        {
          id: faqId,
          question: 'Test?',
          answer: 'Answer.',
          category: 'Umum',
          displayOrder: 1,
          isActive: 'true',
        },
      ]),
    );
    const res = await mkApp().request(`/api/v1/admin/faq/${faqId}`, { headers: a() });
    expect(res.status).toBe(200);
  });

  it('404 not found', async () => {
    mockDb.select.mockReturnValue(makeChain([]));
    const res = await mkApp().request(`/api/v1/admin/faq/${faqId}`, { headers: a() });
    expect(res.status).toBe(404);
  });
});

describe('POST /api/v1/admin/faq', () => {
  it('201 created', async () => {
    mockDb.insert.mockReturnValue(insertChain([{ id: faqId }]));
    const res = await mkApp().request('/api/v1/admin/faq', {
      method: 'POST',
      headers: a(),
      body: JSON.stringify({ question: 'Q?', answer: 'A.' }),
    });
    expect(res.status).toBe(201);
  });

  it('422 validation', async () => {
    const res = await mkApp().request('/api/v1/admin/faq', {
      method: 'POST',
      headers: a(),
      body: JSON.stringify({ question: '' }),
    });
    expect(res.status).toBe(422);
  });
});

describe('PATCH /api/v1/admin/faq/:id', () => {
  it('200 updated', async () => {
    mockDb.select.mockReturnValue(makeChain([{ id: faqId }]));
    mockDb.update.mockReturnValue(updateChain([{ id: faqId, question: 'Updated?' }]));
    const res = await mkApp().request(`/api/v1/admin/faq/${faqId}`, {
      method: 'PATCH',
      headers: a(),
      body: JSON.stringify({ question: 'Updated?' }),
    });
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.data.question).toBe('Updated?');
  });

  it('404 not found', async () => {
    mockDb.select.mockReturnValue(makeChain([]));
    const res = await mkApp().request(`/api/v1/admin/faq/${faqId}`, {
      method: 'PATCH',
      headers: a(),
      body: JSON.stringify({ question: 'Q?' }),
    });
    expect(res.status).toBe(404);
  });
});

describe('DELETE /api/v1/admin/faq/:id', () => {
  it('200 deleted', async () => {
    mockDb.select.mockReturnValue(makeChain([{ id: faqId }]));
    const res = await mkApp().request(`/api/v1/admin/faq/${faqId}`, {
      method: 'DELETE',
      headers: a(),
    });
    expect(res.status).toBe(200);
  });

  it('404 not found', async () => {
    mockDb.select.mockReturnValue(makeChain([]));
    const res = await mkApp().request(`/api/v1/admin/faq/${faqId}`, {
      method: 'DELETE',
      headers: a(),
    });
    expect(res.status).toBe(404);
  });
});
