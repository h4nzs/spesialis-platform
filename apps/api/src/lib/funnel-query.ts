// =============================================================================
// Funnel Query Builder for ClickHouse
// =============================================================================
// Generates ClickHouse SQL queries for funnel analysis using windowFunnel.
// Converts FunnelDefinition (from analytics package) into executable queries.
//
// Reference: https://clickhouse.com/docs/en/sql-reference/aggregate-functions/parametric-functions#windowfunnel
// =============================================================================

// ── Types ─────────────────────────────────────────────────────────
// Inlined from @spesialis/analytics to avoid importing browser-dependent package server-side.

export interface FunnelStepDef {
  order: number;
  name: string;
  event: string;
  optional?: boolean;
}

export interface FunnelDef {
  name: string;
  description: string;
  kpi: string;
  steps: readonly FunnelStepDef[];
  window: number;
}

export interface FunnelStepResult {
  order: number;
  name: string;
  event: string;
  users: number;
  conversionRate: number;
  dropOff: number;
  dropOffRate: number;
}

export interface FunnelQueryResult {
  funnel: {
    name: string;
    label: string;
  };
  period: {
    start: string;
    end: string;
  };
  steps: FunnelStepResult[];
  overallConversionRate: number;
  totalUsers: number;
  totalConverted: number;
  metadata: {
    queryTimeMs: number;
    cached: boolean;
  };
}

export interface FunnelBreakdownSegment {
  value: string;
  users: number;
  steps: number[];
  conversionRate: number;
}

export interface FunnelBreakdownResult extends FunnelQueryResult {
  breakdown: {
    by: string;
    segments: FunnelBreakdownSegment[];
  };
}

export interface FunnelQueryParams {
  /** Funnel name (from registry) */
  name?: string;
  /** Custom steps (if not using predefined funnel) */
  steps?: { event: string; label?: string }[];
  /** Time window in seconds */
  windowSeconds?: number;
  /** Period */
  period?: {
    start: string;
    end: string;
  };
  /** Property filters */
  filters?: Record<string, string>;
  /** Breakdown column (e.g. 'browser', 'country_code') */
  breakdown?: string;
  /** Site ID in ClickHouse */
  siteId?: number;
  /** Max days to look back if period not specified */
  maxDays?: number;
}

// ── Default Funnels (inlined from registry) ───────────────────────

export const PREDEFINED_FUNNELS: Record<string, FunnelDef> = {
  booking: {
    name: 'booking',
    description: 'Customer journey from landing to booking completion',
    kpi: 'Booking Conversion Rate > 15%',
    window: 3_600_000, // 1 hour
    steps: [
      { order: 1, name: 'Landing', event: 'pageview' },
      { order: 2, name: 'View Service', event: 'service_view' },
      { order: 3, name: 'Start Booking', event: 'booking_start' },
      { order: 4, name: 'Submit Booking', event: 'booking_submit' },
      { order: 5, name: 'Payment', event: 'payment_success' },
    ],
  },
  booking_core: {
    name: 'booking_core',
    description: 'Core booking flow from start to payment',
    kpi: 'Payment Success Rate > 85%',
    window: 86_400_000, // 24 hours
    steps: [
      { order: 1, name: 'Start Booking', event: 'booking_start' },
      { order: 2, name: 'Submit Booking', event: 'booking_submit' },
      { order: 3, name: 'Payment', event: 'payment_success' },
    ],
  },
  partner_registration: {
    name: 'partner_registration',
    description: 'Partner registration from landing to completion',
    kpi: 'Partner Registration Completion Rate > 20%',
    window: 7_200_000, // 2 hours
    steps: [
      { order: 1, name: 'Landing', event: 'pageview' },
      { order: 2, name: 'CTA Click', event: 'partner_cta_click' },
      { order: 3, name: 'Register Start', event: 'partner_register_start' },
      { order: 4, name: 'Register Complete', event: 'partner_register_complete' },
    ],
  },
  corporate_lead: {
    name: 'corporate_lead',
    description: 'Corporate inquiry from landing to submission',
    kpi: 'Corporate Lead Conversion > 10%',
    window: 3_600_000, // 1 hour
    steps: [
      { order: 1, name: 'Landing', event: 'pageview' },
      { order: 2, name: 'CTA Click', event: 'corporate_cta_click' },
      { order: 3, name: 'Inquiry Start', event: 'inquiry_start' },
      { order: 4, name: 'Inquiry Submit', event: 'inquiry_submit' },
    ],
  },
  admin_assignment: {
    name: 'admin_assignment',
    description: 'Partner assignment from confirmation to acceptance',
    kpi: 'Assignment Rate > 90%',
    window: 86_400_000, // 24 hours
    steps: [
      { order: 1, name: 'Confirm Booking', event: 'booking_confirm' },
      { order: 2, name: 'Assign Partner', event: 'booking_assign' },
      { order: 3, name: 'Partner Accept', event: 'partner_job_accept' },
    ],
  },
  authentication: {
    name: 'authentication',
    description: 'User registration from start to completion',
    kpi: 'Registration Completion Rate > 70%',
    window: 1_800_000, // 30 minutes
    steps: [
      { order: 1, name: 'Register Start', event: 'register_start' },
      { order: 2, name: 'Register Complete', event: 'register_complete' },
    ],
  },
  search_to_booking: {
    name: 'search_to_booking',
    description: 'User journey from search to booking',
    kpi: 'Search to Booking Rate > 3%',
    window: 3_600_000, // 1 hour
    steps: [
      { order: 1, name: 'Search Result', event: 'search_result' },
      { order: 2, name: 'View Service', event: 'service_view' },
      { order: 3, name: 'Start Booking', event: 'booking_start' },
      { order: 4, name: 'Submit Booking', event: 'booking_submit' },
    ],
  },
};

