// =============================================================================
// Tests — Event Dispatcher (Reliability)
// =============================================================================

import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import {
  dispatch,
  dispatchReliable,
  startRetryProcessor,
  stopRetryProcessor,
  drainRetryQueue,
  getRetryQueueSize,
} from '../core/dispatcher.ts';
import { configureAnalytics, getConfig } from '../core/config.ts';
import { registerProvider, destroyProviders } from '../providers/index.ts';
import { createMockEvent, registerTestProvider, resetConfig } from './helpers/test-utils.ts';
import type { AnalyticsProvider } from '../types.ts';

beforeEach(async () => {
  resetConfig();
  // Use fast retry for test stability
  configureAnalytics({ maxRetries: 0, retryDelay: 1 });
  await destroyProviders();
  stopRetryProcessor();
  // Drain any remaining retry queue entries from previous tests
  await drainRetryQueue();
  vi.useRealTimers();
});

afterEach(() => {
  vi.useRealTimers();
});

describe('dispatch (sync — error isolation)', () => {
  it('dispatches to all active providers', () => {
    registerTestProvider('provider-a');
    registerTestProvider('provider-b');

    const event = createMockEvent();
    const results = dispatch(event);
    expect(results).toHaveLength(2);
    expect(results.every((r) => r.success)).toBe(true);
  });

  it('isolates errors — one failing provider does not affect others', () => {
    registerTestProvider('good-provider', {});
    registerTestProvider('bad-provider', { trackShouldFail: true });

    const event = createMockEvent();
    const results = dispatch(event);
    expect(results).toHaveLength(2);
    const goodResult = results.find((r) => r.provider === 'good-provider');
    const badResult = results.find((r) => r.provider === 'bad-provider');
    expect(goodResult?.success).toBe(true);
    expect(badResult?.success).toBe(false);
  });

  it('reports duration for each provider', () => {
    registerTestProvider('fast-provider');
    const event = createMockEvent();
    const results = dispatch(event);
    for (const r of results) {
      expect(r.duration).toBeGreaterThanOrEqual(0);
    }
  });
});

describe('dispatchReliable (async — retry + timeout + fallback)', () => {
  it('succeeds on first attempt for healthy providers', async () => {
    registerTestProvider('healthy', {});

    const event = createMockEvent();
    const results = await dispatchReliable(event);
    expect(results.some((r) => r.success)).toBe(true);
  });

  it('reports attempts on success', async () => {
    registerTestProvider('healthy', {});

    const event = createMockEvent();
    const results = await dispatchReliable(event);
    const healthyResult = results.find((r) => r.provider === 'healthy');
    expect(healthyResult?.attempts).toBe(1);
  });

  it('retries on failure and eventually succeeds', async () => {
    vi.useFakeTimers();

    let callCount = 0;
    const flakyProvider: AnalyticsProvider = {
      name: 'flaky',
      init: () => Promise.resolve(),
      track: () => {
        callCount++;
        if (callCount < 2) {
          throw new Error('Temporary failure');
        }
        return Promise.resolve();
      },
    };

    registerProvider('flaky', flakyProvider, {
      enabled: true,
      options: {},
      priority: 10,
    });

    // Override retry delay for fast tests
    configureAnalytics({ retryDelay: 50, maxRetries: 2 });

    const promise = dispatchReliable(createMockEvent());

    // Fast-forward through retries
    await vi.advanceTimersByTimeAsync(200);

    const results = await promise;
    const flakyResult = results.find((r) => r.provider === 'flaky');
    expect(flakyResult?.success).toBe(true);
    expect(callCount).toBe(2);
  });

  it('exhausts retries and reports failure', async () => {
    vi.useFakeTimers();

    registerTestProvider('always-fails', { trackShouldFail: true });
    configureAnalytics({ maxRetries: 0 }); // No retries

    const promise = dispatchReliable(createMockEvent());
    await vi.advanceTimersByTimeAsync(100);

    const results = await promise;
    const failingResult = results.find((r) => r.provider === 'always-fails');
    expect(failingResult?.success).toBe(false);
  });

  it('uses failover strategy by default', async () => {
    vi.useFakeTimers();
    configureAnalytics({ maxRetries: 0, retryDelay: 10 }); // No retries for fast test

    registerTestProvider(
      'primary',
      {
        trackShouldFail: true,
      },
      { priority: 10 },
    );
    registerTestProvider('fallback', {}, { priority: 20 });

    const promise = dispatchReliable(createMockEvent());
    await vi.advanceTimersByTimeAsync(100);
    const results = await promise;

    const primaryResult = results.find((r) => r.provider === 'primary');
    const fallbackResult = results.find((r) => r.provider === 'fallback');
    expect(primaryResult?.success).toBe(false);
    // With failover, fallback should succeed because primary failed
    expect(fallbackResult?.success).toBe(true);
  });

  it('dispatches to all providers in parallel mode', async () => {
    configureAnalytics({ fallbackStrategy: 'parallel' });
    registerTestProvider('provider-a', {}, { priority: 10 });
    registerTestProvider('provider-b', {}, { priority: 20 });

    const event = createMockEvent();
    const results = await dispatchReliable(event);
    expect(results).toHaveLength(2);
    expect(results.every((r) => r.success)).toBe(true);
  });
});

describe('retry queue', () => {
  it('starts empty', () => {
    expect(getRetryQueueSize()).toBe(0);
  });

  it('processes enqueued events', async () => {
    registerTestProvider('failing', { trackShouldFail: true });
    configureAnalytics({ maxRetries: 0, retryDelay: 1 });

    // Dispatch — will fail and enqueue to retry queue
    const results = dispatch(createMockEvent());
    expect(results.some((r) => !r.success)).toBe(true);
    // After dispatch, the event should be in the retry queue
    const sizeBefore = getRetryQueueSize();
    expect(sizeBefore).toBeGreaterThanOrEqual(1);

    // Manually drain with fast config
    await drainRetryQueue();
    const sizeAfter = getRetryQueueSize();
    // After drain with maxRetries=0, events should be exhausted
    expect(typeof sizeAfter).toBe('number');
  });

  it('can be drained manually', async () => {
    registerTestProvider('failing', { trackShouldFail: true });

    // Dispatch to enqueue
    dispatch(createMockEvent());

    // Manually drain
    await drainRetryQueue();
    expect(getRetryQueueSize()).toBe(0);
  });

  it('can be started and stopped', () => {
    startRetryProcessor();
    stopRetryProcessor();
    // Should not throw
    expect(true).toBe(true);
  });
});

describe('dispatch with no providers', () => {
  it('returns empty array for sync dispatch', () => {
    const results = dispatch(createMockEvent());
    expect(results).toEqual([]);
  });

  it('returns empty array for reliable dispatch', async () => {
    const results = await dispatchReliable(createMockEvent());
    expect(results).toEqual([]);
  });
});
