import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Hono } from 'hono';
import { authRouter } from './auth.ts';
import { errorHandler } from '../middleware/error-handler.ts';
import { setTestEnv, makeChain, updateChain } from '../test-utils.ts';

const { mockDb, mockAuth, mockEmail, mockAudit, em } = vi.hoisted(() => {
  const baseThen = (r: unknown) => ({
    then: (onfulfilled: (v: unknown) => unknown) => Promise.resolve(r).then(onfulfilled),
  });
  const sc = (r: unknown) => ({
    from: vi.fn().mockReturnThis(),
    where: vi.fn().mockReturnThis(),
    limit: vi.fn().mockReturnThis(),
    offset: vi.fn().mockReturnThis(),
    orderBy: vi.fn().mockReturnThis(),
    innerJoin: vi.fn().mockReturnThis(),
    leftJoin: vi.fn().mockReturnThis(),
    groupBy: vi.fn().mockReturnThis(),
    having: vi.fn().mockReturnThis(),
    ...baseThen(r),
  });
  const uc = { set: vi.fn().mockReturnValue({ where: vi.fn().mockResolvedValue(undefined) }) };
  const db = {
    select: vi.fn().mockReturnValue(sc([])),
    insert: vi.fn(),
    update: vi.fn().mockReturnValue(uc),
    delete: vi.fn().mockReturnValue({ where: vi.fn().mockResolvedValue(undefined) }),
    execute: vi.fn().mockResolvedValue([]),
    transaction: vi.fn((fn: (tx: unknown) => unknown) => fn(db)),
  };
  const mA = {
    hashPassword: vi.fn().mockResolvedValue('hashed-password'),
    verifyPassword: vi.fn().mockResolvedValue(true),
    signAccessToken: vi.fn().mockResolvedValue('mock-access-token'),
    verifyAccessToken: vi.fn().mockResolvedValue({ sub: 'uid', role: 'customer', exp: 9999999999 }),
    generateRefreshToken: vi.fn().mockReturnValue('mock-refresh-token'),
    hashToken: vi.fn().mockReturnValue('mock-hash-token'),
    getRefreshTokenExpiry: vi.fn().mockReturnValue(new Date(Date.now() + 7 * 86400000)),
  };
  const mE = { sendPasswordResetEmail: vi.fn().mockResolvedValue(undefined) };
  const ax = { createAuditLog: vi.fn().mockResolvedValue(undefined) };
  const exps = (globalThis as any).__TABLE_EXPORTS;
  return { mockDb: db, mockAuth: mA, mockEmail: mE, mockAudit: ax, em: exps };
});

vi.mock('../lib/db.ts', () => ({ db: mockDb, ...em }));
vi.mock('../lib/auth.ts', () => ({ ...mockAuth }));
vi.mock('../lib/email.ts', () => ({ ...mockEmail }));
vi.mock('../lib/audit.ts', () => ({ ...mockAudit }));
vi.mock('../middleware/rate-limiter.ts', () => ({
  rateLimit: () => async (_c: unknown, next: () => unknown) => next(),
}));

function auth(h: string) {
  return { Authorization: `Bearer ${h}`, 'Content-Type': 'application/json' };
}

function mkApp() {
  const app = new Hono();
  app.onError(errorHandler);
  app.route('/api/v1/auth', authRouter);
  return app;
}

beforeEach(() => {
  setTestEnv();
  vi.clearAllMocks();
  // clearAllMocks() only resets call tracking, NOT mockReturnValue/mockResolvedValue.
  // Explicitly reset implementations that other tests may have overridden:
  mockDb.select.mockReturnValue(makeChain([]));
  mockAuth.verifyPassword.mockResolvedValue(true);
  mockAuth.hashPassword.mockResolvedValue('hashed-password');
  mockAuth.signAccessToken.mockResolvedValue('mock-access-token');
  mockDb.transaction.mockImplementation((fn: (tx: unknown) => unknown) => fn(mockDb));
});

describe('POST /register', () => {
  it('201 valid', async () => {
    mockDb.select.mockReturnValue(makeChain([]));
    mockDb.insert.mockReturnValue({
      values: vi
        .fn()
        .mockReturnValue({
          returning: vi.fn().mockResolvedValue([{ id: 'uid', email: 'a@b.com', role: 'customer' }]),
        }),
    });
    mockDb.insert.mockReturnValueOnce({
      values: vi.fn().mockReturnValue({ returning: vi.fn().mockResolvedValue([{ id: 'pid' }]) }),
    });
    const res = await mkApp().request('/api/v1/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'a@b.com',
        phone: '08123456789',
        password: 'Str0ng!P1',
        fullName: 'A',
      }),
    });
    expect(res.status).toBe(201);
  });
  it('409 duplicate', async () => {
    mockDb.select.mockReturnValue(makeChain([{ id: 'x' }]));
    const res = await mkApp().request('/api/v1/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'a@b.com',
        phone: '08123456789',
        password: 'Str0ng!P1',
        fullName: 'A',
      }),
    });
    expect(res.status).toBe(409);
  });
  it('422 missing', async () => {
    const res = await mkApp().request('/api/v1/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({}),
    });
    expect(res.status).toBe(422);
  });
  it('422 weak password', async () => {
    const res = await mkApp().request('/api/v1/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'a@b.com', phone: '08123456789', password: '123' }),
    });
    expect(res.status).toBe(422);
  });
});

