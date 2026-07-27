import { useState, useEffect } from 'react';
import { createBrowserClient } from '@ahlipanggilan/shared';
import type { CmsArticle, ArticleItem } from './utils';
import { formatDate, transformArticle } from './utils';
import { TableOfContents } from './TableOfContents';

interface BlogSidebarProps {
  currentSlug: string;
  categorySlug: string | null;
  contentHtml?: string;
}

interface AdItem {
  id: string;
  title: string;
  imageUrl: string;
  caption: string | null;
  linkUrl: string | null;
  displayOrder: number;
}

function RelatedArticlesList({
  currentSlug,
  categorySlug,
}: {
  currentSlug: string;
  categorySlug: string | null;
}) {
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
          .slice(0, 5);
        setArticles(related);
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
      });
  }, [currentSlug, categorySlug]);

  // Don't render if no category or no related articles
  if (!categorySlug || (!loading && articles.length === 0)) return null;

  if (loading) {
    return (
      <div className="rounded-xl border border-border-default bg-bg-surface p-4">
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-text-primary">Artikel Terkait</h3>
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="animate-pulse flex gap-3">
              <div className="h-16 w-16 shrink-0 rounded-lg bg-neutral-200" />
              <div className="flex-1 space-y-2">
                <div className="h-3 w-3/4 rounded bg-neutral-200" />
                <div className="h-3 w-1/2 rounded bg-neutral-200" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-border-default bg-bg-surface p-4">
      <div className="space-y-1">
        <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-text-muted">
          Artikel Terkait
        </h3>
        <div className="space-y-0">
          {articles.map((article) => (
            <a
              key={article.id}
              href={`/blog/${article.slug}`}
              className="group flex items-start gap-3 rounded-lg px-2 py-2.5 transition-colors hover:bg-neutral-50 -mx-2"
            >
              {article.coverImage ? (
                <div className="h-16 w-16 shrink-0 overflow-hidden rounded-lg">
                  <img
                    src={article.coverImage}
                    alt={article.title}
                    loading="lazy"
                    decoding="async"
                    width="64"
                    height="64"
                    className="h-full w-full object-cover transition-transform group-hover:scale-105"
                  />
                </div>
              ) : (
                <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-lg bg-neutral-100 text-xl">
                  📝
                </div>
              )}
              <div className="min-w-0 flex-1">
                <h4 className="text-sm font-medium text-text-primary leading-snug transition-colors group-hover:text-primary line-clamp-2">
                  {article.title}
                </h4>
                <div className="mt-1 flex items-center gap-2 text-xs text-text-muted">
                  {article.categoryName && <span className="truncate">{article.categoryName}</span>}
                  {article.publishedAt && (
                    <>
                      <span aria-hidden="true">·</span>
                      <span className="whitespace-nowrap">{formatDate(article.publishedAt)}</span>
                    </>
                  )}
                </div>
              </div>
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}

function AdSlots() {
  const [ads, setAds] = useState<AdItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const api = createBrowserClient();

    api
      .get<AdItem[]>('/api/v1/cms/ads')
      .then((data) => {
        setAds(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
      });
  }, []);

  if (loading) return null;
  if (ads.length === 0) return null;

  return (
    <div className="rounded-xl border border-border-default bg-bg-surface p-4">
      <div className="space-y-1">
        <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-text-muted">
          Iklan
        </h3>
        <div className="grid grid-cols-2 gap-3">
          {ads.slice(0, 10).map((ad) => (
            <a
              key={ad.id}
              href={ad.linkUrl ?? '#'}
              target={ad.linkUrl ? '_blank' : undefined}
              rel={ad.linkUrl ? 'noopener noreferrer' : undefined}
              className="group flex flex-col overflow-hidden rounded-xl border border-border-default bg-bg-surface transition-shadow hover:shadow-md"
            >
              <div className="aspect-square w-full overflow-hidden bg-neutral-100">
                <img
                  src={ad.imageUrl}
                  alt={ad.title}
                  loading="lazy"
                  decoding="async"
                  width="200"
                  height="200"
                  className="h-full w-full object-cover transition-transform group-hover:scale-105"
                />
              </div>
              {ad.caption && (
                <div className="px-2 py-1.5">
                  <p className="text-xs text-text-secondary line-clamp-2 leading-relaxed">
                    {ad.caption}
                  </p>
                </div>
              )}
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}

export function BlogSidebar({ currentSlug, categorySlug, contentHtml }: BlogSidebarProps) {
  return (
    <aside className="w-full space-y-6 lg:w-80 shrink-0">
      <div className="sticky top-24 space-y-6">
        {contentHtml && <TableOfContents contentHtml={contentHtml} />}
        <RelatedArticlesList currentSlug={currentSlug} categorySlug={categorySlug} />
        <AdSlots />
      </div>
    </aside>
  );
}
