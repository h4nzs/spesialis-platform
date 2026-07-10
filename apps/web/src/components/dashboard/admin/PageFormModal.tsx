import { useState, useEffect, useCallback, useMemo } from 'react';
import { createBrowserClient } from '@specialist/shared';
import { Button, Input, Select, Modal, RichTextEditor, SEOEditor } from '@specialist/ui';
import type { SeoData } from '@specialist/ui';

// ── Types ────────────────────────────────────────────────────────

export interface PageFormData {
  title: string;
  slug: string;
  content: string;
  status: string;
  meta: Record<string, unknown>;
  seo: SeoData;
}

export interface PageFormModalProps {
  open: boolean;
  onClose: () => void;
  editingId: string | null;
  onSaved: () => void;
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

export default function PageFormModal({ open, onClose, editingId, onSaved }: PageFormModalProps) {
  const api = useMemo(() => createBrowserClient(), []);
  const [form, setForm] = useState<PageFormData>(EMPTY_FORM);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Reset form when modal opens or editingId changes
  useEffect(() => {
    if (!open) return;

    if (editingId) {
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
        });
    } else {
      setForm(EMPTY_FORM);
      setError('');
    }
  }, [open, editingId, api]);

  // ── SEO handler ────────────────────────────────────────────────
  const handleSeoChange = useCallback((seo: SeoData) => {
    setForm((f) => ({ ...f, seo }));
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
      onClose();
      onSaved();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gagal menyimpan halaman');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Modal open={open} onClose={onClose} title={editingId ? 'Edit Halaman' : 'Tambah Halaman'}>
      <form onSubmit={handleSave} className="space-y-4">
        {error && <p className="text-sm text-danger-500">{error}</p>}

        {/* ── Basic Info ────────────────────────────────────── */}
        <div className="grid grid-cols-2 gap-3">
          <Input
            label="Judul"
            value={form.title}
            onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
            placeholder="cth: Tentang Kami"
            required
          />
          <Input
            label="Slug"
            value={form.slug}
            onChange={(e) => setForm((f) => ({ ...f, slug: e.target.value }))}
            placeholder="tentang-kami"
            required
          />
        </div>

        <Select
          label="Status"
          value={form.status}
          onChange={(e) => setForm((f) => ({ ...f, status: e.target.value }))}
          options={STATUS_OPTIONS}
        />

        {/* ── Content (RichTextEditor) ──────────────────────── */}
        <RichTextEditor
          label="Konten"
          value={form.content}
          onChange={(html) => setForm((f) => ({ ...f, content: html }))}
          placeholder="Tulis konten halaman di sini..."
        />

        {/* ── SEO ───────────────────────────────────────────── */}
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
          collapsed
        />

        {/* ── Actions ───────────────────────────────────────── */}
        <div className="flex justify-end gap-2 border-t border-border-default pt-4">
          <Button variant="ghost" type="button" onClick={onClose}>
            Batal
          </Button>
          <Button type="submit" disabled={submitting}>
            {submitting ? 'Menyimpan...' : editingId ? 'Simpan' : 'Buat'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
