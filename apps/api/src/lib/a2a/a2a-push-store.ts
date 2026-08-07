import { and, eq, isNull } from 'drizzle-orm';
import { TaskPushNotificationConfig } from '@a2a-js/sdk';
import {
  type PushNotificationStore,
  type ServerCallContext,
  type StoredPushNotificationConfig,
} from '@a2a-js/sdk/server';
import { db } from '../db.ts';
import { a2aPushConfigs } from '@ahlipanggilan/database';

const WIRE_VERSION = '1.0';

function ownerCondition(context: ServerCallContext) {
  const userId = context.user?.isAuthenticated ? context.user.userName : null;
  return userId ? eq(a2aPushConfigs.tenant, userId) : isNull(a2aPushConfigs.tenant);
}

/**
 * PostgreSQL-backed push notification config store (A2A v1.0).
 * Each task has at most one webhook config; the caller's identity is
 * encoded in the tenant column so configs are owner-scoped.
 */
export class PostgresPushNotificationStore implements PushNotificationStore {
  async save(
    taskId: string,
    context: ServerCallContext,
    pushNotificationConfig: TaskPushNotificationConfig,
  ): Promise<void> {
    if (!pushNotificationConfig.id) {
      pushNotificationConfig.id = crypto.randomUUID();
    }
    const serialized = TaskPushNotificationConfig.toJSON(pushNotificationConfig) as Record<
      string,
      unknown
    >;
    const authentication = serialized.authentication as object | null | undefined;
    await db
      .insert(a2aPushConfigs)
      .values({
        configId: pushNotificationConfig.id,
        taskId,
        url: pushNotificationConfig.url,
        token: pushNotificationConfig.token || null,
        authentication: authentication ?? null,
        tenant: context.user?.isAuthenticated ? context.user.userName : null,
      })
      .onConflictDoUpdate({
        target: a2aPushConfigs.taskId,
        set: {
          url: pushNotificationConfig.url,
          token: pushNotificationConfig.token || null,
          authentication: authentication ?? null,
        },
      });
  }

  async load(taskId: string, context: ServerCallContext): Promise<TaskPushNotificationConfig[]> {
    const configs = await this._loadAll(taskId, context);
    return configs.map((c) => c.config);
  }

  async loadWithMetadata(
    taskId: string,
    context: ServerCallContext,
  ): Promise<StoredPushNotificationConfig[]> {
    return this._loadAll(taskId, context);
  }

  async delete(taskId: string, context: ServerCallContext, configId?: string): Promise<void> {
    const conditions = [eq(a2aPushConfigs.taskId, taskId), ownerCondition(context)];
    if (configId) conditions.push(eq(a2aPushConfigs.configId, configId));
    await db.delete(a2aPushConfigs).where(and(...conditions));
  }

  private async _loadAll(
    taskId: string,
    context: ServerCallContext,
  ): Promise<StoredPushNotificationConfig[]> {
    const rows = await db
      .select()
      .from(a2aPushConfigs)
      .where(and(eq(a2aPushConfigs.taskId, taskId), ownerCondition(context)));
    return rows.map((row) => ({
      config: TaskPushNotificationConfig.fromJSON({
        id: row.configId,
        taskId: row.taskId,
        url: row.url,
        token: row.token ?? '',
        authentication: row.authentication,
      }),
      wireVersion: WIRE_VERSION,
    }));
  }
}
