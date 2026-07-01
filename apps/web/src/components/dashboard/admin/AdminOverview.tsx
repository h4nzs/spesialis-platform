import { useState, useEffect } from 'react';
import { createBrowserClient, formatCurrency } from '@specialist/shared';
import { Card } from '@specialist/ui';

interface DashboardData {
  totalOrders: number;
  pendingConfirmation: number;
  waitingAssignment: number;
  activeOrders: number;
  completedOrders: number;
  totalRevenue: number;
  totalCustomers: number;
  totalPartners: number;
}

export function AdminOverview() {
  const api = createBrowserClient();
  const [stats, setStats] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const data = await api.get<DashboardData>('/api/v1/admin/dashboard');
        setStats(data);
      } catch {
        setStats({
          totalOrders: 0, pendingConfirmation: 0, waitingAssignment: 0,
          activeOrders: 0, completedOrders: 0, totalRevenue: 0,
          totalCustomers: 0, totalPartners: 0,
        });
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (loading) {
    return <div className="text-sm text-text-muted">Memuat...</div>;
  }

  const cards = [
    { label: 'Total Pesanan', value: stats?.totalOrders ?? 0, color: 'text-text' },
    { label: 'Menunggu Konfirmasi', value: stats?.pendingConfirmation ?? 0, color: 'text-warning' },
    { label: 'Menunggu Assignment', value: stats?.waitingAssignment ?? 0, color: 'text-accent' },
    { label: 'Sedang Berjalan', value: stats?.activeOrders ?? 0, color: 'text-primary' },
    { label: 'Selesai', value: stats?.completedOrders ?? 0, color: 'text-success' },
    { label: 'Pendapatan', value: formatCurrency(stats?.totalRevenue ?? 0), color: 'text-success' },
    { label: 'Customer', value: stats?.totalCustomers ?? 0, color: 'text-text' },
    { label: 'Partner', value: stats?.totalPartners ?? 0, color: 'text-text' },
  ];

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {cards.map((card) => (
        <Card key={card.label} padding="lg">
          <p className="text-sm text-text-muted">{card.label}</p>
          <p className={`mt-1 text-2xl font-bold ${card.color}`}>{card.value}</p>
        </Card>
      ))}
    </div>
  );
}
