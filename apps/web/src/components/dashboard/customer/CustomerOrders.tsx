import { useState, useEffect, useMemo } from 'react';
import {
  createBrowserClient,
  formatCurrency,
  formatDate,
  getStatusLabel,
  getStatusColor,
  downloadCSV,
} from '@specialist/shared';
import { Badge, Table, Pagination, EmptyState } from '@specialist/ui';
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

  function handleExportCSV() {
    const headers = ['No. Booking', 'Status', 'Tanggal', 'Harga'];
    const rows = orders.map((o) => [
      o.bookingNumber,
      getStatusLabel(o.status as OrderStatus),
      formatDate(o.bookingDate),
      formatCurrency(Number(o.basePrice)),
    ]);
    downloadCSV(headers, rows, 'pesanan-saya-export.csv');
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="flex justify-end">
          <div
            className="animate-skeleton h-10 w-32 rounded-lg bg-neutral-200"
            aria-hidden="true"
          />
        </div>
        <div
          className="animate-skeleton h-12 w-full rounded-lg bg-neutral-200"
          aria-hidden="true"
        />
        <div
          className="animate-skeleton h-12 w-full rounded-lg bg-neutral-200"
          aria-hidden="true"
        />
        <div
          className="animate-skeleton h-12 w-full rounded-lg bg-neutral-200"
          aria-hidden="true"
        />
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
        columns={columns}
        data={orders}
        keyExtractor={(o) => o.id}
        emptyState={<EmptyState title="Belum ada pesanan" />}
      />
      <Pagination page={page} totalPages={hasMore ? page + 1 : page} onPageChange={setPage} />
    </div>
  );
}
