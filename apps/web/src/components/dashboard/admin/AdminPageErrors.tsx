import { useState, useEffect, useCallback, useMemo } from 'react';
import { createBrowserClient } from '@specialist/shared';
import {
  Button,
  Input,
  Modal,
  Table,
  EmptyState,
  TableSkeleton,
  Pagination,
  ConfirmDialog,
} from '@specialist/ui';
import type { Column } from '@specialist/ui';

// ── Types ──────────────────────────────────────────────────────

interface PageErrorItem {
  id: string;
  path: string;
  referer: string | null;
  userAgent: string | null;
  count: number;
  firstSeen: string;
  lastSeen: string;
}

interface PageErrorStats {
  total: number;
  topPaths: PageErrorItem[];
  last24h: number;
}

interface CreateRedirectDraft {
  sourcePath: string;
  targetPath: string;
  errorId: string;
}

const PAGE_SIZE = 20;

// ── Component ──────────────────────────────────────────────────

export function AdminPageErrors() {
  const api = useMemo(() => createBrowserClient(), []);

  const [items, setItems] = useState<PageErrorItem[]>([]);
  const [stats, setStats] = useState<PageErrorStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [initialLoading, setInitialLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState('');

  // Delete confirm
  const [deleteTarget, setDeleteTarget] = useState<PageErrorItem | null>(null);
  const [deleting, setDeleting] = useState(false);

  // Clear all confirm
  const [showClearAll, setShowClearAll] = useState(false);
  const [clearingAll, setClearingAll] = useState(false);

  // Create Redirect modal
  const [showRedirectForm, setShowRedirectForm] = useState(false);
  const [redirectDraft, setRedirectDraft] = useState<CreateRedirectDraft>({
    sourcePath: '',
    targetPath: '',
    errorId: '',
  });
  const [redirectSubmitting, setRedirectSubmitting] = useState(false);
  const [redirectError, setRedirectError] = useState('');

  // ── Load data ──────────────────────────────────────────────
  const loadData = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const { data: rawData, pagination } = await api.getPaginated<Record<string, unknown>>(
        '/api/v1/admin/page-errors',
        { params: { page, limit: PAGE_SIZE, search: search || undefined } },
      );

      const mapped: PageErrorItem[] = (Array.isArray(rawData) ? rawData : []).map((d) => ({
        id: (d.id as string) ?? '',
        path: (d.path as string) ?? '',
        referer: (d.referer as string) ?? null,
        userAgent: (d.userAgent as string) ?? null,
        count: (d.count as number) ?? 0,
        firstSeen: (d.firstSeen as string) ?? '',
        lastSeen: (d.lastSeen as string) ?? '',
      }));

      setItems(mapped);
      setTotal(pagination?.total ?? 0);
    } catch {
      setError('Gagal memuat data 404');
      setItems([]);
    } finally {
      setLoading(false);
      setInitialLoading(false);
    }
  }, [api, page, search]);

  const loadStats = useCallback(async () => {
    try {
      const data = await api.get<PageErrorStats>('/api/v1/admin/page-errors/stats');
      setStats(data);
    } catch {
      // Stats are non-critical
    }
  }, [api]);

  useEffect(() => {
    loadData();
    loadStats();
  }, [loadData, loadStats]);

  // ── Search handler ─────────────────────────────────────────
  const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
    setPage(1);
  }, []);

  // ── Delete handler ─────────────────────────────────────────
  async function handleDelete() {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await api.delete(`/api/v1/admin/page-errors/${deleteTarget.id}`);
      setDeleteTarget(null);
      await Promise.all([loadData(), loadStats()]);
    } catch {
      setError('Gagal menghapus entry');
    } finally {
      setDeleting(false);
    }
  }

  // ── Clear all handler ──────────────────────────────────────
  async function handleClearAll() {
    setClearingAll(true);
    try {
      await api.delete('/api/v1/admin/page-errors/all');
      setShowClearAll(false);
      await Promise.all([loadData(), loadStats()]);
    } catch {
      setError('Gagal menghapus semua entry');
    } finally {
      setClearingAll(false);
    }
  }

  // ── Create Redirect handler ────────────────────────────────
  function openRedirectForm(item: PageErrorItem) {
    setRedirectDraft({ sourcePath: item.path, targetPath: '', errorId: item.id });
    setRedirectError('');
    setShowRedirectForm(true);
  }

  async function handleCreateRedirect() {
    if (!redirectDraft.sourcePath || !redirectDraft.targetPath) {
      setRedirectError('Target path wajib diisi');
      return;
    }
    setRedirectSubmitting(true);
    setRedirectError('');
    try {
      await api.post('/api/v1/admin/redirects', {
        body: {
          sourcePath: redirectDraft.sourcePath,
          targetPath: redirectDraft.targetPath,
          statusCode: 301,
          isActive: true,
          notes: 'Auto-created from 404 monitor',
        },
      });
      setShowRedirectForm(false);
      // Delete the page error after creating the redirect
      await api.delete(`/api/v1/admin/page-errors/${redirectDraft.errorId}`);
      await Promise.all([loadData(), loadStats()]);
    } catch (err) {
      setRedirectError(
        err instanceof Error
          ? err.message
          : 'Gagal membuat redirect. Source path mungkin sudah digunakan.',
      );
    } finally {
      setRedirectSubmitting(false);
    }
  }

  // ── Pagination ─────────────────────────────────────────────
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  // ── Helpers ────────────────────────────────────────────────
  function fmtDate(dateStr: string | Date): string {
    const d = typeof dateStr === 'string' ? new Date(dateStr) : dateStr;
    const now = new Date();
    const diffMs = now.getTime() - d.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 60) return `${diffMins}m lalu`;
    if (diffHours < 24) return `${diffHours}j lalu`;
    if (diffDays < 7) return `${diffDays}h lalu`;
    return d.toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  }

  // ── Columns ─────────────────────────────────────────────────
  const columns: Column<PageErrorItem>[] = [
    {
      key: 'path',
      header: 'Path',
      render: (item) => (
        <code className="text-xs text-text-primary font-mono bg-neutral-100 px-1.5 py-0.5 rounded break-all">
          {item.path}
        </code>
      ),
    },
    {
      key: 'count',
      header: 'Hit',
      render: (item) => (
        <span className="text-sm font-semibold text-text-primary font-mono tabular-nums">
          {item.count}
        </span>
      ),
    },
    {
      key: 'lastSeen',
      header: 'Terakhir',
      render: (item) => (
        <span
          className="text-sm text-text-muted"
          title={new Date(item.lastSeen).toLocaleString('id-ID')}
        >
          {fmtDate(item.lastSeen)}
        </span>
      ),
    },
    {
      key: 'firstSeen',
      header: 'Pertama',
      render: (item) => <span className="text-sm text-text-muted">{fmtDate(item.firstSeen)}</span>,
    },
    {
      key: 'referer',
      header: 'Referer',
      render: (item) =>
        item.referer ? (
          <span
            className="text-xs text-text-secondary max-w-[150px] block truncate"
            title={item.referer}
          >
            {item.referer}
          </span>
        ) : (
          <span className="text-xs text-text-muted">-</span>
        ),
    },
    {
      key: 'id',
      header: 'Aksi',
      render: (item) => (
        <div className="flex gap-1">
          <Button size="sm" variant="primary" onClick={() => openRedirectForm(item)}>
            Buat Redirect
          </Button>
          <Button size="sm" variant="ghost" onClick={() => setDeleteTarget(item)}>
            Hapus
          </Button>
        </div>
      ),
    },
  ];

  if (initialLoading) return <TableSkeleton />;

  return (
    <div className="space-y-6">
      {error && (
        <div className="rounded-lg border border-danger-200 bg-danger-50 px-4 py-3 text-sm text-danger-700">
          {error}
        </div>
      )}

      {/* ── Stats Cards ─────────────────────────────────────────── */}
      {stats && (
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="rounded-lg border border-border-default bg-bg-surface p-4 space-y-1">
            <p className="text-body-sm text-text-secondary">Total Error 404</p>
            <p className="text-h3 font-bold text-text-primary">{stats.total}</p>
          </div>
          <div className="rounded-lg border border-warning-200 bg-warning-50 p-4 space-y-1">
            <p className="text-body-sm text-warning-600">24 Jam Terakhir</p>
            <p className="text-h3 font-bold text-warning-600">{stats.last24h}</p>
          </div>
          <div className="rounded-lg border border-border-default bg-bg-surface p-4 space-y-1">
            <p className="text-body-sm text-text-secondary">Top Error</p>
            <p className="text-h4 font-bold text-text-primary truncate">
              {stats.topPaths[0]?.path ?? '-'}
              {stats.topPaths[0] && (
                <span className="ml-2 text-body-sm font-normal text-text-muted">
                  ({stats.topPaths[0].count}x)
                </span>
              )}
            </p>
          </div>
        </div>
      )}

      {/* ── Filters + Actions ──────────────────────────────────── */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-64">
            <Input placeholder="Cari path..." value={search} onChange={handleSearchChange} />
          </div>
          {total > 0 && <span className="text-sm text-text-muted">{total} error path</span>}
        </div>
        <div className="flex items-center gap-2">
          {items.length > 0 && (
            <Button variant="danger" onClick={() => setShowClearAll(true)}>
              Hapus Semua
            </Button>
          )}
        </div>
      </div>

      {/* ── Table ───────────────────────────────────────────────── */}
      {loading && !initialLoading ? (
        <TableSkeleton />
      ) : (
        <Table
          columns={columns}
          data={items}
          keyExtractor={(item) => item.id}
          emptyState={
            <EmptyState
              title={search ? 'Tidak ada 404 yang cocok' : 'Tidak ada error 404'}
              description={
                search
                  ? 'Coba gunakan kata kunci lain'
                  : 'Belum ada pengunjung yang mengakses halaman yang tidak ditemukan'
              }
            />
          }
        />
      )}

      {/* ── Pagination ─────────────────────────────────────────── */}
      {totalPages > 1 && <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />}

      {/* ── Create Redirect Modal ──────────────────────────────── */}
      <Modal
        open={showRedirectForm}
        onClose={() => setShowRedirectForm(false)}
        title="Buat Redirect dari 404"
      >
        <div className="space-y-4">
          {redirectError && (
            <div className="rounded-lg border border-danger-200 bg-danger-50 px-3 py-2 text-sm text-danger-700">
              {redirectError}
            </div>
          )}
          <p className="text-sm text-text-secondary">
            Buat redirect 301 untuk path yang sering menghasilkan error 404:
          </p>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-text-primary">
              Source Path
            </label>
            <div className="w-full rounded-md border border-border-default bg-neutral-50 px-3 py-2 text-sm text-text-muted font-mono">
              {redirectDraft.sourcePath}
            </div>
          </div>

          <Input
            label="Target Path"
            value={redirectDraft.targetPath}
            onChange={(e) => setRedirectDraft((f) => ({ ...f, targetPath: e.target.value }))}
            placeholder="/baru/halaman-pengganti"
            required
          />
          <p className="-mt-2 text-xs text-text-muted">
            URL tujuan redirect. Bisa path relatif atau URL absolut
          </p>

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="ghost" type="button" onClick={() => setShowRedirectForm(false)}>
              Batal
            </Button>
            <Button type="button" onClick={handleCreateRedirect} disabled={redirectSubmitting}>
              {redirectSubmitting ? 'Menyimpan...' : 'Buat Redirect'}
            </Button>
          </div>
        </div>
      </Modal>

      {/* ── Delete Confirmation ────────────────────────────────── */}
      <ConfirmDialog
        open={!!deleteTarget}
        onCancel={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Hapus Entry 404"
        confirmVariant="danger"
        loading={deleting}
      >
        <p>
          Hapus entry 404 untuk path <strong>{deleteTarget?.path}</strong>?
        </p>
        <p className="mt-1 text-sm text-text-secondary">
          Data akan tetap tercatat ulang jika pengunjung mengakses path yang sama.
        </p>
      </ConfirmDialog>

      {/* ── Clear All Confirmation ─────────────────────────────── */}
      <ConfirmDialog
        open={showClearAll}
        onCancel={() => setShowClearAll(false)}
        onConfirm={handleClearAll}
        title="Hapus Semua Entry 404"
        confirmVariant="danger"
        loading={clearingAll}
      >
        <p>Hapus semua {total} entry 404?</p>
        <p className="mt-1 text-sm text-text-secondary">
          Tindakan ini tidak dapat dibatalkan. Data akan tetap tercatat ulang untuk error baru.
        </p>
      </ConfirmDialog>
    </div>
  );
}
