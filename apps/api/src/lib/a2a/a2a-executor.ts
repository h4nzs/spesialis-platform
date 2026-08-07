import {
  Message,
  Role,
  Task,
  TaskState,
  TaskStatusUpdateEvent,
  type TaskStatus,
} from '@a2a-js/sdk';
import {
  AgentEvent,
  type AgentExecutor,
  type ExecutionEventBus,
  type RequestContext,
  type ServerCallContext,
  STATE_HEADERS_KEY,
} from '@a2a-js/sdk/server';
import { runLlmConversation, llmAvailable } from './a2a-llm.ts';
import { answerWithRules } from './a2a-rule-router.ts';

const MAX_HISTORY = 20;

function extractText(message: Message): string {
  return message.parts
    .map((p) => (p.content?.$case === 'text' ? p.content.value : ''))
    .join(' ')
    .trim();
}

function buildMessage(text: string, contextId: string, taskId: string, role: string): Message {
  return Message.fromJSON({
    messageId: crypto.randomUUID(),
    contextId,
    taskId,
    role,
    parts: [{ text }],
  } as never) as unknown as Message;
}

function buildTask(id: string, contextId: string, state: string): Task {
  return Task.fromJSON({
    id,
    contextId,
    status: { state, timestamp: new Date().toISOString() },
    artifacts: [],
    history: [],
    metadata: {},
  } as never) as unknown as Task;
}

function statusUpdate(taskId: string, state: string, message?: Message): TaskStatusUpdateEvent {
  return TaskStatusUpdateEvent.fromJSON({
    taskId,
    status: {
      state,
      message: message ? JSON.parse(JSON.stringify(Message.toJSON(message))) : undefined,
      timestamp: new Date().toISOString(),
    },
  } as never) as unknown as TaskStatusUpdateEvent;
}

function authTokenFromContext(context: ServerCallContext): string | undefined {
  const headers = context.state?.get(STATE_HEADERS_KEY) as
    Record<string, string | string[] | undefined> | undefined;
  const raw = headers?.['authorization'] ?? headers?.['Authorization'];
  const value = Array.isArray(raw) ? raw[0] : raw;
  return value?.startsWith('Bearer ') ? value.slice(7).trim() : undefined;
}

/**
 * Hybrid agent brain: LLM (Gemini, function calling) when GEMINI_API_KEY is
 * configured, deterministic rule router otherwise. Publishes task/status/
 * message events on the bus — DefaultRequestHandler serializes them for
 * both blocking and SSE (SendStreamingMessage) paths.
 */
export class PlatformAgentExecutor implements AgentExecutor {
  async execute(requestContext: RequestContext, eventBus: ExecutionEventBus): Promise<void> {
    const { contextId, taskId } = requestContext;
    const userMessage = requestContext.userMessage;
    const userText = extractText(userMessage);
    const authToken = authTokenFromContext(requestContext.context);

    const history: Array<{ role: 'user' | 'assistant'; text: string }> = [];
    for (const m of [...(requestContext.task?.history ?? []), userMessage].slice(-MAX_HISTORY)) {
      const t = extractText(m);
      if (!t) continue;
      history.push({ role: m.role === Role.ROLE_USER ? 'user' : 'assistant', text: t });
    }

    const task = requestContext.task ?? buildTask(taskId, contextId, 'TASK_STATE_SUBMITTED');
    const ensureStatus = (): TaskStatus => {
      if (!task.status) {
        task.status = {
          state: TaskState.TASK_STATE_SUBMITTED,
          message: undefined,
          timestamp: new Date().toISOString(),
        } as TaskStatus;
      }
      return task.status;
    };
    const status = ensureStatus();
    status.state = TaskState.TASK_STATE_WORKING;
    status.timestamp = new Date().toISOString();
    task.history = [...(task.history ?? []), userMessage];
    eventBus.publish(AgentEvent.task(task));
    eventBus.publish(AgentEvent.statusUpdate(statusUpdate(taskId, 'TASK_STATE_WORKING')));

    let answer: string;
    let toolUsed = false;
    try {
      if (llmAvailable()) {
        const turn = await runLlmConversation(history, authToken);
        answer = turn.text ?? '';
      } else {
        const result = await answerWithRules(userText);
        answer = result.text;
        toolUsed = Boolean(result.tool);
      }
    } catch {
      if (llmAvailable()) {
        const result = await answerWithRules(userText).catch(() => null);
        answer =
          result?.text ??
          'Maaf, saya sedang bermasalah teknis. Silakan coba lagi atau hubungi https://ahlipanggilan.id/kontak.';
        toolUsed = Boolean(result?.tool);
      } else {
        answer = 'Maaf, terjadi kesalahan internal. Silakan coba lagi nanti.';
      }
    }

    void toolUsed;
    const assistantMessage = buildMessage(answer, contextId, taskId, 'ROLE_AGENT');
    task.history = [...(task.history ?? []), assistantMessage];
    const finalStatus = ensureStatus();
    finalStatus.state = TaskState.TASK_STATE_COMPLETED;
    finalStatus.timestamp = new Date().toISOString();
    eventBus.publish(AgentEvent.message(assistantMessage));
    eventBus.publish(AgentEvent.statusUpdate(statusUpdate(taskId, 'TASK_STATE_COMPLETED')));
    eventBus.publish(AgentEvent.task(task));
  }

  async cancelTask(taskId: string, eventBus: ExecutionEventBus): Promise<void> {
    eventBus.publish(AgentEvent.statusUpdate(statusUpdate(taskId, 'TASK_STATE_CANCELED')));
    eventBus.publish(AgentEvent.task(buildTask(taskId, taskId, 'TASK_STATE_CANCELED')));
  }
}
