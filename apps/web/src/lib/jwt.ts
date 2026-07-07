import { createHmac, timingSafeEqual } from 'node:crypto';

export interface JwtPayload {
  sub: string;
  email: string;
  role: string;
  exp: number;
}

/**
 * Verify and decode a JWT (HS256) locally using Node's built-in crypto module.
 *
 * This avoids an HTTP round-trip to the API on every page load.
 *
 * @returns The decoded payload if valid, or null if the token is malformed,
 *          expired, or has an invalid signature.
 */
export function verifyAccessToken(token: string, secret: string): JwtPayload | null {
  const parts = token.split('.');
  if (parts.length !== 3) return null;

  const [headerB64, payloadB64, signatureB64] = parts;
  if (!headerB64 || !payloadB64 || !signatureB64) return null;

  try {
    // Verify HMAC-SHA256 signature
    const signature = createHmac('sha256', secret).update(`${headerB64}.${payloadB64}`).digest();

    const decodedSignature = Buffer.from(
      signatureB64.replace(/-/g, '+').replace(/_/g, '/'),
      'base64',
    );

    if (
      signature.length !== decodedSignature.length ||
      !timingSafeEqual(signature, decodedSignature)
    ) {
      return null;
    }

    // Decode payload
    const payloadJson = Buffer.from(
      payloadB64.replace(/-/g, '+').replace(/_/g, '/'),
      'base64',
    ).toString('utf-8');

    const payload = JSON.parse(payloadJson) as JwtPayload;

    // Validate required fields
    if (!payload.sub || !payload.email || !payload.role) {
      return null;
    }

    // Check expiry
    if (payload.exp && payload.exp < Math.floor(Date.now() / 1000)) {
      return null;
    }

    return {
      sub: payload.sub,
      email: payload.email,
      role: payload.role,
      exp: payload.exp,
    };
  } catch {
    return null;
  }
}

export function extractCookie(cookieHeader: string, name: string): string | null {
  const match = cookieHeader.match(new RegExp(`(?:^|;\\s*)${name}=([^;]*)`));
  return match?.[1] ? decodeURIComponent(match[1]) : null;
}
