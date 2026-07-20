import { useState, useEffect, useMemo } from 'react';
import { createBrowserClient, parseApiError } from '@ahlipanggilan/shared';
import { Button, Input, Select, Modal } from '@ahlipanggilan/ui';

export interface TestimonialFormData {
  name: string;
  location: string;
  role: string;
  quote: string;
  rating: number;
  displayOrder: number;
  isActive: string;
}

export interface TestimonialFormModalProps {
  open: boolean;
  onClose: () => void;
  editingId: string | null;
  onSaved: () => void;
}

const EMPTY_FORM: TestimonialFormData = {
  name: '',
  location: '',
  role: '',
  quote: '',
  rating: 5,
  displayOrder: 0,
  isActive: 'true',
};

const IS_ACTIVE_OPTIONS = [
  { value: 'true', label: 'Aktif' },
  { value: 'false', label: 'Nonaktif' },
];

const RATING_OPTIONS = [
  { value: '5', label: '5 ★' },
  { value: '4', label: '4 ★' },
  { value: '3', label: '3 ★' },
  { value: '2', label: '2 ★' },
  { value: '1', label: '1 ★' },
];

interface DetailResponse {
  name: string;
  location: string | null;
  role: string | null;
  quote: string;
  rating: string;
  displayOrder: number;
  isActive: string;
}

export default function TestimonialFormModal({
  open,
  onClose,
  editingId,
  onSaved,
}: TestimonialFormModalProps) {
  const api = useMemo(() => createBrowserClient(), []);
  const [form, setForm] = useState<TestimonialFormData>(EMPTY_FORM);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!open) return;

    if (editingId) {
      setError('');
      api
        .get<DetailResponse>(`/api/v1/admin/testimonials/${editingId}`)
        .then((detail) => {
          const d = detail as unknown as DetailResponse;
          setForm({
            name: d.name ?? '',
            location: d.location ?? '',
            role: d.role ?? '',
            quote: d.quote ?? '',
            rating: Number(d.rating) || 5,
            displayOrder: d.displayOrder ?? 0,
            isActive: d.isActive ?? 'true',
          });
        })
        .catch(() => {
          setError('Gagal memuat detail testimonial');
        });
    } else {
      setForm(EMPTY_FORM);
      setError('');
      setFieldErrors({});
    }
  }, [open, editingId, api]);

  async function handleSave(e: React.SyntheticEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!form.name || !form.quote) {
      setError('Nama dan testimoni wajib diisi');
      return;
    }
    setSubmitting(true);
    setError('');
    try {
      const body = {
        name: form.name,
        location: form.location || undefined,
        role: form.role || undefined,
        quote: form.quote,
        rating: form.rating,
        displayOrder: form.displayOrder,
        isActive: form.isActive as 'true' | 'false',
      };

      if (editingId) {
        await api.patch(`/api/v1/admin/testimonials/${editingId}`, { body });
      } else {
        await api.post('/api/v1/admin/testimonials', { body });
      }
      onClose();
      onSaved();
    } catch (err) {
      const { fieldErrors: fe, generalError } = parseApiError(err, 'Gagal menyimpan testimonial');
      setFieldErrors(fe);
      setError(generalError);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Modal open={open} onClose={onClose} title={editingId ? 'Edit Testimoni' : 'Tambah Testimoni'}>
      <form onSubmit={handleSave} className="space-y-4">
        {error && <p className="text-sm text-danger-500">{error}</p>}

        <Input
          label="Nama"
          value={form.name}
          onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
          placeholder="Nama pelanggan"
          required
          error={fieldErrors['name']}
        />

        <div className="grid grid-cols-2 gap-3">
          <Input
            label="Lokasi"
            value={form.location}
            onChange={(e) => setForm((f) => ({ ...f, location: e.target.value }))}
            placeholder="cth: Jakarta Selatan"
            error={fieldErrors['location']}
          />
          <Input
            label="Peran"
            value={form.role}
            onChange={(e) => setForm((f) => ({ ...f, role: e.target.value }))}
            placeholder="cth: Teknisi AC"
            error={fieldErrors['role']}
          />
        </div>

        <div className="space-y-1">
          <label className="text-caption font-medium text-text-primary">Testimoni</label>
          <textarea
            value={form.quote}
            onChange={(e) => setForm((f) => ({ ...f, quote: e.target.value }))}
            placeholder="Tulis testimoni di sini..."
            required
            rows={4}
            className="w-full rounded-lg border border-border-default bg-bg-surface px-3 py-2 text-body text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
          {fieldErrors['quote'] && (
            <p className="text-xs text-danger-500">{fieldErrors['quote']}</p>
          )}
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Select
            label="Rating"
            value={String(form.rating)}
            onChange={(e) => setForm((f) => ({ ...f, rating: Number(e.target.value) }))}
            options={RATING_OPTIONS}
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

        <Select
          label="Status"
          value={form.isActive}
          onChange={(e) => setForm((f) => ({ ...f, isActive: e.target.value }))}
          options={IS_ACTIVE_OPTIONS}
        />

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
