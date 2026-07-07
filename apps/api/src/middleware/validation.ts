import type { Context, Next } from 'hono';
import type { ZodSchema, ZodError } from 'zod';
import { validationError } from '../lib/response.ts';

/**
 * Middleware that validates the request body against a Zod schema.
 *
 * On success, stores the parsed data in `c.var.validated` so the route
 * handler can read it via `c.get('validated')`.
 *
 * @example
 * ```ts
 * router.post('/', validateBody(schema), async (c) => {
 *   const data = c.get('validated') as SomeType;
 * });
 * ```
 */
export function validateBody<T>(schema: ZodSchema<T>) {
  return async (c: Context, next: Next) => {
    try {
      const body = await c.req.json();
      const result = schema.safeParse(body);
      if (!result.success) {
        return validationError(c, formatZodIssues(result.error));
      }
      c.set('validated', result.data);
      await next();
    } catch {
      return validationError(c, [{ field: 'body', message: 'Invalid JSON body' }]);
    }
  };
}

/**
 * Middleware that validates query parameters against a Zod schema.
 *
 * On success, stores the parsed data in `c.var.validated`.
 * On failure, returns a 422 response.
 *
 * @example
 * ```ts
 * router.get('/', validateQuery(schema), async (c) => {
 *   const query = c.get('validated') as SomeType;
 * });
 * ```
 */
export function validateQuery<T>(schema: ZodSchema<T>) {
  return async (c: Context, next: Next) => {
    const result = schema.safeParse(c.req.query());
    if (!result.success) {
      return validationError(c, formatZodIssues(result.error));
    }
    c.set('validated', result.data);
    await next();
  };
}

function formatZodIssues(error: ZodError): Array<{ field: string; message: string }> {
  return error.issues.map((issue) => ({
    field: issue.path.join('.'),
    message: issue.message,
  }));
}
