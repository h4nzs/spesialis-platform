import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { createBrowserClient } from '@specialist/shared';
import { Modal } from './Modal.tsx';
import { cn } from '../utils/cn.ts';

// ── Types ────────────────────────────────────────────────────────

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

export interface MediaBrowserProps {
  /** Whether the browser is open */
  open: boolean;
  /** Called when the browser should close */
  onClose: () => void;
  /**
   * Called when the user selects an image.
   * Passes the media URL and the full media item for reference.
   */
  onSelect: (url: string, media: MediaItem) => void;
  /** Optional filter: only show images (default: true) */
  imagesOnly?: boolean;
  /** Optional: ID of the currently selected media (for highlighting) */
  selectedId?: string;
}

// ── Format helpers ───────────────────────────────────────────────

function formatFileSize(bytes: number): string {
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

// ── MediaBrowser Component ───────────────────────────────────────

export function MediaBrowser({
  open,
  onClose,
  onSelect,
  imagesOnly = true,
  selectedId,
}: MediaBrowserProps) {
  const api = useMemo(() => createBrowserClient(), []);
  const [items, setItems] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // ── Load media ─────────────────────────────────────────────────
  const loadMedia = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const result = await api.get<MediaItem[]>('/api/v1/media', {
        params: { limit: 100 },
      });
      const raw = Array.isArray(result) ? result : [];
      setItems(imagesOnly ? raw.filter((m) => isImage(m.mimeType)) : raw);
    } catch {
      setError('Gagal memuat media');
    } finally {
      setLoading(false);
    }
  }, [api, imagesOnly]);

  useEffect(() => {
    if (open) loadMedia();
  }, [open, loadMedia]);

  // ── Upload handler ─────────────────────────────────────────────
  const uploadFiles = useCallback(
    async (files: FileList | File[]) => {
      const fileList = Array.from(files);
      if (fileList.length === 0) return;

      setUploading(true);
      setError('');

      try {
        for (const file of fileList) {
          const formData = new FormData();
          formData.append('file', file);
          await api.post('/api/v1/media/upload', {
            formData,
          });
        }
        await loadMedia();
      } catch {
        setError('Gagal mengupload file');
      } finally {
        setUploading(false);
      }
    },
    [api, loadMedia],
  );

  // ── Drag & drop handlers ───────────────────────────────────────
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOver(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setDragOver(false);
      if (e.dataTransfer.files.length > 0) {
        uploadFiles(e.dataTransfer.files);
      }
    },
    [uploadFiles],
  );

  // ── Filter by search ───────────────────────────────────────────
  const filteredItems = search
    ? items.filter((m) => m.filename.toLowerCase().includes(search.toLowerCase()))
    : items;

  // ── Select handler ─────────────────────────────────────────────
  const handleSelect = useCallback(
    (item: MediaItem) => {
      onSelect(item.url, item);
      onClose();
    },
    [onSelect, onClose],
  );

  return (
    <Modal open={open} onClose={onClose} title="Pilih Media">
      <div className="flex flex-col gap-4">
        {/* Search + Upload area */}
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted"
            >
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
              type="text"
              placeholder="Cari file..."
              aria-label="Cari file"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-md border border-border-default bg-bg-surface py-2 pl-9 pr-3 text-sm text-text-primary outline-none transition-colors focus:border-primary focus:ring-1 focus:ring-primary"
            />
          </div>
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="inline-flex shrink-0 cursor-pointer items-center gap-1.5 rounded-md bg-primary px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-primary-hover disabled:opacity-50"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
            >
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="17 8 12 3 7 8" />
              <line x1="12" y1="3" x2="12" y2="15" />
            </svg>
            Upload
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            multiple
            className="hidden"
            onChange={(e) => {
              if (e.target.files) uploadFiles(e.target.files);
              e.target.value = '';
            }}
          />
        </div>

        {/* Drop zone indicator */}
        {dragOver && (
          <div
            className="flex items-center justify-center rounded-lg border-2 border-dashed border-primary bg-primary/5 py-8 text-sm font-medium text-primary"
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            Lepaskan file untuk mengupload
          </div>
        )}

        {/* Upload progress */}
        {uploading && (
          <div className="flex items-center gap-2 text-sm text-text-muted">
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            Mengupload...
          </div>
        )}

        {/* Error state */}
        {error && <p className="text-sm text-danger-500">{error}</p>}

        {/* Grid */}
        <div
          className="min-h-[200px]"
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          {loading ? (
            <div className="grid grid-cols-4 gap-3">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="aspect-square animate-pulse rounded-lg bg-neutral-200" />
              ))}
            </div>
          ) : filteredItems.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="text-3xl text-text-muted">🖼️</div>
              <p className="mt-2 text-sm text-text-muted">
                {search ? 'Tidak ada file yang cocok' : 'Belum ada media'}
              </p>
              {!search && (
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="mt-3 text-sm font-medium text-primary hover:text-primary-hover"
                >
                  Upload file pertama
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-4 gap-3">
              {filteredItems.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => handleSelect(item)}
                  className={cn(
                    'group relative flex cursor-pointer flex-col overflow-hidden rounded-lg border bg-bg-surface text-left transition-all hover:shadow-sm',
                    selectedId === item.id
                      ? 'border-primary ring-1 ring-primary'
                      : 'border-border-default hover:border-primary/50',
                  )}
                >
                  {/* Thumbnail */}
                  <div className="aspect-square overflow-hidden bg-neutral-100">
                    {isImage(item.mimeType) ? (
                      <img
                        src={item.url}
                        alt={item.filename}
                        loading="lazy"
                        decoding="async"
                        width="200"
                        height="200"
                        className="h-full w-full object-cover transition-transform group-hover:scale-105"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center text-2xl text-text-muted">
                        📄
                      </div>
                    )}
                  </div>

                  {/* Info overlay on hover */}
                  <div className="absolute inset-0 flex flex-col justify-end bg-gradient-to-t from-black/60 via-transparent to-transparent p-2 opacity-0 transition-opacity group-hover:opacity-100">
                    <p className="truncate text-xs font-medium text-white">{item.filename}</p>
                    <p className="text-[10px] text-white/80">
                      {item.width && item.height ? `${item.width}×${item.height} · ` : ''}
                      {formatFileSize(item.size)}
                    </p>
                  </div>

                  {/* Filename below thumbnail */}
                  <div className="px-2 py-1.5">
                    <p className="truncate text-xs text-text-muted">{item.filename}</p>
                    <p className="text-[10px] text-text-muted/70">{formatDate(item.createdAt)}</p>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Footer info */}
        <div className="flex items-center justify-between text-xs text-text-muted">
          <span>{filteredItems.length} file</span>
          <span>Klik untuk memilih</span>
        </div>
      </div>
    </Modal>
  );
}
