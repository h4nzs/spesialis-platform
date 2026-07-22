// =============================================================================
// Analytics Platform — Event Queue
// =============================================================================
// Batching queue for analytics events.
// Uses requestIdleCallback when available, setTimeout as fallback.
// Flushes on: interval, batch size, page unload (sendBeacon).
// Failed dispatches are routed to the retry queue for background processing.
// =============================================================================

import type { NormalizedEvent } from '../types.ts';
import { dispatch } from './dispatcher.ts';
import { startRetryProcessor, stopRetryProcessor, getRetryQueueSize } from './dispatcher.ts';
import { getConfig } from './tracker.ts';

interface QueueInstance {
  enqueue(event: NormalizedEvent): void;
  flush(): Promise<void>;
  destroy(): void;
}

let instance: QueueInstance | null = null;

export function getQueue(): QueueInstance {
  if (!instance) {
    instance = createQueue();
  }
  return instance;
}

const STORAGE_KEY = '@spesialis/analytics/queue';

function createQueue(): QueueInstance {
  const queue: NormalizedEvent[] = [];
  let timerId: ReturnType<typeof setTimeout> | null = null;
  let idleCallbackId: number | null = null;
  let destroyed = false;
  let retryProcessorStarted = false;

  function scheduleFlush(): void {
    if (timerId !== null || destroyed) return;

    const { batchInterval } = getConfig();

    // Use requestIdleCallback for non-urgent events
    if (typeof requestIdleCallback !== 'undefined') {
      idleCallbackId = requestIdleCallback(
        () => {
          idleCallbackId = null;
          flush();
        },
        { timeout: batchInterval },
      );
    } else {
      timerId = setTimeout(() => {
        timerId = null;
        flush();
      }, batchInterval);
    }
  }

  function flush(): Promise<void> {
    if (timerId !== null) {
      clearTimeout(timerId);
      timerId = null;
    }
    if (idleCallbackId !== null) {
      cancelIdleCallback(idleCallbackId);
      idleCallbackId = null;
    }

    if (queue.length === 0) return Promise.resolve();

    const batch = queue.splice(0, getConfig().batchSize);

    // Dispatch each event and check for failures
    // Failed events are automatically handled by dispatch() error isolation
    // For retry integration, fire-and-forget with error logging
    batch.forEach((event) => {
      const results = dispatch(event);

      // If any provider failed, ensure retry processor is running
      const hasFailure = results.some((r) => !r.success);
      if (hasFailure && !retryProcessorStarted) {
        startRetryProcessor();
        retryProcessorStarted = true;
      }
    });

    return Promise.resolve();
  }

  // ── Flush on page unload ────────────────────────────────────
  // Flush ALL remaining events via sendBeacon for reliability
  if (typeof window !== 'undefined' && typeof navigator !== 'undefined') {
    window.addEventListener('beforeunload', () => {
      if (queue.length === 0) return;

      // Try sendBeacon first (more reliable on unload)
      const events = queue.splice(0);
      const payload = JSON.stringify(events);

      if (typeof navigator.sendBeacon === 'function') {
        // Send to a beacon endpoint (providers may support it)
        // Fallback: dispatch each event synchronously
        try {
          const blob = new Blob([payload], { type: 'application/json' });
          navigator.sendBeacon('/api/analytics/beacon', blob);
        } catch {
          // sendBeacon failed — dispatch synchronously
          for (const evt of events) {
            dispatch(evt);
          }
        }
      } else {
        // No sendBeacon — dispatch synchronously (best-effort)
        for (const evt of events) {
          dispatch(evt);
        }
      }
    });
  }

  // ── Offline queue ───────────────────────────────────────────
  // Persist queued events to sessionStorage when browser goes offline,
  // flush them when connection restores.
  if (typeof window !== 'undefined' && typeof sessionStorage !== 'undefined') {
    // Restore queued events from offline period
    try {
      const stored = sessionStorage.getItem(STORAGE_KEY);
      if (stored) {
        const events = JSON.parse(stored) as NormalizedEvent[];
        for (const evt of events) {
          queue.push(evt);
        }
        sessionStorage.removeItem(STORAGE_KEY);
      }
    } catch {
      // Silent — offline queue is best-effort
    }

    window.addEventListener('online', () => {
      flush();
    });

    window.addEventListener('offline', () => {
      // Persist current queue to sessionStorage before going offline
      try {
        const pending = [...queue];
        if (pending.length > 0) {
          sessionStorage.setItem(STORAGE_KEY, JSON.stringify(pending));
        }
      } catch {
        // Silent — offline queue is best-effort
      }
    });
  }

  return {
    enqueue(event: NormalizedEvent): void {
      if (destroyed) return;

      // Immediate dispatch for critical events
      if (getConfig().batchSize === 0) {
        dispatch(event);
        return;
      }

      queue.push(event);

      // Ensure retry processor is running (it handles background retries)
      if (!retryProcessorStarted) {
        startRetryProcessor();
        retryProcessorStarted = true;
      }

      // Flush immediately if queue is full
      if (queue.length >= getConfig().batchSize) {
        flush();
      } else {
        scheduleFlush();
      }
    },

    async flush(): Promise<void> {
      return flush();
    },

    destroy(): void {
      destroyed = true;
      if (timerId !== null) clearTimeout(timerId);
      if (idleCallbackId !== null) cancelIdleCallback(idleCallbackId);
      stopRetryProcessor();
      queue.length = 0;
      instance = null;
    },
  };
}
