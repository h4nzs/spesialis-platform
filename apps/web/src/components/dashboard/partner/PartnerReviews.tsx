import { useState, useEffect, useMemo } from 'react';
import { createBrowserClient, formatDate, formatRating, downloadCSV } from '@specialist/shared';
import { Table, EmptyState, Skeleton } from '@specialist/ui';
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

  function handleExportCSV() {
    const headers = ['Rating', 'Komentar', 'Tanggal'];
    const rows = reviews.map((r) => [String(r.rating), r.comment ?? '-', formatDate(r.createdAt)]);
    downloadCSV(headers, rows, 'ulasan-partner-export.csv');
  }

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
          <button
            type="button"
            onClick={handleExportCSV}
            className="inline-flex items-center gap-1.5 rounded-lg border border-border-default bg-bg-surface px-3 py-1.5 text-body-sm font-medium text-text-primary shadow-xs transition-all duration-150 ease-out hover:bg-neutral-100 hover:shadow-sm"
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
