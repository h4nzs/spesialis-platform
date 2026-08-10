import { beforeEach, describe, expect, it, vi } from 'vitest';
import { Hono } from 'hono';
import { securityMiddleware } from './security.ts';

vi.mock('../lib/security/security-event.ts', () => ({
  emitSecurityEvent: vi.fn().mockResolvedValue(undefined),
}));

import { emitSecurityEvent } from '../lib/security/security-event.ts';

const mockedEmit = vi.mocked(emitSecurityEvent);

const app = new Hono();
app.use('*', securityMiddleware());
app.get('/', (c) => c.text('ok'));

beforeEach(() => {
  mockedEmit.mockClear();
});

describe('securityMiddleware', () => {
  it('mendeteksi payload mencurigakan tanpa memblokir request', async () => {
    const res = await app.request('/?q=<script>alert(1)</script>');

    expect(res.status).toBe(200);
    expect(mockedEmit).toHaveBeenCalledWith(
      expect.objectContaining({ eventType: 'SUSPICIOUS_PAYLOAD' }),
    );
  });

  it('request normal tidak menghasilkan event', async () => {
    await app.request('/');

    expect(mockedEmit).not.toHaveBeenCalled();
  });

  it('URL ter-decode: traversal tersembunyi tetap terdeteksi', async () => {
    await app.request('/files/..%2f..%2fetc%2fpasswd');

    expect(mockedEmit).toHaveBeenCalledWith(
      expect.objectContaining({ eventType: 'SUSPICIOUS_PAYLOAD' }),
    );
  });
});
