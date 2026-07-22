// =============================================================================
// Analytics Platform — Shared Event Definition Helper
// =============================================================================
// Used by all category files to register event definitions.
// =============================================================================

import type { EventDefinition } from '../types.ts';
import { registerEventDefinition } from '../registry/events.ts';

export function ev(def: EventDefinition): EventDefinition {
  registerEventDefinition(def);
  return def;
}
