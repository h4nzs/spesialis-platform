// =============================================================================
// Analytics Platform — Event Dispatcher (Reliability Layer)
// =============================================================================
// Dispatches normalized events to providers with:
// - Error isolation: one provider failure does NOT affect others
// - Retry with exponential backoff: retryDelay * 2^attempt
// - Timeout per dispatch: configurable via dispatchTimeout
// - Provider fallback chain: try next provider on exhaustion
// - Retry queue: failed events retried in background with backoff
// =============================================================================

import type { NormalizedEvent } from '../types.ts';
import { getActiveProviders, getProvider, getProviderConfig } from '../providers/index.ts';
import { getConfig } from './config.ts';

// ── Types ─────────────────────────────────────────────────────────

export interface DispatchResult {
  provider: string;
  success: boolean;
  error?: string;
  duration: number;
  attempts?: number;
}

interface RetryQueueEntry {
  event: NormalizedEvent;
  providerName: string;
  attempts: number;
  lastError: string;
}

// ── Retry Queue ───────────────────────────────────────────────────
// Internal queue for events that failed dispatch.
// Processed periodically with exponential backoff per entry.

const retryQueue: RetryQueueEntry[] = [];
let retryProcessorId: ReturnType<typeof setInterval> | null = null;
const RETRY_PROCESSOR_INTERVAL = 10_000; // Check every 10s

function getEffectiveMaxRetries(): number {
  return getConfig().maxRetries;
}

function getRetryDelay(): number {
  return getConfig().retryDelay;
}

// ── Fire-and-Forget Dispatch (Sync) ───────────────────────────────

/**
 * Dispatch a single event to all active providers (fire-and-forget).
 *
 * Error isolation: if Plausible throws, Debug and others still receive.
 * Failed events are automatically enqueued to the retry queue
 * for background processing with exponential backoff.
 *
 * @returns Array of per-provider dispatch results
 */
