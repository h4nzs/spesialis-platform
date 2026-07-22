// =============================================================================
// Analytics Platform — Event Validator
// =============================================================================
// Validates events against the Event Registry before dispatch.
// Rejects: unregistered events, invalid properties, wrong types, magic strings.
// =============================================================================

import type { EventCategory } from '../types.ts';
import { getEventDefinition } from '../registry/events.ts';

export interface ValidationResult {
  valid: boolean;
  category: EventCategory;
  errors?: string[];
}

/**
 * Validate an event name and properties against the event registry.
 *
 * Returns { valid: true, category } if valid.
 * Returns { valid: false, errors: [...] } with reasons if invalid.
 */
export function validateEvent(name: string, properties: Record<string, unknown>): ValidationResult {
  const definition = getEventDefinition(name);

  if (!definition) {
    return {
      valid: false,
      category: 'system',
      errors: [`Event "${name}" is not registered. Add it to EventRegistry first.`],
    };
  }

  const errors: string[] = [];

  // Check required properties
  for (const key of definition.properties.required) {
    if (!(key in properties)) {
      errors.push(`Missing required property "${key}" for event "${name}"`);
    }
  }

  // Check for unknown properties (not in required or optional)
  const allowed = new Set([...definition.properties.required, ...definition.properties.optional]);
  for (const key of Object.keys(properties)) {
    if (!allowed.has(key)) {
      errors.push(
        `Unknown property "${key}" for event "${name}". Register it in PropertyRegistry first.`,
      );
    }
  }

  // Check status
  if (definition.status === 'removed') {
    errors.push(`Event "${name}" has been removed. Check migration guide.`);
  }
  if (definition.status === 'deprecated') {
    errors.push(`Event "${name}" is deprecated since ${definition.changelog ?? 'unknown'}.`);
  }

  return {
    valid: errors.length === 0,
    category: definition.category,
    errors: errors.length > 0 ? errors : undefined,
  };
}

/**
 * Strict mode — throws on invalid events.
 * Use in development/testing for early detection.
 */
export function validateEventStrict(name: string, properties: Record<string, unknown>): void {
  const result = validateEvent(name, properties);
  if (!result.valid) {
    throw new Error(`[Analytics] Invalid event:\n${(result.errors ?? []).join('\n')}`);
  }
}
