import { useState, useEffect, useCallback, useMemo } from 'react';
import {
  createBrowserClient,
  formatCurrency,
  formatDate,
  getInvoiceBadge,
  INVOICE_STATUS_CHANGE_OPTIONS,
} from '@ahlipanggilan/shared';
import {
  Button,
  Input,
  Select,
  Modal,
  Table,
  Badge,
  EmptyState,
  CSVExportButton,
  TableSkeleton,
  Textarea,
} from '@ahlipanggilan/ui';
import type { Column } from '@ahlipanggilan/ui';

// ── Types ──────────────────────────────────────────────────────

interface InvoiceItem {
  id: string;
  companyId: string;
  companyName?: string;
  invoiceNumber: string;
  amount: string;
  status: string;
  dueDate: string;
  issuedAt: string | null;
  paidAt: string | null;
  notes: string | null;
  createdAt: string;
}

interface CompanyItem {
  id: string;
  companyName: string;
  status: string;
}

const PAGE_SIZE = 20;

const STATUS_OPTIONS = [
  { value: '', label: 'Semua Status' },
  { value: 'Draft', label: 'Draft' },
  { value: 'Issued', label: 'Diterbitkan' },
  { value: 'Paid', label: 'Lunas' },
  { value: 'Overdue', label: 'Jatuh Tempo' },
  { value: 'Cancelled', label: 'Dibatalkan' },
];

// ── Pagination Component ───────────────────────────────────────

function Pagination({
  page,
  totalPages,
  totalItems,
  onPageChange,
}: {
  page: number;
  totalPages: number;
  totalItems: number;
  onPageChange: (p: number) => void;
}) {
  if (totalPages <= 1) return null;

  // Build visible page numbers with ellipsis
  const pages: (number | 'ellipsis')[] = [];
  const start = Math.max(1, page - 2);
  const end = Math.min(totalPages, page + 2);

  if (start > 1) {
    pages.push(1);
    if (start > 2) pages.push('ellipsis');
  }
  for (let i = start; i <= end; i++) pages.push(i);
  if (end < totalPages) {
    if (end < totalPages - 1) pages.push('ellipsis');
    pages.push(totalPages);
  }

  const from = (page - 1) * PAGE_SIZE + 1;
  const to = Math.min(page * PAGE_SIZE, totalItems);

  return (
    <div className="flex flex-wrap items-center justify-between gap-4 pt-2">
      <p className="text-body-sm text-text-muted">
        Menampilkan {from}–{to} dari {totalItems} invoice
      </p>
      <nav className="flex items-center gap-1" aria-label="Navigasi halaman">
        <button
          type="button"
          disabled={page <= 1}
          onClick={() => onPageChange(page - 1)}
          className="inline-flex h-8 w-8 items-center justify-center rounded-md text-body-sm text-text-secondary transition-colors duration-150 hover:bg-neutral-100 hover:text-text-primary disabled:pointer-events-none disabled:opacity-40"
          aria-label="Halaman sebelumnya"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <path d="M15 18l-6-6 6-6" />
          </svg>
        </button>

        {pages.map((p, idx) =>
          p === 'ellipsis' ? (
            <span
              key={`e${idx}`}
              className="inline-flex h-8 w-8 items-center justify-center text-body-sm text-text-muted"
            >
              …
            </span>
          ) : (
            <button
              key={p}
              type="button"
              onClick={() => onPageChange(p)}
              className={`inline-flex h-8 w-8 items-center justify-center rounded-md text-body-sm font-medium transition-colors duration-150 ${
                p === page
                  ? 'bg-primary-500 text-white'
                  : 'text-text-secondary hover:bg-neutral-100 hover:text-text-primary'
              }`}
              aria-current={p === page ? 'page' : undefined}
            >
              {p}
            </button>
          ),
        )}

        <button
          type="button"
          disabled={page >= totalPages}
          onClick={() => onPageChange(page + 1)}
          className="inline-flex h-8 w-8 items-center justify-center rounded-md text-body-sm text-text-secondary transition-colors duration-150 hover:bg-neutral-100 hover:text-text-primary disabled:pointer-events-none disabled:opacity-40"
          aria-label="Halaman selanjutnya"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <path d="M9 18l6-6-6-6" />
          </svg>
        </button>
      </nav>
    </div>
  );
}

// ── Component ──────────────────────────────────────────────────

