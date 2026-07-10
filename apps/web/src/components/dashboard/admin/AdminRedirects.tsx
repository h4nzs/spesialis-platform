import { useState, useEffect, useCallback, useMemo } from 'react';
import { createBrowserClient } from '@specialist/shared';
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
  ConfirmDialog,
  Pagination,
  CSVExportButton,
} from '@specialist/ui';
import type { Column } from '@specialist/ui';

// ── Types ──────────────────────────────────────────────────────

interface RedirectItem {
  id: string;
  sourcePath: string;
  targetPath: string;
  statusCode: number;
  hitCount: number;
  isActive: boolean;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}

interface RedirectForm {
  sourcePath: string;
  targetPath: string;
  statusCode: string;
  isActive: boolean;
  notes: string;
}

const EMPTY_FORM: RedirectForm = {
  sourcePath: '',
  targetPath: '',
  statusCode: '301',
  isActive: true,
  notes: '',
};

const STATUS_CODE_OPTIONS = [
  { value: '301', label: '301 — Permanent' },
  { value: '302', label: '302 — Temporary' },
];

const PAGE_SIZE = 20;

// ── Helpers ────────────────────────────────────────────────────

function formatDate(dateStr: string | Date): string {
  const d = typeof dateStr === 'string' ? new Date(dateStr) : dateStr;
  return d.toLocaleDateString('id-ID', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

// ── Component ──────────────────────────────────────────────────

export function AdminRedirects() {
  const api = useMemo(() => createBrowserClient(), []);

  const [items, setItems] = useState<RedirectItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [initialLoading, setInitialLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState('');

  // Form modal
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<RedirectForm>(EMPTY_FORM);
  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Delete confirm
  const [deleteTarget, setDeleteTarget] = useState<RedirectItem | null>(null);
  const [deleting, setDeleting] = useState(false);

  // ── Load data ──────────────────────────────────────────────
  const loadData = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const { data: rawData, pagination } = await api.getPaginated<Record<string, unknown>>(
        '/api/v1/admin/redirects',
        { params: { page, limit: PAGE_SIZE, search: search || undefined } },
      );

      const mapped: RedirectItem[] = (Array.isArray(rawData) ? rawData : []).map((d) => ({
        id: (d.id as string) ?? '',
        sourcePath: (d.sourcePath as string) ?? '',
        targetPath: (d.targetPath as string) ?? '',
        statusCode: (d.statusCode as number) ?? 301,
        hitCount: (d.hitCount as number) ?? 0,
        isActive: (d.isActive as boolean) ?? true,
        notes: (d.notes as string) ?? null,
        createdAt: (d.createdAt as string) ?? '',
        updatedAt: (d.updatedAt as string) ?? '',
      }));

      setItems(mapped);
      setTotal(pagination?.total ?? 0);
    } catch {
      setError('Gagal memuat data redirect');
      setItems([]);
    } finally {
      setLoading(false);
      setInitialLoading(false);
    }
  }, [api, page, search]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // ── Search handler ─────────────────────────────────────────
  const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
    setPage(1);
  }, []);

  // ── Form handlers ──────────────────────────────────────────
  function openCreate() {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setFormError('');
    setShowForm(true);
  }

  function openEdit(item: RedirectItem) {
    setEditingId(item.id);
    setForm({
      sourcePath: item.sourcePath,
      targetPath: item.targetPath,
      statusCode: String(item.statusCode),
      isActive: item.isActive,
      notes: item.notes ?? '',
    });
    setFormError('');
    setShowForm(true);
  }

  async function handleSave() {
    if (!form.sourcePath || !form.targetPath) {
      setFormError('Source path dan target path wajib diisi');
      return;
    }
    setSubmitting(true);
    setFormError('');
    try {
      const body = {
        sourcePath: form.sourcePath,
        targetPath: form.targetPath,
        statusCode: Number(form.statusCode),
        isActive: form.isActive,
        notes: form.notes || undefined,
      };

      if (editingId) {
        await api.patch(`/api/v1/admin/redirects/${editingId}`, { body });
      } else {
        await api.post('/api/v1/admin/redirects', { body });
      }
      setShowForm(false);
      await loadData();
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Gagal menyimpan redirect');
    } finally {
      setSubmitting(false);
    }
  }

  // ── Delete handler ─────────────────────────────────────────
  async function handleDelete() {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await api.delete(`/api/v1/admin/redirects/${deleteTarget.id}`);
      setDeleteTarget(null);
      await loadData();
    } catch {
      setError('Gagal menghapus redirect');
    } finally {
      setDeleting(false);
    }
  }

  // ── Toggle active ─────────────────────────────────────────
  async function handleToggleActive(item: RedirectItem) {
    try {
      await api.patch(`/api/v1/admin/redirects/${item.id}`, {
        body: { isActive: !item.isActive },
      });
      await loadData();
    } catch {
      setError('Gagal mengubah status redirect');
    }
  }

  // ── Pagination ─────────────────────────────────────────────
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  // ── Columns ─────────────────────────────────────────────────
  const columns: Column<RedirectItem>[] = [
    {
      key: 'sourcePath',
      header: 'Source Path',
      render: (item) => (
        <code className="text-xs text-text-primary font-mono bg-neutral-100 px-1.5 py-0.5 rounded">
          {item.sourcePath}
        </code>
      ),
    },
    {
      key: 'targetPath',
      header: 'Target Path',
      render: (item) => (
        <span
          className="text-sm text-text-secondary max-w-[250px] block truncate"
          title={item.targetPath}
        >
          {item.targetPath}
        </span>
      ),
    },
    {
      key: 'statusCode',
      header: 'Status',
      render: (item) => (
        <Badge variant={item.statusCode === 301 ? 'success' : 'warning'}>{item.statusCode}</Badge>
      ),
    },
    {
      key: 'hitCount',
      header: 'Hit',
      render: (item) => (
        <span className="text-sm text-text-muted font-mono tabular-nums">{item.hitCount}</span>
      ),
    },
    {
      key: 'isActive',
      header: 'Aktif',
      render: (item) => (
        <Badge variant={item.isActive ? 'success' : 'default'}>
          {item.isActive ? 'Aktif' : 'Nonaktif'}
        </Badge>
      ),
    },
    {
      key: 'updatedAt',
      header: 'Terakhir',
      render: (item) => (
        <span className="text-sm text-text-muted">{formatDate(item.updatedAt)}</span>
      ),
    },
    {
      key: 'id',
      header: 'Aksi',
      render: (item) => (
        <div className="flex gap-1">
          <Button size="sm" variant="ghost" onClick={() => openEdit(item)}>
            Edit
          </Button>
          <Button size="sm" variant="ghost" onClick={() => handleToggleActive(item)}>
            {item.isActive ? 'Nonaktifkan' : 'Aktifkan'}
          </Button>
          <Button size="sm" variant="danger" onClick={() => setDeleteTarget(item)}>
            Hapus
          </Button>
        </div>
      ),
    },
  ];

  if (initialLoading) return <TableSkeleton />;

  return (
    <div className="space-y-4">
      {error && (
        <div className="rounded-lg border border-danger-200 bg-danger-50 px-4 py-3 text-sm text-danger-700">
          {error}
        </div>
      )}

      {/* ── Filters + Actions ──────────────────────────────────── */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-64">
            <Input
              placeholder="Cari source atau target path..."
              value={search}
              onChange={handleSearchChange}
            />
          </div>
          {total > 0 && <span className="text-sm text-text-muted">{total} redirect</span>}
        </div>
        <div className="flex items-center gap-2">
          {items.length > 0 && (
            <CSVExportButton
              data={items as unknown as Record<string, unknown>[]}
              columns={[
                { key: 'sourcePath', label: 'Source Path' },
                { key: 'targetPath', label: 'Target Path' },
                {
                  key: 'statusCode',
                  label: 'Status',
                  format: (v) => String(v),
                },
                {
                  key: 'hitCount',
                  label: 'Hit Count',
                  format: (v) => String(v),
                },
                {
                  key: 'isActive',
                  label: 'Active',
                  format: (v) => (v ? 'Yes' : 'No'),
                },
                { key: 'notes', label: 'Notes' },
              ]}
              filename="redirect-export.csv"
            />
          )}
          <Button onClick={openCreate}>Tambah Redirect</Button>
        </div>
      </div>

      {/* ── Table ───────────────────────────────────────────────── */}
      {loading && !initialLoading ? (
        <TableSkeleton />
      ) : (
        <Table
          columns={columns}
          data={items}
          keyExtractor={(item) => item.id}
          emptyState={
            <EmptyState
              title={search ? 'Tidak ada redirect yang cocok' : 'Belum ada redirect'}
              description={
                search
                  ? 'Coba gunakan kata kunci lain'
                  : 'Tambahkan redirect untuk mengalihkan URL yang rusak atau dihapus'
              }
            />
          }
        />
      )}

      {/* ── Pagination ─────────────────────────────────────────── */}
      {totalPages > 1 && <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />}

      {/* ── Form Modal ─────────────────────────────────────────── */}
      <Modal
        open={showForm}
        onClose={() => setShowForm(false)}
        title={editingId ? 'Edit Redirect' : 'Tambah Redirect Baru'}
      >
        <div className="space-y-4">
          {formError && (
            <div className="rounded-lg border border-danger-200 bg-danger-50 px-3 py-2 text-sm text-danger-700">
              {formError}
            </div>
          )}

          <Input
            label="Source Path"
            value={form.sourcePath}
            onChange={(e) => setForm((f) => ({ ...f, sourcePath: e.target.value }))}
            placeholder="/lama/halaman-rusak"
            required
          />
          <p className="-mt-2 text-xs text-text-muted">
            Path URL yang akan dialihkan. Contoh: /artikel-lama
          </p>

          <Input
            label="Target Path"
            value={form.targetPath}
            onChange={(e) => setForm((f) => ({ ...f, targetPath: e.target.value }))}
            placeholder="/baru/halaman-baru"
            required
          />
          <p className="-mt-2 text-xs text-text-muted">
            URL tujuan redirect. Bisa path relatif atau URL absolut
          </p>

          <Select
            label="Tipe Redirect"
            value={form.statusCode}
            onChange={(e) => setForm((f) => ({ ...f, statusCode: e.target.value }))}
            options={STATUS_CODE_OPTIONS}
          />

          <label className="flex items-center gap-2 text-sm font-medium text-text-primary">
            <input
              type="checkbox"
              checked={form.isActive}
              onChange={(e) => setForm((f) => ({ ...f, isActive: e.target.checked }))}
              className="rounded border-border-default"
            />
            Redirect aktif
          </label>

          <Textarea
            label="Catatan (opsional)"
            value={form.notes}
            onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
            placeholder="Alasan redirect, referensi, dll."
          />

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="ghost" type="button" onClick={() => setShowForm(false)}>
              Batal
            </Button>
            <Button type="button" onClick={handleSave} disabled={submitting}>
              {submitting ? 'Menyimpan...' : editingId ? 'Simpan Perubahan' : 'Tambah Redirect'}
            </Button>
          </div>
        </div>
      </Modal>

      {/* ── Delete Confirmation ────────────────────────────────── */}
      <ConfirmDialog
        open={!!deleteTarget}
        onCancel={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Hapus Redirect"
        confirmVariant="danger"
        loading={deleting}
      >
        <p>
          Hapus redirect <strong>{deleteTarget?.sourcePath}</strong> →{' '}
          <strong>{deleteTarget?.targetPath}</strong>?
        </p>
        <p className="mt-1 text-sm text-text-secondary">Tindakan ini tidak dapat dibatalkan.</p>
      </ConfirmDialog>
    </div>
  );
}
