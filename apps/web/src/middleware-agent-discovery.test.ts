import { describe, it, expect, vi, beforeEach } from 'vitest';

// ── Mock JWT module ────────────────────────────────────────────
// We mock the JWT module so the middleware can pass auth checks
// for non-dashboard paths. The mock returns undefined for 'token'
// by default, which makes the middleware call next() (no auth).
vi.mock('./lib/jwt.ts', () => ({
  verifyAccessToken: vi.fn(),
  extractCookie: vi.fn(() => undefined),
}));

// ── Mock fetch ─────────────────────────────────────────────────
// The middleware doesn't call fetch for non-dashboard paths,
// but the module imports it via tryRefreshToken which uses fetch.
// Stub it globally just in case.
beforeEach(() => {
  vi.stubGlobal('fetch', vi.fn());
});

// ── Helper ─────────────────────────────────────────────────────
// Cast to 'any' to avoid TypeScript APIContext type complexity.
function callMiddleware(
  onRequest: any,
  request: Request,
  locals: Record<string, unknown> = { auth: null },
  nextContent?: { body?: string; status?: number; contentType?: string },
): Promise<Response> {
  const {
    body = '<html><body>Test</body></html>',
    status = 200,
    contentType = 'text/html',
  } = nextContent ?? {};

  const next = vi.fn().mockResolvedValue(
    new Response(body, {
      status,
      headers: { 'Content-Type': contentType },
    }),
  );

  return onRequest({ locals, request }, next) as Promise<Response>;
}

// ── Link Headers (RFC 8288) ────────────────────────────────────

describe('Agent Discovery — Link Headers', () => {
  async function getResponse(
    path = '/',
    accept = 'text/html',
    contentType = 'text/html',
  ): Promise<Response> {
    const { onRequest } = await import('./middleware.ts');
    const request = new Request(`http://localhost:4321${path}`, {
      headers: { Accept: accept },
    });
    return callMiddleware(onRequest, request, { auth: null }, { contentType });
  }

  it('menambahkan Link headers ke HTML response', async () => {
    const res = await getResponse();
    const link = res.headers.get('Link');
    expect(link).toBeTruthy();
    expect(link).toContain('rel="api-catalog"');
    expect(link).toContain('rel="service-doc"');
    expect(link).toContain('rel="describedby"');
    expect(link).toContain('rel="sitemap"');
  });

  it('Link headers mengandung URL yang benar', async () => {
    const res = await getResponse();
    const link = res.headers.get('Link');
    expect(link).toContain('/.well-known/api-catalog');
    expect(link).toContain('/auth.md');
    expect(link).toContain('/llms.txt');
    expect(link).toContain('/sitemap.xml');
  });

  it('tidak menambahkan Link headers ke JSON response', async () => {
    const res = await getResponse('/', 'text/html', 'application/json');
    expect(res.headers.get('Link')).toBeNull();
  });

  it('tidak menambahkan Link headers ke XML response', async () => {
    const res = await getResponse('/', 'text/html', 'application/xml');
    expect(res.headers.get('Link')).toBeNull();
  });

  it('Link headers tetap ada di halaman non-root (/services)', async () => {
    const res = await getResponse('/services');
    const link = res.headers.get('Link');
    expect(link).toContain('rel="api-catalog"');
    expect(link).toContain('rel="sitemap"');
  });

  it('Link headers tidak remove header lain', async () => {
    const { onRequest } = await import('./middleware.ts');
    const request = new Request('http://localhost:4321/', {
      headers: { Accept: 'text/html' },
    });
    const res = await callMiddleware(
      onRequest,
      request,
      { auth: null },
      {
        body: '<html></html>',
        contentType: 'text/html',
      },
    );

    expect(res.headers.get('Content-Type')).toContain('text/html');
    expect(res.headers.get('Link')).toContain('rel="api-catalog"');
  });
});

// ── Markdown for Agents (Content Negotiation) ──────────────────

describe('Agent Discovery — Markdown for Agents', () => {
  async function getResponse(path = '/', accept = 'text/markdown'): Promise<Response> {
    const { onRequest } = await import('./middleware.ts');
    const request = new Request(`http://localhost:4321${path}`, {
      headers: { Accept: accept },
    });
    return callMiddleware(onRequest, request, { auth: null });
  }

  it('mengembalikan markdown untuk homepage saat Accept: text/markdown', async () => {
    const res = await getResponse('/');
    const text = await res.text();
    expect(text).not.toContain('Test');
    expect(text).toContain('# Ahli Panggilan');
    expect(text).toContain('Service Categories');
    expect(res.headers.get('Content-Type')).toContain('text/markdown');
  });

  it('mengembalikan X-Markdown-Tokens header', async () => {
    const res = await getResponse('/');
    const tokens = res.headers.get('X-Markdown-Tokens');
    expect(tokens).toBeTruthy();
    expect(Number(tokens)).toBeGreaterThan(0);
  });

  it('mengembalikan markdown untuk /faq dengan konten yang benar', async () => {
    const res = await getResponse('/faq');
    const text = await res.text();
    expect(text).toContain('# FAQ');
    expect(text).toContain('Bagaimana cara booking');
  });

  it('mengembalikan markdown untuk /services', async () => {
    const res = await getResponse('/services');
    const text = await res.text();
    expect(text).toContain('# Layanan Ahli Panggilan');
    expect(text).toContain('Perawatan AC');
  });

  it('mengembalikan markdown saat Accept: text/markdown, text/html (markdown preferred)', async () => {
    const res = await getResponse('/', 'text/markdown, text/html');
    const text = await res.text();
    expect(text).toContain('# Ahli Panggilan');
    expect(res.headers.get('Content-Type')).toContain('text/markdown');
  });

  it('memprioritaskan HTML saat Accept: text/html, text/markdown', async () => {
    const res = await getResponse('/', 'text/html, text/markdown');
    const text = await res.text();
    expect(text).toContain('Test');
    expect(res.headers.get('Content-Type')).toContain('text/html');
  });

  it('mengembalikan HTML saat Accept tanpa text/markdown', async () => {
    const res = await getResponse('/', 'text/html');
    const text = await res.text();
    expect(text).toContain('Test');
    expect(res.headers.get('Content-Type')).toContain('text/html');
  });

  it('mengembalikan HTML untuk path yang tidak ada di route map', async () => {
    const res = await getResponse('/some-unknown-page');
    const text = await res.text();
    expect(text).toContain('Test');
    expect(res.headers.get('Content-Type')).toContain('text/html');
  });

  it('Response markdown memiliki Access-Control-Allow-Origin: *', async () => {
    const res = await getResponse('/');
    expect(res.headers.get('Access-Control-Allow-Origin')).toBe('*');
  });

  it('Cache-Control untuk markdown response adalah public, max-age=3600', async () => {
    const res = await getResponse('/');
    const cc = res.headers.get('Cache-Control');
    expect(cc).toContain('public');
    expect(cc).toContain('max-age=3600');
  });

  it('mengembalikan HTML untuk path /api/v1/* yang tidak ada di route map', async () => {
    const res = await getResponse('/api/v1/health');
    const text = await res.text();
    expect(text).toContain('Test');
  });
});
