import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { Context } from 'hono';

vi.mock('../lib/auth.ts', () => ({ verifyAccessToken: vi.fn() }));
vi.mock('../lib/response.ts', () => ({
  unauthorized: vi.fn().mockReturnValue('unauthorized'),
  forbidden: vi.fn().mockReturnValue('forbidden'),
}));
vi.mock('hono/cookie', () => ({ getCookie: vi.fn() }));

import { verifyAccessToken } from '../lib/auth.ts';
import { unauthorized, forbidden } from '../lib/response.ts';
import { getCookie } from 'hono/cookie';

function mockC(overrides: Record<string, any> = {}): Context {
  const state: Record<string, any> = {};
  return {
    req: { header: vi.fn(), ...overrides.req },
    get: vi.fn((k: string) => state[k]),
    set: vi.fn((k: string, v: any) => {
      state[k] = v;
    }),
    status: vi.fn(),
    json: vi.fn(),
    ...overrides,
  } as any;
}

beforeEach(() => {
  vi.clearAllMocks();
});

describe('authMiddleware', () => {
  it('passes with valid Bearer token', async () => {
    const c = mockC({ req: { header: vi.fn(() => 'Bearer valid-token') } });
    vi.mocked(verifyAccessToken).mockResolvedValue({
      sub: 'uid',
      role: 'customer',
      exp: 9999999999,
    } as any);

    const next = vi.fn();
    const mod = await import('./auth.ts');
    await mod.authMiddleware(c, next);

    expect(c.set).toHaveBeenCalledWith('userId', 'uid');
    expect(c.set).toHaveBeenCalledWith('userRole', 'customer');
    expect(next).toHaveBeenCalled();
  });

  it('rejects when no token present', async () => {
    const c = mockC({ req: { header: vi.fn(() => undefined) } });
    vi.mocked(getCookie).mockReturnValue(undefined as any);

    const next = vi.fn();
    const mod = await import('./auth.ts');
    await mod.authMiddleware(c, next);

    expect(unauthorized).toHaveBeenCalledWith(c, 'Missing authentication token');
    expect(next).not.toHaveBeenCalled();
  });

  it('rejects with invalid token', async () => {
    const c = mockC({ req: { header: vi.fn(() => 'Bearer invalid') } });
    vi.mocked(verifyAccessToken).mockRejectedValue(new Error('jwt expired'));

    const next = vi.fn();
    const mod = await import('./auth.ts');
    await mod.authMiddleware(c, next);

    expect(unauthorized).toHaveBeenCalledWith(c, 'Invalid or expired token');
  });

  it('reads token from cookie when no Authorization header', async () => {
    const c = mockC({ req: { header: vi.fn(() => undefined) } });
    vi.mocked(getCookie).mockReturnValue('cookie-token' as any);
    vi.mocked(verifyAccessToken).mockResolvedValue({
      sub: 'uid',
      role: 'customer',
      exp: 9999999999,
    } as any);

    const next = vi.fn();
    const mod = await import('./auth.ts');
    await mod.authMiddleware(c, next);

    expect(verifyAccessToken).toHaveBeenCalledWith('cookie-token');
    expect(next).toHaveBeenCalled();
  });
});

describe('requireRole', () => {
  it('allows user with matching role', async () => {
    const c = mockC();
    vi.mocked(c.get).mockImplementation((k: string) => (k === 'userRole' ? 'admin' : undefined));

    const next = vi.fn();
    const mod = await import('./auth.ts');
    const middleware = mod.requireRole('admin', 'super_admin');
    await middleware(c, next);

    expect(next).toHaveBeenCalled();
  });

  it('blocks user with non-matching role', async () => {
    const c = mockC();
    vi.mocked(c.get).mockImplementation((k: string) => (k === 'userRole' ? 'customer' : undefined));

    const next = vi.fn();
    const mod = await import('./auth.ts');
    const middleware = mod.requireRole('admin');
    await middleware(c, next);

    expect(forbidden).toHaveBeenCalled();
    expect(next).not.toHaveBeenCalled();
  });

  it('blocks when no role set', async () => {
    const c = mockC();
    vi.mocked(c.get).mockReturnValue(undefined);

    const next = vi.fn();
    const mod = await import('./auth.ts');
    const middleware = mod.requireRole('admin');
    await middleware(c, next);

    expect(forbidden).toHaveBeenCalled();
  });
});
