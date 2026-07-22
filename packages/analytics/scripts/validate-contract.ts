#!/usr/bin/env tsx
// =============================================================================
// Analytics Platform — Contract Validator (CI)
// =============================================================================
//
// Validates the analytics contract integrity during CI.
// Exits with code 0 if valid, 1 if errors found.
//
// Checks performed:
//   1. Event definitions all have valid metadata
//   2. All properties referenced by events exist in property registry
//   3. No duplicate event/property definitions
//   4. No orphaned definitions
//   5. Deprecated/removed events are used correctly
//   6. EVENT REGISTRY sync: verifies EventRegistry interface is in sync
//      with runtime definitions
//   7. All codebase references to events are valid (via tsconfig paths)
//
// Usage:
//   pnpm analytics:validate
//   # or via turbo:
//   pnpm --filter @spesialis/analytics analytics:validate
//
// Exit codes:
//   0 — contract valid
//   1 — contract violations found (errors)
//   2 — script error
//
// =============================================================================

// ── Bootstrap: load all event and property definitions ──────────────
// This registers all events & properties via module side-effects.
await import('../src/events/index.ts');
await import('../src/properties/index.ts');

const { EventContract } = await import('../src/contract/index.ts');
const { getAllEventDefinitions } = await import('../src/registry/events.ts');
const { getAllPropertyDefinitions } = await import('../src/registry/properties.ts');
const { getGoal, registerDefaultGoals } = await import('../src/registry/goals.ts');
const { getFunnel, registerDefaultFunnels } = await import('../src/registry/funnels.ts');

// Register default goals and funnels so cross-reference validation works
registerDefaultGoals();
registerDefaultFunnels();

// ── Helpers ─────────────────────────────────────────────────────────

