// =============================================================================
// Analytics Platform — Debug Store
// =============================================================================
// Reactive bridge that collects analytics state from all subsystems:
// - Event history (from debug.ts)
// - Provider health (from providers/index.ts)
// - Retry queue status (from dispatcher.ts)
// - Config snapshot (from config.ts)
// - Live event subscriptions
// =============================================================================

import type { DebugEvent } from '../types.ts';
import {
  getDebugEvents,
  subscribe,
  clearDebugHistory,
  exportDebugHistory,
  getDebugErrorCount,
} from '../core/debug.ts';
import { getConfig } from '../core/config.ts';
import {
  getActiveProviders,
  getProviderConfig,
  getProvidersByPriority,
} from '../providers/index.ts';
import { getRetryQueueSize } from '../core/dispatcher.ts';

// ── Types ─────────────────────────────────────────────────────────

export interface ProviderHealth {
  name: string;
  enabled: boolean;
  priority: number;
  hasError: boolean;
  errorMessage?: string;
  initErrors?: string[];
}

export interface DebugStoreSnapshot {
  events: readonly DebugEvent[];
  eventCount: number;
  errorCount: number;
  retryQueueSize: number;
  providers: ProviderHealth[];
  config: ReturnType<typeof getConfig>;
  debugActive: boolean;
}

export type DebugStoreListener = (snapshot: DebugStoreSnapshot) => void;

// ── Store ─────────────────────────────────────────────────────────

const listeners = new Set<DebugStoreListener>();

let cachedSnapshot: DebugStoreSnapshot | null = null;
let unsubscribeFromDebug: (() => void) | null = null;

/** Build a snapshot of all analytics state */
function buildSnapshot(): DebugStoreSnapshot {
  const events = getDebugEvents();
  const providers = getProvidersByPriority();
  const config = getConfig();

  const providerHealth: ProviderHealth[] = providers.map(({ name, config: pCfg }) => ({
    name,
    enabled: pCfg.enabled,
    priority: pCfg.priority ?? 100,
    hasError: false,
    errorMessage: undefined,
    initErrors: undefined,
  }));

  // Also include registered but disabled providers
  const allProviders = getActiveProviders();
  const allProviderNames = new Set(providers.map((p) => p.name));
  for (const p of allProviders) {
    if (!allProviderNames.has(p.name)) {
      const cfg = getProviderConfig(p.name);
      providerHealth.push({
        name: p.name,
        enabled: cfg?.enabled ?? false,
        priority: cfg?.priority ?? 100,
        hasError: false,
      });
    }
  }

  return {
    events,
    eventCount: events.length,
    errorCount: getDebugErrorCount(),
    retryQueueSize: getRetryQueueSize(),
    providers: providerHealth,
    config,
    debugActive: config.debug,
  };
}

/** Notify all listeners with latest snapshot */
function notifyListeners(): void {
  cachedSnapshot = buildSnapshot();
  for (const fn of listeners) {
    try {
      fn(cachedSnapshot);
    } catch {
      // Isolated error
    }
  }
}

// ── Public API ────────────────────────────────────────────────────

/** Subscribe to debug store updates */
export function subscribeToStore(callback: DebugStoreListener): () => void {
  listeners.add(callback);

  // Send initial snapshot immediately
  const initial = buildSnapshot();
  try {
    callback(initial);
  } catch {
    // Isolated error
  }

  // Start listening to debug events if not already
  if (!unsubscribeFromDebug) {
    unsubscribeFromDebug = subscribe((_event) => {
      notifyListeners();
    });
  }

  return () => {
    listeners.delete(callback);
    if (listeners.size === 0) {
      unsubscribeFromDebug?.();
      unsubscribeFromDebug = null;
    }
  };
}

/** Get current cached snapshot (or build fresh) */
export function getSnapshot(): DebugStoreSnapshot {
  if (cachedSnapshot) return cachedSnapshot;
  cachedSnapshot = buildSnapshot();
  return cachedSnapshot;
}

/** Clear all events and notify listeners */
export function clearAllEvents(): void {
  clearDebugHistory();
  cachedSnapshot = null;
  notifyListeners();
}

/** Export all events as JSON string */
export function exportEvents(): string {
  return exportDebugHistory();
}

/** Force refresh of the store */
export function refreshStore(): void {
  cachedSnapshot = null;
  notifyListeners();
}

/** Get retry queue entries (details from dispatcher) */
export { getRetryQueueSize } from '../core/dispatcher.ts';
