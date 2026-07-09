import type { Context, Next } from 'hono';
import { error } from '../lib/response.ts';

/**
 * CSRF protection middleware.
 *
 * Validates the `Origin` or `Referer` header on state-changing HTTP methods
 * (POST, PUT, PATCH, DELETE) to prevent cross-site request forgery.
 *
 * This is the simplest effective CSRF defense for a SPA → API architecture
 * where the browser already sends httpOnly cookies with `SameSite=Lax`.
 * The Origin/Referer check closes the remaining gap (subdomain attacks,
 * same-site script includes, etc.) without requiring CSRF tokens.
 *
 * Allowed origins are read from the `CORS_ORIGIN` environment variable
 * (identical to the CORS configuration) so that the allowlist stays in
 * a single place.
 *
 * @example
 * ```ts
 * app.use('/api/*', csrfProtection());
 * ```
 */
export function csrfProtection() {
  const envOrigins = (process.env.CORS_ORIGIN ?? '')
    .split(',')
    .map((o) => o.trim())
    .filter(Boolean);

  // Build the allowlist from CORS_ORIGIN env, with localhost fallbacks
  // for development when the env var is not configured.
  const allowedOrigins =
    envOrigins.length > 0
      ? envOrigins
      : [
          'http://localhost:4321',
          'http://localhost:4322',
          'http://localhost:3000',
          'http://localhost',
        ];

  return async (c: Context, next: Next) => {
    // Only check state-changing methods
    if (!['POST', 'PUT', 'PATCH', 'DELETE'].includes(c.req.method)) {
      await next();
      return;
    }

    // Skip CSRF for the refresh-token endpoint, which is called
    // programmatically (may omit Origin/Referer in server-side code).
    if (c.req.path.includes('/auth/refresh')) {
      await next();
      return;
    }

    const origin = c.req.header('Origin');
    const referer = c.req.header('Referer');

    // If neither header is present, the request is likely from a server-side client
    // (CLI, cron, internal service) or a same-origin navigation. Allow through.
    if (!origin && !referer) {
      await next();
      return;
    }

    const isValidOrigin = (value: string): boolean => {
      try {
        const url = new URL(value);
        return allowedOrigins.some(
          (allowed) => url.origin === allowed || url.origin === allowed.replace(/\/+$/, ''),
        );
      } catch {
        return false;
      }
    };

    if (origin && !isValidOrigin(origin)) {
      return error(c, 'CSRF_REJECTED', 'Cross-site request rejected', 403);
    }

    if (referer && !isValidOrigin(referer)) {
      return error(c, 'CSRF_REJECTED', 'Cross-site request rejected', 403);
    }

    await next();
  };
}