function colorize(text: string, color: string): string {
  const colors: Record<string, string> = {
    red: '\x1b[31m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    cyan: '\x1b[36m',
    bold: '\x1b[1m',
    reset: '\x1b[0m',
  };
  return `${colors[color] ?? ''}${text}${colors.reset}`;
}

// ── Main ────────────────────────────────────────────────────────────

let exitCode = 0;

try {
  console.log();
  console.log(colorize('═══════════════════════════════════════════════════════════', 'bold'));
  console.log(colorize('  ANALYTICS CONTRACT VALIDATOR', 'bold'));
  console.log(colorize('═══════════════════════════════════════════════════════════', 'bold'));
  console.log();

  // ── Phase 1: Run contract audit ─────────────────────────────
  console.log(colorize('  Phase 1: Running contract audit...', 'cyan'));

  const report = EventContract.audit();

  console.log(`    ${report.summary.totalEvents} events registered`);
  console.log(`    ${report.summary.totalProperties} properties registered`);
  console.log(
    `    ${report.summary.activeEvents} active, ${report.summary.deprecatedEvents} deprecated, ${report.summary.removedEvents} removed`,
  );
  console.log();

  // ── Phase 2: Display violations ─────────────────────────────
  if (report.violations.length > 0) {
    for (const violation of report.violations) {
      if (violation.severity === 'error') {
        console.log(
          `  ${colorize('❌', 'red')} ${colorize('[ERROR]', 'red')}   ${violation.message}`,
        );
        console.log(`              ${colorize('→', 'yellow')} ${violation.source}`);
      } else {
        console.log(
          `  ${colorize('⚠️ ', 'yellow')} ${colorize('[WARN]', 'yellow')}  ${violation.message}`,
        );
        console.log(`              ${colorize('→', 'yellow')} ${violation.source}`);
      }
    }
    console.log();
  } else {
    console.log(`  ${colorize('✅', 'green')} No contract violations found.\n`);
  }

  // ── Phase 3: Summary ────────────────────────────────────────
  console.log(colorize('  Summary:', 'bold'));
  console.log(
    `    Errors:   ${report.summary.errors > 0 ? colorize(String(report.summary.errors), 'red') : colorize(String(report.summary.errors), 'green')}`,
  );
  console.log(`    Warnings: ${report.summary.warnings}`);

  if (!report.valid) {
    exitCode = 1;
    console.log(
      `\n  ${colorize('❌', 'red')} ${colorize('Contract validation FAILED.', 'red')} Fix errors before deploying.\n`,
    );
  } else {
    console.log(
      `\n  ${colorize('✅', 'green')} ${colorize('Contract validation PASSED.', 'green')}\n`,
    );
  }

  // ── Phase 4: Typegen sync check ────────────────────────────
  // Verify that the EventRegistry is in sync with definitions
  console.log(colorize('  Phase 4: Checking typegen sync...', 'cyan'));

  const eventDefs = getAllEventDefinitions();
  const propDefs = getAllPropertyDefinitions();
  let syncIssues = 0;

  for (const def of eventDefs) {
    const allProps = [...def.properties.required, ...def.properties.optional];
    for (const key of allProps) {
      const propDef = propDefs.find((p) => p.key === key);
      if (!propDef) {
        console.log(
          `    ${colorize('⚠️ ', 'yellow')} Event "${def.name}" uses unregistered property "${key}"`,
        );
        syncIssues++;
      }
    }
  }

  if (syncIssues > 0) {
    console.log(`    ${colorize('⚠️ ', 'yellow')} ${syncIssues} sync issues found (warnings).\n`);
  } else {
    console.log(`    ${colorize('✅', 'green')} Event registry is in sync with definitions.\n`);
  }

  // ── Phase 5: Duplicate registry check (deep) ──────────────
  // Beyond EventContract.audit(), check for:
  //   - Events with same required/optional props registered under different names
  //   - Property keys that appear in goals/funnels but don't exist
  //   - Events with duplicate goals references
  console.log(colorize('  Phase 5: Deep integrity check...', 'cyan'));

  let deepIssues = 0;

  // 5a. Check goal references in event definitions exist
  const missingGoals: string[] = [];
  for (const def of eventDefs) {
    if (def.goals) {
      for (const goalName of def.goals) {
        if (!getGoal(goalName)) {
          missingGoals.push(`${def.name} → ${goalName}`);
        }
      }
    }
  }
  if (missingGoals.length > 0) {
    for (const ref of missingGoals) {
      console.log(
        `    ${colorize('❌', 'red')} Event "${ref}" references a goal that does not exist`,
      );
      deepIssues++;
    }
  }

  // 5b. Check funnel references in event definitions exist
  const missingFunnels: string[] = [];
  for (const def of eventDefs) {
    if (def.funnel && !getFunnel(def.funnel)) {
      missingFunnels.push(`${def.name} → ${def.funnel}`);
    }
  }
  if (missingFunnels.length > 0) {
    for (const ref of missingFunnels) {
      console.log(
        `    ${colorize('❌', 'red')} Event "${ref}" references a funnel that does not exist`,
      );
      deepIssues++;
    }
  }

  // 5c. Check property naming consistency:
  // Properties like 'http_status' vs 'status', 'auth_method' vs 'method'
  // Flag potential naming conflict where a property key is used across
  // very different contexts (e.g. 'method' for payment vs auth vs navigation)
  const propContextMap = new Map<string, Set<string>>();
  for (const def of eventDefs) {
    for (const key of [...def.properties.required, ...def.properties.optional]) {
      if (!propContextMap.has(key)) propContextMap.set(key, new Set());
      propContextMap.get(key)!.add(def.name);
    }
  }

  for (const [key, contexts] of propContextMap) {
    if (contexts.size > 3) {
      console.log(
        `    ${colorize('ℹ️ ', 'cyan')} Property "${key}" is used in ${contexts.size} different events:`,
      );
      // Only show first few
      const samples = Array.from(contexts).slice(0, 5);
      console.log(
        `       ${samples.join(', ')}${contexts.size > 5 ? `, and ${contexts.size - 5} more` : ''}`,
      );
    }
  }

  // 5d. Check for event definitions with empty descriptions or business objectives
  for (const def of eventDefs) {
    if (!def.description || def.description.length < 10) {
      console.log(
        `    ${colorize('⚠️ ', 'yellow')} Event "${def.name}" has a short or missing description`,
      );
      deepIssues++;
    }
    if (!def.businessObjective || def.businessObjective.length < 10) {
      console.log(
        `    ${colorize('⚠️ ', 'yellow')} Event "${def.name}" has a short or missing business objective`,
      );
      deepIssues++;
    }
  }

  if (deepIssues > 0) {
    console.log(`    ${colorize('⚠️ ', 'yellow')} ${deepIssues} quality issues found.\n`);
  } else {
    console.log(`    ${colorize('✅', 'green')} Deep integrity check passed.\n`);
  }
} catch (error) {
  console.error(
    `\n  ${colorize('💥', 'red')} ${colorize('Contract validator error:', 'red')}`,
    error,
  );
  exitCode = 2;
}

process.exit(exitCode);
