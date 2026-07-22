import { useState, useEffect, useMemo, useCallback } from 'react';
import {
  createBrowserClient,
  formatCurrency,
  downloadCSV,
  formatDate,
  getInvoiceBadge,
} from '@ahlipanggilan/shared';
import { Card, Badge, EmptyState, Spinner } from '@ahlipanggilan/ui';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  CartesianGrid,
} from 'recharts';

// ── Types ─────────────────────────────────────────────────────

interface MonthRevenue {
  month: string;
  order_count: number;
  revenue: number;
}

interface RevenueResponse {
  revenueByMonth: MonthRevenue[];
  totalRevenue: number;
  growthPercent: number | null;
  monthsCount: number;
}

interface InvoiceItem {
  id: string;
  invoiceNumber: string;
  companyId: string;
  amount: string;
  status: string;
  dueDate: string;
  issuedAt: string | null;
  paidAt: string | null;
  createdAt: string;
}

// ── Helpers ────────────────────────────────────────────────────

function formatMonth(monthStr: string): string {
  const [y, m] = monthStr.split('-');
  const months = [
    'Jan',
    'Feb',
    'Mar',
    'Apr',
    'Mei',
    'Jun',
    'Jul',
    'Agu',
    'Sep',
    'Okt',
    'Nov',
    'Des',
  ];
  return `${months[Number(m) - 1] ?? ''} ${y}`;
}

function formatNumber(n: number): string {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + 'jt';
  if (n >= 1_000) return (n / 1_000).toFixed(1) + 'rb';
  return n.toLocaleString('id-ID');
}

// ── Revenue Tooltip ─────────────────────────────────────────────

function RevenueTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: { name: string; value: number }[];
  label?: string;
}) {
  if (!active || !payload?.length || !label) return null;
  return (
    <div className="rounded-lg border border-border-default bg-bg-surface p-3 shadow-lg">
      <p className="text-xs font-semibold text-text-secondary">{label}</p>
      {payload.map((entry) => (
        <p key={entry.name} className="mt-1 text-sm text-text-primary">
          {entry.name}: <span className="font-bold">{formatCurrency(entry.value)}</span>
        </p>
      ))}
    </div>
  );
}

// ── Invoice Status Badge ────────────────────────────────────────

function InvoiceStatusBadge({ status }: { status: string }) {
  const { variant, label } = getInvoiceBadge(status);
  return <Badge variant={variant}>{label}</Badge>;
}

// ── Main Component ──────────────────────────────────────────────

