import { describe, it, expect, vi, beforeEach } from 'vitest';

// ── Mocks ──────────────────────────────────────────────────────

const mockFetch = vi.fn();

beforeEach(() => {
  vi.resetAllMocks();
  // Override global fetch for all tests that import tryRefreshToken
  mockFetch.mockReset();
  vi.stubGlobal('fetch', mockFetch);
});

// ── tryRefreshToken ────────────────────────────────────────────

describe('tryRefreshToken', () => {
  it('mengembalikan data token saat refresh sukses (200)', async () => {
    mockFetch.mockResolvedValueOnce(
      new Response(JSON.stringify({ data: { token: 'new-access', refreshToken: 'new-refresh' } }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }),
    );

    const { tryRefreshToken } = await import('./middleware.ts');
    const result = await tryRefreshToken('valid-refresh-token');

    expect(result).toEqual({ token: 'new-access', refreshToken: 'new-refresh' });
    expect(mockFetch).toHaveBeenCalledWith(
      'http://localhost:3000/api/v1/auth/refresh',
      expect.objectContaining({
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken: 'valid-refresh-token' }),
      }),
    );
  });

  it('mengembalikan null saat response bukan 200', async () => {
    mockFetch.mockResolvedValueOnce(new Response(null, { status: 401 }));

    const { tryRefreshToken } = await import('./middleware.ts');
    const result = await tryRefreshToken('expired-refresh-token');

    expect(result).toBeNull();
  });

  it('mengembalikan null saat fetch throw (network error)', async () => {
    mockFetch.mockRejectedValueOnce(new Error('Network error'));

    const { tryRefreshToken } = await import('./middleware.ts');
    const result = await tryRefreshToken('some-token');

    expect(result).toBeNull();
  });

  it('menggunakan API_URL dari env jika tersedia', async () => {
    vi.stubEnv('API_URL', 'http://api:3000');
    mockFetch.mockResolvedValueOnce(
      new Response(JSON.stringify({ data: { token: 't', refreshToken: 'r' } }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }),
    );

    const { tryRefreshToken } = await import('./middleware.ts');
    await tryRefreshToken('test-token');

    expect(mockFetch).toHaveBeenCalledWith(
      'http://api:3000/api/v1/auth/refresh',
      expect.anything(),
    );

    vi.unstubAllEnvs();
  });

  it('menggunakan fallback localhost:3000 saat API_URL tidak diset', async () => {
    vi.unstubAllEnvs();
    // Hapus API_URL untuk memastikan fallback ke localhost:3000
    delete process.env.API_URL;
    mockFetch.mockResolvedValueOnce(
      new Response(JSON.stringify({ data: { token: 't', refreshToken: 'r' } }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }),
    );

    const { tryRefreshToken } = await import('./middleware.ts');
    await tryRefreshToken('test-token');

    expect(mockFetch).toHaveBeenCalledWith(
      'http://localhost:3000/api/v1/auth/refresh',
      expect.anything(),
    );
  });
});

// ── setTokenCookies ────────────────────────────────────────────

describe('setTokenCookies', () => {
  function createMockResponse(): Response {
    return new Response(null, { status: 200 });
  }

  it('menambahkan token cookie dengan param yang benar', async () => {
    vi.stubEnv('APP_ENV', 'development');

    const { setTokenCookies } = await import('./middleware.ts');
    const response = createMockResponse();

    setTokenCookies(response, 'my-token', 'my-refresh');

    const cookies = response.headers.getSetCookie();
    expect(cookies).toHaveLength(2);

    // Token cookie
    expect(cookies[0]).toMatch(/^token=my-token;/);
    expect(cookies[0]).toContain('HttpOnly');
    expect(cookies[0]).toContain('SameSite=Strict');
    expect(cookies[0]).toContain('Path=/');
    expect(cookies[0]).toContain(`Max-Age=${120 * 60}`);
    // Secure should NOT be present in development
    expect(cookies[0]).not.toContain('Secure');

    vi.unstubAllEnvs();
  });

  it('menambahkan refreshToken cookie dengan param yang benar', async () => {
    vi.stubEnv('APP_ENV', 'development');

    const { setTokenCookies } = await import('./middleware.ts');
    const response = createMockResponse();

    setTokenCookies(response, 'my-token', 'my-refresh');

    const cookies = response.headers.getSetCookie();

    // Refresh cookie
    expect(cookies[1]).toMatch(/^refreshToken=my-refresh;/);
    expect(cookies[1]).toContain('HttpOnly');
    expect(cookies[1]).toContain('SameSite=Strict');
    expect(cookies[1]).toContain('Path=/api/v1/auth');
    expect(cookies[1]).toContain(`Max-Age=${7 * 24 * 60 * 60}`);
    expect(cookies[1]).not.toContain('Secure');

    vi.unstubAllEnvs();
  });

  it('menambahkan flag Secure saat APP_ENV=production', async () => {
    vi.stubEnv('APP_ENV', 'production');

    const { setTokenCookies } = await import('./middleware.ts');
    const response = createMockResponse();

    setTokenCookies(response, 'my-token', 'my-refresh');

    const cookies = response.headers.getSetCookie();
    expect(cookies[0]).toContain('Secure');
    expect(cookies[1]).toContain('Secure');

    vi.unstubAllEnvs();
  });

  it('tidak menambahkan flag Secure saat APP_ENV bukan production', async () => {
    vi.stubEnv('APP_ENV', 'staging');

    const { setTokenCookies } = await import('./middleware.ts');
    const response = createMockResponse();

    setTokenCookies(response, 'my-token', 'my-refresh');

    const cookies = response.headers.getSetCookie();
    expect(cookies[0]).not.toContain('Secure');
    expect(cookies[1]).not.toContain('Secure');

    vi.unstubAllEnvs();
  });

  it('tidak menghapus header lain saat menambahkan cookies', async () => {
    vi.stubEnv('APP_ENV', 'development');

    const { setTokenCookies } = await import('./middleware.ts');
    const response = new Response(null, {
      status: 200,
      headers: { 'Content-Type': 'text/html' },
    });

    setTokenCookies(response, 't', 'r');

    expect(response.headers.get('Content-Type')).toBe('text/html');
    expect(response.headers.getSetCookie()).toHaveLength(2);

    vi.unstubAllEnvs();
  });
});
