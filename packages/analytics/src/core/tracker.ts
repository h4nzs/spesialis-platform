// =============================================================================
// Analytics Platform — Core Tracker
// =============================================================================
// Single entry point for ALL analytics tracking.
// Every track() call flows through: validate → privacy → sample → queue → dispatch
// =============================================================================

import type { DebugEvent, NormalizedEvent, TrackOptions } from '../types.ts';
import type { EventRegistry } from '../registry/events.ts';

import { getActiveProviders } from '../providers/index.ts';
import { validateEvent } from './validator.ts';
import { privacyFilter } from './privacy.ts';
import { shouldSample } from './sampler.ts';
import { getQueue } from './queue.ts';
import { getSession } from './session.ts';
import { addDebugEvent } from './debug.ts';
import { getConfig } from './config.ts';

// ── Track — The Single Entry Point ────────────────────────────────
/**
 * Track an analytics event.
 *
 * This is the ONLY function components should call for analytics.
 * Components NEVER call providers directly.
 *
 * @example
 * ```ts
 * track('booking_submit', { service_id: 'abc', booking_id: '123' })
 * track('cta_click', { section: 'hero', cta: 'Pesan Sekarang', position: 1 })
 * ```
 */
export function track<T extends keyof EventRegistry & string>(
  name: T,
  properties: EventRegistry[T],
  options?: TrackOptions,
): void {
  // Skip if SSR
  if (typeof window === 'undefined') return;

  const startTime = performance.now();

  // 1. Generate event ID
  const eventId = generateEventId();

  // 1b. Duplicate detection — reject if same event ID within window
  if (isDuplicate(eventId)) {
    if (getConfig().debug) {
      console.warn(`[Analytics] Duplicate event suppressed: "${name}" (${eventId})`);
    }
    return;
  }

  // 2. Validate event against registry
  const validation = validateEvent(name, properties);
  if (!validation.valid) {
    console.warn(`[Analytics] Invalid event "${name}":`, validation.errors?.join(', '));
    if (getConfig().debug) {
      addDebugEvent(buildDebugEvent(eventId, name, properties, validation, [], startTime));
    }
    return;
  }

  // 3. Privacy filter
  const safeProperties = privacyFilter(name, properties);

  // 4. Sampling
  const sampled = shouldSample(name, options?.samplingRate ?? getConfig().defaultSamplingRate);
  if (sampled) return;

  // 5. Get session
  const session = getSession();

  // 6. Build normalized event
  const event: NormalizedEvent = {
    id: eventId,
    name,
    category: validation.category,
    timestamp: new Date().toISOString(),
    properties: safeProperties,
    sessionId: session.id,
    pageUrl: window.location.href,
    referrer: document.referrer || undefined,
    userId: session.userId,
    sampled: false,
  };

  // 7. Dispatch via queue
  getQueue().enqueue(event);

  // 8. Debug
  if (getConfig().debug) {
    const duration = performance.now() - startTime;
    const providers = getActiveProviders();
    addDebugEvent(
      buildDebugEvent(
        eventId,
        name,
        safeProperties,
        validation,
        providers,
        startTime,
        event,
        duration,
      ),
    );
  }
}

// ── Convenience: Track with Immediate Dispatch ────────────────────
/**
 * Track and dispatch immediately (bypasses queue).
 * Use for critical conversion events like payment_submit.
 */
export function trackImmediate<T extends keyof EventRegistry & string>(
  name: T,
  properties: EventRegistry[T],
  options?: TrackOptions,
): Promise<void> {
  track(name, properties, { ...options, immediate: true });
  return getQueue().flush();
}

// ── Internal Helpers ──────────────────────────────────────────────
function generateEventId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

function buildDebugEvent(
  id: string,
  name: string,
  properties: Record<string, unknown>,
  validation: { valid: boolean; errors?: string[]; category: string },
  providers: { name: string }[],
  startTime: number,
  event?: NormalizedEvent,
  duration?: number,
): DebugEvent {
  return {
    id,
    name,
    category: validation.category as never,
    timestamp: new Date().toISOString(),
    properties,
    sessionId: event?.sessionId ?? '',
    pageUrl: event?.pageUrl ?? window.location.href,
    userId: event?.userId,
    sampled: false,
    dispatchResults: Object.fromEntries(providers.map((p) => [p.name, { success: true }])),
    validation: {
      valid: validation.valid,
      errors: validation.errors,
    },
    duration: duration ?? performance.now() - startTime,
    queued: true,
    filtered: true,
  };
}

// ── Duplicate Detection ──────────────────────────────────────────
const recentIds = new Set<string>();
const DEDUP_WINDOW = 5000; // 5-second window

function isDuplicate(id: string): boolean {
  if (recentIds.has(id)) return true;
  recentIds.add(id);
  setTimeout(() => recentIds.delete(id), DEDUP_WINDOW);
  return false;
}

// Re-export for direct use in helpers
export { validateEvent } from './validator.ts';
export { privacyFilter } from './privacy.ts';
export { configureAnalytics, getConfig } from './config.ts';
