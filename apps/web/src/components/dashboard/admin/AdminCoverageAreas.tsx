import React, { useState, useEffect, useCallback, useMemo, Suspense } from 'react';
import { createBrowserClient } from '@ahlipanggilan/shared';
import { Button, Table, Badge, Pagination, EmptyState, TableSkeleton } from '@ahlipanggilan/ui';
import { LazyFallback } from '../../ui/LazyFallback';
import type { Column } from '@ahlipanggilan/ui';

interface CoverageAreaItem {
  id: string;
  city: string;
  note: string | null;
  displayOrder: number;
  isActive: string;
  createdAt: string;
  updatedAt: string;
}

// ── Lazy-loaded form modal ──────────────────────────────────────
const CoverageAreaFormModal = React.lazy(() => import('./CoverageAreaFormModal'));

const PAGE_SIZE = 20;

export function AdminCoverageAreas() {
  const api = useMemo(() => createBrowserClient(), []);
  const [items, setItems] = useState<CoverageAreaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    try {
      const result = await api.get<{ data: CoverageAreaItem[] }>('/api/v1/admin/coverage-areas');
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

  function openEdit(item: CoverageAreaItem) {
    setEditing(item.id);
    setShowModal(true);
  }

  async function handleDelete(item: CoverageAreaItem) {
    if (!confirm(`Hapus area layanan "${item.city}"?`)) return;
    try {
      await api.delete(`/api/v1/admin/coverage-areas/${item.id}`);
      setPage(1);
      await loadData();
    } catch {
      // silent
    }
  }

  const columns: Column<CoverageAreaItem>[] = [
    {
      key: 'city',
      header: 'Kota',
      render: (item) => <span className="font-medium text-text-primary">{item.city}</span>,
    },
    {
      key: 'note',
      header: 'Keterangan',
      render: (item) => {
        if (!item.note) return <span className="text-text-muted">-</span>;
        return <span className="text-text-secondary">{item.note}</span>;
      },
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
        <Button onClick={openCreate}>Tambah Area</Button>
      </div>

      <Table
        data={items.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)}
        columns={columns}
        keyExtractor={(item) => item.id}
        emptyState={
          <EmptyState
            title="Belum ada area layanan"
            description="Klik 'Tambah Area' untuk menambahkan kota yang dilayani"
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

      {/* ── Form Modal (lazy-loaded) ──────────────────────────── */}
      <Suspense fallback={<LazyFallback />}>
        <CoverageAreaFormModal
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
