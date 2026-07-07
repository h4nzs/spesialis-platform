/**
 * Hono Context Variable Augmentation
 *
 * Declares custom context variables used by the application middleware.
 * This avoids the need for (c as any) casts when calling c.set/c.get.
 *
 * The 'validated' variable is set by validateBody / validateQuery middleware
 * and contains the parsed Zod schema result.
 */
import 'hono';

declare module 'hono' {
  interface ContextVariableMap {
    validated: unknown;
  }
}
