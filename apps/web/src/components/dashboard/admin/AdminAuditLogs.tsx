import { useState, useEffect, useCallback, useMemo } from 'react';
import { createBrowserClient, formatDate, downloadCSV } from '@specialist/shared';
import { Table, Pagination, Input, Badge, EmptyState } from '@specialist/ui';
import type { Column } from '@specialist/ui';
import type { PaginationMeta, AuditAction } from '@specialist/types';

interface AuditLogItem {
  id: string;
  action: AuditAction;
  entity: string;
  entityId: string;
  oldValue: Record<string, unknown> | null;
  newValue: Record<string, unknown> | null;
  ipAddress: string | null;
  userAgent: string | null;
  createdAt: string;
  userEmail: string | null;
  userRole: string | null;
}

const ACTION_COLORS: Record<string, 'info' | 'success' | 'warning' | 'danger'> = {
  CREATE_ORDER: 'success',
  LOGIN: 'info',
  LOGOUT: 'warning',
  DELETE_SERVICE: 'danger',
  VERIFY_PARTNER: 'success',
};

function actionBadge(action: string) {
  const variant = ACTION_COLORS[action] ?? 'default';
  return <Badge variant={variant}>{action}</Badge>;
}

export function AdminAuditLogs() {
  const api = useMemo(() => createBrowserClient(), []);
  const [logs, setLogs] = useState<AuditLogItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState<PaginationMeta | null>(null);

  const [actionFilter, setActionFilter] = useState('');
  const [entityFilter, setEntityFilter] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  const [expandedId, setExpandedId] = useState<string | null>(null);

  const loadLogs = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params: Record<string, string | number> = { page, limit: 20 };
      if (actionFilter) params.action = actionFilter;
      if (entityFilter) params.entity = entityFilter;
      if (dateFrom) params.dateFrom = dateFrom;
      if (dateTo) params.dateTo = dateTo;

      const result = await api.getPaginated<AuditLogItem>('/api/v1/admin/audit-logs', { params });
      setLogs(result.data);
      setPagination(result.pagination);
    } catch {
      setError('Gagal memuat data audit log');
      setLogs([]);
      setPagination(null);
    } finally {
      setLoading(false);
    }
  }, [page, actionFilter, entityFilter, dateFrom, dateTo, api]);

  useEffect(() => {
    loadLogs();
  }, [loadLogs]);

  function handleFilter(e: React.SyntheticEvent<HTMLFormElement>) {
    e.preventDefault();
    setPage(1);
    setExpandedId(null);
  }

  function handleReset() {
    setActionFilter('');
    setEntityFilter('');
    setDateFrom('');
    setDateTo('');
    setPage(1);
    setExpandedId(null);
  }

  function handleExportCSV() {
    const headers = ['Waktu', 'User', 'Aksi', 'Entitas', 'ID Entitas', 'IP'];
    const rows = logs.map((l) => [
      formatDate(l.createdAt, 'short'),
      l.userEmail ?? '-',
      l.action,
      l.entity,
      l.entityId.slice(0, 8) + '...',
      l.ipAddress ?? '-',
    ]);
    downloadCSV(headers, rows, 'audit-log-export.csv');
  }

  const columns: Column<AuditLogItem>[] = [
    {
      key: 'createdAt',
      header: 'Waktu',
      render: (item) => (
        <span className="whitespace-nowrap text-xs">{formatDate(item.createdAt, 'short')}</span>
      ),
    },
    {
      key: 'userEmail',
      header: 'User',
      render: (item) => <span className="text-xs">{item.userEmail ?? '-'}</span>,
    },
    {
      key: 'action',
      header: 'Aksi',
      render: (item) => actionBadge(item.action),
    },
    {
      key: 'entity',
      header: 'Entitas',
      render: (item) => <span className="text-xs capitalize">{item.entity}</span>,
    },
    {
      key: 'entityId',
      header: 'ID Entitas',
      render: (item) => <span className="font-mono text-xs">{item.entityId.slice(0, 8)}...</span>,
    },
    {
      key: 'ipAddress',
      header: 'IP',
      render: (item) => (
        <span className="text-xs text-text-primary-secondary">{item.ipAddress ?? '-'}</span>
      ),
    },
    {
      key: 'id',
      header: '',
      className: 'w-10',
      render: (item) => (
        <button
          type="button"
          onClick={() => setExpandedId(expandedId === item.id ? null : item.id)}
          className="text-xs text-primary hover:underline cursor-pointer"
        >
          {expandedId === item.id ? 'Sembunyikan' : 'Detail'}
        </button>
      ),
    },
  ];

  const expandedLog = expandedId ? logs.find((l) => l.id === expandedId) : null;

  return (
    <div className="space-y-4">
      {/* Filter */}
      <form onSubmit={handleFilter} className="flex flex-wrap items-end gap-3">
        <div className="w-40">
          <Input
            label="Aksi"
            placeholder="Cari aksi..."
            value={actionFilter}
            onChange={(e) => setActionFilter(e.target.value)}
          />
        </div>
        <div className="w-40">
          <Input
            label="Entitas"
            placeholder="Cari entitas..."
            value={entityFilter}
            onChange={(e) => setEntityFilter(e.target.value)}
          />
        </div>
        <div className="w-40">
          <Input
            label="Dari"
            type="date"
            value={dateFrom}
            onChange={(e) => setDateFrom(e.target.value)}
          />
        </div>
        <div className="w-40">
          <Input
            label="Sampai"
            type="date"
            value={dateTo}
            onChange={(e) => setDateTo(e.target.value)}
          />
        </div>
        <div className="flex gap-2">
          <button
            type="submit"
            className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary/90 cursor-pointer"
          >
            Cari
          </button>
          <button
            type="button"
            onClick={handleReset}
            className="rounded-md border border-border-default px-4 py-2 text-sm font-medium text-text-primary-secondary hover:text-text-primary cursor-pointer"
          >
            Reset
          </button>
        </div>
      </form>

      {/* Error */}
      {error && <p className="text-sm text-danger">{error}</p>}

      {/* Loading */}
      {loading && (
        <div className="space-y-3">
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
      )}

      {/* Table */}
      {!loading && !error && (
        <>
          {logs.length > 0 && (
            <div className="flex items-center justify-end">
              <button
                type="button"
                onClick={handleExportCSV}
                className="inline-flex items-center gap-1.5 rounded-lg border border-border-default-default bg-bg-bg-surface px-3 py-1.5 text-body-sm font-medium text-text-primary-primary shadow-xs transition-all duration-150 ease-out hover:bg-neutral-100 hover:shadow-sm"
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
            data={logs}
            keyExtractor={(l) => l.id}
            emptyState={<EmptyState title="Belum ada audit log" />}
          />
        </>
      )}

      {/* Expanded detail */}
      {!loading && expandedLog && (
        <div className="rounded-lg border border-border-default bg-bg-surface p-4 text-sm space-y-3">
          <h4 className="font-medium text-text-primary">Detail Audit Log</h4>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <span className="text-text-primary-secondary">User Agent:</span>
              <p className="mt-0.5 break-words text-text-primary">{expandedLog.userAgent ?? '-'}</p>
            </div>
            <div>
              <span className="text-text-primary-secondary">IP Address:</span>
              <p className="mt-0.5 text-text-primary">{expandedLog.ipAddress ?? '-'}</p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <span className="text-text-primary-secondary">Nilai Lama:</span>
              <pre className="mt-0.5 max-h-40 overflow-auto rounded bg-bg-page p-2 text-xs text-text-primary">
                {expandedLog.oldValue ? JSON.stringify(expandedLog.oldValue, null, 2) : '-'}
              </pre>
            </div>
            <div>
              <span className="text-text-primary-secondary">Nilai Baru:</span>
              <pre className="mt-0.5 max-h-40 overflow-auto rounded bg-bg-page p-2 text-xs text-text-primary">
                {expandedLog.newValue ? JSON.stringify(expandedLog.newValue, null, 2) : '-'}
              </pre>
            </div>
          </div>
        </div>
      )}

      {/* Pagination */}
      {pagination && (
        <Pagination
          page={pagination.page}
          totalPages={pagination.totalPages}
          onPageChange={setPage}
        />
      )}
    </div>
  );
}
