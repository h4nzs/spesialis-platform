import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { sendWhatsApp } from './whatsapp.ts';

const mockFetch = vi.fn();

beforeEach(() => {
  vi.clearAllMocks();
  vi.stubGlobal('fetch', mockFetch);
});

afterEach(() => {
  delete process.env.WHATSAPP_API_KEY;
  delete process.env.WHATSAPP_API_URL;
});

describe('sendWhatsApp', () => {
  it('skips when no API key', async () => {
    await sendWhatsApp('08123456789', 'Test message');
    expect(mockFetch).not.toHaveBeenCalled();
  });

  it('sends to Fonnte with correct format', async () => {
    process.env.WHATSAPP_API_KEY = 'test-key';
    mockFetch.mockResolvedValueOnce({ ok: true });

    await sendWhatsApp('08123456789', 'Hello');

    expect(mockFetch).toHaveBeenCalledTimes(1);
    const [url, opts] = mockFetch.mock.calls[0] as [string, RequestInit];
    expect(url).toBe('https://api.fonnte.com/send');
    expect(opts.headers).toMatchObject({ Authorization: 'test-key' });
    expect(JSON.parse(opts.body as string)).toMatchObject({
      target: '628123456789',
      message: 'Hello',
    });
  });

  it('handles +62 prefix', async () => {
    process.env.WHATSAPP_API_KEY = 'test-key';
    mockFetch.mockResolvedValueOnce({ ok: true });

    await sendWhatsApp('+628123456789', 'Test');
    const [, opts] = mockFetch.mock.calls[0] as [string, RequestInit];
    expect(JSON.parse(opts.body as string).target).toBe('628123456789');
  });

  it('logs error on failure', async () => {
    process.env.WHATSAPP_API_KEY = 'test-key';
    mockFetch.mockResolvedValueOnce({ ok: false, status: 401, text: () => 'Unauthorized' });

    await sendWhatsApp('08123456789', 'Test');
    expect(mockFetch).toHaveBeenCalledTimes(1);
  });
});
