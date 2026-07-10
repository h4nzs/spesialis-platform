import { useState, useEffect, useCallback, useMemo } from 'react';
import { createBrowserClient } from '@specialist/shared';
import { Button, Select, Table, Pagination, EmptyState, TableSkeleton } from '@specialist/ui';
import type { Column } from '@specialist/ui';

// ── Types ──────────────────────────────────────────────────────

interface ArticleItem {
  id: string;
  title: string;
  slug: string;
  status: string;
  metaTitle: string | null;
  metaDescription: string | null;
  ogImage: string | null;
  categoryName: string | null;
  publishedAt: string | null;
  createdAt: string;
}

// ── Constants ──────────────────────────────────────────────────

const PAGE_SIZE = 50;

const STATUS_FILTERS = [
  { value: '', label: 'Semua Status' },
  { value: 'Draft', label: 'Draft' },
  { value: 'Review', label: 'Review' },
  { value: 'Published', label: 'Published' },
  { value: 'Archived', label: 'Archived' },
];

// ── Helpers ────────────────────────────────────────────────────

function getStatusColor(status: string): string {
  switch (status) {
    case 'Published':
      return 'text-success-600 bg-success-50';
    case 'Draft':
      return 'text-text-muted bg-neutral-100';
    case 'Review':
      return 'text-warning-600 bg-warning-50';
    case 'Archived':
      return 'text-danger-600 bg-danger-50';
    default:
      return 'text-text-muted bg-neutral-100';
  }
}

// ── Component ──────────────────────────────────────────────────

