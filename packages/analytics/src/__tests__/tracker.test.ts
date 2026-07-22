// =============================================================================
// Tests — Core Tracker (Pipeline)
// =============================================================================

import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';

// Set up window mock BEFORE any analytics modules are imported
// This ensures track() sees window as defined at module init time
vi.hoisted(() => {
  globalThis.window = {
    addEventListener: () => {},
    removeEventListener: () => {},
    location: { href: 'https://example.com/test' },
  } as any;
  globalThis.document = { referrer: '' } as any;
});

import { track, getConfig, configureAnalytics } from '../core/tracker.ts';
import { destroyProviders, registerProvider } from '../providers/index.ts';
import { getDebugEvents, clearDebugHistory } from '../core/debug.ts';
import { resetConfig, registerTestProvider } from './helpers/test-utils.ts';
import { stopRetryProcessor } from '../core/dispatcher.ts';
import { getQueue } from '../core/queue.ts';
import type { AnalyticsProvider } from '../types.ts';

// Load event registry
import '../events/index.ts';

function mockWindow(): void {
  globalThis.window = {
    addEventListener: () => {},
    removeEventListener: () => {},
    location: { href: 'https://example.com/test' },
  } as any;
  globalThis.document = { referrer: '' } as any;
}

function clearWindow(): void {
  delete (globalThis as any).window;
  delete (globalThis as any).document;
}

beforeEach(async () => {
  resetConfig();
  await destroyProviders();
  stopRetryProcessor();
  clearDebugHistory();
  getQueue().destroy();
  mockWindow();
});

afterEach(() => {
  clearWindow();
});

describe('track', () => {
  it('dispatches to registered provider', () => {
    // Use batchSize=0 for immediate dispatch
    configureAnalytics({ batchSize: 0 });

    let tracked = false;
    const provider: AnalyticsProvider = {
      name: 'test',
      init: () => Promise.resolve(),
      track: () => {
        tracked = true;
      },
    };
    registerProvider('test', provider, { enabled: true, options: {} });

    track('pageview', { url: '/', title: 'Test' });
    expect(tracked).toBe(true);
  });

  it('skips dispatch when sampled out', () => {
    configureAnalytics({ defaultSamplingRate: 0, batchSize: 0 });

    let tracked = false;
    const provider: AnalyticsProvider = {
      name: 'test',
      init: () => Promise.resolve(),
      track: () => {
        tracked = true;
      },
    };
    registerProvider('test', provider, { enabled: true, options: {} });

    track('pageview', { url: '/', title: 'Test' });
    expect(tracked).toBe(false);
  });

  it('skips dispatch when window is undefined', () => {
    clearWindow();

    let tracked = false;
    const provider: AnalyticsProvider = {
      name: 'test',
      init: () => Promise.resolve(),
      track: () => {
        tracked = true;
      },
    };
    registerProvider('test', provider, { enabled: true, options: {} });

    track('pageview', { url: '/', title: 'Test' });
    expect(tracked).toBe(false);
  });

  it('validates event before dispatch', () => {
    configureAnalytics({ batchSize: 0 });

    let tracked = false;
    const provider: AnalyticsProvider = {
      name: 'test',
      init: () => Promise.resolve(),
      track: () => {
        tracked = true;
      },
    };
    registerProvider('test', provider, { enabled: true, options: {} });

    track('nonexistent_event' as never, {} as never);
    expect(tracked).toBe(false);
  });

  it('adds debug event when in debug mode', () => {
    configureAnalytics({ debug: true, batchSize: 0 });
    registerTestProvider('test');

    track('pageview', { url: '/', title: 'Test' });
    const events = getDebugEvents();
    expect(events.length).toBeGreaterThan(0);
    expect(events[0]?.name).toBe('pageview');
  });

  it('does not add debug event in non-debug mode', () => {
    configureAnalytics({ batchSize: 0 });
    registerTestProvider('test');

    track('pageview', { url: '/', title: 'Test' });
    const events = getDebugEvents();
    expect(events).toHaveLength(0);
  });
});

describe('trackImmediate', () => {
  it('flushes queue after track', async () => {
    let tracked = false;
    const provider: AnalyticsProvider = {
      name: 'test',
      init: () => Promise.resolve(),
      track: () => {
        tracked = true;
      },
    };
    registerProvider('test', provider, { enabled: true, options: {} });

    const { trackImmediate: ti } = await import('../core/tracker.ts');
    await ti('pageview', { url: '/', title: 'Test' });
    expect(tracked).toBe(true);
  });
});

describe('config integration', () => {
  it('configureAnalytics updates config', () => {
    configureAnalytics({ debug: true });
    expect(getConfig().debug).toBe(true);
  });

  it('default config is set', () => {
    const config = getConfig();
    expect(config.batchInterval).toBe(2000);
    expect(config.maxRetries).toBe(3);
  });
});
