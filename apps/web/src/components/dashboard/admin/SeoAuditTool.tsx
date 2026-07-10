import { useState, useEffect, useCallback, useMemo } from 'react';
import { createBrowserClient } from '@specialist/shared';
import { Button, Select, Table, EmptyState, TableSkeleton } from '@specialist/ui';
import type { Column } from '@specialist/ui';

// ── Types ──────────────────────────────────────────────────────

interface ArticleData {
  id: string;
  title: string;
  slug: string;
  content: string | null;
  coverImage: string | null;
  status: string;
  metaTitle: string | null;
  metaDescription: string | null;
  ogImage: string | null;
  categoryName: string | null;
  publishedAt: string | null;
  createdAt: string;
}

interface AuditIssue {
  articleId: string;
  articleTitle: string;
  articleSlug: string;
  articleStatus: string;
  type: string;
  label: string;
  severity: 'critical' | 'warning' | 'info';
  message: string;
  currentValue: string;
}

type IssueFilter = 'all' | 'critical' | 'warning' | 'info';

// ── Constants ──────────────────────────────────────────────────

const SEVERITY_FILTERS = [
  { value: 'all', label: 'Semua Issue' },
  { value: 'critical', label: 'Kritis' },
  { value: 'warning', label: 'Peringatan' },
  { value: 'info', label: 'Info' },
];

// ── Helpers ────────────────────────────────────────────────────

function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, '');
}

function countWords(text: string): number {
  const cleaned = stripHtml(text).trim();
  if (!cleaned) return 0;
  return cleaned.split(/\s+/).length;
}

function countImages(html: string): number {
  return (html.match(/<img[^>]*>/gi) ?? []).length;
}

function countImagesWithoutAlt(html: string): number {
  const images = html.match(/<img[^>]*>/gi) ?? [];
  return images.filter((img) => {
    const alt = img.match(/alt\s*=\s*"([^"]*)"/i);
    return !alt || alt[1]?.trim() === '';
  }).length;
}

// ── Component ──────────────────────────────────────────────────

