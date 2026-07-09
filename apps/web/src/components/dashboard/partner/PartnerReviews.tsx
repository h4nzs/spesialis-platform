import { useState, useEffect, useMemo } from 'react';
import { createBrowserClient, formatDate, formatRating } from '@specialist/shared';
import { Table, EmptyState, Skeleton, CSVExportButton } from '@specialist/ui';
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
    return (
      <div className="space-y-3">
        <Skeleton variant="table" />
        <Skeleton variant="table" />
        <Skeleton variant="table" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {reviews.length > 0 && (
        <div className="flex items-center justify-end">
          <CSVExportButton
            data={reviews as unknown as Record<string, unknown>[]}
            columns={[
              { key: 'rating', label: 'Rating', format: (v) => String(v) },
              { key: 'comment', label: 'Komentar', format: (v) => (v as string) ?? '-' },
              { key: 'createdAt', label: 'Tanggal', format: (v) => formatDate(v as string) },
            ]}
            filename="ulasan-partner-export.csv"
          />
        </div>
      )}
      <Table
        columns={columns}
        data={reviews}
        keyExtractor={(r) => r.id}
        emptyState={<EmptyState title="Belum ada ulasan" />}
      />
    </div>
  );
}
