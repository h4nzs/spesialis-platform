import { useState, useEffect, useMemo } from 'react';
import { createBrowserClient, formatCurrency, formatDate, downloadCSV } from '@specialist/shared';
import { Card, Table, Badge, EmptyState, Skeleton } from '@specialist/ui';
import type { Column } from '@specialist/ui';

interface PenaltyItem {
  id: string;
  orderId: string | null;
  type: string;
  amount: string;
  reason: string;
  status: string;
  imposedAt: string;
  resolvedAt: string | null;
  notes: string | null;
}

const STATUS_COLORS: Record<string, 'warning' | 'success' | 'danger' | 'default'> = {
  Pending: 'warning',
  Applied: 'danger',
  Waived: 'default',
  Disputed: 'warning',
};

const STATUS_LABELS: Record<string, string> = {
  Pending: 'Menunggu',
  Applied: 'Dikenakan',
  Waived: 'Dihapuskan',
  Disputed: 'Disengketakan',
};

const TYPE_LABELS: Record<string, string> = {
  Late: 'Terlambat',
  NoShow: 'Tidak Hadir',
  Cancellation: 'Pembatalan',
  Complaint: 'Komplain',
  Other: 'Lainnya',
};

export function PartnerPenalties() {
  const api = useMemo(() => createBrowserClient(), []);
  const [penalties, setPenalties] = useState<PenaltyItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    api
      .get<PenaltyItem[]>('/api/v1/partners/me/penalties')
      .then((data) => setPenalties(Array.isArray(data) ? data : []))
      .catch(() => setPenalties([]))
      .finally(() => setLoading(false));
  }, [api]);

  const totalPending = penalties
    .filter((p) => p.status === 'Pending')
    .reduce((sum, p) => sum + Number(p.amount), 0);

  const totalApplied = penalties
    .filter((p) => p.status === 'Applied')
    .reduce((sum, p) => sum + Number(p.amount), 0);

  const columns: Column<PenaltyItem>[] = [
    {
      key: 'type',
      header: 'Tipe',
      render: (item) => TYPE_LABELS[item.type] ?? item.type,
    },
    {
      key: 'amount',
      header: 'Jumlah',
      render: (item) => formatCurrency(item.amount),
    },
    {
      key: 'reason',
      header: 'Alasan',
      render: (item) => (
        <span className="max-w-[200px] truncate block" title={item.reason}>
          {item.reason}
        </span>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      render: (item) => (
        <Badge variant={STATUS_COLORS[item.status] ?? 'default'}>
          {STATUS_LABELS[item.status] ?? item.status}
        </Badge>
      ),
    },
    {
      key: 'imposedAt',
      header: 'Tanggal',
      render: (item) => formatDate(item.imposedAt),
    },
    {
      key: 'resolvedAt',
      header: 'Selesai',
      render: (item) => (item.resolvedAt ? formatDate(item.resolvedAt) : '-'),
    },
  ];

  function handleExportCSV() {
    const headers = ['Tipe', 'Jumlah', 'Alasan', 'Status', 'Tanggal', 'Selesai'];
    const rows = penalties.map((p) => [
      TYPE_LABELS[p.type] ?? p.type,
      formatCurrency(p.amount),
      p.reason,
      STATUS_LABELS[p.status] ?? p.status,
      formatDate(p.imposedAt),
      p.resolvedAt ? formatDate(p.resolvedAt) : '-',
    ]);
    downloadCSV(headers, rows, 'penalty-partner-export.csv');
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid gap-4 sm:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Card key={i} padding="lg">
              <Skeleton variant="text" className="w-1/2" />
              <div className="mt-2">
                <Skeleton variant="heading" className="w-1/3 h-8" />
              </div>
            </Card>
          ))}
        </div>
        <Skeleton variant="table" />
        <Skeleton variant="table" />
        <Skeleton variant="table" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-3">
        <Card padding="lg">
          <p className="text-body-sm text-text-secondary">Total Penalty</p>
          <p className="mt-1 text-h3 font-bold text-text-primary">
            {formatCurrency(totalPending + totalApplied)}
          </p>
        </Card>
        <Card padding="lg">
          <p className="text-body-sm text-text-secondary">Menunggu</p>
          <p className="mt-1 text-h3 font-bold text-warning">{formatCurrency(totalPending)}</p>
        </Card>
        <Card padding="lg">
          <p className="text-body-sm text-text-secondary">Dikenakan</p>
          <p className="mt-1 text-h3 font-bold text-danger">{formatCurrency(totalApplied)}</p>
        </Card>
      </div>

      {penalties.length > 0 && (
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
        data={penalties}
        keyExtractor={(p) => p.id}
        emptyState={<EmptyState title="Belum ada penalty" />}
      />
    </div>
  );
}
