import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { Context } from 'hono';
import { detectAndAlert } from './detector.ts';
import { SECURITY_RULES } from './rules.ts';
import { resetSecurityStore } from './store.ts';
import { resetSecurityRedis } from './test-utils.ts';

vi.mock('./alert.ts', () => ({ sendSecurityAlert: vi.fn() }));

import { sendSecurityAlert } from './alert.ts';

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
  resetSecurityStore();
  await resetSecurityRedis();
  mockedAlert.mockClear();
});

describe('detectAndAlert', () => {
  it('alert tepat satu kali saat threshold tercapai', async () => {
    for (let i = 1; i <= rule.threshold; i++) {
      await detectAndAlert({ rule, ctx: makeCtx('185.1.1.1') });
    }
    expect(mockedAlert).toHaveBeenCalledTimes(1);
    expect(mockedAlert).toHaveBeenCalledWith(
      expect.objectContaining({ count: rule.threshold, ip: '185.1.1.1' }),
    );
  });

  it('tidak alert sebelum threshold', async () => {
    for (let i = 1; i < rule.threshold; i++) {
      await detectAndAlert({ rule, ctx: makeCtx('185.1.1.2') });
    }
    expect(mockedAlert).not.toHaveBeenCalled();
  });

  it('counter terpisah per IP', async () => {
    for (let i = 1; i <= rule.threshold; i++) {
      await detectAndAlert({ rule, ctx: makeCtx('185.1.1.1') });
    }
    await detectAndAlert({ rule, ctx: makeCtx('185.1.1.2') });
    expect(mockedAlert).toHaveBeenCalledTimes(1);
  });
});
