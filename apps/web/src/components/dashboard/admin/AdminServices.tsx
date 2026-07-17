import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { createBrowserClient, parseApiError } from '@ahlipanggilan/shared';
import {
  Button,
  Input,
  Select,
  Textarea,
  Modal,
  Table,
  Badge,
  EmptyState,
  CSVExportButton,
  TableSkeleton,
  MediaBrowser,
} from '@ahlipanggilan/ui';
import type { Column } from '@ahlipanggilan/ui';

interface ServiceItem {
  id: string;
  categoryId: string | null;
  categoryName: string | null;
  name: string;
  slug: string;
  thumbnail: string | null;
  basePrice: string;
  isActive: boolean;
  isFeatured: boolean;
  showInHero: boolean;
  displayOrder: number;
  estimatedDuration: number | null;
}

interface CategoryItem {
  id: string;
  name: string;
  slug: string;
}

interface ServiceForm {
  categoryId: string;
  name: string;
  slug: string;
  shortDescription: string;
  description: string;
  thumbnail: string;
  basePrice: string;
  estimatedDuration: string;
  warrantyDays: string;
  isFeatured: boolean;
  showInHero: boolean;
  displayOrder: string;
}

const EMPTY_FORM: ServiceForm = {
  categoryId: '',
  name: '',
  slug: '',
  shortDescription: '',
  description: '',
  thumbnail: '',
  basePrice: '',
  estimatedDuration: '',
  warrantyDays: '',
  isFeatured: false,
  showInHero: false,
  displayOrder: '0',
};

