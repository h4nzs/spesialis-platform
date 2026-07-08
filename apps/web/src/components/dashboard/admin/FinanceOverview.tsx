import { useState, useEffect, useMemo, useCallback } from 'react';
import { createBrowserClient, formatCurrency, downloadCSV } from '@specialist/shared';
import { Card, EmptyState } from '@specialist/ui';

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

export function FinanceOverview() {
  const api = useMemo(() => createBrowserClient(), []);
  const [revenueData, setRevenueData] = useState<RevenueResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [months, setMonths] = useState(12);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await api.get<RevenueResponse>(
        `/api/v1/admin/dashboard/revenue?months=${months}`,
      );
      setRevenueData(data);
    } catch {
      setRevenueData(null);
    } finally {
      setLoading(false);
    }
  }, [api, months]);

  useEffect(() => {
    load();
  }, [load]);

  // Monthly stats from the API
  const totalRevenue = revenueData?.totalRevenue ?? 0;
  const growthPercent: number | null = revenueData?.growthPercent ?? null;
  const monthlyData = revenueData?.revenueByMonth ?? [];
  const latestMonth = monthlyData.length > 0 ? monthlyData[monthlyData.length - 1] : null;
  const latestRevenue = latestMonth?.revenue ?? 0;
  const latestOrders = latestMonth?.order_count ?? 0;

  function handlePeriodChange(e: React.ChangeEvent<HTMLSelectElement>) {
    setMonths(Number(e.target.value));
  }

  if (loading && !revenueData) {
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
      {/* Summary cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card padding="lg">
          <p className="text-body-sm text-text-primary-secondary">Total Pendapatan</p>
          <p className="mt-1 text-h3 font-bold text-success">{formatCurrency(totalRevenue)}</p>
        </Card>
        <Card padding="lg">
          <p className="text-body-sm text-text-primary-secondary">
            {latestMonth ? formatMonth(latestMonth.month) : 'Bulan Ini'}
          </p>
          <p className="mt-1 text-h3 font-bold text-primary">{formatCurrency(latestRevenue)}</p>
        </Card>
        <Card padding="lg">
          <p className="text-body-sm text-text-primary-secondary">Pesanan Dibayar</p>
          <p className="mt-1 text-h3 font-bold text-text-primary">{latestOrders}</p>
        </Card>
        <Card padding="lg">
          <p className="text-body-sm text-text-primary-secondary">Pertumbuhan</p>
          <p
            className={`mt-1 text-h3 font-bold ${growthPercent !== null && growthPercent >= 0 ? 'text-success' : 'text-danger'}`}
          >
            {growthPercent !== null ? `${growthPercent >= 0 ? '+' : ''}${growthPercent}%` : '-'}
          </p>
        </Card>
      </div>

      {/* Period selector + export */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <label htmlFor="period-select" className="text-sm font-medium text-text-primary">
            Periode:
          </label>
          <select
            id="period-select"
            value={months}
            onChange={handlePeriodChange}
            className="rounded-md border border-border-default bg-bg-surface px-3 py-1.5 text-sm text-text-primary outline-none focus:border-primary focus:ring-1 focus:ring-primary"
          >
            <option value="3">3 bulan terakhir</option>
            <option value="6">6 bulan terakhir</option>
            <option value="12">12 bulan terakhir</option>
            <option value="24">24 bulan terakhir</option>
          </select>
        </div>

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
            className="inline-flex items-center gap-1.5 rounded-lg border border-border-default bg-bg-surface px-3 py-1.5 text-body-sm font-medium text-text-primary shadow-xs transition-all duration-150 ease-out hover:bg-neutral-100 hover:shadow-sm"
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
              className="shrink-0"
            >
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="7 10 12 15 17 10" />
              <line x1="12" y1="15" x2="12" y2="3" />
            </svg>
            Export CSV
          </button>
        )}
      </div>

      {/* Monthly breakdown table */}
      <div className="rounded-xl border border-border-default bg-bg-surface p-6">
        <h3 className="mb-4 text-caption font-semibold uppercase tracking-wider text-text-primary-secondary">
          Rincian Bulanan
        </h3>
        {monthlyData.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border-default">
                  <th className="py-2 pr-4 text-left font-medium text-text-primary-secondary">
                    Bulan
                  </th>
                  <th className="py-2 pr-4 text-right font-medium text-text-primary-secondary">
                    Pesanan
                  </th>
                  <th className="py-2 text-right font-medium text-text-primary-secondary">
                    Pendapatan
                  </th>
                </tr>
              </thead>
              <tbody>
                {monthlyData.map((m) => (
                  <tr key={m.month} className="border-b border-border-default/50 last:border-0">
                    <td className="py-2.5 pr-4 text-text-primary">{formatMonth(m.month)}</td>
                    <td className="py-2.5 pr-4 text-right text-text-primary">{m.order_count}</td>
                    <td className="py-2.5 text-right font-medium text-success">
                      {formatCurrency(Number(m.revenue))}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <EmptyState title="Belum ada data pendapatan" />
        )}
      </div>

      {/* Quick actions */}
      <div className="rounded-xl border border-border-default bg-bg-surface p-6">
        <h3 className="text-sm font-semibold text-text-primary-secondary uppercase tracking-wide">
          Aksi Cepat
        </h3>
        <div className="mt-4 flex flex-wrap gap-3">
          <a
            href="/dashboard/admin/bookings"
            className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-primary-hover"
          >
            Verifikasi Pembayaran
          </a>
          <a
            href="/dashboard/admin/reports"
            className="rounded-md border border-border-default bg-bg-page px-4 py-2 text-sm font-medium text-text-primary transition-colors hover:bg-bg-surface"
          >
            Lihat Laporan
          </a>
        </div>
      </div>
    </div>
  );
}
