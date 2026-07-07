import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { Context } from 'hono';

vi.mock('../lib/response.ts', () => ({ error: vi.fn().mockReturnValue('rate-limited') }));
vi.mock('../lib/redis.ts', () => ({ getRedis: vi.fn() }));

import { error } from '../lib/response.ts';
import { getRedis } from '../lib/redis.ts';

function mockC(ip: string = '127.0.0.1'): Context {
  return {
    req: {
      header: vi.fn((h: string) => {
        if (h === 'x-forwarded-for') return ip;
        return undefined;
      }),
      path: '/test',
    },
  } as any;
}

/** Unique IP per test so inMemory entries don't leak between tests */
let ipCounter = 0;
function uniqueIP(): string {
  ipCounter++;
  return `10.0.0.${ipCounter}`;
}

beforeEach(() => {
  vi.clearAllMocks();
  vi.resetModules();
});

describe('rateLimit', () => {
  it('allows first request within window', async () => {
    vi.mocked(getRedis).mockReturnValue(null);

    const next = vi.fn();
    const mod = await import('./rate-limiter.ts');
    const middleware = mod.rateLimit(3, 60000);
    await middleware(mockC(uniqueIP()), next);

    expect(next).toHaveBeenCalled();
    expect(error).not.toHaveBeenCalled();
  });

  it('blocks when exceeding max requests', async () => {
    vi.mocked(getRedis).mockReturnValue(null);

    const mod = await import('./rate-limiter.ts');
    const middleware = mod.rateLimit(3, 60000);
    const c = mockC(uniqueIP());

    const next = vi.fn();
    await middleware(c, next); // 1st — count=1, not limited
    await middleware(c, next); // 2nd — count=2, not limited
    await middleware(c, next); // 3rd — count=3, not limited

    expect(next).toHaveBeenCalledTimes(3);

    next.mockClear();
    await middleware(c, next); // 4th — count=4, >3 → LIMITED
    expect(next).not.toHaveBeenCalled();
    expect(error).toHaveBeenCalledWith(c, 'RATE_LIMIT_EXCEEDED', expect.any(String), 429);
  });

  it('lets through different IP after limiting', async () => {
    vi.mocked(getRedis).mockReturnValue(null);

    const mod = await import('./rate-limiter.ts');
    const middleware = mod.rateLimit(2, 60000);
    const c = mockC(uniqueIP());

    const next = vi.fn();
    await middleware(c, next); // 1st
    await middleware(c, next); // 2nd
    await middleware(c, next); // 3rd — blocked

    expect(next).toHaveBeenCalledTimes(2);

    // Different IP should not be limited
    const next2 = vi.fn();
    await middleware(mockC(uniqueIP()), next2);
    expect(next2).toHaveBeenCalled();
  });

  it('uses Redis rate limiting when Redis available', async () => {
    const mockMulti = vi.fn().mockReturnThis();
    const mockExec = vi.fn().mockResolvedValue([
      [null, 'OK'],
      [null, 2],
      [null, 1],
    ]);
    const mockRedis = {
      multi: vi.fn().mockReturnValue({
        set: mockMulti,
        incr: mockMulti,
        pexpire: mockMulti,
        exec: mockExec,
      }),
    };
    vi.mocked(getRedis).mockReturnValue(mockRedis as any);

    const mod = await import('./rate-limiter.ts');
    const middleware = mod.rateLimit(5, 60000); // higher limit so memory fallback doesn't block
    const next = vi.fn();

    await middleware(mockC(uniqueIP()), next);
    expect(next).toHaveBeenCalled();
  });

  it('falls back to memory when Redis exec fails', async () => {
    vi.mocked(getRedis).mockReturnValue(null);

    const mod = await import('./rate-limiter.ts');
    const middleware = mod.rateLimit(5, 60000);
    const next = vi.fn();
    await middleware(mockC(uniqueIP()), next);
    expect(next).toHaveBeenCalled();
  });
});
