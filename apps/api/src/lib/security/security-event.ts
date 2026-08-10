import type { Context } from 'hono';
import { db, securityEvents } from '../db.ts';
import { SECURITY_RULES, DEFAULT_SEVERITY, type Severity } from './rules.ts';
import { detectAndAlert } from './detector.ts';

export interface SecurityEventInput {
  eventType: string;
  ctx?: Context;
  userId?: string | null;
  severity?: Severity;
  metadata?: Record<string, unknown>;
}

function clientIp(c: Context): string | null {
  return (
    c.req.header('x-forwarded-for')?.split(',')[0]?.trim() ?? c.req.header('x-real-ip') ?? null
  );
}

/**
 * Rekam event keamanan ke security_events (forensik) lalu evaluasi rules
 * detection. Seluruh body dalam try/catch — kegagalan logging tidak pernah
 * menggagalkan request utama. Aman dipanggil tanpa await (fire-and-forget).
 */
export async function emitSecurityEvent(input: SecurityEventInput): Promise<void> {
  const { eventType, ctx, userId, severity, metadata } = input;
  try {
    const rule = SECURITY_RULES.find((r) => r.eventType === eventType);
    await db.insert(securityEvents).values({
      eventType,
      userId: userId ?? null,
      ipAddress: ctx ? clientIp(ctx) : null,
      userAgent: ctx?.req.header('user-agent') ?? null,
      path: ctx?.req.path ?? null,
      severity: severity ?? rule?.severity ?? DEFAULT_SEVERITY,
      metadata: metadata ?? {},
    });
    if (rule && ctx) {
      await detectAndAlert({ rule, ctx, metadata });
    }
  } catch (err) {
    console.warn('[security] gagal merekam event:', err);
  }
}
