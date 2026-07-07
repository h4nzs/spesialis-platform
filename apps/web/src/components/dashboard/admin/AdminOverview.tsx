import { useState, useEffect, useMemo } from 'react';
import { createBrowserClient, formatCurrency } from '@specialist/shared';
import { Card } from '@specialist/ui';

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
    return <div className="text-sm text-text-muted py-8 text-center">Memuat...</div>;
  }

  const cards = [
    { label: 'Pesanan Hari Ini', value: stats?.orders?.today ?? 0, color: 'text-text' },
    { label: 'Sedang Berjalan', value: stats?.orders?.active ?? 0, color: 'text-primary' },
    {
      label: 'Menunggu Assignment',
      value: stats?.orders?.waitingAssignment ?? 0,
      color: 'text-accent',
    },
    { label: 'Total Pesanan', value: stats?.orders?.total ?? 0, color: 'text-text' },
    {
      label: 'Pendapatan',
      value: formatCurrency(stats?.revenue?.total ?? 0),
      color: 'text-success',
    },
    { label: 'Partner Tersedia', value: stats?.partners?.available ?? 0, color: 'text-success' },
    {
      label: 'Verifikasi Tertunda',
      value: stats?.partners?.pendingVerification ?? 0,
      color: 'text-warning',
    },
    { label: 'Komplain Terbuka', value: stats?.complaints?.open ?? 0, color: 'text-danger' },
  ];

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((card) => (
          <Card key={card.label} padding="lg">
            <p className="text-sm text-text-muted">{card.label}</p>
            <p className={`mt-1 text-2xl font-bold ${card.color}`}>{card.value}</p>
          </Card>
        ))}
      </div>

      <div className="rounded-xl border border-border bg-surface p-6">
        <h3 className="text-sm font-semibold text-text-muted uppercase tracking-wide">
          Aksi Cepat
        </h3>
        <div className="mt-4 flex flex-wrap gap-3">
          <a
            href="/dashboard/admin/bookings"
            className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-primary-hover"
          >
            Kelola Booking
          </a>
          <a
            href="/dashboard/admin/partners"
            className="rounded-md border border-border bg-background px-4 py-2 text-sm font-medium text-text transition-colors hover:bg-surface"
          >
            Verifikasi Partner
          </a>
          <a
            href="/dashboard/admin/services"
            className="rounded-md border border-border bg-background px-4 py-2 text-sm font-medium text-text transition-colors hover:bg-surface"
          >
            Tambah Layanan
          </a>
          <a
            href="/dashboard/admin/articles"
            className="rounded-md border border-border bg-background px-4 py-2 text-sm font-medium text-text transition-colors hover:bg-surface"
          >
            Tulis Artikel
          </a>
          <a
            href="/dashboard/admin/users"
            className="rounded-md border border-border bg-background px-4 py-2 text-sm font-medium text-text transition-colors hover:bg-surface"
          >
            Kelola User
          </a>
        </div>
      </div>
    </div>
  );
}
