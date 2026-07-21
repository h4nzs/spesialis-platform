import { useState, useEffect, useMemo } from 'react';
import { createBrowserClient } from '@ahlipanggilan/shared';
import { Card, Badge, EmptyState, TableSkeleton } from '@ahlipanggilan/ui';

// ── Types ────────────────────────────────────────────────────────

interface ClusterArticle {
  id: string;
  title: string;
  slug: string;
}

interface PillarItem {
  id: string;
  title: string;
  slug: string;
  status: string;
  clusterCount: number;
  clusterArticles: ClusterArticle[];
}

interface OrphanItem {
  id: string;
  title: string;
  slug: string;
  status: string;
  categoryName: string | null;
  publishedAt: string | null;
}

interface PillarOverviewData {
  totalPillars: number;
  totalClusters: number;
  totalOrphans: number;
  totalArticles: number;
  pillars: PillarItem[];
  orphans: OrphanItem[];
}

// ── Helpers ──────────────────────────────────────────────────────

function getClusterBadge(count: number) {
  if (count === 0) return { variant: 'default' as const, label: 'Tidak ada' };
  if (count <= 2) return { variant: 'warning' as const, label: `${count} artikel` };
  if (count <= 5) return { variant: 'success' as const, label: `${count} artikel` };
  return { variant: 'success' as const, label: `${count} artikel` };
}

// ── Stat Card ────────────────────────────────────────────────────

