import { Hono, type Context } from 'hono';
import { stream } from 'hono/streaming';
import {
  AgentCard,
  CancelTaskRequest,
  DeleteTaskPushNotificationConfigRequest,
  GetExtendedAgentCardRequest,
  GetTaskPushNotificationConfigRequest,
  GetTaskRequest,
  ListTaskPushNotificationConfigsRequest,
  ListTaskPushNotificationConfigsResponse,
  ListTasksRequest,
  ListTasksResponse,
  Message,
  SendMessageRequest,
  StreamResponse,
  SubscribeToTaskRequest,
  Task,
  TaskPushNotificationConfig,
} from '@a2a-js/sdk';
import { defaultServerCallContextBuilder } from '@a2a-js/sdk/server';
import type { ServerCallContext } from '@a2a-js/sdk/server';
import {
  A2A_ERROR_CODE,
  isJsonRpcError,
  JsonRpcRequestMalformedError,
  JsonRpcVersionNotSupportedError,
} from '@a2a-js/sdk/errors';
import { createA2A } from '../lib/a2a/index.ts';
import { buildA2AUser } from '../lib/a2a/a2a-security.ts';
import { rateLimit } from '../middleware/rate-limiter.ts';

const a2a = createA2A();

const SUPPORTED_VERSION = '1.0';

function headersToRecord(headers: Headers): Record<string, string | string[] | undefined> {
  const record: Record<string, string> = {};
  headers.forEach((value, key) => {
    record[key] = value;
  });
  return record;
}

async function buildContext(
  headers: Headers,
  requestedVersion: string | undefined,
  tenant?: string,
): Promise<ServerCallContext> {
  const user = await buildA2AUser(headersToRecord(headers));
  return defaultServerCallContextBuilder({
    extensions: undefined,
    user,
    headers: headersToRecord(headers),
    requestedVersion,
    tenant,
  });
}

/** Version negotiation per §3.6: absent header means 0.3 (unsupported here). */
function assertVersionSupported(
  requestedVersion: string | undefined,
  binding: 'JSONRPC' | 'HTTP+JSON',
): void {
  const version = (requestedVersion ?? '').trim() || '0.3';
  const [major, minor = '0'] = version.split('.');
  const ok = major === SUPPORTED_VERSION.split('.')[0] && minor === SUPPORTED_VERSION.split('.')[1];
  if (!ok) {
    throw new JsonRpcVersionNotSupportedError({
      message: `The requested A2A protocol version '${version}' is not supported. Supported versions: ${SUPPORTED_VERSION}`,
    });
  }
  void binding;
}

function mapJsonRpcError(err: unknown): { code: number; message: string; data?: unknown } {
  if (isJsonRpcError(err)) {
    return {
      code: err.envelopeCode ?? A2A_ERROR_CODE.INTERNAL_ERROR,
      message: err.message || 'Internal error',
      ...(err.data !== undefined ? { data: err.data } : {}),
    };
  }
  const message = err instanceof Error ? err.message : String(err);
  return { code: A2A_ERROR_CODE.INTERNAL_ERROR, message: message || 'Internal error' };
}

function rpcError(id: unknown, code: number, message: string): Record<string, unknown> {
  return { jsonrpc: '2.0', id: id ?? null, error: { code, message } };
}

function sseEvent(event: unknown): string {
  return `data: ${JSON.stringify(event)}\n\n`;
}

/** Streams an A2A event generator as Server-Sent Events. */
function sseStream(c: Context, events: AsyncGenerator<unknown, void, undefined>): Response {
  c.header('Content-Type', 'text/event-stream');
  c.header('Cache-Control', 'no-cache');
  c.header('Connection', 'keep-alive');
  return stream(c, async (s) => {
    try {
      for await (const event of events) {
        s.write(sseEvent(event));
      }
    } catch (err) {
      s.write(`event: error\ndata: ${JSON.stringify(mapJsonRpcError(err))}\n\n`);
    }
  });
}

