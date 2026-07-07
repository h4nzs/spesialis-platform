import { useState, useEffect, useMemo } from 'react';
import { createBrowserClient } from '@specialist/shared';
import { Card } from '@specialist/ui';

interface DashboardStats {
  activeOrders: number;
  completedOrders: number;
  pendingPayment: number;
  savedAddresses: number;
}

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
    return <div className="text-sm text-text-muted">Memuat...</div>;
  }

  const cards = [
    { label: 'Pesanan Aktif', value: stats?.activeOrders ?? 0, color: 'text-primary' },
    { label: 'Selesai', value: stats?.completedOrders ?? 0, color: 'text-success' },
    { label: 'Menunggu Pembayaran', value: stats?.pendingPayment ?? 0, color: 'text-accent' },
    { label: 'Alamat Tersimpan', value: stats?.savedAddresses ?? 0, color: 'text-text' },
  ];

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {cards.map((card) => (
        <Card key={card.label} padding="lg">
          <p className="text-sm text-text-muted">{card.label}</p>
          <p className={`mt-1 text-3xl font-bold ${card.color}`}>{card.value}</p>
        </Card>
      ))}
    </div>
  );
}
