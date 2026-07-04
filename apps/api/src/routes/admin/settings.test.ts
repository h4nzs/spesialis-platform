import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Hono } from 'hono';
import type { Context } from 'hono';
import type { UserRole } from '@specialist/types';
import { adminSettingsRouter } from './settings.ts';
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
  app.route('/api/v1/admin/settings', adminSettingsRouter);
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

describe('GET /api/v1/admin/settings', () => {
  it('200 grouped', async () => {
    mockDb.select.mockReturnValue(
      makeChain([
        { key: 'site_name', value: 'Spesialis', category: 'general', description: null },
        { key: 'max_upload', value: '10', category: 'media', description: 'MB' },
      ]),
    );
    const res = await mkApp().request('/api/v1/admin/settings', { headers: a() });
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.data).toHaveProperty('general');
    expect(body.data).toHaveProperty('media');
    expect(body.data.general).toHaveLength(1);
    expect(body.data.media).toHaveLength(1);
  });

  it('200 empty', async () => {
    const res = await mkApp().request('/api/v1/admin/settings', { headers: a() });
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.data).toEqual({});
  });

  it('401 without auth', async () => {
    const res = await mkApp().request('/api/v1/admin/settings');
    expect(res.status).toBe(401);
  });

  it('403 for customer', async () => {
    const res = await mkApp('customer').request('/api/v1/admin/settings', { headers: a() });
    expect(res.status).toBe(403);
  });
});

describe('PATCH /api/v1/admin/settings', () => {
  it('200 upsert', async () => {
    mockDb.select.mockReturnValueOnce(makeChain([{ id: 's1', value: 'old' }]));
    mockDb.select.mockReturnValueOnce(makeChain([]));
    mockDb.update.mockReturnValue(updateChain([{ id: 's1' }]));
    const res = await mkApp().request('/api/v1/admin/settings', {
      method: 'PATCH',
      headers: a(),
      body: JSON.stringify({
        settings: [
          { key: 'site_name', value: 'Spesialis Baru' },
          { key: 'new_key', value: 'new_val', category: 'custom', description: 'test' },
        ],
      }),
    });
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.data.updated).toBe(2);
  });

  it('422 validation', async () => {
    const res = await mkApp().request('/api/v1/admin/settings', {
      method: 'PATCH',
      headers: a(),
      body: JSON.stringify({ settings: [{ key: '', value: '' }] }),
    });
    expect(res.status).toBe(422);
  });

  it('401 without auth', async () => {
    const res = await mkApp().request('/api/v1/admin/settings', { method: 'PATCH' });
    expect(res.status).toBe(401);
  });
});
