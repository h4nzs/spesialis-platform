import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { generateIndexNowKey, getIndexNowKeyLocation, pingIndexNow } from './indexnow.ts';

describe('generateIndexNowKey', () => {
  it('generates a UUID v4 string', () => {
    const key = generateIndexNowKey();
    expect(key).toBeTruthy();
    expect(key).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i);
  });

  it('generates unique keys on successive calls', () => {
    const key1 = generateIndexNowKey();
    const key2 = generateIndexNowKey();
    expect(key1).not.toBe(key2);
  });
});

describe('getIndexNowKeyLocation', () => {
  it('returns key location URL with host', () => {
    const location = getIndexNowKeyLocation('https://spesialis.id', 'test-key');
    expect(location).toBe('https://spesialis.id/test-key.txt');
  });

  it('strips trailing slash from host', () => {
    const location = getIndexNowKeyLocation('https://spesialis.id/', 'mykey');
    expect(location).toBe('https://spesialis.id/mykey.txt');
  });

  it('works with ip-based host', () => {
    const location = getIndexNowKeyLocation('http://localhost:3000', 'k');
    expect(location).toBe('http://localhost:3000/k.txt');
  });
});

describe('pingIndexNow', () => {
  const mockFetch = vi.fn();

  beforeEach(() => {
    vi.stubGlobal('fetch', mockFetch);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    mockFetch.mockReset();
  });

  it('returns empty array for empty urls', async () => {
    const results = await pingIndexNow([], 'key', 'https://example.com/key.txt');
    expect(results).toEqual([]);
    expect(mockFetch).not.toHaveBeenCalled();
  });

  it('returns empty array for empty key', async () => {
    const results = await pingIndexNow(
      ['https://example.com/page'],
      '',
      'https://example.com/key.txt',
    );
    expect(results).toEqual([]);
    expect(mockFetch).not.toHaveBeenCalled();
  });

  it('pings both IndexNow and Bing APIs with correct payload', async () => {
    mockFetch.mockResolvedValue({ status: 200 });

    const results = await pingIndexNow(
      ['https://spesialis.id/blog/test-article'],
      'test-key',
      'https://spesialis.id/test-key.txt',
      'https://spesialis.id',
    );

    expect(mockFetch).toHaveBeenCalledTimes(2);

    // First call: IndexNow API
    const firstCall = mockFetch.mock.calls[0]!;
    expect(firstCall[0]).toBe('https://api.indexnow.org/indexnow');
    expect(firstCall[1]).toEqual({
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        host: 'spesialis.id',
        key: 'test-key',
        keyLocation: 'https://spesialis.id/test-key.txt',
        urlList: ['https://spesialis.id/blog/test-article'],
      }),
    });

    // Second call: Bing API
    const secondCall = mockFetch.mock.calls[1]!;
    expect(secondCall[0]).toBe('https://www.bing.com/indexnow');

    expect(results).toHaveLength(2);
    expect(results[0]).toEqual({ destination: 'indexnow.org', status: 200, error: null });
    expect(results[1]).toEqual({ destination: 'bing.com', status: 200, error: null });
  });

  it('strips protocol from host in payload', async () => {
    mockFetch.mockResolvedValue({ status: 200 });

    await pingIndexNow(
      ['https://spesialis.id/blog/test'],
      'key',
      'https://spesialis.id/key.txt',
      'https://spesialis.id',
    );

    const callBody = JSON.parse(mockFetch.mock.calls[0]![1]!.body as string);
    expect(callBody.host).toBe('spesialis.id');
  });

  it('strips trailing slash from host in payload', async () => {
    mockFetch.mockResolvedValue({ status: 200 });

    await pingIndexNow(
      ['https://spesialis.id/blog/test'],
      'key',
      'https://spesialis.id/key.txt',
      'https://spesialis.id/',
    );

    const callBody = JSON.parse(mockFetch.mock.calls[0]![1]!.body as string);
    expect(callBody.host).toBe('spesialis.id');
  });

  it('reports error when fetch fails', async () => {
    mockFetch.mockRejectedValue(new Error('Network failure'));

    const results = await pingIndexNow(
      ['https://spesialis.id/blog/test'],
      'key',
      'https://spesialis.id/key.txt',
    );

    expect(results).toHaveLength(2);
    for (const r of results) {
      expect(r.status).toBeNull();
      expect(r.error).toBe('Network failure');
    }
  });

  it('reports HTTP error status codes', async () => {
    // First fetch succeeds with 429, second with 500
    mockFetch.mockResolvedValueOnce({ status: 429 }).mockResolvedValueOnce({ status: 500 });

    const results = await pingIndexNow(
      ['https://spesialis.id/blog/test'],
      'key',
      'https://spesialis.id/key.txt',
    );

    expect(results[0]!.status).toBe(429);
    expect(results[1]!.status).toBe(500);
    expect(results[0]!.error).toBeNull();
    expect(results[1]!.error).toBeNull();
  });

  it('handles mixed success/failure across destinations', async () => {
    mockFetch.mockResolvedValueOnce({ status: 200 }).mockRejectedValueOnce(new Error('Timeout'));

    const results = await pingIndexNow(
      ['https://spesialis.id/blog/test'],
      'key',
      'https://spesialis.id/key.txt',
    );

    expect(results[0]).toEqual({ destination: 'indexnow.org', status: 200, error: null });
    expect(results[1]).toEqual({ destination: 'bing.com', status: null, error: 'Timeout' });
  });

  it('sends multiple URLs in urlList', async () => {
    mockFetch.mockResolvedValue({ status: 200 });

    const urls = [
      'https://spesialis.id/blog/one',
      'https://spesialis.id/blog/two',
      'https://spesialis.id/blog/three',
    ];

    await pingIndexNow(urls, 'key', 'https://spesialis.id/key.txt');

    const callBody = JSON.parse(mockFetch.mock.calls[0]![1]!.body as string);
    expect(callBody.urlList).toHaveLength(3);
    expect(callBody.urlList).toEqual(urls);
  });
});
