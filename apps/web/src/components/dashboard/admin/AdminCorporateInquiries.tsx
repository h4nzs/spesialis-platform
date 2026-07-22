import { useState, useEffect, useCallback, useMemo } from 'react';
import { createBrowserClient } from '@ahlipanggilan/shared';
import {
  Button,
  Table,
  Badge,
  EmptyState,
  TableSkeleton,
  Modal,
  Pagination,
} from '@ahlipanggilan/ui';
import type { Column } from '@ahlipanggilan/ui';

// ── Types ─────────────────────────────────────────────────────────

interface InquiryItem {
  id: string;
  companyName: string;
  legalName: string | null;
  email: string;
  phone: string;
  industry: string | null;
  employeeCount: number | null;
  notes: string | null;
  status: 'Pending' | 'Contacted' | 'Negotiation' | 'Converted' | 'Closed';
  handledBy: string | null;
  handledAt: string | null;
  createdAt: string;
  updatedAt: string;
}

// ── Constants ─────────────────────────────────────────────────────

const STATUS_OPTIONS = [
  { value: '', label: 'Semua Status' },
  { value: 'Pending', label: 'Pending' },
  { value: 'Contacted', label: 'Sudah Dihubungi' },
  { value: 'Negotiation', label: 'Negosiasi' },
  { value: 'Converted', label: 'Konversi' },
  { value: 'Closed', label: 'Ditutup' },
] as const;

const STATUS_VARIANT: Record<string, 'warning' | 'success' | 'danger' | 'default'> = {
  Pending: 'warning',
  Contacted: 'default',
  Negotiation: 'warning',
  Converted: 'success',
  Closed: 'default',
};

const STATUS_LABEL: Record<string, string> = {
  Pending: 'Pending',
  Contacted: 'Sudah Dihubungi',
  Negotiation: 'Negosiasi',
  Converted: 'Konversi',
  Closed: 'Ditutup',
};

const PAGE_SIZE = 20;

// ── Component ─────────────────────────────────────────────────────

