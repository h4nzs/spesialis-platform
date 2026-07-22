import { useState, useEffect, useMemo } from 'react';
import { createBrowserClient, formatCurrency, formatDate } from '@ahlipanggilan/shared';
import { Card, Badge, Button, Skeleton, EmptyState } from '@ahlipanggilan/ui';

// ── Types ──────────────────────────────────────────────────────

interface PaymentData {
  id: string;
  orderId: string;
  method: string;
  amount: string;
  status: string;
  proofMediaId: string | null;
  verifiedBy: string | null;
  verifiedAt: string | null;
  notes: string | null;
  createdAt: string;
}

interface OrderInfo {
  id: string;
  bookingNumber: string | null;
  status: string;
  basePrice: string | null;
  finalPrice: string | null;
  createdAt: string | null;
}

interface CustomerInfo {
  name: string;
  email: string;
  phone: string | null;
}

interface VerifierInfo {
  name: string;
}

interface PaymentDetailResponse {
  payment: PaymentData;
  order: OrderInfo | null;
  customer: CustomerInfo | null;
  verifier: VerifierInfo | null;
}

// ── Helpers ────────────────────────────────────────────────────

const METHOD_LABELS: Record<string, string> = {
  Cash: 'Tunai',
  Transfer: 'Transfer',
  QRIS: 'QRIS',
  'E-Wallet': 'E-Wallet',
  Other: 'Lainnya',
};

const METHOD_COLORS: Record<string, string> = {
  Cash: 'bg-success-50 text-success-600',
  Transfer: 'bg-primary-50 text-primary-600',
  QRIS: 'bg-accent-50 text-accent-600',
  'E-Wallet': 'bg-info-50 text-info-600',
  Other: 'bg-neutral-100 text-neutral-600',
};

