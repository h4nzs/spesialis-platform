import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { Context } from 'hono';
import { emitSecurityEvent } from './security-event.ts';
import { resetSecurityStore } from './store.ts';
import { resetSecurityRedis } from './test-utils.ts';

vi.mock('../db.ts', () => ({
  db: { insert: vi.fn().mockReturnValue({ values: vi.fn().mockResolvedValue(undefined) }) },
  securityEvents: {},
}));

vi.mock('./alert.ts', () => ({ sendSecurityAlert: vi.fn().mockResolvedValue(undefined) }));

import { sendSecurityAlert } from './alert.ts';
import { SECURITY_RULES } from './rules.ts';

const mockedAlert = vi.mocked(sendSecurityAlert);

function makeCtx(ip: string): Context {
  return {
    req: {
      header: (name: string) => (name === 'x-forwarded-for' ? ip : undefined),
      path: '/api/auth/login',
    },
  } as unknown as Context;
}

const rule = SECURITY_RULES.find((r) => r.eventType === 'AUTH_LOGIN_FAILED')!;

beforeEach(async () => {
  vi.clearAllMocks();
  resetSecurityStore();
  await resetSecurityRedis();
});

describe('emitSecurityEvent', () => {
  it('merekam event lalu mendeteksi saat threshold tercapai', async () => {
    for (let i = 1; i <= rule.threshold; i++) {
      await emitSecurityEvent({ eventType: 'AUTH_LOGIN_FAILED', ctx: makeCtx('10.0.0.1') });
    }
    expect(mockedAlert).toHaveBeenCalledTimes(1);
    expect(mockedAlert).toHaveBeenCalledWith(
      expect.objectContaining({ count: rule.threshold, ip: '10.0.0.1' }),
    );
  });

  it('tidak melempar error walau insert DB gagal', async () => {
    const { db } = await import('../db.ts');
    const insertMock = db.insert as ReturnType<typeof vi.fn>;
    insertMock.mockReturnValueOnce({
      values: vi.fn().mockRejectedValue(new Error('database down')),
    });

    await expect(
      emitSecurityEvent({ eventType: 'AUTH_LOGIN_FAILED', ctx: makeCtx('10.0.0.2') }),
    ).resolves.toBeUndefined();
  });
});
