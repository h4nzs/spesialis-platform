import React, { useState, useEffect, useCallback, useMemo, Suspense } from 'react';
import { createBrowserClient } from '@specialist/shared';
import { TableSkeleton, SectionManager } from '@specialist/ui';
import { LazyFallback } from '../../ui/LazyFallback';
import type { HomepageSection } from '@specialist/ui';

// ── Lazy-loaded form modal ──────────────────────────────────────
const HomepageSectionFormModal = React.lazy(() => import('./HomepageSectionFormModal'));

export function AdminHomepage() {
  const api = useMemo(() => createBrowserClient(), []);
  const [sections, setItems] = useState<HomepageSection[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    try {
      const result = await api.get<HomepageSection[]>('/api/v1/admin/homepage-sections');
      setItems(Array.isArray(result) ? result : []);
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  }, [api]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // ── Section Manager handlers ──────────────────────────────────

  const handleReorder = useCallback(
    async (items: Array<{ id: string; sortOrder: number }>) => {
      try {
        await api.post('/api/v1/admin/homepage-sections/reorder', {
          body: { items },
        });
        // Optimistically update local state
        setItems((prev) => {
          const updated = [...prev];
          for (const item of items) {
            const idx = updated.findIndex((s) => s.id === item.id);
            if (idx !== -1) {
              updated[idx] = { ...updated[idx], sortOrder: item.sortOrder };
            }
          }
          return updated.sort((a, b) => a.sortOrder - b.sortOrder);
        });
      } catch {
        // Silent — reload to get correct order
        loadData();
      }
    },
    [api, sections, loadData],
  );

  const handleToggleActive = useCallback(
    async (id: string, isActive: boolean) => {
      try {
        await api.patch(`/api/v1/admin/homepage-sections/${id}`, {
          body: { isActive },
        });
        setItems((prev) => prev.map((s) => (s.id === id ? { ...s, isActive } : s)));
      } catch {
        loadData();
      }
    },
    [api, loadData],
  );

  const handleDelete = useCallback(
    async (id: string) => {
      const section = sections.find((s) => s.id === id);
      if (!section) return;
      if (!confirm(`Hapus section "${section.title || section.sectionType}"?`)) return;
      try {
        await api.delete(`/api/v1/admin/homepage-sections/${id}`);
        await loadData();
      } catch {
        // silent
      }
    },
    [api, sections, loadData],
  );

  // ── Add / Edit ─────────────────────────────────────────────────

  function openCreate() {
    setEditing(null);
    setShowModal(true);
  }

  function openEdit(section: HomepageSection) {
    setEditing(section.id);
    setShowModal(true);
  }

  if (loading) return <TableSkeleton />;

  return (
    <div className="space-y-4">
      <SectionManager
        sections={sections}
        onReorder={handleReorder}
        onToggleActive={handleToggleActive}
        onEdit={openEdit}
        onDelete={handleDelete}
        onAdd={openCreate}
      />

      {/* ── Section Form Modal (lazy-loaded) ────────────────── */}
      <Suspense fallback={<LazyFallback />}>
        <HomepageSectionFormModal
          open={showModal}
          onClose={() => setShowModal(false)}
          editingId={editing}
          onSaved={loadData}
        />
      </Suspense>
    </div>
  );
}
