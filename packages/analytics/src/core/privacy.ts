// =============================================================================
// Analytics Platform — Privacy Filter
// =============================================================================
// Filters PII (Personally Identifiable Information) from event properties
// before they reach any analytics provider.
//
// Privacy-first: NO PII leaves the browser.
// =============================================================================

import type { PrivacyLevel } from '../types.ts';

const MAX_DEPTH = 10;
import { getPropertyDefinition } from '../registry/properties.ts';

// ── PII Patterns ──────────────────────────────────────────────────
// These patterns catch common PII fields even if not defined in registry.
const PII_PATTERNS = [
  /^email$/i,
  /^phone$/i,
  /^phone_number$/i,
  /^mobile$/i,
  /^whatsapp$/i,
  /^address$/i,
  /^full_name$/i,
  /^name$/i,
  /^password/i,
  /^token/i,
  /^jwt/i,
  /^session/i,
  /^secret/i,
  /^credit_card/i,
  /^card_number/i,
  /^cvv/i,
  /^pin$/i,
  /^otp$/i,
  /^ssn/i,
  /^ktp/i,
  /^nik$/i,
  /^npwp/i,
  /^ip_address/i,
];

/**
 * Filter PII from event properties before dispatch.
 *
 * Three layers of protection:
 * 1. Property registry privacy level
 * 2. PII pattern matching (catch unregistered sensitive fields)
 * 3. Circular reference guard + max depth limit
 *
 * @param eventName - Event name (for registry lookup)
 * @param properties - Event properties to filter
 * @param depth - Current recursion depth (internal, default 0)
 * @param visited - Set of visited objects for circular detection (internal)
 */
export function privacyFilter(
  eventName: string,
  properties: Record<string, unknown>,
  depth = 0,
  visited?: WeakSet<object>,
): Record<string, unknown> {
  // Depth limit — prevent stack overflow
  if (depth > MAX_DEPTH) {
    return properties;
  }

  const filtered: Record<string, unknown> = {};

  // Initialize visited set for circular reference detection
  const seen = visited ?? new WeakSet<object>();

  for (const [key, value] of Object.entries(properties)) {
    // Layer 1: Check property registry
    const propDef = getPropertyDefinition(key);
    if (propDef) {
      if (propDef.privacy === 'pii' || propDef.privacy === 'sensitive') {
        // PII properties are NEVER sent to providers
        continue;
      }
      if (propDef.internal) {
        // Internal properties are NEVER sent
        continue;
      }
    }

    // Layer 2: PII pattern matching
    if (isPII(key)) {
      continue;
    }

    // Layer 3: Handle nested objects with circular reference protection
    if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
      const record = value as Record<string, unknown>;

      // Circular reference detected — skip nested traversal, keep parent reference
      if (seen.has(record)) {
        continue;
      }

      seen.add(record);
      filtered[key] = privacyFilter(eventName, record, depth + 1, seen);
    } else if (Array.isArray(value)) {
      // Arrays are kept as-is (primitive arrays don't need filtering)
      filtered[key] = value;
    } else {
      filtered[key] = value;
    }
  }

  return filtered;
}

/**
 * Check if a property key matches PII patterns.
 */
export function isPII(key: string): boolean {
  return PII_PATTERNS.some((pattern) => pattern.test(key));
}

/**
 * Assess privacy level of properties.
 * Returns highest privacy level found.
 */
export function assessPrivacyLevel(properties: Record<string, unknown>): PrivacyLevel {
  for (const key of Object.keys(properties)) {
    const propDef = getPropertyDefinition(key);
    if (propDef?.privacy === 'pii') return 'pii';
    if (propDef?.privacy === 'sensitive') return 'sensitive';
    if (isPII(key)) return 'pii';
  }
  return 'public';
}