export function AdminCorporateInquiries() {
  const api = useMemo(() => createBrowserClient(), []);
  const [items, setItems] = useState<InquiryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filter, setFilter] = useState<string>('');
  const [detail, setDetail] = useState<InquiryItem | null>(null);
  const [showDetail, setShowDetail] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState<InquiryItem | null>(null);
  const [newStatus, setNewStatus] = useState<string>('');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const loadData = useCallback(async () => {
    try {
      const params: Record<string, string | number> = { page, limit: PAGE_SIZE };
      if (filter) params.status = filter;
      const result = await api.getPaginated<InquiryItem>('/api/v1/corporate-inquiries', {
        params,
      });
      setItems(result.data);
      setTotalPages(result.pagination.totalPages);
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  }, [api, page, filter]);

  useEffect(() => {
    setPage(1);
  }, [filter]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // ── Detail ────────────────────────────────────────────────────

  async function openDetail(item: InquiryItem) {
    setDetail(item);
    setShowDetail(true);
  }

  // ── Status Update ─────────────────────────────────────────────

  function openStatusModal(item: InquiryItem) {
    setSelectedItem(item);
    setNewStatus(item.status);
    setNotes(item.notes ?? '');
    setShowStatusModal(true);
  }

  async function handleUpdateStatus() {
    if (!selectedItem) return;
    setSubmitting(true);
    try {
      const body: Record<string, unknown> = { status: newStatus };
      if (notes) body.notes = notes;
      await api.patch(`/api/v1/corporate-inquiries/${selectedItem.id}`, { body });
      setShowStatusModal(false);
      setSelectedItem(null);
      await loadData();
    } catch {
      // silent
    } finally {
      setSubmitting(false);
    }
  }

  // ── Columns ───────────────────────────────────────────────────

  const columns: Column<InquiryItem>[] = [
    {
      key: 'companyName',
      header: 'Perusahaan',
      render: (item) => (
        <div>
          <p className="font-medium text-text-primary">{item.companyName}</p>
          {item.legalName && <p className="text-xs text-text-muted">{item.legalName}</p>}
        </div>
      ),
    },
    {
      key: 'contact',
      header: 'Kontak',
      render: (item) => (
        <div>
          <p className="text-sm text-text-primary">{item.email}</p>
          <p className="text-xs text-text-muted">{item.phone}</p>
        </div>
      ),
    },
    {
      key: 'industry',
      header: 'Industri',
      render: (item) => (
        <span className="text-sm text-text-secondary">
          {item.industry ?? '-'}
          {item.employeeCount ? ` (${item.employeeCount} karyawan)` : ''}
        </span>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      render: (item) => (
        <Badge variant={STATUS_VARIANT[item.status] ?? 'default'}>
          {STATUS_LABEL[item.status] ?? item.status}
        </Badge>
      ),
    },
    {
      key: 'createdAt',
      header: 'Tanggal',
      render: (item) =>
        item.createdAt
          ? new Date(item.createdAt).toLocaleDateString('id-ID', {
              year: 'numeric',
              month: 'short',
              day: 'numeric',
            })
          : '-',
    },
    {
      key: 'id',
      header: 'Aksi',
      render: (item) => (
        <div className="flex gap-1.5">
          <Button size="sm" variant="secondary" onClick={() => openDetail(item)}>
            Detail
          </Button>
          <Button size="sm" onClick={() => openStatusModal(item)}>
            Update
          </Button>
        </div>
      ),
    },
  ];

  // ── Filter Counts ─────────────────────────────────────────────

  const countByStatus = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const item of items) {
      counts[item.status] = (counts[item.status] ?? 0) + 1;
    }
    return counts;
  }, [items]);

  // ── Render ────────────────────────────────────────────────────

  if (loading) return <TableSkeleton toolbarWidth="w-40" />;

  return (
    <div className="space-y-4">
      {/* ── Filter tabs ──────────────────────────────────────── */}
      <div className="flex flex-wrap items-center gap-2">
        {STATUS_OPTIONS.map((opt) => (
          <button
            key={opt.value}
            type="button"
            onClick={() => setFilter(opt.value)}
            className={`rounded-lg px-3.5 py-1.5 text-xs font-medium transition-colors ${
              filter === opt.value
                ? 'bg-primary-100 text-primary-700'
                : 'bg-neutral-100 text-text-muted hover:bg-neutral-200 hover:text-text-primary'
            }`}
          >
            {opt.label}
            {opt.value && countByStatus[opt.value] > 0 && (
              <span className="ml-1.5 inline-flex h-4 w-4 items-center justify-center rounded-full bg-danger-500 text-[10px] font-bold text-white">
                {countByStatus[opt.value]}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* ── Table ─────────────────────────────────────────────── */}
      <Table
        data={items}
        columns={columns}
        keyExtractor={(item) => item.id}
        emptyState={
          <EmptyState
            title={filter ? 'Tidak ada inquiry dengan status ini' : 'Belum ada inquiry'}
            description={
              filter
                ? `Tidak ada inquiry dengan status "${STATUS_LABEL[filter] ?? filter}". Coba filter lain.`
                : 'Inquiry dari halaman Corporate akan muncul di sini'
            }
          />
        }
      />

      {totalPages > 1 && <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />}

      {/* ── Detail Modal ──────────────────────────────────────── */}
      <Modal open={showDetail} onClose={() => setShowDetail(false)} title="Detail Inquiry">
        {detail && (
          <div className="space-y-4">
            {/* Status Badge */}
            <div className="flex items-center justify-between">
              <Badge variant={STATUS_VARIANT[detail.status] ?? 'default'}>
                {STATUS_LABEL[detail.status] ?? detail.status}
              </Badge>
              <span className="text-xs text-text-muted">
                {new Date(detail.createdAt).toLocaleDateString('id-ID', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </span>
            </div>

            {/* Company Info */}
            <div className="rounded-lg border border-border-default bg-bg-page p-4">
              <h4 className="mb-2 text-sm font-semibold text-text-primary">Data Perusahaan</h4>
              <dl className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <dt className="text-xs text-text-muted">Nama Perusahaan</dt>
                  <dd className="font-medium text-text-primary">{detail.companyName}</dd>
                </div>
                {detail.legalName && (
                  <div>
                    <dt className="text-xs text-text-muted">Nama Legal</dt>
                    <dd className="font-medium text-text-primary">{detail.legalName}</dd>
                  </div>
                )}
                <div>
                  <dt className="text-xs text-text-muted">Industri</dt>
                  <dd className="font-medium text-text-primary">{detail.industry ?? '-'}</dd>
                </div>
                <div>
                  <dt className="text-xs text-text-muted">Jumlah Karyawan</dt>
                  <dd className="font-medium text-text-primary">
                    {detail.employeeCount ? `${detail.employeeCount} orang` : '-'}
                  </dd>
                </div>
              </dl>
            </div>

            {/* Contact Info */}
            <div className="rounded-lg border border-border-default bg-bg-page p-4">
              <h4 className="mb-2 text-sm font-semibold text-text-primary">Kontak</h4>
              <dl className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <dt className="text-xs text-text-muted">Email</dt>
                  <dd className="font-medium text-text-primary">
                    <a href={`mailto:${detail.email}`} className="hover:text-primary-600 underline">
                      {detail.email}
                    </a>
                  </dd>
                </div>
                <div>
                  <dt className="text-xs text-text-muted">Telepon</dt>
                  <dd className="font-medium text-text-primary">
                    <a href={`tel:${detail.phone}`} className="hover:text-primary-600 underline">
                      {detail.phone}
                    </a>
                  </dd>
                </div>
              </dl>
            </div>

            {/* Notes */}
            {detail.notes && (
              <div className="rounded-lg border border-border-default bg-bg-page p-4">
                <h4 className="mb-2 text-sm font-semibold text-text-primary">Catatan</h4>
                <p className="whitespace-pre-wrap text-sm text-text-secondary">{detail.notes}</p>
              </div>
            )}

            {/* Actions */}
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="ghost" onClick={() => setShowDetail(false)}>
                Tutup
              </Button>
              <Button
                onClick={() => {
                  setShowDetail(false);
                  openStatusModal(detail);
                }}
              >
                Update Status
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* ── Status Update Modal ────────────────────────────────── */}
      <Modal
        open={showStatusModal}
        onClose={() => setShowStatusModal(false)}
        title={`Update Status: ${selectedItem?.companyName ?? ''}`}
      >
        {selectedItem && (
          <div className="space-y-4">
            {/* Status Select */}
            <div>
              <label className="mb-1 block text-sm font-medium text-text-primary">Status</label>
              <select
                value={newStatus}
                onChange={(e) => setNewStatus(e.target.value)}
                className="h-10 w-full rounded-lg border border-border-default bg-bg-surface px-3 text-sm text-text-primary outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/20"
              >
                {STATUS_OPTIONS.filter((o) => o.value).map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Notes */}
            <div>
              <label className="mb-1 block text-sm font-medium text-text-primary">
                Catatan Internal
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={4}
                maxLength={1000}
                className="w-full rounded-lg border border-border-default bg-bg-surface px-3 py-2 text-sm text-text-primary outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/20"
                placeholder="Hasil komunikasi, follow-up, dll..."
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button variant="ghost" onClick={() => setShowStatusModal(false)}>
                Batal
              </Button>
              <Button onClick={handleUpdateStatus} disabled={submitting}>
                {submitting ? 'Menyimpan...' : 'Simpan'}
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
