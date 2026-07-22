import { useState, useEffect, useCallback, useMemo } from 'react';
import { createBrowserClient, formatCurrency, formatDate } from '@ahlipanggilan/shared';
import { Button, Badge, EmptyState, Spinner } from '@ahlipanggilan/ui';

// ── Types ─────────────────────────────────────────────────────

interface PaymentItem {
  id: string;
  orderId: string;
  method: string;
  amount: string;
  status: string;
  paymentDate: string | null;
  verifiedBy: string | null;
  verifiedAt: string | null;
  notes: string | null;
  createdAt: string;
}

interface PaymentStats {
  totalPaid: number;
  waitingVerification: number;
  failedCount: number;
}

// ── Constants ──────────────────────────────────────────────────

const PAYMENT_METHOD_LABELS: Record<string, string> = {
  Cash: 'Tunai',
  Transfer: 'Transfer',
  QRIS: 'QRIS',
  'E-Wallet': 'E-Wallet',
  Other: 'Lainnya',
};

const PAYMENT_METHOD_COLORS: Record<string, string> = {
  Cash: 'bg-success-50 text-success-600',
  Transfer: 'bg-primary-50 text-primary-600',
  QRIS: 'bg-accent-50 text-accent-600',
  'E-Wallet': 'bg-info-50 text-info-600',
  Other: 'bg-neutral-100 text-neutral-600',
};

function getPaymentBadge(status: string): {
  variant: 'warning' | 'success' | 'danger' | 'default';
  label: string;
} {
  switch (status) {
    case 'Waiting':
      return { variant: 'warning', label: 'Menunggu' };
    case 'Paid':
      return { variant: 'success', label: 'Lunas' };
    case 'Failed':
      return { variant: 'danger', label: 'Gagal' };
    case 'Refunded':
      return { variant: 'default', label: 'Refund' };
    default:
      return { variant: 'default', label: status };
  }
}

// ── Pagination ─────────────────────────────────────────────────

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

  const pages: (number | string)[] = [];
  const start = Math.max(1, page - 2);
  const end = Math.min(totalPages, page + 2);
  if (start > 1) {
    pages.push(1);
    if (start > 2) pages.push('…');
  }
  for (let i = start; i <= end; i++) pages.push(i);
  if (end < totalPages) {
    if (end < totalPages - 1) pages.push('…');
    pages.push(totalPages);
  }

  return (
    <div className="flex flex-wrap items-center justify-between gap-4 pt-4">
      <p className="text-body-sm text-text-muted">
        Menampilkan {(page - 1) * 20 + 1}–{Math.min(page * 20, totalItems)} dari {totalItems}{' '}
        pembayaran
      </p>
      <nav className="flex items-center gap-1">
        <button
          disabled={page <= 1}
          onClick={() => onPageChange(page - 1)}
          className="inline-flex h-8 w-8 items-center justify-center rounded-md text-body-sm text-text-secondary transition-colors hover:bg-neutral-100 disabled:opacity-40"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M15 18l-6-6 6-6" />
          </svg>
        </button>
        {pages.map((p, idx) =>
          p === '…' ? (
            <span key={`e${idx}`} className="text-body-sm text-text-muted">
              …
            </span>
          ) : (
            <button
              key={p as number}
              onClick={() => onPageChange(p as number)}
              className={`inline-flex h-8 w-8 items-center justify-center rounded-md text-body-sm font-medium ${
                p === page
                  ? 'bg-primary-500 text-white'
                  : 'text-text-secondary hover:bg-neutral-100'
              }`}
            >
              {p as number}
            </button>
          ),
        )}
        <button
          disabled={page >= totalPages}
          onClick={() => onPageChange(page + 1)}
          className="inline-flex h-8 w-8 items-center justify-center rounded-md text-body-sm text-text-secondary transition-colors hover:bg-neutral-100 disabled:opacity-40"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M9 18l6-6-6-6" />
          </svg>
        </button>
      </nav>
    </div>
  );
}

// ── Main Component ─────────────────────────────────────────────

