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

  if (loading) return <TableSkeleton toolbarWidth="w-28" />;

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
          <CSVExportButton
            data={invoices as unknown as Record<string, unknown>[]}
            columns={[
              { key: 'bookingNumber', label: 'No. Invoice' },
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
                key: 'finalPrice',
                label: 'Jumlah',
                format: (v) => (v ? formatCurrency(v as string) : '-'),
              },
              {
                key: 'completedAt',
                label: 'Selesai',
                format: (v) => (v ? formatDate(v as string) : '-'),
              },
            ]}
            filename="invoice-export.csv"
          />
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
