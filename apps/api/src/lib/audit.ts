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
  await db.insert(auditLogs).values({
    userId: params.userId,
    action: params.action,
    entity: params.entity,
    entityId: params.entityId,
    oldValue: params.oldValue ?? null,
    newValue: params.newValue ?? null,
    ipAddress: c.req.header('x-forwarded-for') ?? c.req.header('x-real-ip') ?? null,
    userAgent: c.req.header('user-agent') ?? null,
  });
}
