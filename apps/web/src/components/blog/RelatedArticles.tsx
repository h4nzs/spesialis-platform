import { useState, useEffect } from 'react';
import { createBrowserClient } from '@ahlipanggilan/shared';
import type { CmsArticle, ArticleItem } from './utils';
import { formatDate, transformArticle } from './utils';

interface RelatedArticlesProps {
  currentSlug: string;
  categorySlug: string | null;
}

export function RelatedArticles({ currentSlug, categorySlug }: RelatedArticlesProps) {
  const [articles, setArticles] = useState<ArticleItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!categorySlug) {
      setLoading(false);
      return;
    }

    const api = createBrowserClient();

    api
      .get<CmsArticle[]>('/api/v1/cms/articles', { params: { limit: 50 } })
      .then((raw) => {
        const related = raw
          .map(transformArticle)
          .filter((a) => a.categorySlug === categorySlug && a.slug !== currentSlug)
          .slice(0, 3);
        setArticles(related);
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
      });
  }, [currentSlug, categorySlug]);

  // Don't render anything without a category or if no related articles found
  if (!categorySlug || (!loading && articles.length === 0)) return null;

  // ─── Loading skeleton ──────────────────────────────────────────

  if (loading) {
    return (
      <div className="mt-12 border-t border-border-default pt-8">
        <h2 className="text-xl font-semibold text-text">Artikel Terkait</h2>
        <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="animate-pulse rounded-xl border border-border-default bg-bg-surface p-5"
            >
              <div className="h-40 w-full rounded-lg bg-neutral-200" />
              <div className="mt-4 h-4 w-1/3 rounded bg-neutral-200" />
              <div className="mt-3 h-5 w-4/5 rounded bg-neutral-200" />
              <div className="mt-2 h-4 w-full rounded bg-neutral-200" />
              <div className="mt-4 h-4 w-2/5 rounded bg-neutral-200" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  // ─── Related articles grid ─────────────────────────────────────

  return (
    <div className="mt-12 border-t border-border-default pt-8 motion-safe:animate-fade-in">
      <h2 className="text-xl font-semibold text-text">Artikel Terkait</h2>
      <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {articles.map((article) => (
          <a
            key={article.id}
            href={`/blog/${article.slug}`}
            className="group rounded-xl border border-border-default bg-bg-surface p-5 transition-shadow hover:shadow-md"
          >
            {article.coverImage && (
              <div className="mb-4 overflow-hidden rounded-lg">
                <img
                  src={article.coverImage}
                  alt={article.title}
                  loading="lazy"
                  decoding="async"
                  width="400"
                  height="192"
                  className="h-48 w-full object-cover transition-transform group-hover:scale-105"
                />
              </div>
            )}
            {article.categoryName && (
              <span className="inline-block rounded-full bg-primary-500/10 px-3 py-1 text-xs font-medium text-primary">
                {article.categoryName}
              </span>
            )}
            <h3 className="mt-3 text-lg font-semibold text-text group-hover:text-primary transition-colors">
              {article.title}
            </h3>
            {article.summary && (
              <p className="mt-2 text-sm text-text-muted line-clamp-2">{article.summary}</p>
            )}
            <div className="mt-4 flex items-center gap-3 text-xs text-text-muted">
              {article.authorName && <span>{article.authorName}</span>}
              {article.publishedAt && <span>{formatDate(article.publishedAt)}</span>}
            </div>
          </a>
        ))}
      </div>
    </div>
  );
}