async function handleJsonRpc(c: Context, bodyText: string): Promise<Response> {
  // Agent responses are session-dependent — never cache them at any layer
  // (SSE paths below override this with the weaker no-cache they need).
  c.header('Cache-Control', 'no-store');
  const headers = c.req.raw.headers;
  let parsed: Record<string, unknown>;
  try {
    parsed = JSON.parse(bodyText) as Record<string, unknown>;
  } catch {
    return Response.json(rpcError(null, A2A_ERROR_CODE.PARSE_ERROR, 'Parse error'), {
      status: 200,
    });
  }

  if (
    typeof parsed !== 'object' ||
    parsed === null ||
    parsed.jsonrpc !== '2.0' ||
    typeof parsed.method !== 'string'
  ) {
    return Response.json(
      rpcError(parsed?.id ?? null, A2A_ERROR_CODE.INVALID_REQUEST, 'Invalid Request'),
      {
        status: 200,
      },
    );
  }

  const { method, id } = parsed;
  const params = (parsed.params ?? {}) as Record<string, unknown>;
  try {
    if (method !== 'GetExtendedAgentCard' && (typeof params !== 'object' || params === null)) {
      throw new JsonRpcRequestMalformedError({ message: 'Invalid method parameters.' });
    }
    const context = await buildContext(
      headers,
      headers.get('A2A-Version') ?? undefined,
      (params.tenant as string) ?? undefined,
    );

    if (method === 'SendStreamingMessage' || method === 'SubscribeToTask') {
      if (!a2a.agentCard.capabilities?.streaming) {
        return Response.json(
          rpcError(
            id,
            A2A_ERROR_CODE.UNSUPPORTED_OPERATION,
            'Method requires streaming capability.',
          ),
          {
            status: 200,
          },
        );
      }
      const agentEventStream =
        method === 'SendStreamingMessage'
          ? a2a.handler.sendMessageStream(SendMessageRequest.fromJSON(params), context)
          : a2a.handler.resubscribe(SubscribeToTaskRequest.fromJSON(params), context);

      return sseStream(
        c,
        (async function* () {
          for await (const event of agentEventStream) {
            yield { jsonrpc: '2.0', id, result: StreamResponse.toJSON(event) };
          }
        })(),
      );
    }

    let result: unknown;
    switch (method) {
      case 'GetAgentCard':
        result = AgentCard.toJSON(await a2a.handler.getAgentCard());
        break;
      case 'SendMessage': {
        const messageOrTask = await a2a.handler.sendMessage(
          SendMessageRequest.fromJSON(params),
          context,
        );
        result =
          'messageId' in (messageOrTask as Message)
            ? { message: Message.toJSON(messageOrTask as Message) }
            : { task: Task.toJSON(messageOrTask as Task) };
        break;
      }
      case 'GetTask':
        result = Task.toJSON(await a2a.handler.getTask(GetTaskRequest.fromJSON(params), context));
        break;
      case 'ListTasks': {
        const list = await a2a.handler.listTasks(ListTasksRequest.fromJSON(params), context);
        result = ListTasksResponse.toJSON(list);
        break;
      }
      case 'CancelTask':
        result = Task.toJSON(
          await a2a.handler.cancelTask(CancelTaskRequest.fromJSON(params), context),
        );
        break;
      case 'CreateTaskPushNotificationConfig':
        result = TaskPushNotificationConfig.toJSON(
          await a2a.handler.createTaskPushNotificationConfig(
            TaskPushNotificationConfig.fromJSON(params),
            context,
          ),
        );
        break;
      case 'GetTaskPushNotificationConfig':
        result = TaskPushNotificationConfig.toJSON(
          await a2a.handler.getTaskPushNotificationConfig(
            GetTaskPushNotificationConfigRequest.fromJSON(params),
            context,
          ),
        );
        break;
      case 'DeleteTaskPushNotificationConfig':
        await a2a.handler.deleteTaskPushNotificationConfig(
          DeleteTaskPushNotificationConfigRequest.fromJSON(params),
          context,
        );
        result = null;
        break;
      case 'ListTaskPushNotificationConfigs':
        result = ListTaskPushNotificationConfigsResponse.toJSON(
          await a2a.handler.listTaskPushNotificationConfigs(
            ListTaskPushNotificationConfigsRequest.fromJSON(params),
            context,
          ),
        );
        break;
      case 'GetExtendedAgentCard':
        result = AgentCard.toJSON(
          await a2a.handler.getAuthenticatedExtendedAgentCard(
            GetExtendedAgentCardRequest.fromJSON(params),
            context,
          ),
        );
        break;
      default:
        return Response.json(rpcError(id, A2A_ERROR_CODE.METHOD_NOT_FOUND, 'Invalid method.'), {
          status: 200,
        });
    }
    return Response.json({ jsonrpc: '2.0', id, result });
  } catch (err) {
    return Response.json(rpcError(id, mapJsonRpcError(err).code, mapJsonRpcError(err).message), {
      status: 200,
    });
  }
}

export const a2aRouter = new Hono();

// Server-to-server protocol: no browser Origin — bypass the CSRF middleware
// on the parent router; rate limit is applied here explicitly.
a2aRouter.use('*', rateLimit(30, 60_000));

a2aRouter.post('/', async (c) => {
  const body = await c.req.text();
  return handleJsonRpc(c, body);
});

// ── REST (HTTP+JSON) binding, §11 ────────────────────────────────────
const rest = new Hono();

rest.post('/v1/message:send', async (c) => {
  const context = await buildContext(c.req.raw.headers, c.req.header('A2A-Version') ?? undefined);
  assertVersionSupported(c.req.header('A2A-Version') ?? undefined, 'HTTP+JSON');
  try {
    const result = await a2a.handler.sendMessage(
      SendMessageRequest.fromJSON(await c.req.json()),
      context,
    );
    const body =
      'messageId' in (result as Message)
        ? { message: Message.toJSON(result as Message) }
        : { task: Task.toJSON(result as Task) };
    return c.json(body, 201);
  } catch (err) {
    return c.json(mapJsonRpcError(err), 400);
  }
});

