import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Hono } from 'hono';
import type { Context } from 'hono';
import type { UserRole } from '@ahlipanggilan/types';
import { adminLocksRouter } from './locks.ts';
import { errorHandler } from '../../middleware/error-handler.ts';
import { setTestEnv, makeChain, updateChain } from '../../test-utils.ts';

// ── Hoisted mocks ───────────────────────────────────────────────

const mockRateLimit = vi.hoisted(() => ({
  rateLimit: () => async (_c: unknown, next: () => unknown) => next(),
}));

const { mockDb, authState, em } = vi.hoisted(() => {
  const db = {
    select: vi.fn(),
    insert: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    execute: vi.fn().mockResolvedValue([]),
    transaction: vi.fn((fn: (tx: unknown) => unknown) => fn(db)),
  };
  const st: { userId: string; userRole: UserRole } = { userId: 'admin-uid', userRole: 'admin' };
  const exps = (globalThis as Record<string, unknown>).__TABLE_EXPORTS as Record<string, unknown>;
  return { mockDb: db, authState: st, em: exps };
});

// Mock redis.ts — lock-pubsub menggunakan getRedis dari sini
// Dengan return null, publishLockEvent dan subscribeLockEvents jadi no-op.
vi.mock('../../lib/redis.ts', () => ({
  getRedis: vi.fn(() => null),
}));

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
vi.mock('../../middleware/rate-limiter.ts', () => mockRateLimit);

// ── App factory ─────────────────────────────────────────────────

function mkApp(role: UserRole = 'admin') {
  authState.userRole = role;
  authState.userId = 'admin-uid';
  const app = new Hono();
  app.onError(errorHandler);
  app.route('/api/v1/admin/locks', adminLocksRouter);
  return app;
}

function authHeaders() {
  return { Authorization: 'Bearer x', 'Content-Type': 'application/json' };
}

// ── Test data ──────────────────────────────────────────────────

// UUID harus valid dengan strict Zod uuid() — versi nibble (1-5) dan variant nibble (8|9|a|b).
// Format: xxxxxxxx-xxxx-4xxx-8xxx-xxxxxxxxxxxx (version 4, variant 1)
const ARTICLE_ID = '00000000-0000-4000-8000-000000000001';
const ARTICLE_ID_2 = '00000000-0000-4000-8000-000000000002';
const OTHER_USER_ID = '00000000-0000-4000-8000-0000000000ff';
const LOCK_ID = '00000000-0000-4000-8000-000000000010';

const MOCK_LOCK_ROW = {
  id: LOCK_ID,
  lockedBy: 'admin-uid',
  lockedAt: new Date('2026-07-24T10:00:00.000Z'),
  heartbeatAt: new Date('2026-07-24T10:00:00.000Z'),
  lockedByEmail: 'admin@test.com',
};

/** Insert chain: .values().onConflictDoNothing().returning() — digunakan oleh POST /acquire */
function insertChainWithConflict<T>(result: T) {
  return {
    values: vi.fn().mockReturnValue({
      onConflictDoNothing: vi.fn().mockReturnValue({
        returning: vi.fn().mockResolvedValue(result),
      }),
    }),
  };
}

/** Insert chain: .values().returning() — digunakan oleh POST /takeover (tanpa onConflictDoNothing) */
function insertChainDirect<T>(result: T) {
  return {
    values: vi.fn().mockReturnValue({
      returning: vi.fn().mockResolvedValue(result),
    }),
  };
}

/** Delete chain with .where().returning() support */
function deleteChainWithReturn<T>(result: T) {
  return {
    where: vi.fn().mockReturnValue({
      returning: vi.fn().mockResolvedValue(result),
    }),
  };
}

beforeEach(() => {
  setTestEnv();
  vi.clearAllMocks();

  mockDb.select.mockReturnValue(makeChain([]));
  mockDb.insert.mockReturnValue(insertChainWithConflict([]));
  mockDb.update.mockReturnValue(updateChain([]));
  mockDb.delete.mockReturnValue(deleteChainWithReturn([]));
});

// ── Auth tests ────────────────────────────────────────────────

describe('Auth / Authorization', () => {
  it('returns 401 without auth token', async () => {
    const res = await mkApp().request('/api/v1/admin/locks/check?type=article&id=1');
    expect(res.status).toBe(401);
  });

  it('returns 403 for customer role', async () => {
    const res = await mkApp('customer').request('/api/v1/admin/locks/check?type=article&id=1', {
      headers: authHeaders(),
    });
    expect(res.status).toBe(403);
  });
});

