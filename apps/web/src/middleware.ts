import { defineMiddleware } from 'astro/middleware';
import { verifyAccessToken, extractCookie } from './lib/jwt.ts';

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

export const onRequest = defineMiddleware(async ({ locals, request }, next) => {
  const cookieHeader = request.headers.get('cookie') ?? '';
  const url = new URL(request.url);

  const token = extractCookie(cookieHeader, 'token');

  if (!token) {
    locals.auth = null;
    if (url.pathname === '/dashboard' || url.pathname.startsWith('/dashboard/')) {
      return Response.redirect(new URL('/login', url), 302);
    }
    return next();
  }

  const jwtSecret =
    ((import.meta as { env?: Record<string, string | undefined> }).env?.JWT_SECRET as
      string | undefined) ?? process.env.JWT_SECRET;

  if (!jwtSecret) {
    console.error('[Middleware] JWT_SECRET is not configured');
    locals.auth = null;
    // Only redirect for dashboard routes — never redirect /login to itself
    if (url.pathname.startsWith('/dashboard')) {
      return Response.redirect(new URL('/login', url), 302);
    }
    return next();
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
    return next();
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
    const dashboardPrefix = path.split('/')[2] ?? ''; // customer|partner|corporate|admin

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

  return response;
});
