import { useState, useEffect, useCallback, useMemo } from 'react';
import { createBrowserClient, formatDate, formatRating } from '@specialist/shared';
import {
  Button,
  Textarea,
  Select,
  Modal,
  Table,
  EmptyState,
  TableSkeleton,
  CSVExportButton,
} from '@specialist/ui';
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

  if (loading) return <TableSkeleton toolbarWidth="w-40" />;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-end gap-2">
        {reviews.length > 0 && (
          <CSVExportButton
            data={reviews as unknown as Record<string, unknown>[]}
            columns={[
              { key: 'rating', label: 'Rating', format: (v) => String(v) },
              { key: 'review', label: 'Komentar', format: (v) => (v as string) ?? '-' },
              { key: 'createdAt', label: 'Tanggal', format: (v) => formatDate(v as string) },
            ]}
            filename="ulasan-saya-export.csv"
          />
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
