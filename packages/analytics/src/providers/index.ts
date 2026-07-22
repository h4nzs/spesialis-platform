// =============================================================================
// Analytics Platform — Provider Layer
// =============================================================================
// Provider abstraction: interface + registry + implementations.
// Components NEVER call providers directly — they go through analytics core.
// =============================================================================

import type { AnalyticsProvider, ProviderConfig } from '../types.ts';

// ── Provider Registry ─────────────────────────────────────────────
// Central registry of all active providers. Managed at bootstrap.

const providers = new Map<string, AnalyticsProvider>();
const configs = new Map<string, ProviderConfig>();

/** Register a provider */
export function registerProvider(
  name: string,
  provider: AnalyticsProvider,
  config: ProviderConfig,
): void {
  providers.set(name, provider);
  configs.set(name, config);
}

/** Unregister a provider */
export function unregisterProvider(name: string): void {
  providers.delete(name);
  configs.delete(name);
}

/** Get all active (enabled) providers */
export function getActiveProviders(): AnalyticsProvider[] {
  const active: AnalyticsProvider[] = [];
  for (const [name, provider] of providers) {
    const config = configs.get(name);
    if (config?.enabled) {
      active.push(provider);
    }
  }
  return active;
}

/** Get provider by name */
export function getProvider(name: string): AnalyticsProvider | undefined {
  return providers.get(name);
}

/** Get provider config by name */
export function getProviderConfig(name: string): ProviderConfig | undefined {
  return configs.get(name);
}

/**
 * Get active providers sorted by priority (lower = tried first).
 * Used for failover: if a high-priority provider fails, try the next.
 */
export function getProvidersByPriority(): {
  name: string;
  provider: AnalyticsProvider;
  config: ProviderConfig;
}[] {
  const active: { name: string; provider: AnalyticsProvider; config: ProviderConfig }[] = [];
  for (const [name, provider] of providers) {
    const cfg = configs.get(name);
    if (cfg?.enabled) {
      active.push({ name, provider, config: cfg });
    }
  }
  // Sort by priority (lower number = higher priority)
  active.sort((a, b) => (a.config.priority ?? 100) - (b.config.priority ?? 100));
  return active;
}

/** Initialize all active providers */
export async function initProviders(): Promise<void> {
  const errors: { name: string; error: Error }[] = [];

  for (const [name, provider] of providers) {
    const config = configs.get(name);
    if (!config?.enabled) continue;

    try {
      await provider.init(config.options);
    } catch (error) {
      errors.push({ name, error: error instanceof Error ? error : new Error(String(error)) });
    }
  }

  if (errors.length > 0) {
    console.warn('[Analytics] Provider initialization errors:', errors);
  }
}

/** Destroy all providers */
export async function destroyProviders(): Promise<void> {
  for (const [, provider] of providers) {
    try {
      provider.destroy?.();
    } catch {
      // Silently ignore destroy errors
    }
  }
  providers.clear();
  configs.clear();
}

// ── Plausible Provider ────────────────────────────────────────────
// Self-hosted Plausible Community Edition
// Docs: https://plausible.io/docs/events-api

export function createPlausibleProvider(): AnalyticsProvider {
  return {
    name: 'plausible',

    init(config) {
      const domain = config.domain as string | undefined;
      const siteDomain = config.siteDomain as string | undefined;

      if (!domain || !siteDomain) {
        console.warn('[Analytics] Plausible: missing domain or siteDomain in config');
        return;
      }

      // Load Plausible script dynamically (only in browser)
      if (typeof document === 'undefined') return;

      const existing = document.querySelector(`script[src*="${domain}"]`);
      if (existing) return; // Already loaded

      const script = document.createElement('script');
      script.src = `https://${domain}/js/script.js`;
      script.dataset.domain = siteDomain;
      script.defer = true;
      script.async = true;
      document.head.appendChild(script);
    },

    track(event) {
      // Plausible auto-tracks pageviews via script
      if (event.name === 'pageview') return;

      // For custom events, use Plausible's manual API
      const win = (typeof window !== 'undefined' ? window : undefined) as
        | (Window & {
            plausible?: {
              q: unknown[];
              (e: string, o?: { props?: Record<string, unknown> }): void;
            };
          })
        | undefined;

      if (win?.plausible) {
        win.plausible(event.name, {
          props: event.properties as Record<string, unknown>,
        });
      } else {
        // Queue if plausible not yet loaded
        const q = (win?.plausible?.q ?? []) as unknown[];
        q.push([event.name, { props: event.properties }]);
      }
    },

    pageview(url, title) {
      // Plausible auto-tracks pageviews via the script tag
      // No manual pageview call needed
    },

    destroy() {
      // No cleanup needed for Plausible
    },
  };
}

// ── Debug Provider ────────────────────────────────────────────────
// Logs every event to browser console in development.
// Always active when debug mode is on — not configurable via user config.

export function createDebugProvider(): AnalyticsProvider {
  const STYLE =
    'background:#1e293b;color:#38bdf8;padding:2px 6px;border-radius:3px;font-weight:bold';

  return {
    name: 'debug',

    init() {
      if (typeof console === 'undefined') return;
      console.log('%c Analytics Debug Mode Active ', STYLE);
    },

    track(event) {
      if (typeof console === 'undefined') return;

      console.groupCollapsed(
        `%c📊 ${event.category} → ${event.name}`,
        'color:#38bdf8;font-weight:bold',
      );
      console.log('ID:       ', event.id);
      console.log('Category: ', event.category);
      console.log('Session:  ', event.sessionId);
      console.log('URL:      ', event.pageUrl);
      console.log('Time:     ', event.timestamp);
      console.log('Sampled:  ', event.sampled);
      console.log('User:     ', event.userId ?? '(anonymous)');
      if (Object.keys(event.properties).length > 0) {
        console.log('Props:');
        for (const [key, value] of Object.entries(event.properties)) {
          if (typeof value === 'object') {
            console.log(`  ${key}:`, value);
          } else {
            console.log(`  ${key}: ${String(value)}`);
          }
        }
      }
      console.groupEnd();
    },

    destroy() {
      if (typeof console === 'undefined') return;
      console.log('%c Analytics Debug Disabled ', STYLE);
    },
  };
}

// ── Noop Provider ─────────────────────────────────────────────────
// Fallback when no provider is configured.
// Silently swallows all events — no side effects.

export function createNoopProvider(): AnalyticsProvider {
  return {
    name: 'noop',
    init() {
      // Silent
    },
    track() {
      // Silent
    },
    destroy() {
      // Silent
    },
  };
}
