import { useState, useEffect, useMemo } from 'react';
import {
  createBrowserClient,
  formatCurrency,
  formatDate,
  getStatusLabel,
  getStatusColor,
} from '@ahlipanggilan/shared';
import { Badge, Table, EmptyState, CSVExportButton, TableSkeleton } from '@ahlipanggilan/ui';
import type { Column } from '@ahlipanggilan/ui';
import type { OrderStatus } from '@ahlipanggilan/types';

interface OrderItem {
  id: string;
  bookingNumber: string;
  status: string;
  bookingDate: string;
  basePrice: string;
  finalPrice: string | null;
  createdAt: string;
}

export function CorporateOrders() {
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
      header: 'Estimasi',
      render: (item) => formatCurrency(item.basePrice),
    },
    {
      key: 'finalPrice',
      header: 'Harga Final',
      render: (item) => (item.finalPrice ? formatCurrency(item.finalPrice) : '-'),
    },
  ];

  if (loading) return <TableSkeleton toolbarWidth="w-28" />;

  return (
    <div className="space-y-4">
      {orders.length > 0 && (
        <div className="flex items-center justify-end">
          <CSVExportButton
            data={orders as unknown as Record<string, unknown>[]}
            columns={[
              { key: 'bookingNumber', label: 'No. Booking' },
              {
                key: 'status',
                label: 'Status',
                format: (v) => getStatusLabel(v as OrderStatus),
              },
              {
                key: 'bookingDate',
                label: 'Tanggal',
                format: (v) => formatDate(v as string),
              },
              {
                key: 'basePrice',
                label: 'Estimasi',
                format: (v) => formatCurrency(v as string),
              },
              {
                key: 'finalPrice',
                label: 'Harga Final',
                format: (v) => (v ? formatCurrency(v as string) : '-'),
              },
            ]}
            filename="pesanan-korporat-export.csv"
          />
        </div>
      )}
      <Table
        data={orders}
        columns={columns}
        keyExtractor={(item) => item.id}
        emptyState={<EmptyState title="Belum ada pesanan" />}
      />
      {hasMore && (
        <div className="flex justify-center pt-2">
          <button
            type="button"
            onClick={() => setPage((p) => p + 1)}
            className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-primary-hover"
          >
            Muat Lainnya
          </button>
        </div>
      )}
    </div>
  );
}