// ── GET /check ─────────────────────────────────────────────────

describe('GET /locks/check', () => {
  it('returns locked: false when resource is not locked', async () => {
    const res = await mkApp().request(`/api/v1/admin/locks/check?type=article&id=${ARTICLE_ID}`, {
      headers: authHeaders(),
    });
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.data.locked).toBe(false);
  });

  it('returns locked: true with lockedByMe when locked by self', async () => {
    mockDb.select.mockReturnValue(makeChain([MOCK_LOCK_ROW]));
    const res = await mkApp().request(`/api/v1/admin/locks/check?type=article&id=${ARTICLE_ID}`, {
      headers: authHeaders(),
    });
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.data.locked).toBe(true);
    expect(body.data.lockedByEmail).toBe('admin@test.com');
    expect(body.data.lockedByMe).toBe(true);
  });

  it('returns lockedByMe false when locked by another user', async () => {
    mockDb.select.mockReturnValue(
      makeChain([{ ...MOCK_LOCK_ROW, lockedBy: OTHER_USER_ID, lockedByEmail: 'other@test.com' }]),
    );
    const res = await mkApp().request(`/api/v1/admin/locks/check?type=article&id=${ARTICLE_ID}`, {
      headers: authHeaders(),
    });
    const body = await res.json();
    expect(body.data.lockedByMe).toBe(false);
    expect(body.data.lockedByEmail).toBe('other@test.com');
  });

  it('returns 400 when type or id missing', async () => {
    const res = await mkApp().request('/api/v1/admin/locks/check', {
      headers: authHeaders(),
    });
    expect(res.status).toBe(400);
  });
});

// ── GET /batch ────────────────────────────────────────────────

describe('GET /locks/batch', () => {
  it('returns lock map for multiple IDs', async () => {
    mockDb.select.mockReturnValue(
      makeChain([
        {
          resourceId: ARTICLE_ID,
          lockedBy: 'admin-uid',
          lockedAt: new Date(),
          lockedByEmail: 'admin@test.com',
        },
      ]),
    );

    const res = await mkApp().request(
      `/api/v1/admin/locks/batch?type=article&ids=${ARTICLE_ID},${ARTICLE_ID_2}`,
      { headers: authHeaders() },
    );
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.data.locks[ARTICLE_ID].locked).toBe(true);
    expect(body.data.locks[ARTICLE_ID_2]).toBeUndefined();
  });

  it('returns 400 when ids param is empty', async () => {
    const res = await mkApp().request('/api/v1/admin/locks/batch?type=article&ids=', {
      headers: authHeaders(),
    });
    expect(res.status).toBe(400);
  });
});

// ── POST /acquire ────────────────────────────────────────────

describe('POST /locks/acquire', () => {
  it('acquires lock successfully', async () => {
    mockDb.insert.mockReturnValue(insertChainWithConflict([{ id: LOCK_ID }]));
    // getUserEmail lookup
    const emailChain = {
      from: vi.fn().mockReturnThis(),
      where: vi.fn().mockReturnThis(),
      limit: vi.fn().mockReturnThis(),
      then: (fn: any) => Promise.resolve([{ email: 'admin@test.com' }]).then(fn),
    };
    mockDb.select.mockReturnValue(emailChain);

    const res = await mkApp().request('/api/v1/admin/locks/acquire', {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify({ resourceType: 'article', resourceId: ARTICLE_ID }),
    });
    expect(res.status).toBe(201);
    const body = await res.json();
    expect(body.data.acquired).toBe(true);
    expect(body.data.lockId).toBe(LOCK_ID);
  });

  it('returns 409 when resource is locked by another user', async () => {
    // INSERT returns empty → conflict
    mockDb.insert.mockReturnValue(insertChainWithConflict([]));
    // getLockHolderInfo → lock held by other user
    const holderChain = {
      from: vi.fn().mockReturnThis(),
      where: vi.fn().mockReturnThis(),
      limit: vi.fn().mockReturnThis(),
      innerJoin: vi.fn().mockReturnThis(),
      then: (fn: any) =>
        Promise.resolve([{ id: LOCK_ID, lockedBy: OTHER_USER_ID, lockedAt: new Date() }]).then(fn),
    };
    mockDb.select.mockReturnValue(holderChain);

    const res = await mkApp().request('/api/v1/admin/locks/acquire', {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify({ resourceType: 'article', resourceId: ARTICLE_ID }),
    });
    expect(res.status).toBe(409);
    const body = await res.json();
    expect(body.code).toBe('RESOURCE_LOCKED');
    expect(body.lockedByEmail).toBe('Unknown'); // getUserEmail returns 'Unknown' when no user found
  });

  it('refreshes heartbeat when user already holds the lock', async () => {
    mockDb.insert.mockReturnValue(insertChainWithConflict([]));
    // getLockHolderInfo → lock held by current user
    const holderChain = {
      from: vi.fn().mockReturnThis(),
      where: vi.fn().mockReturnThis(),
      limit: vi.fn().mockReturnThis(),
      innerJoin: vi.fn().mockReturnThis(),
      then: (fn: any) =>
        Promise.resolve([{ id: LOCK_ID, lockedBy: 'admin-uid', lockedAt: new Date() }]).then(fn),
    };
    mockDb.select.mockReturnValue(holderChain);
    mockDb.update.mockReturnValue(updateChain([{ id: LOCK_ID }]));

    const res = await mkApp().request('/api/v1/admin/locks/acquire', {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify({ resourceType: 'article', resourceId: ARTICLE_ID }),
    });
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.data.acquired).toBe(true);
  });

  it('returns 422 for invalid body', async () => {
    const res = await mkApp().request('/api/v1/admin/locks/acquire', {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify({ resourceType: 'article' }), // missing resourceId
    });
    expect(res.status).toBe(422);
  });

  it('returns 422 for empty body', async () => {
    const res = await mkApp().request('/api/v1/admin/locks/acquire', {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify({}),
    });
    expect(res.status).toBe(422);
  });
});

