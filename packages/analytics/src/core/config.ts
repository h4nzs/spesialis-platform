// =============================================================================
// Analytics Platform — Configuration Store
// =============================================================================
// Extracted from tracker.ts to break circular dependency:
//   tracker → queue → dispatcher → tracker
// Now: tracker → config.ts, dispatcher → config.ts
// =============================================================================

import type { AnalyticsConfig } from '../types.ts';

let config: AnalyticsConfig = {
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
};

/** Configure the analytics platform */
export function configureAnalytics(overrides: Partial<AnalyticsConfig>): void {
  config = {
    ...config,
    ...overrides,
    autoTracking: { ...config.autoTracking, ...overrides.autoTracking },
  };
}

/** Get current config (read-only) */
export function getConfig(): Readonly<AnalyticsConfig> {
  return config;
}
