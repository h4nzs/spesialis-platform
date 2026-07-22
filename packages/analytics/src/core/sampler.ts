// =============================================================================
// Analytics Platform — Sampling Controller
// =============================================================================
// Deterministic sampling to control event volume.
// Uses session-based hashing so the same user either always or never sampled.
// =============================================================================

import { getSession } from './session.ts';

/**
 * Determine whether an event should be sampled (skipped).
 *
 * Uses deterministic hashing based on session ID + event name,
 * so the same session consistently samples or doesn't sample
 * the same event type — critical for funnel accuracy.
 *
 * @param name — Event name
 * @param rate — Sampling rate (0 = skip all, 1 = send all)
 * @returns true if should be SAMPLED (skipped), false if should SEND
 */
export function shouldSample(name: string, rate: number): boolean {
  // No sampling
  if (rate >= 1) return false;

  // Skip all
  if (rate <= 0) return true;

  // Deterministic hash based on session + event
  const session = getSession();
  const hash = simpleHash(`${session.id}:${name}`);
  const normalized = (hash % 10000) / 10000;

  return normalized > rate;
}

/**
 * Simple string hash (djb2 variant).
 * Not cryptographic — just for consistent sampling distribution.
 */
function simpleHash(str: string): number {
  let hash = 5381;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) + hash + str.charCodeAt(i)) & 0xffffffff;
  }
  return Math.abs(hash);
}
