import { verify } from 'hono/jwt';

export interface JwtPayload {
  sub: string;
  email: string;
  role: string;
  exp: number;
}

/**
 * Verify and decode a JWT (HS256) using Hono's JWT library.
 *
 * Hono uses the `jose` library under the hood, which handles all JWT
 * edge cases (algorithm negotiation, Base64URL encoding, signature
 * verification, expiry) correctly. This avoids fragile custom crypto.
 *
 * This avoids an HTTP round-trip to the API on every page load.
 *
 * @returns The decoded payload if valid, or null if the token is malformed,
 *          expired, or has an invalid signature.
 */
export async function verifyAccessToken(token: string, secret: string): Promise<JwtPayload | null> {
  try {
    const payload = await verify(token, secret, 'HS256');

    // Validate required fields
    if (!payload.sub || !payload.email || !payload.role) {
      return null;
    }

    return {
      sub: payload.sub as string,
      email: payload.email as string,
      role: payload.role as string,
      exp: payload.exp as number,
    };
  } catch {
    return null;
  }
}

export function extractCookie(cookieHeader: string, name: string): string | null {
  const match = cookieHeader.match(new RegExp(`(?:^|;\\s*)${name}=([^;]*)`));
  return match?.[1] ? decodeURIComponent(match[1]) : null;
}