export function AdminServices() {
  const api = useMemo(() => createBrowserClient(), []);
  const [services, setServices] = useState<ServiceItem[]>([]);
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<string | null>(null);
  const [form, setForm] = useState<ServiceForm>(EMPTY_FORM);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [showMediaBrowser, setShowMediaBrowser] = useState(false);
  const thumbnailInputRef = useRef<HTMLInputElement>(null);
  const [thumbnailUploading, setThumbnailUploading] = useState(false);

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

  const handleThumbnailFileSelect = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = Array.from(e.target.files ?? []);
      if (files.length === 0) return;
      const file = files[0];
      if (!file.type.startsWith('image/')) return;
      setThumbnailUploading(true);
      try {
        const url = await uploadToMedia(file);
        setForm((f) => ({ ...f, thumbnail: url }));
      } catch {
        setError('Gagal mengupload gambar');
      } finally {
        setThumbnailUploading(false);
      }
      e.target.value = '';
    },
    [uploadToMedia],
  );

  const loadData = useCallback(async () => {
    try {
      const [svc, cats] = await Promise.all([
        api.get<{ data: ServiceItem[] }>('/api/v1/admin/services', { params: { limit: 200 } }),
        api.get<CategoryItem[]>('/api/v1/admin/service-categories'),
      ]);
      setServices(Array.isArray(svc) ? svc : (svc?.data ?? []));
      setCategories(Array.isArray(cats) ? cats : []);
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  }, [api]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  function openCreate() {
    setEditing(null);
    setForm(EMPTY_FORM);
    setError('');
    setFieldErrors({});
    setShowModal(true);
  }

  async function openEdit(item: ServiceItem) {
    setEditing(item.id);
    setError('');
    setFieldErrors({});
    try {
      const detail = await api.get<Record<string, unknown>>(`/api/v1/admin/services/${item.id}`);
      setForm({
        categoryId: (detail.categoryId as string) || '',
        name: (detail.name as string) || '',
        slug: (detail.slug as string) || '',
        shortDescription: (detail.shortDescription as string) || '',
        description: (detail.description as string) || '',
        thumbnail: (detail.thumbnail as string) || '',
        basePrice: String(detail.basePrice ?? ''),
        estimatedDuration: String(detail.estimatedDuration ?? ''),
        warrantyDays: String(detail.warrantyDays ?? ''),
        isFeatured: (detail.isFeatured as boolean) ?? false,
        showInHero: (detail.showInHero as boolean) ?? false,
        displayOrder: String(detail.displayOrder ?? '0'),
      });
      setShowModal(true);
    } catch {
      setError('Gagal memuat detail layanan');
    }
  }

  async function handleSave(e: React.SyntheticEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!form.name || !form.slug || !form.basePrice) {
      setError('Nama, slug, dan harga wajib diisi');
      return;
    }
    setSubmitting(true);
    setError('');
    try {
      const body: Record<string, unknown> = {
        categoryId: form.categoryId || null,
        name: form.name,
        slug: form.slug,
        shortDescription: form.shortDescription || undefined,
        description: form.description || undefined,
        thumbnail: form.thumbnail || null,
        basePrice: form.basePrice,
        estimatedDuration: form.estimatedDuration ? Number(form.estimatedDuration) : undefined,
        warrantyDays: form.warrantyDays ? Number(form.warrantyDays) : undefined,
        isFeatured: form.isFeatured,
        showInHero: form.showInHero,
        displayOrder: Number(form.displayOrder),
      };

      if (editing) {
        await api.patch(`/api/v1/admin/services/${editing}`, { body });
      } else {
        await api.post('/api/v1/admin/services', { body });
      }
      setShowModal(false);
      await loadData();
    } catch (err) {
      const { fieldErrors: fe, generalError } = parseApiError(err, 'Gagal menyimpan layanan');
      setFieldErrors(fe);
      setError(generalError);
    } finally {
      setSubmitting(false);
    }
  }

  async function handleToggleActive(item: ServiceItem) {
    try {
      await api.patch(`/api/v1/admin/services/${item.id}`, {
        body: { isActive: !item.isActive },
      });
      await loadData();
    } catch {
      // silent
    }
  }

  const columns: Column<ServiceItem>[] = [
    {
      key: 'name',
      header: 'Nama',
      render: (item) => (
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 shrink-0 overflow-hidden rounded-lg border border-border-default bg-neutral-100">
            {item.thumbnail && (
              <img
                src={item.thumbnail}
                alt=""
                className="h-full w-full object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = 'none';
                }}
              />
            )}
          </div>
          <div>
            <span className="font-medium text-text-primary">{item.name}</span>
            <span className="ml-2 text-xs text-text-secondary">({item.slug})</span>
          </div>
        </div>
      ),
    },
    { key: 'categoryName', header: 'Kategori', render: (item) => item.categoryName ?? '-' },
    {
      key: 'basePrice',
      header: 'Harga',
      render: (item) => item.basePrice,
    },
    {
      key: 'isActive',
      header: 'Status',
      render: (item) => (
        <Badge variant={item.isActive ? 'success' : 'default'}>
          {item.isActive ? 'Aktif' : 'Nonaktif'}
        </Badge>
      ),
    },
    {
      key: 'isFeatured',
      header: 'Featured',
      render: (item) => (item.isFeatured ? '⭐' : '-'),
    },
    {
      key: 'showInHero',
      header: 'Hero',
      render: (item) =>
        item.showInHero && !item.categoryId ? <Badge variant="warning">Hero</Badge> : '-',
    },
    {
      key: 'id',
      header: 'Aksi',
      render: (item) => (
        <div className="flex gap-2">
          <Button size="sm" onClick={() => openEdit(item)}>
            Edit
          </Button>
          <Button size="sm" variant="danger" onClick={() => handleToggleActive(item)}>
            {item.isActive ? 'Nonaktifkan' : 'Aktifkan'}
          </Button>
        </div>
      ),
    },
  ];

  if (loading) return <TableSkeleton toolbarWidth="w-40" />;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-end gap-2">
        {services.length > 0 && (
          <CSVExportButton
            data={services as unknown as Record<string, unknown>[]}
            columns={[
              { key: 'name', label: 'Nama' },
              { key: 'slug', label: 'Slug' },
              {
                key: 'categoryName',
                label: 'Kategori',
                format: (v) => (v as string) ?? '-',
              },
              {
                key: 'basePrice',
                label: 'Harga',
                format: (v) => (v as string) ?? '-',
              },
              {
                key: 'isActive',
                label: 'Status',
                format: (v) => (v ? 'Aktif' : 'Nonaktif'),
              },
              {
                key: 'isFeatured',
                label: 'Featured',
                format: (v) => (v ? 'Ya' : 'Tidak'),
              },
            ]}
            filename="layanan-export.csv"
          />
        )}
        <Button onClick={openCreate}>Tambah Layanan</Button>
      </div>

      <Table
        data={services}
        columns={columns}
        keyExtractor={(item) => item.id}
        emptyState={<EmptyState title="Belum ada layanan" />}
      />

      <Modal
        open={showModal}
        onClose={() => setShowModal(false)}
        title={editing ? 'Edit Layanan' : 'Tambah Layanan'}
      >
        <form onSubmit={handleSave} className="space-y-3">
          {error && <p className="text-sm text-danger">{error}</p>}

          <Select
            label="Kategori"
            value={form.categoryId}
            onChange={(e) => setForm((f) => ({ ...f, categoryId: e.target.value }))}
            options={[
              { value: '', label: 'Tidak ada kategori' },
              ...categories.map((c) => ({ value: c.id, label: c.name })),
            ]}
            placeholder="Pilih kategori (opsional)"
            error={fieldErrors['categoryId']}
          />

          <Input
            label="Nama Layanan"
            value={form.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            required
            error={fieldErrors['name']}
          />

          <Input
            label="Slug"
            value={form.slug}
            onChange={(e) => setForm((f) => ({ ...f, slug: e.target.value }))}
            placeholder="nama-layanan"
            required
            error={fieldErrors['slug']}
          />

          <Input
            label="Deskripsi Singkat"
            value={form.shortDescription}
            onChange={(e) => setForm((f) => ({ ...f, shortDescription: e.target.value }))}
            error={fieldErrors['shortDescription']}
          />

          <Textarea
            label="Deskripsi"
            value={form.description}
            onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
            error={fieldErrors['description']}
          />

          <div className="grid grid-cols-3 gap-3">
            <Input
              label="Harga"
              value={form.basePrice}
              onChange={(e) => setForm((f) => ({ ...f, basePrice: e.target.value }))}
              required
              error={fieldErrors['basePrice']}
            />
            <Input
              label="Durasi (menit)"
              type="number"
              value={form.estimatedDuration}
              onChange={(e) => setForm((f) => ({ ...f, estimatedDuration: e.target.value }))}
              error={fieldErrors['estimatedDuration']}
            />
            <Input
              label="Garasi (hari)"
              type="number"
              value={form.warrantyDays}
              onChange={(e) => setForm((f) => ({ ...f, warrantyDays: e.target.value }))}
              error={fieldErrors['warrantyDays']}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Urutan"
              type="number"
              value={form.displayOrder}
              onChange={(e) => setForm((f) => ({ ...f, displayOrder: e.target.value }))}
              error={fieldErrors['displayOrder']}
            />
            <div className="flex items-end gap-4 pb-2">
              <label className="flex items-center gap-2 text-sm text-text-primary">
                <input
                  type="checkbox"
                  checked={form.isFeatured}
                  onChange={(e) => setForm((f) => ({ ...f, isFeatured: e.target.checked }))}
                  className="rounded border-border-default"
                />
                Featured
              </label>
              {!form.categoryId && (
                <label className="flex items-center gap-2 text-sm text-text-primary">
                  <input
                    type="checkbox"
                    checked={form.showInHero}
                    onChange={(e) => setForm((f) => ({ ...f, showInHero: e.target.checked }))}
                    className="rounded border-border-default"
                  />
                  Tampilkan di Hero
                </label>
              )}
            </div>
          </div>

          {/* Thumbnail */}
          <div>
            <label className="mb-1 block text-sm font-medium text-text-primary">Gambar</label>
            <div className="flex gap-2">
              <div className="flex-1">
                <Input
                  value={form.thumbnail}
                  onChange={(e) => setForm((f) => ({ ...f, thumbnail: e.target.value }))}
                  placeholder="URL gambar"
                  error={fieldErrors['thumbnail']}
                />
              </div>
              <Button type="button" variant="secondary" onClick={() => setShowMediaBrowser(true)}>
                Pilih
              </Button>
              <Button
                type="button"
                variant="secondary"
                onClick={() => thumbnailInputRef.current?.click()}
                disabled={thumbnailUploading}
              >
                {thumbnailUploading ? '...' : 'Upload'}
              </Button>
            </div>
            <input
              ref={thumbnailInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className="hidden"
              onChange={handleThumbnailFileSelect}
            />
            {form.thumbnail && (
              <div className="relative mt-2">
                <div className="relative aspect-video w-full max-w-[240px] overflow-hidden rounded-lg border border-border-default bg-neutral-100">
                  <img
                    src={form.thumbnail}
                    alt="Preview"
                    loading="lazy"
                    decoding="async"
                    className="h-full w-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = 'none';
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => setForm((f) => ({ ...f, thumbnail: '' }))}
                    className="absolute right-1.5 top-1.5 flex h-6 w-6 items-center justify-center rounded-full bg-black/50 text-white transition-colors duration-150 hover:bg-danger-500"
                    title="Hapus gambar"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="12"
                      height="12"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      stroke-width="2.5"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                    >
                      <line x1="18" y1="6" x2="6" y2="18" />
                      <line x1="6" y1="6" x2="18" y2="18" />
                    </svg>
                  </button>
                </div>
              </div>
            )}
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="ghost" type="button" onClick={() => setShowModal(false)}>
              Batal
            </Button>
            <Button type="submit" disabled={submitting}>
              {submitting ? 'Menyimpan...' : editing ? 'Simpan' : 'Buat'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* MediaBrowser — ditempatkan setelah Modal agar z-index lebih tinggi */}
      <MediaBrowser
        open={showMediaBrowser}
        onClose={() => setShowMediaBrowser(false)}
        onSelect={(url) => {
          setForm((f) => ({ ...f, thumbnail: url }));
          setShowMediaBrowser(false);
        }}
      />
    </div>
  );
}
