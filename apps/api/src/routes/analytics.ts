// =============================================================================
// Analytics Routes — Funnel API
// =============================================================================
// Endpoints for executing ClickHouse funnel queries.
// Uses the funnel-query builder to generate windowFunnel SQL.
//
// Endpoints:
//   GET  /analytics/funnels          — List available funnel definitions
//   POST /analytics/funnels/query    — Execute a custom funnel query
//   POST /analytics/funnels/:name    — Execute a predefined funnel
//   GET  /analytics/health           — Check ClickHouse connectivity
// =============================================================================

import { Hono } from 'hono';
import { query, checkClickHouseHealth, handleClickHouseError } from '../lib/clickhouse.ts';
import { success, error } from '../lib/response.ts';
import {
  FunnelQueryBuilder,
  getPredefinedFunnel,
  listPredefinedFunnels,
} from '../lib/funnel-query.ts';
import type { FunnelQueryParams } from '../lib/funnel-query.ts';

const router = new Hono();

// ── Validation helpers ────────────────────────────────────────────
// Prevent SQL injection by restricting event names and breakdown columns
// to known-safe values.

/** Regex for safe event/property names — only snake_case alphanumeric */
const SAFE_NAME_RE = /^[a-z_][a-z0-9_]*$/;

/** Whitelist of columns safe for breakdown queries from ClickHouse events_v2 */
const VALID_BREAKDOWN_COLUMNS = [
  'browser',
  'country_code',
  'screen_size',
  'operating_system',
  'utm_source',
  'utm_medium',
  'utm_campaign',
  'referrer_source',
  'hostname',
  'pathname',
] as const;

// ── GET /analytics/funnels — List Available Funnels ───────────────

router.get('/funnels', (c) => {
  const funnels = listPredefinedFunnels();
  return success(c, {
    funnels,
    count: funnels.length,
  });
});

// ── POST /analytics/funnels/query — Custom Funnel ─────────────────

router.post('/funnels/query', async (c) => {
  try {
    const body = await c.req.json<FunnelQueryParams>();

    // Validate steps
    if (!body.steps || body.steps.length < 2) {
      return error(c, 'INVALID_FUNNEL', 'A funnel must have at least 2 steps');
    }

    // Validate event names (prevent SQL injection)
    for (const step of body.steps) {
      if (!step.event || !SAFE_NAME_RE.test(step.event)) {
        return error(
          c,
          'INVALID_EVENT',
          `Invalid event name: "${step.event ?? 'undefined'}". Use only snake_case names.`,
        );
      }
    }

    // Validate breakdown column
    if (
      body.breakdown &&
      !(VALID_BREAKDOWN_COLUMNS as readonly string[]).includes(body.breakdown)
    ) {
      return error(
        c,
        'INVALID_BREAKDOWN',
        `Invalid breakdown column: "${body.breakdown}". Valid options: ${VALID_BREAKDOWN_COLUMNS.join(', ')}`,
      );
    }

    // Build funnel definition from request
    const funnelDef = {
      name: body.name ?? 'custom',
      description: body.name ?? 'Custom funnel',
      kpi: 'N/A',
      window: (body.windowSeconds ?? 3600) * 1000,
      steps: body.steps.map((s, i) => ({
        order: i + 1,
        name: s.label ?? s.event,
        event: s.event,
      })),
    };

    // Build query
    const builder = new FunnelQueryBuilder(funnelDef);

    if (body.siteId) builder.setSiteId(body.siteId);
    if (body.period?.start && body.period?.end) {
      builder.setPeriod(body.period.start, body.period.end);
    }
    if (body.filters) {
      for (const [key, value] of Object.entries(body.filters)) {
        // Filter keys also need validation
        if (!SAFE_NAME_RE.test(key)) {
          return error(
            c,
            'INVALID_FILTER',
            `Invalid filter key: "${key}". Use only snake_case names.`,
          );
        }
        builder.addFilter(key, value);
      }
    }
    if (body.breakdown) {
      builder.setBreakdown(body.breakdown);
    }

    // Execute
    const startTime = performance.now();
    const { sql, params } = builder.build();
    const clickhouseResult = await query(sql, params);
    const result = builder.parseResult(
      clickhouseResult.rows as Record<string, number | string | undefined>[],
      startTime,
    );

    return success(c, {
      ...result,
      metadata: {
        ...result.metadata,
        clickhouseElapsed: clickhouseResult.statistics.elapsed,
        rowsRead: clickhouseResult.statistics.rows_read,
      },
    });
  } catch (err) {
    return handleClickHouseError(c, err);
  }
});

// ── POST /analytics/funnels/:name — Predefined Funnel ─────────────

router.post('/funnels/:name', async (c) => {
  try {
    const name = c.req.param('name');
    const body = await c.req
      .json<Partial<FunnelQueryParams>>()
      .catch(() => ({}) as Partial<FunnelQueryParams>);

    // Get predefined funnel
    const funnelDef = getPredefinedFunnel(name);
    if (!funnelDef) {
      return error(
        c,
        'FUNNEL_NOT_FOUND',
        `Funnel "${name}" not found. Available: ${listPredefinedFunnels()
          .map((f) => f.name)
          .join(', ')}`,
      );
    }

    // Build query
    const builder = new FunnelQueryBuilder(funnelDef);

    if (body.siteId) builder.setSiteId(body.siteId);
    if (body.period?.start && body.period?.end) {
      builder.setPeriod(body.period.start, body.period.end);
    }
    if (body.filters) {
      for (const [key, value] of Object.entries(body.filters)) {
        if (!SAFE_NAME_RE.test(key)) {
          return error(
            c,
            'INVALID_FILTER',
            `Invalid filter key: "${key}". Use only snake_case names.`,
          );
        }
        builder.addFilter(key, value);
      }
    }
    if (body.breakdown) {
      // Predefined funnel breakdown also validated
      if (!(VALID_BREAKDOWN_COLUMNS as readonly string[]).includes(body.breakdown)) {
        return error(
          c,
          'INVALID_BREAKDOWN',
          `Invalid breakdown column: "${body.breakdown}". Valid options: ${VALID_BREAKDOWN_COLUMNS.join(', ')}`,
        );
      }
      builder.setBreakdown(body.breakdown);
    }

    // Execute
    const startTime = performance.now();
    const { sql, params } = builder.build();
    const clickhouseResult = await query(sql, params);
    const result = builder.parseResult(
      clickhouseResult.rows as Record<string, number | string | undefined>[],
      startTime,
    );

    return success(c, {
      ...result,
      metadata: {
        ...result.metadata,
        clickhouseElapsed: clickhouseResult.statistics.elapsed,
        rowsRead: clickhouseResult.statistics.rows_read,
      },
    });
  } catch (err) {
    return handleClickHouseError(c, err);
  }
});

// ── GET /analytics/health — ClickHouse Health Check ───────────────

router.get('/health', async (c) => {
  const health = await checkClickHouseHealth();
  if (health === null) {
    return success(c, {
      status: 'healthy',
      database: process.env.CLICKHOUSE_DATABASE ?? 'plausible',
    });
  }
  return error(c, 'CLICKHOUSE_UNHEALTHY', health, 503);
});

export { router as analyticsRouter };
