import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Task, type ListTasksRequest } from '@a2a-js/sdk';
import type { ServerCallContext } from '@a2a-js/sdk/server';
import { a2aTasks } from '@ahlipanggilan/database';
import type * as DrizzleORM from 'drizzle-orm';

const rows: unknown[] = [];
const mockDb = {
  insert: vi.fn(),
  select: vi.fn(),
  delete: vi.fn(),
};

vi.mock('drizzle-orm', async (importOriginal) => {
  const actual = await importOriginal<typeof DrizzleORM>();
  return {
    ...actual,
    eq: vi.fn((col: unknown, v: unknown) => ({ kind: 'eq', col, v })),
    isNull: vi.fn((col: unknown) => ({ kind: 'isNull', col })),
    gte: vi.fn((col: unknown, v: unknown) => ({ kind: 'gte', col, v })),
    and: vi.fn((...conds: unknown[]) => ({ kind: 'and', conds })),
  };
});
vi.mock('../db.ts', () => ({ db: mockDb }));

function chainableSelect() {
  const from = { where: vi.fn() };
  from.where.mockImplementation(() => {
    const chain = {
      limit: vi.fn(() => proxy),
      orderBy: vi.fn(() => proxy),
      offset: vi.fn(() => rows),
    };
    const proxy = new Proxy(chain, {
      get(target, prop) {
        if (prop === Symbol.iterator) return rows[Symbol.iterator].bind(rows);
        if (typeof prop === 'string' && /^\d+$/.test(prop)) return rows[Number(prop)];
        if (prop === 'length') return rows.length;
        return Reflect.get(target, prop);
      },
    });
    return proxy;
  });
  return { from: vi.fn().mockReturnValue(from) };
}

function makeContext(overrides?: Partial<ServerCallContext>): ServerCallContext {
  return {
    user: undefined,
    tenant: undefined,
    headers: {},
    requestedVersion: '1.0',
    ...overrides,
  } as unknown as ServerCallContext;
}

const USER_CTX = makeContext({
  user: { isAuthenticated: true, userName: 'cust-1' } as ServerCallContext['user'],
});
const ANON_CTX = makeContext();

beforeEach(() => {
  vi.clearAllMocks();
  rows.length = 0;
});

