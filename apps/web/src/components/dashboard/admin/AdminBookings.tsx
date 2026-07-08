import { useState, useEffect, useCallback, useMemo } from 'react';
import {
  createBrowserClient,
  formatCurrency,
  formatDate,
  getStatusLabel,
  getStatusColor,
  downloadCSV,
  downloadBlob,
} from '@specialist/shared';
import {
  Badge,
  Table,
  Pagination,
  Button,
  Modal,
  Input,
  Textarea,
  EmptyState,
} from '@specialist/ui';
import type { Column } from '@specialist/ui';
import type { OrderStatus } from '@specialist/types';

interface BookingItem {
  id: string;
  bookingNumber: string;
  status: OrderStatus;
  bookingDate: string;
  basePrice: string;
  finalPrice: string | null;
  createdAt: string;
}

export function AdminBookings() {
  const api = useMemo(() => createBrowserClient(), []);
  const [bookings, setBookings] = useState<BookingItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [actionModal, setActionModal] = useState<{ booking: BookingItem; action: string } | null>(
    null,
  );
  const [note, setNote] = useState('');
  const [finalPrice, setFinalPrice] = useState('');
  const [partnerId, setPartnerId] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [exporting, setExporting] = useState(false);

  function fallbackExport() {
    const headers = ['No. Booking', 'Status', 'Tanggal', 'Harga Dasar', 'Harga Final'];
    const rows = bookings.map((b) => [
      b.bookingNumber,
      getStatusLabel(b.status),
      formatDate(b.bookingDate),
      formatCurrency(Number(b.basePrice)),
      b.finalPrice ? formatCurrency(Number(b.finalPrice)) : '-',
    ]);
    downloadCSV(headers, rows, 'orders-export.csv');
  }

  async function handleExportCSV() {
    if (exporting) return;
    setExporting(true);
    try {
      const token = api.getTokenStore().getAccessToken();
      const response = await fetch('/api/v1/admin/orders/export', {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'text/csv,application/json',
        },
      });
      if (!response.ok) throw new Error('Gagal mengexport data');

      // Jika server mengembalikan CSV langsung, download sebagai blob
      const contentType = response.headers.get('Content-Type');
      if (contentType?.startsWith('text/csv')) {
        const blob = await response.blob();
        downloadBlob(blob, 'orders-export.csv');
      } else {
        // Fallback: export data yang sudah dimuat di halaman
        fallbackExport();
      }
    } catch {
      fallbackExport();
    } finally {
      setExporting(false);
    }
  }

  const loadBookings = useCallback(async () => {
    setLoading(true);
    try {
      const data = await api.get<BookingItem[]>('/api/v1/bookings', {
        params: { page, limit: 20 },
      });
      const items = Array.isArray(data) ? data : [];
      setBookings(items);
      setHasMore(items.length === 20);
    } catch {
      setBookings([]);
    } finally {
      setLoading(false);
    }
  }, [page, api]);

  useEffect(() => {
    loadBookings();
  }, [loadBookings]);

  async function handleAction() {
    if (!actionModal) return;
    setSubmitting(true);
    try {
      const { booking, action } = actionModal;
      if (action === 'confirm') {
        await api.post(`/api/v1/bookings/${booking.id}/confirm`, {
          body: { finalPrice: finalPrice || undefined, note },
        });
      } else if (action === 'assign') {
        await api.post(`/api/v1/bookings/${booking.id}/assign`, {
          body: { partnerId, note },
        });
      } else if (action === 'cancel') {
        await api.post(`/api/v1/bookings/${booking.id}/cancel`, { body: { reason: note } });
      }
      setActionModal(null);
      setNote('');
      setFinalPrice('');
      setPartnerId('');
      await loadBookings();
    } catch {
      // silent
    } finally {
      setSubmitting(false);
    }
  }

  const columns: Column<BookingItem>[] = [
    { key: 'bookingNumber', header: 'No. Booking' },
    {
      key: 'status',
      header: 'Status',
      render: (item) => (
        <Badge
          variant={
            getStatusColor(item.status) as 'default' | 'success' | 'warning' | 'danger' | 'info'
          }
        >
          {getStatusLabel(item.status)}
        </Badge>
      ),
    },
    {
      key: 'bookingDate',
      header: 'Tanggal',
      render: (item) => formatDate(item.bookingDate),
    },
    {
      key: 'basePrice',
      header: 'Harga Dasar',
      render: (item) => formatCurrency(Number(item.basePrice)),
    },
    {
      key: 'finalPrice',
      header: 'Harga Final',
      render: (item) => (item.finalPrice ? formatCurrency(Number(item.finalPrice)) : '-'),
    },
    {
      key: 'id',
      header: 'Aksi',
      render: (item) => (
        <div className="flex gap-1">
          {item.status === 'Pending Confirmation' && (
            <Button size="sm" onClick={() => setActionModal({ booking: item, action: 'confirm' })}>
              Konfirmasi
            </Button>
          )}
          {item.status === 'Waiting Assignment' && (
            <Button size="sm" onClick={() => setActionModal({ booking: item, action: 'assign' })}>
              Assign
            </Button>
          )}
          {['Pending Confirmation', 'Confirmed', 'Waiting Assignment'].includes(item.status) && (
            <Button
              size="sm"
              variant="danger"
              onClick={() => setActionModal({ booking: item, action: 'cancel' })}
            >
              Batal
            </Button>
          )}
        </div>
      ),
    },
  ];

  if (loading && bookings.length === 0) {
    return <div className="text-sm text-text-muted">Memuat...</div>;
  }

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex items-center justify-end">
        <button
          type="button"
          onClick={handleExportCSV}
          disabled={exporting}
          className="inline-flex items-center gap-1.5 rounded-md border border-border bg-background px-3 py-1.5 text-sm font-medium text-text transition-colors hover:bg-surface disabled:cursor-not-allowed disabled:opacity-50"
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
          {exporting ? 'Mengexport...' : 'Export CSV'}
        </button>
      </div>

      <Table
        columns={columns}
        data={bookings}
        keyExtractor={(b) => b.id}
        emptyState={<EmptyState title="Belum ada booking" />}
      />
      <Pagination page={page} totalPages={hasMore ? page + 1 : page} onPageChange={setPage} />

      <Modal
        open={!!actionModal}
        onClose={() => setActionModal(null)}
        title={
          actionModal?.action === 'confirm'
            ? 'Konfirmasi Booking'
            : actionModal?.action === 'assign'
              ? 'Assign Partner'
              : 'Batalkan Booking'
        }
        footer={
          <div className="flex gap-2">
            <Button variant="ghost" onClick={() => setActionModal(null)}>
              Batal
            </Button>
            <Button onClick={handleAction} disabled={submitting}>
              {submitting ? 'Memproses...' : 'Simpan'}
            </Button>
          </div>
        }
      >
        <div className="space-y-4">
          {actionModal?.action === 'confirm' && (
            <>
              <Input
                label="Harga Final"
                type="number"
                value={finalPrice}
                onChange={(e) => setFinalPrice(e.target.value)}
                placeholder="Kosongkan jika sama"
              />
              <Input
                label="Catatan"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Catatan (opsional)"
              />
            </>
          )}
          {actionModal?.action === 'assign' && (
            <>
              <Input
                label="ID Partner"
                value={partnerId}
                onChange={(e) => setPartnerId(e.target.value)}
                placeholder="Masukkan ID Partner"
                required
              />
              <Input
                label="Catatan"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Catatan (opsional)"
              />
            </>
          )}
          {actionModal?.action === 'cancel' && (
            <Textarea
              label="Alasan Pembatalan"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Wajib diisi"
              required
            />
          )}
        </div>
      </Modal>
    </div>
  );
}