function getBadge(status: string): {
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

// ── Component ──────────────────────────────────────────────────

export function AdminPaymentDetail({ id }: { id: string }) {
  const api = useMemo(() => createBrowserClient(), []);

  const [data, setData] = useState<PaymentDetailResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const result = await api.get<PaymentDetailResponse>(`/api/v1/payments/${id}`);
        if (cancelled) return;
        setData(result);
      } catch {
        if (!cancelled) setError('Gagal memuat detail pembayaran');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [id, api]);

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
  if (error || !data) {
    return (
      <EmptyState
        title="Pembayaran tidak ditemukan"
        description={error || 'Pembayaran tidak dapat dimuat.'}
        action={<Button onClick={goBack}>Kembali</Button>}
      />
    );
  }

  const { payment, order, customer, verifier } = data;
  const { variant: statusVariant, label: statusLabel } = getBadge(payment.status);
  const methodColor = METHOD_COLORS[payment.method] ?? 'bg-neutral-100 text-neutral-600';

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
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M19 12H5" />
          <path d="M12 19l-7-7 7-7" />
        </svg>
        Kembali ke daftar
      </button>

      {/* ── Header ────────────────────────────────────────────── */}
      <Card padding="lg">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-h3 text-text-primary">Pembayaran #{payment.id.slice(0, 8)}</h1>
              <Badge variant={statusVariant}>{statusLabel}</Badge>
              <span
                className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-xs font-medium ${methodColor}`}
              >
                {METHOD_LABELS[payment.method] ?? payment.method}
              </span>
            </div>
            <p className="mt-2 text-body text-text-secondary">{formatCurrency(payment.amount)}</p>
          </div>
        </div>
      </Card>

      {/* ── 2-Column Detail Grid ──────────────────────────────── */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Payment Info */}
        <Card padding="lg">
          <h3 className="mb-4 text-body font-semibold text-text-primary">Informasi Pembayaran</h3>
          <dl className="space-y-4">
            <div>
              <dt className="text-caption font-medium text-text-muted">ID Pembayaran</dt>
              <dd className="mt-0.5 text-body-sm font-medium text-text-primary">{payment.id}</dd>
            </div>
            <div>
              <dt className="text-caption font-medium text-text-muted">Metode</dt>
              <dd className="mt-0.5 text-body-sm font-medium text-text-primary">
                {METHOD_LABELS[payment.method] ?? payment.method}
              </dd>
            </div>
            <div>
              <dt className="text-caption font-medium text-text-muted">Jumlah</dt>
              <dd className="mt-0.5 text-h4 font-bold text-text-primary">
                {formatCurrency(payment.amount)}
              </dd>
            </div>
            <div>
              <dt className="text-caption font-medium text-text-muted">Status</dt>
              <dd className="mt-0.5">
                <Badge variant={statusVariant}>{statusLabel}</Badge>
              </dd>
            </div>
            <div>
              <dt className="text-caption font-medium text-text-muted">Tanggal Pembayaran</dt>
              <dd className="mt-0.5 text-body-sm text-text-primary">
                {payment.createdAt ? formatDate(payment.createdAt) : '-'}
              </dd>
            </div>
          </dl>
        </Card>

        {/* Order Info */}
        <Card padding="lg">
          <h3 className="mb-4 text-body font-semibold text-text-primary">Informasi Order</h3>
          {order ? (
            <dl className="space-y-4">
              <div>
                <dt className="text-caption font-medium text-text-muted">Order ID</dt>
                <dd className="mt-0.5 text-body-sm font-medium text-text-primary">
                  #{order.id.slice(0, 8)}
                </dd>
              </div>
              <div>
                <dt className="text-caption font-medium text-text-muted">No. Booking</dt>
                <dd className="mt-0.5 text-body-sm font-medium text-text-primary">
                  {order.bookingNumber ?? '-'}
                </dd>
              </div>
              <div>
                <dt className="text-caption font-medium text-text-muted">Status Order</dt>
                <dd className="mt-0.5 text-body-sm text-text-primary">{order.status}</dd>
              </div>
              <div>
                <dt className="text-caption font-medium text-text-muted">Harga Dasar</dt>
                <dd className="mt-0.5 text-body-sm font-medium text-text-primary">
                  {order.basePrice ? formatCurrency(order.basePrice) : '-'}
                </dd>
              </div>
              <div>
                <dt className="text-caption font-medium text-text-muted">Harga Final</dt>
                <dd className="mt-0.5 text-body-sm font-bold text-success">
                  {order.finalPrice ? formatCurrency(order.finalPrice) : '-'}
                </dd>
              </div>
              <div>
                <dt className="text-caption font-medium text-text-muted">Dibuat</dt>
                <dd className="mt-0.5 text-body-sm text-text-primary">
                  {order.createdAt ? formatDate(order.createdAt) : '-'}
                </dd>
              </div>
            </dl>
          ) : (
            <p className="text-body-sm text-text-muted">Data order tidak tersedia.</p>
          )}
        </Card>
      </div>

      {/* ── Customer & Verifier Info ──────────────────────────── */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Customer */}
        <Card padding="lg">
          <h3 className="mb-4 text-body font-semibold text-text-primary">Pelanggan</h3>
          {customer ? (
            <dl className="space-y-4">
              <div>
                <dt className="text-caption font-medium text-text-muted">Nama</dt>
                <dd className="mt-0.5 text-body-sm font-semibold text-text-primary">
                  {customer.name}
                </dd>
              </div>
              <div>
                <dt className="text-caption font-medium text-text-muted">Email</dt>
                <dd className="mt-0.5 text-body-sm text-text-primary">
                  <a href={`mailto:${customer.email}`} className="text-primary hover:underline">
                    {customer.email}
                  </a>
                </dd>
              </div>
              {customer.phone && (
                <div>
                  <dt className="text-caption font-medium text-text-muted">Telepon</dt>
                  <dd className="mt-0.5 text-body-sm text-text-primary">{customer.phone}</dd>
                </div>
              )}
            </dl>
          ) : (
            <p className="text-body-sm text-text-muted">Data pelanggan tidak tersedia.</p>
          )}
        </Card>

        {/* Verifier */}
        <Card padding="lg">
          <h3 className="mb-4 text-body font-semibold text-text-primary">Verifikasi</h3>
          <dl className="space-y-4">
            <div>
              <dt className="text-caption font-medium text-text-muted">Diverifikasi oleh</dt>
              <dd className="mt-0.5 text-body-sm font-medium text-text-primary">
                {verifier?.name ?? '-'}
              </dd>
            </div>
            <div>
              <dt className="text-caption font-medium text-text-muted">Waktu Verifikasi</dt>
              <dd className="mt-0.5 text-body-sm text-text-primary">
                {payment.verifiedAt ? formatDate(payment.verifiedAt) : '-'}
              </dd>
            </div>
            {payment.notes && (
              <div>
                <dt className="text-caption font-medium text-text-muted">Catatan Verifikasi</dt>
                <dd className="mt-0.5 text-body-sm text-text-secondary whitespace-pre-wrap">
                  {payment.notes}
                </dd>
              </div>
            )}
          </dl>
        </Card>
      </div>
    </div>
  );
}
