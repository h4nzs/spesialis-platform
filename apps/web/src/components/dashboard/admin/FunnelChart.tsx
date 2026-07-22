import { useState, useEffect, useMemo } from 'react';
import { createBrowserClient } from '@ahlipanggilan/shared';
import { track } from '@spesialis/analytics';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LabelList } from 'recharts';
import { Card, EmptyState, Spinner } from '@ahlipanggilan/ui';

// ── Types ─────────────────────────────────────────────────────────

interface FunnelStepResult {
  order: number;
  name: string;
  event: string;
  users: number;
  conversionRate: number;
  dropOff: number;
  dropOffRate: number;
}

interface FunnelResponse {
  funnel: { name: string; label: string };
  period: { start: string; end: string };
  steps: FunnelStepResult[];
  overallConversionRate: number;
  totalUsers: number;
  totalConverted: number;
}

interface BreakdownSegment {
  value: string;
  users: number;
  steps: number[];
  conversionRate: number;
}

interface FunnelBreakdownResponse extends FunnelResponse {
  breakdown: {
    by: string;
    segments: BreakdownSegment[];
  };
}

interface FunnelMeta {
  name: string;
  description: string;
  kpi: string;
  steps: { length: number };
}

// ── Constants ─────────────────────────────────────────────────────

const PERIODS = [
  { value: '7', label: '7 Hari' },
  { value: '30', label: '30 Hari' },
  { value: '90', label: '90 Hari' },
] as const;

const BREAKDOWN_OPTIONS = [
  { value: '', label: 'Tanpa Breakdown' },
  { value: 'browser', label: 'Browser' },
  { value: 'country_code', label: 'Negara' },
  { value: 'screen_size', label: 'Ukuran Layar' },
  { value: 'operating_system', label: 'Sistem Operasi' },
  { value: 'utm_source', label: 'UTM Source' },
] as const;

// ── Helpers ───────────────────────────────────────────────────────

function getDateRange(days: number): { start: string; end: string } {
  const end = new Date();
  const start = new Date(end.getTime() - days * 24 * 60 * 60 * 1000);
  return {
    start: start.toISOString().slice(0, 10),
    end: end.toISOString().slice(0, 10),
  };
}

function formatNumber(n: number): string {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + 'jt';
  if (n >= 1_000) return (n / 1_000).toFixed(1) + 'rb';
  return n.toLocaleString('id-ID');
}

// ── Step Tooltip ──────────────────────────────────────────────────

function StepTooltip({
  active,
  payload,
}: {
  active?: boolean;
  payload?: { name: string; value: number; payload: FunnelStepResult }[];
}) {
  if (!active || !payload?.length) return null;
  const data = payload[0]?.payload;
  if (!data) return null;

  return (
    <div className="rounded-lg border border-border-default bg-bg-surface p-3 shadow-lg">
      <p className="font-semibold text-text-primary">{data.name}</p>
      <p className="mt-1 text-sm text-text-secondary">
        Pengguna: <span className="font-medium text-text-primary">{formatNumber(data.users)}</span>
      </p>
      <p className="text-sm text-text-secondary">
        Konversi:{' '}
        <span className="font-medium text-success-500">{data.conversionRate.toFixed(1)}%</span>
      </p>
      <p className="text-sm text-text-secondary">
        Drop:{' '}
        <span className="font-medium text-danger-500">
          {formatNumber(data.dropOff)} ({data.dropOffRate.toFixed(1)}%)
        </span>
      </p>
    </div>
  );
}

// ── Breakdown Tooltip ─────────────────────────────────────────────

