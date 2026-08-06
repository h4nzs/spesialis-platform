import React, { useState, useEffect, useCallback, useMemo, Suspense } from 'react';
import { createBrowserClient } from '@ahlipanggilan/shared';
import { Button, Badge, EmptyState } from '@ahlipanggilan/ui';
import { LazyFallback } from '../../ui/LazyFallback';

interface BlogAdItem {
  id: string;
  title: string;
  imageUrl: string;
  caption: string | null;
  linkUrl: string | null;
  displayOrder: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

const BlogAdFormModal = React.lazy(() => import('./BlogAdFormModal'));

export function AdminBlogAds() {
  const api = useMemo(() => createBrowserClient(), []);
  const [items, setItems] = useState<BlogAdItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    try {
      const result = await api.get<{ data: BlogAdItem[] }>('/api/v1/admin/blog-ads', {
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

  function openEdit(item: BlogAdItem) {
    setEditing(item.id);
    setShowModal(true);
  }

  async function handleDelete(item: BlogAdItem) {
    if (!confirm(`Hapus iklan "${item.title}"?`)) return;
    try {
      await api.delete(`/api/v1/admin/blog-ads/${item.id}`);
      await loadData();
    } catch {
      // silent
    }
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-10 w-32 animate-pulse rounded-md bg-neutral-200" />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="animate-pulse rounded-xl border border-border-default p-4">
              <div className="aspect-square w-full rounded-lg bg-neutral-200" />
              <div className="mt-3 h-4 w-2/3 rounded bg-neutral-200" />
              <div className="mt-2 h-3 w-full rounded bg-neutral-200" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-end">
        <Button onClick={openCreate}>Tambah Iklan</Button>
      </div>

      {items.length === 0 ? (
        <EmptyState
          title="Belum ada iklan"
          description="Klik 'Tambah Iklan' untuk membuat iklan baru untuk sidebar blog"
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {items.map((item) => (
            <div
              key={item.id}
              className="group relative overflow-hidden rounded-xl border border-border-default bg-bg-surface transition-shadow hover:shadow-md"
            >
              <div className="aspect-square w-full overflow-hidden bg-neutral-100">
                <img
                  src={item.imageUrl}
                  alt={item.title}
                  loading="lazy"
                  decoding="async"
                  width="300"
                  height="300"
                  className="h-full w-full object-cover transition-transform group-hover:scale-105"
                />
              </div>
              <div className="p-3">
                <div className="flex items-start justify-between gap-2">
                  <h3 className="text-sm font-semibold text-text-primary line-clamp-1">
                    {item.title}
                  </h3>
                  <Badge variant={item.isActive ? 'success' : 'default'}>
                    {item.isActive ? 'Aktif' : 'Nonaktif'}
                  </Badge>
                </div>
                {item.caption && (
                  <p className="mt-1 text-xs text-text-muted line-clamp-2">{item.caption}</p>
                )}
                <div className="mt-2 flex items-center gap-2 text-xs text-text-muted">
                  <span>Urutan: {item.displayOrder}</span>
                </div>
                <div className="mt-3 flex gap-2 border-t border-border-default pt-3">
                  <Button size="sm" onClick={() => openEdit(item)}>
                    Edit
                  </Button>
                  <Button size="sm" variant="danger" onClick={() => handleDelete(item)}>
                    Hapus
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <Suspense fallback={<LazyFallback />}>
        <BlogAdFormModal
          open={showModal}
          onClose={() => setShowModal(false)}
          editingId={editing}
          onSaved={() => {
            loadData();
          }}
        />
      </Suspense>
    </div>
  );
}
