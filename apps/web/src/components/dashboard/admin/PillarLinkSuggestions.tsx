import { useState, useEffect, useCallback, useMemo } from 'react';
import { createBrowserClient } from '@ahlipanggilan/shared';
import { Card, Button } from '@ahlipanggilan/ui';

// ── Types ────────────────────────────────────────────────────────

interface SuggestionItem {
  id: string;
  title: string;
  slug: string;
  url: string;
  relevanceScore: number;
  matchedTags: string[];
  suggestedAnchor: string;
  reason: string;
}

interface PillarLinkSuggestionsProps {
  /** ID artikel yang sedang diedit. Undefined = artikel baru. */
  editingId?: string;
  /** Apakah artikel saat ini adalah pillar content */
  isPillarContent: boolean;
}

// ── Helpers ──────────────────────────────────────────────────────

function getScoreColor(score: number): string {
  if (score >= 0.7) return 'bg-emerald-100 text-emerald-700';
  if (score >= 0.4) return 'bg-amber-100 text-amber-700';
  return 'bg-slate-100 text-slate-600';
}

function getScoreLabel(score: number): string {
  if (score >= 0.7) return 'Sangat Relevan';
  if (score >= 0.4) return 'Cukup Relevan';
  return 'Relevansi Rendah';
}

// ── Component ────────────────────────────────────────────────────

export function PillarLinkSuggestions({ editingId, isPillarContent }: PillarLinkSuggestionsProps) {
  const api = useMemo(() => createBrowserClient(), []);
  const [suggestions, setSuggestions] = useState<SuggestionItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const fetchSuggestions = useCallback(async () => {
    if (!editingId || isPillarContent) {
      setSuggestions([]);
      return;
    }

    setLoading(true);
    try {
      const result = await api.get<SuggestionItem[]>(
        `/api/v1/admin/articles/suggestions?articleId=${editingId}`,
      );
      setSuggestions(Array.isArray(result) ? result : []);
    } catch {
      setSuggestions([]);
    } finally {
      setLoading(false);
    }
  }, [editingId, isPillarContent, api]);

  useEffect(() => {
    fetchSuggestions();
  }, [fetchSuggestions]);

  const handleCopyLink = useCallback(async (item: SuggestionItem) => {
    try {
      const fullUrl = `${window.location.origin}${item.url}`;
      await navigator.clipboard.writeText(fullUrl);
      setCopiedId(item.id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch {
      // Fallback: copy relative URL
      try {
        await navigator.clipboard.writeText(item.url);
        setCopiedId(item.id);
        setTimeout(() => setCopiedId(null), 2000);
      } catch {
        // silent
      }
    }
  }, []);

  // ── Pillar content → show info message ─────────────────────────
  if (isPillarContent) {
    return (
      <Card>
        <h3 className="mb-3 text-sm font-semibold text-text-primary">
          <span className="flex items-center gap-1.5">
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
              className="text-primary-500"
            >
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
            </svg>
            Content Pillar
          </span>
        </h3>
        <p className="text-xs text-text-muted">
          Artikel ini adalah <strong>Content Pillar</strong>. Artikel cluster akan direkomendasikan
          untuk menautkannya. Tidak ada rekomendasi tautan yang diperlukan.
        </p>
      </Card>
    );
  }

  // ── No editing ID → create first ──────────────────────────────
  if (!editingId) {
    return (
      <Card>
        <h3 className="mb-3 text-sm font-semibold text-text-primary">
          💡 Rekomendasi Tautan Internal
        </h3>
        <p className="text-xs text-text-muted">
          Simpan artikel terlebih dahulu untuk melihat rekomendasi artikel pilar yang relevan.
        </p>
      </Card>
    );
  }

  // ── Loading state ──────────────────────────────────────────────
  if (loading) {
    return (
      <Card>
        <h3 className="mb-3 text-sm font-semibold text-text-primary">
          💡 Rekomendasi Tautan Internal
        </h3>
        <div className="flex items-center gap-2 text-xs text-text-muted">
          <div className="h-3 w-3 animate-spin rounded-full border-2 border-primary-500 border-t-transparent" />
          Mencari artikel pilar yang relevan...
        </div>
      </Card>
    );
  }

  // ── Empty state ────────────────────────────────────────────────
  if (suggestions.length === 0) {
    return (
      <Card>
        <h3 className="mb-3 text-sm font-semibold text-text-primary">
          💡 Rekomendasi Tautan Internal
        </h3>
        <p className="text-xs text-text-muted">
          Belum ada artikel pilar yang relevan. Buat artikel pilar terlebih dahulu dengan mencentang
          opsi <strong>"Jadikan sebagai Content Pillar"</strong> pada artikel utama.
        </p>
      </Card>
    );
  }

  // ── Suggestions list ───────────────────────────────────────────
  return (
    <Card>
      <h3 className="mb-3 text-sm font-semibold text-text-primary">
        💡 Rekomendasi Tautan Internal
        <span className="ml-1.5 text-xs font-normal text-text-muted">
          ({suggestions.length} ditemukan)
        </span>
      </h3>

      <div className="space-y-3">
        {suggestions.map((item) => (
          <div
            key={item.id}
            className="rounded-lg border border-border-default bg-bg-surface p-3 transition-colors hover:border-primary-200"
          >
            {/* Header: title + score */}
            <div className="mb-1.5 flex items-start justify-between gap-2">
              <a
                href={item.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm font-medium text-text-primary hover:text-primary-600 transition-colors line-clamp-2"
                title={item.title}
              >
                {item.title}
              </a>
              <span
                className={`shrink-0 rounded-full px-1.5 py-0.5 text-[10px] font-semibold leading-tight ${getScoreColor(item.relevanceScore)}`}
                title={getScoreLabel(item.relevanceScore)}
              >
                {Math.round(item.relevanceScore * 100)}%
              </span>
            </div>

            {/* Matched tags */}
            {item.matchedTags.length > 0 && (
              <div className="mb-1.5 flex flex-wrap gap-1">
                {item.matchedTags.map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center rounded-full bg-primary-50 px-1.5 py-0.5 text-[10px] font-medium text-primary-600"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}

            {/* Reason */}
            <p className="mb-2 text-[11px] leading-snug text-text-muted">{item.reason}</p>

            {/* Suggested anchor + copy button */}
            <div className="flex items-center gap-2">
              <div className="min-w-0 flex-1">
                <span className="text-[10px] font-medium text-text-secondary">Anchor: </span>
                <span className="text-[11px] italic text-text-muted">"{item.suggestedAnchor}"</span>
              </div>
              <Button
                type="button"
                size="sm"
                variant={copiedId === item.id ? 'primary' : 'secondary'}
                onClick={() => handleCopyLink(item)}
                className="shrink-0"
              >
                {copiedId === item.id ? (
                  <span className="flex items-center gap-1">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="12"
                      height="12"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                    Tersalin
                  </span>
                ) : (
                  <span className="flex items-center gap-1">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="12"
                      height="12"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
                      <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
                    </svg>
                    Salin Link
                  </span>
                )}
              </Button>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}
