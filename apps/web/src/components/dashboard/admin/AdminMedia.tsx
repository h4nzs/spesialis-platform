import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { createBrowserClient } from '@ahlipanggilan/shared';
import { Button, Input, Select, Pagination, TableSkeleton, ConfirmDialog } from '@ahlipanggilan/ui';

// ── Types ──────────────────────────────────────────────────────

interface MediaItem {
  id: string;
  filename: string;
  mimeType: string;
  extension: string;
  size: number;
  width: number | null;
  height: number | null;
  url: string;
  createdAt: string;
}

// ── Constants ──────────────────────────────────────────────────

const PAGE_SIZE = 24;

const MEDIA_TYPE_OPTIONS = [
  { value: '', label: 'Semua File' },
  { value: 'images', label: 'Gambar' },
  { value: 'documents', label: 'Dokumen' },
];

// ── Helpers ────────────────────────────────────────────────────

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('id-ID', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

function isImage(mime: string): boolean {
  return mime.startsWith('image/');
}

// ── Component ──────────────────────────────────────────────────

export function AdminMedia() {
  const api = useMemo(() => createBrowserClient(), []);

  // Data state
  const [items, setItems] = useState<MediaItem[]>([]);

  // Loading states
  const [initialLoading, setInitialLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Pagination
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  // Filters
  const [search, setSearch] = useState('');
  const [mediaType, setMediaType] = useState('');

  // Upload state
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Delete state
  const [deleteTarget, setDeleteTarget] = useState<MediaItem | null>(null);
  const [deleting, setDeleting] = useState(false);

  // Bulk delete state
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [bulkDeleting, setBulkDeleting] = useState(false);
  const [showBulkConfirm, setShowBulkConfirm] = useState(false);

  // Error state
  const [error, setError] = useState('');

  // ── Data loading ─────────────────────────────────────────────
  const loadData = useCallback(async () => {
    if (!initialLoading) setRefreshing(true);
    setError('');

    try {
      const params: Record<string, string | number> = {
        page,
        limit: PAGE_SIZE,
      };
      if (search) params.search = search;
      if (mediaType) params.mediaType = mediaType;

      const { data: rawData, pagination } = await api.getPaginated<MediaItem>('/api/v1/media', {
        params,
      });

      setItems(Array.isArray(rawData) ? rawData : []);
      setTotalPages(pagination?.totalPages ?? 1);
      setTotalItems(pagination?.total ?? 0);
    } catch {
      setError('Gagal memuat media');
      setItems([]);
    } finally {
      setInitialLoading(false);
      setRefreshing(false);
    }
  }, [api, page, search, mediaType, initialLoading]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // ── Filter / page handlers ─────────────────────────────────
  const handlePageChange = useCallback((newPage: number) => {
    setPage(newPage);
    setSelectedIds(new Set());
  }, []);

  const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
    setPage(1);
    setSelectedIds(new Set());
  }, []);

  const handleMediaTypeChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    setMediaType(e.target.value);
    setPage(1);
    setSelectedIds(new Set());
  }, []);

  // ── Upload handler ──────────────────────────────────────────
  const handleUpload = useCallback(
    async (files: FileList) => {
      const fileList = Array.from(files);
      if (fileList.length === 0) return;

      setUploading(true);
      setError('');

      try {
        for (const file of fileList) {
          const formData = new FormData();
          formData.append('file', file);
          await api.post('/api/v1/media/upload', { formData });
        }
        setPage(1);
        await loadData();
      } catch {
        setError('Gagal mengupload file');
      } finally {
        setUploading(false);
      }
    },
    [api, loadData],
  );

  // ── Delete handler ──────────────────────────────────────────
  const handleDelete = useCallback(async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await api.delete(`/api/v1/media/${deleteTarget.id}`);
      setDeleteTarget(null);
      setSelectedIds((prev) => {
        const next = new Set(prev);
        next.delete(deleteTarget.id);
        return next;
      });
      await loadData();
    } catch {
      setError('Gagal menghapus file');
    } finally {
      setDeleting(false);
    }
  }, [api, deleteTarget, loadData]);

  // ── Bulk delete handler ─────────────────────────────────────
  const handleBulkDelete = useCallback(async () => {
    if (selectedIds.size === 0) return;
    setBulkDeleting(true);
    let failed = 0;
    try {
      for (const id of selectedIds) {
        try {
          await api.delete(`/api/v1/media/${id}`);
        } catch {
          failed++;
        }
      }
      setShowBulkConfirm(false);
      setSelectedIds(new Set());
      await loadData();
      if (failed > 0) {
        setError(`${failed} file gagal dihapus`);
      }
    } catch {
      setError('Gagal menghapus file');
    } finally {
      setBulkDeleting(false);
    }
  }, [api, selectedIds, loadData]);

  // ── Selection handlers ──────────────────────────────────────
  const toggleSelect = useCallback((id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const selectAll = useCallback(() => {
    setSelectedIds(new Set(items.map((i) => i.id)));
  }, [items]);

  const deselectAll = useCallback(() => {
    setSelectedIds(new Set());
  }, []);

  const allSelected = items.length > 0 && selectedIds.size === items.length;

  if (initialLoading) return <TableSkeleton />;

  return (
    <div className="space-y-6">
      {/* ── Progress bar ──────────────────────────────────────── */}
      {refreshing && (
        <div className="h-1 w-full overflow-hidden rounded-full bg-neutral-100" aria-hidden="true">
          <div className="h-full w-full animate-loading-bar rounded-full bg-primary-500" />
        </div>
      )}

      {/* ── Summary ──────────────────────────────────────────── */}
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-lg border border-border-default bg-bg-surface p-4 space-y-1">
          <p className="text-body-sm text-text-secondary">Total File</p>
          <p className="text-h3 font-bold text-text-primary">{totalItems}</p>
        </div>
        <div className="rounded-lg border border-border-default bg-bg-surface p-4 space-y-1">
          <p className="text-body-sm text-text-secondary">Halaman Ini</p>
          <p className="text-h3 font-bold text-text-primary">{items.length}</p>
        </div>
        <div className="rounded-lg border border-border-default bg-bg-surface p-4 space-y-1">
          <p className="text-body-sm text-text-secondary">Gambar</p>
          <p className="text-h3 font-bold text-success-600">
            {items.filter((m) => isImage(m.mimeType)).length}
          </p>
        </div>
      </div>

      {/* ── Filters + Actions ────────────────────────────────── */}
      <div className="flex flex-wrap items-end gap-3">
        <div className="w-44">
          <Select
            label="Tipe"
            value={mediaType}
            onChange={handleMediaTypeChange}
            options={MEDIA_TYPE_OPTIONS}
          />
        </div>
        <div className="flex-1 min-w-[200px]">
          <Input
            label="Cari"
            value={search}
            onChange={handleSearchChange}
            placeholder="Cari file..."
          />
        </div>
        <div className="flex items-end gap-2">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,application/pdf"
            multiple
            className="hidden"
            onChange={(e) => {
              if (e.target.files) handleUpload(e.target.files);
              e.target.value = '';
            }}
          />
          <Button type="button" onClick={() => fileInputRef.current?.click()} disabled={uploading}>
            {uploading ? 'Mengupload...' : 'Upload File'}
          </Button>
        </div>
      </div>

      {/* ── Bulk actions bar ──────────────────────────────────── */}
      {items.length > 0 && (
        <div className="flex flex-wrap items-center gap-3">
          <label className="flex cursor-pointer items-center gap-2 text-sm text-text-secondary hover:text-text-primary transition-colors">
            <input
              type="checkbox"
              checked={allSelected}
              onChange={allSelected ? deselectAll : selectAll}
              className="rounded border-border-default text-primary focus:ring-primary"
            />
            {allSelected ? 'Batal pilih semua' : 'Pilih semua'}
          </label>
          {selectedIds.size > 0 && (
            <>
              <span className="text-sm text-text-muted">{selectedIds.size} terpilih</span>
              <Button
                variant="danger"
                size="sm"
                onClick={() => setShowBulkConfirm(true)}
                disabled={bulkDeleting}
              >
                {bulkDeleting ? 'Menghapus...' : `Hapus ${selectedIds.size} file`}
              </Button>
            </>
          )}
        </div>
      )}

      {/* ── Error ────────────────────────────────────────────── */}
      {error && (
        <div className="rounded-lg border border-danger-200 bg-danger-50 px-4 py-3 text-sm text-danger-700">
          {error}
        </div>
      )}

      {/* ── Upload progress ──────────────────────────────────── */}
      {uploading && (
        <div className="flex items-center gap-2 text-sm text-text-muted">
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          Mengupload file...
        </div>
      )}

      {/* ── Grid ──────────────────────────────────────────────── */}
      {items.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-border-default py-16 text-center">
          <div className="text-4xl text-text-muted">🖼️</div>
          <p className="mt-3 text-sm text-text-muted">
            {search || mediaType ? 'Tidak ada file yang cocok' : 'Belum ada file'}
          </p>
          {!search && !mediaType && (
            <Button
              variant="secondary"
              className="mt-4"
              onClick={() => fileInputRef.current?.click()}
            >
              Upload File Pertama
            </Button>
          )}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
            {items.map((item) => (
              <div
                key={item.id}
                className="group relative flex flex-col overflow-hidden rounded-lg border border-border-default bg-bg-surface transition-all hover:shadow-sm"
              >
                {/* Thumbnail */}
                <div className="aspect-square overflow-hidden bg-neutral-100">
                  {isImage(item.mimeType) ? (
                    <img
                      src={item.url}
                      alt={item.filename}
                      loading="lazy"
                      decoding="async"
                      className="h-full w-full object-cover transition-transform group-hover:scale-105"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center text-3xl text-text-muted">
                      📄
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="flex flex-1 flex-col justify-between px-2.5 py-2">
                  <p
                    className="truncate text-xs font-medium text-text-primary"
                    title={item.filename}
                  >
                    {item.filename}
                  </p>
                  <div className="mt-1 flex items-center justify-between">
                    <span className="text-[10px] text-text-muted">
                      {item.width && item.height
                        ? `${item.width}×${item.height}`
                        : formatSize(item.size)}
                    </span>
                    <span className="text-[10px] text-text-muted">
                      {formatDate(item.createdAt)}
                    </span>
                  </div>
                </div>

                {/* Checkbox (selection mode) */}
                <label
                  className="absolute left-1.5 top-1.5 z-10 flex h-5 w-5 cursor-pointer items-center justify-center rounded border border-border-default bg-white/80 opacity-0 transition-opacity group-hover:opacity-100 hover:bg-white"
                  aria-label={`Pilih ${item.filename}`}
                >
                  <input
                    type="checkbox"
                    checked={selectedIds.has(item.id)}
                    onChange={() => toggleSelect(item.id)}
                    className="h-3.5 w-3.5 rounded border-border-default text-primary focus:ring-primary"
                  />
                </label>

                {/* Delete button overlay */}
                <button
                  type="button"
                  onClick={() => setDeleteTarget(item)}
                  className="absolute right-1.5 top-1.5 flex h-6 w-6 items-center justify-center rounded-full bg-danger-500/90 text-white opacity-0 transition-opacity hover:bg-danger-600 group-hover:opacity-100"
                  aria-label={`Hapus ${item.filename}`}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="12"
                    height="12"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M3 6h18" />
                    <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
                    <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
                  </svg>
                </button>
              </div>
            ))}
          </div>

          {/* ── Pagination ────────────────────────────────────── */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between pt-2">
              <p className="text-body-sm text-text-muted">
                Menampilkan {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, totalItems)}{' '}
                dari {totalItems} file
              </p>
              <Pagination page={page} totalPages={totalPages} onPageChange={handlePageChange} />
            </div>
          )}
        </>
      )}

      {/* ── Single Delete Confirmation ────────────────────────── */}
      <ConfirmDialog
        open={!!deleteTarget}
        onCancel={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Hapus File"
        confirmLabel={deleting ? 'Menghapus...' : 'Hapus'}
        confirmVariant="danger"
        loading={deleting}
      >
        {deleteTarget && (
          <p>
            Yakin ingin menghapus "<strong>{deleteTarget.filename}</strong>"? Tindakan ini tidak
            dapat dibatalkan.
          </p>
        )}
      </ConfirmDialog>

      {/* ── Bulk Delete Confirmation ──────────────────────────── */}
      <ConfirmDialog
        open={showBulkConfirm}
        onCancel={() => setShowBulkConfirm(false)}
        onConfirm={handleBulkDelete}
        title={`Hapus ${selectedIds.size} File`}
        confirmLabel={bulkDeleting ? 'Menghapus...' : 'Hapus Semua'}
        confirmVariant="danger"
        loading={bulkDeleting}
      >
        <p>
          Yakin ingin menghapus <strong>{selectedIds.size} file</strong> yang dipilih? Tindakan ini
          tidak dapat dibatalkan.
        </p>
      </ConfirmDialog>
    </div>
  );
}