export function AdminInvoices() {
  const api = useMemo(() => createBrowserClient(), []);

  // Data state
  const [invoices, setInvoices] = useState<InvoiceItem[]>([]);
  const [companies, setCompanies] = useState<CompanyItem[]>([]);

  // Loading states: skeleton only on first load, progress bar on subsequent
  const [initialLoading, setInitialLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Pagination
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  // Filters
  const [companyFilter, setCompanyFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  // Create modal
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createForm, setCreateForm] = useState({
    companyId: '',
    amount: '',
    dueDate: '',
    notes: '',
  });
  const [createError, setCreateError] = useState('');
  const [creating, setCreating] = useState(false);

  // Status modal
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [statusTarget, setStatusTarget] = useState<InvoiceItem | null>(null);
  const [newStatus, setNewStatus] = useState('');
  const [statusUpdating, setStatusUpdating] = useState(false);

  // Reset to page 1 when filters change
  function handleCompanyFilter(value: string) {
    setCompanyFilter(value);
    setPage(1);
  }

  function handleStatusFilter(value: string) {
    setStatusFilter(value);
    setPage(1);
  }

  function handleResetFilters() {
    setCompanyFilter('');
    setStatusFilter('');
    setPage(1);
  }

  // ── Data loading ─────────────────────────────────────────────
  const loadData = useCallback(async () => {
    // First load → show skeleton. Subsequent loads → show progress bar.
    if (!initialLoading) setRefreshing(true);

    try {
      const params: Record<string, string | number> = {
        page,
        limit: PAGE_SIZE,
      };
      if (companyFilter) params.companyId = companyFilter;
      if (statusFilter) params.status = statusFilter;

      const [invoicesResult, companiesData] = await Promise.all([
        api.getPaginated<InvoiceItem>('/api/v1/invoices', { params }),
        api.get<CompanyItem[]>('/api/v1/companies').catch(() => []),
      ]);

      setInvoices(invoicesResult.data);
      setTotalPages(invoicesResult.pagination.totalPages);
      setTotalItems(invoicesResult.pagination.total);
      setCompanies(Array.isArray(companiesData) ? companiesData : []);
    } catch {
      setInvoices([]);
    } finally {
      setInitialLoading(false);
      setRefreshing(false);
    }
  }, [companyFilter, statusFilter, page, api, initialLoading]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // ── Create invoice ───────────────────────────────────────────
  async function handleCreate(e: React.SyntheticEvent<HTMLFormElement>) {
    e.preventDefault();
    setCreateError('');

    if (!createForm.companyId || !createForm.amount || !createForm.dueDate) {
      setCreateError('Perusahaan, jumlah, dan tanggal jatuh tempo wajib diisi');
      return;
    }

    setCreating(true);
    try {
      const body: Record<string, unknown> = {
        companyId: createForm.companyId,
        amount: Number(createForm.amount),
        dueDate: createForm.dueDate,
      };
      if (createForm.notes) body.notes = createForm.notes;

      await api.post('/api/v1/invoices', { body });
      setShowCreateModal(false);
      setCreateForm({ companyId: '', amount: '', dueDate: '', notes: '' });
      await loadData();
    } catch (err: unknown) {
      setCreateError(err instanceof Error ? err.message : 'Gagal membuat invoice');
    } finally {
      setCreating(false);
    }
  }

  // ── Update status ────────────────────────────────────────────
  function openStatusModal(item: InvoiceItem) {
    setStatusTarget(item);
    setNewStatus(item.status);
    setShowStatusModal(true);
  }

  async function handleUpdateStatus() {
    if (!statusTarget || !newStatus || newStatus === statusTarget.status) {
      setShowStatusModal(false);
      return;
    }
    setStatusUpdating(true);
    try {
      await api.patch(`/api/v1/invoices/${statusTarget.id}/status`, {
        body: { status: newStatus },
      });
      setShowStatusModal(false);
      await loadData();
    } catch {
      // silent
    } finally {
      setStatusUpdating(false);
    }
  }

  // ── Derived data ─────────────────────────────────────────────
  const outstandingInvoices = invoices.filter(
    (inv) => inv.status === 'Issued' || inv.status === 'Overdue' || inv.status === 'Draft',
  );
  const overdueInvoices = invoices.filter((inv) => inv.status === 'Overdue');
  const paidInvoices = invoices.filter((inv) => inv.status === 'Paid');

  // Build company name map for display
  const companyMap = useMemo(() => {
    const map: Record<string, string> = {};
    for (const c of companies) {
      map[c.id] = c.companyName;
    }
    return map;
  }, [companies]);

  // ── Columns ──────────────────────────────────────────────────
  const columns: Column<InvoiceItem>[] = [
    {
      key: 'invoiceNumber',
      header: 'No. Invoice',
      render: (item) => (
        <a
          href={`/dashboard/admin/invoices/${item.id}`}
          className="font-medium text-primary-600 hover:text-primary-700 hover:underline transition-colors duration-150"
        >
          {item.invoiceNumber}
        </a>
      ),
    },
    {
      key: 'companyId',
      header: 'Perusahaan',
      render: (item) => (
        <span className="font-medium text-text-primary">{companyMap[item.companyId] ?? '-'}</span>
      ),
    },
    {
      key: 'amount',
      header: 'Jumlah',
      render: (item) => (
        <span className="font-semibold text-text-primary">{formatCurrency(item.amount)}</span>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      render: (item) => {
        const { variant, label } = getInvoiceBadge(item.status);
        return <Badge variant={variant}>{label}</Badge>;
      },
    },
    {
      key: 'dueDate',
      header: 'Jatuh Tempo',
      render: (item) => (
        <span className="text-body-sm text-text-primary">
          {item.dueDate ? formatDate(item.dueDate) : '-'}
        </span>
      ),
    },
    {
      key: 'id',
      header: 'Aksi',
      render: (item) => (
        <Button size="sm" variant="ghost" onClick={() => openStatusModal(item)}>
          Ubah Status
        </Button>
      ),
    },
  ];

  if (initialLoading) return <TableSkeleton />;

  return (
    <div className="space-y-4">
      {/* ── Progress bar for page changes ────────────────────────── */}
      {refreshing && (
        <div className="h-1 w-full overflow-hidden rounded-full bg-neutral-100" aria-hidden="true">
          <div className="h-full w-full animate-loading-bar rounded-full bg-primary-500" />
        </div>
      )}

      {/* ── Summary Cards ──────────────────────────────────────── */}
      <div className="grid gap-4 sm:grid-cols-4">
        <div className="rounded-lg border border-border-default bg-bg-surface p-4 space-y-1">
          <p className="text-body-sm text-text-secondary">Total Invoice</p>
          <p className="text-h3 font-bold text-text-primary">{totalItems}</p>
        </div>
        <div className="rounded-lg border border-border-default bg-bg-surface p-4 space-y-1">
          <p className="text-body-sm text-text-secondary">Outstanding</p>
          <p className="text-h3 font-bold text-warning-600">{outstandingInvoices.length}</p>
        </div>
        <div className="rounded-lg border border-border-default bg-bg-surface p-4 space-y-1">
          <p className="text-body-sm text-text-secondary">Jatuh Tempo</p>
          <p className="text-h3 font-bold text-danger-600">{overdueInvoices.length}</p>
        </div>
        <div className="rounded-lg border border-border-default bg-bg-surface p-4 space-y-1">
          <p className="text-body-sm text-text-secondary">Lunas</p>
          <p className="text-h3 font-bold text-success-600">{paidInvoices.length}</p>
        </div>
      </div>

      {/* ── Filters + Actions ──────────────────────────────────── */}
      <div className="flex flex-wrap items-end gap-3">
        <div className="w-56">
          <Select
            label="Perusahaan"
            value={companyFilter}
            onChange={(e) => handleCompanyFilter(e.target.value)}
            options={[
              { value: '', label: 'Semua Perusahaan' },
              ...companies.map((c) => ({
                value: c.id,
                label: c.companyName,
              })),
            ]}
          />
        </div>
        <div className="w-40">
          <Select
            label="Status"
            value={statusFilter}
            onChange={(e) => handleStatusFilter(e.target.value)}
            options={STATUS_OPTIONS}
          />
        </div>
        <Button variant="ghost" onClick={handleResetFilters}>
          Reset Filter
        </Button>
        <div className="flex-1" />
        {invoices.length > 0 && (
          <CSVExportButton
            data={
              invoices.map((inv) => ({
                ...inv,
                companyName: companyMap[inv.companyId] ?? '',
              })) as unknown as Record<string, unknown>[]
            }
            columns={[
              { key: 'invoiceNumber', label: 'No. Invoice' },
              { key: 'companyName', label: 'Perusahaan' },
              {
                key: 'amount',
                label: 'Jumlah',
                format: (v) => formatCurrency(v as string),
              },
              { key: 'status', label: 'Status' },
              {
                key: 'dueDate',
                label: 'Jatuh Tempo',
                format: (v) => (v ? formatDate(v as string) : '-'),
              },
              {
                key: 'createdAt',
                label: 'Dibuat',
                format: (v) => formatDate(v as string),
              },
            ]}
            filename="invoice-export.csv"
          />
        )}
        <Button onClick={() => setShowCreateModal(true)}>Buat Invoice</Button>
      </div>

      {/* ── Table ──────────────────────────────────────────────── */}
      <Table
        data={invoices}
        columns={columns}
        keyExtractor={(item) => item.id}
        emptyState={
          <EmptyState
            title="Tidak ada invoice"
            description={
              companyFilter || statusFilter
                ? 'Tidak ada invoice yang sesuai dengan filter.'
                : 'Belum ada invoice yang dibuat. Klik "Buat Invoice" untuk membuat invoice baru.'
            }
          />
        }
      />

      {/* ── Pagination ──────────────────────────────────────────── */}
      <Pagination
        page={page}
        totalPages={totalPages}
        totalItems={totalItems}
        onPageChange={setPage}
      />

      {/* ── Create Invoice Modal ───────────────────────────────── */}
      <Modal
        open={showCreateModal}
        onClose={() => {
          setShowCreateModal(false);
          setCreateError('');
        }}
        title="Buat Invoice Baru"
      >
        <form onSubmit={handleCreate} className="space-y-4">
          {createError && (
            <div className="rounded-md border border-danger-200 bg-danger-50 px-4 py-3 text-sm text-danger-700">
              {createError}
            </div>
          )}

          <Select
            label="Perusahaan"
            value={createForm.companyId}
            onChange={(e) => setCreateForm((f) => ({ ...f, companyId: e.target.value }))}
            options={[
              { value: '', label: 'Pilih perusahaan...' },
              ...companies.map((c) => ({
                value: c.id,
                label: c.companyName,
              })),
            ]}
            required
          />

          <Input
            label="Jumlah (Rp)"
            type="number"
            min={0}
            step={1000}
            value={createForm.amount}
            onChange={(e) => setCreateForm((f) => ({ ...f, amount: e.target.value }))}
            placeholder="cth: 500000"
            required
          />

          <Input
            label="Tanggal Jatuh Tempo"
            type="date"
            value={createForm.dueDate}
            onChange={(e) => setCreateForm((f) => ({ ...f, dueDate: e.target.value }))}
            required
          />

          <Textarea
            label="Catatan"
            value={createForm.notes}
            onChange={(e) => setCreateForm((f) => ({ ...f, notes: e.target.value }))}
            placeholder="Catatan tambahan tentang invoice..."
            rows={3}
          />

          <div className="flex justify-end gap-2 pt-2">
            <Button
              variant="ghost"
              type="button"
              onClick={() => {
                setShowCreateModal(false);
                setCreateError('');
              }}
            >
              Batal
            </Button>
            <Button type="submit" disabled={creating}>
              {creating ? 'Menyimpan...' : 'Buat Invoice'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* ── Update Status Modal ────────────────────────────────── */}
      <Modal
        open={showStatusModal}
        onClose={() => setShowStatusModal(false)}
        title={`Ubah Status — ${statusTarget?.invoiceNumber ?? ''}`}
      >
        <div className="space-y-4">
          <p className="text-sm text-text-secondary">
            Status saat ini: <strong>{statusTarget?.status}</strong>
          </p>
          <Select
            label="Status Baru"
            value={newStatus}
            onChange={(e) => setNewStatus(e.target.value)}
            options={INVOICE_STATUS_CHANGE_OPTIONS}
          />
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="ghost" type="button" onClick={() => setShowStatusModal(false)}>
              Batal
            </Button>
            <Button
              type="button"
              onClick={handleUpdateStatus}
              disabled={statusUpdating || !newStatus || newStatus === statusTarget?.status}
            >
              {statusUpdating ? 'Menyimpan...' : 'Simpan'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
