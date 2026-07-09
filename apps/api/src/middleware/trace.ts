import type { Context, Next } from 'hono';
import { randomUUID } from 'node:crypto';

/**
 * Request tracing middleware.
 *
 * Generates a unique trace ID for every request and stores it in:
 * - `c.var.traceId` — accessible in route handlers
 * - `c.res.header('X-Trace-Id')` — returned in the response
 * - `console.error` output — logged with every error for correlation
 *
 * @example
 * ```ts
 * app.use('*', traceMiddleware());
 * // Later in error handler:
 * console.error({ traceId: c.get('traceId'), error: ... });
 * ```
 */
export function traceMiddleware() {
  return async (c: Context, next: Next) => {
    const traceId = c.req.header('X-Trace-Id') ?? randomUUID().slice(0, 12);
    c.set('traceId', traceId);
    c.res.headers.set('X-Trace-Id', traceId);
    await next();
  };
}
