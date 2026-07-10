import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { createBrowserClient } from '@specialist/shared';
import {
  Button,
  Input,
  Select,
  Card,
  RichTextEditor,
  MediaBrowser,
  TagsInput,
  SEOEditor,
  SeoAnalyzerPanel,
  SchemaBuilder,
} from '@specialist/ui';
import type { SeoData } from '@specialist/ui';
import { renderMarkdown } from '../../../lib/markdown.ts';

// ── Types ────────────────────────────────────────────────────────

interface ArticleFormData {
  categoryId: string;
  title: string;
  slug: string;
  summary: string;
  content: string;
  coverImage: string;
  authorName: string;
  status: string;
  isFeatured: boolean;
  tags: string[];
  metaTitle: string;
  metaDescription: string;
  ogTitle: string;
  ogDescription: string;
  ogImage: string;
  canonicalUrl: string;
  robots: string;
  schemaJson: Record<string, unknown> | null;
}

interface CategoryItem {
  id: string;
  name: string;
  slug: string;
}

interface ArticleEditorProps {
  editingId?: string;
}

// ── Constants ────────────────────────────────────────────────────

const EMPTY_FORM: ArticleFormData = {
  categoryId: '',
  title: '',
  slug: '',
  summary: '',
  content: '',
  coverImage: '',
  authorName: '',
  status: 'Draft',
  isFeatured: false,
  tags: [],
  metaTitle: '',
  metaDescription: '',
  ogTitle: '',
  ogDescription: '',
  ogImage: '',
  canonicalUrl: '',
  robots: 'index, follow',
  schemaJson: null,
};

const STATUS_OPTIONS = [
  { value: 'Draft', label: 'Draft' },
  { value: 'Review', label: 'Review' },
  { value: 'Published', label: 'Published' },
  { value: 'Archived', label: 'Archived' },
];

// ── Component ────────────────────────────────────────────────────

