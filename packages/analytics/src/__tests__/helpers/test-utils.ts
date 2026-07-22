// =============================================================================
// Analytics Platform — Test Utilities
// =============================================================================
// Shared mocks and helpers for analytics tests.
// =============================================================================

import type {
  AnalyticsProvider,
  ProviderConfig,
  NormalizedEvent,
  DebugEvent,
} from '../../types.ts';
import * as configModule from '../../core/config.ts';
import * as providerModule from '../../providers/index.ts';

// ── Mock Provider Factory ─────────────────────────────────────────

export interface MockProviderOptions {
  name?: string;
  trackShouldFail?: boolean;
  trackShouldTimeout?: boolean;
  initShouldFail?: boolean;
  trackBatchSupported?: boolean;
  trackBatchShouldFail?: boolean;
}

export function createMockProvider(opts: MockProviderOptions = {}): AnalyticsProvider {
  return {
    name: opts.name ?? 'mock',

    init() {
      if (opts.initShouldFail) {
        return Promise.reject(new Error('Init failed'));
      }
      return Promise.resolve();
    },

    track() {
      if (opts.trackShouldFail) {
        throw new Error('Track failed');
      }
      if (opts.trackShouldTimeout) {
        return new Promise<void>(() => {
          // Never resolves — simulates timeout
        });
      }
      return Promise.resolve();
    },

    ...(opts.trackBatchSupported || opts.trackBatchShouldFail
      ? {
          trackBatch() {
            if (opts.trackBatchShouldFail) {
              return Promise.reject(new Error('Batch failed'));
            }
            return Promise.resolve();
          },
        }
      : {}),

    destroy() {
      // No-op
    },
  };
}

// ── Mock Event Factory ────────────────────────────────────────────

let eventCounter = 0;

export function createMockEvent(overrides: Partial<NormalizedEvent> = {}): NormalizedEvent {
  eventCounter++;
  return {
    id: `test-event-${eventCounter}-${Date.now()}`,
    name: 'test_event',
    category: 'system',
    timestamp: new Date().toISOString(),
    properties: {},
    sessionId: 'test-session-123',
    pageUrl: 'https://example.com/test',
    userId: undefined,
    sampled: false,
    ...overrides,
  };
}

export function createMockDebugEvent(overrides: Partial<DebugEvent> = {}): DebugEvent {
  const base = createMockEvent(overrides);
  return {
    ...base,
    dispatchResults: {},
    validation: { valid: true },
    duration: 0,
    queued: true,
    filtered: true,
    ...overrides,
  } as DebugEvent;
}

// ── State Reset Helpers ───────────────────────────────────────────
// Since config, providers use module-level state, we need to reset between tests.

/**
 * Reset analytics configuration to defaults.
 * Call in beforeEach() for tests that use configureAnalytics/getConfig.
 */
export function resetConfig(): void {
  configModule.configureAnalytics({
    providers: {},
    debug: false,
    defaultSamplingRate: 1,
    batchInterval: 2000,
    batchSize: 10,
    maxRetries: 3,
    retryDelay: 1000,
    dispatchTimeout: 5000,
    fallbackStrategy: 'failover',
    autoTracking: {
      pageview: true,
      scroll: true,
      engagement: true,
      outboundLinks: false,
      downloads: false,
      errors: true,
      performance: false,
      visibility: true,
      historyNavigation: true,
    },
  });
}

/**
 * Remove all registered providers.
 * Call in beforeEach() for tests that use registerProvider/getActiveProviders.
 */
export function clearProviders(): void {
  // We use the destroyProviders to clear, but it's async
  // Instead, we unregister each provider via internal means
  // For testing, we need to directly manipulate the module state
  // This is handled by each test module manually
}

/**
 * Register a test provider with given options.
 */
export function registerTestProvider(
  name: string,
  opts: MockProviderOptions = {},
  config: Partial<ProviderConfig> = {},
): void {
  const provider = createMockProvider({ ...opts, name });
  providerModule.registerProvider(name, provider, {
    enabled: true,
    options: {},
    priority: 100,
    ...config,
  });
}
