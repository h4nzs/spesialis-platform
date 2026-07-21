import { useState, useEffect, useCallback, useMemo } from 'react';
import { createBrowserClient } from '@ahlipanggilan/shared';
import { Card } from '@ahlipanggilan/ui';

// ── Types ────────────────────────────────────────────────────────

interface SeoCheckItem {
  status: boolean | 'warning';
  message: string;
  impact: 'critical' | 'moderate' | 'low';
}

interface SeoScoreData {
  articleId: string;
  seoScore: number;
  isPillarContent: boolean;
  pillarConnectionStatus: 'complete' | 'partial' | 'incomplete';
  checklist: {
    pillarLinkFound: SeoCheckItem;
    anchorTextOptimization: SeoCheckItem;
    linkDilutionCheck: SeoCheckItem;
  };
}

interface PillarSeoScoreProps {
  editingId?: string;
}

// ── Helpers ──────────────────────────────────────────────────────

function getScoreColor(score: number): string {
  if (score >= 80) return 'text-emerald-600';
  if (score >= 50) return 'text-amber-600';
  return 'text-danger-600';
}

function getScoreRing(score: number): string {
  if (score >= 80) return 'stroke-emerald-500';
  if (score >= 50) return 'stroke-amber-500';
  return 'stroke-danger-500';
}

function getScoreBg(score: number): string {
  if (score >= 80) return 'bg-emerald-50 border-emerald-200';
  if (score >= 50) return 'bg-amber-50 border-amber-200';
  return 'bg-danger-50 border-danger-200';
}

function getScoreLabel(score: number): string {
  if (score >= 80) return 'Baik';
  if (score >= 50) return 'Perlu Perbaikan';
  return 'Kritis';
}

function ImpactIcon({ impact }: { impact: SeoCheckItem['impact'] }) {
  switch (impact) {
    case 'critical':
      return (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="10"
          height="10"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="shrink-0 text-danger-500"
        >
          <circle cx="12" cy="12" r="10" />
          <line x1="12" y1="8" x2="12" y2="12" />
          <line x1="12" y1="16" x2="12.01" y2="16" />
        </svg>
      );
    case 'moderate':
      return (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="10"
          height="10"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="shrink-0 text-amber-500"
        >
          <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
          <line x1="12" y1="9" x2="12" y2="13" />
          <line x1="12" y1="17" x2="12.01" y2="17" />
        </svg>
      );
    case 'low':
      return (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="10"
          height="10"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="shrink-0 text-emerald-500"
        >
          <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
          <polyline points="22 4 12 14.01 9 11.01" />
        </svg>
      );
  }
}

function getImpactLabel(impact: SeoCheckItem['impact']): string {
  switch (impact) {
    case 'critical':
      return 'Kritis';
    case 'moderate':
      return 'Sedang';
    case 'low':
      return 'Ringan';
  }
}

// ── Circular Progress ────────────────────────────────────────────