export function ArticleEditor({ editingId }: ArticleEditorProps) {
  const api = useMemo(() => createBrowserClient(), []);
  const [form, setForm] = useState<ArticleFormData>(EMPTY_FORM);
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [coverUploading, setCoverUploading] = useState(false);
  const [coverDragOver, setCoverDragOver] = useState(false);
  const coverInputRef = useRef<HTMLInputElement>(null);

  // MediaBrowser state
  const [showMediaBrowser, setShowMediaBrowser] = useState(false);
  const [mediaBrowserMode, setMediaBrowserMode] = useState<'content' | 'cover' | 'og'>('content');
  const insertImageRef = useRef<((url: string) => void) | null>(null);

  // Navigate back to article list
  function goBack() {
    window.location.href = '/dashboard/admin/articles';
  }

  // Upload a file to the media API and return the URL
  const uploadToMedia = useCallback(
    async (file: File): Promise<string> => {
      const formData = new FormData();
      formData.append('file', file);
      const result = await api.post<{ url: string; id: string }>('/api/v1/media/upload', {
        formData,
      });
      const data = result as unknown as { url?: string; id?: string };
      // The API returns a relative path like /api/v1/media/:id/file
      return data?.url ?? `/api/v1/media/${data?.id}/file`;
    },
    [api],
  );

  // Handle file drops for cover image
  const handleCoverDrop = useCallback(
    async (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setCoverDragOver(false);

      const files = Array.from(e.dataTransfer.files);
      if (files.length === 0) return;
      const file = files[0];

      if (!file.type.startsWith('image/')) return;

      setCoverUploading(true);
      try {
        const url = await uploadToMedia(file);
        setForm((f) => ({ ...f, coverImage: url }));
      } catch {
        setError('Gagal mengupload gambar sampul');
      } finally {
        setCoverUploading(false);
      }
    },
    [uploadToMedia],
  );

  const handleCoverDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setCoverDragOver(true);
  }, []);

  const handleCoverDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setCoverDragOver(false);
  }, []);

  // Handle file select via input
  const handleCoverFileSelect = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = Array.from(e.target.files ?? []);
      if (files.length === 0) return;
      const file = files[0];
      if (!file.type.startsWith('image/')) return;

      setCoverUploading(true);
      try {
        const url = await uploadToMedia(file);
        setForm((f) => ({ ...f, coverImage: url }));
      } catch {
        setError('Gagal mengupload gambar sampul');
      } finally {
        setCoverUploading(false);
      }
      e.target.value = '';
    },
    [uploadToMedia],
  );

  // Load categories & article detail
  useEffect(() => {
    async function init() {
      try {
        const cats = await api.get<{ data: CategoryItem[] }>('/api/v1/admin/articles/categories');
        setCategories(Array.isArray(cats) ? cats : (cats?.data ?? []));

        if (editingId) {
          const detail = await api.get<Record<string, unknown>>(
            `/api/v1/admin/articles/${editingId}`,
          );
          const d = detail as unknown as Record<string, unknown>;
          // Convert Markdown → HTML so TipTap renders headings/lists correctly
          const rawContent = (d.content as string) ?? '';
          const contentForEditor = rawContent
            ? rawContent.trim().startsWith('<')
              ? rawContent
              : renderMarkdown(rawContent)
            : '';
          setForm({
            categoryId: (d.categoryId as string) ?? '',
            title: (d.title as string) ?? '',
            slug: (d.slug as string) ?? '',
            summary: (d.summary as string) ?? '',
            content: contentForEditor,
            coverImage: (d.coverImage as string) ?? '',
            authorName: (d.authorName as string) ?? '',
            status: (d.status as string) ?? 'Draft',
            isFeatured: (d.isFeatured as boolean) ?? false,
            tags: Array.isArray(d.tags) ? (d.tags as string[]) : [],
            metaTitle: (d.metaTitle as string) ?? '',
            metaDescription: (d.metaDescription as string) ?? '',
            ogTitle: (d.ogTitle as string) ?? '',
            ogDescription: (d.ogDescription as string) ?? '',
            ogImage: (d.ogImage as string) ?? '',
            canonicalUrl: (d.canonicalUrl as string) ?? '',
            robots: (d.robots as string) ?? 'index, follow',
            schemaJson: (d.schemaJson as Record<string, unknown>) ?? null,
          });
        }
      } catch {
        setError('Gagal memuat data');
      } finally {
        setLoading(false);
      }
    }
    init();
  }, [editingId, api]);

  // ── MediaBrowser handlers ──────────────────────────────────────
  const openMediaForContent = useCallback((insertImage: (url: string) => void) => {
    insertImageRef.current = insertImage;
    setMediaBrowserMode('content');
    setShowMediaBrowser(true);
  }, []);

  const openMediaForCover = useCallback(() => {
    insertImageRef.current = null;
    setMediaBrowserMode('cover');
    setShowMediaBrowser(true);
  }, []);

  const handleMediaSelect = useCallback(
    (url: string) => {
      if (mediaBrowserMode === 'content' && insertImageRef.current) {
        insertImageRef.current(url);
        insertImageRef.current = null;
      } else if (mediaBrowserMode === 'cover') {
        setForm((f) => ({ ...f, coverImage: url }));
      } else if (mediaBrowserMode === 'og') {
        setForm((f) => ({ ...f, ogImage: url }));
      }
    },
    [mediaBrowserMode],
  );

  // ── SEO handler ────────────────────────────────────────────────
  const handleSeoChange = useCallback((seo: SeoData) => {
    setForm((f) => ({
      ...f,
      metaTitle: seo.metaTitle,
      metaDescription: seo.metaDescription,
      ogTitle: seo.ogTitle,
      ogDescription: seo.ogDescription,
      ogImage: seo.ogImage,
      canonicalUrl: seo.canonicalUrl,
      robots: seo.robots,
    }));
  }, []);

  // ── SEO image upload handler ───────────────────────────────────
  const handleSeoImageUpload = useCallback((insertImage: (url: string) => void) => {
    insertImageRef.current = insertImage;
    setMediaBrowserMode('og');
    setShowMediaBrowser(true);
  }, []);

  // ── Schema handler ─────────────────────────────────────────────
  const handleSchemaChange = useCallback((schema: Record<string, unknown> | null) => {
    setForm((f) => ({ ...f, schemaJson: schema }));
  }, []);

  // ── Submit handler ─────────────────────────────────────────────
  async function handleSave(e: React.SyntheticEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!form.title || !form.slug) {
      setError('Judul dan slug wajib diisi');
      return;
    }
    setSubmitting(true);
    setError('');
    try {
      const body = {
        categoryId: form.categoryId || undefined,
        title: form.title,
        slug: form.slug,
        summary: form.summary || undefined,
        content: form.content || undefined,
        coverImage: form.coverImage || undefined,
        authorName: form.authorName || undefined,
        status: form.status,
        isFeatured: form.isFeatured,
        tags: form.tags,
        metaTitle: form.metaTitle || undefined,
        metaDescription: form.metaDescription || undefined,
        ogTitle: form.ogTitle || undefined,
        ogDescription: form.ogDescription || undefined,
        ogImage: form.ogImage || undefined,
        canonicalUrl: form.canonicalUrl || undefined,
        robots: form.robots || undefined,
        schemaJson: form.schemaJson,
      };

      if (editingId) {
        await api.patch(`/api/v1/admin/articles/${editingId}`, { body });
      } else {
        await api.post('/api/v1/admin/articles', { body });
      }
      goBack();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gagal menyimpan artikel');
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div
          className="h-8 w-8 animate-spin rounded-full border-2 border-primary-500 border-t-transparent"
          role="status"
          aria-label="Memuat…"
        />
      </div>
    );
  }

  return (
    <>
      {/* ── MediaBrowser ─────────────────────────────────────── */}
      <MediaBrowser
        open={showMediaBrowser}
        onClose={() => {
          setShowMediaBrowser(false);
          insertImageRef.current = null;
        }}
        onSelect={handleMediaSelect}
      />

      {/* ── Back button ─────────────────────────────────────── */}
      <div className="mb-6">
        <button
          type="button"
          onClick={goBack}
          className="flex items-center gap-1 text-sm text-text-muted hover:text-text-primary transition-colors"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M19 12H5" />
            <path d="M12 19l-7-7 7-7" />
          </svg>
          Kembali ke daftar artikel
        </button>
      </div>

      {error && (
        <div className="mb-6 rounded-lg border border-danger-200 bg-danger-50 px-4 py-3 text-sm text-danger-700">
          {error}
        </div>
      )}

      <form onSubmit={handleSave}>
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_360px]">
          {/* ── Left Column: Main Content ──────────────────────── */}
          <div className="space-y-6">
            <Card>
              <div className="space-y-4">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <Input
                    label="Judul"
                    value={form.title}
                    onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                    required
                  />
                  <Input
                    label="Slug"
                    value={form.slug}
                    onChange={(e) => setForm((f) => ({ ...f, slug: e.target.value }))}
                    placeholder="judul-artikel"
                    required
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-text-primary">Ringkasan</label>
                  <textarea
                    value={form.summary}
                    onChange={(e) => setForm((f) => ({ ...f, summary: e.target.value }))}
                    rows={2}
                    maxLength={500}
                    className="mt-1 w-full rounded-md border border-border-default bg-bg-surface px-3 py-2 text-sm text-text-primary outline-none transition-colors focus:border-primary focus:ring-1 focus:ring-primary"
                    placeholder="Ringkasan singkat artikel (max 500 karakter)"
                  />
                </div>
              </div>
            </Card>

            <Card>
              <RichTextEditor
                label="Konten"
                value={form.content}
                onChange={(html) => setForm((f) => ({ ...f, content: html }))}
                placeholder="Tulis konten artikel di sini..."
                onImageUpload={openMediaForContent}
                error={undefined}
              />

              {/* ── Live Preview ─────────────────────────────── */}
              {form.content && (
                <details className="mt-4 group">
                  <summary className="cursor-pointer text-sm font-medium text-text-muted hover:text-text-primary transition-colors select-none">
                    <span className="group-open:hidden">Tampilkan preview</span>
                    <span className="hidden group-open:inline">Sembunyikan preview</span>
                  </summary>
                  <div className="mt-3 rounded-lg border border-border-default bg-white p-4">
                    <div
                      className="prose prose-sm max-w-none"
                      dangerouslySetInnerHTML={{ __html: form.content }}
                    />
                  </div>
                </details>
              )}
            </Card>
          </div>

          {/* ── Right Sidebar: Meta & Settings ─────────────────── */}
          <div className="space-y-6">
            <Card>
              <h3 className="mb-4 text-sm font-semibold text-text-primary">Pengaturan</h3>
              <div className="space-y-4">
                <Select
                  label="Kategori"
                  value={form.categoryId}
                  onChange={(e) => setForm((f) => ({ ...f, categoryId: e.target.value }))}
                  options={categories.map((c) => ({ value: c.id, label: c.name }))}
                  placeholder="Pilih kategori"
                />
                <Select
                  label="Status"
                  value={form.status}
                  onChange={(e) => setForm((f) => ({ ...f, status: e.target.value }))}
                  options={STATUS_OPTIONS}
                />
                <Input
                  label="Nama Penulis"
                  value={form.authorName}
                  onChange={(e) => setForm((f) => ({ ...f, authorName: e.target.value }))}
                />
                <label className="flex items-center gap-2 text-sm font-medium text-text-primary">
                  <input
                    type="checkbox"
                    checked={form.isFeatured}
                    onChange={(e) => setForm((f) => ({ ...f, isFeatured: e.target.checked }))}
                    className="rounded border-border-default"
                  />
                  Featured
                </label>
              </div>
            </Card>

            <Card>
              <h3 className="mb-4 text-sm font-semibold text-text-primary">Gambar Sampul</h3>
              <div className="space-y-3">
                {/* Drag & drop upload zone */}
                <div
                  onDragOver={handleCoverDragOver}
                  onDragLeave={handleCoverDragLeave}
                  onDrop={handleCoverDrop}
                  onClick={() => coverInputRef.current?.click()}
                  className={`flex cursor-pointer items-center justify-center gap-2 rounded-md border-2 border-dashed px-3 py-4 text-xs transition-colors ${
                    coverDragOver
                      ? 'border-primary bg-primary/5 text-primary'
                      : 'border-border-default bg-bg-surface text-text-muted hover:border-primary hover:text-primary'
                  }`}
                  role="button"
                  tabIndex={0}
                  aria-label="Upload gambar sampul — drag & drop or click"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      coverInputRef.current?.click();
                    }
                  }}
                >
                  {coverUploading ? (
                    <>
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                      Mengupload...
                    </>
                  ) : (
                    <>
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                        <polyline points="17 8 12 3 7 8" />
                        <line x1="12" y1="3" x2="12" y2="15" />
                      </svg>
                      {coverDragOver
                        ? 'Lepaskan file untuk mengupload'
                        : 'Drag & drop gambar atau klik untuk upload'}
                    </>
                  )}
                </div>
                <input
                  ref={coverInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  className="hidden"
                  onChange={handleCoverFileSelect}
                />

                {/* URL input + Pilih button */}
                <div className="flex gap-2">
                  <div className="flex-1">
                    <Input
                      value={form.coverImage}
                      onChange={(e) => setForm((f) => ({ ...f, coverImage: e.target.value }))}
                      placeholder="URL gambar"
                    />
                  </div>
                  <Button type="button" variant="secondary" onClick={openMediaForCover}>
                    Pilih
                  </Button>
                </div>
              </div>

              {/* Image preview */}
              {form.coverImage && (
                <div className="relative mt-3 aspect-video w-full overflow-hidden rounded-md border border-border-default bg-neutral-100">
                  <img
                    src={form.coverImage}
                    alt="Cover preview"
                    loading="lazy"
                    decoding="async"
                    className="h-full w-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = 'none';
                    }}
                  />
                </div>
              )}
            </Card>

            <Card>
              <TagsInput
                label="Tags"
                value={form.tags}
                onChange={(tags) => setForm((f) => ({ ...f, tags }))}
                placeholder="Ketik tag lalu tekan Enter..."
                maxTags={10}
                suggestions={[]}
              />
            </Card>

            <Card>
              <SEOEditor
                value={{
                  metaTitle: form.metaTitle,
                  metaDescription: form.metaDescription,
                  ogTitle: form.ogTitle,
                  ogDescription: form.ogDescription,
                  ogImage: form.ogImage,
                  canonicalUrl: form.canonicalUrl,
                  robots: form.robots,
                }}
                onChange={handleSeoChange}
                onImageUpload={handleSeoImageUpload}
              />
            </Card>

            <SchemaBuilder value={form.schemaJson} onChange={handleSchemaChange} />

            <SeoAnalyzerPanel
              contentHtml={form.content}
              title={form.title}
              slug={form.slug}
              metaTitle={form.metaTitle}
              metaDescription={form.metaDescription}
              url={`/blog/${form.slug}`}
            />
          </div>
        </div>

        {/* ── Actions ──────────────────────────────────────────── */}
        <div className="mt-6 flex justify-end gap-3 border-t border-border-default pt-6">
          <Button variant="ghost" type="button" onClick={goBack}>
            Batal
          </Button>
          <Button type="submit" disabled={submitting}>
            {submitting ? 'Menyimpan...' : editingId ? 'Simpan Perubahan' : 'Terbitkan Artikel'}
          </Button>
        </div>
      </form>
    </>
  );
}