function BreakdownChart({
  segments,
  stepNames,
}: {
  segments: BreakdownSegment[];
  stepNames: string[];
}) {
  const chartData = useMemo(() => {
    return segments
      .sort((a, b) => b.users - a.users)
      .slice(0, 10)
      .map((s) => {
        const row: Record<string, string | number> = { name: s.value };
        s.steps.forEach((count, i) => {
          row[stepNames[i] ?? `Step ${i + 1}`] = count;
        });
        row.conversionRate = s.conversionRate;
        return row;
      });
  }, [segments, stepNames]);

  if (chartData.length === 0) return null;

  return (
    <div className="mt-6">
      <h4 className="mb-3 text-sm font-semibold text-text-secondary uppercase tracking-wide">
        Breakdown per Segmen
      </h4>
      <div className="overflow-x-auto rounded-lg border border-border-default">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border-default bg-bg-page">
              <th className="px-3 py-2 text-left font-medium text-text-secondary">Segmen</th>
              {stepNames.map((name) => (
                <th key={name} className="px-3 py-2 text-right font-medium text-text-secondary">
                  {name}
                </th>
              ))}
              <th className="px-3 py-2 text-right font-medium text-text-secondary">Konversi</th>
            </tr>
          </thead>
          <tbody>
            {chartData.map((row) => (
              <tr
                key={row.name as string}
                className="border-b border-border-default last:border-b-0 hover:bg-neutral-100/50"
              >
                <td className="px-3 py-2 font-medium text-text-primary">{row.name as string}</td>
                {stepNames.map((name) => (
                  <td key={name} className="px-3 py-2 text-right text-text-primary">
                    {formatNumber(row[name] as number)}
                  </td>
                ))}
                <td className="px-3 py-2 text-right font-medium text-success-500">
                  {String(row.conversionRate)}%
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────────

export function FunnelChart() {
  const api = useMemo(() => createBrowserClient(), []);

  // State
  const [funnels, setFunnels] = useState<FunnelMeta[]>([]);
  const [selectedFunnel, setSelectedFunnel] = useState<string>('');
  const [period, setPeriod] = useState<string>('30');
  const [breakdown, setBreakdown] = useState<string>('');
  const [data, setData] = useState<FunnelResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);

  // Track dashboard_view saat komponen mount di client
  useEffect(() => {
    track('dashboard_view', { role: 'admin', section: 'funnels' });
  }, []);

  // Fetch funnel list on mount
  useEffect(() => {
    async function loadFunnels() {
      try {
        const res = await api.get<{ funnels: FunnelMeta[] }>('/api/v1/analytics/funnels');
        setFunnels(res.funnels);
        if (res.funnels.length > 0) {
          setSelectedFunnel(res.funnels[0]!.name);
        }
      } catch {
        // Silent — user will see empty selector
      } finally {
        setLoading(false);
      }
    }
    loadFunnels();
  }, [api]);

  // Fetch funnel data when selection changes
  useEffect(() => {
    if (!selectedFunnel) return;

    let cancelled = false;
    setLoading(true);
    setError(null);

    async function load() {
      try {
        const dateRange = getDateRange(Number(period));
        const body: Record<string, unknown> = {
          period: dateRange,
        };
        if (breakdown) {
          body.breakdown = breakdown;
        }

        const res = await api.post<FunnelResponse>(`/api/v1/analytics/funnels/${selectedFunnel}`, {
          body,
        });
        if (!cancelled) {
          setData(res);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Gagal memuat data funnel');
          setData(null);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [api, selectedFunnel, period, breakdown, retryCount]);

  // ── Derived Chart Data ──────────────────────────────────────────

  const chartData = useMemo(() => {
    if (!data?.steps?.length) return [];
    return data.steps.map((step) => ({
      ...step,
      fill: `hsl(${220 + step.order * 20}, ${70 - step.order * 5}%, ${65 - step.order * 5}%)`,
    }));
  }, [data]);

  const stepNames = useMemo(() => (data?.steps ? data.steps.map((s) => s.name) : []), [data]);

  // ── Breakdown Data ──────────────────────────────────────────────

  const breakdownData = useMemo(() => {
    if (!data || !('breakdown' in data)) return null;
    return (data as FunnelBreakdownResponse).breakdown;
  }, [data]);

  // ── Render ──────────────────────────────────────────────────────

  return (
    <div className="space-y-6">
      {/* Controls */}
      <Card padding="lg">
        <div className="flex flex-wrap items-end gap-4">
          {/* Funnel Selector */}
          <div className="min-w-[200px] flex-1">
            <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-text-muted">
              Funnel
            </label>
            {loading && funnels.length === 0 ? (
              <div className="h-10 animate-pulse rounded-lg bg-neutral-200" />
            ) : (
              <select
                value={selectedFunnel}
                onChange={(e) => setSelectedFunnel(e.target.value)}
                className="h-10 w-full rounded-lg border border-border-default bg-bg-surface px-3 text-sm text-text-primary shadow-xs outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/20"
              >
                {funnels.map((f) => (
                  <option key={f.name} value={f.name}>
                    {f.description} ({f.steps?.length ?? 0} langkah)
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Period Selector */}
          <div>
            <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-text-muted">
              Periode
            </label>
            <div className="flex gap-1 rounded-lg border border-border-default bg-bg-page p-1">
              {PERIODS.map((p) => (
                <button
                  key={p.value}
                  type="button"
                  onClick={() => setPeriod(p.value)}
                  className={`cursor-pointer rounded-md px-3 py-1.5 text-xs font-semibold transition-all ${
                    period === p.value
                      ? 'bg-primary text-white shadow-xs'
                      : 'text-text-secondary hover:text-text-primary'
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          {/* Breakdown Selector */}
          <div className="min-w-[160px]">
            <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-text-muted">
              Breakdown
            </label>
            <select
              value={breakdown}
              onChange={(e) => setBreakdown(e.target.value)}
              className="h-10 w-full rounded-lg border border-border-default bg-bg-surface px-3 text-sm text-text-primary shadow-xs outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/20"
            >
              {BREAKDOWN_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* KPI Display */}
        {data && typeof data.totalUsers === 'number' && (
          <div className="mt-4 flex flex-wrap gap-6 border-t border-border-default pt-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-text-muted">KPI</p>
              <p className="mt-0.5 text-sm text-text-primary">
                {funnels.find((f) => f.name === selectedFunnel)?.kpi ?? '-'}
              </p>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-text-muted">
                Total Pengguna
              </p>
              <p className="mt-0.5 text-sm font-bold text-text-primary">
                {formatNumber(data.totalUsers)}
              </p>
            </div>
            {typeof data.overallConversionRate === 'number' && (
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-text-muted">
                  Konversi
                </p>
                <p
                  className={`mt-0.5 text-sm font-bold ${
                    data.overallConversionRate > 10
                      ? 'text-success-500'
                      : data.overallConversionRate > 5
                        ? 'text-accent-500'
                        : 'text-danger-500'
                  }`}
                >
                  {data.overallConversionRate.toFixed(1)}%
                </p>
              </div>
            )}
            {typeof data.totalConverted === 'number' && (
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-text-muted">
                  Konversi
                </p>
                <p className="mt-0.5 text-sm text-text-primary">
                  {formatNumber(data.totalConverted)} / {formatNumber(data.totalUsers)}
                </p>
              </div>
            )}
            {data.period && typeof data.period.start === 'string' && (
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-text-muted">
                  Periode
                </p>
                <p className="mt-0.5 text-sm text-text-primary">
                  {data.period.start} — {data.period.end}
                </p>
              </div>
            )}
          </div>
        )}
      </Card>

      {/* Chart Area */}
      <Card padding="lg">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Spinner />
          </div>
        ) : error ? (
          <EmptyState
            title="Gagal Memuat Data"
            description={error}
            action={
              <button
                type="button"
                onClick={() => setRetryCount((c) => c + 1)}
                className="inline-flex h-9 cursor-pointer items-center justify-center rounded-lg border border-border-default bg-bg-surface px-3 text-xs font-semibold text-text-primary shadow-xs transition-all hover:bg-neutral-100"
              >
                Coba Lagi
              </button>
            }
          />
        ) : !data ? (
          <EmptyState
            title="Pilih Funnel"
            description="Pilih funnel dari dropdown untuk melihat data konversi."
          />
        ) : !data?.steps?.length ? (
          <EmptyState
            title="Belum Ada Data"
            description="Belum ada cukup data untuk funnel ini. Coba perpanjang periode atau tunggu hingga ada pengguna yang melalui funnel."
          />
        ) : (
          <div className="space-y-6">
            {/* Bar Chart */}
            <div className="h-[320px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={chartData}
                  layout="vertical"
                  margin={{ top: 8, right: 80, bottom: 8, left: 100 }}
                  barCategoryGap="20%"
                >
                  <XAxis
                    type="number"
                    tick={{ fontSize: 11, fill: '#6c7086' }}
                    tickFormatter={formatNumber}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    type="category"
                    dataKey="name"
                    tick={{ fontSize: 12, fill: '#4a4d5e', fontWeight: 500 }}
                    axisLine={false}
                    tickLine={false}
                    width={100}
                  />
                  <Tooltip content={<StepTooltip />} cursor={{ fill: 'rgba(137,180,250,0.06)' }} />
                  <Bar dataKey="users" radius={[0, 6, 6, 0]} maxBarSize={52}>
                    <LabelList
                      dataKey="users"
                      position="right"
                      style={{ fontSize: '11px', fill: '#585b70', fontWeight: 500 }}
                    />
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Conversion Flow */}
            <div className="space-y-3">
              <h4 className="text-sm font-semibold text-text-secondary uppercase tracking-wide">
                Alur Konversi
              </h4>
              <div className="flex flex-wrap items-center gap-2">
                {data.steps?.map((step, idx) => {
                  const stepCount = data.steps?.length ?? 0;
                  return (
                    <div key={step.order} className="flex items-center gap-2">
                      {/* Step Card */}
                      <div className="rounded-lg border border-border-default bg-bg-page px-3 py-2 text-center">
                        <p className="text-xs font-medium text-text-secondary">{step.name}</p>
                        <p className="text-sm font-bold text-text-primary">
                          {formatNumber(step.users)}
                        </p>
                        {idx > 0 && (
                          <p className="text-xs text-danger-500">-{formatNumber(step.dropOff)}</p>
                        )}
                      </div>

                      {/* Arrow */}
                      {idx < stepCount - 1 && (
                        <div className="flex flex-col items-center">
                          <svg
                            width="32"
                            height="24"
                            viewBox="0 0 32 24"
                            fill="none"
                            className="text-text-muted"
                          >
                            <path
                              d="M2 12h24M20 4l8 8-8 8"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>
                          <span
                            className={`text-xs font-semibold ${
                              step.conversionRate > 50
                                ? 'text-success-500'
                                : step.conversionRate > 20
                                  ? 'text-accent-500'
                                  : 'text-danger-500'
                            }`}
                          >
                            {step.conversionRate.toFixed(1)}%
                          </span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Steps Detail Table */}
            <div className="overflow-x-auto rounded-lg border border-border-default">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border-default bg-bg-page">
                    <th className="px-4 py-3 text-left font-medium text-text-secondary">Langkah</th>
                    <th className="px-4 py-3 text-right font-medium text-text-secondary">
                      Pengguna
                    </th>
                    <th className="px-4 py-3 text-right font-medium text-text-secondary">
                      Konversi
                    </th>
                    <th className="px-4 py-3 text-right font-medium text-text-secondary">
                      Drop Off
                    </th>
                    <th className="px-4 py-3 text-right font-medium text-text-secondary">
                      Drop Rate
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {data.steps?.map((step) => (
                    <tr
                      key={step.order}
                      className="border-b border-border-default last:border-b-0 hover:bg-neutral-100/50"
                    >
                      <td className="px-4 py-3 font-medium text-text-primary">
                        <div className="flex items-center gap-2">
                          <span
                            className="flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold"
                            style={{
                              backgroundColor: `hsl(${220 + step.order * 20}, 70%, 92%)`,
                              color: `hsl(${220 + step.order * 20}, 70%, 35%)`,
                            }}
                          >
                            {step.order}
                          </span>
                          {step.name}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-right font-bold text-text-primary">
                        {formatNumber(step.users)}
                      </td>
                      <td className="px-4 py-3 text-right font-semibold text-success-500">
                        {step.conversionRate.toFixed(1)}%
                      </td>
                      <td className="px-4 py-3 text-right font-semibold text-danger-500">
                        {formatNumber(step.dropOff)}
                      </td>
                      <td className="px-4 py-3 text-right text-text-secondary">
                        <div className="flex items-center justify-end gap-2">
                          <div className="h-2 w-20 overflow-hidden rounded-full bg-neutral-200">
                            <div
                              className="h-full rounded-full bg-danger-400 transition-all"
                              style={{ width: `${Math.min(step.dropOffRate, 100)}%` }}
                            />
                          </div>
                          <span className="w-12 text-right text-xs font-medium text-text-secondary">
                            {step.dropOffRate.toFixed(1)}%
                          </span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Breakdown Table */}
            {breakdownData && (
              <BreakdownChart segments={breakdownData.segments} stepNames={stepNames} />
            )}
          </div>
        )}
      </Card>
    </div>
  );
}
