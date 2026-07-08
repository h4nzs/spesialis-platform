import { useState, useEffect, useMemo } from 'react';
import { createBrowserClient } from '@specialist/shared';
import { Card, Skeleton, Grid } from '@specialist/ui';

interface DashboardStats {
  activeOrders: number;
  completedOrders: number;
  pendingPayment: number;
  savedAddresses: number;
}

const statCards = [
  { label: 'Pesanan Aktif', key: 'activeOrders' as const, color: 'text-primary-600' },
  { label: 'Selesai', key: 'completedOrders' as const, color: 'text-success-600' },
  { label: 'Menunggu Pembayaran', key: 'pendingPayment' as const, color: 'text-warning-600' },
  { label: 'Alamat Tersimpan', key: 'savedAddresses' as const, color: 'text-text-primary' },
];

export function CustomerOverview() {
  const api = useMemo(() => createBrowserClient(), []);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      try {
        const orders = await api.get<{ status: string }[]>('/api/v1/bookings');
        const activeOrders = orders.filter((o) =>
          [
            'Pending Confirmation',
            'Confirmed',
            'Waiting Assignment',
            'Partner Assigned',
            'Partner Accepted',
            'Working',
          ].includes(o.status),
        ).length;
        const completedOrders = orders.filter((o) =>
          ['Completed', 'Paid', 'Closed'].includes(o.status),
        ).length;
        const pendingPayment = orders.filter((o) => ['Waiting Payment'].includes(o.status)).length;
        const addresses = await api.get<unknown[]>('/api/v1/addresses');

        setStats({
          activeOrders,
          completedOrders,
          pendingPayment,
          savedAddresses: addresses.length,
        });
      } catch {
        setStats({ activeOrders: 0, completedOrders: 0, pendingPayment: 0, savedAddresses: 0 });
      } finally {
        setLoading(false);
      }
    }
    fetchStats();
  }, [api]);

  if (loading) {
    return (
      <Grid cols={4} gap={4}>
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} padding="lg">
            <Skeleton variant="text" className="w-1/2" />
            <div className="mt-2">
              <Skeleton variant="heading" className="w-1/3 h-8" />
            </div>
          </Card>
        ))}
      </Grid>
    );
  }

  return (
    <Grid cols={4} gap={4}>
      {statCards.map((card) => (
        <Card key={card.key} padding="lg" className="space-y-2">
          <p className="text-body-sm text-text-secondary">{card.label}</p>
          <p className={`text-display font-bold ${card.color}`}>{stats?.[card.key] ?? 0}</p>
        </Card>
      ))}
    </Grid>
  );
}
