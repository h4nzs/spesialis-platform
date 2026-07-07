import { useState, useEffect, useMemo } from 'react';
import { createBrowserClient, formatDate, formatRating } from '@specialist/shared';
import { Table } from '@specialist/ui';
import type { Column } from '@specialist/ui';

interface Review {
  id: string;
  rating: number;
  comment: string | null;
  createdAt: string;
}

export function PartnerReviews() {
  const api = useMemo(() => createBrowserClient(), []);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const profile = await api.get<{ id: string }>('/api/v1/partners/me');
        const data = await api.get<Review[]>(`/api/v1/partners/${profile.id}/reviews`);
        setReviews(Array.isArray(data) ? data : []);
      } catch {
        setReviews([]);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [api]);

  const columns: Column<Review>[] = [
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
    <Table
      columns={columns}
      data={reviews}
      keyExtractor={(r) => r.id}
      emptyMessage="Belum ada ulasan"
    />
  );
}
