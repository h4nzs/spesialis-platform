import { useState, useEffect, useMemo } from 'react';
import { createBrowserClient, formatCurrency } from '@ahlipanggilan/shared';
import { Card, Skeleton, Grid } from '@ahlipanggilan/ui';
import { IndexNowWidget } from './IndexNowWidget.tsx';

interface DashboardResponse {
  users?: { total: number; customers: number; partners: number };
  partners?: { available: number; pendingVerification: number };
  orders?: {
    total: number;
    active: number;
    waitingAssignment: number;
    today: number;
  };
  revenue?: { total: number };
  complaints?: { total: number; open: number };
  companies?: { verified: number };
}

const statCards = [
  { label: 'Pesanan Hari Ini', key: 'orders.today' as const, color: 'text-text-primary' },
  { label: 'Sedang Berjalan', key: 'orders.active' as const, color: 'text-primary-600' },
  {
    label: 'Menunggu Assignment',
    key: 'orders.waitingAssignment' as const,
    color: 'text-warning-600',
  },
  { label: 'Total Pesanan', key: 'orders.total' as const, color: 'text-text-primary' },
  { label: 'Pendapatan', key: 'revenue' as const, color: 'text-success-600', isCurrency: true },
  { label: 'Partner Tersedia', key: 'partners.available' as const, color: 'text-success-600' },
  {
    label: 'Verifikasi Tertunda',
    key: 'partners.pendingVerification' as const,
    color: 'text-warning-600',
  },
  { label: 'Komplain Terbuka', key: 'complaints.open' as const, color: 'text-danger-600' },
];

const quickActions = [
  { href: '/dashboard/admin/bookings', label: 'Kelola Booking', variant: 'primary' as const },
  { href: '/dashboard/admin/partners', label: 'Verifikasi Partner', variant: 'secondary' as const },
  { href: '/dashboard/admin/services', label: 'Tambah Layanan', variant: 'secondary' as const },
  { href: '/dashboard/admin/articles', label: 'Tulis Artikel', variant: 'secondary' as const },
  { href: '/dashboard/admin/users', label: 'Kelola User', variant: 'secondary' as const },
];

function getStatValue(stats: DashboardResponse | null, key: string): string | number {
  if (!stats) return 0;
  if (key === 'revenue') return formatCurrency(stats.revenue?.total ?? 0);
  if (key === 'orders.today') return stats.orders?.today ?? 0;
  if (key === 'orders.active') return stats.orders?.active ?? 0;
  if (key === 'orders.waitingAssignment') return stats.orders?.waitingAssignment ?? 0;
  if (key === 'orders.total') return stats.orders?.total ?? 0;
  if (key === 'partners.available') return stats.partners?.available ?? 0;
  if (key === 'partners.pendingVerification') return stats.partners?.pendingVerification ?? 0;
  if (key === 'complaints.open') return stats.complaints?.open ?? 0;
  return 0;
}

export function AdminOverview() {
  const api = useMemo(() => createBrowserClient(), []);
  const [stats, setStats] = useState<DashboardResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const data = await api.get<DashboardResponse>('/api/v1/admin/dashboard');
        setStats(data);
      } catch {
        setStats({});
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [api]);

  if (loading) {
    return (
      <div className="space-y-6">
        <Grid cols={4} gap={4} className="grid-cols-2">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <Card key={i} padding="lg">
              <Skeleton variant="text" className="w-1/2" />
              <div className="mt-2">
                <Skeleton variant="heading" className="w-1/3 h-8" />
              </div>
            </Card>
          ))}
        </Grid>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Grid cols={4} gap={4} className="grid-cols-2">
        {statCards.map((card) => (
          <Card key={card.key} padding="lg" className="space-y-2">
            <p className="text-body-sm text-text-secondary">{card.label}</p>
            <p className={`text-h3 font-bold ${card.color}`}>{getStatValue(stats, card.key)}</p>
          </Card>
        ))}
      </Grid>

      {/* IndexNow Widget */}
      <IndexNowWidget />

      {/* Quick Actions */}
      <Card padding="lg">
        <h3 className="text-caption font-semibold uppercase tracking-wider text-text-muted">
          Aksi Cepat
        </h3>
        <div className="mt-4 flex flex-wrap gap-3">
          {quickActions.map((action) => (
            <a
              key={action.href}
              href={action.href}
              className={`inline-flex h-10 items-center justify-center rounded-lg px-4 text-body-sm font-semibold transition-all duration-150 ease-out ${
                action.variant === 'primary'
                  ? 'bg-primary-500 text-white shadow-xs hover:bg-primary-600 hover:shadow-sm'
                  : 'border border-border-default bg-bg-surface text-text-primary shadow-xs hover:bg-neutral-100 hover:shadow-sm'
              }`}
            >
              {action.label}
            </a>
          ))}
        </div>
      </Card>
    </div>
  );
}
