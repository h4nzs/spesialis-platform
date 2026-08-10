import { Hono } from 'hono';
import { success, unauthorized, error } from '../lib/response.ts';
import { sendExternalSecurityAlert } from '../lib/security/alert.ts';

const router = new Hono();

interface WebhookPayload {
  severity?: unknown;
  event: string;
  message: string;
  source: string;
  ip?: string | null;
  metadata?: Record<string, unknown>;
}

/**
 * Normalisasi severity dari sumber eksternal: terima angka 1-5 atau label
 * string (info/low/medium/high/critical). Default LOW bila tidak dikenali.
 */
function normalizeSeverity(value: unknown): number {
  if (typeof value === 'number' && Number.isFinite(value) && value >= 1 && value <= 5) {
    return Math.round(value);
  }
  const label = String(value ?? '').toUpperCase();
  const map: Record<string, number> = {
    INFO: 1,
    LOW: 2,
    MEDIUM: 3,
    HIGH: 4,
    CRITICAL: 5,
  };
  return map[label] ?? 2;
}

/**
 * Webhook alert dari sumber eksternal (CrowdSec decisions, trivy scan,
 * FIM changes). Autentikasi via header X-Security-Key — server-to-server,
 * tanpa Origin (bypass CSRF untuk path ini).
 */
router.post('/', async (c) => {
  const expected = process.env.SECURITY_WEBHOOK_SECRET;
  if (!expected) {
    return error(c, 'WEBHOOK_DISABLED', 'Security webhook tidak dikonfigurasi', 503);
  }
  const provided = c.req.header('x-security-key');
  if (!provided || provided !== expected) {
    return unauthorized(c, 'Invalid security key');
  }

  let body: WebhookPayload;
  try {
    body = (await c.req.json()) as WebhookPayload;
  } catch {
    return error(c, 'INVALID_JSON', 'Body harus berupa JSON', 400);
  }

  if (
    typeof body !== 'object' ||
    body === null ||
    typeof body.event !== 'string' ||
    body.event.length === 0 ||
    typeof body.message !== 'string' ||
    body.message.length === 0 ||
    typeof body.source !== 'string' ||
    body.source.length === 0
  ) {
    return error(c, 'VALIDATION_ERROR', 'event, message, dan source wajib diisi', 422);
  }

  // Jangan blokir sender — alert dikirim fire-and-forget (sendExternalSecurityAlert
  // sudah punya throttle + cooldown internal dan tidak pernah throw).
  void sendExternalSecurityAlert({
    severity: normalizeSeverity(body.severity),
    event: body.event,
    message: body.message,
    source: body.source,
    ip: typeof body.ip === 'string' ? body.ip : null,
    metadata: body.metadata,
  });

  return success(c, { queued: true });
});

export { router as securityWebhookRouter };
