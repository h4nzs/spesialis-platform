import type { Context } from 'hono';
import { incrWithWindow } from './store.ts';
import { sendSecurityAlert } from './alert.ts';
import type { SecurityRule } from './rules.ts';

function clientIp(c: Context): string | null {
  return (
    c.req.header('x-forwarded-for')?.split(',')[0]?.trim() ?? c.req.header('x-real-ip') ?? null
  );
}

export interface DetectInput {
  rule: SecurityRule;
  ctx: Context;
  metadata?: Record<string, unknown>;
}

/**
 * Hitung event per IP dalam window rule; alert dikirim tepat saat hitungan
 * menyentuh threshold (sekali per window per IP — cooldown tambahan di
 * alert.ts). Deteksi v1 bersifat alert-only; auto-block menyusul.
 */
export async function detectAndAlert(input: DetectInput): Promise<void> {
  const { rule, ctx, metadata } = input;
  const ip = clientIp(ctx);
  if (!ip) return;

  const count = await incrWithWindow(`security:evt:${rule.eventType}:${ip}`, rule.windowMs);
  if (count === rule.threshold) {
    await sendSecurityAlert({
      rule,
      count,
      ip,
      path: ctx.req.path,
      metadata,
    });
  }
}
