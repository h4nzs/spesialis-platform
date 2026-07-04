import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Hono } from 'hono';
import type { Context } from 'hono';
import type { UserRole } from '@specialist/types';
import { notificationsRouter } from './notifications.ts';
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
  app.route('/api/v1/notifications', notificationsRouter);
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
  it('200 paginated', async () => {
    mockDb.select.mockReturnValue(makeChain([]));
    const res = await mkApp().request('/api/v1/notifications', { headers: a() });
    expect(res.status).toBe(200);
  });
  it('401 without auth', async () => {
    const res = await mkApp().request('/api/v1/notifications');
    expect(res.status).toBe(401);
  });
});

describe('GET /unread-count', () => {
  it('200', async () => {
    mockDb.select.mockReturnValue(makeChain([{ count: 3 }]));
    const res = await mkApp().request('/api/v1/notifications/unread-count', { headers: a() });
    expect(res.status).toBe(200);
  });
});

describe('PATCH /read', () => {
  it('200', async () => {
    const res = await mkApp().request('/api/v1/notifications/read', {
      method: 'PATCH',
      headers: a(),
      body: JSON.stringify({
        notificationIds: [
          '550e8400-e29b-41d4-a716-446655440001',
          '550e8400-e29b-41d4-a716-446655440002',
        ],
      }),
    });
    expect(res.status).toBe(200);
  });
  it('422 empty', async () => {
    const res = await mkApp().request('/api/v1/notifications/read', {
      method: 'PATCH',
      headers: a(),
      body: JSON.stringify({}),
    });
    expect(res.status).toBe(422);
  });
});
