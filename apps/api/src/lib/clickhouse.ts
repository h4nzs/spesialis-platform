// =============================================================================
// ClickHouse HTTP Client
// =============================================================================
// Native HTTP client for ClickHouse. Uses fetch() to POST SQL queries
// to ClickHouse's HTTP interface (port 8123).
//
// Reference: https://clickhouse.com/docs/en/interfaces/http
// =============================================================================

import { error } from './response.ts';
import type { Context } from 'hono';

// ── Configuration ─────────────────────────────────────────────────

interface ClickHouseConfig {
  /** Base URL (e.g. http://plausible-clickhouse:8123) */
  host: string;
  /** Database name */
  database: string;
  /** Request timeout in ms */
  timeout: number;
  /** Username (optional, for auth) */
  username?: string;
  /** Password (optional, for auth) */
  password?: string;
}

const DEFAULT_CONFIG: ClickHouseConfig = {
  host: process.env.CLICKHOUSE_HOST ?? 'http://localhost:8123',
  database: process.env.CLICKHOUSE_DATABASE ?? 'plausible',
  timeout: Number(process.env.CLICKHOUSE_TIMEOUT ?? 30_000),
};

// ── Client ─────────────────────────────────────────────────────────

export interface ClickHouseRow {
  [column: string]: unknown;
}

export interface ClickHouseResult<T extends ClickHouseRow = ClickHouseRow> {
  rows: T[];
  meta: { name: string; type: string }[];
  statistics: {
    elapsed: number;
    rows_read: number;
    bytes_read: number;
  };
}

/**
 * Execute a ClickHouse SQL query and return parsed JSON result.
 *
 * Uses ClickHouse HTTP interface with `default_format=JSONCompact`.
 * All queries use parameterized placeholders `{name:Type}` for safety.
 *
 * @example
 * ```ts
 * const result = await query<{ count: number }>(
 *   'SELECT count() AS count FROM events WHERE site_id = {siteId:UInt64}',
 *   { siteId: 1 },
 * );
 * ```
 */
export async function query<T extends ClickHouseRow = ClickHouseRow>(
  sql: string,
  params: Record<string, unknown> = {},
  config: Partial<ClickHouseConfig> = {},
): Promise<ClickHouseResult<T>> {
  const cfg = { ...DEFAULT_CONFIG, ...config };
  const url = new URL('/', cfg.host);

  url.searchParams.set('default_format', 'JSONCompact');
  url.searchParams.set('database', cfg.database);

  // Build parameterized query — ClickHouse uses {name:Type} placeholders
  // We encode them as query parameters: param_name=value
  const queryParams = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    queryParams.set(`param_${key}`, String(value));
  }

  const fullUrl = `${url.toString()}?${url.searchParams.toString()}&${queryParams.toString()}`;

  const headers: Record<string, string> = {
    'Content-Type': 'application/x-www-form-urlencoded',
  };

  if (cfg.username && cfg.password) {
    const encoded = btoa(`${cfg.username}:${cfg.password}`);
    headers['Authorization'] = `Basic ${encoded}`;
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), cfg.timeout);

  try {
    const response = await fetch(fullUrl, {
      method: 'POST',
      headers,
      body: sql,
      signal: controller.signal,
    });

    if (!response.ok) {
      const text = await response.text().catch(() => 'Unknown error');
      throw new ClickHouseError(
        `ClickHouse request failed (${response.status}): ${text}`,
        response.status,
      );
    }

    const data = (await response.json()) as {
      data: T[];
      meta: { name: string; type: string }[];
      statistics: {
        elapsed: number;
        rows_read: number;
        bytes_read: number;
      };
    };

    return {
      rows: data.data,
      meta: data.meta,
      statistics: data.statistics,
    };
  } catch (err) {
    if (err instanceof ClickHouseError) throw err;
    if (err instanceof DOMException && err.name === 'AbortError') {
      throw new ClickHouseError('ClickHouse query timed out', 408);
    }
    throw new ClickHouseError(
      `ClickHouse connection failed: ${err instanceof Error ? err.message : String(err)}`,
      503,
    );
  } finally {
    clearTimeout(timeoutId);
  }
}

// ── Error ─────────────────────────────────────────────────────────

export class ClickHouseError extends Error {
  constructor(
    message: string,
    public readonly statusCode: number = 500,
  ) {
    super(message);
    this.name = 'ClickHouseError';
  }
}

// ── Health Check ──────────────────────────────────────────────────

/**
 * Check if ClickHouse is reachable and has the expected database.
 * Returns null if healthy, or an error message if not.
 */
export async function checkClickHouseHealth(): Promise<string | null> {
  try {
    const result = await query<{ count: number }>(
      'SELECT count() AS count FROM system.databases WHERE name = {database:String}',
      { database: DEFAULT_CONFIG.database },
    );
    if (result.rows.length === 0 || result.rows[0]?.count === 0) {
      return `Database "${DEFAULT_CONFIG.database}" not found in ClickHouse`;
    }
    return null;
  } catch (err) {
    return err instanceof Error ? err.message : String(err);
  }
}

// ── Error Handler for Hono Routes ─────────────────────────────────

/**
 * Handle ClickHouse errors in Hono route handlers.
 * Call this from catch blocks in analytics routes.
 */
export function handleClickHouseError(c: Context, err: unknown) {
  if (err instanceof ClickHouseError) {
    if (err.statusCode === 408) {
      return error(
        c,
        'CLICKHOUSE_TIMEOUT',
        'Analytics query timed out. Try a shorter date range.',
        504,
      );
    }
    return error(c, 'CLICKHOUSE_ERROR', err.message, 502);
  }
  console.error('[Analytics] Unexpected error:', err);
  return error(c, 'ANALYTICS_ERROR', 'Failed to execute analytics query', 500);
}
