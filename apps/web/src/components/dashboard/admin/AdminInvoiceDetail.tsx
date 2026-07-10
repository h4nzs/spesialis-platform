import { useState, useEffect, useMemo } from 'react';
import {
  createBrowserClient,
  formatCurrency,
  formatDate,
  getInvoiceBadge,
  INVOICE_STATUS_CHANGE_OPTIONS,
} from '@specialist/shared';
import { Card, Badge, Button, Skeleton, EmptyState } from '@specialist/ui';

// ── Types ──────────────────────────────────────────────────────

interface InvoiceDetail {
  id: string;
  companyId: string;
  invoiceNumber: string;
  amount: string;
  status: string;
  dueDate: string;
  issuedAt: string | null;
  paidAt: string | null;
  notes: string | null;
  createdBy: string | null;
  updatedBy: string | null;
  createdAt: string;
  updatedAt: string;
}

interface CompanyInfo {
  id: string;
  companyName: string;
}

// ── Component ──────────────────────────────────────────────────

export function AdminInvoiceDetail({ id }: { id: string }) {
  const api = useMemo(() => createBrowserClient(), []);

  const [invoice, setInvoice] = useState<InvoiceDetail | null>(null);
  const [company, setCompany] = useState<CompanyInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Status update
  const [showStatusSelect, setShowStatusSelect] = useState(false);
  const [newStatus, setNewStatus] = useState('');
  const [statusUpdating, setStatusUpdating] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const [invoiceData, companiesData] = await Promise.all([
          api.get<InvoiceDetail>(`/api/v1/invoices/${id}`),
          api.get<CompanyInfo[]>('/api/v1/companies').catch(() => []),
        ]);

        if (cancelled) return;
        setInvoice(invoiceData);

        const companiesList = Array.isArray(companiesData) ? companiesData : [];
        const companyInfo = companiesList.find((c) => c.id === invoiceData.companyId);
        setCompany(companyInfo ?? null);
      } catch {
        if (!cancelled) setError('Gagal memuat detail invoice');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [id, api]);

  // ── Status update ────────────────────────────────────────────
  async function handleUpdateStatus() {
    if (!invoice || !newStatus || newStatus === invoice.status) return;
    setStatusUpdating(true);
    try {
      await api.patch(`/api/v1/invoices/${invoice.id}/status`, {
        body: { status: newStatus },
      });
      setInvoice((prev) => (prev ? { ...prev, status: newStatus } : prev));
      setShowStatusSelect(false);
    } catch {
      // silent
    } finally {
      setStatusUpdating(false);
    }
  }

  function goBack() {
    window.history.back();
  }

  // ── Loading ──────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton variant="text" className="w-24" />
        <Card padding="lg">
          <Skeleton variant="text" className="w-1/3" />
          <div className="mt-4 space-y-3">
            <Skeleton variant="text" className="w-1/2" />
            <Skeleton variant="text" className="w-2/3" />
            <Skeleton variant="text" className="w-1/4" />
          </div>
        </Card>
      </div>
    );
  }

  // ── Error ────────────────────────────────────────────────────
  if (error || !invoice) {
    return (
      <EmptyState
        title="Invoice tidak ditemukan"
        description={error || 'Invoice tidak dapat dimuat.'}
        action={<Button onClick={goBack}>Kembali</Button>}
      />
    );
  }

  const companyName = company?.companyName ?? invoice.companyId;
  const { variant: statusVariant, label: statusLabel } = getInvoiceBadge(invoice.status);

  return (
    <div className="space-y-6">
      {/* ── Back navigation ────────────────────────────────────── */}
      <button
        type="button"
        onClick={goBack}
        className="flex items-center gap-1.5 text-body-sm text-text-muted hover:text-text-primary transition-colors duration-150"
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
          <path d="M19 12H5" />
          <path d="M12 19l-7-7 7-7" />
        </svg>
        Kembali ke daftar
      </button>

      {/* ── Header ─────────────────────────────────────────────── */}
      <Card padding="lg">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-h3 text-text-primary">{invoice.invoiceNumber}</h1>
              <Badge variant={statusVariant}>{statusLabel}</Badge>
            </div>
            <p className="mt-2 text-body text-text-secondary">{companyName}</p>
          </div>
          <div className="flex shrink-0 gap-2">
            <Button
              variant="outline"
              onClick={() => {
                setNewStatus(invoice.status);
                setShowStatusSelect(!showStatusSelect);
              }}
            >
              Ubah Status
            </Button>
          </div>
        </div>

        {/* Inline status change */}
        {showStatusSelect && (
          <div className="mt-4 flex flex-wrap items-end gap-3 rounded-lg border border-border-default bg-bg-page p-4">
            <div>
              <label className="block text-caption font-medium text-text-muted mb-1">
                Status Baru
              </label>
              <select
                value={newStatus}
                onChange={(e) => setNewStatus(e.target.value)}
                className="h-10 rounded-md border border-border-default bg-bg-surface px-3 text-body-sm text-text-primary outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500"
              >
                {INVOICE_STATUS_CHANGE_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
            <Button
              onClick={handleUpdateStatus}
              disabled={statusUpdating || !newStatus || newStatus === invoice.status}
            >
              {statusUpdating ? 'Menyimpan...' : 'Simpan'}
            </Button>
            <Button variant="ghost" onClick={() => setShowStatusSelect(false)}>
              Batal
            </Button>
          </div>
        )}
      </Card>

      {/* ── Invoice Details Grid ────────────────────────────────── */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card padding="lg">
          <h3 className="mb-4 text-body font-semibold text-text-primary">Informasi Invoice</h3>
          <dl className="space-y-4">
            <div>
              <dt className="text-caption font-medium text-text-muted">No. Invoice</dt>
              <dd className="mt-0.5 text-body-sm font-semibold text-text-primary">
                {invoice.invoiceNumber}
              </dd>
            </div>
            <div>
              <dt className="text-caption font-medium text-text-muted">Perusahaan</dt>
              <dd className="mt-0.5 text-body-sm font-semibold text-text-primary">{companyName}</dd>
            </div>
            <div>
              <dt className="text-caption font-medium text-text-muted">Jumlah</dt>
              <dd className="mt-0.5 text-h4 font-bold text-text-primary">
                {formatCurrency(invoice.amount)}
              </dd>
            </div>
            <div>
              <dt className="text-caption font-medium text-text-muted">Status</dt>
              <dd className="mt-0.5">
                <Badge variant={statusVariant}>{statusLabel}</Badge>
              </dd>
            </div>
          </dl>
        </Card>

        <Card padding="lg">
          <h3 className="mb-4 text-body font-semibold text-text-primary">Tanggal Penting</h3>
          <dl className="space-y-4">
            <div>
              <dt className="text-caption font-medium text-text-muted">Tanggal Jatuh Tempo</dt>
              <dd className="mt-0.5 text-body-sm font-semibold text-text-primary">
                {invoice.dueDate ? formatDate(invoice.dueDate) : '-'}
              </dd>
            </div>
            <div>
              <dt className="text-caption font-medium text-text-muted">Diterbitkan</dt>
              <dd className="mt-0.5 text-body-sm text-text-primary">
                {invoice.issuedAt ? formatDate(invoice.issuedAt) : '-'}
              </dd>
            </div>
            <div>
              <dt className="text-caption font-medium text-text-muted">Dibayar</dt>
              <dd className="mt-0.5 text-body-sm text-text-primary">
                {invoice.paidAt ? formatDate(invoice.paidAt) : '-'}
              </dd>
            </div>
            <div>
              <dt className="text-caption font-medium text-text-muted">Dibuat</dt>
              <dd className="mt-0.5 text-body-sm text-text-primary">
                {formatDate(invoice.createdAt)}
              </dd>
            </div>
          </dl>
        </Card>
      </div>

      {/* ── Notes ───────────────────────────────────────────────── */}
      {invoice.notes && (
        <Card padding="lg">
          <h3 className="mb-3 text-body font-semibold text-text-primary">Catatan</h3>
          <p className="text-body text-text-secondary whitespace-pre-wrap">{invoice.notes}</p>
        </Card>
      )}

      {/* ── Status Timeline ─────────────────────────────────────── */}
      <Card padding="lg">
        <h3 className="mb-4 text-body font-semibold text-text-primary">Riwayat Status</h3>
        <div className="space-y-4">
          {/* Created */}
          <div className="flex gap-3">
            <div className="flex flex-col items-center">
              <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary-100 text-primary-600">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                >
                  <path d="M20 6 9 17l-5-5" />
                </svg>
              </div>
              <div className="mt-1 h-full w-px bg-border-default" />
            </div>
            <div className="pb-4">
              <p className="text-body-sm font-semibold text-text-primary">Dibuat</p>
              <p className="text-caption text-text-muted">{formatDate(invoice.createdAt)}</p>
            </div>
          </div>

          {/* Issued */}
          {invoice.issuedAt && (
            <div className="flex gap-3">
              <div className="flex flex-col items-center">
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-warning-100 text-warning-600">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  >
                    <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
                    <polyline points="14 2 14 8 20 8" />
                  </svg>
                </div>
                <div className="mt-1 h-full w-px bg-border-default" />
              </div>
              <div className="pb-4">
                <p className="text-body-sm font-semibold text-text-primary">Diterbitkan</p>
                <p className="text-caption text-text-muted">{formatDate(invoice.issuedAt)}</p>
              </div>
            </div>
          )}

          {/* Paid */}
          {invoice.paidAt && (
            <div className="flex gap-3">
              <div className="flex flex-col items-center">
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-success-100 text-success-600">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  >
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                  </svg>
                </div>
              </div>
              <div>
                <p className="text-body-sm font-semibold text-text-primary">Lunas</p>
                <p className="text-caption text-text-muted">{formatDate(invoice.paidAt)}</p>
              </div>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}
