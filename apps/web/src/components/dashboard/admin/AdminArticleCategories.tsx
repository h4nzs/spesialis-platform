import { useState, useEffect, useCallback, useMemo } from 'react';
import { createBrowserClient, parseApiError } from '@ahlipanggilan/shared';
import {
  Button,
  Input,
  Textarea,
  Modal,
  Table,
  EmptyState,
  TableSkeleton,
} from '@ahlipanggilan/ui';
import type { Column } from '@ahlipanggilan/ui';

// ── Types ─────────────────────────────────────────────────────────

interface CategoryItem {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  displayOrder: number;
  createdAt: string;
  updatedAt: string;
}

interface CategoryForm {
  name: string;
  slug: string;
  description: string;
  displayOrder: string;
}

const EMPTY_FORM: CategoryForm = {
  name: '',
  slug: '',
  description: '',
  displayOrder: '0',
};

// ── Component ─────────────────────────────────────────────────────

export function AdminArticleCategories() {
  const api = useMemo(() => createBrowserClient(), []);
  const [items, setItems] = useState<CategoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<string | null>(null);
  const [form, setForm] = useState<CategoryForm>(EMPTY_FORM);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  const loadData = useCallback(async () => {
    try {
      const result = await api.get<CategoryItem[]>('/api/v1/admin/articles/categories');
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
    setForm({
      name: item.name,
      slug: item.slug,
      description: item.description ?? '',
      displayOrder: String(item.displayOrder),
    });
    setError('');
    setFieldErrors({});
    setShowModal(true);
  }

  async function handleSave(e: React.SyntheticEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!form.name || !form.slug) {
      setError('Nama dan slug wajib diisi');
      return;
    }
    setSubmitting(true);
    setError('');
    try {
      const body: Record<string, unknown> = {
        name: form.name,
        slug: form.slug,
        description: form.description || undefined,
        displayOrder: Number(form.displayOrder) || 0,
      };

      if (editing) {
        await api.patch(`/api/v1/admin/articles/categories/${editing}`, { body });
      } else {
        await api.post('/api/v1/admin/articles/categories', { body });
      }
      setShowModal(false);
      await loadData();
    } catch (err) {
      const { fieldErrors: fe, generalError } = parseApiError(err, 'Gagal menyimpan kategori');
      setFieldErrors(fe);
      setError(generalError);
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(id: string) {
    setDeleting(true);
    try {
      await api.delete(`/api/v1/admin/articles/categories/${id}`);
      setDeleteConfirm(null);
      await loadData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gagal menghapus kategori');
    } finally {
      setDeleting(false);
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

  // ── Columns ───────────────────────────────────────────────────

  const columns: Column<CategoryItem>[] = [
    {
      key: 'name',
      header: 'Nama',
      render: (item) => (
        <div>
          <span className="font-medium text-text-primary">{item.name}</span>
          <span className="ml-2 text-xs text-text-secondary">({item.slug})</span>
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
      key: 'id',
      header: 'Aksi',
      render: (item) => (
        <div className="flex gap-2">
          <Button size="sm" onClick={() => openEdit(item)}>
            Edit
          </Button>
          {deleteConfirm === item.id ? (
            <div className="flex items-center gap-1">
              <Button
                size="sm"
                variant="danger"
                disabled={deleting}
                onClick={() => handleDelete(item.id)}
              >
                {deleting ? '...' : 'Yakin?'}
              </Button>
              <Button size="sm" variant="ghost" onClick={() => setDeleteConfirm(null)}>
                Batal
              </Button>
            </div>
          ) : (
            <Button size="sm" variant="danger" onClick={() => setDeleteConfirm(item.id)}>
              Hapus
            </Button>
          )}
        </div>
      ),
    },
  ];

  // ── Render ────────────────────────────────────────────────────

  if (loading) return <TableSkeleton toolbarWidth="w-40" />;

  return (
    <div className="space-y-4">
      {error && (
        <div className="rounded-lg border border-danger-200 bg-danger-50 px-4 py-3 text-sm text-danger-700">
          {error}
        </div>
      )}

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
            description="Klik 'Tambah Kategori' untuk membuat kategori artikel baru"
            action={<Button onClick={openCreate}>Tambah Kategori</Button>}
          />
        }
      />

      <Modal
        open={showModal}
        onClose={() => setShowModal(false)}
        title={editing ? 'Edit Kategori' : 'Tambah Kategori'}
      >
        <form onSubmit={handleSave} className="space-y-3">
          {error && <p className="text-sm text-danger-600">{error}</p>}

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
            required
            error={fieldErrors['slug']}
          />

          <Textarea
            label="Deskripsi"
            value={form.description}
            onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
            error={fieldErrors['description']}
          />

          <Input
            label="Urutan Tampil"
            type="number"
            value={form.displayOrder}
            onChange={(e) => setForm((f) => ({ ...f, displayOrder: e.target.value }))}
            error={fieldErrors['displayOrder']}
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
