#!/usr/bin/env tsx
// =============================================================================
// Analytics Platform — Codebase Lint
// =============================================================================
//
// Scans the entire codebase for analytics-related violations:
//
//   1. UNREGISTERED EVENTS — track('event_name', ...) where event_name is not
//      in the EventRegistry. Prevents 'event not found' at runtime.
//
//   2. UNREGISTERED PROPERTIES — property keys used inside track() calls that
//      are not registered in the PropertyRegistry.
//
//   3. USAGE TRACKING — reports which events are used vs unused in the codebase.
//
// Usage:
//   pnpm analytics:lint
//
// Exit codes:
//   0 — no violations
//   1 — violations found
//   2 — script error
//
// =============================================================================

import { readFileSync, readdirSync, existsSync } from 'fs';
import { join, relative, dirname } from 'path';
import { fileURLToPath } from 'url';

// ── Project root calculation ──────────────────────────────────────
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const PROJECT_ROOT = join(__dirname, '..', '..', '..');

// ── Bootstrap: load all registered event names ──────────────────────
await import('../src/events/index.ts');
await import('../src/properties/index.ts');

const { getAllEventDefinitions } = await import('../src/registry/events.ts');
const { getAllPropertyDefinitions } = await import('../src/registry/properties.ts');

const registeredEvents = new Set(getAllEventDefinitions().map((d) => d.name));
const registeredProperties = new Set(getAllPropertyDefinitions().map((d) => d.key));

// ── Known helper functions that wrap track() ────────────────────────
const KNOWN_HELPERS = new Set([
  'trackNavigation',
  'trackCTA',
  'trackWhatsappClick',
  'trackServiceView',
  'trackSearch',
  'trackBookingStart',
  'trackBookingSubmit',
  'trackBookingCancel',
  'trackPaymentSuccess',
  'trackPaymentFailed',
  'trackRegisterComplete',
  'trackLoginSuccess',
  'trackPartnerRegister',
  'trackPartnerRegisterComplete',
  'trackPartnerJobAccept',
  'trackPartnerJobReject',
  'trackInquirySubmit',
  'trackArticleView',
  'trackFAQOpen',
  'trackDashboardView',
  'track404',
  'trackAPIError',
]);

// ── Explicit helper name to event name mapping ──────────────────────
// This is more reliable than algorithmic conversion (camelCase → snake_case)
// because helpers like trackCTA, track404, trackAPIError don't convert cleanly.
const HELPER_TO_EVENT: Record<string, string> = {
  trackNavigation: 'navigation_click',
  trackCTA: 'cta_click',
  trackWhatsappClick: 'whatsapp_click',
  trackServiceView: 'service_view',
  trackSearch: 'search_result',
  trackBookingStart: 'booking_start',
  trackBookingSubmit: 'booking_submit',
  trackBookingCancel: 'booking_cancel',
  trackPaymentSuccess: 'payment_success',
  trackPaymentFailed: 'payment_failed',
  trackRegisterComplete: 'register_complete',
  trackLoginSuccess: 'login_success',
  trackPartnerRegister: 'partner_register_start',
  trackPartnerRegisterComplete: 'partner_register_complete',
  trackPartnerJobAccept: 'partner_job_accept',
  trackPartnerJobReject: 'partner_job_reject',
  trackInquirySubmit: 'inquiry_submit',
  trackArticleView: 'article_view',
  trackFAQOpen: 'faq_open',
  trackDashboardView: 'dashboard_view',
  track404: 'page_404',
  trackAPIError: 'api_error',
};

// ── Auto-tracking functions that fire events without explicit helpers ─
// These are defined in client/index.ts and fire events automatically.
const AUTO_TRACKING_EVENTS = new Set([
  'pageview',
  'session_start',
  'session_end',
  'scroll_depth',
  'page_engagement',
  'outbound_link_click',
  'download_click',
  'error_boundary_caught',
  'api_error',
  'page_404',
  'lcp_measure',
  'cls_measure',
  'fid_measure',
  'ttfb_measure',
  'visibility_change',
  'history_navigation',
  'page_500',
]);

// ── Track call patterns ─────────────────────────────────────────────

