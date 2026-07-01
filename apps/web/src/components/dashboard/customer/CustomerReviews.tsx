import { useState, useEffect } from 'react';
import { createBrowserClient, formatDate, formatRating } from '@specialist/shared';
import { Table } from '@specialist/ui';
import type { Column } from '@specialist/ui';

interface ReviewItem {
  id: string;
  rating: number;
  comment: string | null;
  createdAt: string;
  order?: { bookingNumber: string };
}

export function CustomerReviews() {
  const api = createBrowserClient();
  const [reviews, setReviews] = useState<ReviewItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get<ReviewItem[]>('/api/v1/reviews')
      .then((data) => setReviews(Array.isArray(data) ? data : []))
      .catch(() => setReviews([]))
      .finally(() => setLoading(false));
  }, []);

  const columns: Column<ReviewItem>[] = [
    {
      key: 'rating',
      header: 'Rating',
      render: (item) => formatRating(item.rating),
    },
    {
      key: 'comment',
      header: 'Komentar',
      render: (item) => item.comment ?? '-',
    },
    {
      key: 'createdAt',
      header: 'Tanggal',
      render: (item) => formatDate(item.createdAt),
    },
  ];

  if (loading) {
    return <div className="text-sm text-text-muted">Memuat...</div>;
  }

  return (
    <Table columns={columns} data={reviews} keyExtractor={(r) => r.id} emptyMessage="Belum ada ulasan" />
  );
}
