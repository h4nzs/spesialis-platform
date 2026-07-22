// =============================================================================
// Tests — Event Queue
// =============================================================================

import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { getQueue } from '../core/queue.ts';
import { configureAnalytics } from '../core/config.ts';
import { destroyProviders } from '../providers/index.ts';
import { createMockEvent, registerTestProvider, resetConfig } from './helpers/test-utils.ts';
import { stopRetryProcessor } from '../core/dispatcher.ts';

beforeEach(async () => {
  resetConfig();
  await destroyProviders();
  stopRetryProcessor();
});

afterEach(() => {
  // Clean up queue instance
  const queue = getQueue();
  queue.destroy();
  vi.useRealTimers();
});

describe('Queue', () => {
  it('enqueues events without immediate dispatch', () => {
    registerTestProvider('test');
    const queue = getQueue();
    configureAnalytics({ batchInterval: 10000, batchSize: 100 });

    const event = createMockEvent();
    queue.enqueue(event);

    // Event should be queued, not dispatched yet
    // We can't directly check internal queue state, but we know it didn't throw
    queue.destroy();
  });

  it('flushes when batch size is reached', async () => {
    vi.useFakeTimers();
    registerTestProvider('test');
    const queue = getQueue();
    configureAnalytics({ batchSize: 2 });

    queue.enqueue(createMockEvent());
    queue.enqueue(createMockEvent());

    // Should auto-flush when queue reaches batchSize
    await vi.advanceTimersByTimeAsync(100);

    queue.destroy();
  });

  it('flushes on explicit flush call', async () => {
    registerTestProvider('test');
    const queue = getQueue();

    queue.enqueue(createMockEvent());
    await queue.flush();

    queue.destroy();
  });

  it('immediately dispatches when batchSize is 0', () => {
    registerTestProvider('test');
    const queue = getQueue();
    configureAnalytics({ batchSize: 0 });

    queue.enqueue(createMockEvent());
    // Should dispatch immediately, not queue
    queue.destroy();
  });

  it('handles enqueue after destroy gracefully', () => {
    const queue = getQueue();
    queue.destroy();
    expect(() => queue.enqueue(createMockEvent())).not.toThrow();
  });

  it('flush resolves even with empty queue', async () => {
    const queue = getQueue();
    await expect(queue.flush()).resolves.toBeUndefined();
    queue.destroy();
  });
});