// ── Query Builder ─────────────────────────────────────────────────

export class FunnelQueryBuilder {
  private funnel: FunnelDef;
  private siteId: number;
  private startDate: string;
  private endDate: string;
  private filters: { property: string; value: string }[];
  private breakdownColumn: string | null;

  constructor(funnel: FunnelDef) {
    this.funnel = funnel;
    this.siteId = 1; // Default: ahlipanggilan.id
    this.startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
    this.endDate = new Date().toISOString().slice(0, 10);
    this.filters = [];
    this.breakdownColumn = null;
  }

  /** Set ClickHouse site_id (default: 1 for ahlipanggilan.id) */
  setSiteId(id: number): this {
    this.siteId = id;
    return this;
  }

  /** Set date range (ISO date strings like '2026-06-01') */
  setPeriod(start: string, end: string): this {
    this.startDate = start;
    this.endDate = end;
    return this;
  }

  /** Add property filter (e.g. customer_type = 'guest') */
  addFilter(property: string, value: string): this {
    this.filters.push({ property, value });
    return this;
  }

  /** Set breakdown column (e.g. 'browser', 'country_code', 'screen_size') */
  setBreakdown(column: string): this {
    this.breakdownColumn = column;
    return this;
  }

  /**
   * Build the ClickHouse SQL query.
   * Uses parameterized placeholders for safety.
   * Generates a windowFunnel query against events_v2 directly.
   */
  build(): { sql: string; params: Record<string, unknown> } {
    const params: Record<string, unknown> = {};

    // ── Parameters ──────────────────────────────────────────────
    params['siteId'] = this.siteId;
    params['startDate'] = this.startDate;
    params['endDate'] = this.endDate;

    // ── Build windowFunnel Conditions ────────────────────────────
    const windowSeconds = Math.floor(this.funnel.window / 1000);
    const stepConditions = this.funnel.steps
      .map((step) => `name = '${step.event}'`)
      .join(',\n            ');

    // ── Filters ──────────────────────────────────────────────────
    const filterClauses: string[] = [
      'site_id = {siteId:UInt64}',
      'toDate(timestamp) >= {startDate:Date}',
      'toDate(timestamp) <= {endDate:Date}',
    ];

    // Restrict to events that are part of the funnel for performance
    const eventNames = this.funnel.steps.map((s) => `'${s.event}'`).join(', ');
    filterClauses.push(`name IN (${eventNames})`);

    // Property filters (meta.key / meta.value parallel arrays)
    for (let i = 0; i < this.filters.length; i++) {
      const f = this.filters[i]!;
      const keyParam = `filterKey${i}`;
      const valParam = `filterVal${i}`;
      params[keyParam] = f.property;
      params[valParam] = f.value;
      filterClauses.push(`has(meta.key, {${keyParam}:String})`);
      filterClauses.push(
        `meta.value[indexOf(meta.key, {${keyParam}:String})] = {${valParam}:String}`,
      );
    }

    const whereClause = filterClauses.join('\n          AND ');

    // ── Breakdown Column ─────────────────────────────────────────
    // For breakdown queries, we also group by the breakdown column
    // and include it in the SELECT so we can aggregate per segment.
    const breakdownSelect = this.breakdownColumn
      ? `\n    ${this.breakdownColumn} AS breakdown_value,`
      : '';

    const breakdownGroupBy = this.breakdownColumn ? `, ${this.breakdownColumn}` : '';

    const breakdownFinalSelect = this.breakdownColumn ? ',\n          breakdown_value' : '';

    const breakdownFinalGroupBy = this.breakdownColumn
      ? '\n      GROUP BY breakdown_value\n      ORDER BY step_1 DESC'
      : '';

    // ── Step Columns ────────────────────────────────────────────
    const stepCount = this.funnel.steps.length;
    const stepSelects: string[] = [];
    for (let i = 1; i <= stepCount; i++) {
      stepSelects.push(`countIf(steps >= ${i}) AS step_${i}`);
    }

    // ── Full Query ──────────────────────────────────────────────
    // Structure:
    //   CTE: Directly query events_v2 with windowFunnel(), grouped by user_id
    //        (and breakdown column if breakdown mode)
    //   Outer: Aggregate CTE results into step counts
    //
    // windowFunnel() works per-user: it finds the highest step each user reaches
    // within the time window. countIf() in the outer query then counts how many
    // users reached each step.
    const sql = `
      WITH funnel_data AS (
        SELECT
            user_id${breakdownSelect}
            windowFunnel(${windowSeconds})(
                timestamp,
                ${stepConditions}
            ) AS steps
        FROM plausible.events_v2
        WHERE ${whereClause}
        GROUP BY user_id${breakdownGroupBy}
      )
      SELECT
          ${stepSelects.join(',\n          ')}${breakdownFinalSelect}
      FROM funnel_data${breakdownFinalGroupBy}
    `.trim();

    return { sql, params };
  }

