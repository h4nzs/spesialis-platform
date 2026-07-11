import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Hono } from 'hono';
import type { Context } from 'hono';
import type { UserRole } from '@ahlipanggilan/types';
import { adminAuditLogsRouter } from './audit-logs.ts';
import { setTestEnv, makeChain } from '../../test-utils.ts';

const { mockDb, authState, em } = vi.hoisted(() => {
  const db = {
    select: vi.fn(),
    insert: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    execute: vi.fn().mockResolvedValue([]),
  };
  const st: { userId: string; userRole: UserRole } = { userId: 'uid', userRole: 'admin' };
  const exps = (globalThis as Record<string, unknown>).__TABLE_EXPORTS as Record<string, unknown>;
  return { mockDb: db, authState: st, em: exps };
});

vi.mock('../../lib/db.ts', () => ({ db: mockDb, ...em }));

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

const UUID = '550e8400-e29b-41d4-a716-446655440000';

function a() {
  return { Authorization: 'Bearer x', 'Content-Type': 'application/json' };
}

function mkApp(role: UserRole = 'admin') {
  authState.userRole = role;
  authState.userId = 'uid';
  const app = new Hono();
  app.route('/api/v1/admin/audit-logs', adminAuditLogsRouter);
  return app;
}

beforeEach(() => {
  setTestEnv();
  vi.clearAllMocks();
  mockDb.select.mockReset();
});

describe('GET /', () => {
  it('200 paginated list', async () => {
    mockDb.select.mockReturnValueOnce(makeChain([{ total: 1 }]));
    mockDb.select.mockReturnValueOnce(
      makeChain([
        {
          id: UUID,
          action: 'LOGIN',
          entity: 'user',
          entityId: UUID,
          oldValue: null,
          newValue: null,
          ipAddress: '127.0.0.1',
          userAgent: 'test',
          createdAt: new Date().toISOString(),
          userEmail: 'admin@test.com',
          userRole: 'admin',
        },
      ]),
    );
    const res = await mkApp().request('/api/v1/admin/audit-logs', { headers: a() });
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.success).toBe(true);
    expect(body.data).toHaveLength(1);
    expect(body.pagination).toBeDefined();
    expect(body.pagination.total).toBe(1);
  });

  it('200 empty', async () => {
    mockDb.select.mockReturnValueOnce(makeChain([{ total: 0 }]));
    mockDb.select.mockReturnValueOnce(makeChain([]));
    const res = await mkApp().request('/api/v1/admin/audit-logs', { headers: a() });
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.data).toEqual([]);
  });

  it('200 filtered by action', async () => {
    mockDb.select.mockReturnValueOnce(makeChain([{ total: 0 }]));
    mockDb.select.mockReturnValueOnce(makeChain([]));
    const res = await mkApp().request('/api/v1/admin/audit-logs?action=LOGIN', { headers: a() });
    expect(res.status).toBe(200);
  });

  it('403 customer', async () => {
    const res = await mkApp('customer').request('/api/v1/admin/audit-logs', { headers: a() });
    expect(res.status).toBe(403);
  });

  it('403 content_manager', async () => {
    const res = await mkApp('content_manager').request('/api/v1/admin/audit-logs', {
      headers: a(),
    });
    expect(res.status).toBe(403);
  });
});