describe('PostgresTaskStore', () => {
  it('saves a task with owner scoping', async () => {
    const onConflict = vi.fn().mockResolvedValue(undefined);
    mockDb.insert.mockReturnValue({
      values: vi.fn().mockReturnValue({ onConflictDoUpdate: onConflict }),
    });
    const { PostgresTaskStore } = await import('./a2a-task-store.ts');
    const store = new PostgresTaskStore();
    const task = Task.fromJSON({
      id: 't-1',
      contextId: 'c-1',
      status: { state: 'TASK_STATE_SUBMITTED', timestamp: '2026-08-07T00:00:00Z' },
    } as never);

    await store.save(task, USER_CTX);

    expect(mockDb.insert).toHaveBeenCalledWith(a2aTasks);
    const values = mockDb.insert.mock.results[0]?.value.values.mock.calls[0]?.[0];
    expect(values.taskId).toBe('t-1');
    expect(values.userId).toBe('cust-1');
    expect(values.status).toBe('TASK_STATE_SUBMITTED');
  });

  it('loads a task within the owner scope', async () => {
    rows.push({
      taskId: 't-1',
      contextId: 'c-1',
      status: 'TASK_STATE_WORKING',
      task: {
        id: 't-1',
        contextId: 'c-1',
        status: { state: 2, timestamp: '2026-08-07T00:00:00Z' },
        history: [],
      },
      userId: 'cust-1',
    });
    mockDb.select.mockReturnValue(chainableSelect());
    const { PostgresTaskStore } = await import('./a2a-task-store.ts');
    const store = new PostgresTaskStore();

    const loaded = await store.load('t-1', USER_CTX);

    expect(loaded?.id).toBe('t-1');
    expect(loaded?.status?.state).toBe(2);
  });

  it('scopes loads to the caller: user load filters by user id, anonymous by null user', async () => {
    mockDb.select.mockReturnValue(chainableSelect());
    const { PostgresTaskStore } = await import('./a2a-task-store.ts');
    const store = new PostgresTaskStore();

    await store.load('t-x', USER_CTX);
    const userWhere =
      mockDb.select.mock.results[0]!.value.from.mock.results[0]!.value.where.mock.calls[0]![0];
    expect(userWhere.conds.map((c: { kind: string; col: unknown }) => c.kind)).toEqual([
      'eq',
      'eq',
    ]);
    expect(
      userWhere.conds.some(
        (c: { kind: string; col: unknown; v?: unknown }) =>
          c.kind === 'eq' && c.col === a2aTasks.userId && c.v === 'cust-1',
      ),
    ).toBe(true);

    await store.load('t-y', ANON_CTX);
    const anonWhere =
      mockDb.select.mock.results[1]!.value.from.mock.results[0]!.value.where.mock.calls[1]![0];
    expect(
      anonWhere.conds.some(
        (c: { kind: string; col: unknown }) => c.kind === 'isNull' && c.col === a2aTasks.userId,
      ),
    ).toBe(true);
    expect(
      anonWhere.conds.some(
        (c: { kind: string; col: unknown }) => c.kind === 'eq' && c.col === a2aTasks.userId,
      ),
    ).toBe(false);
  });

  it('lists tasks filtered by status and paginated', async () => {
    rows.push(
      {
        taskId: 't-1',
        contextId: 'c-1',
        status: 'TASK_STATE_COMPLETED',
        task: { id: 't-1', status: { state: 3, timestamp: '2026-08-07T00:00:00Z' }, history: [] },
        userId: 'cust-1',
      },
      {
        taskId: 't-2',
        contextId: 'c-1',
        status: 'TASK_STATE_FAILED',
        task: { id: 't-2', status: { state: 4, timestamp: '2026-08-07T00:00:00Z' }, history: [] },
        userId: 'cust-1',
      },
    );
    mockDb.select.mockReturnValue(chainableSelect());
    const { PostgresTaskStore } = await import('./a2a-task-store.ts');
    const store = new PostgresTaskStore();

    const req: ListTasksRequest = {
      tenant: '',
      contextId: 'c-1',
      status: 3,
      pageSize: 50,
      pageToken: '',
      statusTimestampAfter: '',
      historyLength: 0,
      includeArtifacts: false,
    };
    const res = await store.list(req, USER_CTX);

    expect(res.tasks.map((t) => t.id)).toEqual(['t-1', 't-2']);
    expect(res.totalSize).toBe(2);
    expect(res.nextPageToken).toBe('');
  });

  it('truncates history to historyLength when requested', async () => {
    const history = Array.from({ length: 10 }, (_, i) => ({
      messageId: `m-${i}`,
      contextId: 'c-1',
      taskId: 't-1',
      role: 'ROLE_USER',
      parts: [{ text: `msg ${i}` }],
    }));
    rows.push({
      taskId: 't-1',
      contextId: 'c-1',
      status: 'TASK_STATE_COMPLETED',
      task: { id: 't-1', status: { state: 3, timestamp: '2026-08-07T00:00:00Z' }, history },
      userId: 'cust-1',
    });
    mockDb.select.mockReturnValue(chainableSelect());
    const { PostgresTaskStore } = await import('./a2a-task-store.ts');
    const store = new PostgresTaskStore();

    const res = await store.list(
      {
        tenant: '',
        contextId: 'c-1',
        status: 0,
        pageSize: 50,
        pageToken: '',
        statusTimestampAfter: '',
        includeArtifacts: false,
        historyLength: 2,
      },
      USER_CTX,
    );

    expect(res.tasks[0]?.history.length).toBe(2);
    expect(res.tasks[0]?.history[0]?.messageId).toBe('m-8');
  });
});