export function AdminPayments() {
  const api = useMemo(() => createBrowserClient(), []);

  // State
  const [payments, setPayments] = useState<PaymentItem[]>([]);
  const [stats, setStats] = useState<PaymentStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [statusFilter, setStatusFilter] = useState('');
  const [methodFilter, setMethodFilter] = useState('');

  // Refund
  const [refundTarget, setRefundTarget] = useState<PaymentItem | null>(null);
  const [refunding, setRefunding] = useState(false);

  // ── Load data ────────────────────────────────────────────────
  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const params: Record<string, string | number> = { page, limit: 20 };
      if (statusFilter) params.status = statusFilter;
      if (methodFilter) params.method = methodFilter;

      const [result, statsData] = await Promise.all([
        api.getPaginated<PaymentItem>('/api/v1/payments', { params }).catch(() => null),
        api.get<PaymentStats>('/api/v1/payments/stats').catch(() => null),
      ]);

      if (result) {
        setPayments(result.data);
        setTotalPages(result.pagination?.totalPages ?? 1);
        setTotalItems(result.pagination?.total ?? 0);
      } else {
        setPayments([]);
        setTotalPages(1);
        setTotalItems(0);
      }
      if (statsData) setStats(statsData);
    } catch {
      setPayments([]);
    } finally {
      setLoading(false);
    }
  }, [api, page, statusFilter, methodFilter]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // ── Filter handlers ──────────────────────────────────────────
  function handleStatusFilter(value: string) {
    setStatusFilter(value);
    setPage(1);
  }

  function handleMethodFilter(value: string) {
    setMethodFilter(value);
    setPage(1);
  }

  function handleResetFilters() {
    setStatusFilter('');
    setMethodFilter('');
    setPage(1);
  }

  // ── Refund handler ───────────────────────────────────────────
  async function handleRefund() {
    if (!refundTarget) return;
    setRefunding(true);
    try {
      await api.patch(`/api/v1/payments/${refundTarget.id}/refund`);
      setRefundTarget(null);
      await loadData();
    } catch {
      // silent
    } finally {
      setRefunding(false);
    }
  }

  // ── Render ───────────────────────────────────────────────────
  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-lg border border-border-default bg-bg-surface p-4 space-y-1">
          <p className="text-caption font-medium text-text-muted">Total Lunas</p>
          <p className="text-h3 font-bold text-success">
            {stats ? formatCurrency(stats.totalPaid) : '-'}
          </p>
        </div>
        <div className="rounded-lg border border-border-default bg-bg-surface p-4 space-y-1">
          <p className="text-caption font-medium text-text-muted">Menunggu Verifikasi</p>
          <p className="text-h3 font-bold text-warning">{stats?.waitingVerification ?? 0}</p>
        </div>
        <div className="rounded-lg border border-border-default bg-bg-surface p-4 space-y-1">
          <p className="text-caption font-medium text-text-muted">Gagal</p>
          <p className="text-h3 font-bold text-danger">{stats?.failedCount ?? 0}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-end gap-3">
        <div className="w-40">
          <label className="mb-1 block text-caption font-medium text-text-muted">Status</label>
          <select
            value={statusFilter}
            onChange={(e) => handleStatusFilter(e.target.value)}
            className="h-9 w-full rounded-md border border-border-default bg-bg-surface px-2.5 text-body-sm text-text-primary outline-none focus:border-primary"
          >
            <option value="">Semua</option>
            <option value="Waiting">Menunggu</option>
            <option value="Paid">Lunas</option>
            <option value="Failed">Gagal</option>
            <option value="Refunded">Refund</option>
          </select>
        </div>
        <div className="w-36">
          <label className="mb-1 block text-caption font-medium text-text-muted">Metode</label>
          <select
            value={methodFilter}
            onChange={(e) => handleMethodFilter(e.target.value)}
            className="h-9 w-full rounded-md border border-border-default bg-bg-surface px-2.5 text-body-sm text-text-primary outline-none focus:border-primary"
          >
            <option value="">Semua</option>
            <option value="Cash">Tunai</option>
            <option value="Transfer">Transfer</option>
            <option value="QRIS">QRIS</option>
            <option value="E-Wallet">E-Wallet</option>
          </select>
        </div>
        <button
          onClick={handleResetFilters}
          className="h-9 rounded-md border border-border-default bg-bg-surface px-3 text-body-sm font-medium text-text-secondary transition-colors hover:bg-neutral-100"
        >
          Reset
        </button>
      </div>

      {/* Table */}
      <div className="rounded-xl border border-border-default bg-bg-surface overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Spinner />
          </div>
        ) : payments.length === 0 ? (
          <div className="py-16">
            <EmptyState
              title="Belum ada pembayaran"
              description={
                statusFilter || methodFilter
                  ? 'Tidak ada pembayaran yang sesuai filter.'
                  : 'Belum ada transaksi pembayaran.'
              }
            />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-body-sm">
              <thead>
                <tr className="border-b border-border-default bg-bg-page">
                  <th className="px-4 py-3 text-left font-medium text-text-secondary">Order</th>
                  <th className="px-4 py-3 text-left font-medium text-text-secondary">Metode</th>
                  <th className="px-4 py-3 text-right font-medium text-text-secondary">Jumlah</th>
                  <th className="px-4 py-3 text-left font-medium text-text-secondary">Status</th>
                  <th className="px-4 py-3 text-left font-medium text-text-secondary">Tanggal</th>
                  <th className="px-4 py-3 text-right font-medium text-text-secondary">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {payments.map((p) => {
                  const { variant, label } = getPaymentBadge(p.status);
                  const methodColors =
                    PAYMENT_METHOD_COLORS[p.method] ?? 'bg-neutral-100 text-neutral-600';
                  return (
                    <tr
                      key={p.id}
                      className="border-b border-border-default last:border-0 hover:bg-neutral-50/50 transition-colors"
                    >
                      <td className="px-4 py-3">
                        <span className="font-medium text-text-primary">
                          #{p.orderId.slice(0, 8)}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex items-center gap-1.5 rounded-md px-2 py-0.5 text-xs font-medium ${methodColors}`}
                        >
                          {PAYMENT_METHOD_LABELS[p.method] ?? p.method}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right font-semibold text-text-primary">
                        {formatCurrency(p.amount)}
                      </td>
                      <td className="px-4 py-3">
                        <Badge variant={variant}>{label}</Badge>
                      </td>
                      <td className="px-4 py-3 text-text-secondary">
                        {p.createdAt ? formatDate(p.createdAt) : '-'}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <a
                            href={`/dashboard/admin/payments/${p.id}`}
                            className="rounded-md px-2.5 py-1 text-xs font-medium text-primary transition-colors hover:bg-primary-50 inline-block"
                          >
                            Detail
                          </a>
                          {p.status === 'Paid' && (
                            <button
                              onClick={() => setRefundTarget(p)}
                              className="rounded-md px-2.5 py-1 text-xs font-medium text-danger transition-colors hover:bg-danger-50"
                            >
                              Refund
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pagination */}
      <Pagination
        page={page}
        totalPages={totalPages}
        totalItems={totalItems}
        onPageChange={setPage}
      />

      {/* Refund Confirmation */}
      {refundTarget && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4"
          onClick={() => setRefundTarget(null)}
        >
          <div
            className="w-full max-w-sm rounded-xl border border-border-default bg-bg-surface shadow-lg"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-5 py-4">
              <h3 className="text-body font-semibold text-text-primary">Konfirmasi Refund</h3>
              <p className="mt-2 text-body-sm text-text-secondary">
                Yakin ingin me-refund pembayaran{' '}
                <strong>{formatCurrency(refundTarget.amount)}</strong>? Order akan dibatalkan dan
                status refund dicatat di sistem.
              </p>
            </div>
            <div className="flex justify-end gap-2 border-t border-border-default px-5 py-3">
              <Button variant="ghost" onClick={() => setRefundTarget(null)}>
                Batal
              </Button>
              <Button onClick={handleRefund} disabled={refunding}>
                {refunding ? 'Memproses...' : 'Refund'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