  /**
   * Parse ClickHouse query result into FunnelQueryResult.
   */
  parseResult(
    clickhouseRows: Record<string, number | string | undefined>[],
    startTime: number,
  ): FunnelQueryResult | FunnelBreakdownResult {
    const steps = this.funnel.steps;
    const stepCount = steps.length;
    const elapsed = performance.now() - startTime;

    // ── Determine total users (step_1 count) ─────────────────────
    // For breakdown, sum across all segments
    const totalUsers = clickhouseRows.reduce((sum, row) => {
      return sum + Number(row.step_1 ?? 0);
    }, 0);

    const lastStep = stepCount > 0 ? `step_${stepCount}` : 'step_1';
    const totalConverted = clickhouseRows.reduce((sum, row) => {
      return sum + Number(row[lastStep] ?? 0);
    }, 0);

    const overallConversionRate =
      totalUsers > 0 ? Math.round((totalConverted / totalUsers) * 1000) / 10 : 0;

    // ── Build steps result (aggregate across all segments) ───────
    // For non-breakdown queries, there's one row
    // For breakdown queries, we aggregate
    const aggregatedStepCounts: number[] = [];
    for (let i = 1; i <= stepCount; i++) {
      const col = `step_${i}` as keyof (typeof clickhouseRows)[0];
      aggregatedStepCounts.push(
        clickhouseRows.reduce((sum, row) => {
          return sum + Number(row[col] ?? 0);
        }, 0),
      );
    }

    const stepResults: FunnelStepResult[] = steps.map((step, idx) => {
      const users = aggregatedStepCounts[idx] ?? 0;
      const prevUsers = idx > 0 ? (aggregatedStepCounts[idx - 1] ?? 0) : users;
      const conversionRate = prevUsers > 0 ? Math.round((users / prevUsers) * 1000) / 10 : 0;
      const dropOff = prevUsers - users;
      const dropOffRate = prevUsers > 0 ? Math.round((dropOff / prevUsers) * 1000) / 10 : 0;

      return {
        order: step.order,
        name: step.name,
        event: step.event,
        users,
        conversionRate,
        dropOff: Math.max(0, dropOff),
        dropOffRate,
      };
    });

    const base = {
      funnel: {
        name: this.funnel.name,
        label: this.funnel.description,
      },
      period: {
        start: this.startDate,
        end: this.endDate,
      },
      steps: stepResults,
      overallConversionRate,
      totalUsers,
      totalConverted,
      metadata: {
        queryTimeMs: Math.round(elapsed),
        cached: false,
      },
    };

    // ── Breakdown ───────────────────────────────────────────────
    if (
      this.breakdownColumn &&
      clickhouseRows.length > 0 &&
      'breakdown_value' in clickhouseRows[0]!
    ) {
      const segments: FunnelBreakdownSegment[] = clickhouseRows.map((row) => {
        const segmentStepCounts: number[] = [];
        for (let i = 1; i <= stepCount; i++) {
          const col = `step_${i}` as keyof typeof row;
          segmentStepCounts.push(Number(row[col] ?? 0));
        }
        const segmentUsers = segmentStepCounts[0] ?? 0;
        const segmentConverted = segmentStepCounts[stepCount - 1] ?? 0;
        return {
          value: String(row.breakdown_value ?? 'unknown'),
          users: segmentUsers,
          steps: segmentStepCounts,
          conversionRate:
            segmentUsers > 0 ? Math.round((segmentConverted / segmentUsers) * 1000) / 10 : 0,
        };
      });

      return {
        ...base,
        breakdown: {
          by: this.breakdownColumn,
          segments,
        },
      } as FunnelBreakdownResult;
    }

    return base;
  }
}

// ── Helpers ───────────────────────────────────────────────────────

/**
 * Get a predefined funnel by name.
 * Returns undefined if not found.
 */
export function getPredefinedFunnel(name: string): FunnelDef | undefined {
  return PREDEFINED_FUNNELS[name];
}

/**
 * Get all predefined funnel names and descriptions.
 */
export function listPredefinedFunnels(): {
  name: string;
  description: string;
  kpi: string;
  stepCount: number;
}[] {
  return Object.values(PREDEFINED_FUNNELS).map((f) => ({
    name: f.name,
    description: f.description,
    kpi: f.kpi,
    stepCount: f.steps.length,
  }));
}
