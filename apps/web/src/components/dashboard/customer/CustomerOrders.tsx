import { useState, useEffect, useMemo } from 'react';
import {
  createBrowserClient,
  formatCurrency,
  formatDate,
  getStatusLabel,
  getStatusColor,
} from '@specialist/shared';
import { Badge, Table, Pagination } from '@specialist/ui';
import type { Column } from '@specialist/ui';
import type { OrderStatus } from '@specialist/types';

interface OrderItem {
  id: string;
  bookingNumber: string;
  status: string;
  bookingDate: string;
  basePrice: string;
  finalPrice: string | null;
  createdAt: string;
}

export function CustomerOrders() {
  const api = useMemo(() => createBrowserClient(), []);
  const [orders, setOrders] = useState<OrderItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);

  useEffect(() => {
    setLoading(true);
    api
      .get<OrderItem[]>('/api/v1/bookings', { params: { page, limit: 20 } })
      .then((data) => {
        const items = Array.isArray(data) ? data : [];
        setOrders(items);
        setHasMore(items.length === 20);
      })
      .catch(() => setOrders([]))
      .finally(() => setLoading(false));
  }, [page, api]);

  const columns: Column<OrderItem>[] = [
    { key: 'bookingNumber', header: 'No. Booking' },
    {
      key: 'status',
      header: 'Status',
      render: (item) => (
        <Badge
          variant={
            getStatusColor(item.status as OrderStatus) as
              'default' | 'success' | 'warning' | 'danger' | 'info'
          }
        >
          {getStatusLabel(item.status as OrderStatus)}
        </Badge>
      ),
    },
    {
      key: 'bookingDate',
      header: 'Tanggal',
      render: (item) => formatDate(item.bookingDate),
    },
    {
      key: 'basePrice',
      header: 'Harga',
      render: (item) => formatCurrency(Number(item.basePrice)),
    },
    {
      key: 'id',
      header: '',
      render: (item) => (
        <a
          href={`/tracking?q=${item.bookingNumber}`}
          className="text-sm text-primary hover:underline"
        >
          Detail
        </a>
      ),
    },
  ];

  if (loading) {
    return <div className="text-sm text-text-muted">Memuat...</div>;
  }

  return (
    <div className="space-y-4">
      <Table
        columns={columns}
        data={orders}
        keyExtractor={(o) => o.id}
        emptyMessage="Belum ada pesanan"
      />
      <Pagination page={page} totalPages={hasMore ? page + 1 : page} onPageChange={setPage} />
    </div>
  );
}
