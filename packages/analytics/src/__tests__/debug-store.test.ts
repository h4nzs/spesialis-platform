// =============================================================================
// Tests — Debug Store
// =============================================================================

import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  clearDebugHistory,
  addDebugEvent,
  getDebugEvents,
  getDebugEventsByCategory,
  getDebugErrors,
} from '../core/debug.ts';
import { destroyProviders } from '../providers/index.ts';
import { createMockDebugEvent, resetConfig } from './helpers/test-utils.ts';
import { stopRetryProcessor } from '../core/dispatcher.ts';
import { clearAllEvents, getSnapshot, refreshStore, subscribeToStore } from '../debug/store.ts';

beforeEach(async () => {
  clearDebugHistory();
  resetConfig();
  await destroyProviders();
  stopRetryProcessor();
});

describe('debug event history', () => {
  it('stores events and retrieves them', () => {
    addDebugEvent(createMockDebugEvent({ name: 'test_event_1' }));
    addDebugEvent(createMockDebugEvent({ name: 'test_event_2' }));
    const events = getDebugEvents();
    expect(events.length).toBe(2);
  });

  it('stores most recent event first', () => {
    addDebugEvent(createMockDebugEvent({ name: 'first' }));
    addDebugEvent(createMockDebugEvent({ name: 'second' }));
    const events = getDebugEvents();
    expect(events[0]?.name).toBe('second');
  });

  it('limits history to 500 events', () => {
    for (let i = 0; i < 550; i++) {
      addDebugEvent(createMockDebugEvent({ name: `event_${i}` }));
    }
    const events = getDebugEvents();
    expect(events.length).toBeLessThanOrEqual(500);
  });

  it('clears history', () => {
    addDebugEvent(createMockDebugEvent({ name: 'test' }));
    clearDebugHistory();
    expect(getDebugEvents()).toHaveLength(0);
  });
});

describe('debug event filtering', () => {
  it('filters by category', () => {
    addDebugEvent(createMockDebugEvent({ name: 'nav', category: 'navigation' }));
    addDebugEvent(createMockDebugEvent({ name: 'pay', category: 'payment' }));
    const navEvents = getDebugEventsByCategory('navigation');
    expect(navEvents).toHaveLength(1);
    expect(navEvents[0]?.name).toBe('nav');
  });
});

describe('debug error tracking', () => {
  it('tracks events with validation errors', () => {
    addDebugEvent(
      createMockDebugEvent({
        name: 'valid',
        validation: { valid: true },
      }),
    );
    addDebugEvent(
      createMockDebugEvent({
        name: 'invalid',
        validation: { valid: false, errors: ['Missing property'] },
      }),
    );
    const errors = getDebugErrors();
    expect(errors.length).toBe(1);
    expect(errors[0]?.name).toBe('invalid');
  });

  it('tracks events with dispatch failures', () => {
    addDebugEvent(
      createMockDebugEvent({
        name: 'failed',
        dispatchResults: { plausible: { success: false, error: 'Timeout' } },
      }),
    );
    const errors = getDebugErrors();
    expect(errors.some((e) => e.name === 'failed')).toBe(true);
  });
});

describe('debug store (store.ts)', () => {
  it('subscribeToStore returns initial snapshot', async () => {
    const snapshot = await new Promise<any>((resolve) => {
      const unsub = subscribeToStore((s) => {
        resolve(s);
        unsub();
      });
    });
    expect(snapshot).toBeDefined();
    expect(snapshot.eventCount).toBeGreaterThanOrEqual(0);
    expect(snapshot.providers).toBeDefined();
    expect(typeof snapshot.retryQueueSize).toBe('number');
  });

  it('clearAllEvents clears events and notifies', () => {
    addDebugEvent(createMockDebugEvent({ name: 'test' }));
    clearAllEvents();
    const snapshot = getSnapshot();
    expect(snapshot.eventCount).toBe(0);
  });

  it('refreshStore refreshes cached snapshot', () => {
    const before = getSnapshot();
    expect(before).toBeDefined();
    refreshStore();
    const after = getSnapshot();
    expect(after).toBeDefined();
  });
});
