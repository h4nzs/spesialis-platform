import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { sendSecurityAlert, sendExternalSecurityAlert } from './alert.ts';
import { SECURITY_RULES } from './rules.ts';
import { resetSecurityStore } from './store.ts';
import { resetSecurityRedis } from './test-utils.ts';

vi.mock('../email.ts', () => ({ sendSecurityAlertEmail: vi.fn().mockResolvedValue(undefined) }));

import { sendSecurityAlertEmail } from '../email.ts';

const mockedEmail = vi.mocked(sendSecurityAlertEmail);
const fetchMock = vi.fn().mockResolvedValue({ ok: true, text: async () => '' });

const rule = SECURITY_RULES.find((r) => r.eventType === 'AUTH_LOGIN_FAILED')!;
const alert = { rule, count: rule.threshold, ip: '185.1.1.1', path: '/api/auth/login' };

beforeEach(async () => {
  resetSecurityStore();
  await resetSecurityRedis();
  mockedEmail.mockClear();
  fetchMock.mockClear();
  process.env.SECURITY_ALERT_ENABLED = 'true';
  process.env.SECURITY_ALERT_EMAILS = 'ops@example.com';
  process.env.SECURITY_ALERT_DISCORD_WEBHOOK_URL = 'https://discord.test/webhook';
  process.env.SECURITY_ALERT_MAX_PER_MIN = '5';
  vi.stubGlobal('fetch', fetchMock);
});

afterEach(() => {
  vi.unstubAllGlobals();
  for (const key of [
    'SECURITY_ALERT_ENABLED',
    'SECURITY_ALERT_EMAILS',
    'SECURITY_ALERT_DISCORD_WEBHOOK_URL',
    'SECURITY_ALERT_MAX_PER_MIN',
  ]) {
    delete process.env[key];
  }
});

describe('sendSecurityAlert', () => {
  it('kirim ke email dan Discord', async () => {
    await sendSecurityAlert(alert);

    expect(mockedEmail).toHaveBeenCalledTimes(1);
    expect(mockedEmail).toHaveBeenCalledWith(
      'ops@example.com',
      expect.stringContaining('AUTH_LOGIN_FAILED'),
      expect.stringContaining('185.1.1.1'),
    );
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it('cooldown 60 detik: alert kedua ditahan', async () => {
    await sendSecurityAlert(alert);
    await sendSecurityAlert(alert);

    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(mockedEmail).toHaveBeenCalledTimes(1);
  });

  it('SECURITY_ALERT_ENABLED=false → tidak mengirim apa pun', async () => {
    process.env.SECURITY_ALERT_ENABLED = 'false';

    await sendSecurityAlert(alert);

    expect(fetchMock).not.toHaveBeenCalled();
    expect(mockedEmail).not.toHaveBeenCalled();
  });

  it('embed Discord memuat field IP dan count', async () => {
    await sendSecurityAlert(alert);

    const init = fetchMock.mock.calls[0]?.[1] as RequestInit | undefined;
    const body = JSON.parse(String(init?.body ?? '{}')) as {
      embeds: Array<{ fields: Array<{ name: string; value: string }> }>;
    };
    expect(body.embeds[0]?.fields).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ name: 'Source IP', value: '185.1.1.1' }),
        expect.objectContaining({ name: 'Count', value: `${rule.threshold}/${rule.threshold}` }),
      ]),
    );
  });
});

describe('sendExternalSecurityAlert', () => {
  it('kirim alert eksternal dengan cooldown per source+event', async () => {
    const input = {
      severity: 5,
      event: 'ahlipanggilan/bruteforce-login',
      message: '185.1.1.1 diblokir selama 4h',
      source: 'crowdsec',
      ip: '185.1.1.1',
    };

    await sendExternalSecurityAlert(input);
    await sendExternalSecurityAlert(input);

    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(mockedEmail).toHaveBeenCalledTimes(1);
    expect(mockedEmail).toHaveBeenCalledWith(
      'ops@example.com',
      expect.stringContaining('crowdsec'),
      expect.stringContaining('diblokir'),
    );
  });

  it('event berbeda dalam source sama → alert terkirim keduanya', async () => {
    await sendExternalSecurityAlert({
      severity: 3,
      event: 'fim-modified',
      message: '/etc/nginx/nginx.conf berubah',
      source: 'fim',
    });
    await sendExternalSecurityAlert({
      severity: 2,
      event: 'cve-medium',
      message: 'nginx 1.26.0 terkena CVE-2026-XXXX',
      source: 'trivy',
    });

    expect(fetchMock).toHaveBeenCalledTimes(2);
  });
});