rest.post('/v1/message:stream', async (c) => {
  const context = await buildContext(c.req.raw.headers, c.req.header('A2A-Version') ?? undefined);
  assertVersionSupported(c.req.header('A2A-Version') ?? undefined, 'HTTP+JSON');
  const agentEventStream = a2a.handler.sendMessageStream(
    SendMessageRequest.fromJSON(await c.req.json()),
    context,
  );
  return sseStream(
    c,
    (async function* () {
      for await (const event of agentEventStream) {
        yield StreamResponse.toJSON(event);
      }
    })(),
  );
});

rest.post('/v1/tasks/:taskId:cancel', async (c) => {
  const context = await buildContext(c.req.raw.headers, c.req.header('A2A-Version') ?? undefined);
  try {
    const task = await a2a.handler.cancelTask(
      CancelTaskRequest.fromJSON({ id: c.req.param('taskId') }),
      context,
    );
    return c.json(Task.toJSON(task), 200);
  } catch (err) {
    return c.json(mapJsonRpcError(err), 400);
  }
});

const resubscribe = async (c: Context) => {
  const context = await buildContext(c.req.raw.headers, c.req.header('A2A-Version') ?? undefined);
  const agentEventStream = a2a.handler.resubscribe(
    SubscribeToTaskRequest.fromJSON({ id: c.req.param('taskId') }),
    context,
  );
  return sseStream(
    c,
    (async function* () {
      for await (const event of agentEventStream) {
        yield StreamResponse.toJSON(event);
      }
    })(),
  );
};

rest.get('/v1/tasks/:taskId:subscribe', resubscribe);
rest.post('/v1/tasks/:taskId:subscribe', resubscribe);

rest.get('/v1/tasks/:taskId', async (c) => {
  const context = await buildContext(c.req.raw.headers, c.req.header('A2A-Version') ?? undefined);
  c.header('Cache-Control', 'no-store');
  try {
    const historyLength = c.req.query('historyLength') ?? c.req.query('history_length');
    const task = await a2a.handler.getTask(
      GetTaskRequest.fromJSON({
        id: c.req.param('taskId'),
        ...(historyLength ? { historyLength: Number(historyLength) } : {}),
      }),
      context,
    );
    return c.json(Task.toJSON(task), 200);
  } catch (err) {
    return c.json(mapJsonRpcError(err), 404);
  }
});

rest.post('/v1/tasks/:taskId/pushNotificationConfigs', async (c) => {
  const context = await buildContext(c.req.raw.headers, c.req.header('A2A-Version') ?? undefined);
  try {
    const config = await a2a.handler.createTaskPushNotificationConfig(
      TaskPushNotificationConfig.fromJSON(await c.req.json()),
      context,
    );
    return c.json(TaskPushNotificationConfig.toJSON(config), 201);
  } catch (err) {
    return c.json(mapJsonRpcError(err), 400);
  }
});

rest.get('/v1/tasks/:taskId/pushNotificationConfigs', async (c) => {
  const context = await buildContext(c.req.raw.headers, c.req.header('A2A-Version') ?? undefined);
  c.header('Cache-Control', 'no-store');
  try {
    const result = await a2a.handler.listTaskPushNotificationConfigs(
      ListTaskPushNotificationConfigsRequest.fromJSON({ taskId: c.req.param('taskId') }),
      context,
    );
    return c.json(ListTaskPushNotificationConfigsResponse.toJSON(result), 200);
  } catch (err) {
    return c.json(mapJsonRpcError(err), 400);
  }
});

rest.get('/v1/tasks/:taskId/pushNotificationConfigs/:configId', async (c) => {
  const context = await buildContext(c.req.raw.headers, c.req.header('A2A-Version') ?? undefined);
  c.header('Cache-Control', 'no-store');
  try {
    const config = await a2a.handler.getTaskPushNotificationConfig(
      GetTaskPushNotificationConfigRequest.fromJSON({
        taskId: c.req.param('taskId'),
        id: c.req.param('configId'),
      }),
      context,
    );
    return c.json(TaskPushNotificationConfig.toJSON(config), 200);
  } catch (err) {
    return c.json(mapJsonRpcError(err), 404);
  }
});

rest.delete('/v1/tasks/:taskId/pushNotificationConfigs/:configId', async (c) => {
  const context = await buildContext(c.req.raw.headers, c.req.header('A2A-Version') ?? undefined);
  try {
    await a2a.handler.deleteTaskPushNotificationConfig(
      DeleteTaskPushNotificationConfigRequest.fromJSON({
        taskId: c.req.param('taskId'),
        id: c.req.param('configId'),
      }),
      context,
    );
    return c.body(null, 204);
  } catch (err) {
    return c.json(mapJsonRpcError(err), 400);
  }
});

rest.get('/v1/card', async (c) => {
  const card = await a2a.handler.getAgentCard();
  c.header('Cache-Control', 'no-store');
  return c.json(AgentCard.toJSON(card), 200);
});

a2aRouter.route('/rest', rest);
