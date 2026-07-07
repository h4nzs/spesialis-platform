/**
 * Shared utility for parsing and validating request bodies inline.
 *
 * Use this when a route cannot use the `validateBody` middleware —
 * for example, when the validation schema depends on runtime conditions
 * (auth status, request body content, etc.) checked inside the handler.
 *
 * @example
 * ```ts
 * const parsed = await parseBody(c, mySchema);
 * if (!parsed.ok) return parsed.response;
 * // parsed.data is typed as z.infer<typeof mySchema>
 * ```
 */

import type { Context } from 'hono';
import type { ZodSchema } from 'zod';
import { validationError } from './response.ts';

export type ParseResult<T> = { ok: true; data: T } | { ok: false; response: Response };

export async function parseBody<T>(c: Context, schema: ZodSchema<T>): Promise<ParseResult<T>> {
  const body = await c.req.json();
  const result = schema.safeParse(body);

  if (!result.success) {
    return {
      ok: false,
      response: validationError(
        c,
        result.error.issues.map((i) => ({
          field: i.path.join('.'),
          message: i.message,
        })),
      ),
    };
  }

  return { ok: true, data: result.data };
}
