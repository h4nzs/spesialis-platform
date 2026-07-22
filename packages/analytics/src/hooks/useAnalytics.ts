// =============================================================================
// Analytics Platform — useAnalytics Hook
// =============================================================================
// React hook for analytics access inside component islands.
// Components use this instead of calling track() directly.
// Only use inside React components (Astro islands with client:load).
// =============================================================================

import { useCallback, useState } from 'react';
import { track, trackImmediate } from '../core/tracker.ts';
import { getConfig } from '../core/tracker.ts';
import { getDebugEvents, clearDebugHistory } from '../core/debug.ts';
import { getQueue } from '../core/queue.ts';
import type { EventRegistry } from '../registry/events.ts';

/**
 * React hook for analytics tracking inside components.
 *
 * Returns track function and analytics state.
 *
 * @example
 * ```tsx
 * function BookingButton() {
 *   const analytics = useAnalytics()
 *   return (
 *     <button onClick={() => analytics.track('cta_click', {
 *       section: 'booking',
 *       cta: 'Pesan Sekarang',
 *       position: 1,
 *       page: '/services'
 *     })}>
 *       Pesan
 *     </button>
 *   )
 * }
 * ```
 */
export function useAnalytics() {
  const [isReady] = useState(true);

  const trackEvent = useCallback(
    <T extends keyof EventRegistry & string>(name: T, properties: EventRegistry[T]) => {
      track(name, properties);
    },
    [],
  );

  const trackNow = useCallback(
    <T extends keyof EventRegistry & string>(name: T, properties: EventRegistry[T]) => {
      return trackImmediate(name, properties);
    },
    [],
  );

  const flush = useCallback(() => {
    return getQueue().flush();
  }, []);

  return {
    /** Track an analytics event */
    track: trackEvent,

    /** Track immediately (bypass queue) */
    trackNow,

    /** Flush the analytics queue */
    flush,

    /** Debug mode status */
    debug: getConfig().debug,

    /** Get debug events (only in dev mode) */
    getDebugEvents: getDebugEvents,

    /** Clear debug history */
    clearDebug: clearDebugHistory,

    /** Whether analytics is initialized */
    ready: isReady,
  } as const;
}
