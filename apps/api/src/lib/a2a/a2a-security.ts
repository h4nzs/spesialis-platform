import type { User } from '@a2a-js/sdk/server';
import { verifyAccessToken } from '../auth.ts';

/**
 * A2A User backed by the platform's own JWT (same cookie/token auth as the
 * REST API). `userName` carries the UUID so TaskStore/PushStore scope
 * tasks and webhook configs to the authenticated customer.
 */
class PlatformUser implements User {
  readonly isAuthenticated = true;
  constructor(
    readonly userName: string,
    readonly role: string,
  ) {}
}

/**
 * Extracts the authenticated platform user from an Authorization header.
 * Returns undefined for missing/invalid tokens (client stays anonymous and
 * booking skills respond with TASK_STATE_AUTH_REQUIRED).
 */
export async function buildA2AUser(
  headers: Record<string, string | string[] | undefined>,
): Promise<User | undefined> {
  const raw = headers['authorization'] ?? headers['Authorization'];
  const value = Array.isArray(raw) ? raw[0] : raw;
  if (!value || !value.startsWith('Bearer ')) return undefined;
  try {
    const payload = await verifyAccessToken(value.slice(7).trim());
    return new PlatformUser(payload.sub, payload.role);
  } catch {
    return undefined;
  }
}
