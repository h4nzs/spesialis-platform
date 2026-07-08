import { useState, useEffect, useCallback, useMemo } from 'react';
import { createBrowserClient, downloadCSV } from '@specialist/shared';
import { Button, Input, Select, Textarea, Modal, Table, Badge } from '@specialist/ui';
import type { Column } from '@specialist/ui';

interface ArticleItem {
  id: string;
  categoryId: string | null;
  categoryName: string | null;
  title: string;
  slug: string;
  summary: string | null;
  authorName: string | null;
  status: string;
  isFeatured: boolean;
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

interface CategoryItem {
  id: string;
  name: string;
  slug: string;
}

interface ArticleForm {
  categoryId: string;
  title: string;
  slug: string;
  summary: string;
  content: string;
  coverImage: string;
  authorName: string;
  status: string;
  isFeatured: boolean;
}

const EMPTY_FORM: ArticleForm = {
  categoryId: '',
  title: '',
  slug: '',
  summary: '',
  content: '',
  coverImage: '',
  authorName: '',
  status: 'Draft',
  isFeatured: false,
};

const STATUS_OPTIONS = [
  { value: 'Draft', label: 'Draft' },
  { value: 'Review', label: 'Review' },
  { value: 'Published', label: 'Published' },
  { value: 'Archived', label: 'Archived' },
];

export function AdminArticles() {
  const api = useMemo(() => createBrowserClient(), []);
  const [articles, setArticles] = useState<ArticleItem[]>([]);
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<string | null>(null);
  const [form, setForm] = useState<ArticleForm>(EMPTY_FORM);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const loadData = useCallback(async () => {
    try {
      const [arts, cats] = await Promise.all([
        api.get<{ data: ArticleItem[] }>('/api/v1/admin/articles', { params: { limit: 100 } }),
        api.get<{ data: CategoryItem[] }>('/api/v1/admin/articles/categories'),
      ]);
      setArticles(Array.isArray(arts) ? arts : (arts?.data ?? []));
      setCategories(Array.isArray(cats) ? cats : (cats?.data ?? []));
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

  async function openEdit(item: ArticleItem) {
    setEditing(item.id);
    setError('');
    try {
      const detail = await api.get<ArticleItem>(`/api/v1/admin/articles/${item.id}`);
      setForm({
        categoryId: detail.categoryId ?? '',
        title: detail.title ?? '',
        slug: detail.slug ?? '',
        summary: detail.summary ?? '',
        content: '',
        coverImage: '',
        authorName: detail.authorName ?? '',
        status: detail.status ?? 'Draft',
        isFeatured: detail.isFeatured ?? false,
      });
      setShowModal(true);
    } catch {
      setError('Gagal memuat detail artikel');
    }
  }

  async function handleSave(e: React.SyntheticEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!form.title || !form.slug) {
      setError('Judul dan slug wajib diisi');
      return;
    }
    setSubmitting(true);
    setError('');
    try {
      const body = {
        categoryId: form.categoryId || undefined,
        title: form.title,
        slug: form.slug,
        summary: form.summary || undefined,
        content: form.content || undefined,
        coverImage: form.coverImage || undefined,
        authorName: form.authorName || undefined,
        status: form.status,
        isFeatured: form.isFeatured,
      };

      if (editing) {
        await api.patch(`/api/v1/admin/articles/${editing}`, { body });
      } else {
        await api.post('/api/v1/admin/articles', { body });
      }
      setShowModal(false);
      await loadData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gagal menyimpan artikel');
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(item: ArticleItem) {
    if (!confirm(`Hapus artikel "${item.title}"?`)) return;
    try {
      await api.delete(`/api/v1/admin/articles/${item.id}`);
      await loadData();
    } catch {
      // silent
    }
  }

  const columns: Column<ArticleItem>[] = [
    {
      key: 'title',
      header: 'Judul',
      render: (item) => (
        <div>
          <span className="font-medium text-text">{item.title}</span>
          <span className="ml-2 text-xs text-text-muted">({item.slug})</span>
        </div>
      ),
    },
    { key: 'categoryName', header: 'Kategori', render: (item) => item.categoryName ?? '-' },
    { key: 'authorName', header: 'Penulis', render: (item) => item.authorName ?? '-' },
    {
      key: 'status',
      header: 'Status',
      render: (item) => {
        const variant =
          item.status === 'Published'
            ? 'success'
            : item.status === 'Review'
              ? 'warning'
              : 'default';
        return <Badge variant={variant}>{item.status}</Badge>;
      },
    },
    {
      key: 'isFeatured',
      header: 'Featured',
      render: (item) => (item.isFeatured ? '⭐' : '-'),
    },
    {
      key: 'publishedAt',
      header: 'Terbit',
      render: (item) =>
        item.publishedAt ? new Date(item.publishedAt).toLocaleDateString('id-ID') : '-',
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
            Hapus
          </Button>
        </div>
      ),
    },
  ];

  function handleExportCSV() {
    const headers = ['Judul', 'Slug', 'Kategori', 'Penulis', 'Status', 'Featured', 'Terbit'];
    const rows = articles.map((a) => [
      a.title,
      a.slug,
      a.categoryName ?? '-',
      a.authorName ?? '-',
      a.status,
      a.isFeatured ? 'Ya' : 'Tidak',
      a.publishedAt ? new Date(a.publishedAt).toLocaleDateString('id-ID') : '-',
    ]);
    downloadCSV(headers, rows, 'artikel-export.csv');
  }

  if (loading) return <div className="text-sm text-text-muted py-8 text-center">Memuat...</div>;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-end gap-2">
        {articles.length > 0 && (
          <button
            type="button"
            onClick={handleExportCSV}
            className="inline-flex items-center gap-1.5 rounded-md border border-border bg-background px-3 py-1.5 text-sm font-medium text-text transition-colors hover:bg-surface"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="shrink-0"
            >
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="7 10 12 15 17 10" />
              <line x1="12" y1="15" x2="12" y2="3" />
            </svg>
            Export CSV
          </button>
        )}
        <Button onClick={openCreate}>Tulis Artikel</Button>
      </div>

      <Table
        data={articles}
        columns={columns}
        keyExtractor={(item) => item.id}
        emptyMessage="Belum ada artikel"
      />

      <Modal
        open={showModal}
        onClose={() => setShowModal(false)}
        title={editing ? 'Edit Artikel' : 'Tulis Artikel'}
      >
        <form onSubmit={handleSave} className="space-y-3">
          {error && <p className="text-sm text-danger">{error}</p>}

          <Input
            label="Judul"
            value={form.title}
            onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
            required
          />

          <Input
            label="Slug"
            value={form.slug}
            onChange={(e) => setForm((f) => ({ ...f, slug: e.target.value }))}
            placeholder="judul-artikel"
            required
          />

          <div className="grid grid-cols-2 gap-3">
            <Select
              label="Kategori"
              value={form.categoryId}
              onChange={(e) => setForm((f) => ({ ...f, categoryId: e.target.value }))}
              options={categories.map((c) => ({ value: c.id, label: c.name }))}
              placeholder="Pilih kategori"
            />
            <Select
              label="Status"
              value={form.status}
              onChange={(e) => setForm((f) => ({ ...f, status: e.target.value }))}
              options={STATUS_OPTIONS}
            />
          </div>

          <Input
            label="Nama Penulis"
            value={form.authorName}
            onChange={(e) => setForm((f) => ({ ...f, authorName: e.target.value }))}
          />

          <Input
            label="URL Gambar Sampul"
            value={form.coverImage}
            onChange={(e) => setForm((f) => ({ ...f, coverImage: e.target.value }))}
            placeholder="https://..."
          />

          <Textarea
            label="Ringkasan"
            value={form.summary}
            onChange={(e) => setForm((f) => ({ ...f, summary: e.target.value }))}
          />

          <Textarea
            label="Konten"
            value={form.content}
            onChange={(e) => setForm((f) => ({ ...f, content: e.target.value }))}
            rows={12}
          />

          <div className="flex items-center gap-2">
            <label className="flex items-center gap-2 text-sm text-text">
              <input
                type="checkbox"
                checked={form.isFeatured}
                onChange={(e) => setForm((f) => ({ ...f, isFeatured: e.target.checked }))}
                className="rounded border-border"
              />
              Featured
            </label>
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
    </div>
  );
}
