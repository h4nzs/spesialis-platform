import { useState, useEffect, useCallback, useMemo } from 'react';
import { createBrowserClient } from '@ahlipanggilan/shared';
import { Button, Table, Badge, EmptyState, TableSkeleton } from '@ahlipanggilan/ui';
import type { Column } from '@ahlipanggilan/ui';

interface PageItem {
  id: string;
  title: string;
  slug: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export function AdminPages() {
  const api = useMemo(() => createBrowserClient(), []);
  const [items, setItems] = useState<PageItem[]>([]);
  const [loading, setLoading] = useState(true);

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
      key: 'id',
      header: 'Aksi',
      render: (item) => (
        <div className="flex gap-2">
          <Button size="sm" onClick={() => openEdit(item)}>
            Edit
          </Button>
          <Button size="sm" variant="danger" onClick={() => handleDelete(item)}>
            Hapus
          </Button>
        </div>
      ),
    },
  ];

  if (loading) return <TableSkeleton />;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-end">
        <Button onClick={openCreate}>Tambah Halaman</Button>
      </div>

      <Table
        data={items}
        columns={columns}
        keyExtractor={(item) => item.id}
        emptyState={
          <EmptyState
            title="Belum ada halaman"
            description="Klik 'Tambah Halaman' untuk membuat halaman statis baru"
          />
        }
      />
    </div>
  );
}