describe('POST /login', () => {
  it('200 valid', async () => {
    mockDb.select.mockReturnValue(
      makeChain([
        { id: 'uid', email: 'a@b.com', passwordHash: 'h', role: 'customer', status: 'active' },
      ]),
    );
    const res = await mkApp().request('/api/v1/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'a@b.com', password: 'Str0ng!P1' }),
    });
    expect(res.status).toBe(200);
  });
  it('401 wrong password', async () => {
    mockAuth.verifyPassword.mockResolvedValue(false);
    mockDb.select.mockReturnValue(
      makeChain([
        { id: 'uid', email: 'a@b.com', passwordHash: 'h', role: 'customer', status: 'active' },
      ]),
    );
    const res = await mkApp().request('/api/v1/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'a@b.com', password: 'Bad' }),
    });
    expect(res.status).toBe(401);
  });
  it('401 unknown email', async () => {
    mockDb.select.mockReturnValue(makeChain([]));
    const res = await mkApp().request('/api/v1/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'nope@b.com', password: 'S' }),
    });
    expect(res.status).toBe(401);
  });
  it('403 inactive', async () => {
    mockDb.select.mockReturnValue(
      makeChain([
        { id: 'uid', email: 'a@b.com', passwordHash: 'h', role: 'customer', status: 'blocked' },
      ]),
    );
    const res = await mkApp().request('/api/v1/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'a@b.com', password: 'S' }),
    });
    expect(res.status).toBe(403);
  });
  it('422 missing', async () => {
    const res = await mkApp().request('/api/v1/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({}),
    });
    expect(res.status).toBe(422);
  });
});

describe('POST /refresh', () => {
  it('200 valid', async () => {
    mockDb.select.mockReturnValueOnce(
      makeChain([
        { id: 'rt1', userId: 'uid', revoked: false, expiresAt: new Date(Date.now() + 86400000) },
      ]),
    );
    mockDb.select.mockReturnValueOnce(makeChain([{ id: 'uid', role: 'customer' }]));
    const res = await mkApp().request('/api/v1/auth/refresh', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken: 'valid-refresh-token' }),
    });
    expect(res.status).toBe(200);
  });
  it('401 expired', async () => {
    mockDb.select.mockReturnValue(makeChain([]));
    const res = await mkApp().request('/api/v1/auth/refresh', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken: 'bad' }),
    });
    expect(res.status).toBe(401);
  });
  it('401 missing', async () => {
    const res = await mkApp().request('/api/v1/auth/refresh', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({}),
    });
    expect(res.status).toBe(401);
  });
});

describe('POST /logout', () => {
  it('200 authed', async () => {
    const res = await mkApp().request('/api/v1/auth/logout', {
      method: 'POST',
      headers: auth('x'),
    });
    expect(res.status).toBe(200);
  });
  it('401 unauth', async () => {
    const res = await mkApp().request('/api/v1/auth/logout', { method: 'POST' });
    expect(res.status).toBe(401);
  });
});

describe('GET /me', () => {
  it('200 found', async () => {
    mockDb.select.mockReturnValue(
      makeChain([
        { id: 'uid', email: 'a@b.com', phone: '081', role: 'customer', status: 'active' },
      ]),
    );
    const res = await mkApp().request('/api/v1/auth/me', { headers: auth('x') });
    expect(res.status).toBe(200);
  });
  it('404 not found', async () => {
    mockDb.select.mockReturnValue(makeChain([]));
    const res = await mkApp().request('/api/v1/auth/me', { headers: auth('x') });
    expect(res.status).toBe(404);
  });
});

