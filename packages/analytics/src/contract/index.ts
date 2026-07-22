// =============================================================================
// Analytics Platform — Analytics Contract
// =============================================================================
// Single source of truth for event contracts.
//
// The Analytics Contract ensures:
//   - Every tracked event conforms to its registered definition
//   - Every property referenced by events exists in the property registry
//   - Deprecated/removed events are flagged
//   - Contract violations are caught at runtime (debug) and CI time (blocks build)
//
// This is the programmatic counterpart to the EventRegistry TypeScript type.
// While EventRegistry provides COMPILE-TIME safety via TypeScript,
// the Analytics Contract provides RUNTIME/CI safety via validation.
// =============================================================================

import type { EventDefinition, EventCategory, EventStatus, PropertyDefinition } from '../types.ts';
import { getEventDefinition, getAllEventDefinitions } from '../registry/events.ts';
import { getPropertyDefinition, getAllPropertyDefinitions } from '../registry/properties.ts';

// ── Contract Types ─────────────────────────────────────────────────

export interface ContractViolation {
  type:
    | 'missing_event_definition'
    | 'missing_property_definition'
    | 'unknown_property_on_event'
    | 'duplicate_event'
    | 'duplicate_property'
    | 'orphaned_event_definition'
    | 'orphaned_property_definition'
    | 'event_status_violation'
    | 'property_type_mismatch'
    | 'property_privacy_mismatch'
    | 'circular_property_reference';
  severity: 'error' | 'warning';
  message: string;
  source: string;
}

export interface ContractReport {
  valid: boolean;
  violations: ContractViolation[];
  summary: {
    totalEvents: number;
    totalProperties: number;
    activeEvents: number;
    deprecatedEvents: number;
    removedEvents: number;
    errors: number;
    warnings: number;
  };
}

// ── EventContract ──────────────────────────────────────────────────

