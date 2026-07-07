import { describe, it, expect, vi, beforeEach } from 'vitest';

const mockRedisInstance = { on: vi.fn().mockReturnThis() };

vi.mock('ioredis', () => ({
  Redis: vi.fn(function () {
    return mockRedisInstance;
  }) as any,
}));
vi.mock('node:dns', () => ({ promises: { lookup: vi.fn() } }));

import { Redis } from 'ioredis';
import { promises as dns } from 'node:dns';

beforeEach(() => {
  vi.clearAllMocks();
  vi.resetModules();
  delete process.env.REDIS_HOST;
  delete process.env.REDIS_PORT;
});

describe('getRedis', () => {
  it('creates Redis client on first call with localhost', async () => {
    process.env.REDIS_HOST = 'localhost';

    const mod = await import('./redis.ts');
    const client = mod.getRedis();

    expect(Redis).toHaveBeenCalledWith(
      expect.objectContaining({ host: 'localhost', lazyConnect: true }),
    );
    expect(mockRedisInstance.on).toHaveBeenCalledWith('error', expect.any(Function));
    expect(client).toBe(mockRedisInstance);
  });

  it('returns same instance on second call (singleton)', async () => {
    process.env.REDIS_HOST = 'localhost';

    const mod = await import('./redis.ts');
    const client1 = mod.getRedis();
    const client2 = mod.getRedis();

    expect(Redis).toHaveBeenCalledTimes(1);
    expect(client1).toBe(client2);
  });

  it('returns null and logs warning when Redis constructor throws', async () => {
    process.env.REDIS_HOST = 'localhost';
    vi.mocked(Redis).mockImplementation(() => {
      throw new Error('connection refused');
    });
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

    const mod = await import('./redis.ts');
    const client = mod.getRedis();

    expect(client).toBeNull();
    expect(warnSpy).toHaveBeenCalledWith('[redis] tidak tersedia — fallback ke in-memory store');

    warnSpy.mockRestore();
  });

  it('returns null for non-local host before DNS resolves', async () => {
    process.env.REDIS_HOST = 'redis.example.com';
    vi.mocked(dns.lookup).mockResolvedValue(undefined as any);

    const mod = await import('./redis.ts');
    const client = mod.getRedis();

    expect(client).toBeNull();
    expect(dns.lookup).toHaveBeenCalledWith('redis.example.com');
  });

  it('logs warning when DNS lookup fails', async () => {
    process.env.REDIS_HOST = 'redis.example.com';
    vi.mocked(dns.lookup).mockRejectedValue(new Error('ENOTFOUND'));
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

    const mod = await import('./redis.ts');
    mod.getRedis();

    await vi.waitFor(() => {
      expect(warnSpy).toHaveBeenCalledWith(
        '[redis] host tidak dijangkau — fallback ke in-memory store',
      );
    });

    warnSpy.mockRestore();
  });

  it('returns null when already connecting', async () => {
    process.env.REDIS_HOST = 'redis.example.com';
    vi.mocked(dns.lookup).mockReturnValue(new Promise(() => {}));

    const mod = await import('./redis.ts');
    const first = mod.getRedis();
    const second = mod.getRedis();

    expect(first).toBeNull();
    expect(second).toBeNull();
    expect(dns.lookup).toHaveBeenCalledTimes(1);
  });

  it('uses custom REDIS_PORT when set', async () => {
    process.env.REDIS_HOST = 'localhost';
    process.env.REDIS_PORT = '6380';

    const mod = await import('./redis.ts');
    mod.getRedis();

    expect(Redis).toHaveBeenCalledWith(expect.objectContaining({ port: 6380 }));
  });

  it('defaults to port 6379 when REDIS_PORT is not set', async () => {
    process.env.REDIS_HOST = 'localhost';

    const mod = await import('./redis.ts');
    mod.getRedis();

    expect(Redis).toHaveBeenCalledWith(expect.objectContaining({ port: 6379 }));
  });
});
