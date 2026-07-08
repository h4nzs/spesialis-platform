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

interface InvoiceItem {
  id: string;
  bookingNumber: string;
  status: string;
  bookingDate: string;
  finalPrice: string | null;
  completedAt: string | null;
}

export function CorporateInvoices() {
  const api = useMemo(() => createBrowserClient(), []);
  const [invoices, setInvoices] = useState<InvoiceItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get<InvoiceItem[]>('/api/v1/bookings', { params: { limit: 50 } })
      .then((data) => {
        const items = Array.isArray(data) ? data : [];
        setInvoices(items);
      })
      .catch(() => setInvoices([]))
      .finally(() => setLoading(false));
  }, [api]);

  const paidInvoices = invoices.filter((inv) => inv.status === 'Paid' || inv.status === 'Closed');

  const columns: Column<InvoiceItem>[] = [
    { key: 'bookingNumber', header: 'No. Invoice' },
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
      key: 'finalPrice',
      header: 'Jumlah',
      render: (item) => (item.finalPrice ? formatCurrency(item.finalPrice) : '-'),
    },
    {
      key: 'completedAt',
      header: 'Selesai',
      render: (item) => (item.completedAt ? formatDate(item.completedAt) : '-'),
    },
  ];

  function handleExportCSV() {
    const headers = ['No. Invoice', 'Status', 'Tanggal', 'Jumlah', 'Selesai'];
    const rows = invoices.map((inv) => [
      inv.bookingNumber,
      getStatusLabel(inv.status as OrderStatus),
      formatDate(inv.bookingDate),
      inv.finalPrice ? formatCurrency(inv.finalPrice) : '-',
      inv.completedAt ? formatDate(inv.completedAt) : '-',
    ]);
    downloadCSV(headers, rows, 'invoice-export.csv');
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="rounded-lg border border-border-default bg-bg-surface p-4 space-y-2"
            >
              <div className="h-4 w-16 animate-skeleton rounded" />
              <div className="h-8 w-12 animate-skeleton rounded" />
            </div>
          ))}
        </div>
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
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-lg border border-border-default bg-bg-surface p-4 space-y-1">
          <p className="text-body-sm text-text-secondary">Total</p>
          <p className="text-h3 font-bold text-text-primary">{invoices.length}</p>
        </div>
        <div className="rounded-lg border border-border-default bg-bg-surface p-4 space-y-1">
          <p className="text-body-sm text-text-secondary">Lunas</p>
          <p className="text-h3 font-bold text-success">{paidInvoices.length}</p>
        </div>
        <div className="rounded-lg border border-border-default bg-bg-surface p-4 space-y-1">
          <p className="text-body-sm text-text-secondary">Menunggu</p>
          <p className="text-h3 font-bold text-warning">{invoices.length - paidInvoices.length}</p>
        </div>
      </div>

      {invoices.length > 0 && (
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
        data={invoices}
        columns={columns}
        keyExtractor={(item) => item.id}
        emptyState={<EmptyState title="Belum ada invoice" />}
      />
    </div>
  );
}
