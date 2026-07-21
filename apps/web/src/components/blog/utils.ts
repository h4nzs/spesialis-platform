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

export interface CmsArticle {
  id: string;
  title: string;
  slug: string;
  summary: string | null;
  content: string | null;
  cover_image: string | null;
  category: string | null;
  tags: string[] | null;
  author: string | null;
  published_at: string | null;
  date_created: string | null;
  date_updated: string | null;
  status: string;
  meta_title?: string | null;
  meta_description?: string | null;
  og_title?: string | null;
  og_description?: string | null;
  og_image?: string | null;
  canonical_url?: string | null;
  is_pillar_content?: boolean | null;
}

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
