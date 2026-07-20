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
  Pagination,
  EmptyState,
  TableSkeleton,
  MediaBrowser,
} from '@ahlipanggilan/ui';
import type { Column } from '@ahlipanggilan/ui';

interface CategoryItem {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  icon: string | null;
  image: string | null;
  displayOrder: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface CategoryForm {
  name: string;
  slug: string;
  description: string;
  icon: string;
  image: string;
  displayOrder: string;
}

const EMPTY_FORM: CategoryForm = {
  name: '',
  slug: '',
  description: '',
  icon: '',
  image: '',
  displayOrder: '0',
};

const ICON_OPTIONS = [
  { value: '', label: 'Tanpa icon' },
  { value: 'alert-triangle', label: '🚨 Darurat' },
  { value: 'truck', label: '🚗 Montir' },
  { value: 'monitor', label: '📺 Elektronik' },
  { value: 'droplet', label: '🚿 Plumbing' },
  { value: 'zap', label: '⚡ Listrik' },
  { value: 'sparkles', label: '🧹 Cleaning' },
  { value: 'hammer', label: '🏠 Bangunan' },
  { value: 'wrench', label: '🔩 Las' },
  { value: 'road', label: '🛣️ Aspal' },
  { value: 'trash-2', label: '🚽 Sedot WC' },
  { value: 'bug', label: '🐜 Pest Control' },
  { value: 'tree', label: '🌳 Taman' },
  { value: 'shield', label: '🛡️ Security' },
  { value: 'car', label: '🚘 Supir' },
  { value: 'users', label: '🏡 Rumah Tangga' },
  { value: 'search', label: '🔍 Investigasi' },
  { value: 'more-horizontal', label: '📋 Lainnya' },
];

const PAGE_SIZE = 50;

export function AdminServiceCategories() {
  const api = useMemo(() => createBrowserClient(), []);
  const [items, setItems] = useState<CategoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<string | null>(null);
  const [form, setForm] = useState<CategoryForm>(EMPTY_FORM);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [showMediaBrowser, setShowMediaBrowser] = useState(false);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const [imageUploading, setImageUploading] = useState(false);

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

  const handleImageFileSelect = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = Array.from(e.target.files ?? []);
      if (files.length === 0) return;
      const file = files[0];
      if (!file.type.startsWith('image/')) return;
      setImageUploading(true);
      try {
        const url = await uploadToMedia(file);
        setForm((f) => ({ ...f, image: url }));
      } catch {
        setError('Gagal mengupload gambar');
      } finally {
        setImageUploading(false);
      }
      e.target.value = '';
    },
    [uploadToMedia],
  );

  const loadData = useCallback(async () => {
    try {
      const result = await api.get<CategoryItem[]>('/api/v1/admin/service-categories');
      setItems(Array.isArray(result) ? result : []);
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

  function openEdit(item: CategoryItem) {
    setEditing(item.id);
    setError('');
    setFieldErrors({});
    setForm({
      name: item.name,
      slug: item.slug,
      description: item.description ?? '',
      icon: item.icon ?? '',
      image: item.image ?? '',
      displayOrder: String(item.displayOrder),
    });
    setShowModal(true);
  }

  async function handleSave(e: React.SyntheticEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!form.name) {
      setError('Nama kategori wajib diisi');
      return;
    }
    setSubmitting(true);
    setError('');
    try {
      const body: Record<string, unknown> = {
        name: form.name,
        description: form.description || undefined,
        icon: form.icon || undefined,
        image: form.image || null,
        displayOrder: Number(form.displayOrder) || 0,
      };

      if (form.slug) {
        body.slug = form.slug;
      }

      if (editing) {
        await api.patch(`/api/v1/admin/service-categories/${editing}`, { body });
      } else {
        await api.post('/api/v1/admin/service-categories', { body });
      }
      setShowModal(false);
      setPage(1);
      await loadData();
    } catch (err) {
      const { fieldErrors: fe, generalError } = parseApiError(err, 'Gagal menyimpan kategori');
      setFieldErrors(fe);
      setError(generalError);
    } finally {
      setSubmitting(false);
    }
  }

  async function handleToggleActive(item: CategoryItem) {
    if (item.isActive) {
      if (
        !confirm(
          `Nonaktifkan kategori "${item.name}"?\n\nLayanan dalam kategori ini tidak akan terhapus.`,
        )
      )
        return;
      await api.delete(`/api/v1/admin/service-categories/${item.id}`);
    } else {
      await api.patch(`/api/v1/admin/service-categories/${item.id}`, {
        body: { isActive: true },
      });
    }
    setPage(1);
    await loadData();
  }

  /** Auto-generate slug from name (only when creating) */
  function autoSlug(name: string): string {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');
  }

  function handleNameChange(name: string) {
    setForm((f) => ({
      ...f,
      name,
      slug: editing ? f.slug : autoSlug(name),
    }));
  }

  const columns: Column<CategoryItem>[] = [
    {
      key: 'name',
      header: 'Nama',
      render: (item) => (
        <div className="flex items-center gap-3">
          {item.icon && (
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary-50 text-sm text-primary-600">
              {ICON_OPTIONS.find((o) => o.value === item.icon)?.label?.charAt(0) ?? '📁'}
            </span>
          )}
          <div>
            <span className="font-medium text-text-primary">{item.name}</span>
            <span className="ml-2 text-xs text-text-secondary">({item.slug})</span>
          </div>
        </div>
      ),
    },
    {
      key: 'displayOrder',
      header: 'Urutan',
      render: (item) => <span className="text-text-muted">{item.displayOrder}</span>,
    },
    {
      key: 'description',
      header: 'Deskripsi',
      render: (item) => (
        <span className="line-clamp-1 max-w-[300px] text-text-secondary">
          {item.description ?? '-'}
        </span>
      ),
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
      key: 'id',
      header: 'Aksi',
      render: (item) => (
        <div className="flex gap-2">
          <Button size="sm" onClick={() => openEdit(item)}>
            Edit
          </Button>
          <Button
            size="sm"
            variant={item.isActive ? 'danger' : 'secondary'}
            onClick={() => handleToggleActive(item)}
          >
            {item.isActive ? 'Nonaktifkan' : 'Aktifkan'}
          </Button>
        </div>
      ),
    },
  ];

  if (loading) return <TableSkeleton toolbarWidth="w-40" />;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-end">
        <Button onClick={openCreate}>Tambah Kategori</Button>
      </div>

      <Table
        data={items.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)}
        columns={columns}
        keyExtractor={(item) => item.id}
        emptyState={
          <EmptyState
            title="Belum ada kategori"
            description="Klik 'Tambah Kategori' untuk membuat kategori baru"
          />
        }
      />

      {items.length > PAGE_SIZE && (
        <Pagination
          page={page}
          totalPages={Math.ceil(items.length / PAGE_SIZE)}
          onPageChange={setPage}
        />
      )}

      <Modal
        open={showModal}
        onClose={() => setShowModal(false)}
        title={editing ? 'Edit Kategori' : 'Tambah Kategori'}
      >
        <form onSubmit={handleSave} className="space-y-3">
          {error && <p className="text-sm text-danger">{error}</p>}

          <Input
            label="Nama Kategori"
            value={form.name}
            onChange={(e) => handleNameChange(e.target.value)}
            required
            error={fieldErrors['name']}
          />

          <Input
            label="Slug"
            value={form.slug}
            onChange={(e) => setForm((f) => ({ ...f, slug: e.target.value }))}
            placeholder="auto-generated"
            error={fieldErrors['slug']}
          />

          <Textarea
            label="Deskripsi"
            value={form.description}
            onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
            error={fieldErrors['description']}
          />

          <Select
            label="Icon"
            value={form.icon}
            onChange={(e) => setForm((f) => ({ ...f, icon: e.target.value }))}
            options={ICON_OPTIONS}
            placeholder="Pilih icon"
            error={fieldErrors['icon']}
          />

          {/* Image */}
          <div>
            <label className="mb-1 block text-sm font-medium text-text-primary">
              Gambar Kategori
            </label>
            <div className="flex gap-2">
              <div className="flex-1">
                <Input
                  value={form.image}
                  onChange={(e) => setForm((f) => ({ ...f, image: e.target.value }))}
                  placeholder="URL gambar"
                  error={fieldErrors['image']}
                />
              </div>
              <Button type="button" variant="secondary" onClick={() => setShowMediaBrowser(true)}>
                Pilih
              </Button>
              <Button
                type="button"
                variant="secondary"
                onClick={() => imageInputRef.current?.click()}
                disabled={imageUploading}
              >
                {imageUploading ? '...' : 'Upload'}
              </Button>
            </div>
            <input
              ref={imageInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className="hidden"
              onChange={handleImageFileSelect}
            />
            {form.image && (
              <div className="relative mt-2">
                <div className="relative aspect-video w-full max-w-[240px] overflow-hidden rounded-lg border border-border-default bg-neutral-100">
                  <img
                    src={form.image}
                    alt="Preview"
                    loading="lazy"
                    decoding="async"
                    className="h-full w-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = 'none';
                    }}
                  />
                  {/* Hapus button overlay */}
                  <button
                    type="button"
                    onClick={() => setForm((f) => ({ ...f, image: '' }))}
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

          <Input
            label="Urutan Tampil"
            type="number"
            value={form.displayOrder}
            onChange={(e) => setForm((f) => ({ ...f, displayOrder: e.target.value }))}
          />

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

      {/* MediaBrowser */}
      <MediaBrowser
        open={showMediaBrowser}
        onClose={() => setShowMediaBrowser(false)}
        onSelect={(url) => {
          setForm((f) => ({ ...f, image: url }));
          setShowMediaBrowser(false);
        }}
      />
    </div>
  );
}
