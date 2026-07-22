// =============================================================================
// Analytics Platform — Property Registry
// =============================================================================
// Single source of truth for ALL analytics properties.
// Every property MUST be registered here.
// No hardcoded strings — use registry keys.
// =============================================================================

import type { PropertyDefinition } from '../types.ts';

// ── Definitions Store ─────────────────────────────────────────────
const definitions = new Map<string, PropertyDefinition>();

export function registerPropertyDefinition(def: PropertyDefinition): void {
  const existing = definitions.get(def.key);
  if (existing) {
    // Detect context-dependent overwrites (same key, different settings)
    if (
      existing.type !== def.type ||
      JSON.stringify(existing.allowedValues) !== JSON.stringify(def.allowedValues)
    ) {
      console.warn(
        `[Analytics] Property "${def.key}" overwritten with different settings!` +
          `\n  Previous: type=${existing.type}, allowedValues=${JSON.stringify(existing.allowedValues)}` +
          `\n  New:      type=${def.type}, allowedValues=${JSON.stringify(def.allowedValues)}` +
          `\n  This may cause type errors if "${def.key}" is used by events in different contexts.` +
          `\n  Consider using distinct property keys (e.g., "auth_method" vs "payment_method").`,
      );
    } else {
      console.warn(`[Analytics] Property "${def.key}" already registered. Overwriting.`);
    }
  }
  definitions.set(def.key, def);
}

export function getPropertyDefinition(key: string): PropertyDefinition | undefined {
  return definitions.get(key);
}

export function getAllPropertyDefinitions(): PropertyDefinition[] {
  return Array.from(definitions.values());
}

export function getPropertiesByPrivacy(privacy: string): PropertyDefinition[] {
  return Array.from(definitions.values()).filter((d) => d.privacy === privacy);
}

export function getPublicProperties(): PropertyDefinition[] {
  return Array.from(definitions.values()).filter((d) => d.privacy === 'public');
}
