import { describe, it, expect, vi, beforeEach } from 'vitest';

// ── Mock Redis instance ─────────────────────────────────────────

const mockPublish = vi.fn();
const mockSubscribe = vi.fn();
const mockOn = vi.fn();
const mockUnsubscribe = vi.fn();

const messageCallbacks: Array<(channel: string, message: string) => void> = [];

mockOn.mockImplementation((event: string, cb: (...args: unknown[]) => void) => {
  if (event === 'message') {
    messageCallbacks.push(cb as (channel: string, message: string) => void);
  }
});

const mockRedisInstance = {
  publish: mockPublish,
  subscribe: mockSubscribe,
  on: mockOn,
  unsubscribe: mockUnsubscribe,
};

// ── Mock redis.ts module ────────────────────────────────────────

const mockGetRedis = vi.fn();

vi.mock('./redis.ts', () => ({
  getRedis: mockGetRedis,
}));

// ── Helpers ─────────────────────────────────────────────────────

function triggerMessage(channel: string, message: string) {
  // Fire semua 'message' callback (biasanya hanya 1, tapi defensif)
  for (const cb of messageCallbacks) {
    cb(channel, message);
  }
}

beforeEach(() => {
  vi.clearAllMocks();
  vi.resetModules();
  messageCallbacks.length = 0;

  // Default mock behavior: Redis available
  mockGetRedis.mockReturnValue(mockRedisInstance);

  // Default subscribe callback: success (no error)
  mockSubscribe.mockImplementation((_channel: string, cb: (err: Error | null) => void) => {
    cb(null);
  });

  // Default publish: resolves to 1 (number of subscribers)
  mockPublish.mockResolvedValue(1);
});

// ── Tests: publishLockEvent ─────────────────────────────────────

describe('publishLockEvent', () => {
  it('publishes event to Redis channel as JSON', async () => {
    const { publishLockEvent } = await import('./lock-pubsub.ts');
    const event = {
      type: 'acquired' as const,
      resourceType: 'article',
      resourceId: 'uuid-123',
      lockedBy: 'user-1',
      lockedByEmail: 'admin@test.com',
    };

    publishLockEvent(event);

    expect(mockGetRedis).toHaveBeenCalled();
    expect(mockPublish).toHaveBeenCalledWith('lock:events', JSON.stringify(event));
  });

  it('publishes released event correctly', async () => {
    const { publishLockEvent } = await import('./lock-pubsub.ts');
    const event = {
      type: 'released' as const,
      resourceType: 'faq',
      resourceId: 'uuid-faq',
    };

    publishLockEvent(event);

    expect(mockPublish).toHaveBeenCalledWith('lock:events', JSON.stringify(event));
  });

  it('publishes takeover event with lockedByEmail', async () => {
    const { publishLockEvent } = await import('./lock-pubsub.ts');
    const event = {
      type: 'takeover' as const,
      resourceType: 'cms_page',
      resourceId: 'uuid-page',
      lockedBy: 'user-2',
      lockedByEmail: 'admin2@test.com',
    };

    publishLockEvent(event);

    expect(mockPublish).toHaveBeenCalledWith('lock:events', JSON.stringify(event));
  });

  it('is no-op when getRedis returns null', async () => {
    mockGetRedis.mockReturnValue(null);

    const { publishLockEvent } = await import('./lock-pubsub.ts');
    publishLockEvent({
      type: 'acquired',
      resourceType: 'article',
      resourceId: 'uuid',
    });

    expect(mockPublish).not.toHaveBeenCalled();
  });

  it('does not throw when redis.publish rejects', async () => {
    mockPublish.mockRejectedValue(new Error('connection lost'));

    const { publishLockEvent } = await import('./lock-pubsub.ts');

    expect(() => {
      publishLockEvent({
        type: 'acquired',
        resourceType: 'article',
        resourceId: 'uuid',
      });
    }).not.toThrow();
  });
});

// ── Tests: subscribeLockEvents ─────────────────────────────────

