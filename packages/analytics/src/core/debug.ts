// =============================================================================
// Analytics Platform — Debug Mode
// =============================================================================
// Stores event history for developer inspection.
// Activated via config.debug = true.
// In production, this module is tree-shakeable (no side effects by default).
// Subscription mechanism enables real-time debug panel updates.
// =============================================================================

import type { DebugEvent } from '../types.ts';

const MAX_EVENTS = 500;
const history: DebugEvent[] = [];

// ── Subscription System ───────────────────────────────────────────
// Allows the debug panel to receive real-time event updates.

type EventSubscriber = (event: DebugEvent) => void;
const subscribers = new Set<EventSubscriber>();

/** Subscribe to new debug events as they arrive */
export function subscribe(callback: EventSubscriber): () => void {
  subscribers.add(callback);
  return () => {
    subscribers.delete(callback);
  };
}

/** Notify all subscribers of a new debug event */
function notifySubscribers(event: DebugEvent): void {
  for (const fn of subscribers) {
    try {
      fn(event);
    } catch {
      // Subscriber error must not break the pipeline
    }
  }
}

/**
 * Add an event to the debug history.
 */
export function addDebugEvent(event: DebugEvent): void {
  history.unshift(event); // Most recent first

  // Trim history
  if (history.length > MAX_EVENTS) {
    history.length = MAX_EVENTS;
  }

  // Notify subscribers (for real-time debug panel)
  notifySubscribers(event);
}

/**
 * Get all debug events.
 */
export function getDebugEvents(): readonly DebugEvent[] {
  return history;
}

/**
 * Get debug events filtered by category.
 */
export function getDebugEventsByCategory(category: string): DebugEvent[] {
  return history.filter((e) => e.category === category);
}

/**
 * Get debug events with errors.
 */
export function getDebugErrors(): DebugEvent[] {
  return history.filter(
    (e) => !e.validation.valid || Object.values(e.dispatchResults).some((r) => !r.success),
  );
}

/**
 * Get error count (fast check without filtering all events).
 */
export function getDebugErrorCount(): number {
  let count = 0;
  for (const e of history) {
    if (!e.validation.valid || Object.values(e.dispatchResults).some((r) => !r.success)) {
      count++;
    }
  }
  return count;
}

/**
 * Clear debug history.
 */
export function clearDebugHistory(): void {
  history.length = 0;
}

/**
 * Export debug history as JSON.
 */
export function exportDebugHistory(): string {
  return JSON.stringify(history, null, 2);
}
