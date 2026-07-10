import { useState, useEffect, useMemo } from 'react';
import {
  createBrowserClient,
  formatDate,
  formatDateRange,
  getContractStatusBadge,
  isExpiringSoon,
  CONTRACT_STATUS_CHANGE_OPTIONS,
} from '@specialist/shared';
import { Card, Badge, Button, Skeleton, EmptyState } from '@specialist/ui';

// ── Types ──────────────────────────────────────────────────────

interface ContractDetail {
  id: string;
  companyId: string;
  contractNumber: string;
  startDate: string;
  endDate: string | null;
  status: string;
  slaResponseHours: number | null;
  slaResolutionHours: number | null;
  notes: string | null;
  discountPercent: string | null;
  discountAmount: string | null;
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

export function AdminContractDetail({ id }: { id: string }) {
  const api = useMemo(() => createBrowserClient(), []);

  const [contract, setContract] = useState<ContractDetail | null>(null);
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
        const [contractData, companiesData] = await Promise.all([
          api.get<ContractDetail>(`/api/v1/contracts/${id}`),
          api.get<CompanyInfo[]>('/api/v1/companies').catch(() => []),
        ]);

        if (cancelled) return;
        setContract(contractData);

        const companiesList = Array.isArray(companiesData) ? companiesData : [];
        const companyInfo = companiesList.find((c) => c.id === contractData.companyId);
        setCompany(companyInfo ?? null);
      } catch {
        if (!cancelled) setError('Gagal memuat detail kontrak');
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
    if (!contract || !newStatus || newStatus === contract.status) return;
    setStatusUpdating(true);
    try {
      await api.patch(`/api/v1/contracts/${contract.id}/status`, {
        body: { status: newStatus },
      });
      setContract((prev) => (prev ? { ...prev, status: newStatus } : prev));
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
  if (error || !contract) {
    return (
      <EmptyState
        title="Kontrak tidak ditemukan"
        description={error || 'Kontrak tidak dapat dimuat.'}
        action={<Button onClick={goBack}>Kembali</Button>}
      />
    );
  }

  const companyName = company?.companyName ?? contract.companyId;
  const { variant: statusVariant, label: statusLabel } = getContractStatusBadge(contract.status);

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
              <h1 className="text-h3 text-text-primary">{contract.contractNumber}</h1>
              <Badge variant={statusVariant}>{statusLabel}</Badge>
              {isExpiringSoon(contract.endDate) && (
                <span className="text-caption font-medium text-warning-600 bg-warning-50 px-2 py-0.5 rounded-full">
                  Segera berakhir
                </span>
              )}
            </div>
            <p className="mt-2 text-body text-text-secondary">{companyName}</p>
          </div>
          <div className="flex shrink-0 gap-2">
            <Button
              variant="outline"
              onClick={() => {
                setNewStatus(contract.status);
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
                {CONTRACT_STATUS_CHANGE_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
            <Button
              onClick={handleUpdateStatus}
              disabled={statusUpdating || !newStatus || newStatus === contract.status}
            >
              {statusUpdating ? 'Menyimpan...' : 'Simpan'}
            </Button>
            <Button variant="ghost" onClick={() => setShowStatusSelect(false)}>
              Batal
            </Button>
          </div>
        )}
      </Card>

      {/* ── Contract Details Grid ──────────────────────────────── */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Basic Info */}
        <Card padding="lg">
          <h3 className="mb-4 text-body font-semibold text-text-primary">Informasi Kontrak</h3>
          <dl className="space-y-4">
            <div>
              <dt className="text-caption font-medium text-text-muted">No. Kontrak</dt>
              <dd className="mt-0.5 text-body-sm font-semibold text-text-primary">
                {contract.contractNumber}
              </dd>
            </div>
            <div>
              <dt className="text-caption font-medium text-text-muted">Perusahaan</dt>
              <dd className="mt-0.5 text-body-sm font-semibold text-text-primary">{companyName}</dd>
            </div>
            <div>
              <dt className="text-caption font-medium text-text-muted">Periode Kontrak</dt>
              <dd className="mt-0.5 text-body-sm font-semibold text-text-primary">
                {formatDateRange(contract.startDate, contract.endDate)}
              </dd>
            </div>
            <div>
              <dt className="text-caption font-medium text-text-muted">Status</dt>
              <dd className="mt-0.5">
                <div className="flex items-center gap-2">
                  <Badge variant={statusVariant}>{statusLabel}</Badge>
                  {isExpiringSoon(contract.endDate) && (
                    <span className="text-caption font-medium text-warning-600">
                      Segera berakhir
                    </span>
                  )}
                </div>
              </dd>
            </div>
          </dl>
        </Card>

        {/* SLA Info */}
        <Card padding="lg">
          <h3 className="mb-4 text-body font-semibold text-text-primary">
            SLA (Service Level Agreement)
          </h3>
          <dl className="space-y-4">
            <div>
              <dt className="text-caption font-medium text-text-muted">Waktu Respon</dt>
              <dd className="mt-0.5 text-body-sm font-semibold text-text-primary">
                {contract.slaResponseHours ? `${contract.slaResponseHours} jam` : '-'}
              </dd>
            </div>
            <div>
              <dt className="text-caption font-medium text-text-muted">Waktu Penyelesaian</dt>
              <dd className="mt-0.5 text-body-sm font-semibold text-text-primary">
                {contract.slaResolutionHours ? `${contract.slaResolutionHours} jam` : '-'}
              </dd>
            </div>
            {contract.discountPercent && (
              <div>
                <dt className="text-caption font-medium text-text-muted">Diskon Persen</dt>
                <dd className="mt-0.5 text-body-sm font-semibold text-success-600">
                  {contract.discountPercent}%
                </dd>
              </div>
            )}
            {contract.discountAmount && (
              <div>
                <dt className="text-caption font-medium text-text-muted">Diskon Nominal</dt>
                <dd className="mt-0.5 text-body-sm font-semibold text-success-600">
                  Rp {Number(contract.discountAmount).toLocaleString('id-ID')}
                </dd>
              </div>
            )}
          </dl>
        </Card>

        {/* Audit Info */}
        <Card padding="lg">
          <h3 className="mb-4 text-body font-semibold text-text-primary">Informasi Audit</h3>
          <dl className="space-y-4">
            <div>
              <dt className="text-caption font-medium text-text-muted">Dibuat</dt>
              <dd className="mt-0.5 text-body-sm text-text-primary">
                {formatDate(contract.createdAt)}
              </dd>
            </div>
            <div>
              <dt className="text-caption font-medium text-text-muted">Diperbarui</dt>
              <dd className="mt-0.5 text-body-sm text-text-primary">
                {contract.updatedAt ? formatDate(contract.updatedAt) : '-'}
              </dd>
            </div>
            <div>
              <dt className="text-caption font-medium text-text-muted">Tanggal Mulai</dt>
              <dd className="mt-0.5 text-body-sm text-text-primary">
                {formatDate(contract.startDate)}
              </dd>
            </div>
            <div>
              <dt className="text-caption font-medium text-text-muted">Tanggal Berakhir</dt>
              <dd className="mt-0.5 text-body-sm text-text-primary">
                {contract.endDate ? formatDate(contract.endDate) : 'Tidak ada (berlaku terus)'}
              </dd>
            </div>
          </dl>
        </Card>

        {/* Quick Actions */}
        <Card padding="lg">
          <h3 className="mb-4 text-body font-semibold text-text-primary">Aksi Cepat</h3>
          <div className="space-y-3">
            <Button
              variant="outline"
              className="w-full justify-start"
              onClick={() => {
                window.location.href = `/dashboard/admin/invoices?companyId=${contract.companyId}`;
              }}
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
                className="mr-2"
              >
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <polyline points="14 2 14 8 20 8" />
                <line x1="16" y1="13" x2="8" y2="13" />
                <line x1="16" y1="17" x2="8" y2="17" />
              </svg>
              Lihat Invoice Perusahaan
            </Button>
            <Button
              variant="outline"
              className="w-full justify-start"
              onClick={() => {
                window.location.href = `/dashboard/admin/contracts`;
              }}
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
                className="mr-2"
              >
                <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
              </svg>
              Semua Kontrak
            </Button>
          </div>
        </Card>
      </div>

      {/* ── Notes ──────────────────────────────────────────────── */}
      {contract.notes && (
        <Card padding="lg">
          <h3 className="mb-3 text-body font-semibold text-text-primary">Catatan</h3>
          <p className="text-body text-text-secondary whitespace-pre-wrap">{contract.notes}</p>
        </Card>
      )}

      {/* ── Status Timeline ────────────────────────────────────── */}
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
              <p className="text-caption text-text-muted">{formatDate(contract.createdAt)}</p>
            </div>
          </div>

          {/* Active */}
          {contract.status.toLowerCase() === 'active' && (
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
                <p className="text-body-sm font-semibold text-text-primary">Aktif</p>
                <p className="text-caption text-text-muted">Kontrak sedang berjalan</p>
              </div>
            </div>
          )}

          {/* Expired */}
          {contract.status.toLowerCase() === 'expired' && (
            <div className="flex gap-3">
              <div className="flex flex-col items-center">
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-danger-100 text-danger-600">
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
                    <circle cx="12" cy="12" r="10" />
                    <line x1="12" y1="8" x2="12" y2="12" />
                    <line x1="12" y1="16" x2="12.01" y2="16" />
                  </svg>
                </div>
              </div>
              <div>
                <p className="text-body-sm font-semibold text-text-primary">Kadaluarsa</p>
                <p className="text-caption text-text-muted">
                  {contract.endDate ? formatDate(contract.endDate) : '-'}
                </p>
              </div>
            </div>
          )}

          {/* Terminated */}
          {contract.status.toLowerCase() === 'terminated' && (
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
                    <line x1="18" y1="6" x2="6" y2="18" />
                    <line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                </div>
              </div>
              <div>
                <p className="text-body-sm font-semibold text-text-primary">Dihentikan</p>
                <p className="text-caption text-text-muted">
                  Kontrak dihentikan sebelum masa berlaku habis
                </p>
              </div>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}
