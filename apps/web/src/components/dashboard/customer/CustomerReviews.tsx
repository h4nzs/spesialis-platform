import { useState, useEffect, useCallback, useMemo } from 'react';
import { createBrowserClient, formatDate, formatRating, downloadCSV } from '@specialist/shared';
import { Button, Textarea, Select, Modal, Table, EmptyState } from '@specialist/ui';
import type { Column } from '@specialist/ui';

interface ReviewItem {
  id: string;
  rating: number;
  review: string | null;
  createdAt: string;
}

interface OrderItem {
  id: string;
  bookingNumber: string;
  status: string;
}

const RATING_OPTIONS = [
  { value: '5', label: '5 - Sangat Baik' },
  { value: '4.5', label: '4.5' },
  { value: '4', label: '4 - Baik' },
  { value: '3.5', label: '3.5' },
  { value: '3', label: '3 - Cukup' },
  { value: '2.5', label: '2.5' },
  { value: '2', label: '2 - Kurang' },
  { value: '1.5', label: '1.5' },
  { value: '1', label: '1 - Buruk' },
];

export function CustomerReviews() {
  const api = useMemo(() => createBrowserClient(), []);
  const [reviews, setReviews] = useState<ReviewItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [availableOrders, setAvailableOrders] = useState<OrderItem[]>([]);
  const [orderId, setOrderId] = useState('');
  const [rating, setRating] = useState('');
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const loadReviews = useCallback(async () => {
    try {
      const data = await api.get<ReviewItem[]>('/api/v1/reviews');
      setReviews(Array.isArray(data) ? data : []);
    } catch {
      setReviews([]);
    } finally {
      setLoading(false);
    }
  }, [api]);

  useEffect(() => {
    loadReviews();
  }, [loadReviews]);

  async function openCreate() {
    setError('');
    setOrderId('');
    setRating('');
    setComment('');
    setShowModal(true);

    try {
      const data = await api.get<OrderItem[]>('/api/v1/bookings', { params: { limit: 100 } });
      const allOrders = Array.isArray(data) ? data : [];
      const reviewableStatuses = ['Completed', 'Waiting Payment', 'Paid', 'Closed'];
      const eligible = allOrders.filter((o) => reviewableStatuses.includes(o.status));
      setAvailableOrders(eligible);
    } catch {
      setAvailableOrders([]);
    }
  }

  async function handleSubmit(e: React.SyntheticEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!orderId || !rating) {
      setError('Pilih pesanan dan rating wajib diisi');
      return;
    }
    setSubmitting(true);
    setError('');
    try {
      await api.post('/api/v1/reviews', {
        body: { orderId, rating: Number(rating), review: comment || undefined },
      });
      setShowModal(false);
      await loadReviews();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gagal mengirim ulasan');
    } finally {
      setSubmitting(false);
    }
  }

  const columns: Column<ReviewItem>[] = [
    {
      key: 'rating',
      header: 'Rating',
      render: (item) => formatRating(item.rating),
    },
    {
      key: 'review',
      header: 'Komentar',
      render: (item) => item.review ?? '-',
    },
    {
      key: 'createdAt',
      header: 'Tanggal',
      render: (item) => formatDate(item.createdAt),
    },
  ];

  function handleExportCSV() {
    const headers = ['Rating', 'Komentar', 'Tanggal'];
    const rows = reviews.map((r) => [String(r.rating), r.review ?? '-', formatDate(r.createdAt)]);
    downloadCSV(headers, rows, 'ulasan-saya-export.csv');
  }

  if (loading) return <div className="text-sm text-text-muted py-8 text-center">Memuat...</div>;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-end gap-2">
        {reviews.length > 0 && (
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
        <Button onClick={openCreate}>Tulis Ulasan</Button>
      </div>

      <Table
        columns={columns}
        data={reviews}
        keyExtractor={(r) => r.id}
        emptyState={<EmptyState title="Belum ada ulasan" />}
      />

      <Modal open={showModal} onClose={() => setShowModal(false)} title="Tulis Ulasan">
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && <p className="text-sm text-danger">{error}</p>}

          <Select
            label="Pesanan"
            value={orderId}
            onChange={(e) => setOrderId(e.target.value)}
            options={availableOrders.map((o) => ({
              value: o.id,
              label: `${o.bookingNumber} - ${o.status}`,
            }))}
            placeholder={
              availableOrders.length === 0
                ? 'Tidak ada pesanan yang bisa direview'
                : 'Pilih pesanan'
            }
            required
          />

          <Select
            label="Rating"
            value={rating}
            onChange={(e) => setRating(e.target.value)}
            options={RATING_OPTIONS}
            placeholder="Pilih rating"
            required
          />

          <Textarea
            label="Komentar (opsional)"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Ceritakan pengalaman Anda..."
          />

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="ghost" type="button" onClick={() => setShowModal(false)}>
              Batal
            </Button>
            <Button type="submit" disabled={submitting || availableOrders.length === 0}>
              {submitting ? 'Mengirim...' : 'Kirim Ulasan'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
