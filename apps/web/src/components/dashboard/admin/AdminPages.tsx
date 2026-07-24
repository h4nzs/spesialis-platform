import { useState, useEffect, useCallback, useMemo } from 'react';
import { createBrowserClient } from '@ahlipanggilan/shared';
import { Button, Table, Badge, Pagination, EmptyState, TableSkeleton } from '@ahlipanggilan/ui';
import type { Column } from '@ahlipanggilan/ui';
import { useLockPolling } from '../../../lib/useLockPolling.ts';
import { LockBadge } from '@ahlipanggilan/ui';

interface PageItem {
  id: string;
  title: string;
  slug: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

const PAGE_SIZE = 50;

export function AdminPages() {
  const api = useMemo(() => createBrowserClient(), []);
  const [items, setItems] = useState<PageItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);

  // Visible item IDs for lock polling
  const visibleIds = useMemo(
    () => items.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE).map((i) => i.id),
    [items, page],
  );
  const lockMap = useLockPolling(visibleIds, 'cms_page', api);

  const loadData = useCallback(async () => {
    try {
      const result = await api.get<{ data: PageItem[] }>('/api/v1/admin/cms-pages', {
        params: { limit: 100 },
      });
      setItems(Array.isArray(result) ? result : (result?.data ?? []));
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  }, [api]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  function openCreate() {
    window.location.href = '/dashboard/admin/cms-pages/new';
  }

  function openEdit(item: PageItem) {
    window.location.href = `/dashboard/admin/cms-pages/edit/${item.id}`;
  }

  async function handleDelete(item: PageItem) {
    if (!confirm(`Hapus halaman "${item.title}"?`)) return;
    try {
      await api.delete(`/api/v1/admin/cms-pages/${item.id}`);
      setPage(1);
      await loadData();
    } catch {
      // silent
    }
  }

  const columns: Column<PageItem>[] = [
    {
      key: 'title',
      header: 'Judul',
      render: (item) => (
        <div>
          <span className="font-medium text-text-primary">{item.title}</span>
          <span className="ml-2 text-xs text-text-secondary">/{item.slug}</span>
        </div>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      render: (item) => {
        const variant =
          item.status === 'Published' ? 'success' : item.status === 'Draft' ? 'warning' : 'default';
        return <Badge variant={variant}>{item.status}</Badge>;
      },
    },
    {
      key: 'updatedAt',
      header: 'Diperbarui',
      render: (item) =>
        item.updatedAt
          ? new Date(item.updatedAt).toLocaleDateString('id-ID', {
              year: 'numeric',
              month: 'short',
              day: 'numeric',
            })
          : '-',
    },
    {
      key: 'lock',
      header: 'Dikunci',
      render: (item) => {
        const lockInfo = lockMap[item.id];
        if (!lockInfo?.locked) return <span className="text-text-muted">-</span>;
        return <LockBadge lockedByEmail={lockInfo.lockedByEmail} />;
      },
    },
    {
      key: 'id',
      header: 'Aksi',
      render: (item) => {
        const lockInfo = lockMap[item.id];
        const isLocked = lockInfo?.locked === true;
        const lockedByEmail = lockInfo?.lockedByEmail;

        return (
          <div className="flex gap-2">
            <Button
              size="sm"
              disabled={isLocked}
              onClick={() => openEdit(item)}
              title={isLocked ? `Diedit oleh ${lockedByEmail}` : 'Edit halaman'}
            >
              {isLocked ? 'Dikunci' : 'Edit'}
            </Button>
            <Button
              size="sm"
              variant="danger"
              disabled={isLocked}
              onClick={() => handleDelete(item)}
              title={isLocked ? `Sedang diedit oleh ${lockedByEmail}` : 'Hapus halaman'}
            >
              {isLocked ? 'Dikunci' : 'Hapus'}
            </Button>
          </div>
        );
      },
    },
  ];

  if (loading) return <TableSkeleton />;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-end">
        <Button onClick={openCreate}>Tambah Halaman</Button>
      </div>

      <Table
        data={items.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)}
        columns={columns}
        keyExtractor={(item) => item.id}
        emptyState={
          <EmptyState
            title="Belum ada halaman"
            description="Klik 'Tambah Halaman' untuk membuat halaman statis baru"
          />
        }
      />

      {items.length > PAGE_SIZE && (
        <Pagination
          page={page}
          totalPages={Math.ceil(items.length / PAGE_SIZE)}
          onPageChange={setPage}
        />
      )}
    </div>
  );
}
