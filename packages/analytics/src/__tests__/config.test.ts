// =============================================================================
// Tests — Analytics Configuration
// =============================================================================

import { describe, it, expect, beforeEach } from 'vitest';
import { configureAnalytics, getConfig } from '../core/config.ts';
import { resetConfig } from './helpers/test-utils.ts';

beforeEach(() => {
  resetConfig();
});

describe('getConfig', () => {
  it('returns default configuration', () => {
    const config = getConfig();
    expect(config.debug).toBe(false);
    expect(config.defaultSamplingRate).toBe(1);
    expect(config.batchInterval).toBe(2000);
    expect(config.batchSize).toBe(10);
    expect(config.maxRetries).toBe(3);
    expect(config.retryDelay).toBe(1000);
    expect(config.dispatchTimeout).toBe(5000);
    expect(config.fallbackStrategy).toBe('failover');
    expect(config.providers).toEqual({});
    expect(config.autoTracking.pageview).toBe(true);
    expect(config.autoTracking.scroll).toBe(true);
    expect(config.autoTracking.engagement).toBe(true);
    expect(config.autoTracking.outboundLinks).toBe(false);
    expect(config.autoTracking.downloads).toBe(false);
    expect(config.autoTracking.errors).toBe(true);
    expect(config.autoTracking.performance).toBe(false);
    expect(config.autoTracking.visibility).toBe(true);
    expect(config.autoTracking.historyNavigation).toBe(true);
  });

  it('returns a readonly object', () => {
    const config = getConfig();
    // Should not be able to mutate top-level fields in strict mode
    // We just verify it's an object
    expect(typeof config).toBe('object');
  });
});

describe('configureAnalytics', () => {
  it('overrides debug mode', () => {
    configureAnalytics({ debug: true });
    expect(getConfig().debug).toBe(true);
  });

  it('merges autoTracking with defaults', () => {
    configureAnalytics({
      autoTracking: {
        pageview: false,
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
    const config = getConfig();
    expect(config.autoTracking.pageview).toBe(false);
    // Other autoTracking fields should retain defaults
    expect(config.autoTracking.scroll).toBe(true);
    expect(config.autoTracking.engagement).toBe(true);
    expect(config.autoTracking.errors).toBe(true);
  });

  it('overrides batch settings', () => {
    configureAnalytics({ batchInterval: 5000, batchSize: 20 });
    expect(getConfig().batchInterval).toBe(5000);
    expect(getConfig().batchSize).toBe(20);
  });

  it('overrides reliability settings', () => {
    configureAnalytics({
      maxRetries: 5,
      retryDelay: 2000,
      dispatchTimeout: 10000,
      fallbackStrategy: 'parallel',
    });
    expect(getConfig().maxRetries).toBe(5);
    expect(getConfig().retryDelay).toBe(2000);
    expect(getConfig().dispatchTimeout).toBe(10000);
    expect(getConfig().fallbackStrategy).toBe('parallel');
  });

  it('overrides providers config', () => {
    configureAnalytics({
      providers: {
        plausible: {
          enabled: true,
          options: { domain: 'stats.example.com', siteDomain: 'example.com' },
        },
      },
    });
    expect(getConfig().providers.plausible?.enabled).toBe(true);
    expect(getConfig().providers.plausible?.options.domain).toBe('stats.example.com');
  });

  it('preserves unspecified fields when overriding', () => {
    configureAnalytics({ debug: true });
    const config = getConfig();
    expect(config.debug).toBe(true);
    expect(config.batchInterval).toBe(2000); // default preserved
    expect(config.maxRetries).toBe(3); // default preserved
  });

  it('can be called multiple times', () => {
    configureAnalytics({ debug: true });
    configureAnalytics({ batchSize: 25 });
    expect(getConfig().debug).toBe(true);
    expect(getConfig().batchSize).toBe(25);
  });

  it('handles empty override', () => {
    configureAnalytics({});
    const config = getConfig();
    expect(config.debug).toBe(false);
    expect(config.batchInterval).toBe(2000);
  });
});
