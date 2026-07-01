import { useState, useEffect } from 'react';
import {
  createBrowserClient,
  formatCurrency,
  formatDate,
  getStatusLabel,
  getStatusColor,
} from '@specialist/shared';
import { Badge, Table } from '@specialist/ui';
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
  const api = createBrowserClient();
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
  }, []);

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

  if (loading) return <div className="text-sm text-text-muted py-8 text-center">Memuat...</div>;

  return (
    <div className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-lg border border-border bg-surface p-4">
          <p className="text-sm text-text-muted">Total</p>
          <p className="mt-1 text-2xl font-bold text-text">{invoices.length}</p>
        </div>
        <div className="rounded-lg border border-border bg-surface p-4">
          <p className="text-sm text-text-muted">Lunas</p>
          <p className="mt-1 text-2xl font-bold text-success">{paidInvoices.length}</p>
        </div>
        <div className="rounded-lg border border-border bg-surface p-4">
          <p className="text-sm text-text-muted">Menunggu</p>
          <p className="mt-1 text-2xl font-bold text-warning">
            {invoices.length - paidInvoices.length}
          </p>
        </div>
      </div>

      <Table
        data={invoices}
        columns={columns}
        keyExtractor={(item) => item.id}
        emptyMessage="Belum ada invoice"
      />
    </div>
  );
}
