import { useState, useEffect, useCallback, useMemo, lazy, Suspense } from 'react';
import { createBrowserClient, parseApiError } from '@ahlipanggilan/shared';
import { Button, Input, Select, Card, SEOEditor, SeoAnalyzerPanel } from '@ahlipanggilan/ui';
// Eagerly start downloading the editor chunk at module evaluation time
void import('../../../lib/editor-lazy.ts').catch(() => {
  // Preload only — actual import for rendering is handled by React.lazy below
});

const RichTextEditor = lazy(() =>
  import('../../../lib/editor-lazy.ts').then((m) => ({ default: m.RichTextEditor })),
);
import type { SeoData } from '@ahlipanggilan/ui';

// ── Types ────────────────────────────────────────────────────────

interface PageFormData {
  title: string;
  slug: string;
  content: string;
  status: string;
  meta: Record<string, unknown>;
  seo: SeoData;
}

interface PageEditorProps {
  editingId?: string;
}

// ── Constants ────────────────────────────────────────────────────

const DEFAULT_SEO: SeoData = {
  metaTitle: '',
  metaDescription: '',
  ogTitle: '',
  ogDescription: '',
  ogImage: '',
  canonicalUrl: '',
  robots: 'index, follow',
};

const EMPTY_FORM: PageFormData = {
  title: '',
  slug: '',
  content: '',
  status: 'Published',
  meta: {},
  seo: { ...DEFAULT_SEO },
};

const STATUS_OPTIONS = [
  { value: 'Draft', label: 'Draft' },
  { value: 'Published', label: 'Published' },
  { value: 'Archived', label: 'Archived' },
];

// ── Helpers ──────────────────────────────────────────────────────

function extractSeoFromMeta(meta: Record<string, unknown> | null | undefined): SeoData {
  if (!meta || typeof meta !== 'object') return { ...DEFAULT_SEO };
  const seo = (meta as Record<string, unknown>).seo as Partial<SeoData> | undefined;
  if (!seo || typeof seo !== 'object') return { ...DEFAULT_SEO };
  return {
    metaTitle: typeof seo.metaTitle === 'string' ? seo.metaTitle : '',
    metaDescription: typeof seo.metaDescription === 'string' ? seo.metaDescription : '',
    ogTitle: typeof seo.ogTitle === 'string' ? seo.ogTitle : '',
    ogDescription: typeof seo.ogDescription === 'string' ? seo.ogDescription : '',
    ogImage: typeof seo.ogImage === 'string' ? seo.ogImage : '',
    canonicalUrl: typeof seo.canonicalUrl === 'string' ? seo.canonicalUrl : '',
    robots: typeof seo.robots === 'string' ? seo.robots : 'index, follow',
  };
}

function packMetaWithSeo(meta: Record<string, unknown>, seo: SeoData): Record<string, unknown> {
  const hasSeoData = Object.values(seo).some((v) => v !== '' && v !== 'index, follow');
  return {
    ...meta,
    ...(hasSeoData ? { seo } : {}),
  };
}

interface DetailResponse {
  title: string;
  slug: string;
  content: string;
  status: string;
  meta: Record<string, unknown>;
}

// ── Component ────────────────────────────────────────────────────