export function FinanceOverview() {
  const api = useMemo(() => createBrowserClient(), []);

  // Revenue state
  const [revenueData, setRevenueData] = useState<RevenueResponse | null>(null);
  const [loading, setLoading] = useState(true);

  // Invoice state
  const [invoices, setInvoices] = useState<InvoiceItem[]>([]);
  const [invoiceTotal, setInvoiceTotal] = useState(0);
  const [invoicesLoading, setInvoicesLoading] = useState(true);

  // Period
  const [months, setMonths] = useState(12);

  // ── Load revenue data ─────────────────────────────────────────
  const loadRevenue = useCallback(async () => {
    try {
      const data = await api.get<RevenueResponse>(
        `/api/v1/admin/dashboard/revenue?months=${months}`,
      );
      setRevenueData(data);
    } catch {
      setRevenueData(null);
    }
  }, [api, months]);

  // ── Load invoices (last 30 days) ──────────────────────────────
  const loadInvoices = useCallback(async () => {
    try {
      const result = await api.getPaginated<InvoiceItem>('/api/v1/invoices', {
        params: { page: 1, limit: 50 },
      });
      setInvoices(result.data);
      setInvoiceTotal(result.pagination.total);
    } catch {
      setInvoices([]);
    } finally {
      setInvoicesLoading(false);
    }
  }, [api]);

  // ── Initial load ──────────────────────────────────────────────
  useEffect(() => {
    setLoading(true);
    Promise.all([loadRevenue(), loadInvoices()]).finally(() => setLoading(false));
  }, [loadRevenue, loadInvoices]);

  // ── Derived data ──────────────────────────────────────────────
  const totalRevenue = revenueData?.totalRevenue ?? 0;
  const growthPercent: number | null = revenueData?.growthPercent ?? null;
  const monthlyData = revenueData?.revenueByMonth ?? [];
  const latestMonth = monthlyData.length > 0 ? monthlyData[monthlyData.length - 1] : null;
  const latestRevenue = latestMonth?.revenue ?? 0;
  const latestOrders = latestMonth?.order_count ?? 0;

  // Invoice stats
  const outstandingInvoices = invoices.filter(
    (inv) => inv.status === 'Issued' || inv.status === 'Overdue' || inv.status === 'Draft',
  );
  const overdueInvoices = invoices.filter((inv) => inv.status === 'Overdue');
  const paidInvoices = invoices.filter((inv) => inv.status === 'Paid');
  const recentInvoices = [...invoices]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5);

  // Chart data: add revenue line data for comparison
  const chartData = useMemo(() => {
    return monthlyData.map((m) => ({
      month: formatMonth(m.month),
      Pendapatan: Number(m.revenue),
      Pesanan: m.order_count,
    }));
  }, [monthlyData]);

  const maxRevenue = Math.max(...monthlyData.map((r) => Number(r.revenue)), 1);

  // ── Period change handler ────────────────────────────────────
  function handlePeriodChange(e: React.ChangeEvent<HTMLSelectElement>) {
    setMonths(Number(e.target.value));
  }

  // ── Loading state ─────────────────────────────────────────────
  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="rounded-xl border border-border-default bg-bg-surface p-6">
              <div
                className="animate-skeleton h-4 w-1/2 rounded-sm bg-neutral-200"
                aria-hidden="true"
              />
              <div
                className="mt-2 animate-skeleton h-8 w-1/3 rounded-sm bg-neutral-200"
                aria-hidden="true"
              />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* ═══════════════════════════════════════════════════════
          SECTION 1: KPI Cards
          ═══════════════════════════════════════════════════════ */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card padding="lg">
          <div className="flex items-center justify-between">
            <p className="text-body-sm text-text-secondary">Total Pendapatan</p>
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-success-50 text-success-600">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <line x1="12" x2="12" y1="1" y2="23" />
                <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
              </svg>
            </span>
          </div>
          <p className="mt-2 text-h3 font-bold text-success">{formatCurrency(totalRevenue)}</p>
          <p className="mt-0.5 text-caption text-text-muted">{months} bulan terakhir</p>
        </Card>

        <Card padding="lg">
          <div className="flex items-center justify-between">
            <p className="text-body-sm text-text-secondary">
              {latestMonth ? formatMonth(latestMonth.month) : 'Bulan Ini'}
            </p>
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary-50 text-primary-600">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <rect width="18" height="12" x="3" y="4" rx="2" />
                <path d="M3 16h18" />
              </svg>
            </span>
          </div>
          <p className="mt-2 text-h3 font-bold text-primary">{formatCurrency(latestRevenue)}</p>
          <p className="mt-0.5 text-caption text-text-muted">{latestOrders} pesanan dibayar</p>
        </Card>

        <Card padding="lg">
          <div className="flex items-center justify-between">
            <p className="text-body-sm text-text-secondary">Invoice Outstanding</p>
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-warning-50 text-warning-600">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M4 2v20l2-1 2 1 2-1 2 1 2-1 2 1 2-1 2 1V2l-2 1-2-1-2 1-2-1-2 1-2-1-2 1-2 1Z" />
                <path d="M8 7h8" />
                <path d="M8 11h8" />
                <path d="M8 15h5" />
              </svg>
            </span>
          </div>
          <p className="mt-2 text-h3 font-bold text-warning">{outstandingInvoices.length}</p>
          <p className="mt-0.5 text-caption text-text-muted">
            {overdueInvoices.length} jatuh tempo
          </p>
        </Card>

        <Card padding="lg">
          <div className="flex items-center justify-between">
            <p className="text-body-sm text-text-secondary">Pertumbuhan</p>
            <span
              className={`flex h-8 w-8 items-center justify-center rounded-lg ${
                growthPercent !== null && growthPercent >= 0
                  ? 'bg-success-50 text-success-600'
                  : 'bg-danger-50 text-danger-600'
              }`}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                {growthPercent !== null && growthPercent >= 0 ? (
                  <>
                    <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
                    <polyline points="17 6 23 6 23 12" />
                  </>
                ) : (
                  <>
                    <polyline points="23 18 13.5 8.5 8.5 13.5 1 6" />
                    <polyline points="17 18 23 18 23 12" />
                  </>
                )}
              </svg>
            </span>
          </div>
          <p
            className={`mt-2 text-h3 font-bold ${
              growthPercent !== null && growthPercent >= 0 ? 'text-success' : 'text-danger'
            }`}
          >
            {growthPercent !== null ? `${growthPercent >= 0 ? '+' : ''}${growthPercent}%` : '-'}
          </p>
          <p className="mt-0.5 text-caption text-text-muted">Month-over-month</p>
        </Card>
      </div>

      {/* ═══════════════════════════════════════════════════════
          SECTION 2: Revenue Chart + Controls
          ═══════════════════════════════════════════════════════ */}
      <Card padding="lg">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h3 className="text-body font-semibold text-text-primary">Tren Pendapatan</h3>
          <div className="flex items-center gap-3">
            <select
              value={months}
              onChange={handlePeriodChange}
              className="rounded-md border border-border-default bg-bg-surface px-3 py-1.5 text-xs text-text-primary outline-none focus:border-primary focus:ring-1 focus:ring-primary"
            >
              <option value="3">3 bulan</option>
              <option value="6">6 bulan</option>
              <option value="12">12 bulan</option>
              <option value="24">24 bulan</option>
            </select>

            {monthlyData.length > 0 && (
              <button
                type="button"
                onClick={() =>
                  downloadCSV(
                    ['Bulan', 'Pesanan', 'Pendapatan'],
                    monthlyData.map((m) => [
                      formatMonth(m.month),
                      String(m.order_count),
                      Number(m.revenue).toFixed(2),
                    ]),
                    `pendapatan-${months}bln.csv`,
                  )
                }
                className="inline-flex items-center gap-1.5 rounded-lg border border-border-default bg-bg-surface px-3 py-1.5 text-xs font-medium text-text-primary shadow-xs transition-all duration-150 ease-out hover:bg-neutral-100 hover:shadow-sm"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                  <polyline points="7 10 12 15 17 10" />
                  <line x1="12" y1="15" x2="12" y2="3" />
                </svg>
                Export CSV
              </button>
            )}
          </div>
        </div>

        {chartData.length > 0 ? (
          <div className="mt-6 space-y-8">
            {/* Bar Chart — Revenue */}
            <div className="h-[240px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 4, right: 8, bottom: 0, left: -16 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e6e6e6" vertical={false} />
                  <XAxis
                    dataKey="month"
                    tick={{ fontSize: 11, fill: '#6c7086' }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{ fontSize: 11, fill: '#6c7086' }}
                    axisLine={false}
                    tickLine={false}
                    tickFormatter={(v: number) => formatNumber(v)}
                  />
                  <Tooltip
                    content={<RevenueTooltip />}
                    cursor={{ fill: 'rgba(137,180,250,0.08)' }}
                  />
                  <Bar
                    dataKey="Pendapatan"
                    radius={[4, 4, 0, 0]}
                    maxBarSize={48}
                    fill="#10b981"
                    opacity={0.85}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Line Chart — Orders trend */}
            <div className="h-[180px]">
              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-text-secondary">
                Tren Pesanan
              </p>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData} margin={{ top: 4, right: 8, bottom: 0, left: -16 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e6e6e6" vertical={false} />
                  <XAxis
                    dataKey="month"
                    tick={{ fontSize: 10, fill: '#6c7086' }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{ fontSize: 10, fill: '#6c7086' }}
                    axisLine={false}
                    tickLine={false}
                    allowDecimals={false}
                  />
                  <Tooltip />
                  <Line
                    type="monotone"
                    dataKey="Pesanan"
                    stroke="#6366f1"
                    strokeWidth={2}
                    dot={{ r: 3, fill: '#6366f1' }}
                    activeDot={{ r: 5 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        ) : (
          <div className="py-12">
            <EmptyState
              title="Belum ada data pendapatan"
              description="Data akan muncul setelah ada pesanan berbayar."
            />
          </div>
        )}
      </Card>

      {/* ═══════════════════════════════════════════════════════
          SECTION 3: Invoice Status + Recent Invoices
          ═══════════════════════════════════════════════════════ */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Invoice Summary */}
        <Card padding="lg">
          <h3 className="mb-4 text-body font-semibold text-text-primary">Status Invoice</h3>

          {invoicesLoading ? (
            <div className="flex items-center justify-center py-8">
              <Spinner />
            </div>
          ) : invoices.length === 0 ? (
            <EmptyState title="Belum ada invoice" />
          ) : (
            <div className="space-y-3">
              {/* Visual bar */}
              <div className="flex h-3 overflow-hidden rounded-full bg-neutral-100">
                {(() => {
                  const total = invoices.length;
                  const paidPct = (paidInvoices.length / total) * 100;
                  const outPct = (outstandingInvoices.length / total) * 100;
                  const overPct = (overdueInvoices.length / total) * 100;
                  return (
                    <>
                      {paidPct > 0 && (
                        <div
                          className="bg-success-400 transition-all duration-500"
                          style={{ width: `${paidPct}%` }}
                          title={`Lunas: ${paidInvoices.length}`}
                        />
                      )}
                      {outPct > 0 && (
                        <div
                          className="bg-warning-400 transition-all duration-500"
                          style={{ width: `${outPct}%` }}
                          title={`Outstanding: ${outstandingInvoices.length}`}
                        />
                      )}
                      {overPct > 0 && (
                        <div
                          className="bg-danger-400 transition-all duration-500"
                          style={{ width: `${overPct}%` }}
                          title={`Jatuh Tempo: ${overdueInvoices.length}`}
                        />
                      )}
                    </>
                  );
                })()}
              </div>

              {/* Legend */}
              <div className="grid grid-cols-3 gap-3">
                <div className="rounded-lg border border-border-default bg-bg-page p-3">
                  <div className="flex items-center gap-2">
                    <span className="h-2.5 w-2.5 rounded-full bg-success-400" />
                    <span className="text-xs text-text-secondary">Lunas</span>
                  </div>
                  <p className="mt-1 text-body font-bold text-success">{paidInvoices.length}</p>
                </div>
                <div className="rounded-lg border border-border-default bg-bg-page p-3">
                  <div className="flex items-center gap-2">
                    <span className="h-2.5 w-2.5 rounded-full bg-warning-400" />
                    <span className="text-xs text-text-secondary">Outstanding</span>
                  </div>
                  <p className="mt-1 text-body font-bold text-warning">
                    {outstandingInvoices.length}
                  </p>
                </div>
                <div className="rounded-lg border border-border-default bg-bg-page p-3">
                  <div className="flex items-center gap-2">
                    <span className="h-2.5 w-2.5 rounded-full bg-danger-400" />
                    <span className="text-xs text-text-secondary">Jatuh Tempo</span>
                  </div>
                  <p className="mt-1 text-body font-bold text-danger">{overdueInvoices.length}</p>
                </div>
              </div>

              <a
                href="/dashboard/admin/invoices"
                className="mt-2 inline-flex items-center gap-1 text-xs font-medium text-primary hover:text-primary-hover transition-colors"
              >
                Kelola Invoice →
              </a>
            </div>
          )}
        </Card>

        {/* Recent Invoices */}
        <Card padding="lg">
          <h3 className="mb-4 text-body font-semibold text-text-primary">Invoice Terbaru</h3>

          {invoicesLoading ? (
            <div className="flex items-center justify-center py-8">
              <Spinner />
            </div>
          ) : recentInvoices.length === 0 ? (
            <EmptyState title="Belum ada invoice" />
          ) : (
            <div className="space-y-2">
              {recentInvoices.map((inv) => (
                <a
                  key={inv.id}
                  href={`/dashboard/admin/invoices/${inv.id}`}
                  className="flex items-center justify-between rounded-lg border border-border-default px-3 py-2.5 transition-colors hover:bg-neutral-50"
                >
                  <div className="min-w-0 flex-1">
                    <p className="text-body-sm font-medium text-text-primary truncate">
                      {inv.invoiceNumber}
                    </p>
                    <p className="text-caption text-text-muted">
                      {inv.dueDate ? formatDate(inv.dueDate) : '-'}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-body-sm font-semibold text-text-primary">
                      {formatCurrency(inv.amount)}
                    </span>
                    <InvoiceStatusBadge status={inv.status} />
                  </div>
                </a>
              ))}

              {invoiceTotal > recentInvoices.length && (
                <a
                  href="/dashboard/admin/invoices"
                  className="mt-2 inline-flex items-center gap-1 text-xs font-medium text-primary hover:text-primary-hover transition-colors"
                >
                  Lihat semua invoice ({invoiceTotal}) →
                </a>
              )}
            </div>
          )}
        </Card>
      </div>

      {/* ═══════════════════════════════════════════════════════
          SECTION 4: Monthly Breakdown Table
          ═══════════════════════════════════════════════════════ */}
      <Card padding="lg">
        <h3 className="mb-4 text-caption font-semibold uppercase tracking-wider text-text-secondary">
          Rincian Bulanan
        </h3>
        {monthlyData.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border-default">
                  <th className="py-2 pr-4 text-left font-medium text-text-secondary">Bulan</th>
                  <th className="py-2 pr-4 text-right font-medium text-text-secondary">Pesanan</th>
                  <th className="py-2 pr-4 text-right font-medium text-text-secondary">
                    Pendapatan
                  </th>
                  <th className="py-2 text-right font-medium text-text-secondary">% dari Total</th>
                </tr>
              </thead>
              <tbody>
                {monthlyData.map((m) => (
                  <tr key={m.month} className="border-b border-border-default/50 last:border-0">
                    <td className="py-2.5 pr-4 text-text-primary">{formatMonth(m.month)}</td>
                    <td className="py-2.5 pr-4 text-right text-text-primary">{m.order_count}</td>
                    <td className="py-2.5 pr-4 text-right font-medium text-success">
                      {formatCurrency(Number(m.revenue))}
                    </td>
                    <td className="py-2.5 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <div className="h-2 w-16 overflow-hidden rounded-full bg-neutral-200">
                          <div
                            className="h-full rounded-full bg-primary-400 transition-all"
                            style={{
                              width: `${(Number(m.revenue) / maxRevenue) * 100}%`,
                            }}
                          />
                        </div>
                        <span className="text-xs text-text-muted w-8 text-right">
                          {totalRevenue > 0
                            ? `${((Number(m.revenue) / totalRevenue) * 100).toFixed(0)}%`
                            : '0%'}
                        </span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <EmptyState title="Belum ada data pendapatan" />
        )}
      </Card>

      {/* ═══════════════════════════════════════════════════════
          SECTION 5: Quick Actions
          ═══════════════════════════════════════════════════════ */}
      <Card padding="lg">
        <h3 className="text-caption font-semibold uppercase tracking-wider text-text-muted">
          Aksi Cepat
        </h3>
        <div className="mt-4 flex flex-wrap gap-3">
          <a
            href="/dashboard/admin/bookings"
            className="inline-flex h-10 items-center justify-center gap-1.5 rounded-lg bg-primary-500 px-4 text-body-sm font-semibold text-white shadow-xs transition-all duration-150 ease-out hover:bg-primary-600 hover:shadow-sm"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            </svg>
            Verifikasi Pembayaran
          </a>
          <a
            href="/dashboard/admin/invoices"
            className="inline-flex h-10 items-center justify-center gap-1.5 rounded-lg border border-border-default bg-bg-surface px-4 text-body-sm font-semibold text-text-primary shadow-xs transition-all duration-150 ease-out hover:bg-neutral-100 hover:shadow-sm"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M4 2v20l2-1 2 1 2-1 2 1 2-1 2 1 2-1 2 1V2l-2 1-2-1-2 1-2-1-2 1-2-1-2 1-2 1Z" />
              <path d="M8 7h8" />
              <path d="M8 11h8" />
              <path d="M8 15h5" />
            </svg>
            Kelola Invoice
          </a>
          <a
            href="/dashboard/admin/reports"
            className="inline-flex h-10 items-center justify-center gap-1.5 rounded-lg border border-border-default bg-bg-surface px-4 text-body-sm font-semibold text-text-primary shadow-xs transition-all duration-150 ease-out hover:bg-neutral-100 hover:shadow-sm"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="12" x2="12" y1="20" y2="10" />
              <line x1="18" x2="18" y1="20" y2="4" />
              <line x1="6" x2="6" y1="20" y2="16" />
            </svg>
            Lihat Laporan
          </a>
        </div>
      </Card>
    </div>
  );
}