function StatCard({
  label,
  value,
  color,
  icon,
}: {
  label: string;
  value: string | number;
  color: string;
  icon: string;
}) {
  return (
    <div className="rounded-xl border border-border-default bg-bg-surface p-4 transition-colors hover:border-primary-200">
      <div className="flex items-center gap-3">
        <div
          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${color}`}
          dangerouslySetInnerHTML={{ __html: icon }}
        />
        <div>
          <p className="text-2xl font-bold text-text-primary">{value}</p>
          <p className="text-xs text-text-muted">{label}</p>
        </div>
      </div>
    </div>
  );
}

// ── Icons ────────────────────────────────────────────────────────

const ICONS = {
  pillar:
    '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-white"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>',
  cluster:
    '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-white"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>',
  orphan:
    '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-white"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>',
  total:
    '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-white"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/><line x1="16" x2="8" y1="13" y2="13"/><line x1="16" x2="8" y1="17" y2="17"/></svg>',
  link: '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>',
  expand:
    '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m9 18 6-6-6-6"/></svg>',
};

// ── Pillar Table Row ─────────────────────────────────────────────

function PillarRow({ pillar, defaultExpanded }: { pillar: PillarItem; defaultExpanded: boolean }) {
  const [expanded, setExpanded] = useState(defaultExpanded);
  const badge = getClusterBadge(pillar.clusterCount);

  return (
    <div className="border-b border-border-default last:border-b-0">
      {/* Main row */}
      <div
        className="flex cursor-pointer items-center gap-3 px-4 py-3 transition-colors hover:bg-neutral-50"
        onClick={() => setExpanded((v) => !v)}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            setExpanded((v) => !v);
          }
        }}
      >
        <div
          className={`flex shrink-0 items-center justify-center transition-transform duration-200 ${
            expanded ? 'rotate-90' : ''
          }`}
          dangerouslySetInnerHTML={{ __html: ICONS.expand }}
        />
        <div className="min-w-0 flex-1">
          <a
            href={`/dashboard/admin/articles/edit/${pillar.id}`}
            className="text-sm font-medium text-text-primary hover:text-primary-600 transition-colors"
            onClick={(e) => e.stopPropagation()}
          >
            {pillar.title}
          </a>
          <div className="flex items-center gap-2">
            <span className="text-xs text-text-muted">/blog/{pillar.slug}</span>
            <Badge variant={pillar.status === 'Published' ? 'success' : 'warning'}>
              {pillar.status}
            </Badge>
          </div>
        </div>
        <Badge variant={badge.variant}>{badge.label}</Badge>
      </div>

      {/* Expanded cluster articles */}
      {expanded && (
        <div className="border-t border-border-default bg-neutral-50 px-4 py-3">
          {pillar.clusterArticles.length > 0 ? (
            <div className="space-y-2">
              <p className="text-xs font-medium text-text-secondary">
                Artikel Cluster ({pillar.clusterArticles.length})
              </p>
              {pillar.clusterArticles.map((ca) => (
                <a
                  key={ca.id}
                  href={`/dashboard/admin/articles/edit/${ca.id}`}
                  className="flex items-center gap-2 rounded-md bg-white px-3 py-2 text-xs transition-colors hover:bg-primary-50"
                >
                  <span
                    className="shrink-0 text-text-muted"
                    dangerouslySetInnerHTML={{ __html: ICONS.link }}
                  />
                  <span className="font-medium text-text-primary">{ca.title}</span>
                  <span className="text-text-muted">/blog/{ca.slug}</span>
                </a>
              ))}
            </div>
          ) : (
            <p className="text-xs italic text-text-muted">
              Belum ada artikel cluster yang menautkan ke pilar ini.
            </p>
          )}
        </div>
      )}
    </div>
  );
}

// ── Main Component ───────────────────────────────────────────────

export function PillarClusterVisualizer() {
  const api = useMemo(() => createBrowserClient(), []);
  const [data, setData] = useState<PillarOverviewData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const result = await api.get<PillarOverviewData>('/api/v1/admin/articles/pillar-overview');
        setData(result ?? null);
      } catch {
        setData(null);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [api]);

  if (loading) {
    return (
      <div className="space-y-6">
        <h1 className="text-h3 font-bold text-text-primary">Cluster Visualizer</h1>
        <TableSkeleton />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="space-y-6">
        <h1 className="text-h3 font-bold text-text-primary">Cluster Visualizer</h1>
        <Card>
          <EmptyState
            title="Gagal memuat data"
            description="Terjadi kesalahan saat mengambil data cluster."
          />
        </Card>
      </div>
    );
  }

  const connectionRate =
    data.totalArticles > 0
      ? Math.round(((data.totalPillars + data.totalClusters) / data.totalArticles) * 100)
      : 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-h3 font-bold text-text-primary">Cluster Visualizer</h1>
        <button
          type="button"
          onClick={() => window.location.reload()}
          className="flex items-center gap-1.5 rounded-lg border border-border-default px-3 py-1.5 text-xs font-medium text-text-secondary transition-colors hover:bg-neutral-100 hover:text-text-primary"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polyline points="23 4 23 10 17 10" />
            <polyline points="1 20 1 14 7 14" />
            <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
          </svg>
          Refresh
        </button>
      </div>

      {/* ── Summary Stats ──────────────────────────────────────── */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <StatCard
          label="Total Artikel"
          value={data.totalArticles}
          color="bg-primary-500"
          icon={ICONS.total}
        />
        <StatCard
          label="Content Pillar"
          value={data.totalPillars}
          color="bg-amber-500"
          icon={ICONS.pillar}
        />
        <StatCard
          label="Cluster Articles"
          value={data.totalClusters}
          color="bg-emerald-500"
          icon={ICONS.cluster}
        />
        <StatCard
          label="Orphan Articles"
          value={data.totalOrphans}
          color="bg-danger-500"
          icon={ICONS.orphan}
        />
      </div>

      {/* ── Connection Status Bar ──────────────────────────────── */}
      <Card>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold text-text-primary">Konektivitas Cluster</p>
            <span className="text-sm font-bold text-text-primary">{connectionRate}%</span>
          </div>
          <div className="h-2.5 w-full overflow-hidden rounded-full bg-neutral-100">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                connectionRate >= 80
                  ? 'bg-emerald-500'
                  : connectionRate >= 50
                    ? 'bg-amber-500'
                    : 'bg-danger-500'
              }`}
              style={{ width: `${connectionRate}%` }}
            />
          </div>
          <p className="text-xs text-text-muted">
            {data.totalOrphans > 0
              ? `${data.totalOrphans} artikel orphan belum terhubung ke pilar mana pun. Edit artikel tersebut dan tambahkan tautan ke artikel pilar yang relevan.`
              : data.totalPillars === 0
                ? 'Belum ada content pillar. Buat artikel pilar dengan mencentang opsi "Jadikan sebagai Content Pillar".'
                : 'Semua artikel terhubung dengan baik ke content pillar!'}
          </p>
        </div>
      </Card>

      {/* ── Pillar Table ───────────────────────────────────────── */}
      <Card>
        <h2 className="mb-4 text-sm font-semibold text-text-primary">
          Artikel Pilar ({data.pillars.length})
        </h2>
        {data.pillars.length > 0 ? (
          <div className="-mx-4 -mb-4">
            {data.pillars.map((p, idx) => (
              <PillarRow key={p.id} pillar={p} defaultExpanded={idx === 0 && p.clusterCount > 0} />
            ))}
          </div>
        ) : (
          <EmptyState
            title="Belum ada Content Pillar"
            description="Buat artikel dan centang opsi 'Jadikan sebagai Content Pillar' di pengaturan."
          />
        )}
      </Card>

      {/* ── Orphan Articles ────────────────────────────────────── */}
      {data.orphans.length > 0 && (
        <Card>
          <div className="flex items-center gap-2">
            <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-danger-100 text-xs font-bold text-danger-600">
              {data.orphans.length}
            </span>
            <h2 className="text-sm font-semibold text-text-primary">Artikel Orphan</h2>
            <span className="text-xs text-text-muted">
              — artikel yang belum memiliki tautan ke content pillar
            </span>
          </div>
          <div className="mt-4 -mx-4 -mb-4">
            {data.orphans.map((o) => (
              <div
                key={o.id}
                className="flex items-center gap-3 border-b border-border-default px-4 py-3 last:border-b-0"
              >
                <span
                  className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-danger-100"
                  dangerouslySetInnerHTML={{
                    __html:
                      '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-danger-600"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>',
                  }}
                />
                <div className="min-w-0 flex-1">
                  <a
                    href={`/dashboard/admin/articles/edit/${o.id}`}
                    className="text-sm font-medium text-text-primary hover:text-primary-600 transition-colors"
                  >
                    {o.title}
                  </a>
                  <div className="flex items-center gap-2 text-xs text-text-muted">
                    <span>/blog/{o.slug}</span>
                    {o.categoryName && <span>• {o.categoryName}</span>}
                    <Badge variant={o.status === 'Published' ? 'success' : 'warning'}>
                      {o.status}
                    </Badge>
                  </div>
                </div>
                <a
                  href={`/dashboard/admin/articles/edit/${o.id}`}
                  className="shrink-0 text-xs font-medium text-primary hover:text-primary-hover transition-colors"
                >
                  Edit &rarr;
                </a>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}
