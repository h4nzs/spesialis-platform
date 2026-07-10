import { useState, useEffect, useMemo } from 'react';
import {
  createBrowserClient,
  formatDate,
  formatDateRange,
  getContractStatusBadge,
  isExpiringSoon,
} from '@specialist/shared';
import { Badge, Table, EmptyState, CSVExportButton, TableSkeleton } from '@specialist/ui';
import type { Column } from '@specialist/ui';

// ── Types ──────────────────────────────────────────────────────

interface ContractItem {
  id: string;
  companyId: string;
  contractNumber: string;
  startDate: string;
  endDate: string | null;
  status: string;
  slaResponseHours: number | null;
  slaResolutionHours: number | null;
  notes: string | null;
  createdAt: string;
}

// ── Component ──────────────────────────────────────────────────

export function CorporateContracts() {
  const api = useMemo(() => createBrowserClient(), []);
  const [contracts, setContracts] = useState<ContractItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get<ContractItem[]>('/api/v1/contracts/me')
      .then((data) => {
        setContracts(Array.isArray(data) ? data : []);
      })
      .catch(() => setContracts([]))
      .finally(() => setLoading(false));
  }, [api]);

  // Derived data
  const activeContracts = contracts.filter((c) => c.status.toLowerCase() === 'active');
  const expiredContracts = contracts.filter((c) => c.status.toLowerCase() === 'expired');
  const expiringSoon = contracts.filter(
    (c) => c.status.toLowerCase() === 'active' && isExpiringSoon(c.endDate),
  );

  const columns: Column<ContractItem>[] = [
    { key: 'contractNumber', header: 'No. Kontrak' },
    {
      key: 'startDate',
      header: 'Periode',
      render: (item) => (
        <span className="text-body-sm text-text-primary">
          {formatDateRange(item.startDate, item.endDate)}
        </span>
      ),
    },
    {
      key: 'slaResponseHours',
      header: 'SLA Respon',
      render: (item) => (item.slaResponseHours ? `${item.slaResponseHours} jam` : '-'),
    },
    {
      key: 'slaResolutionHours',
      header: 'SLA Penyelesaian',
      render: (item) => (item.slaResolutionHours ? `${item.slaResolutionHours} jam` : '-'),
    },
    {
      key: 'status',
      header: 'Status',
      render: (item) => {
        const { variant, label } = getContractStatusBadge(item.status);
        return (
          <div className="flex items-center gap-2">
            <Badge variant={variant}>{label}</Badge>
            {isExpiringSoon(item.endDate) && (
              <span className="text-caption font-medium text-warning-600">Segera berakhir</span>
            )}
          </div>
        );
      },
    },
  ];

  if (loading) return <TableSkeleton />;

  return (
    <div className="space-y-4">
      {/* ── Summary Cards ──────────────────────────────────────── */}
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-lg border border-border-default bg-bg-surface p-4 space-y-1">
          <p className="text-body-sm text-text-secondary">Total Kontrak</p>
          <p className="text-h3 font-bold text-text-primary">{contracts.length}</p>
        </div>
        <div className="rounded-lg border border-border-default bg-bg-surface p-4 space-y-1">
          <p className="text-body-sm text-text-secondary">Aktif</p>
          <p className="text-h3 font-bold text-success-600">{activeContracts.length}</p>
        </div>
        <div className="rounded-lg border border-border-default bg-bg-surface p-4 space-y-1">
          <p className="text-body-sm text-text-secondary">
            {expiringSoon.length > 0 ? 'Segera Berakhir' : 'Kadaluarsa'}
          </p>
          <p
            className={`text-h3 font-bold ${
              expiringSoon.length > 0 ? 'text-warning-600' : 'text-text-muted'
            }`}
          >
            {expiringSoon.length > 0 ? expiringSoon.length : expiredContracts.length}
          </p>
        </div>
      </div>

      {/* ── Table ──────────────────────────────────────────────── */}
      {contracts.length > 0 && (
        <div className="flex items-center justify-end">
          <CSVExportButton
            data={contracts as unknown as Record<string, unknown>[]}
            columns={[
              { key: 'contractNumber', label: 'No. Kontrak' },
              {
                key: 'startDate',
                label: 'Periode Mulai',
                format: (v) => formatDate(v as string),
              },
              {
                key: 'endDate',
                label: 'Periode Berakhir',
                format: (v) => (v ? formatDate(v as string) : '-'),
              },
              {
                key: 'slaResponseHours',
                label: 'SLA Respon (jam)',
                format: (v) => (v ? String(v) : '-'),
              },
              {
                key: 'slaResolutionHours',
                label: 'SLA Penyelesaian (jam)',
                format: (v) => (v ? String(v) : '-'),
              },
              { key: 'status', label: 'Status' },
            ]}
            filename="kontrak-export.csv"
          />
        </div>
      )}

      <Table
        data={contracts}
        columns={columns}
        keyExtractor={(item) => item.id}
        emptyState={
          <EmptyState
            title="Belum ada kontrak"
            description="Belum ada kontrak layanan untuk perusahaan Anda. Hubungi admin untuk informasi lebih lanjut."
            action={
              <a
                href="/kontak"
                className="inline-flex h-10 items-center justify-center rounded-lg bg-primary-500 px-5 text-body-sm font-semibold text-white shadow-xs transition-all duration-150 ease-out hover:bg-primary-600 hover:shadow-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-500"
              >
                Hubungi Admin
              </a>
            }
          />
        }
      />
    </div>
  );
}
