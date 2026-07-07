import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('hash-wasm', () => ({ argon2id: vi.fn() }));
vi.mock('hono/jwt', () => ({ sign: vi.fn(), verify: vi.fn() }));

import { argon2id } from 'hash-wasm';
import { sign, verify } from 'hono/jwt';

process.env.JWT_SECRET = 'test-secret';

beforeEach(() => {
  vi.clearAllMocks();
});

describe('hashPassword', () => {
  it('hashes password with argon2id', async () => {
    const mockHash = '$argon2id$v=19$m=19456,t=2,p=1$c29tZXNhbHQ$somehashvalue';
    vi.mocked(argon2id).mockResolvedValue(mockHash);

    const mod = await import('./auth.ts');
    const result = await mod.hashPassword('Str0ng!P1');

    expect(result).toBe(mockHash);
    expect(argon2id).toHaveBeenCalledWith(
      expect.objectContaining({ password: 'Str0ng!P1', outputType: 'encoded' }),
    );
    expect(argon2id).toHaveBeenCalledTimes(1);
  });
});

describe('verifyPassword', () => {
  it('returns true when argon2id produces matching hash', async () => {
    const validHash = '$argon2id$v=19$m=19456,t=2,p=1$c29tZXNhbHQ$matches';
    vi.mocked(argon2id).mockResolvedValue(validHash);

    const mod = await import('./auth.ts');
    const result = await mod.verifyPassword(validHash, 'Str0ng!P1');

    expect(result).toBe(true);
  });

  it('returns false when hash has fewer than 6 segments', async () => {
    const mod = await import('./auth.ts');
    const result = await mod.verifyPassword('$argon2id$v=19$m=19456', 'Str0ng!P1');

    expect(result).toBe(false);
  });

  it('returns false when argon2id throws', async () => {
    vi.mocked(argon2id).mockRejectedValue(new Error('crypto error'));

    const mod = await import('./auth.ts');
    const result = await mod.verifyPassword(
      '$argon2id$v=19$m=19456,t=2,p=1$c29tZXNhbHQ$hash',
      'Str0ng!P1',
    );

    expect(result).toBe(false);
  });
});

describe('signAccessToken', () => {
  it('signs JWT with correct payload shape', async () => {
    const mockToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.mock';
    vi.mocked(sign).mockResolvedValue(mockToken);

    const mod = await import('./auth.ts');
    const result = await mod.signAccessToken('user-123', 'customer');

    expect(result).toBe(mockToken);
    expect(sign).toHaveBeenCalledWith(
      expect.objectContaining({ sub: 'user-123', role: 'customer' }),
      'test-secret',
      'HS256',
    );
  });
});

describe('verifyAccessToken', () => {
  it('returns decoded payload when token is valid', async () => {
    const mockPayload = { sub: 'user-123', role: 'customer', exp: 9999999999 };
    vi.mocked(verify).mockResolvedValue(mockPayload);

    const mod = await import('./auth.ts');
    const result = await mod.verifyAccessToken('valid-token');

    expect(result).toEqual(mockPayload);
    expect(verify).toHaveBeenCalledWith('valid-token', 'test-secret', 'HS256');
  });

  it('rejects when token is invalid', async () => {
    vi.mocked(verify).mockRejectedValue(new Error('invalid token'));

    const mod = await import('./auth.ts');
    await expect(mod.verifyAccessToken('bad-token')).rejects.toThrow('invalid token');
  });
});

describe('generateRefreshToken', () => {
  it('returns a UUID-formatted string', async () => {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

    const mod = await import('./auth.ts');
    const token = mod.generateRefreshToken();

    expect(token).toMatch(uuidRegex);
  });
});

describe('hashToken', () => {
  it('returns 64-character hex string', async () => {
    const mod = await import('./auth.ts');
    const result = mod.hashToken('some-refresh-token');

    expect(result).toMatch(/^[0-9a-f]{64}$/);
  });
});

describe('getRefreshTokenExpiry', () => {
  it('returns a Date ~7 days from now', async () => {
    const mod = await import('./auth.ts');
    const result = mod.getRefreshTokenExpiry();
    const now = Date.now();
    const diff = result.getTime() - now;

    expect(result).toBeInstanceOf(Date);
    expect(diff).toBeGreaterThan(6.9 * 24 * 60 * 60 * 1000);
    expect(diff).toBeLessThan(7.1 * 24 * 60 * 60 * 1000);
  });
});