export function PageEditor({ editingId }: PageEditorProps) {
  const api = useMemo(() => createBrowserClient(), []);
  const [form, setForm] = useState<PageFormData>(EMPTY_FORM);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);

  // Navigate back to page list
  function goBack() {
    window.location.href = '/dashboard/admin/cms-pages';
  }

  // Load page detail if editing
  useEffect(() => {
    if (!editingId) {
      setLoading(false);
      return;
    }

    setError('');
    api
      .get<DetailResponse>(`/api/v1/admin/cms-pages/${editingId}`)
      .then((detail) => {
        const d = detail as unknown as DetailResponse;
        const meta = d.meta ?? {};
        setForm({
          title: d.title ?? '',
          slug: d.slug ?? '',
          content: d.content ?? '',
          status: d.status ?? 'Published',
          meta,
          seo: extractSeoFromMeta(meta),
        });
      })
      .catch(() => {
        setError('Gagal memuat detail halaman');
      })
      .finally(() => setLoading(false));
  }, [editingId, api]);

  // ── SEO handler ────────────────────────────────────────────────
  const handleSeoChange = useCallback((seo: SeoData) => {
    setForm((f) => ({ ...f, seo }));
  }, []);

  // ── SEO image upload handler ────────────────────────────────────
  const handleSeoImageUpload = useCallback(
    (insertImage: (url: string) => void) => {
      // Create a temporary file input and trigger it
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = 'image/jpeg,image/png,image/webp';
      input.onchange = async (e) => {
        const file = (e.target as HTMLInputElement).files?.[0];
        if (!file) return;
        try {
          const formData = new FormData();
          formData.append('file', file);
          const result = await api.post<{ url: string }>('/api/v1/media/upload', { formData });
          const data = result as unknown as { url?: string; id?: string };
          const url = data?.url ?? `/api/v1/media/${data?.id}/file`;
          insertImage(url);
        } catch {
          setError('Gagal mengupload gambar');
        }
      };
      input.click();
    },
    [api],
  );

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
      const meta = packMetaWithSeo(form.meta, form.seo);
      const body = {
        title: form.title,
        slug: form.slug,
        content: form.content || undefined,
        meta: Object.keys(meta).length > 0 ? meta : undefined,
        status: form.status,
      };

      if (editingId) {
        await api.patch(`/api/v1/admin/cms-pages/${editingId}`, { body });
      } else {
        await api.post('/api/v1/admin/cms-pages', { body });
      }
      goBack();
    } catch (err) {
      const { fieldErrors: fe, generalError } = parseApiError(err, 'Gagal menyimpan halaman');
      setFieldErrors(fe);
      setError(generalError);
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
          Kembali ke daftar halaman
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
                    placeholder="cth: Tentang Kami"
                    required
                    error={fieldErrors['title']}
                  />
                  <Input
                    label="Slug"
                    value={form.slug}
                    onChange={(e) => setForm((f) => ({ ...f, slug: e.target.value }))}
                    placeholder="tentang-kami"
                    required
                    error={fieldErrors['slug']}
                  />
                </div>
              </div>
            </Card>

            <Card>
              <Suspense
                fallback={
                  <div className="flex min-h-[300px] items-center justify-center rounded-md border border-border-default bg-bg-surface text-sm text-text-muted">
                    Memuat editor...
                  </div>
                }
              >
                <RichTextEditor
                  label="Konten"
                  value={form.content}
                  onChange={(html) => setForm((f) => ({ ...f, content: html }))}
                  placeholder="Tulis konten halaman di sini..."
                />
              </Suspense>

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

          {/* ── Right Sidebar: Settings & SEO ───────────────────── */}
          <div className="space-y-6">
            <Card>
              <h3 className="mb-4 text-sm font-semibold text-text-primary">Pengaturan</h3>
              <Select
                label="Status"
                value={form.status}
                onChange={(e) => setForm((f) => ({ ...f, status: e.target.value }))}
                options={STATUS_OPTIONS}
              />
            </Card>

            <Card>
              <SEOEditor
                value={{
                  metaTitle: form.seo.metaTitle,
                  metaDescription: form.seo.metaDescription,
                  ogTitle: form.seo.ogTitle,
                  ogDescription: form.seo.ogDescription,
                  ogImage: form.seo.ogImage,
                  canonicalUrl: form.seo.canonicalUrl,
                  robots: form.seo.robots,
                }}
                onChange={handleSeoChange}
                onImageUpload={handleSeoImageUpload}
              />
            </Card>

            <SeoAnalyzerPanel
              contentHtml={form.content}
              title={form.title}
              slug={form.slug}
              metaTitle={form.seo.metaTitle}
              metaDescription={form.seo.metaDescription}
              url={`/${form.slug}`}
            />
          </div>
        </div>

        {/* ── Actions ──────────────────────────────────────────── */}
        <div className="mt-6 flex justify-end gap-3 border-t border-border-default pt-6">
          <Button variant="ghost" type="button" onClick={goBack}>
            Batal
          </Button>
          <Button type="submit" disabled={submitting}>
            {submitting ? 'Menyimpan...' : editingId ? 'Simpan Perubahan' : 'Buat Halaman'}
          </Button>
        </div>
      </form>
    </>
  );
}