describe('subscribeLockEvents', () => {
  it('subscribes to Redis channel and registers handler', async () => {
    const { subscribeLockEvents } = await import('./lock-pubsub.ts');
    const handler = vi.fn();

    const unsub = subscribeLockEvents(handler);

    expect(mockGetRedis).toHaveBeenCalled();
    expect(mockSubscribe).toHaveBeenCalledWith('lock:events', expect.any(Function));
    expect(handler).not.toHaveBeenCalled();

    // Cleanup
    unsub();
  });

  it('dispatches received message to handler', async () => {
    const { subscribeLockEvents } = await import('./lock-pubsub.ts');
    const handler = vi.fn();

    subscribeLockEvents(handler);

    const event = {
      type: 'acquired' as const,
      resourceType: 'article',
      resourceId: 'uuid-1',
      lockedBy: 'user-1',
      lockedByEmail: 'user@test.com',
    };
    triggerMessage('lock:events', JSON.stringify(event));

    expect(handler).toHaveBeenCalledTimes(1);
    expect(handler).toHaveBeenCalledWith(event);
  });

  it('dispatches to all subscribers', async () => {
    const { subscribeLockEvents } = await import('./lock-pubsub.ts');
    const handler1 = vi.fn();
    const handler2 = vi.fn();

    subscribeLockEvents(handler1);
    subscribeLockEvents(handler2);

    const event = { type: 'released' as const, resourceType: 'faq', resourceId: 'uuid-2' };
    triggerMessage('lock:events', JSON.stringify(event));

    expect(handler1).toHaveBeenCalledWith(event);
    expect(handler2).toHaveBeenCalledWith(event);
  });

  it('stops dispatching to unsubscribed handler', async () => {
    const { subscribeLockEvents } = await import('./lock-pubsub.ts');
    const handler = vi.fn();

    const unsub = subscribeLockEvents(handler);
    unsub();

    triggerMessage(
      'lock:events',
      JSON.stringify({ type: 'acquired', resourceType: 'article', resourceId: 'uuid' }),
    );

    expect(handler).not.toHaveBeenCalled();
  });

  it('other handlers still receive event when one throws', async () => {
    const { subscribeLockEvents } = await import('./lock-pubsub.ts');
    const handler1 = vi.fn(() => {
      throw new Error('handler error');
    });
    const handler2 = vi.fn();

    subscribeLockEvents(handler1);
    subscribeLockEvents(handler2);

    triggerMessage(
      'lock:events',
      JSON.stringify({ type: 'acquired', resourceType: 'article', resourceId: 'uuid' }),
    );

    expect(handler1).toHaveBeenCalled();
    expect(handler2).toHaveBeenCalled();
  });

  it('ignores invalid JSON messages', async () => {
    const { subscribeLockEvents } = await import('./lock-pubsub.ts');
    const handler = vi.fn();

    subscribeLockEvents(handler);
    triggerMessage('lock:events', 'not valid json');

    expect(handler).not.toHaveBeenCalled();
  });

  it('ignores messages from different Redis channel', async () => {
    const { subscribeLockEvents } = await import('./lock-pubsub.ts');
    const handler = vi.fn();

    subscribeLockEvents(handler);
    triggerMessage(
      'other:channel',
      JSON.stringify({ type: 'acquired', resourceType: 'article', resourceId: 'uuid' }),
    );

    expect(handler).not.toHaveBeenCalled();
  });

  it('does not subscribe to Redis again when already subscribed', async () => {
    const { subscribeLockEvents } = await import('./lock-pubsub.ts');

    // First subscribe triggers ensureSubscribed
    subscribeLockEvents(vi.fn());
    expect(mockSubscribe).toHaveBeenCalledTimes(1);

    mockSubscribe.mockClear();
    // Second subscribe should NOT call redis.subscribe again
    subscribeLockEvents(vi.fn());

    expect(mockSubscribe).not.toHaveBeenCalled();
  });

  it('is no-op when getRedis returns null', async () => {
    mockGetRedis.mockReturnValue(null);

    const { subscribeLockEvents } = await import('./lock-pubsub.ts');
    const handler = vi.fn();

    const unsub = subscribeLockEvents(handler);
    // No error — handler is registered but no Redis subscription

    // Cleanup
    unsub();
  });

  it('subscribe callback stores error and resets sharedSubscriber', async () => {
    // Make subscribe fail
    mockSubscribe.mockImplementation((_channel: string, cb: (err: Error | null) => void) => {
      cb(new Error('subscribe failed'));
    });

    const { subscribeLockEvents } = await import('./lock-pubsub.ts');
    const handler = vi.fn();

    subscribeLockEvents(handler);

    // Handler should still be registered, but no messages will arrive
    // because sharedSubscriber was set to null
    expect(handler).not.toHaveBeenCalled();
  });

  it('retries subscribe after previous failure', async () => {
    let fail = true;
    mockSubscribe.mockImplementation((_channel: string, cb: (err: Error | null) => void) => {
      cb(fail ? new Error('subscribe failed') : null);
    });

    const { subscribeLockEvents } = await import('./lock-pubsub.ts');

    // First subscribe — fails
    subscribeLockEvents(vi.fn());
    expect(mockSubscribe).toHaveBeenCalledTimes(1);

    mockSubscribe.mockClear();
    fail = false;

    // Second subscribe — should retry because subscribed is still false
    subscribeLockEvents(vi.fn());
    expect(mockSubscribe).toHaveBeenCalledTimes(1);
  });
});
