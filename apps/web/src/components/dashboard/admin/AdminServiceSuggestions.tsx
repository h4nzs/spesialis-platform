import { useState, useEffect, useMemo, useCallback } from 'react';
import { createBrowserClient } from '@ahlipanggilan/shared';
import { Button, Table, Badge, EmptyState, TableSkeleton } from '@ahlipanggilan/ui';
import type { Column } from '@ahlipanggilan/ui';

interface SuggestionItem {
  id: string;
  partnerName: string;
  partnerEmail: string;
  serviceName: string;
  description: string | null;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
  updatedAt: string;
}

const STATUS_LABEL: Record<string, string> = {
  pending: 'Menunggu',
  approved: 'Disetujui',
  rejected: 'Ditolak',
};

const STATUS_VARIANT: Record<string, 'warning' | 'success' | 'danger'> = {
  pending: 'warning',
  approved: 'success',
  rejected: 'danger',
};

export function AdminServiceSuggestions() {
  const api = useMemo(() => createBrowserClient(), []);
  const [items, setItems] = useState<SuggestionItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('');

  const loadData = useCallback(async () => {
    try {
      const params: Record<string, string | number> = { limit: 100 };
      if (filter) params.status = filter;
      const result = await api.get<{ data: SuggestionItem[] }>(
        '/api/v1/admin/service-suggestions',
        { params },
      );
      setItems(Array.isArray(result) ? result : (result?.data ?? []));
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  }, [api, filter]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  async function handleStatus(id: string, status: 'approved' | 'rejected') {
    try {
      await api.patch(`/api/v1/admin/service-suggestions/${id}/status`, {
        body: { status },
      });
      await loadData();
    } catch {
      // silent
    }
  }

  async function handleDelete(item: SuggestionItem) {
    if (!confirm(`Hapus usulan "${item.serviceName}" dari ${item.partnerName}?`)) return;
    try {
      await api.delete(`/api/v1/admin/service-suggestions/${item.id}`);
      await loadData();
    } catch {
      // silent
    }
  }

  const columns: Column<SuggestionItem>[] = [
    {
      key: 'serviceName',
      header: 'Layanan',
      render: (item) => (
        <div>
          <p className="font-medium text-text-primary">{item.serviceName}</p>
          {item.description && (
            <p className="mt-0.5 text-xs text-text-muted line-clamp-2">{item.description}</p>
          )}
        </div>
      ),
    },
    {
      key: 'partnerName',
      header: 'Diusulkan Oleh',
      render: (item) => (
        <div>
          <p className="text-sm text-text-primary">{item.partnerName}</p>
          <p className="text-xs text-text-muted">{item.partnerEmail}</p>
        </div>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      render: (item) => (
        <Badge variant={STATUS_VARIANT[item.status] ?? 'default'}>
          {STATUS_LABEL[item.status] ?? item.status}
        </Badge>
      ),
    },
    {
      key: 'createdAt',
      header: 'Tanggal',
      render: (item) =>
        item.createdAt
          ? new Date(item.createdAt).toLocaleDateString('id-ID', {
              year: 'numeric',
              month: 'short',
              day: 'numeric',
            })
          : '-',
    },
    {
      key: 'id',
      header: 'Aksi',
      render: (item) => (
        <div className="flex flex-col gap-1 sm:flex-row sm:gap-1.5">
          {item.status === 'pending' && (
            <>
              <Button
                size="sm"
                variant="primary"
                onClick={() => handleStatus(item.id, 'approved')}
                className="!bg-success-500 hover:!bg-success-600 !border-success-500"
              >
                Setujui
              </Button>
              <Button size="sm" variant="danger" onClick={() => handleStatus(item.id, 'rejected')}>
                Tolak
              </Button>
            </>
          )}
          {item.status !== 'pending' && (
            <Button size="sm" variant="danger" onClick={() => handleDelete(item)}>
              Hapus
            </Button>
          )}
        </div>
      ),
    },
  ];

  if (loading) return <TableSkeleton />;

  const pendingCount = items.filter((i) => i.status === 'pending').length;

  return (
    <div className="space-y-4">
      {/* ── Filter tabs ──────────────────────────────────── */}
      <div className="flex items-center gap-2">
        {['', 'pending', 'approved', 'rejected'].map((f) => {
          const label =
            f === ''
              ? 'Semua'
              : f === 'pending'
                ? 'Menunggu'
                : f === 'approved'
                  ? 'Disetujui'
                  : 'Ditolak';
          return (
            <button
              key={f}
              type="button"
              onClick={() => setFilter(f)}
              className={`rounded-lg px-3.5 py-1.5 text-xs font-medium transition-colors ${
                filter === f
                  ? 'bg-primary-100 text-primary-700'
                  : 'bg-neutral-100 text-text-muted hover:bg-neutral-200 hover:text-text-primary'
              }`}
            >
              {label}
              {f === 'pending' && pendingCount > 0 && (
                <span className="ml-1.5 inline-flex h-4 w-4 items-center justify-center rounded-full bg-danger-500 text-[10px] font-bold text-white">
                  {pendingCount}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* ── Table ────────────────────────────────────────── */}
      <Table
        data={items}
        columns={columns}
        keyExtractor={(item) => item.id}
        emptyState={
          <EmptyState
            title="Belum ada usulan"
            description="Usulan layanan baru dari mitra akan muncul di sini"
          />
        }
      />
    </div>
  );
}