// ── POST /release ────────────────────────────────────────────

describe('POST /locks/release', () => {
  it('releases lock successfully', async () => {
    mockDb.delete.mockReturnValue(deleteChainWithReturn([{ id: LOCK_ID }]));

    const res = await mkApp().request('/api/v1/admin/locks/release', {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify({ resourceType: 'article', resourceId: ARTICLE_ID }),
    });
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.data.released).toBe(true);
  });

  it('returns success when lock already gone', async () => {
    mockDb.delete.mockReturnValue(deleteChainWithReturn([]));

    const res = await mkApp().request('/api/v1/admin/locks/release', {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify({ resourceType: 'article', resourceId: ARTICLE_ID }),
    });
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.data.released).toBe(true);
  });
});

// ── POST /heartbeat ──────────────────────────────────────────

describe('POST /locks/heartbeat', () => {
  it('extends lock heartbeat', async () => {
    mockDb.update.mockReturnValue(
      updateChain([{ id: LOCK_ID, heartbeatAt: new Date('2026-07-24T10:01:00.000Z') }]),
    );

    const res = await mkApp().request('/api/v1/admin/locks/heartbeat', {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify({ resourceType: 'article', resourceId: ARTICLE_ID }),
    });
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.data.heartbeatAt).toBeDefined();
    expect(body.data.heartbeatAt).toContain('2026-07-24T10:01:00');
  });

  it('returns 409 when lock lost or taken over', async () => {
    mockDb.update.mockReturnValue(updateChain([]));

    const res = await mkApp().request('/api/v1/admin/locks/heartbeat', {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify({ resourceType: 'article', resourceId: ARTICLE_ID }),
    });
    expect(res.status).toBe(409);
    const body = await res.json();
    expect(body.code).toBe('LOCK_LOST');
  });
});

// ── POST /takeover ───────────────────────────────────────────

describe('POST /locks/takeover', () => {
  it('takes over lock successfully', async () => {
    mockDb.delete.mockReturnValue(deleteChainWithReturn([{ id: LOCK_ID }]));
    mockDb.insert.mockReturnValue(insertChainDirect([{ id: LOCK_ID }]));
    const emailChain = {
      from: vi.fn().mockReturnThis(),
      where: vi.fn().mockReturnThis(),
      limit: vi.fn().mockReturnThis(),
      then: (fn: any) => Promise.resolve([{ email: 'admin@test.com' }]).then(fn),
    };
    mockDb.select.mockReturnValue(emailChain);

    const res = await mkApp().request('/api/v1/admin/locks/takeover', {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify({ resourceType: 'article', resourceId: ARTICLE_ID }),
    });
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.data.acquired).toBe(true);
  });

  it('acquires lock even when no existing lock', async () => {
    mockDb.delete.mockReturnValue(deleteChainWithReturn([]));
    mockDb.insert.mockReturnValue(insertChainDirect([{ id: LOCK_ID }]));
    const emailChain = {
      from: vi.fn().mockReturnThis(),
      where: vi.fn().mockReturnThis(),
      limit: vi.fn().mockReturnThis(),
      then: (fn: any) => Promise.resolve([{ email: 'admin@test.com' }]).then(fn),
    };
    mockDb.select.mockReturnValue(emailChain);

    const res = await mkApp().request('/api/v1/admin/locks/takeover', {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify({ resourceType: 'article', resourceId: ARTICLE_ID }),
    });
    expect(res.status).toBe(200);
  });
});

