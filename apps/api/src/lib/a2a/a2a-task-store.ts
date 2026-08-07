import { and, eq, gte, isNull } from 'drizzle-orm';
import {
  Task,
  TaskState,
  taskStateFromJSON,
  taskStateToJSON,
  type ListTasksRequest,
  type ListTasksResponse,
} from '@a2a-js/sdk';
import { type ServerCallContext, type TaskStore } from '@a2a-js/sdk/server';
import { db } from '../db.ts';
import { a2aTasks } from '@ahlipanggilan/database';

function ownerId(context: ServerCallContext): string | null {
  return context.user?.isAuthenticated ? context.user.userName : null;
}

function scope(owner: string | null) {
  return owner ? eq(a2aTasks.userId, owner) : isNull(a2aTasks.userId);
}

/** Convert stored status string back to a full Task object. */
function taskFromRow(row: { task: unknown; status: string }): Task {
  const task = Task.fromJSON(row.task);
  if (task.status) {
    task.status.state = taskStateFromJSON(row.status);
  }
  return task;
}

/**
 * PostgreSQL-backed TaskStore implementing the A2A SDK contract.
 * Tasks are scoped to the authenticated caller (or anonymous tasks when
 * no Bearer token was presented), so clients only ever see their own work.
 */
export class PostgresTaskStore implements TaskStore {
  async save(task: Task, context: ServerCallContext): Promise<void> {
    await db
      .insert(a2aTasks)
      .values({
        taskId: task.id,
        contextId: task.contextId,
        status: taskStateToJSON(task.status?.state ?? TaskState.TASK_STATE_SUBMITTED),
        task: Task.toJSON(task) as unknown as object,
        userId: ownerId(context),
        tenant: context.tenant ?? null,
      })
      .onConflictDoUpdate({
        target: a2aTasks.taskId,
        set: {
          status: taskStateToJSON(task.status?.state ?? TaskState.TASK_STATE_SUBMITTED),
          task: Task.toJSON(task) as unknown as object,
          updatedAt: new Date(),
        },
      });
  }

  async load(taskId: string, context: ServerCallContext): Promise<Task | undefined> {
    const owner = ownerId(context);
    const rows = await db
      .select()
      .from(a2aTasks)
      .where(and(eq(a2aTasks.taskId, taskId), scope(owner)))
      .limit(1);
    const row = rows[0];
    if (!row) return undefined;
    return taskFromRow(row);
  }

  async list(params: ListTasksRequest, context: ServerCallContext): Promise<ListTasksResponse> {
    const owner = ownerId(context);
    const conditions = [scope(owner)];
    if (params.contextId) conditions.push(eq(a2aTasks.contextId, params.contextId));
    if (params.status) {
      conditions.push(eq(a2aTasks.status, taskStateToJSON(params.status)));
    }
    if (params.statusTimestampAfter) {
      conditions.push(gte(a2aTasks.updatedAt, new Date(params.statusTimestampAfter)));
    }

    const pageSize = Math.min(Math.max(params.pageSize ?? 50, 1), 100);
    const offset = params.pageToken ? Number.parseInt(params.pageToken, 10) || 0 : 0;

    const rows = await db
      .select()
      .from(a2aTasks)
      .where(and(...conditions))
      .orderBy(a2aTasks.createdAt)
      .limit(pageSize + 1)
      .offset(offset);

    const hasMore = rows.length > pageSize;
    const page = hasMore ? rows.slice(0, pageSize) : rows;

    const countRows = await db
      .select({ count: a2aTasks.taskId })
      .from(a2aTasks)
      .where(and(...conditions));

    const tasks = page.map(taskFromRow);
    if (!params.includeArtifacts) {
      for (const t of tasks) t.artifacts = [];
    }
    const historyLength = params.historyLength ?? 50;
    for (const t of tasks) {
      if (historyLength > 0 && t.history.length > historyLength) {
        t.history = t.history.slice(-historyLength);
      }
    }

    return {
      tasks,
      nextPageToken: hasMore ? String(offset + pageSize) : '',
      pageSize,
      totalSize: countRows.length,
    };
  }
}
