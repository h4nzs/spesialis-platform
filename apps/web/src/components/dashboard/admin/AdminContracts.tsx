import { useState, useEffect, useCallback, useMemo } from 'react';
import {
  createBrowserClient,
  formatDate,
  formatDateRange,
  getContractStatusBadge,
  isExpiringSoon,
  CONTRACT_STATUS_CHANGE_OPTIONS,
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

const PAGE_SIZE = 20;

// ── Types ──────────────────────────────────────────────────────

interface ContractItem {
  id: string;
  companyId: string;
  companyName?: string;
  contractNumber: string;
  startDate: string;
  endDate: string | null;
  status: string;
  slaResponseHours: number | null;
  slaResolutionHours: number | null;
  notes: string | null;
  createdAt: string;
}

interface CompanyItem {
  id: string;
  companyName: string;
  status: string;
}

const STATUS_OPTIONS = [
  { value: '', label: 'Semua Status' },
  { value: 'Draft', label: 'Draft' },
  { value: 'Active', label: 'Aktif' },
  { value: 'Expired', label: 'Kadaluarsa' },
  { value: 'Terminated', label: 'Dihentikan' },
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
        Menampilkan {from}–{to} dari {totalItems} kontrak
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

export function AdminContracts() {
  const api = useMemo(() => createBrowserClient(), []);

  // Data state
  const [contracts, setContracts] = useState<ContractItem[]>([]);
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
    startDate: '',
    endDate: '',
    slaResponseHours: '',
    slaResolutionHours: '',
    notes: '',
  });
  const [createError, setCreateError] = useState('');
  const [creating, setCreating] = useState(false);

  // Status modal
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [statusTarget, setStatusTarget] = useState<ContractItem | null>(null);
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

      const [contractsResult, companiesData] = await Promise.all([
        api.getPaginated<ContractItem>('/api/v1/contracts', { params }),
        api.get<CompanyItem[]>('/api/v1/companies').catch(() => []),
      ]);

      setContracts(contractsResult.data);
      setTotalPages(contractsResult.pagination.totalPages);
      setTotalItems(contractsResult.pagination.total);
      setCompanies(Array.isArray(companiesData) ? companiesData : []);
    } catch {
      setContracts([]);
    } finally {
      setInitialLoading(false);
      setRefreshing(false);
    }
  }, [companyFilter, statusFilter, page, api, initialLoading]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // ── Create contract ──────────────────────────────────────────
  async function handleCreate(e: React.SyntheticEvent<HTMLFormElement>) {
    e.preventDefault();
    setCreateError('');

    if (!createForm.companyId || !createForm.startDate || !createForm.endDate) {
      setCreateError('Perusahaan, tanggal mulai, dan tanggal berakhir wajib diisi');
      return;
    }

    setCreating(true);
    try {
      const body: Record<string, unknown> = {
        companyId: createForm.companyId,
        startDate: createForm.startDate,
        endDate: createForm.endDate,
      };
      if (createForm.slaResponseHours) body.slaResponseHours = Number(createForm.slaResponseHours);
      if (createForm.slaResolutionHours)
        body.slaResolutionHours = Number(createForm.slaResolutionHours);
      if (createForm.notes) body.notes = createForm.notes;

      await api.post('/api/v1/contracts', { body });
      setShowCreateModal(false);
      setCreateForm({
        companyId: '',
        startDate: '',
        endDate: '',
        slaResponseHours: '',
        slaResolutionHours: '',
        notes: '',
      });
      await loadData();
    } catch (err: unknown) {
      setCreateError(err instanceof Error ? err.message : 'Gagal membuat kontrak');
    } finally {
      setCreating(false);
    }
  }

  // ── Update status ────────────────────────────────────────────
  function openStatusModal(item: ContractItem) {
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
      await api.patch(`/api/v1/contracts/${statusTarget.id}/status`, {
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
  const activeContracts = contracts.filter((c) => c.status.toLowerCase() === 'active');

  // Build company name map for display
  const companyMap = useMemo(() => {
    const map: Record<string, string> = {};
    for (const c of companies) {
      map[c.id] = c.companyName;
    }
    return map;
  }, [companies]);

  // ── Columns ──────────────────────────────────────────────────
  const columns: Column<ContractItem>[] = [
    {
      key: 'contractNumber',
      header: 'No. Kontrak',
      render: (item) => (
        <a
          href={`/dashboard/admin/contracts/${item.id}`}
          className="font-medium text-primary-600 hover:text-primary-700 hover:underline transition-colors duration-150"
        >
          {item.contractNumber}
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
      key: 'startDate',
      header: 'Periode',
      render: (item) => (
        <span className="text-body-sm text-text-primary">
          {formatDateRange(item.startDate, item.endDate)}
        </span>
      ),
    },
    {
      key: 'slaResponseHours',
      header: 'SLA Respon',
      render: (item) => (item.slaResponseHours ? `${item.slaResponseHours} jam` : '-'),
    },
    {
      key: 'status',
      header: 'Status',
      render: (item) => {
        const { variant, label } = getContractStatusBadge(item.status);
        return (
          <div className="flex items-center gap-2">
            <Badge variant={variant}>{label}</Badge>
            {isExpiringSoon(item.endDate) && (
              <span className="text-caption font-medium text-warning-600">Segera berakhir</span>
            )}
          </div>
        );
      },
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
      {/* ── Progress bar for filter changes ──────────────────────── */}
      {refreshing && (
        <div className="h-1 w-full overflow-hidden rounded-full bg-neutral-100" aria-hidden="true">
          <div className="h-full w-full animate-loading-bar rounded-full bg-primary-500" />
        </div>
      )}

      {/* ── Summary Cards ──────────────────────────────────────── */}
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-lg border border-border-default bg-bg-surface p-4 space-y-1">
          <p className="text-body-sm text-text-secondary">Total Kontrak</p>
          <p className="text-h3 font-bold text-text-primary">{totalItems}</p>
        </div>
        <div className="rounded-lg border border-border-default bg-bg-surface p-4 space-y-1">
          <p className="text-body-sm text-text-secondary">Aktif</p>
          <p className="text-h3 font-bold text-success-600">{activeContracts.length}</p>
        </div>
        <div className="rounded-lg border border-border-default bg-bg-surface p-4 space-y-1">
          <p className="text-body-sm text-text-secondary">Kadaluarsa</p>
          <p className="text-h3 font-bold text-danger-600">
            {contracts.filter((c) => c.status.toLowerCase() === 'expired').length}
          </p>
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
        {contracts.length > 0 && (
          <CSVExportButton
            data={
              contracts.map((c) => ({
                ...c,
                companyName: companyMap[c.companyId] ?? '',
              })) as unknown as Record<string, unknown>[]
            }
            columns={[
              { key: 'contractNumber', label: 'No. Kontrak' },
              { key: 'companyName', label: 'Perusahaan' },
              {
                key: 'startDate',
                label: 'Mulai',
                format: (v) => formatDate(v as string),
              },
              {
                key: 'endDate',
                label: 'Berakhir',
                format: (v) => (v ? formatDate(v as string) : '-'),
              },
              {
                key: 'slaResponseHours',
                label: 'SLA Respon (jam)',
                format: (v) => (v ? String(v) : '-'),
              },
              {
                key: 'slaResolutionHours',
                label: 'SLA Penyelesaian (jam)',
                format: (v) => (v ? String(v) : '-'),
              },
              { key: 'status', label: 'Status' },
              { key: 'notes', label: 'Catatan', format: (v) => (v as string) ?? '' },
            ]}
            filename="kontrak-export.csv"
          />
        )}
        <Button onClick={() => setShowCreateModal(true)}>Buat Kontrak</Button>
      </div>

      {/* ── Table ──────────────────────────────────────────────── */}
      <Table
        data={contracts}
        columns={columns}
        keyExtractor={(item) => item.id}
        emptyState={
          <EmptyState
            title="Tidak ada kontrak"
            description={
              companyFilter || statusFilter
                ? 'Tidak ada kontrak yang sesuai dengan filter.'
                : 'Belum ada kontrak yang dibuat. Klik "Buat Kontrak" untuk membuat kontrak baru.'
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

      {/* ── Create Contract Modal ──────────────────────────────── */}
      <Modal
        open={showCreateModal}
        onClose={() => {
          setShowCreateModal(false);
          setCreateError('');
        }}
        title="Buat Kontrak Baru"
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

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Tanggal Mulai"
              type="date"
              value={createForm.startDate}
              onChange={(e) => setCreateForm((f) => ({ ...f, startDate: e.target.value }))}
              required
            />
            <Input
              label="Tanggal Berakhir"
              type="date"
              value={createForm.endDate}
              onChange={(e) => setCreateForm((f) => ({ ...f, endDate: e.target.value }))}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="SLA Respon (jam)"
              type="number"
              min={0}
              value={createForm.slaResponseHours}
              onChange={(e) => setCreateForm((f) => ({ ...f, slaResponseHours: e.target.value }))}
              placeholder="cth: 4"
            />
            <Input
              label="SLA Penyelesaian (jam)"
              type="number"
              min={0}
              value={createForm.slaResolutionHours}
              onChange={(e) => setCreateForm((f) => ({ ...f, slaResolutionHours: e.target.value }))}
              placeholder="cth: 24"
            />
          </div>

          <Textarea
            label="Catatan"
            value={createForm.notes}
            onChange={(e) => setCreateForm((f) => ({ ...f, notes: e.target.value }))}
            placeholder="Catatan tambahan tentang kontrak..."
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
              {creating ? 'Menyimpan...' : 'Buat Kontrak'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* ── Update Status Modal ────────────────────────────────── */}
      <Modal
        open={showStatusModal}
        onClose={() => setShowStatusModal(false)}
        title={`Ubah Status — ${statusTarget?.contractNumber ?? ''}`}
      >
        <div className="space-y-4">
          <p className="text-sm text-text-secondary">
            Status saat ini: <strong>{statusTarget?.status}</strong>
          </p>
          <Select
            label="Status Baru"
            value={newStatus}
            onChange={(e) => setNewStatus(e.target.value)}
            options={CONTRACT_STATUS_CHANGE_OPTIONS}
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