describe('PATCH /profile', () => {
  const profileResult = {
    id: 'uid',
    email: 'a@b.com',
    phone: '081',
    role: 'customer',
    status: 'active',
  };
  it('200 updated', async () => {
    mockDb.select.mockReturnValueOnce(makeChain([{ id: 'uid', email: 'a@b.com' }]));
    mockDb.update.mockReturnValueOnce({
      set: vi
        .fn()
        .mockReturnValue({
          where: vi.fn().mockReturnValue({ returning: vi.fn().mockResolvedValue([profileResult]) }),
        }),
    });
    const res = await mkApp().request('/api/v1/auth/profile', {
      method: 'PATCH',
      headers: auth('x'),
      body: JSON.stringify({ email: 'a@b.com', phone: '08123456789' }),
    });
    expect(res.status).toBe(200);
  });
  it('200 no changes', async () => {
    mockDb.select.mockReturnValueOnce(makeChain([{ id: 'uid', email: 'a@b.com' }]));
    const res = await mkApp().request('/api/v1/auth/profile', {
      method: 'PATCH',
      headers: auth('x'),
      body: JSON.stringify({}),
    });
    expect(res.status).toBe(200);
  });
  it('409 duplicate email', async () => {
    mockDb.select.mockReturnValueOnce(makeChain([{ id: 'uid', email: 'old@b.com' }]));
    mockDb.select.mockReturnValueOnce(makeChain([{ id: 'other' }]));
    const res = await mkApp().request('/api/v1/auth/profile', {
      method: 'PATCH',
      headers: auth('x'),
      body: JSON.stringify({ email: 'dup@b.com' }),
    });
    expect(res.status).toBe(409);
  });
});

describe('PATCH /change-password', () => {
  it('200 changed', async () => {
    mockDb.select.mockReturnValue(makeChain([{ id: 'uid', passwordHash: 'h' }]));
    const res = await mkApp().request('/api/v1/auth/change-password', {
      method: 'PATCH',
      headers: auth('x'),
      body: JSON.stringify({ currentPassword: 'Old!', newPassword: 'NewStr0ng!1' }),
    });
    expect(res.status).toBe(200);
  });
  it('403 wrong current', async () => {
    mockAuth.verifyPassword.mockResolvedValue(false);
    mockDb.select.mockReturnValue(makeChain([{ id: 'uid', passwordHash: 'h' }]));
    const res = await mkApp().request('/api/v1/auth/change-password', {
      method: 'PATCH',
      headers: auth('x'),
      body: JSON.stringify({ currentPassword: 'Bad', newPassword: 'NewStr0ng!1' }),
    });
    expect(res.status).toBe(403);
  });
});

describe('DELETE /account', () => {
  it('200 deleted', async () => {
    mockDb.select.mockReturnValue(makeChain([{ id: 'uid', passwordHash: 'h' }]));
    const res = await mkApp().request('/api/v1/auth/account', {
      method: 'DELETE',
      headers: auth('x'),
      body: JSON.stringify({ password: 'Str0ng!P1' }),
    });
    expect(res.status).toBe(200);
  });
  it('403 wrong password', async () => {
    mockAuth.verifyPassword.mockResolvedValue(false);
    mockDb.select.mockReturnValue(makeChain([{ id: 'uid', passwordHash: 'h' }]));
    const res = await mkApp().request('/api/v1/auth/account', {
      method: 'DELETE',
      headers: auth('x'),
      body: JSON.stringify({ password: 'Bad' }),
    });
    expect(res.status).toBe(403);
  });
  it('422 missing password', async () => {
    mockDb.select.mockReturnValue(makeChain([{ id: 'uid', passwordHash: 'h' }]));
    const res = await mkApp().request('/api/v1/auth/account', {
      method: 'DELETE',
      headers: auth('x'),
      body: JSON.stringify({}),
    });
    expect(res.status).toBe(422);
  });
});

describe('POST /forgot-password', () => {
  it('200 any email', async () => {
    const res = await mkApp().request('/api/v1/auth/forgot-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'a@b.com' }),
    });
    expect(res.status).toBe(200);
  });
  it('200 user exists', async () => {
    mockDb.select.mockReturnValue(makeChain([{ id: 'uid', email: 'exists@b.com' }]));
    mockDb.insert.mockReturnValue({
      values: vi.fn().mockReturnValue({ returning: vi.fn().mockResolvedValue([{ id: 'pr1' }]) }),
    });
    const res = await mkApp().request('/api/v1/auth/forgot-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'exists@b.com' }),
    });
    expect(res.status).toBe(200);
  });
});

describe('POST /reset-password', () => {
  it('200 valid', async () => {
    mockDb.select.mockReturnValue(
      makeChain([
        { id: 'pr1', userId: 'uid', used: false, expiresAt: new Date(Date.now() + 86400000) },
      ]),
    );
    const res = await mkApp().request('/api/v1/auth/reset-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token: 'valid', password: 'NewStr0ng!1' }),
    });
    expect(res.status).toBe(200);
  });
  it('400 expired', async () => {
    mockDb.select.mockReturnValue(makeChain([]));
    const res = await mkApp().request('/api/v1/auth/reset-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token: 'bad', password: 'NewStr0ng!1' }),
    });
    expect(res.status).toBe(400);
  });
});
