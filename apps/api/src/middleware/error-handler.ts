import type { Context, ErrorHandler } from 'hono';
import { HTTPException } from 'hono/http-exception';
import { serverError } from '../lib/response.ts';

export const errorHandler: ErrorHandler = (err: Error, c: Context) => {
  const traceId = c.get('traceId') as string | undefined;

  if (err instanceof HTTPException) {
    const code = err.res ? String(err.status) : 'HTTP_ERROR';
    return c.json(
      { success: false as const, code, message: err.message, errors: undefined, traceId },
      err.status,
    );
  }

  const userId = c.get('userId');
  console.error({
    event: 'unhandled_error',
    method: c.req.method,
    path: c.req.path,
    traceId,
    userId,
    error: { name: err.name, message: err.message, stack: err.stack },
  });
  return serverError(c);
};
