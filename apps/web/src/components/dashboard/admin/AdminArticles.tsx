import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { createBrowserClient } from '@ahlipanggilan/shared';
import {
  Button,
  Table,
  Badge,
  Pagination,
  EmptyState,
  TableSkeleton,
  CSVExportButton,
} from '@ahlipanggilan/ui';
import type { Column } from '@ahlipanggilan/ui';

interface ArticleItem {
  id: string;
  categoryId: string | null;
  categoryName: string | null;
  title: string;
  slug: string;
  summary: string | null;
  content: string | null;
  coverImage: string | null;
  authorName: string | null;
  status: string;
  isFeatured: boolean;
  tags: string[];
  metaTitle: string | null;
  metaDescription: string | null;
  ogTitle: string | null;
  ogDescription: string | null;
  ogImage: string | null;
  canonicalUrl: string | null;
  robots: string;
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

const PAGE_SIZE = 20;

export function AdminArticles() {
  const api = useMemo(() => createBrowserClient(), []);
  const [articles, setArticles] = useState<ArticleItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);

  const loadData = useCallback(async () => {
    try {
      const result = await api.get<{ data: ArticleItem[] }>('/api/v1/admin/articles', {
        params: { limit: 100 },
      });
      setArticles(Array.isArray(result) ? result : (result?.data ?? []));
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  }, [api]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  function navToNew() {
    window.location.href = '/dashboard/admin/articles/new';
  }

  function navToEdit(id: string) {
    window.location.href = `/dashboard/admin/articles/edit/${id}`;
  }

  async function handleDelete(item: ArticleItem) {
    if (!confirm(`Hapus artikel "${item.title}"?`)) return;
    try {
      await api.delete(`/api/v1/admin/articles/${item.id}`);
      setPage(1);
      await loadData();
    } catch {
      // silent
    }
  }

  const columns: Column<ArticleItem>[] = [
    {
      key: 'title',
      header: 'Judul',
      render: (item) => (
        <div>
          <span className="font-medium text-text-primary">{item.title}</span>
          <span className="ml-2 text-xs text-text-secondary">({item.slug})</span>
        </div>
      ),
    },
    { key: 'categoryName', header: 'Kategori', render: (item) => item.categoryName ?? '-' },
    { key: 'authorName', header: 'Penulis', render: (item) => item.authorName ?? '-' },
    {
      key: 'status',
      header: 'Status',
      render: (item) => {
        const variant =
          item.status === 'Published'
            ? 'success'
            : item.status === 'Review'
              ? 'warning'
              : 'default';
        return <Badge variant={variant}>{item.status}</Badge>;
      },
    },
    {
      key: 'isFeatured',
      header: 'Featured',
      render: (item) => (item.isFeatured ? '⭐' : '-'),
    },
    {
      key: 'publishedAt',
      header: 'Terbit',
      render: (item) =>
        item.publishedAt ? new Date(item.publishedAt).toLocaleDateString('id-ID') : '-',
    },
    {
      key: 'id',
      header: 'Aksi',
      render: (item) => (
        <div className="flex gap-2">
          <Button size="sm" onClick={() => navToEdit(item.id)}>
            Edit
          </Button>
          <Button size="sm" variant="danger" onClick={() => handleDelete(item)}>
            Hapus
          </Button>
        </div>
      ),
    },
  ];

  if (loading) return <TableSkeleton />;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-end gap-2">
        {articles.length > 0 && (
          <CSVExportButton
            data={articles as unknown as Record<string, unknown>[]}
            columns={[
              { key: 'title', label: 'Judul' },
              { key: 'slug', label: 'Slug' },
              { key: 'categoryName', label: 'Kategori', format: (v) => (v as string) ?? '-' },
              { key: 'authorName', label: 'Penulis', format: (v) => (v as string) ?? '-' },
              { key: 'status', label: 'Status' },
              {
                key: 'isFeatured',
                label: 'Featured',
                format: (v) => (v ? 'Ya' : 'Tidak'),
              },
              {
                key: 'publishedAt',
                label: 'Terbit',
                format: (v) => (v ? new Date(v as string).toLocaleDateString('id-ID') : '-'),
              },
            ]}
            filename="artikel-export.csv"
          />
        )}
        <Button onClick={navToNew}>Tulis Artikel</Button>
      </div>

      <Table
        data={articles.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)}
        columns={columns}
        keyExtractor={(item) => item.id}
        emptyState={<EmptyState title="Belum ada artikel" />}
      />

      {articles.length > PAGE_SIZE && (
        <Pagination
          page={page}
          totalPages={Math.ceil(articles.length / PAGE_SIZE)}
          onPageChange={setPage}
        />
      )}
    </div>
  );
}
