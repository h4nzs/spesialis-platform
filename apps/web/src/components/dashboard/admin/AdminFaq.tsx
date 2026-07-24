import { useState, useEffect, useCallback, useMemo } from 'react';
import { createBrowserClient } from '@ahlipanggilan/shared';
import {
  Button,
  Input,
  Table,
  Badge,
  Pagination,
  EmptyState,
  TableSkeleton,
  Select,
  type SelectOption,
} from '@ahlipanggilan/ui';
import type { Column } from '@ahlipanggilan/ui';
import { useLockPolling } from '../../../lib/useLockPolling.ts';
import { LockBadge } from '@ahlipanggilan/ui';
import FaqFormModal from './FaqFormModal';

// ── Types ────────────────────────────────────────────────────────

interface FaqItem {
  id: string;
  question: string;
  answer: string;
  category: string | null;
  displayOrder: number;
  isActive: string;
  updatedAt: string | null;
}

const PAGE_SIZE = 20;

export function AdminFaq() {
  const api = useMemo(() => createBrowserClient(), []);
  const [items, setItems] = useState<FaqItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [categoryOptions, setCategoryOptions] = useState<SelectOption[]>([]);

  // ── Fetch service categories for filter dropdown ───────────
  useEffect(() => {
    api
      .get<{ slug: string; name: string }[]>('/api/v1/admin/service-categories')
      .then((cats) => {
        const list = Array.isArray(cats) ? cats : [];
        setCategoryOptions(
          list.map((c: { slug: string; name: string }) => ({ value: c.slug, label: c.name })),
        );
      })
      .catch(() => {});
  }, [api]);

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

  // ── Filter items by search query + category ───────────────

  // ── Filter items by search query + category ───────────────
  const filteredItems = useMemo(() => {
    let result = items;

    // Filter by category
    if (categoryFilter) {
      result = result.filter((item) => item.category === categoryFilter);
    }

    // Filter by search query (case-insensitive, match question text)
    if (searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase();
      result = result.filter(
        (item) =>
          item.question.toLowerCase().includes(q) ||
          (item.answer && item.answer.toLowerCase().includes(q)),
      );
    }

    return result;
  }, [items, categoryFilter, searchQuery]);

  // Visible item IDs for lock polling (uses filtered items — what's shown in the table)
  const visibleIds = useMemo(
    () => filteredItems.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE).map((i) => i.id),
    [filteredItems, page],
  );
  const lockMap = useLockPolling(visibleIds, 'faq', api);

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
      setPage(1);
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
              title={isLocked ? `Diedit oleh ${lockedByEmail}` : 'Edit FAQ'}
            >
              {isLocked ? 'Dikunci' : 'Edit'}
            </Button>
            <Button
              size="sm"
              variant="danger"
              disabled={isLocked}
              onClick={() => handleDelete(item)}
              title={isLocked ? `Sedang diedit oleh ${lockedByEmail}` : 'Hapus FAQ'}
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
      <div className="flex flex-wrap items-end gap-3">
        <div className="relative w-full sm:w-56">
          <Input
            label="Cari FAQ"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setPage(1);
            }}
            placeholder="Cari pertanyaan atau jawaban..."
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => {
                setSearchQuery('');
                setPage(1);
              }}
              className="absolute right-2 top-[calc(50%+10px)] -translate-y-1/2 flex h-5 w-5 items-center justify-center rounded-full text-text-muted transition-colors hover:bg-neutral-100 hover:text-text-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-500"
              aria-label="Hapus pencarian"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          )}
        </div>
        <div className="w-full sm:w-48">
          <Select
            label="Filter Kategori"
            value={categoryFilter}
            onChange={(e) => {
              setCategoryFilter(e.target.value);
              setPage(1);
            }}
            options={[{ value: '', label: 'Semua Kategori' }, ...categoryOptions]}
            placeholder="Pilih kategori"
          />
        </div>
        <Button onClick={openCreate}>Tambah FAQ</Button>
      </div>

      <Table
        data={filteredItems.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)}
        columns={columns}
        keyExtractor={(item) => item.id}
        emptyState={
          searchQuery.trim() || categoryFilter ? (
            <EmptyState
              title="Tidak ada FAQ yang cocok"
              description="Coba ubah kata kunci pencarian atau reset filter untuk melihat semua FAQ"
              action={
                <Button
                  size="sm"
                  onClick={() => {
                    setSearchQuery('');
                    setCategoryFilter('');
                  }}
                >
                  Reset Semua Filter
                </Button>
              }
            />
          ) : (
            <EmptyState
              title="Belum ada FAQ"
              description="Klik 'Tambah FAQ' untuk membuat pertanyaan baru"
            />
          )
        }
      />

      {filteredItems.length > PAGE_SIZE && (
        <Pagination
          page={page}
          totalPages={Math.ceil(filteredItems.length / PAGE_SIZE)}
          onPageChange={setPage}
        />
      )}

      {/* ── FAQ Form Modal ───────────────────────────────────── */}
      {/* Key based on editingId ensures React remounts the component
          when editing different FAQs — this makes useContentLock fire
          fresh acquire() calls instead of relying on stale effect. */}
      <FaqFormModal
        key={editing || 'new-faq'}
        open={showModal}
        onClose={() => setShowModal(false)}
        editingId={editing}
        onSaved={() => {
          setPage(1);
          loadData();
        }}
      />
    </div>
  );
}
