import type { Context } from 'hono';
import { db, auditLogs } from './db.ts';

export async function createAuditLog(
  c: Context,
  params: {
    userId: string;
    action: string;
    entity: string;
    entityId: string;
    oldValue?: Record<string, unknown> | null;
    newValue?: Record<string, unknown> | null;
  },
) {
  try {
    // Normalize IP: take the first IP if comma-separated, reject non-IP values
    let ip: string | null = c.req.header('x-forwarded-for') ?? c.req.header('x-real-ip') ?? null;
    if (ip) {
      ip = ip.split(',')[0]?.trim() ?? null;
      // Only pass valid-looking IPs (basic check for IPv4 or IPv6)
      if (ip && !/^(\d{1,3}\.){3}\d{1,3}$/.test(ip) && !/^[0-9a-f:]+$/i.test(ip)) {
        ip = null;
      }
    }

    await db.insert(auditLogs).values({
      userId: params.userId,
      action: params.action,
      entity: params.entity,
      entityId: params.entityId,
      oldValue: params.oldValue ?? null,
      newValue: params.newValue ?? null,
      ipAddress: ip,
      userAgent: c.req.header('user-agent') ?? null,
    });
  } catch {
    // Audit log is non-critical — never break the main operation
  }
}
