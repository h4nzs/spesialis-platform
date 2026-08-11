import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { Hono } from 'hono';
import { securityWebhookRouter } from './security-webhook.ts';

vi.mock('../lib/security/alert.ts', () => ({
  sendExternalSecurityAlert: vi.fn().mockResolvedValue(undefined),
}));

import { sendExternalSecurityAlert } from '../lib/security/alert.ts';

const mockedSend = vi.mocked(sendExternalSecurityAlert);

const app = new Hono();
app.route('/', securityWebhookRouter);

beforeEach(() => {
  mockedSend.mockClear();
  process.env.SECURITY_WEBHOOK_SECRET = 'test-secret';
});

afterEach(() => {
  delete process.env.SECURITY_WEBHOOK_SECRET;
});

describe('security webhook', () => {
  it('tanpa SECURITY_WEBHOOK_SECRET → 503', async () => {
    delete process.env.SECURITY_WEBHOOK_SECRET;
    const res = await app.request('/', {
      method: 'POST',
      headers: { 'x-security-key': 'test-secret', 'content-type': 'application/json' },
      body: JSON.stringify({ event: 'X', message: 'Y', source: 'trivy' }),
    });
    expect(res.status).toBe(503);
  });

  it('X-Security-Key salah → 401', async () => {
    const res = await app.request('/', {
      method: 'POST',
      headers: { 'x-security-key': 'salah', 'content-type': 'application/json' },
      body: JSON.stringify({ event: 'X', message: 'Y', source: 'trivy' }),
    });
    expect(res.status).toBe(401);
    expect(mockedSend).not.toHaveBeenCalled();
  });

  it('payload valid → 200, queued, severity crowdsec dari mapping scenario', async () => {
    const res = await app.request('/', {
      method: 'POST',
      headers: { 'x-security-key': 'test-secret', 'content-type': 'application/json' },
      body: JSON.stringify({
        severity: 'critical',
        event: 'ahlipanggilan/bruteforce-login',
        message: '185.1.1.1 diblokir selama 4h',
        source: 'crowdsec',
        ip: '185.1.1.1',
      }),
    });

    expect(res.status).toBe(200);
    const body = (await res.json()) as { success: boolean; data: { queued: boolean } };
    expect(body.success).toBe(true);
    expect(body.data.queued).toBe(true);
    expect(mockedSend).toHaveBeenCalledWith(
      expect.objectContaining({
        severity: 3,
        event: 'ahlipanggilan/bruteforce-login',
        source: 'crowdsec',
        ip: '185.1.1.1',
      }),
    );
  });

  it('source bukan crowdsec → severity diambil dari payload', async () => {
    const res = await app.request('/', {
      method: 'POST',
      headers: { 'x-security-key': 'test-secret', 'content-type': 'application/json' },
      body: JSON.stringify({
        severity: 'high',
        event: 'cve-ditemukan',
        message: 'nginx 1.26.0 terkena CVE-2026-XXXX',
        source: 'trivy',
      }),
    });

    expect(res.status).toBe(200);
    expect(mockedSend).toHaveBeenCalledWith(
      expect.objectContaining({ severity: 4, event: 'cve-ditemukan', source: 'trivy' }),
    );
  });

  it('body tanpa event/message/source → 422', async () => {
    const res = await app.request('/', {
      method: 'POST',
      headers: { 'x-security-key': 'test-secret', 'content-type': 'application/json' },
      body: JSON.stringify({ event: '', message: 'Y', source: 'trivy' }),
    });
    expect(res.status).toBe(422);
  });

  it('body bukan JSON → 400', async () => {
    const res = await app.request('/', {
      method: 'POST',
      headers: { 'x-security-key': 'test-secret', 'content-type': 'application/json' },
      body: 'bukan-json',
    });
    expect(res.status).toBe(400);
  });
});
