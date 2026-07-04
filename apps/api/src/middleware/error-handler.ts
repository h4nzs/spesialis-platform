import type { Context, ErrorHandler } from 'hono';
import { HTTPException } from 'hono/http-exception';
import { serverError } from '../lib/response.ts';

export const errorHandler: ErrorHandler = (err: Error, c: Context) => {
  if (err instanceof HTTPException) {
    const code = err.res ? String(err.status) : 'HTTP_ERROR';
    return c.json(
      { success: false as const, code, message: err.message, errors: undefined },
      err.status,
    );
  }

  const userId = c.get('userId');
  console.error(`[API] Unhandled ${c.req.method} ${c.req.path}`, {
    error: { name: err.name, message: err.message, stack: err.stack },
    userId,
  });
  return serverError(c);
};
