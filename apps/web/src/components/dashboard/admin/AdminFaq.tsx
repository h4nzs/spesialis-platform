import React, { useState, useEffect, useCallback, useMemo, Suspense } from 'react';
import { createBrowserClient } from '@ahlipanggilan/shared';
import { Button, Table, Badge, EmptyState, TableSkeleton } from '@ahlipanggilan/ui';
import { LazyFallback } from '../../ui/LazyFallback';
import type { Column } from '@ahlipanggilan/ui';

interface FaqItem {
  id: string;
  question: string;
  answer: string;
  category: string | null;
  displayOrder: number;
  isActive: string;
  createdAt: string;
  updatedAt: string;
}

// ── Lazy-loaded form modal ──────────────────────────────────────
const FaqFormModal = React.lazy(() => import('./FaqFormModal'));

export function AdminFaq() {
  const api = useMemo(() => createBrowserClient(), []);
  const [items, setItems] = useState<FaqItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    try {
      const result = await api.get<{ data: FaqItem[] }>('/api/v1/admin/faq', {
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

  function openEdit(item: FaqItem) {
    setEditing(item.id);
    setShowModal(true);
  }

  async function handleDelete(item: FaqItem) {
    if (!confirm(`Hapus FAQ "${item.question}"?`)) return;
    try {
      await api.delete(`/api/v1/admin/faq/${item.id}`);
      await loadData();
    } catch {
      // silent
    }
  }

  const columns: Column<FaqItem>[] = [
    {
      key: 'question',
      header: 'Pertanyaan',
      render: (item) => (
        <span className="font-medium text-text-primary line-clamp-2">{item.question}</span>
      ),
    },
    {
      key: 'category',
      header: 'Kategori',
      render: (item) => {
        if (!item.category) return <span className="text-text-muted">-</span>;
        return <Badge variant="default">{item.category}</Badge>;
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
        <Button onClick={openCreate}>Tambah FAQ</Button>
      </div>

      <Table
        data={items}
        columns={columns}
        keyExtractor={(item) => item.id}
        emptyState={
          <EmptyState
            title="Belum ada FAQ"
            description="Klik 'Tambah FAQ' untuk membuat pertanyaan baru"
          />
        }
      />

      {/* ── FAQ Form Modal (lazy-loaded) ───────────────────── */}
      <Suspense fallback={<LazyFallback />}>
        <FaqFormModal
          open={showModal}
          onClose={() => setShowModal(false)}
          editingId={editing}
          onSaved={loadData}
        />
      </Suspense>
    </div>
  );
}
