export type ArticleStatus = 'Draft' | 'Review' | 'Published' | 'Archived';

export interface ArticleCategory {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  displayOrder: number;
  createdAt: string;
  updatedAt: string;
}

export interface Article {
  id: string;
  categoryId: string | null;
  title: string;
  slug: string;
  summary: string | null;
  content: string | null;
  coverImage: string | null;
  authorName: string | null;
  status: ArticleStatus;
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
  deletedAt: string | null;
}

export type CreateArticleInput = {
  categoryId?: string;
  title: string;
  slug: string;
  summary?: string;
  content?: string;
  coverImage?: string;
  authorName?: string;
  status?: ArticleStatus;
  isFeatured?: boolean;
  tags?: string[];
  metaTitle?: string;
  metaDescription?: string;
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
  canonicalUrl?: string;
  robots?: string;
};

export type UpdateArticleInput = Partial<CreateArticleInput>;
