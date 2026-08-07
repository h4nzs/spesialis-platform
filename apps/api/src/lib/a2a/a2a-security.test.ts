import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { User } from '@a2a-js/sdk/server';

const mockVerify = vi.fn();
vi.mock('../auth.ts', () => ({ verifyAccessToken: mockVerify }));

beforeEach(() => {
  mockVerify.mockReset();
});

describe('buildA2AUser', () => {
  it('returns undefined without an Authorization header', async () => {
    const { buildA2AUser } = await import('./a2a-security.ts');
    expect(await buildA2AUser({})).toBeUndefined();
    expect(mockVerify).not.toHaveBeenCalled();
  });

  it('returns undefined for a non-Bearer header', async () => {
    const { buildA2AUser } = await import('./a2a-security.ts');
    expect(await buildA2AUser({ authorization: 'Basic abc' })).toBeUndefined();
  });

  it('builds an authenticated user from a valid Bearer token', async () => {
    mockVerify.mockResolvedValue({ sub: 'user-123', role: 'customer', exp: 9999999999 });
    const { buildA2AUser } = await import('./a2a-security.ts');
    const user = (await buildA2AUser({ authorization: 'Bearer tok-1' })) as User | undefined;
    expect(user?.isAuthenticated).toBe(true);
    expect(user?.userName).toBe('user-123');
    expect(mockVerify).toHaveBeenCalledWith('tok-1');
  });

  it('falls back to anonymous when the token is invalid', async () => {
    mockVerify.mockRejectedValue(new Error('expired'));
    const { buildA2AUser } = await import('./a2a-security.ts');
    expect(await buildA2AUser({ Authorization: 'Bearer bad' })).toBeUndefined();
  });
});
