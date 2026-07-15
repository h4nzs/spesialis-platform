import { useState, useEffect, useCallback, useMemo } from 'react';
import { createBrowserClient } from '@ahlipanggilan/shared';
import {
  Button,
  Input,
  Select,
  Textarea,
  Modal,
  Table,
  Badge,
  EmptyState,
  TableSkeleton,
} from '@ahlipanggilan/ui';
import type { Column } from '@ahlipanggilan/ui';

interface CategoryItem {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  icon: string | null;
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
  displayOrder: string;
}

const EMPTY_FORM: CategoryForm = {
  name: '',
  slug: '',
  description: '',
  icon: '',
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

export function AdminServiceCategories() {
  const api = useMemo(() => createBrowserClient(), []);
  const [items, setItems] = useState<CategoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<string | null>(null);
  const [form, setForm] = useState<CategoryForm>(EMPTY_FORM);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

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
    setShowModal(true);
  }

  function openEdit(item: CategoryItem) {
    setEditing(item.id);
    setError('');
    setForm({
      name: item.name,
      slug: item.slug,
      description: item.description ?? '',
      icon: item.icon ?? '',
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
      await loadData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gagal menyimpan kategori');
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(item: CategoryItem) {
    if (
      !confirm(
        `Nonaktifkan kategori "${item.name}"?\n\nLayanan dalam kategori ini tidak akan terhapus.`,
      )
    )
      return;
    try {
      await api.delete(`/api/v1/admin/service-categories/${item.id}`);
      await loadData();
    } catch {
      // silent
    }
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
          <Button size="sm" variant="danger" onClick={() => handleDelete(item)}>
            Nonaktifkan
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
        data={items}
        columns={columns}
        keyExtractor={(item) => item.id}
        emptyState={
          <EmptyState
            title="Belum ada kategori"
            description="Klik 'Tambah Kategori' untuk membuat kategori baru"
          />
        }
      />

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
          />

          <Input
            label="Slug"
            value={form.slug}
            onChange={(e) => setForm((f) => ({ ...f, slug: e.target.value }))}
            placeholder="auto-generated"
          />

          <Textarea
            label="Deskripsi"
            value={form.description}
            onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
          />

          <Select
            label="Icon"
            value={form.icon}
            onChange={(e) => setForm((f) => ({ ...f, icon: e.target.value }))}
            options={ICON_OPTIONS}
            placeholder="Pilih icon"
          />

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
    </div>
  );
}
