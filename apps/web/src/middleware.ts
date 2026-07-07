import { defineMiddleware } from 'astro/middleware';
import { verifyAccessToken, extractCookie } from './lib/jwt.ts';

export interface AuthLocals {
  userId: string;
  userEmail: string;
  userRole: string;
}

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace App {
    interface Locals {
      auth?: AuthLocals | null;
    }
  }
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

  const jwtSecret = process.env.JWT_SECRET;
  if (!jwtSecret) {
    console.error('[Middleware] JWT_SECRET is not configured');
    locals.auth = null;
    return Response.redirect(new URL('/login', url), 302);
  }

  const payload = verifyAccessToken(token, jwtSecret);

  if (!payload) {
    locals.auth = null;
    return Response.redirect(new URL('/login', url), 302);
  }

  locals.auth = {
    userId: payload.sub,
    userEmail: payload.email,
    userRole: payload.role,
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
    const target = dashboardRootMap[role] ?? '/';
    return Response.redirect(new URL(target, url), 302);
  }

  // Redirect /dashboard to role-appropriate dashboard
  if (path === '/dashboard') {
    const target = role ? dashboardRootMap[role] : '/login';
    return Response.redirect(new URL(target ?? '/login', url), 302);
  }

  // Role-based access control — protect dashboard routes by role
  if (path.startsWith('/dashboard/')) {
    const dashboardPrefix = path.split('/')[2] ?? ''; // customer|partner|corporate|admin

    if (!role) {
      return Response.redirect(new URL('/login', url), 302);
    }

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

  return next();
});
