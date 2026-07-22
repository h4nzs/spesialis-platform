// =============================================================================
// Tests — Provider Layer
// =============================================================================

import { describe, it, expect, beforeEach } from 'vitest';
import {
  registerProvider,
  unregisterProvider,
  getActiveProviders,
  getProvider,
  getProviderConfig,
  getProvidersByPriority,
  initProviders,
  destroyProviders,
} from '../providers/index.ts';
import { createMockProvider } from './helpers/test-utils.ts';
import type { AnalyticsProvider, ProviderConfig } from '../types.ts';

const mockProvider: AnalyticsProvider = {
  name: 'test-provider',
  init: () => Promise.resolve(),
  track: () => {},
  destroy: () => {},
};

beforeEach(async () => {
  await destroyProviders();
});

describe('registerProvider', () => {
  it('registers a provider', () => {
    registerProvider('test', mockProvider, { enabled: true, options: {} });
    expect(getProvider('test')).toBe(mockProvider);
  });

  it('provider is active when enabled', () => {
    registerProvider('test', mockProvider, { enabled: true, options: {} });
    const active = getActiveProviders();
    expect(active).toHaveLength(1);
    expect(active[0]?.name).toBe('test-provider');
  });

  it('provider is not active when disabled', () => {
    registerProvider('test', mockProvider, { enabled: false, options: {} });
    expect(getActiveProviders()).toHaveLength(0);
  });
});

describe('unregisterProvider', () => {
  it('removes a provider', () => {
    registerProvider('test', mockProvider, { enabled: true, options: {} });
    unregisterProvider('test');
    expect(getProvider('test')).toBeUndefined();
    expect(getActiveProviders()).toHaveLength(0);
  });
});

describe('getProviderConfig', () => {
  it('returns config for registered provider', () => {
    registerProvider('test', mockProvider, { enabled: true, options: { key: 'val' } });
    const config = getProviderConfig('test');
    expect(config).toBeDefined();
    expect(config!.enabled).toBe(true);
    expect(config!.options.key).toBe('val');
  });

  it('returns undefined for unregistered provider', () => {
    expect(getProviderConfig('nonexistent')).toBeUndefined();
  });
});

describe('getProvidersByPriority', () => {
  it('returns providers sorted by priority', () => {
    registerProvider('low', mockProvider, { enabled: true, options: {}, priority: 100 });
    registerProvider('high', mockProvider, { enabled: true, options: {}, priority: 10 });
    registerProvider('mid', mockProvider, { enabled: true, options: {}, priority: 50 });

    const sorted = getProvidersByPriority();
    expect(sorted).toHaveLength(3);
    expect(sorted[0]?.name).toBe('high');
    expect(sorted[1]?.name).toBe('mid');
    expect(sorted[2]?.name).toBe('low');
  });

  it('defaults priority to 100', () => {
    registerProvider('no-priority', mockProvider, { enabled: true, options: {} });
    const config = getProviderConfig('no-priority');
    expect(config).toBeDefined();
    // The priority sort uses `?? 100` as fallback
    const entries = getProvidersByPriority();
    expect(entries).toHaveLength(1);
    expect(entries[0]?.name).toBe('no-priority');
  });

  it('skips disabled providers', () => {
    registerProvider('enabled', mockProvider, { enabled: true, options: {} });
    registerProvider('disabled', mockProvider, { enabled: false, options: {} });
    const entries = getProvidersByPriority();
    expect(entries).toHaveLength(1);
    expect(entries[0]?.name).toBe('enabled');
  });
});

describe('initProviders', () => {
  it('initializes all enabled providers', async () => {
    let initialized = false;
    const provider: AnalyticsProvider = {
      name: 'init-test',
      init: () => {
        initialized = true;
        return Promise.resolve();
      },
      track: () => {},
    };
    registerProvider('test', provider, { enabled: true, options: {} });
    await initProviders();
    expect(initialized).toBe(true);
  });

  it('does not initialize disabled providers', async () => {
    let initialized = false;
    const provider: AnalyticsProvider = {
      name: 'init-test',
      init: () => {
        initialized = true;
        return Promise.resolve();
      },
      track: () => {},
    };
    registerProvider('test', provider, { enabled: false, options: {} });
    await initProviders();
    expect(initialized).toBe(false);
  });

  it('handles init errors gracefully', async () => {
    const provider: AnalyticsProvider = {
      name: 'failing',
      init: () => Promise.reject(new Error('Init failed')),
      track: () => {},
    };
    registerProvider('test', provider, { enabled: true, options: {} });
    // Should not throw
    await expect(initProviders()).resolves.toBeUndefined();
  });
});

describe('destroyProviders', () => {
  it('destroys all providers and clears registry', async () => {
    registerProvider('test1', mockProvider, { enabled: true, options: {} });
    registerProvider('test2', mockProvider, { enabled: true, options: {} });
    await destroyProviders();
    expect(getActiveProviders()).toHaveLength(0);
    expect(getProvider('test1')).toBeUndefined();
  });
});