function CircularScore({ score }: { score: number }) {
  const radius = 28;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;

  return (
    <div className="relative flex h-20 w-20 items-center justify-center">
      <svg className="h-20 w-20 -rotate-90" viewBox="0 0 64 64">
        {/* Background circle */}
        <circle cx="32" cy="32" r={radius} fill="none" stroke="#e5e7eb" strokeWidth="5" />
        {/* Progress circle */}
        <circle
          cx="32"
          cy="32"
          r={radius}
          fill="none"
          className={getScoreRing(score)}
          strokeWidth="5"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          style={{ transition: 'stroke-dashoffset 0.6s ease' }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className={`text-lg font-bold leading-tight ${getScoreColor(score)}`}>{score}</span>
        <span className="text-[8px] font-medium text-text-muted">/100</span>
      </div>
    </div>
  );
}

// ── Status Badge ─────────────────────────────────────────────────

function StatusBadge({ status }: { status: boolean | 'warning' }) {
  if (status === true) {
    return (
      <span className="inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-100">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="12"
          height="12"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="text-emerald-600"
        >
          <polyline points="20 6 9 17 4 12" />
        </svg>
      </span>
    );
  }
  if (status === 'warning') {
    return (
      <span className="inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-amber-100">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="12"
          height="12"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="text-amber-600"
        >
          <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
          <line x1="12" y1="9" x2="12" y2="13" />
          <line x1="12" y1="17" x2="12.01" y2="17" />
        </svg>
      </span>
    );
  }
  return (
    <span className="inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-danger-100">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="12"
        height="12"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="text-danger-600"
      >
        <line x1="18" y1="6" x2="6" y2="18" />
        <line x1="6" y1="6" x2="18" y2="18" />
      </svg>
    </span>
  );
}

// ── Check Item ───────────────────────────────────────────────────

function CheckItem({ item }: { item: SeoCheckItem }) {
  return (
    <div className="flex items-start gap-2">
      <StatusBadge status={item.status} />
      <div className="min-w-0 flex-1">
        <p className="text-xs leading-snug text-text-primary">{item.message}</p>
        <span className="mt-0.5 inline-flex items-center gap-1 text-[10px] font-medium text-text-muted">
          <ImpactIcon impact={item.impact} />
          Dampak: {getImpactLabel(item.impact)}
        </span>
      </div>
    </div>
  );
}

// ── Component ────────────────────────────────────────────────────

export function PillarSeoScore({ editingId }: PillarSeoScoreProps) {
  const api = useMemo(() => createBrowserClient(), []);
  const [seoData, setSeoData] = useState<SeoScoreData | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchScore = useCallback(async () => {
    if (!editingId) {
      setSeoData(null);
      return;
    }

    setLoading(true);
    try {
      const result = await api.get<SeoScoreData>(
        `/api/v1/admin/articles/seo-score?articleId=${editingId}`,
      );
      setSeoData(result ?? null);
    } catch {
      setSeoData(null);
    } finally {
      setLoading(false);
    }
  }, [editingId, api]);

  useEffect(() => {
    fetchScore();
  }, [fetchScore]);

  // ── No editing ID → save first ────────────────────────────────
  if (!editingId) {
    return null;
  }

  // ── Loading state ──────────────────────────────────────────────
  if (loading) {
    return (
      <Card>
        <h3 className="mb-3 text-sm font-semibold text-text-primary">📊 Skor SEO Internal Link</h3>
        <div className="flex items-center gap-2 text-xs text-text-muted">
          <div className="h-3 w-3 animate-spin rounded-full border-2 border-primary-500 border-t-transparent" />
          Menganalisis tautan internal...
        </div>
      </Card>
    );
  }

  // ── No data ────────────────────────────────────────────────────
  if (!seoData) {
    return null;
  }

  // ── Pillar content → show simple message ───────────────────────
  if (seoData.isPillarContent) {
    return null; // PillarLinkSuggestions already shows this
  }

  // ── SEO Score display ──────────────────────────────────────────
  return (
    <div className="relative">
      <Card>
        <h3 className="mb-3 text-sm font-semibold text-text-primary">📊 Skor SEO Internal Link</h3>

        {/* Score circle + label */}
        <div className="mb-4 flex items-center gap-4">
          <button
            type="button"
            onClick={fetchScore}
            className="absolute right-3 top-3 flex h-6 w-6 items-center justify-center rounded-md text-text-muted transition-colors hover:bg-neutral-100 hover:text-text-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-500"
            aria-label="Refresh skor"
            title="Refresh skor"
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
              className={loading ? 'animate-spin' : ''}
            >
              <polyline points="23 4 23 10 17 10" />
              <polyline points="1 20 1 14 7 14" />
              <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
            </svg>
          </button>
          <CircularScore score={seoData.seoScore} />
          <div>
            <p className={`text-sm font-semibold ${getScoreColor(seoData.seoScore)}`}>
              {getScoreLabel(seoData.seoScore)}
            </p>
            <p className="text-[11px] text-text-muted">
              {seoData.pillarConnectionStatus === 'complete'
                ? '✅ Terhubung dengan pilar'
                : seoData.pillarConnectionStatus === 'partial'
                  ? '⚠️ Terhubung sebagian'
                  : '❌ Belum terhubung ke pilar'}
            </p>
          </div>
        </div>

        {/* Checklist */}
        <div
          className={`
        space-y-3 rounded-lg border p-3
        ${getScoreBg(seoData.seoScore)}
      `}
        >
          <p className="text-[11px] font-medium text-text-secondary">Checklist SEO Internal Link</p>
          <CheckItem item={seoData.checklist.pillarLinkFound} />
          <CheckItem item={seoData.checklist.anchorTextOptimization} />
          <CheckItem item={seoData.checklist.linkDilutionCheck} />
        </div>
      </Card>
    </div>
  );
}
