import React, { useState, useEffect, useCallback, useMemo, Suspense } from 'react';
import { createBrowserClient } from '@ahlipanggilan/shared';
import { Button, Table, Badge, Pagination, EmptyState, TableSkeleton } from '@ahlipanggilan/ui';
import { LazyFallback } from '../../ui/LazyFallback';
import type { Column } from '@ahlipanggilan/ui';

interface TestimonialItem {
  id: string;
  name: string;
  location: string | null;
  role: string | null;
  quote: string;
  rating: string;
  avatar: string | null;
  displayOrder: number;
  isActive: string;
  updatedAt: string;
}

const TestimonialFormModal = React.lazy(() => import('./TestimonialFormModal'));

const PAGE_SIZE = 20;

export function AdminTestimonials() {
  const api = useMemo(() => createBrowserClient(), []);
  const [items, setItems] = useState<TestimonialItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    try {
      const result = await api.get<{ data: TestimonialItem[] }>('/api/v1/admin/testimonials', {
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
    setEditing(null);
    setShowModal(true);
  }

  function openEdit(item: TestimonialItem) {
    setEditing(item.id);
    setShowModal(true);
  }

  async function handleDelete(item: TestimonialItem) {
    if (!confirm(`Hapus testimoni dari "${item.name}"?`)) return;
    try {
      await api.delete(`/api/v1/admin/testimonials/${item.id}`);
      setPage(1);
      await loadData();
    } catch {
      // silent
    }
  }

  const columns: Column<TestimonialItem>[] = [
    {
      key: 'name',
      header: 'Nama',
      render: (item) => <span className="font-medium text-text-primary">{item.name}</span>,
    },
    {
      key: 'location',
      header: 'Lokasi',
      render: (item) => item.location ?? <span className="text-text-muted">-</span>,
    },
    {
      key: 'role',
      header: 'Peran',
      render: (item) => item.role ?? <span className="text-text-muted">-</span>,
    },
    {
      key: 'quote',
      header: 'Testimoni',
      render: (item) => (
        <span className="text-text-secondary line-clamp-2 max-w-xs">{item.quote}</span>
      ),
    },
    {
      key: 'rating',
      header: 'Rating',
      render: (item) => (
        <span className="text-warning-500 font-semibold">{'★'.repeat(Number(item.rating))}</span>
      ),
    },
    {
      key: 'displayOrder',
      header: 'Urutan',
      render: (item) => <span className="text-text-muted">{item.displayOrder}</span>,
    },
    {
      key: 'isActive',
      header: 'Status',
      render: (item) => (
        <Badge variant={item.isActive === 'true' ? 'success' : 'default'}>
          {item.isActive === 'true' ? 'Aktif' : 'Nonaktif'}
        </Badge>
      ),
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
        <Button onClick={openCreate}>Tambah Testimoni</Button>
      </div>

      <Table
        data={items.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)}
        columns={columns}
        keyExtractor={(item) => item.id}
        emptyState={
          <EmptyState
            title="Belum ada testimoni"
            description="Klik 'Tambah Testimoni' untuk membuat testimoni baru"
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

      <Suspense fallback={<LazyFallback />}>
        <TestimonialFormModal
          open={showModal}
          onClose={() => setShowModal(false)}
          editingId={editing}
          onSaved={() => {
            setPage(1);
            loadData();
          }}
        />
      </Suspense>
    </div>
  );
}
