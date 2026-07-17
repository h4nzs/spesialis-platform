import { useState, useEffect, useMemo } from 'react';
import { createBrowserClient, parseApiError } from '@ahlipanggilan/shared';
import { Button, Input, Modal } from '@ahlipanggilan/ui';

// ── Types ────────────────────────────────────────────────────────

export interface CoverageAreaFormData {
  city: string;
  note: string;
  displayOrder: number;
  isActive: string;
}

export interface CoverageAreaFormModalProps {
  open: boolean;
  onClose: () => void;
  editingId: string | null;
  onSaved: () => void;
}

// ── Constants ────────────────────────────────────────────────────

const EMPTY_FORM: CoverageAreaFormData = {
  city: '',
  note: '',
  displayOrder: 0,
  isActive: 'true',
};

interface DetailResponse {
  city: string;
  note: string | null;
  displayOrder: number;
  isActive: string;
}

// ── Component ────────────────────────────────────────────────────

export default function CoverageAreaFormModal({
  open,
  onClose,
  editingId,
  onSaved,
}: CoverageAreaFormModalProps) {
  const api = useMemo(() => createBrowserClient(), []);
  const [form, setForm] = useState<CoverageAreaFormData>(EMPTY_FORM);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  // Reset form when modal opens or editingId changes
  useEffect(() => {
    if (!open) return;

    if (editingId) {
      setError('');
      api
        .get<DetailResponse>(`/api/v1/admin/coverage-areas/${editingId}`)
        .then((detail) => {
          const d = detail as unknown as DetailResponse;
          setForm({
            city: d.city ?? '',
            note: d.note ?? '',
            displayOrder: d.displayOrder ?? 0,
            isActive: d.isActive ?? 'true',
          });
        })
        .catch(() => {
          setError('Gagal memuat detail area layanan');
        });
    } else {
      setForm(EMPTY_FORM);
      setError('');
    }
  }, [open, editingId, api]);

  // ── Submit handler ─────────────────────────────────────────────
  async function handleSave(e: React.SyntheticEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!form.city) {
      setError('Nama kota wajib diisi');
      return;
    }
    setSubmitting(true);
    setError('');
    try {
      const body = {
        city: form.city,
        note: form.note || undefined,
        displayOrder: form.displayOrder,
        isActive: form.isActive as 'true' | 'false',
      };

      if (editingId) {
        await api.patch(`/api/v1/admin/coverage-areas/${editingId}`, { body });
      } else {
        await api.post('/api/v1/admin/coverage-areas', { body });
      }
      onClose();
      onSaved();
    } catch (err) {
      const { fieldErrors: fe, generalError } = parseApiError(err, 'Gagal menyimpan area layanan');
      setFieldErrors(fe);
      setError(generalError);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={editingId ? 'Edit Area Layanan' : 'Tambah Area Layanan'}
    >
      <form onSubmit={handleSave} className="space-y-4">
        {error && <p className="text-sm text-danger-500">{error}</p>}

        {/* ── City ──────────────────────────────────────────────── */}
        <Input
          label="Kota"
          value={form.city}
          onChange={(e) => setForm((f) => ({ ...f, city: e.target.value }))}
          placeholder="cth: Jakarta, Bandung, Surabaya"
          required
          error={fieldErrors['city']}
        />

        {/* ── Note ──────────────────────────────────────────────── */}
        <Input
          label="Keterangan"
          value={form.note}
          onChange={(e) => setForm((f) => ({ ...f, note: e.target.value }))}
          placeholder="cth: Pusat, Selatan, Barat, Timur, Utara"
        />

        {/* ── Display Order ─────────────────────────────────────── */}
        <Input
          label="Urutan Tampil"
          type="number"
          value={String(form.displayOrder)}
          onChange={(e) =>
            setForm((f) => ({ ...f, displayOrder: parseInt(e.target.value, 10) || 0 }))
          }
          min={0}
        />

        {/* ── Actions ───────────────────────────────────────────── */}
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
