import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { createBrowserClient } from '@ahlipanggilan/shared';
import { Button, Card, EmptyState, Spinner } from '@ahlipanggilan/ui';

// ── Types ─────────────────────────────────────────────────────────

interface DocumentItem {
  id: string;
  type: 'KTP' | 'Certificate' | 'SIM' | 'Photo' | 'Other';
  mediaId: string | null;
  fileName: string;
  status: 'Pending' | 'Verified';
  verifiedAt: string | null;
  createdAt: string;
}

const ACCEPTED_TYPES = ['KTP', 'Certificate', 'SIM', 'Photo', 'Other'] as const;
const ACCEPTED_MIME = 'image/jpeg,image/png,image/webp,application/pdf';

const TYPE_LABEL: Record<string, string> = {
  KTP: 'KTP',
  Certificate: 'Sertifikat',
  SIM: 'SIM',
  Photo: 'Foto Profil',
  Other: 'Lainnya',
};

const TYPE_ICON: Record<string, string> = {
  KTP: '\u{1FAAB}',
  Certificate: '\u{1F4DC}',
  SIM: '\u{1FAAA}',
  Photo: '\u{1F4F7}',
  Other: '\u{1F4C4}',
};

// ── Component ─────────────────────────────────────────────────────

export function PartnerDocuments() {
  const api = useMemo(() => createBrowserClient(), []);
  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [dragOver, setDragOver] = useState(false);
  const [documentType, setDocumentType] = useState<string>('KTP');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const errorTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const successTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ── Auto-dismiss notifications ────────────────────────────────

  useEffect(() => {
    if (error) {
      if (errorTimerRef.current) clearTimeout(errorTimerRef.current);
      errorTimerRef.current = setTimeout(() => setError(''), 5000);
    }
    return () => {
      if (errorTimerRef.current) clearTimeout(errorTimerRef.current);
    };
  }, [error]);

  useEffect(() => {
    if (success) {
      if (successTimerRef.current) clearTimeout(successTimerRef.current);
      successTimerRef.current = setTimeout(() => setSuccess(''), 4000);
    }
    return () => {
      if (successTimerRef.current) clearTimeout(successTimerRef.current);
    };
  }, [success]);

  // ── Load documents ─────────────────────────────────────────────

  const loadData = useCallback(async () => {
    try {
      const result = await api.get<DocumentItem[]>('/api/v1/partners/me/documents');
      setDocuments(Array.isArray(result) ? result : []);
    } catch {
      setError('Gagal memuat dokumen');
    } finally {
      setLoading(false);
    }
  }, [api]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // ── Upload file ────────────────────────────────────────────────

  const uploadFile = useCallback(
    async (file: File) => {
      // Validate file type
      const allowedMime = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];
      if (!allowedMime.includes(file.type)) {
        setError('Tipe file tidak didukung. Gunakan JPG, PNG, WEBP, atau PDF.');
        return;
      }

      setUploading(true);
      setError('');
      setSuccess('');

      try {
        // 1. Upload to media
        const formData = new FormData();
        formData.append('file', file);
        const result = await api.post<Record<string, unknown>>('/api/v1/media/upload', {
          formData,
        });
        const data = result as { url?: string; id?: string };
        const mediaId = data?.id;
        if (!mediaId) throw new Error('Gagal mendapatkan ID media');

        // 2. Register document
        await api.post('/api/v1/partners/me/documents', {
          body: {
            type: documentType,
            mediaId,
            fileName: file.name,
          },
        });

        setSuccess(`Dokumen "${file.name}" berhasil diupload`);
        await loadData();
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Gagal mengupload dokumen. Coba lagi.');
      } finally {
        setUploading(false);
      }
    },
    [api, documentType, loadData],
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
    async (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setDragOver(false);

      const files = Array.from(e.dataTransfer.files);
      if (files.length === 0) return;
      await uploadFile(files[0]!);
    },
    [uploadFile],
  );

  const handleFileSelect = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = Array.from(e.target.files ?? []);
      if (files.length === 0) return;
      await uploadFile(files[0]!);
      e.target.value = '';
    },
    [uploadFile],
  );

  // ── Delete ─────────────────────────────────────────────────────

  async function handleDelete(id: string) {
    setDeleting(true);
    try {
      await api.delete(`/api/v1/partners/me/documents/${id}`);
      setDeleteConfirm(null);
      setSuccess('Dokumen berhasil dihapus');
      await loadData();
    } catch {
      setError('Gagal menghapus dokumen');
    } finally {
      setDeleting(false);
    }
  }

  // ── Helpers ────────────────────────────────────────────────────

  function getMediaUrl(doc: DocumentItem): string {
    if (doc.mediaId && doc.type === 'Photo') {
      return `/api/v1/media/${doc.mediaId}/file`;
    }
    return '';
  }

  function formatDate(dateStr: string): string {
    return new Date(dateStr).toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  }

  function getFileExtension(filename: string): string {
    const ext = filename.split('.').pop();
    return ext ? ext.toUpperCase() : '';
  }

  // ── Render ─────────────────────────────────────────────────────

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Spinner />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Notifications */}
      {error && (
        <div className="rounded-lg border border-danger-200 bg-danger-50 px-4 py-3 text-sm text-danger-700">
          {error}
          <button
            type="button"
            onClick={() => setError('')}
            className="ml-2 underline hover:no-underline"
          >
            Tutup
          </button>
        </div>
      )}
      {success && (
        <div className="rounded-lg border border-success-200 bg-success-50 px-4 py-3 text-sm text-success-700">
          {success}
          <button
            type="button"
            onClick={() => setSuccess('')}
            className="ml-2 underline hover:no-underline"
          >
            Tutup
          </button>
        </div>
      )}

      {/* ── Upload Section ──────────────────────────────────────── */}
      <Card padding="lg">
        <h3 className="mb-4 text-sm font-semibold text-text-primary">Upload Dokumen Baru</h3>

        {/* Type Selector */}
        <div className="mb-4">
          <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-text-muted">
            Tipe Dokumen
          </label>
          <div className="flex flex-wrap gap-2">
            {ACCEPTED_TYPES.map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setDocumentType(t)}
                className={`rounded-lg px-3.5 py-2 text-xs font-medium transition-all ${
                  documentType === t
                    ? 'bg-primary-100 text-primary-700 ring-1 ring-primary-300'
                    : 'bg-neutral-100 text-text-muted hover:bg-neutral-200 hover:text-text-primary'
                }`}
              >
                {TYPE_ICON[t]} {TYPE_LABEL[t]}
              </button>
            ))}
          </div>
        </div>

        {/* Drop Zone */}
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed px-6 py-10 text-center transition-all ${
            dragOver
              ? 'border-primary bg-primary/5'
              : 'border-border-default bg-bg-page hover:border-primary/50 hover:bg-primary/[0.03]'
          }`}
          role="button"
          tabIndex={0}
          aria-label="Upload dokumen"
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              fileInputRef.current?.click();
            }
          }}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept={ACCEPTED_MIME}
            className="hidden"
            onChange={handleFileSelect}
          />

          {uploading ? (
            <>
              <div className="h-10 w-10 animate-spin rounded-full border-[3px] border-primary border-t-transparent" />
              <p className="text-sm font-medium text-primary">Mengupload...</p>
              <p className="text-xs text-text-muted">Tunggu hingga selesai</p>
            </>
          ) : (
            <>
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary-50 text-primary-600">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                  <polyline points="17 8 12 3 7 8" />
                  <line x1="12" y1="3" x2="12" y2="15" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-medium text-text-primary">
                  {dragOver ? 'Lepaskan file untuk mengupload' : 'Drag & drop file di sini'}
                </p>
                <p className="mt-0.5 text-xs text-text-muted">
                  atau klik untuk memilih file (JPG, PNG, WEBP, PDF)
                </p>
              </div>
            </>
          )}
        </div>
      </Card>

      {/* ── Documents List ──────────────────────────────────────── */}
      <Card padding="lg">
        <h3 className="mb-4 text-sm font-semibold text-text-primary">
          Dokumen Saya ({documents.length})
        </h3>

        {documents.length === 0 ? (
          <EmptyState
            title="Belum ada dokumen"
            description="Upload dokumen yang diperlukan seperti KTP, foto profil, atau sertifikat keahlian"
          />
        ) : (
          <div className="space-y-2">
            {documents.map((doc) => {
              const imageUrl = getMediaUrl(doc);
              return (
                <div
                  key={doc.id}
                  className="flex items-center gap-4 rounded-lg border border-border-default bg-bg-page p-3 transition-colors hover:bg-neutral-50"
                >
                  {/* Type Icon / Thumbnail */}
                  {imageUrl ? (
                    <div className="h-12 w-12 shrink-0 overflow-hidden rounded-lg border border-border-default bg-neutral-100">
                      <img
                        src={imageUrl}
                        alt={doc.fileName}
                        className="h-full w-full object-cover"
                        loading="lazy"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = 'none';
                        }}
                      />
                    </div>
                  ) : (
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg border border-border-default bg-neutral-100 text-lg">
                      {TYPE_ICON[doc.type] ?? '\u{1F4C4}'}
                    </div>
                  )}

                  {/* Info */}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold uppercase tracking-wide text-text-muted">
                        {TYPE_LABEL[doc.type] ?? doc.type}
                      </span>
                      <span
                        className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${
                          doc.status === 'Verified'
                            ? 'bg-success-50 text-success-700'
                            : 'bg-warning-50 text-warning-700'
                        }`}
                      >
                        {doc.status === 'Verified' ? 'Terverifikasi' : 'Menunggu'}
                      </span>
                    </div>
                    <p className="mt-0.5 truncate text-sm font-medium text-text-primary">
                      {doc.fileName}
                    </p>
                    <p className="text-xs text-text-muted">
                      {getFileExtension(doc.fileName)} &middot; {formatDate(doc.createdAt)}
                      {doc.verifiedAt && ` \u00b7 Verifikasi: ${formatDate(doc.verifiedAt)}`}
                    </p>
                  </div>

                  {/* Actions */}
                  <div className="shrink-0">
                    {deleteConfirm === doc.id ? (
                      <div className="flex items-center gap-1">
                        <Button
                          size="sm"
                          variant="danger"
                          disabled={deleting}
                          onClick={() => handleDelete(doc.id)}
                        >
                          {deleting ? '...' : 'Yakin?'}
                        </Button>
                        <Button size="sm" variant="ghost" onClick={() => setDeleteConfirm(null)}>
                          Batal
                        </Button>
                      </div>
                    ) : (
                      <Button size="sm" variant="danger" onClick={() => setDeleteConfirm(doc.id)}>
                        Hapus
                      </Button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Card>
    </div>
  );
}
