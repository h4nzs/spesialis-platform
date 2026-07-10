import { useState, useEffect, useMemo } from 'react';
import { createBrowserClient } from '@specialist/shared';
import { Button, Input, Select, Modal, Switch } from '@specialist/ui';

// ── Types ────────────────────────────────────────────────────────

export interface SectionFormData {
  sectionType: string;
  title: string;
  content: string;
  imageMediaId: string;
  isActive: boolean;
}

export interface HomepageSectionFormModalProps {
  open: boolean;
  onClose: () => void;
  editingId: string | null;
  onSaved: () => void;
}

// ── Constants ────────────────────────────────────────────────────

const SECTION_TYPE_OPTIONS = [
  { value: 'hero', label: 'Hero' },
  { value: 'services', label: 'Services' },
  { value: 'why-us', label: 'Why Us' },
  { value: 'stats', label: 'Statistics' },
  { value: 'testimonials', label: 'Testimonials' },
  { value: 'cta', label: 'CTA' },
  { value: 'faq', label: 'FAQ' },
];

const EMPTY_FORM: SectionFormData = {
  sectionType: 'hero',
  title: '',
  content: '',
  imageMediaId: '',
  isActive: true,
};

interface DetailResponse {
  sectionType: string;
  title: string | null;
  content: string | null;
  imageMediaId: string | null;
  isActive: boolean;
}

// ── Component ────────────────────────────────────────────────────

export default function HomepageSectionFormModal({
  open,
  onClose,
  editingId,
  onSaved,
}: HomepageSectionFormModalProps) {
  const api = useMemo(() => createBrowserClient(), []);
  const [form, setForm] = useState<SectionFormData>(EMPTY_FORM);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Reset form when modal opens or editingId changes
  useEffect(() => {
    if (!open) return;

    if (editingId) {
      setError('');
      api
        .get<DetailResponse>(`/api/v1/admin/homepage-sections/${editingId}`)
        .then((detail) => {
          const d = detail as unknown as DetailResponse;
          setForm({
            sectionType: d.sectionType ?? 'hero',
            title: d.title ?? '',
            content: d.content ?? '',
            imageMediaId: d.imageMediaId ?? '',
            isActive: d.isActive ?? true,
          });
        })
        .catch(() => {
          setError('Gagal memuat detail section');
        });
    } else {
      setForm(EMPTY_FORM);
      setError('');
    }
  }, [open, editingId, api]);

  // ── Submit handler ─────────────────────────────────────────────
  async function handleSave(e: React.SyntheticEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!form.title) {
      setError('Judul section wajib diisi');
      return;
    }
    setSubmitting(true);
    setError('');
    try {
      const body = {
        sectionType: form.sectionType,
        title: form.title,
        content: form.content || undefined,
        imageMediaId: form.imageMediaId || undefined,
        isActive: form.isActive,
      };

      if (editingId) {
        await api.patch(`/api/v1/admin/homepage-sections/${editingId}`, { body });
      } else {
        await api.post('/api/v1/admin/homepage-sections', { body });
      }
      onClose();
      onSaved();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gagal menyimpan section');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Modal open={open} onClose={onClose} title={editingId ? 'Edit Section' : 'Tambah Section'}>
      <form onSubmit={handleSave} className="space-y-4">
        {error && <p className="text-sm text-danger-500">{error}</p>}

        <Select
          label="Tipe Section"
          value={form.sectionType}
          onChange={(e) => setForm((f) => ({ ...f, sectionType: e.target.value }))}
          options={SECTION_TYPE_OPTIONS}
          disabled={!!editingId}
        />

        <Input
          label="Judul"
          value={form.title}
          onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
          placeholder="cth: Layanan Kami"
          required
        />

        <div className="space-y-1.5">
          <label className="text-sm font-medium text-text-primary">Konten</label>
          <textarea
            value={form.content}
            onChange={(e) => setForm((f) => ({ ...f, content: e.target.value }))}
            rows={4}
            className="w-full rounded-md border border-border-default bg-bg-surface px-3 py-2 text-sm text-text-primary outline-none transition-colors focus:border-primary focus:ring-1 focus:ring-primary"
            placeholder="Konten section (optional)"
          />
        </div>

        <Input
          label="Media ID (UUID)"
          value={form.imageMediaId}
          onChange={(e) => setForm((f) => ({ ...f, imageMediaId: e.target.value }))}
          placeholder="UUID dari media library"
        />

        <div className="flex items-center justify-between rounded-md border border-border-default px-4 py-3">
          <div>
            <p className="text-sm font-medium text-text-primary">Aktif</p>
            <p className="text-xs text-text-muted">Tampilkan section di homepage</p>
          </div>
          <Switch
            checked={form.isActive}
            onChange={(e) =>
              setForm((f) => ({ ...f, isActive: (e.target as HTMLInputElement).checked }))
            }
          />
        </div>

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