export function dispatch(event: NormalizedEvent): DispatchResult[] {
  const providers = getActiveProviders();
  const results: DispatchResult[] = [];

  for (const provider of providers) {
    const start = performance.now();
    try {
      // Handle both sync and async providers
      const trackResult = provider.track(event);
      if (trackResult instanceof Promise) {
        trackResult.catch((error) => {
          const message = error instanceof Error ? error.message : String(error);
          enqueueRetry(event, provider.name, message);
        });
      }
      results.push({
        provider: provider.name,
        success: true,
        duration: performance.now() - start,
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      console.warn(`[Analytics] Provider "${provider.name}" failed:`, message);
      results.push({
        provider: provider.name,
        success: false,
        error: message,
        duration: performance.now() - start,
      });
      // Enqueue failed event to retry queue for background processing
      enqueueRetry(event, provider.name, message);
    }
  }

  return results;
}

// ── Reliable Dispatch (Async — Retry + Timeout + Fallback) ────────

/**
 * Dispatch to a single provider with retry and timeout.
 * Retries up to `maxRetries` times with exponential backoff.
 * Each attempt has a `dispatchTimeout` ms timeout.
 */
async function dispatchToProvider(
  event: NormalizedEvent,
  providerName: string,
): Promise<DispatchResult> {
  const provider = getProvider(providerName);
  const pConfig = getProviderConfig(providerName);
  if (!provider || !pConfig?.enabled) {
    return {
      provider: providerName,
      success: false,
      error: 'Provider not found or disabled',
      duration: 0,
    };
  }

  const maxRetries = getEffectiveMaxRetries();
  const baseDelay = getRetryDelay();
  const timeout = getConfig().dispatchTimeout;

  let lastError: string | undefined;
  const startTime = performance.now();

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const callResult = provider.track(event);

      if (callResult instanceof Promise) {
        // ── Timeout via Promise.race ───────────────────────────────
        await Promise.race([
          callResult,
          new Promise<void>((_, reject) =>
            setTimeout(() => reject(new Error(`Timeout after ${timeout}ms`)), timeout),
          ),
        ]);
      }

      return {
        provider: providerName,
        success: true,
        duration: performance.now() - startTime,
        attempts: attempt + 1,
      };
    } catch (error) {
      lastError = error instanceof Error ? error.message : String(error);

      if (attempt < maxRetries) {
        const delay = baseDelay * Math.pow(2, attempt);
        console.warn(
          `[Analytics] Provider "${providerName}" attempt ${attempt + 1}/${maxRetries + 1} failed. Retrying in ${delay}ms:`,
          lastError,
        );
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }
  }

  return {
    provider: providerName,
    success: false,
    error: lastError,
    duration: performance.now() - startTime,
    attempts: maxRetries + 1,
  };
}

/**
 * Reliable dispatch with full fallback chain.
 *
 * 1. Tries the primary provider with retry + timeout
 * 2. If all retries exhausted, tries fallback providers in priority order
 * 3. If ALL providers fail, enqueues to retry queue
 *
 * @returns Array of per-provider dispatch results (all attempts across chain)
 */
export async function dispatchReliable(event: NormalizedEvent): Promise<DispatchResult[]> {
  const strategy = getConfig().fallbackStrategy;
  const results: DispatchResult[] = [];

  if (strategy === 'parallel') {
    // ── Parallel: dispatch to all active providers concurrently ───
    const providers = getActiveProviders();
    const promises = providers.map((p) => dispatchToProvider(event, p.name));
    const settled = await Promise.allSettled(promises);
    for (const s of settled) {
      if (s.status === 'fulfilled') {
        results.push(s.value);
        if (!s.value.success) {
          // Enqueue failed provider's event to retry queue
          enqueueRetry(event, s.value.provider, s.value.error ?? 'Unknown error');
        }
      }
    }
  } else {
    // ── Failover: try providers in priority order until one succeeds ─
    const providers = getActiveProviders()
      .map((p) => ({ name: p.name }))
      .sort((a, b) => {
        const pa = getProviderConfig(a.name)?.priority ?? 100;
        const pb = getProviderConfig(b.name)?.priority ?? 100;
        return pa - pb;
      });

    let anySucceeded = false;

    for (const { name } of providers) {
      if (anySucceeded) {
        // Still dispatch to lower-priority providers (best-effort)
        const result = await dispatchToProvider(event, name);
        results.push(result);
        continue;
      }

      const result = await dispatchToProvider(event, name);
      results.push(result);

      if (result.success) {
        anySucceeded = true;
      }
    }

    // If all providers failed, enqueue for background retry
    if (!anySucceeded) {
      for (const result of results) {
        if (!result.success) {
          enqueueRetry(event, result.provider, result.error ?? 'Unknown error');
        }
      }
    }
  }

  return results;
}

// ── Retry Queue Management ────────────────────────────────────────

/** Enqueue a failed event for background retry */
function enqueueRetry(event: NormalizedEvent, providerName: string, lastError: string): void {
  // Avoid duplicate entries for same event+provider combination
  const existing = retryQueue.find(
    (e) => e.event.id === event.id && e.providerName === providerName,
  );
  if (existing) return;

  retryQueue.push({ event, providerName, attempts: 0, lastError });
}

/** Process pending retries — called periodically */
async function processRetryQueue(): Promise<void> {
  if (retryQueue.length === 0) return;

  const batch = retryQueue.splice(0);
  const maxRetries = getEffectiveMaxRetries();

  for (const entry of batch) {
    entry.attempts++;
    const result = await dispatchToProvider(entry.event, entry.providerName);

    if (!result.success && entry.attempts <= maxRetries) {
      // Re-enqueue with backoff
      const delay = getRetryDelay() * Math.pow(2, entry.attempts);
      setTimeout(() => {
        retryQueue.push(entry);
      }, delay);
    } else if (!result.success) {
      console.warn(
        `[Analytics] All retries exhausted for "${entry.event.name}" → "${entry.providerName}":`,
        entry.lastError,
      );
    }
  }
}

/** Start the background retry processor */
export function startRetryProcessor(): void {
  if (retryProcessorId !== null) return;
  retryProcessorId = setInterval(processRetryQueue, RETRY_PROCESSOR_INTERVAL);
}

/** Stop the background retry processor */
export function stopRetryProcessor(): void {
  if (retryProcessorId !== null) {
    clearInterval(retryProcessorId);
    retryProcessorId = null;
  }
}

/** Get pending retry queue size (for diagnostics) */
export function getRetryQueueSize(): number {
  return retryQueue.length;
}

/** Drain all pending retries immediately */
export async function drainRetryQueue(): Promise<void> {
  await processRetryQueue();
}

// ── Batch Dispatch (with reliability) ─────────────────────────────

/**
 * Dispatch a batch of events to providers that support batching.
 * Falls back to individual dispatchReliable() for non-batching providers.
 */
export async function dispatchBatchReliable(
  events: NormalizedEvent[],
): Promise<DispatchResult[][]> {
  const providers = getActiveProviders();
  const allResults: DispatchResult[][] = [];

  for (const provider of providers) {
    const pConfig = getProviderConfig(provider.name);
    if (!pConfig?.enabled) continue;

    if (provider.trackBatch) {
      const start = performance.now();
      try {
        const result = provider.trackBatch(events);
        if (result instanceof Promise) {
          await Promise.race([
            result,
            new Promise<never>((_, reject) =>
              setTimeout(
                () => reject(new Error(`Batch timeout after ${getConfig().dispatchTimeout}ms`)),
                getConfig().dispatchTimeout,
              ),
            ),
          ]);
        }
        allResults.push(
          events.map(() => ({
            provider: provider.name,
            success: true,
            duration: performance.now() - start,
          })),
        );
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        console.warn(`[Analytics] Provider "${provider.name}" batch failed:`, message);
        // Fallback: dispatch each event individually with retry
        const individualResults = await Promise.all(events.map((event) => dispatchReliable(event)));
        allResults.push(...individualResults);
      }
    } else {
      // Fallback: dispatch individually for non-batching providers
      const individualResults = await Promise.all(events.map((event) => dispatchReliable(event)));
      allResults.push(...individualResults);
    }
  }

  return allResults;
}
