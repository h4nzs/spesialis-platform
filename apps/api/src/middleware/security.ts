import type { Context, Next } from 'hono';
import { SUSPICIOUS_PATTERNS } from '../lib/security/rules.ts';
import { emitSecurityEvent } from '../lib/security/security-event.ts';

/**
 * Mendeteksi payload mencurigakan (SQLi/XSS/path traversal) pada URL
 * request. Event direkam + rules detection dievaluasi; deteksi v1 bersifat
 * alert-only — tidak memblokir request.
 */
export function securityMiddleware() {
  return async (c: Context, next: Next) => {
    let url: string;
    try {
      url = decodeURIComponent(c.req.url);
    } catch {
      url = c.req.url;
    }
    const pattern = SUSPICIOUS_PATTERNS.find((p) => p.pattern.test(url));
    if (pattern) {
      void emitSecurityEvent({
        eventType: 'SUSPICIOUS_PAYLOAD',
        ctx: c,
        metadata: { pattern: pattern.name },
      });
    }
    await next();
  };
}