export const EventContract = {
  // ── Validate an Event ────────────────────────────────────────
  /**
   * Validate that an event name + properties conform to the contract.
   *
   * - Unregistered events → valid: false (must be fixed)
   * - Removed events → valid: false (must not be used)
   * - Deprecated events → valid: true, deprecated: true (allowed but flagged)
   * - All other events → valid: true
   *
   * This is consistent with canTrack() — both allow deprecated events
   * but warn about them. The audit() function reports deprecated events
   * as warnings, not errors.
   */
  validateEvent(
    name: string,
    properties: Record<string, unknown>,
  ): { valid: boolean; message?: string; deprecated?: boolean } {
    const def = getEventDefinition(name);

    if (!def) {
      return {
        valid: false,
        message:
          `Event "${name}" is not registered in the contract. ` +
          `Add it to EventRegistry (runtime type) and register it in events/index.ts (metadata).`,
      };
    }

    if (def.status === 'removed') {
      return {
        valid: false,
        message:
          `Event "${name}" has been REMOVED (v${def.version}). ` +
          `Check contract migration guide. Reason: ${def.changelog ?? 'No reason provided'}`,
      };
    }

    let deprecated = false;
    if (def.status === 'deprecated') {
      deprecated = true;
    }

    // Check property contract
    for (const key of Object.keys(properties)) {
      const propDef = getPropertyDefinition(key);
      if (!propDef) {
        return {
          valid: false,
          message:
            `Property "${key}" used by event "${name}" is not registered in the contract. ` +
            `Register it in properties/index.ts first.`,
        };
      }
    }

    // Check required properties
    for (const key of def.properties.required) {
      if (!(key in properties) || properties[key] === undefined) {
        return {
          valid: false,
          message: `Required property "${key}" is missing for event "${name}".`,
        };
      }
    }

    return deprecated
      ? {
          valid: true,
          deprecated: true,
          message: `Event "${name}" is deprecated. Consider migrating.`,
        }
      : { valid: true };
  },

  // ── Run Full Contract Audit ──────────────────────────────────
  /**
   * Audit the entire event & property registry for contract violations.
   * This is the function that CI runs to validate the contract.
   */
  audit(): ContractReport {
    const violations: ContractViolation[] = [];

    // 1. Check all event definitions have valid metadata
    const eventDefs = getAllEventDefinitions();

    for (const def of eventDefs) {
      // Check that all required/optional properties exist in property registry
      const allProps = [...def.properties.required, ...def.properties.optional];
      for (const key of allProps) {
        const propDef = getPropertyDefinition(key);
        if (!propDef) {
          violations.push({
            type: 'missing_property_definition',
            severity: 'error',
            message:
              `Event "${def.name}" references property "${key}" ` +
              `that is not registered in the property contract.`,
            source: `events/index.ts → ${def.name}`,
          });
          continue;
        }

        // Check property privacy doesn't conflict with event category
        if (def.category === 'performance' && propDef.privacy === 'sensitive') {
          violations.push({
            type: 'property_privacy_mismatch',
            severity: 'warning',
            message:
              `Event "${def.name}" (${def.category}) uses sensitive property ` +
              `"${key}" — consider using 'public' for performance metrics.`,
            source: propDef.key,
          });
        }
      }

      // Check event status
      if (def.status === 'removed' && def.properties.required.length > 0) {
        violations.push({
          type: 'event_status_violation',
          severity: 'warning',
          message:
            `Event "${def.name}" is marked as REMOVED but still has ` +
            `${def.properties.required.length} required properties. ` +
            `Consider removing or setting status to 'deprecated'.`,
          source: `events/index.ts → ${def.name}`,
        });
      }
    }

    // 2. Check for orphaned property definitions (not used by any event)
    const usedProps = new Set<string>();
    for (const def of eventDefs) {
      for (const key of [...def.properties.required, ...def.properties.optional]) {
        usedProps.add(key);
      }
    }
    const allPropDefs = getAllPropertyDefinitions();
    for (const propDef of allPropDefs) {
      if (!usedProps.has(propDef.key) && !propDef.internal) {
        violations.push({
          type: 'orphaned_property_definition',
          severity: 'warning',
          message:
            `Property "${propDef.key}" is registered but not used by any event. ` +
            `Consider removing or adding it to an event.`,
          source: `properties/index.ts → ${propDef.key}`,
        });
      }
    }

    // 3. Check for duplicate event definitions
    const eventNames = new Set<string>();
    for (const def of eventDefs) {
      if (eventNames.has(def.name)) {
        violations.push({
          type: 'duplicate_event',
          severity: 'error',
          message: `Duplicate event definition: "${def.name}"`,
          source: `events/index.ts → ${def.name}`,
        });
      }
      eventNames.add(def.name);
    }

    // 4. Check for duplicate property definitions
    const propKeys = new Set<string>();
    for (const propDef of allPropDefs) {
      if (propKeys.has(propDef.key)) {
        violations.push({
          type: 'duplicate_property',
          severity: 'error',
          message: `Duplicate property definition: "${propDef.key}"`,
          source: `properties/index.ts → ${propDef.key}`,
        });
      }
      propKeys.add(propDef.key);
    }

    // 5. Build summary
    const errors = violations.filter((v) => v.severity === 'error').length;
    const warnings = violations.filter((v) => v.severity === 'warning').length;

    return {
      valid: errors === 0,
      violations,
      summary: {
        totalEvents: eventDefs.length,
        totalProperties: allPropDefs.length,
        activeEvents: eventDefs.filter((d) => d.status === 'active').length,
        deprecatedEvents: eventDefs.filter((d) => d.status === 'deprecated').length,
        removedEvents: eventDefs.filter((d) => d.status === 'removed').length,
        errors,
        warnings,
      },
    };
  },

  // ── Assert Contract — throw on violations ────────────────────
  /**
   * Assert that the contract is valid. Throws if any ERROR-level violation exists.
   * Use in CI: pnpm analytics:validate calls this, exits non-zero on failure.
   */
  assertValid(): void {
    const report = EventContract.audit();
    if (!report.valid) {
      const errorMessages = report.violations
        .filter((v) => v.severity === 'error')
        .map((v) => `  ❌ [${v.type}] ${v.message}`)
        .join('\n');

      const warningMessages = report.violations
        .filter((v) => v.severity === 'warning')
        .map((v) => `  ⚠️  [${v.type}] ${v.message}`)
        .join('\n');

      throw new Error(
        `\n═══════════════════════════════════════════════════════════\n` +
          `  ANALYTICS CONTRACT VIOLATIONS\n` +
          `═══════════════════════════════════════════════════════════\n\n` +
          `  Summary: ${report.summary.totalEvents} events, ` +
          `${report.summary.totalProperties} properties\n` +
          `  Errors: ${report.summary.errors}\n` +
          `  Warnings: ${report.summary.warnings}\n\n` +
          (errorMessages ? `── ERRORS ──\n${errorMessages}\n\n` : '') +
          (warningMessages ? `── WARNINGS ──\n${warningMessages}\n` : '') +
          `═══════════════════════════════════════════════════════════\n`,
      );
    }
  },

  // ── Get Event Metadata ───────────────────────────────────────
  /**
   * Get all metadata about an event as defined in the contract.
   * This is the programmatic way to answer "what is this event for?"
   */
  getEventMeta(name: string):
    | {
        name: string;
        category: EventCategory;
        description: string;
        businessObjective: string;
        kpi?: string;
        owner: string;
        status: EventStatus;
        version: number;
        requiredProperties: string[];
        optionalProperties: string[];
        goals: readonly string[] | undefined;
        funnel: string | undefined;
      }
    | undefined {
    const def = getEventDefinition(name);
    if (!def) return undefined;

    return {
      name: def.name,
      category: def.category,
      description: def.description,
      businessObjective: def.businessObjective,
      kpi: def.kpi,
      owner: def.owner,
      status: def.status,
      version: def.version,
      requiredProperties: Array.from(def.properties.required),
      optionalProperties: Array.from(def.properties.optional),
      goals: def.goals,
      funnel: def.funnel,
    };
  },

  // ── Check if Event Can Be Tracked ────────────────────────────
  /**
   * Check whether an event can be safely tracked based on the contract.
   * Consistent with validateEvent():
   *   - Unregistered → NOT allowed
   *   - Removed → NOT allowed
   *   - Deprecated → allowed (but flagged with warning)
   *   - Active → allowed
   */
  canTrack(name: string): { allowed: boolean; reason?: string; deprecated?: boolean } {
    const def = getEventDefinition(name);
    if (!def) {
      return { allowed: false, reason: `${name}: not registered in contract` };
    }
    if (def.status === 'removed') {
      return { allowed: false, reason: `${name}: removed since v${def.version}` };
    }
    if (def.status === 'deprecated') {
      return { allowed: true, deprecated: true, reason: `${name}: deprecated, consider migrating` };
    }
    return { allowed: true };
  },

  // ── Filter Deprecated Events ─────────────────────────────────
  /**
   * Get all deprecated events (for migration planning).
   */
  getDeprecatedEvents(): EventDefinition[] {
    return getAllEventDefinitions().filter((d) => d.status === 'deprecated');
  },

  // ── Get Removed Events ───────────────────────────────────────
  /**
   * Get all removed events (for cleanup tracking).
   */
  getRemovedEvents(): EventDefinition[] {
    return getAllEventDefinitions().filter((d) => d.status === 'removed');
  },
} as const;

export type EventContractType = typeof EventContract;
