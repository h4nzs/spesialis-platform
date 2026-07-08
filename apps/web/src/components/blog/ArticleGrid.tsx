import { useState, useEffect } from 'react';
import { createBrowserClient } from '@specialist/shared';
import type { CmsArticle, ArticleItem } from './utils';
import { formatDate, transformArticle } from './utils';

interface ArticleGridProps {
  activeCategory: string | null;
}

export function ArticleGrid({ activeCategory }: ArticleGridProps) {
  const [allArticles, setAllArticles] = useState<ArticleItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const api = createBrowserClient();

    api
      .get<CmsArticle[]>('/api/v1/cms/articles', { params: { limit: 50 } })
      .then((raw) => {
        setAllArticles(raw.map(transformArticle));
        setLoading(false);
      })
      .catch((err: unknown) => {
        setError(err instanceof Error ? err.message : 'Gagal memuat artikel');
        setLoading(false);
      });
  }, []);

  // Filter by active category
  const filteredArticles = activeCategory
    ? allArticles.filter((a) => a.categorySlug === activeCategory)
    : allArticles;

  // ─── Loading skeleton ──────────────────────────────────────────

  if (loading) {
    return (
      <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
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
    );
  }

  // ─── Error state ───────────────────────────────────────────────

  if (error) {
    return (
      <div className="mt-8 rounded-md border border-danger-500/30 bg-danger-500/5 px-6 py-8 text-center">
        <p className="text-danger-500">{error}</p>
      </div>
    );
  }

  // ─── Empty state ───────────────────────────────────────────────

  if (filteredArticles.length === 0) {
    return (
      <div className="mt-8 col-span-full py-16 text-center motion-safe:animate-fade-in">
        <div className="text-4xl mb-4">{activeCategory ? '🔍' : '📝'}</div>
        <p className="text-text-muted">
          {activeCategory ? 'Tidak ada artikel di kategori ini' : 'Belum ada artikel'}
        </p>
      </div>
    );
  }

  // ─── Article grid ──────────────────────────────────────────────

  return (
    <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {filteredArticles.map((article, i) => (
        <a
          key={article.id}
          href={`/blog/${article.slug}`}
          style={{ '--i': i } as React.CSSProperties}
          className="card-stagger group rounded-xl border border-border-default bg-bg-surface p-5 transition-shadow hover:shadow-md"
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
          <h2 className="mt-3 text-h5 font-semibold text-text-primary group-hover:text-primary-500 transition-colors">
            {article.title}
          </h2>
          {article.summary && (
            <p className="mt-2 text-body-sm text-text-muted line-clamp-2">{article.summary}</p>
          )}
          <div className="mt-4 flex items-center gap-3 text-caption text-text-muted">
            {article.authorName && <span>{article.authorName}</span>}
            {article.publishedAt && <span>{formatDate(article.publishedAt)}</span>}
          </div>
        </a>
      ))}

      <style>{`
        .card-stagger {
          opacity: 0;
          animation: card-enter 0.3s ease-out forwards;
          animation-delay: calc(var(--i, 0) * 20ms);
        }

        @keyframes card-enter {
          from {
            opacity: 0;
            transform: translateY(8px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .card-stagger {
            opacity: 1;
            animation: none;
          }
        }
      `}</style>
    </div>
  );
}
