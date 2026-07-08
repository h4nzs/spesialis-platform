import { useState, useEffect, useMemo } from 'react';
import {
  createBrowserClient,
  formatCurrency,
  formatDate,
  getStatusLabel,
  getStatusColor,
  downloadCSV,
} from '@specialist/shared';
import { Badge, Table, EmptyState } from '@specialist/ui';
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

  function handleExportCSV() {
    const headers = ['No. Booking', 'Status', 'Tanggal', 'Estimasi', 'Harga Final'];
    const rows = orders.map((o) => [
      o.bookingNumber,
      getStatusLabel(o.status as OrderStatus),
      formatDate(o.bookingDate),
      formatCurrency(o.basePrice),
      o.finalPrice ? formatCurrency(o.finalPrice) : '-',
    ]);
    downloadCSV(headers, rows, 'pesanan-korporat-export.csv');
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-end">
          <div className="h-9 w-28 animate-skeleton rounded-lg" />
        </div>
        <div className="space-y-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-12 animate-skeleton rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {orders.length > 0 && (
        <div className="flex items-center justify-end">
          <button
            type="button"
            onClick={handleExportCSV}
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