export function BulkSeoEditor() {
  const api = useMemo(() => createBrowserClient(), []);

  const [articles, setArticles] = useState<ArticleItem[]>([]);
  const [initialLoading, setInitialLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');

  // Pagination
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  // Filters
  const [statusFilter, setStatusFilter] = useState('');

  // Edits (local override map: id → { metaTitle, metaDescription })
  const [edits, setEdits] = useState<
    Record<string, { metaTitle: string; metaDescription: string }>
  >({});
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // ── Load data ───────────────────────────────────────────────
  const loadData = useCallback(async () => {
    if (!initialLoading) setRefreshing(true);
    setError('');

    try {
      const params: Record<string, string | number> = { page, limit: PAGE_SIZE };
      if (statusFilter) params.status = statusFilter;

      const { data: rawData, pagination } = await api.getPaginated<Record<string, unknown>>(
        '/api/v1/admin/articles',
        { params },
      );

      const items: ArticleItem[] = (Array.isArray(rawData) ? rawData : []).map((d) => ({
        id: (d.id as string) ?? '',
        title: (d.title as string) ?? '',
        slug: (d.slug as string) ?? '',
        status: (d.status as string) ?? 'Draft',
        metaTitle: (d.metaTitle as string) ?? null,
        metaDescription: (d.metaDescription as string) ?? null,
        ogImage: (d.ogImage as string) ?? null,
        categoryName: (d.categoryName as string) ?? null,
        publishedAt: (d.publishedAt as string) ?? null,
        createdAt: (d.createdAt as string) ?? '',
      }));

      setArticles(items);
      setTotalPages(pagination?.totalPages ?? 1);
      setTotalItems(pagination?.total ?? 0);
    } catch {
      setError('Gagal memuat artikel');
      setArticles([]);
    } finally {
      setInitialLoading(false);
      setRefreshing(false);
    }
  }, [api, page, statusFilter, initialLoading]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // ── Edit handlers ───────────────────────────────────────────
  const handleEdit = useCallback(
    (id: string, field: 'metaTitle' | 'metaDescription', value: string) => {
      setEdits((prev) => {
        const current =
          prev[id] ??
          (() => {
            const article = articles.find((a) => a.id === id);
            return {
              metaTitle: article?.metaTitle ?? '',
              metaDescription: article?.metaDescription ?? '',
            };
          })();

        const updated = { ...current, [field]: value };

        // Clean up if unchanged from original
        const article = articles.find((a) => a.id === id);
        if (
          updated.metaTitle === (article?.metaTitle ?? '') &&
          updated.metaDescription === (article?.metaDescription ?? '')
        ) {
          const next = { ...prev };
          delete next[id];
          return next;
        }

        return { ...prev, [id]: updated };
      });
      setSaveSuccess(false);
    },
    [articles],
  );

  // ── Bulk save ───────────────────────────────────────────────
  const handleSaveAll = useCallback(async () => {
    const ids = Object.keys(edits);
    if (ids.length === 0) return;

    setSaving(true);
    setError('');
    setSaveSuccess(false);

    const results = await Promise.allSettled(
      ids.map((id) =>
        api.patch(`/api/v1/admin/articles/${id}`, {
          body: edits[id],
        }),
      ),
    );

    const failed = results.filter((r) => r.status === 'rejected').length;

    if (failed > 0) {
      setError(`${failed} dari ${ids.length} artikel gagal disimpan`);
    } else {
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 4000);
      setEdits({});
      await loadData();
    }
    setSaving(false);
  }, [api, edits, loadData]);

  // ── Reset edits ─────────────────────────────────────────────
  const hasEdits = Object.keys(edits).length > 0;

  // ── Columns ─────────────────────────────────────────────────
  const columns: Column<ArticleItem>[] = [
    {
      key: 'title',
      header: 'Judul Artikel',
      render: (item) => (
        <div className="min-w-0">
          <p
            className="text-sm font-medium text-text-primary truncate max-w-[200px]"
            title={item.title}
          >
            {item.title}
          </p>
          {item.categoryName && (
            <span className="text-[10px] text-text-muted">{item.categoryName}</span>
          )}
        </div>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      render: (item) => (
        <span
          className={`inline-block rounded-full px-2 py-0.5 text-[10px] font-medium ${getStatusColor(item.status)}`}
        >
          {item.status}
        </span>
      ),
    },
    {
      key: 'metaTitle',
      header: 'Meta Title',
      render: (item) => {
        const edit = edits[item.id];
        const value = edit?.metaTitle ?? item.metaTitle ?? '';
        const tooLong = value.length > 60;
        return (
          <div>
            <input
              type="text"
              value={value}
              onChange={(e) => handleEdit(item.id, 'metaTitle', e.target.value)}
              className={`w-full rounded border px-2 py-1 text-xs outline-none transition-colors focus:ring-1 ${
                tooLong
                  ? 'border-danger-300 bg-danger-50 focus:border-danger-500 focus:ring-danger-500'
                  : 'border-border-default bg-bg-surface focus:border-primary focus:ring-primary'
              }`}
              placeholder="Meta title..."
              maxLength={70}
            />
            <span
              className={`text-[9px] ${tooLong ? 'text-danger-500 font-medium' : 'text-text-muted'}`}
            >
              {value.length}/60
            </span>
          </div>
        );
      },
    },
    {
      key: 'metaDescription',
      header: 'Meta Description',
      render: (item) => {
        const edit = edits[item.id];
        const value = edit?.metaDescription ?? item.metaDescription ?? '';
        const tooLong = value.length > 160;
        return (
          <div>
            <input
              type="text"
              value={value}
              onChange={(e) => handleEdit(item.id, 'metaDescription', e.target.value)}
              className={`w-full rounded border px-2 py-1 text-xs outline-none transition-colors focus:ring-1 ${
                tooLong
                  ? 'border-danger-300 bg-danger-50 focus:border-danger-500 focus:ring-danger-500'
                  : 'border-border-default bg-bg-surface focus:border-primary focus:ring-primary'
              }`}
              placeholder="Meta description..."
              maxLength={170}
            />
            <span
              className={`text-[9px] ${tooLong ? 'text-danger-500 font-medium' : 'text-text-muted'}`}
            >
              {value.length}/160
            </span>
          </div>
        );
      },
    },
  ];

  if (initialLoading) return <TableSkeleton />;

  return (
    <div className="space-y-6">
      {refreshing && (
        <div className="h-1 w-full overflow-hidden rounded-full bg-neutral-100" aria-hidden="true">
          <div className="h-full w-full animate-loading-bar rounded-full bg-primary-500" />
        </div>
      )}

      {/* Summary + filters */}
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div className="flex flex-wrap items-end gap-3">
          <div className="w-40">
            <Select
              label="Status"
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setPage(1);
                setEdits({});
              }}
              options={STATUS_FILTERS}
            />
          </div>
        </div>
        <div className="flex items-center gap-2">
          {hasEdits && (
            <>
              <span className="text-sm text-text-muted">
                {Object.keys(edits).length} artikel diubah
              </span>
              <Button variant="ghost" onClick={() => setEdits({})} disabled={saving}>
                Reset
              </Button>
              <Button onClick={handleSaveAll} disabled={saving}>
                {saving ? 'Menyimpan...' : `Simpan ${Object.keys(edits).length} Perubahan`}
              </Button>
            </>
          )}
        </div>
      </div>

      {error && (
        <div className="rounded-lg border border-danger-200 bg-danger-50 px-4 py-3 text-sm text-danger-700">
          {error}
        </div>
      )}

      {saveSuccess && (
        <div className="rounded-lg border border-success-200 bg-success-50 px-4 py-3 text-sm text-success-700 transition-opacity duration-500">
          Semua perubahan berhasil disimpan!
        </div>
      )}

      {/* Table */}
      <Table
        data={articles}
        columns={columns}
        keyExtractor={(item) => item.id}
        emptyState={
          <EmptyState
            title="Tidak ada artikel"
            description={
              statusFilter ? 'Tidak ada artikel dengan status tersebut.' : 'Belum ada artikel.'
            }
          />
        }
      />

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between pt-2">
          <p className="text-body-sm text-text-muted">
            Menampilkan {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, totalItems)} dari{' '}
            {totalItems} artikel
          </p>
          <Pagination
            page={page}
            totalPages={totalPages}
            onPageChange={(p) => {
              if (hasEdits && !confirm('Ada perubahan yang belum disimpan. Lanjutkan?')) return;
              setPage(p);
              setEdits({});
            }}
          />
        </div>
      )}
    </div>
  );
}