// ── GET /events (SSE) ───────────────────────────────────────

describe('GET /locks/events (SSE)', () => {
  it('returns SSE stream with connected event', async () => {
    const res = await mkApp().request('/api/v1/admin/locks/events', {
      headers: authHeaders(),
    });
    expect(res.status).toBe(200);
    const text = await res.text();
    // SSE header tidak selalu tersedia di Hono test adapter untuk streaming response.
    // Yang penting adalah body mengandung format SSE yang benar.
    expect(text).toContain('event: connected');
    expect(text).toContain('data: {}');
  });

  it('returns 401 without auth', async () => {
    const res = await mkApp().request('/api/v1/admin/locks/events');
    expect(res.status).toBe(401);
  });
});

// ── Full lifecycle scenario ──────────────────────────────────

describe('Full lock lifecycle scenario', () => {
  /** Reset all mocks to default state (setelah clearAllMocks) */
  function resetDefaultMocks() {
    mockDb.select.mockReturnValue(makeChain([]));
    mockDb.insert.mockReturnValue(insertChainWithConflict([]));
    mockDb.update.mockReturnValue(updateChain([]));
    mockDb.delete.mockReturnValue(deleteChainWithReturn([]));
  }

  it('acquire → another user conflict → release → check unlocked', async () => {
    // ── Step 1: Admin acquires lock ──
    mockDb.insert.mockReturnValue(insertChainWithConflict([{ id: LOCK_ID }]));
    const emailChain1 = {
      from: vi.fn().mockReturnThis(),
      where: vi.fn().mockReturnThis(),
      limit: vi.fn().mockReturnThis(),
      then: (fn: any) => Promise.resolve([{ email: 'admin@test.com' }]).then(fn),
    };
    mockDb.select.mockReturnValue(emailChain1);

    const acquireRes = await mkApp().request('/api/v1/admin/locks/acquire', {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify({ resourceType: 'article', resourceId: ARTICLE_ID }),
    });
    expect(acquireRes.status).toBe(201);

    vi.clearAllMocks();
    resetDefaultMocks();

    // ── Step 2: Another user tries to acquire → 409 ──
    mockDb.insert.mockReturnValue(insertChainWithConflict([]));
    const holderChain = {
      from: vi.fn().mockReturnThis(),
      where: vi.fn().mockReturnThis(),
      limit: vi.fn().mockReturnThis(),
      innerJoin: vi.fn().mockReturnThis(),
      then: (fn: any) =>
        Promise.resolve([{ id: LOCK_ID, lockedBy: OTHER_USER_ID, lockedAt: new Date() }]).then(fn),
    };
    mockDb.select.mockReturnValue(holderChain);

    const otherApp = mkApp();

    const conflictRes = await otherApp.request('/api/v1/admin/locks/acquire', {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify({ resourceType: 'article', resourceId: ARTICLE_ID }),
    });
    expect(conflictRes.status).toBe(409);
    const conflictBody = await conflictRes.json();
    expect(conflictBody.code).toBe('RESOURCE_LOCKED');

    vi.clearAllMocks();
    resetDefaultMocks();

    // ── Step 3: Admin releases lock ──
    mockDb.delete.mockReturnValue(deleteChainWithReturn([{ id: LOCK_ID }]));

    const releaseRes = await mkApp().request('/api/v1/admin/locks/release', {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify({ resourceType: 'article', resourceId: ARTICLE_ID }),
    });
    expect(releaseRes.status).toBe(200);

    vi.clearAllMocks();
    resetDefaultMocks();

    // ── Step 4: Verify unlocked ──
    const checkRes = await mkApp().request(
      `/api/v1/admin/locks/check?type=article&id=${ARTICLE_ID}`,
      { headers: authHeaders() },
    );
    expect(checkRes.status).toBe(200);
    const checkBody = await checkRes.json();
    expect(checkBody.data.locked).toBe(false);
  });
});
