import { defineMiddleware } from 'astro/middleware';
import { verifyAccessToken, extractCookie } from './lib/jwt.ts';
import { getMarkdownForPath } from './lib/markdown-agent.ts';

export interface AuthLocals {
  userId: string;
  userEmail: string;
  userRole: string;
  userName?: string;
}

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace App {
    interface Locals {
      auth?: AuthLocals | null;
    }
  }
}

/**
 * Attempt to refresh an expired access token using the httpOnly refresh token.
 */
export async function tryRefreshToken(
  refreshToken: string,
): Promise<{ token: string; refreshToken: string } | null> {
  const apiUrl = process.env.API_URL ?? 'http://localhost:3000';
  try {
    const response = await fetch(`${apiUrl}/api/v1/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken }),
    });
    if (!response.ok) return null;
    const json = (await response.json()) as {
      data: { token: string; refreshToken: string };
    };
    return json.data;
  } catch {
    return null;
  }
}

/**
 * Set new auth cookies on the outgoing response (same params as the API).
 */
export function setTokenCookies(response: Response, token: string, refreshToken: string): void {
  const isSecure = process.env.APP_ENV === 'production';
  response.headers.append(
    'Set-Cookie',
    `token=${token}; HttpOnly; ${isSecure ? 'Secure; ' : ''}SameSite=Strict; Path=/; Max-Age=${120 * 60}`,
  );
  response.headers.append(
    'Set-Cookie',
    `refreshToken=${refreshToken}; HttpOnly; ${isSecure ? 'Secure; ' : ''}SameSite=Strict; Path=/api/v1/auth; Max-Age=${7 * 24 * 60 * 60}`,
  );
}

/**
 * Enrich a response with agent discovery features:
 * Link headers (RFC 8288) and Markdown for Agents content negotiation.
 * Always runs regardless of authentication status.
 *
 * Also forces no-cache on HTML so the browser always revalidates and
 * never holds a stale page referencing hashed chunks from a previous
 * deploy (old chunks are removed from disk after build → 404 + MIME error).
 */
function addAgentDiscovery(
  response: Response,
  request: Request,
  url: URL,
  skipMarkdown: boolean,
): Response {
  // ── HTML must never be cached (heuristic or otherwise) ──
  const contentType = response.headers?.get?.('Content-Type') ?? '';
  if (contentType.includes('text/html')) {
    response.headers.set('Cache-Control', 'no-cache, must-revalidate');
  }

  // ── Link Headers (RFC 8288) ──
  if (contentType.includes('text/html')) {
    const linkHeaders = [
      `</.well-known/api-catalog>; rel="api-catalog"`,
      `</auth.md>; rel="service-doc"`,
      `</llms.txt>; rel="describedby"`,
      `</sitemap.xml>; rel="sitemap"`,
    ];
    for (const link of linkHeaders) {
      response.headers.append('Link', link);
    }
  }

  // ── Markdown for Agents (Content Negotiation) ──
  if (!skipMarkdown) {
    const accept = request.headers?.get?.('Accept') ?? '';
    const prefersMarkdown =
      accept.includes('text/markdown') &&
      (!accept.includes('text/html') ||
        accept.indexOf('text/markdown') < accept.indexOf('text/html'));

    if (prefersMarkdown) {
      const md = getMarkdownForPath(url.pathname);
      if (md) {
        return new Response(md.content, {
          status: 200,
          headers: {
            'Content-Type': 'text/markdown; charset=utf-8',
            'Cache-Control': 'public, max-age=3600',
            'Access-Control-Allow-Origin': '*',
            'X-Markdown-Tokens': String(md.tokenCount),
          },
        });
      }
    }
  }

  return response;
}

/**
 * Signal cookie readable by client JS (AuthNav) — menandai status login
 * TANPA membuka token ke JS. Tanpanya, setiap halaman publik memicu
 * 2x fetch /auth/me (2x 401 untuk tamu) hanya untuk tahu "login apa
 * belum". Nilai '1' = ada token valid, '0'/'hapus' = tamu.
 */
function tagAuthSignal(response: Response, signedIn: boolean): void {
  const isSecure = process.env.APP_ENV === 'production';
  response.headers.append(
    'Set-Cookie',
    signedIn
      ? `ap_signed_in=1; ${isSecure ? 'Secure; ' : ''}SameSite=Strict; Path=/; Max-Age=${120 * 60}`
      : `ap_signed_in=0; ${isSecure ? 'Secure; ' : ''}SameSite=Strict; Path=/; Max-Age=0`,
  );
}

export const onRequest = defineMiddleware(async ({ locals, request }, next) => {
  const url = new URL(request.url);

  const cookieHeader = request.headers?.get?.('cookie') ?? '';
  if (!cookieHeader && !request.headers?.get) {
    locals.auth = null;
    const response = await next();
    return response;
  }

  const token = extractCookie(cookieHeader, 'token');

  if (!token) {
    locals.auth = null;
    if (url.pathname === '/dashboard' || url.pathname.startsWith('/dashboard/')) {
      return Response.redirect(new URL('/login', url), 302);
    }
    const response = await next();
    tagAuthSignal(response, false);
    return addAgentDiscovery(response, request, url, false);
  }

  const jwtSecret =
    ((import.meta as { env?: Record<string, string | undefined> }).env?.JWT_SECRET as
      string | undefined) ?? process.env.JWT_SECRET;

  if (!jwtSecret) {
    console.error('[Middleware] JWT_SECRET is not configured');
    locals.auth = null;
    if (url.pathname.startsWith('/dashboard')) {
      return Response.redirect(new URL('/login', url), 302);
    }
    const response = await next();
    tagAuthSignal(response, false);
    return addAgentDiscovery(response, request, url, false);
  }

  let payload = await verifyAccessToken(token, jwtSecret);

  // ── Auto-refresh on expired token ──
  let newTokens: { token: string; refreshToken: string } | null = null;

  if (!payload) {
    const refreshToken = extractCookie(cookieHeader, 'refreshToken');
    if (refreshToken) {
      newTokens = await tryRefreshToken(refreshToken);
      if (newTokens) {
        payload = await verifyAccessToken(newTokens.token, jwtSecret);
      }
    }
  }

  if (!payload) {
    locals.auth = null;
    if (url.pathname.startsWith('/dashboard')) {
      return Response.redirect(new URL('/login', url), 302);
    }
    const response = await next();
    tagAuthSignal(response, false);
    return addAgentDiscovery(response, request, url, false);
  }

  locals.auth = {
    userId: payload.sub,
    userEmail: payload.email,
    userRole: payload.role,
    userName: payload.name,
  };

  const role = locals.auth.userRole;
  const path = url.pathname;

  const dashboardRootMap: Record<string, string> = {
    customer: '/dashboard/customer',
    partner: '/dashboard/partner',
    corporate: '/dashboard/corporate',
    admin: '/dashboard/admin',
    super_admin: '/dashboard/admin',
    dispatcher: '/dashboard/admin',
    finance: '/dashboard/admin',
    content_manager: '/dashboard/admin',
  };

  // Redirect authenticated users away from /login
  if (path === '/login' && role) {
    return Response.redirect(new URL(dashboardRootMap[role] ?? '/', url), 302);
  }

  // Redirect /dashboard to role-appropriate dashboard
  if (path === '/dashboard') {
    return Response.redirect(new URL(dashboardRootMap[role] ?? '/login', url), 302);
  }

  // Role-based access control — protect dashboard routes by role
  if (path.startsWith('/dashboard/')) {
    const dashboardPrefix = path.split('/')[2] ?? '';
    const roleMap: Record<string, string[]> = {
      customer: ['customer'],
      partner: ['partner'],
      corporate: ['corporate'],
      admin: ['admin', 'super_admin', 'dispatcher', 'finance', 'content_manager'],
    };
    const allowedRoles = roleMap[dashboardPrefix];
    if (allowedRoles && !allowedRoles.includes(role)) {
      return Response.redirect(new URL('/403', url), 302);
    }
  }

  const response = await next();

  // Set new token cookies on the response if a refresh occurred
  if (newTokens) {
    setTokenCookies(response, newTokens.token, newTokens.refreshToken);
  }
  tagAuthSignal(response, true);

  // Skip markdown during token refresh — let the original response through
  return addAgentDiscovery(response, request, url, !!newTokens);
});