export function SeoAuditTool() {
  const api = useMemo(() => createBrowserClient(), []);

  const [articles, setArticles] = useState<ArticleData[]>([]);
  const [initialLoading, setInitialLoading] = useState(true);
  const [scanning, setScanning] = useState(false);
  const [issues, setIssues] = useState<AuditIssue[]>([]);
  const [scanned, setScanned] = useState(false);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState<IssueFilter>('all');

  // ── Fetch all articles ─────────────────────────────────────
  const fetchArticles = useCallback(async () => {
    setInitialLoading(true);
    setError('');
    try {
      // Fetch in batches of 100 to handle large article counts
      let allArticles: ArticleData[] = [];
      let page = 1;
      let hasMore = true;

      while (hasMore) {
        const { data: rawData } = await api.getPaginated<Record<string, unknown>>(
          '/api/v1/admin/articles',
          { params: { page, limit: 100 } },
        );

        const items: ArticleData[] = (Array.isArray(rawData) ? rawData : []).map((d) => ({
          id: (d.id as string) ?? '',
          title: (d.title as string) ?? '',
          slug: (d.slug as string) ?? '',
          content: (d.content as string) ?? null,
          coverImage: (d.coverImage as string) ?? null,
          status: (d.status as string) ?? 'Draft',
          metaTitle: (d.metaTitle as string) ?? null,
          metaDescription: (d.metaDescription as string) ?? null,
          ogImage: (d.ogImage as string) ?? null,
          categoryName: (d.categoryName as string) ?? null,
          publishedAt: (d.publishedAt as string) ?? null,
          createdAt: (d.createdAt as string) ?? '',
        }));

        allArticles = [...allArticles, ...items];
        hasMore = items.length === 100;
        page++;
      }

      setArticles(allArticles);
    } catch {
      setError('Gagal memuat artikel');
      setArticles([]);
    } finally {
      setInitialLoading(false);
    }
  }, [api]);

  useEffect(() => {
    fetchArticles();
  }, [fetchArticles]);

  // ── Run audit ──────────────────────────────────────────────
  const runAudit = useCallback(() => {
    setScanning(true);
    setError('');

    // Use setTimeout to let the UI update before blocking
    setTimeout(() => {
      const found: AuditIssue[] = [];
      const titleMap: Record<string, string[]> = {};

      for (const article of articles) {
        const wordCount = article.content ? countWords(article.content) : 0;
        const totalImages = article.content ? countImages(article.content) : 0;
        const missingAlt = article.content ? countImagesWithoutAlt(article.content) : 0;
        const metaTitle = article.metaTitle ?? '';
        const metaDesc = article.metaDescription ?? '';

        // ── Missing meta title ──────────────────────────────
        if (!metaTitle.trim()) {
          found.push({
            articleId: article.id,
            articleTitle: article.title,
            articleSlug: article.slug,
            articleStatus: article.status,
            type: 'missingMetaTitle',
            label: 'Meta Title',
            severity: 'critical',
            message: 'Meta title tidak diisi',
            currentValue: '(kosong)',
          });
        } else if (metaTitle.length > 60) {
          found.push({
            articleId: article.id,
            articleTitle: article.title,
            articleSlug: article.slug,
            articleStatus: article.status,
            type: 'metaTitleTooLong',
            label: 'Meta Title',
            severity: 'warning',
            message: `Meta title terlalu panjang (${metaTitle.length}/60 karakter)`,
            currentValue: metaTitle,
          });
        }

        // ── Missing meta description ────────────────────────
        if (!metaDesc.trim()) {
          found.push({
            articleId: article.id,
            articleTitle: article.title,
            articleSlug: article.slug,
            articleStatus: article.status,
            type: 'missingMetaDesc',
            label: 'Meta Description',
            severity: 'warning',
            message: 'Meta description tidak diisi',
            currentValue: '(kosong)',
          });
        } else if (metaDesc.length > 160) {
          found.push({
            articleId: article.id,
            articleTitle: article.title,
            articleSlug: article.slug,
            articleStatus: article.status,
            type: 'metaDescTooLong',
            label: 'Meta Description',
            severity: 'warning',
            message: `Meta description terlalu panjang (${metaDesc.length}/160 karakter)`,
            currentValue: metaDesc,
          });
        }

        // ── Short content ───────────────────────────────────
        if (wordCount > 0 && wordCount < 300) {
          found.push({
            articleId: article.id,
            articleTitle: article.title,
            articleSlug: article.slug,
            articleStatus: article.status,
            type: 'shortContent',
            label: 'Konten',
            severity: 'warning',
            message: `Konten terlalu pendek (${wordCount} kata, minimal 300)`,
            currentValue: `${wordCount} kata`,
          });
        }

        // ── Missing OG image ─────────────────────────────────
        if (!article.ogImage && article.status === 'Published') {
          found.push({
            articleId: article.id,
            articleTitle: article.title,
            articleSlug: article.slug,
            articleStatus: article.status,
            type: 'missingOgImage',
            label: 'OG Image',
            severity: 'warning',
            message: 'OG Image tidak diisi (artikel published)',
            currentValue: '(kosong)',
          });
        }

        // ── Missing cover image ──────────────────────────────
        if (!article.coverImage && article.status === 'Published') {
          found.push({
            articleId: article.id,
            articleTitle: article.title,
            articleSlug: article.slug,
            articleStatus: article.status,
            type: 'missingCoverImage',
            label: 'Cover Image',
            severity: 'warning',
            message: 'Gambar sampul tidak diisi (artikel published)',
            currentValue: '(kosong)',
          });
        }

        // ── Missing alt text on images ───────────────────────
        if (missingAlt > 0) {
          found.push({
            articleId: article.id,
            articleTitle: article.title,
            articleSlug: article.slug,
            articleStatus: article.status,
            type: 'missingAltTags',
            label: 'Alt Text Gambar',
            severity: 'warning',
            message: `${missingAlt} dari ${totalImages} gambar tidak memiliki alt text`,
            currentValue: `${missingAlt}/${totalImages} tanpa alt`,
          });
        }

        // ── No images at all ─────────────────────────────────
        if (totalImages === 0 && wordCount > 200) {
          found.push({
            articleId: article.id,
            articleTitle: article.title,
            articleSlug: article.slug,
            articleStatus: article.status,
            type: 'noImages',
            label: 'Konten Visual',
            severity: 'info',
            message: 'Konten tidak memiliki gambar',
            currentValue: '0 gambar',
          });
        }

        // ── Track meta titles for duplicates ─────────────────
        if (metaTitle.trim()) {
          const key = metaTitle.trim().toLowerCase();
          if (!titleMap[key]) titleMap[key] = [];
          titleMap[key].push(article.title);
        }
      }

      // ── Duplicate meta titles ─────────────────────────────
      for (const [title, titles] of Object.entries(titleMap)) {
        if (titles.length > 1) {
          for (const article of articles) {
            if ((article.metaTitle ?? '').trim().toLowerCase() === title) {
              found.push({
                articleId: article.id,
                articleTitle: article.title,
                articleSlug: article.slug,
                articleStatus: article.status,
                type: 'dupMetaTitle',
                label: 'Duplikat Meta Title',
                severity: 'critical',
                message: `Meta title duplikat dengan ${titles.length - 1} artikel lain: "${titles.filter((t) => t !== article.title).join(', ')}"`,
                currentValue: article.metaTitle ?? '',
              });
            }
          }
        }
      }

      setIssues(found);
      setScanned(true);
      setScanning(false);
    }, 50);
  }, [articles]);

  // ── Auto-run on load ────────────────────────────────────────
  useEffect(() => {
    if (!initialLoading && articles.length > 0 && !scanned) {
      runAudit();
    }
  }, [initialLoading, articles.length, scanned, runAudit]);

  // ── Filtered issues ─────────────────────────────────────────
  const filteredIssues = useMemo(() => {
    if (filter === 'all') return issues;
    return issues.filter((i) => i.severity === filter);
  }, [issues, filter]);

  // ── Summary stats ───────────────────────────────────────────
  const stats = useMemo(() => {
    const critical = issues.filter((i) => i.severity === 'critical').length;
    const warnings = issues.filter((i) => i.severity === 'warning').length;
    const infos = issues.filter((i) => i.severity === 'info').length;
    return { critical, warnings, infos, total: articles.length };
  }, [issues, articles.length]);

  // ── Columns ─────────────────────────────────────────────────
  const columns: Column<AuditIssue>[] = [
    {
      key: 'articleTitle',
      header: 'Artikel',
      render: (item) => (
        <div>
          <a
            href={`/dashboard/admin/articles/edit/${item.articleId}`}
            className="text-sm font-medium text-primary-600 hover:text-primary-700 hover:underline"
          >
            {item.articleTitle}
          </a>
          <span
            className={`ml-2 inline-block rounded-full px-1.5 py-0.5 text-[9px] font-medium ${
              item.articleStatus === 'Published'
                ? 'text-success-600 bg-success-50'
                : item.articleStatus === 'Draft'
                  ? 'text-text-muted bg-neutral-100'
                  : 'text-warning-600 bg-warning-50'
            }`}
          >
            {item.articleStatus}
          </span>
        </div>
      ),
    },
    {
      key: 'severity',
      header: 'Severity',
      render: (item) => (
        <span
          className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium ${
            item.severity === 'critical'
              ? 'bg-danger-50 text-danger-600'
              : item.severity === 'warning'
                ? 'bg-warning-50 text-warning-600'
                : 'bg-info-50 text-info-600'
          }`}
        >
          {item.severity === 'critical'
            ? '🔴 Kritis'
            : item.severity === 'warning'
              ? '🟡 Peringatan'
              : '🔵 Info'}
        </span>
      ),
    },
    {
      key: 'label',
      header: 'Komponen',
      render: (item) => <span className="text-sm text-text-primary">{item.label}</span>,
    },
    {
      key: 'message',
      header: 'Issue',
      render: (item) => (
        <span className="text-sm text-text-secondary max-w-xs block" title={item.message}>
          {item.message.length > 80 ? item.message.slice(0, 80) + '…' : item.message}
        </span>
      ),
    },
    {
      key: 'currentValue',
      header: 'Nilai Saat Ini',
      render: (item) => (
        <span
          className="text-xs text-text-muted font-mono max-w-[150px] block truncate"
          title={item.currentValue}
        >
          {item.currentValue.length > 40 ? item.currentValue.slice(0, 40) + '…' : item.currentValue}
        </span>
      ),
    },
    {
      key: 'articleId',
      header: '',
      render: (item) => (
        <a
          href={`/dashboard/admin/articles/edit/${item.articleId}`}
          className="text-xs text-primary-600 hover:text-primary-700 hover:underline shrink-0"
        >
          Edit
        </a>
      ),
    },
  ];

  if (initialLoading) return <TableSkeleton />;

  return (
    <div className="space-y-6">
      {error && (
        <div className="rounded-lg border border-danger-200 bg-danger-50 px-4 py-3 text-sm text-danger-700">
          {error}
        </div>
      )}

      {/* ── Summary Cards ──────────────────────────────────────── */}
      <div className="grid gap-4 sm:grid-cols-4">
        <div className="rounded-lg border border-border-default bg-bg-surface p-4 space-y-1">
          <p className="text-body-sm text-text-secondary">Total Artikel</p>
          <p className="text-h3 font-bold text-text-primary">{stats.total}</p>
        </div>
        <div className="rounded-lg border border-success-200 bg-success-50 p-4 space-y-1">
          <p className="text-body-sm text-success-600">Issue Kritis</p>
          <p className="text-h3 font-bold text-success-600">{stats.critical}</p>
        </div>
        <div className="rounded-lg border border-warning-200 bg-warning-50 p-4 space-y-1">
          <p className="text-body-sm text-warning-600">Peringatan</p>
          <p className="text-h3 font-bold text-warning-600">{stats.warnings}</p>
        </div>
        <div className="rounded-lg border border-border-default bg-bg-surface p-4 space-y-1">
          <p className="text-body-sm text-text-secondary">Info</p>
          <p className="text-h3 font-bold text-text-primary">{stats.infos}</p>
        </div>
      </div>

      {/* ── Actions ────────────────────────────────────────────── */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-44">
            <Select
              label="Filter Severity"
              value={filter}
              onChange={(e) => setFilter(e.target.value as IssueFilter)}
              options={SEVERITY_FILTERS}
            />
          </div>
          <span className="text-sm text-text-muted">{filteredIssues.length} issue ditemukan</span>
        </div>
        <div className="flex items-center gap-2">
          {scanned && (
            <span className="text-xs text-text-muted">
              {scanned ? `Terakhir: ${new Date().toLocaleTimeString('id-ID')}` : ''}
            </span>
          )}
          <Button onClick={runAudit} disabled={scanning}>
            {scanning ? 'Memindai...' : 'Scan Ulang'}
          </Button>
        </div>
      </div>

      {/* ── Scanning progress ──────────────────────────────────── */}
      {scanning && (
        <div className="flex items-center gap-2 text-sm text-text-muted">
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          Menganalisis {articles.length} artikel...
        </div>
      )}

      {/* ── Results table ──────────────────────────────────────── */}
      {!scanning && (
        <Table
          data={filteredIssues}
          columns={columns}
          keyExtractor={(item: AuditIssue) => `${item.articleId}-${item.type}`}
          emptyState={
            <EmptyState
              title="Tidak ada issue"
              description={
                filter !== 'all'
                  ? `Tidak ada issue dengan severity "${filter}".`
                  : 'Semua artikel sudah dioptimasi dengan baik! 🎉'
              }
            />
          }
        />
      )}
    </div>
  );
}