// Matches track('event_name', { ... })
const TRACK_CALL_REGEX = /track\s*\(\s*['"`]([a-z_][a-z0-9_]*)['"`]/g;

// ── Results ──────────────────────────────────────────────────────────

interface Violation {
  file: string;
  line: number;
  column: number;
  type: 'unregistered_event' | 'unregistered_property';
  message: string;
}

const violations: Violation[] = [];

// ── Utilities ────────────────────────────────────────────────────────

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

/**
 * Find all source files recursively, excluding node_modules, __tests__, dist, .astro, .turbo
 */
function findSourceFiles(dir: string, maxDepth = 5): string[] {
  const results: string[] = [];
  const EXCLUDE_DIRS = new Set([
    'node_modules',
    '__tests__',
    'dist',
    '.astro',
    '.turbo',
    'coverage',
    '.git',
    '.pnpm-store',
    'migrations',
  ]);
  const INCLUDE_EXTS = new Set(['.ts', '.tsx', '.astro']);

  function walk(currentDir: string, depth: number): void {
    if (depth > maxDepth || !existsSync(currentDir)) return;

    try {
      const entries = readdirSync(currentDir, { withFileTypes: true });
      for (const entry of entries) {
        const fullPath = join(currentDir, entry.name);
        if (entry.isDirectory()) {
          if (!EXCLUDE_DIRS.has(entry.name)) {
            walk(fullPath, depth + 1);
          }
        } else if (entry.isFile()) {
          const ext = entry.name.split('.').pop() ?? '';
          if (INCLUDE_EXTS.has(`.${ext}`)) {
            results.push(fullPath);
          }
        }
      }
    } catch {
      // Permission denied or other error — skip
    }
  }

  walk(dir, 0);
  return results;
}

/**
 * Find all matches of a regex in the file content with line numbers.
 */
function findMatches(
  content: string,
  regex: RegExp,
): { match: string; line: number; column: number; groups: string[] }[] {
  const results: { match: string; line: number; column: number; groups: string[] }[] = [];

  // Clone the regex to avoid stateful lastIndex across calls
  const re = new RegExp(regex.source, regex.flags);
  re.lastIndex = 0;

  let match: RegExpExecArray | null;
  while ((match = re.exec(content)) !== null) {
    const textBefore = content.slice(0, match.index);
    const line = textBefore.split('\n').length;
    const lastNewline = textBefore.lastIndexOf('\n');
    const column = match.index - lastNewline;

    results.push({
      match: match[0],
      line,
      column,
      groups: match.slice(1).filter(Boolean),
    });
  }

  return results;
}

// ── Main ────────────────────────────────────────────────────────────

async function main(): Promise<number> {
  const scanDirs = [join(PROJECT_ROOT, 'apps'), join(PROJECT_ROOT, 'packages')];

  console.log();
  console.log(colorize('═══════════════════════════════════════════════════════════', 'bold'));
  console.log(colorize('  ANALYTICS CODEBASE LINT', 'bold'));
  console.log(colorize('═══════════════════════════════════════════════════════════', 'bold'));
  console.log();

  // Phase 1: Collect source files
  console.log(colorize('  Phase 1: Scanning codebase for track() calls...', 'cyan'));
  const files = scanDirs.flatMap((dir) => findSourceFiles(dir));
  console.log(`    ${files.length} source files found`);
  console.log();

  // Phase 2: Check each file
  const eventUsageCount = new Map<string, number>();

  for (const file of files) {
    const content = readFileSync(file, 'utf-8');
    const relPath = relative(PROJECT_ROOT, file);

    // Skip the analytics package itself (source of truth)
    if (relPath.startsWith('packages/analytics/')) continue;
    // Skip test files
    if (relPath.includes('__tests__') || relPath.includes('.test.')) continue;
    // Skip generated files
    if (relPath.includes('.generated.')) continue;

    // ── Check 1: Unregistered event names in track() calls ──
    const trackMatches = findMatches(content, TRACK_CALL_REGEX);
    for (const m of trackMatches) {
      const eventName = m.groups[0];
      if (!eventName) continue;

      eventUsageCount.set(eventName, (eventUsageCount.get(eventName) ?? 0) + 1);

      if (!registeredEvents.has(eventName)) {
        violations.push({
          file: relPath,
          line: m.line,
          column: m.column,
          type: 'unregistered_event',
          message:
            `Unregistered event "${eventName}" in track() call. ` +
            `Add it to events/index.ts or fix the event name.`,
        });
      }
    }

    // ── Check 2: Unregistered property keys in track() calls ──
    const propBlockRegex = /track\s*\(\s*['"`][^'"`]+['"`]\s*,\s*\{([^}]*)\}/gs;
    const propMatches = content.matchAll(propBlockRegex);
    for (const pm of propMatches) {
      const objContent = pm[1] ?? '';

      // Extract property keys: word before : or ?:
      const propKeys = objContent.matchAll(/([a-z_][a-z0-9_]*)\s*[:?,]/g);
      for (const pk of propKeys) {
        const propName = pk[1];
        if (propName && !registeredProperties.has(propName)) {
          const textBefore = content.slice(0, pm.index ?? 0);
          const line = textBefore.split('\n').length;

          violations.push({
            file: relPath,
            line,
            column: 1,
            type: 'unregistered_property',
            message:
              `Unregistered property "${propName}" used in track() call. ` +
              `Register it in properties/index.ts or fix the property name.`,
          });
        }
      }
    }
  }

  // Phase 3: Report violations
  if (violations.length > 0) {
    console.log(colorize(`  Phase 2: ${violations.length} violation(s) found`, 'red'));
    console.log();

    for (const v of violations) {
      const isError = v.type === 'unregistered_event' || v.type === 'unregistered_property';
      const icon = isError ? '❌' : '⚠️';
      const color = isError ? 'red' : 'yellow';
      const label = isError ? 'ERROR' : 'WARN';

      console.log(
        `  ${colorize(icon, color)} ${colorize(`[${label}]`, color)} ${v.file}:${v.line}:${v.column}`,
      );
      console.log(`       ${v.message}`);
      console.log();
    }
  } else {
    console.log(colorize('  Phase 2: No violations found ✅', 'green'));
    console.log();
  }

  // Phase 4: Event usage summary
  console.log(colorize('  Phase 3: Event usage summary', 'cyan'));
  console.log(`    ${registeredEvents.size} registered events`);
  console.log(`    ${eventUsageCount.size} events found in track() calls in codebase`);
  console.log();

  // Find unused events: intersections of registry events minus:
  // - Events found in track() calls
  // - Events fired by auto-tracking
  // - Events that have a dedicated helper
  const unusedEvents: string[] = [];
  for (const eventName of registeredEvents) {
    const usedInTrackCalls = eventUsageCount.has(eventName);
    const usedInAutoTracking = AUTO_TRACKING_EVENTS.has(eventName);

    // Check if any helper name maps to this event via explicit map
    const hasHelper = Object.entries(HELPER_TO_EVENT).some(
      ([helperName, mappedEvent]) => KNOWN_HELPERS.has(helperName) && mappedEvent === eventName,
    );

    if (!usedInTrackCalls && !usedInAutoTracking && !hasHelper) {
      unusedEvents.push(eventName);
    }
  }

  if (unusedEvents.length > 0) {
    console.log(
      `    ${colorize(String(unusedEvents.length), 'yellow')} events with zero usage found`,
    );
    for (const name of unusedEvents) {
      console.log(`      ℹ️  ${name}`);
    }
    console.log();
  } else {
    console.log(`    ${colorize('0', 'green')} unused events\n`);
  }

  // Phase 5: Summary
  const errors = violations.filter(
    (v) => v.type === 'unregistered_event' || v.type === 'unregistered_property',
  ).length;
  const hasErrors = errors > 0;

  console.log(colorize('  Summary:', 'bold'));
  console.log(
    `    Errors:   ${errors > 0 ? colorize(String(errors), 'red') : colorize(String(errors), 'green')}`,
  );
  console.log(
    `    Unused:   ${unusedEvents.length > 0 ? colorize(String(unusedEvents.length), 'yellow') : colorize('0', 'green')}`,
  );
  console.log();

  if (hasErrors) {
    console.log(
      `  ${colorize('❌', 'red')} ${colorize('Analytics lint FAILED.', 'red')} Fix errors before deploying.\n`,
    );
    return 1;
  }

  console.log(`  ${colorize('✅', 'green')} ${colorize('Analytics lint PASSED.', 'green')}\n`);
  return 0;
}

// ── Entrypoint ──────────────────────────────────────────────────────

try {
  const exitCode = await main();
  process.exit(exitCode);
} catch (error) {
  console.error(`\n  ${colorize('💥', 'red')} ${colorize('Analytics lint error:', 'red')}`, error);
  process.exit(2);
}
