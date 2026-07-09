export interface ArticleItem {
  id: string;
  title: string;
  slug: string;
  summary: string | null;
  coverImage: string | null;
  authorName: string | null;
  categoryName: string | null;
  categorySlug: string | null;
  publishedAt: string | null;
}

import type { CmsArticle } from '../../lib/directus.ts';
export type { CmsArticle };

export function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('id-ID', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

export function transformArticle(a: CmsArticle): ArticleItem {
  return {
    id: a.id,
    title: a.title,
    slug: a.slug,
    summary: a.summary,
    coverImage: a.cover_image,
    authorName: a.author,
    categoryName: a.category,
    categorySlug: a.category?.toLowerCase().replace(/\s+/g, '-') ?? null,
    publishedAt: a.published_at,
  };
}
