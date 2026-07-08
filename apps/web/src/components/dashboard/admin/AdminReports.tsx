import { useState, useEffect, useMemo } from 'react';
import { createBrowserClient, formatCurrency } from '@specialist/shared';
import { Card, EmptyState } from '@specialist/ui';

interface RevenueMonth {
  month: string;
  order_count: number;
  revenue: number;
}

interface StatusCount {
  status: string;
  count: number;
}

interface DayCount {
  day: string;
  count: number;
}

interface TopService {
  name: string;
  slug: string;
  category: string;
  order_count: number;
}

interface ReportsData {
  summary: {
    totalOrders: number;
    totalPartners: number;
    avgRating: number;
    totalCompletedJobs: number;
  };
  revenueByMonth: RevenueMonth[];
  ordersByStatus: StatusCount[];
  ordersByDay: DayCount[];
  topServices: TopService[];
}

function monthLabel(month: string): string {
  const [y, m] = month.split('-');
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

function statusBadgeStyle(status: string): string {
  const map: Record<string, string> = {
    Paid: 'bg-success-500/10 text-success-500',
    Completed: 'bg-primary-500/10 text-primary',
    Working: 'bg-accent-500/10 text-accent-500',
    Cancelled: 'bg-danger-500/10 text-danger-500',
    Closed: 'bg-secondary/10 text-secondary',
  };
  return map[status] ?? 'bg-bg-page text-text-primary-secondary';
}

export function AdminReports() {
  const api = useMemo(() => createBrowserClient(), []);
  const [data, setData] = useState<ReportsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('revenue');

  useEffect(() => {
    async function load() {
      try {
        const result = await api.get<ReportsData>('/api/v1/admin/reports');
        setData(result);
      } catch {
        setData(null);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [api]);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="rounded-xl border border-border-default-default bg-bg-surface p-6"
            >
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

  if (!data) {
    return <p className="text-sm text-danger-500">Gagal memuat data laporan.</p>;
  }

  const maxRevenue = Math.max(...data.revenueByMonth.map((r) => Number(r.revenue)), 1);
  const maxDayCount = Math.max(...data.ordersByDay.map((d) => d.count), 1);

  const tabs = [
    { key: 'revenue', label: 'Pendapatan' },
    { key: 'orders', label: 'Pesanan' },
    { key: 'services', label: 'Layanan' },
  ];

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card padding="lg">
          <p className="text-body-sm text-text-primary-secondary">Total Pesanan</p>
          <p className="mt-1 text-h3 font-bold text-text-primary-primary">
            {data.summary.totalOrders}
          </p>
        </Card>
        <Card padding="lg">
          <p className="text-body-sm text-text-primary-secondary">Partner Terverifikasi</p>
          <p className="mt-1 text-h3 font-bold text-text-primary-primary">
            {data.summary.totalPartners}
          </p>
        </Card>
        <Card padding="lg">
          <p className="text-body-sm text-text-primary-secondary">Rating Rata-rata</p>
          <p className="mt-1 text-h3 font-bold text-accent-500">
            {Number(data.summary.avgRating).toFixed(1)}
          </p>
        </Card>
        <Card padding="lg">
          <p className="text-body-sm text-text-primary-secondary">Pekerjaan Selesai</p>
          <p className="mt-1 text-h3 font-bold text-success-500">
            {data.summary.totalCompletedJobs}
          </p>
        </Card>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-border-default">
        {tabs.map((t) => (
          <button
            key={t.key}
            type="button"
            onClick={() => setTab(t.key)}
            className={`cursor-pointer px-4 py-2 text-sm font-medium transition-colors ${
              tab === t.key
                ? 'border-b-2 border-primary text-primary'
                : 'text-text-primary-secondary hover:text-text-primary'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Revenue Tab */}
      {tab === 'revenue' && (
        <div className="space-y-4">
          <h3 className="text-sm font-semibold text-text-primary-secondary uppercase tracking-wide">
            Pendapatan per Bulan (12 Bulan Terakhir)
          </h3>
          {data.revenueByMonth.length === 0 ? (
            <EmptyState
              title="Belum ada data pendapatan"
              description="Data akan muncul setelah ada pesanan berbayar."
            />
          ) : (
            <div className="space-y-2">
              {data.revenueByMonth.map((r) => (
                <div key={r.month} className="flex items-center gap-3">
                  <span className="w-24 text-right text-xs text-text-primary-secondary">
                    {monthLabel(r.month)}
                  </span>
                  <div className="flex-1">
                    <div className="h-6 rounded bg-primary-500/10">
                      <div
                        className="h-full rounded bg-primary transition-all"
                        style={{
                          width: `${(Number(r.revenue) / maxRevenue) * 100}%`,
                        }}
                      />
                    </div>
                  </div>
                  <span className="w-32 text-right text-xs font-medium text-text-primary">
                    {formatCurrency(Number(r.revenue))}
                  </span>
                  <span className="w-16 text-right text-xs text-text-primary-secondary">
                    {r.order_count} pesanan
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Orders Tab */}
      {tab === 'orders' && (
        <div className="grid gap-6 md:grid-cols-2">
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-text-primary-secondary uppercase tracking-wide">
              Status Pesanan
            </h3>
            {data.ordersByStatus.length === 0 ? (
              <EmptyState title="Belum ada data pesanan" />
            ) : (
              <div className="space-y-2">
                {data.ordersByStatus.map((s) => (
                  <div
                    key={s.status}
                    className="flex items-center justify-between rounded-lg border border-border-default px-4 py-2"
                  >
                    <span
                      className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${statusBadgeStyle(s.status)}`}
                    >
                      {s.status}
                    </span>
                    <span className="text-sm font-bold text-text-primary">{s.count}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-text-primary-secondary uppercase tracking-wide">
              Pesanan per Hari (30 Hari Terakhir)
            </h3>
            {data.ordersByDay.length === 0 ? (
              <EmptyState title="Belum ada data pesanan" />
            ) : (
              <div className="flex items-end gap-[3px] h-40">
                {data.ordersByDay.map((d) => (
                  <div
                    key={d.day}
                    className="flex-1 rounded-t bg-primary/30 transition-all hover:bg-primary/50"
                    style={{
                      height: `${(d.count / maxDayCount) * 100}%`,
                    }}
                    title={`${d.day}: ${d.count} pesanan`}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Services Tab */}
      {tab === 'services' && (
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-text-primary-secondary uppercase tracking-wide">
            10 Layanan Terpopuler
          </h3>
          {data.topServices.length === 0 ? (
            <EmptyState title="Belum ada data layanan" />
          ) : (
            <div className="overflow-x-auto rounded-lg border border-border-default">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border-default bg-bg-page">
                    <th className="px-4 py-3 text-left font-medium text-text-primary-secondary">
                      Layanan
                    </th>
                    <th className="px-4 py-3 text-left font-medium text-text-primary-secondary">
                      Kategori
                    </th>
                    <th className="px-4 py-3 text-right font-medium text-text-primary-secondary">
                      Pesanan
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {data.topServices.map((svc) => (
                    <tr
                      key={svc.slug}
                      className="border-b border-border-default last:border-b-0 hover:bg-neutral-100/50"
                    >
                      <td className="px-4 py-3 font-medium text-text-primary">{svc.name}</td>
                      <td className="px-4 py-3 text-text-primary-secondary">
                        {svc.category ?? '-'}
                      </td>
                      <td className="px-4 py-3 text-right font-bold text-text-primary">
                        {svc.order_count}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
