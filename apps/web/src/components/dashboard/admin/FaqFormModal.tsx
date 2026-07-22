import { useState, useEffect, useMemo, lazy, Suspense } from 'react';
import { createBrowserClient, parseApiError } from '@ahlipanggilan/shared';
import { Button, Input, Select, Modal, type SelectOption } from '@ahlipanggilan/ui';
const RichTextEditor = lazy(() =>
  import('@ahlipanggilan/ui/editor').then((m) => ({ default: m.RichTextEditor })),
);

// ── Types ────────────────────────────────────────────────────────

interface CategoryRecord {
  slug: string;
  name: string;
}

// ── Types ────────────────────────────────────────────────────────

export interface FaqFormData {
  question: string;
  answer: string;
  category: string;
  displayOrder: number;
  isActive: string;
}

export interface FaqFormModalProps {
  open: boolean;
  onClose: () => void;
  editingId: string | null;
  onSaved: () => void;
}

// ── Constants ────────────────────────────────────────────────────

const EMPTY_FORM: FaqFormData = {
  question: '',
  answer: '',
  category: '',
  displayOrder: 0,
  isActive: 'true',
};

const IS_ACTIVE_OPTIONS = [
  { value: 'true', label: 'Aktif' },
  { value: 'false', label: 'Nonaktif' },
];

interface DetailResponse {
  question: string;
  answer: string;
  category: string | null;
  displayOrder: number;
  isActive: string;
}

// ── Component ────────────────────────────────────────────────────

export default function FaqFormModal({ open, onClose, editingId, onSaved }: FaqFormModalProps) {
  const api = useMemo(() => createBrowserClient(), []);
  const [form, setForm] = useState<FaqFormData>(EMPTY_FORM);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  // ── Fetch category options ────────────────────────────────────
  const [categoryOptions, setCategoryOptions] = useState<SelectOption[]>([]);

  useEffect(() => {
    if (!open) return;
    api
      .get<CategoryRecord[]>('/api/v1/admin/service-categories')
      .then((cats) => {
        const list = cats as unknown as CategoryRecord[];
        setCategoryOptions(
          Array.isArray(list) ? list.map((c) => ({ value: c.slug, label: c.name })) : [],
        );
      })
      .catch(() => {
        setCategoryOptions([]);
      });
  }, [open, api]);

  // Reset form when modal opens or editingId changes
  useEffect(() => {
    if (!open) return;

    if (editingId) {
      setError('');
      api
        .get<DetailResponse>(`/api/v1/admin/faq/${editingId}`)
        .then((detail) => {
          const d = detail as unknown as DetailResponse;
          setForm({
            question: d.question ?? '',
            answer: d.answer ?? '',
            category: d.category ?? '',
            displayOrder: d.displayOrder ?? 0,
            isActive: d.isActive ?? 'true',
          });
        })
        .catch(() => {
          setError('Gagal memuat detail FAQ');
        });
    } else {
      setForm(EMPTY_FORM);
      setError('');
      setFieldErrors({});
    }
  }, [open, editingId, api]);

  // ── Submit handler ─────────────────────────────────────────────
  async function handleSave(e: React.SyntheticEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!form.question || !form.answer) {
      setError('Pertanyaan dan jawaban wajib diisi');
      return;
    }
    setSubmitting(true);
    setError('');
    try {
      const body = {
        question: form.question,
        answer: form.answer,
        category: form.category || undefined,
        displayOrder: form.displayOrder,
        isActive: form.isActive as 'true' | 'false',
      };

      if (editingId) {
        await api.patch(`/api/v1/admin/faq/${editingId}`, { body });
      } else {
        await api.post('/api/v1/admin/faq', { body });
      }
      onClose();
      onSaved();
    } catch (err) {
      const { fieldErrors: fe, generalError } = parseApiError(err, 'Gagal menyimpan FAQ');
      setFieldErrors(fe);
      setError(generalError);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Modal open={open} onClose={onClose} title={editingId ? 'Edit FAQ' : 'Tambah FAQ'}>
      <form onSubmit={handleSave} className="space-y-4">
        {error && <p className="text-sm text-danger-500">{error}</p>}
        {/* ── Question ────────────────────────────────────────── */}{' '}
        <Input
          label="Pertanyaan"
          value={form.question}
          onChange={(e) => setForm((f) => ({ ...f, question: e.target.value }))}
          placeholder="Masukkan pertanyaan"
          required
          error={fieldErrors['question']}
        />
        {/* ── Answer (RichTextEditor) ─────────────────────────── */}
        <Suspense
          fallback={
            <div className="flex min-h-[200px] items-center justify-center rounded-md border border-border-default bg-bg-surface text-sm text-text-muted">
              Memuat editor...
            </div>
          }
        >
          <RichTextEditor
            label="Jawaban"
            value={form.answer}
            onChange={(html) => setForm((f) => ({ ...f, answer: html }))}
            placeholder="Tulis jawaban di sini..."
          />
        </Suspense>
        {/* ── Category & Display Order ────────────────────────── */}
        <div className="grid grid-cols-2 gap-3">
          <Select
            label="Kategori Layanan"
            value={form.category}
            onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
            options={[{ value: '', label: '— Tidak ada kategori —' }, ...categoryOptions]}
            placeholder="Pilih kategori"
            error={fieldErrors['category']}
          />
          <Input
            label="Urutan Tampil"
            type="number"
            value={String(form.displayOrder)}
            onChange={(e) =>
              setForm((f) => ({ ...f, displayOrder: parseInt(e.target.value, 10) || 0 }))
            }
            min={0}
          />
        </div>
        {/* ── Active Status ───────────────────────────────────── */}
        <Select
          label="Status"
          value={form.isActive}
          onChange={(e) => setForm((f) => ({ ...f, isActive: e.target.value }))}
          options={IS_ACTIVE_OPTIONS}
        />
        {/* ── Actions ─────────────────────────────────────────── */}
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
