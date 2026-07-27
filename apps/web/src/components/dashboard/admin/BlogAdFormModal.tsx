import { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { createBrowserClient, parseApiError } from '@ahlipanggilan/shared';
import { Button, Input, Select, Modal } from '@ahlipanggilan/ui';

export interface BlogAdFormData {
  title: string;
  imageUrl: string;
  caption: string;
  linkUrl: string;
  displayOrder: number;
  isActive: string;
}

export interface BlogAdFormModalProps {
  open: boolean;
  onClose: () => void;
  editingId: string | null;
  onSaved: () => void;
}

const EMPTY_FORM: BlogAdFormData = {
  title: '',
  imageUrl: '',
  caption: '',
  linkUrl: '',
  displayOrder: 0,
  isActive: 'true',
};

const IS_ACTIVE_OPTIONS = [
  { value: 'true', label: 'Aktif' },
  { value: 'false', label: 'Nonaktif' },
];

interface DetailResponse {
  title: string;
  imageUrl: string;
  caption: string | null;
  linkUrl: string | null;
  displayOrder: number;
  isActive: string;
}

export default function BlogAdFormModal({
  open,
  onClose,
  editingId,
  onSaved,
}: BlogAdFormModalProps) {
  const api = useMemo(() => createBrowserClient(), []);
  const [form, setForm] = useState<BlogAdFormData>(EMPTY_FORM);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [imageUploading, setImageUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const uploadToMedia = useCallback(
    async (file: File): Promise<string> => {
      const formData = new FormData();
      formData.append('file', file);
      const result = await api.post<{ url: string; id: string }>('/api/v1/media/upload', {
        formData,
      });
      const data = result as unknown as { url?: string; id?: string };
      return data?.url ?? `/api/v1/media/${data?.id}/file`;
    },
    [api],
  );

  const handleImageUpload = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = Array.from(e.target.files ?? []);
      if (files.length === 0) return;
      const file = files[0];
      if (!file.type.startsWith('image/')) return;

      setImageUploading(true);
      try {
        const url = await uploadToMedia(file);
        setForm((f) => ({ ...f, imageUrl: url }));
      } catch {
        setError('Gagal mengupload gambar');
      } finally {
        setImageUploading(false);
      }
      e.target.value = '';
    },
    [uploadToMedia],
  );

  useEffect(() => {
    if (!open) return;

    if (editingId) {
      setError('');
      api
        .get<DetailResponse>(`/api/v1/admin/blog-ads/${editingId}`)
        .then((detail) => {
          const d = detail as unknown as DetailResponse;
          setForm({
            title: d.title ?? '',
            imageUrl: d.imageUrl ?? '',
            caption: d.caption ?? '',
            linkUrl: d.linkUrl ?? '',
            displayOrder: d.displayOrder ?? 0,
            isActive: d.isActive ?? 'true',
          });
        })
        .catch(() => {
          setError('Gagal memuat detail iklan');
        });
    } else {
      setForm(EMPTY_FORM);
      setError('');
      setFieldErrors({});
    }
  }, [open, editingId, api]);

  async function handleSave(e: React.SyntheticEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!form.title || !form.imageUrl) {
      setError('Judul dan gambar wajib diisi');
      return;
    }
    setSubmitting(true);
    setError('');
    try {
      const body = {
        title: form.title,
        imageUrl: form.imageUrl,
        caption: form.caption || undefined,
        linkUrl: form.linkUrl || undefined,
        displayOrder: form.displayOrder,
        isActive: form.isActive as 'true' | 'false',
      };

      if (editingId) {
        await api.patch(`/api/v1/admin/blog-ads/${editingId}`, { body });
      } else {
        await api.post('/api/v1/admin/blog-ads', { body });
      }
      onClose();
      onSaved();
    } catch (err) {
      const { fieldErrors: fe, generalError } = parseApiError(err, 'Gagal menyimpan iklan');
      setFieldErrors(fe);
      setError(generalError);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Modal open={open} onClose={onClose} title={editingId ? 'Edit Iklan' : 'Tambah Iklan'}>
      <form onSubmit={handleSave} className="space-y-4">
        {error && <p className="text-sm text-danger-500">{error}</p>}

        <Input
          label="Judul"
          value={form.title}
          onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
          placeholder="Nama iklan"
          required
          error={fieldErrors['title']}
        />

        <div className="space-y-2">
          <label className="text-caption font-medium text-text-primary">Gambar (1:1)</label>
          <div className="flex gap-2">
            <div className="flex-1">
              <Input
                value={form.imageUrl}
                onChange={(e) => setForm((f) => ({ ...f, imageUrl: e.target.value }))}
                placeholder="URL gambar"
              />
            </div>
            <Button
              type="button"
              variant="secondary"
              onClick={() => fileInputRef.current?.click()}
              disabled={imageUploading}
            >
              {imageUploading ? '...' : 'Upload'}
            </Button>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="hidden"
            onChange={handleImageUpload}
          />
          {form.imageUrl && (
            <div className="mt-2 flex justify-center">
              <div className="h-24 w-24 overflow-hidden rounded-lg border border-border-default bg-neutral-100">
                <img
                  src={form.imageUrl}
                  alt="Preview"
                  className="h-full w-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = 'none';
                  }}
                />
              </div>
            </div>
          )}
        </div>

        <div className="space-y-1">
          <label className="text-caption font-medium text-text-primary">Caption</label>
          <textarea
            value={form.caption}
            onChange={(e) => setForm((f) => ({ ...f, caption: e.target.value }))}
            placeholder="Teks caption di bawah gambar..."
            rows={2}
            maxLength={500}
            className="w-full rounded-lg border border-border-default bg-bg-surface px-3 py-2 text-body text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
        </div>

        <Input
          label="Link Tujuan (opsional)"
          value={form.linkUrl}
          onChange={(e) => setForm((f) => ({ ...f, linkUrl: e.target.value }))}
          placeholder="https://..."
          error={fieldErrors['linkUrl']}
        />

        <div className="grid grid-cols-2 gap-3">
          <Input
            label="Urutan Tampil"
            type="number"
            value={String(form.displayOrder)}
            onChange={(e) =>
              setForm((f) => ({ ...f, displayOrder: parseInt(e.target.value, 10) || 0 }))
            }
            min={0}
          />
          <Select
            label="Status"
            value={form.isActive}
            onChange={(e) => setForm((f) => ({ ...f, isActive: e.target.value }))}
            options={IS_ACTIVE_OPTIONS}
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
