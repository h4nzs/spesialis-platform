import type { Context, Next } from 'hono';
import { getCookie } from 'hono/cookie';
import type { UserRole } from '@specialist/types';
import { verifyAccessToken } from '../lib/auth.ts';
import { unauthorized, forbidden } from '../lib/response.ts';

export async function authMiddleware(c: Context, next: Next) {
  const authHeader = c.req.header('Authorization');
  const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : getCookie(c, 'token');

  if (!token) {
    return unauthorized(c, 'Missing authentication token');
  }

  try {
    const payload = await verifyAccessToken(token);
    c.set('userId', payload.sub);
    c.set('userRole', payload.role);
    await next();
  } catch {
    return unauthorized(c, 'Invalid or expired token');
  }
}

export function requireRole(...roles: UserRole[]) {
  return async (c: Context, next: Next) => {
    const userRole = c.get('userRole') as UserRole;

    if (!userRole || !roles.includes(userRole)) {
      return forbidden(c, 'Insufficient permissions');
    }

    await next();
  };
}
