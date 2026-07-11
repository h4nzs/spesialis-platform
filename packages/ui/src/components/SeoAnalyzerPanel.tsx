import { useState, useMemo, useCallback } from 'react';
import { Input } from './Input.tsx';
import { SeoScoreGauge } from './SeoScoreGauge.tsx';
import { SeoChecklist } from './SeoChecklist.tsx';
import { SnippetPreview } from './SnippetPreview.tsx';
import { ReadabilityScore } from './ReadabilityScore.tsx';
import { cn } from '../utils/cn.ts';
import { analyzeContent, checkReadability, getSnippetPreview } from '@ahlipanggilan/shared';
import type {
  SeoAnalysisResult,
  ReadabilityResult,
  SnippetPreviewData,
} from '@ahlipanggilan/shared';

export interface SeoAnalyzerPanelProps {
  contentHtml: string;
  title: string;
  slug: string;
  metaTitle: string;
  metaDescription: string;
  url: string;
  className?: string;
}

export function SeoAnalyzerPanel({
  contentHtml,
  title,
  slug,
  metaTitle,
  metaDescription,
  url,
  className,
}: SeoAnalyzerPanelProps) {
  const [keyword, setKeyword] = useState('');

  const analysis: SeoAnalysisResult | null = useMemo(
    () => (keyword ? analyzeContent(contentHtml, keyword, title, slug, metaTitle) : null),
    [contentHtml, keyword, title, slug, metaTitle],
  );

  const readability: ReadabilityResult = useMemo(
    () => checkReadability(contentHtml),
    [contentHtml],
  );

  const snippet: SnippetPreviewData = useMemo(
    () => getSnippetPreview(metaTitle, metaDescription, url),
    [metaTitle, metaDescription, url],
  );

  const handleKeywordChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setKeyword(e.target.value);
  }, []);

  const scoreColor = analysis
    ? analysis.score >= 70
      ? 'border-success-200'
      : analysis.score >= 40
        ? 'border-warning-200'
        : 'border-danger-200'
    : 'border-border-default';

  return (
    <details open className={cn('group rounded-lg border', scoreColor, className)}>
      <summary className="flex cursor-pointer items-center gap-2 px-4 py-3 text-sm font-medium text-text-primary hover:bg-neutral-50 transition-colors select-none marker:hidden">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          className="text-text-muted"
        >
          <circle cx="12" cy="12" r="10" />
          <path d="M12 16v-4" />
          <path d="M12 8h.01" />
        </svg>
        SEO Analysis
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          className="ml-auto text-text-muted transition-transform group-open:rotate-180"
        >
          <path d="m6 9 6 6 6-6" />
        </svg>
      </summary>

      <div className="space-y-4 border-t border-border-default px-4 py-4">
        {/* Focus Keyword */}
        <div>
          <label className="text-xs font-medium text-text-primary mb-1 block">Focus Keyword</label>
          <Input
            value={keyword}
            onChange={handleKeywordChange}
            placeholder="Masukkan kata kunci utama..."
          />
        </div>

        {/* Score gauge + checklist side by side */}
        {analysis && (
          <div className="flex gap-4">
            <SeoScoreGauge score={analysis.score} size={90} className="shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-xs text-text-muted mb-1">
                {analysis.wordCount} kata · {analysis.keywordCount} kemunculan ·{' '}
                {analysis.keywordDensity.toFixed(1)}% density
              </p>
              <SeoChecklist checks={analysis.checks} />
            </div>
          </div>
        )}

        {/* Keyword prompt if not entered */}
        {!keyword && (
          <p className="text-xs text-text-muted italic">
            Masukkan kata kunci utama untuk melihat analisis SEO on-page
          </p>
        )}

        {/* Divider */}
        <hr className="border-border-default" />

        {/* Readability */}
        <ReadabilityScore result={readability} />

        {/* Divider */}
        <hr className="border-border-default" />

        {/* Snippet Preview */}
        <SnippetPreview title={snippet.title} description={snippet.description} url={snippet.url} />
      </div>
    </details>
  );
}
