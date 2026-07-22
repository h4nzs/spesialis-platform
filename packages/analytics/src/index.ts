// =============================================================================
// Analytics Platform — Public API
// =============================================================================
// Single entry point for the entire analytics platform.
// Everything a developer needs is re-exported from here.
// =============================================================================

// ── Core API ──────────────────────────────────────────────────
export { configureAnalytics, getConfig } from './core/tracker.ts';
export { track } from './core/tracker.ts';
export { trackImmediate } from './core/tracker.ts';
export {
  getDebugEvents,
  clearDebugHistory,
  getDebugErrors,
  getDebugErrorCount,
  exportDebugHistory,
  subscribe,
} from './core/debug.ts';
export { getSession, setSessionUser, clearSessionUser } from './core/session.ts';

// ── Reliability (Dispatcher) ─────────────────────────────────
export {
  dispatchReliable,
  dispatchBatchReliable,
  startRetryProcessor,
  stopRetryProcessor,
  drainRetryQueue,
  getRetryQueueSize,
} from './core/dispatcher.ts';
export type { DispatchResult } from './core/dispatcher.ts';

// ── Providers ────────────────────────────────────────────────
export {
  registerProvider,
  unregisterProvider,
  getActiveProviders,
  getProvider,
  getProviderConfig,
  getProvidersByPriority,
  initProviders,
  destroyProviders,
  createPlausibleProvider,
  createDebugProvider,
  createNoopProvider,
} from './providers/index.ts';

// ── Registries ───────────────────────────────────────────────
export {
  getEventDefinition,
  getAllEventDefinitions,
  getEventsByCategory,
  getEventsByStatus,
} from './registry/events.ts';
export type { EventRegistry } from './registry/events.ts';

export { getPropertyDefinition, getAllPropertyDefinitions } from './registry/properties.ts';

export { registerGoal, getGoal, getAllGoals, registerDefaultGoals } from './registry/goals.ts';

export {
  registerFunnel,
  getFunnel,
  getAllFunnels,
  registerDefaultFunnels,
} from './registry/funnels.ts';

// ── Helpers ──────────────────────────────────────────────────
export {
  trackNavigation,
  trackCTA,
  trackWhatsappClick,
  trackServiceView,
  trackSearch,
  trackBookingStart,
  trackBookingSubmit,
  trackBookingCancel,
  trackPaymentSuccess,
  trackPaymentFailed,
  trackRegisterComplete,
  trackLoginSuccess,
  trackPartnerRegister,
  trackPartnerRegisterComplete,
  trackPartnerJobAccept,
  trackPartnerJobReject,
  trackInquirySubmit,
  trackArticleView,
  trackFAQOpen,
  trackDashboardView,
  track404,
  trackAPIError,
} from './helpers/index.ts';

// ── Hooks ────────────────────────────────────────────────────
export { useAnalytics } from './hooks/useAnalytics.ts';

// ── Debug Panel ────────────────────────────────────────────
export {
  enableDebugPanel,
  disableDebugPanel,
  toggleDebugPanel,
  isDebugPanelVisible,
  DebugPanel,
} from './debug/index.ts';
export type { DebugStoreSnapshot, ProviderHealth } from './debug/store.ts';

// ── Client Auto-Tracking ─────────────────────────────────────
export {
  initAutoTracking,
  trackInitialPageview,
  trackSPAPageview,
  trackScrollDepth,
  trackErrors,
  trackOutboundLinks,
  trackCoreWebVitals,
  trackVisibilityChange,
  trackHistoryNavigation,
  trackSessionEnd,
} from './client/index.ts';

// ── Contract ────────────────────────────────────────────────
export { EventContract } from './contract/index.ts';
export type { EventContractType, ContractViolation, ContractReport } from './contract/index.ts';

// ── Types ────────────────────────────────────────────────────
export type {
  EventCategory,
  EventDefinition,
  EventStatus,
  PrivacyLevel,
  PropertyDefinition,
  PropertyType,
  AnalyticsProvider,
  ProviderConfig,
  AnalyticsConfig,
  NormalizedEvent,
  GoalDefinition,
  FunnelDefinition,
  FunnelStep,
  TrackOptions,
  DebugEvent,
} from './types.ts';

// ── Load Registries (module side-effect) ────────────────────
// These MUST be imported to populate event & property registries.
import './events/index.ts';
import './properties/index.ts';

// ── Bootstrap Function ───────────────────────────────────────
// Convenience: call analyticsInit() once at app startup.

import { configureAnalytics } from './core/tracker.ts';
import { registerProvider } from './providers/index.ts';
import { initProviders } from './providers/index.ts';
import {
  createPlausibleProvider,
  createDebugProvider,
  createNoopProvider,
} from './providers/index.ts';
import { registerDefaultGoals } from './registry/goals.ts';
import { registerDefaultFunnels } from './registry/funnels.ts';
import { initAutoTracking } from './client/index.ts';
import type { AnalyticsConfig, AnalyticsProvider } from './types.ts';

/** Map known provider names to their factory functions */
const PROVIDER_FACTORIES: Record<string, () => AnalyticsProvider> = {
  plausible: createPlausibleProvider,
  debug: createDebugProvider,
  noop: createNoopProvider,
};

/**
 * Bootstrap the analytics platform.
 *
 * Call once at application startup (in BaseLayout.astro script).
 *
 * @example
 * ```ts
 * analyticsInit({
 *   providers: {
 *     plausible: {
 *       enabled: true,
 *       options: {
 *         domain: 'stats.ahlipanggilan.id',
 *         siteDomain: 'ahlipanggilan.id',
 *       },
 *     },
 *   },
 *   debug: import.meta.env.DEV,
 *   autoTracking: { pageview: true, scroll: true, engagement: true, errors: true },
 * })
 * ```
 */
export function analyticsInit(config: Partial<AnalyticsConfig>): void {
  // 1. Configure
  configureAnalytics(config);

  // 2. Register providers from config
  const hasProviders = config.providers && Object.keys(config.providers).length > 0;

  if (hasProviders) {
    for (const [name, providerConfig] of Object.entries(config.providers!)) {
      const factory = PROVIDER_FACTORIES[name];
      if (factory) {
        registerProvider(name, factory(), providerConfig);
      } else {
        console.warn(
          `[Analytics] Unknown provider: "${name}" — skipped. Register it manually via registerProvider().`,
        );
      }
    }
  }

  // Debug provider — always registered, enabled only when debug mode is on
  registerProvider('debug', createDebugProvider(), {
    enabled: config.debug ?? false,
    options: {},
  });

  // Noop fallback — only if no providers are configured at all
  if (!hasProviders) {
    registerProvider('noop', createNoopProvider(), {
      enabled: true,
      options: {},
    });
  }

  // 3. Register default registries
  registerDefaultGoals();
  registerDefaultFunnels();

  // 4. Initialize providers
  initProviders();

  // 5. Start auto-tracking (browser only)
  if (typeof window !== 'undefined') {
    initAutoTracking(config);
  }
}
