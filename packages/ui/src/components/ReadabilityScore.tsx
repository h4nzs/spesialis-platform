import { cn } from '../utils/cn.ts';
import type { ReadabilityResult } from '@ahlipanggilan/shared';

export interface ReadabilityScoreProps {
  result: ReadabilityResult;
  className?: string;
}

function getLevelColor(level: ReadabilityResult['level']): string {
  switch (level) {
    case 'easy':
      return 'var(--color-success-500, #22c55e)';
    case 'medium':
      return 'var(--color-warning-500, #f59e0b)';
    case 'hard':
      return 'var(--color-danger-500, #ef4444)';
  }
}

function getLevelBg(level: ReadabilityResult['level']): string {
  switch (level) {
    case 'easy':
      return 'bg-success-50';
    case 'medium':
      return 'bg-warning-50';
    case 'hard':
      return 'bg-danger-50';
  }
}

function getLevelText(level: ReadabilityResult['level']): string {
  switch (level) {
    case 'easy':
      return 'text-success-700';
    case 'medium':
      return 'text-warning-700';
    case 'hard':
      return 'text-danger-700';
  }
}

function getBarColor(level: ReadabilityResult['level']): string {
  switch (level) {
    case 'easy':
      return 'bg-success-500';
    case 'medium':
      return 'bg-warning-500';
    case 'hard':
      return 'bg-danger-500';
  }
}

export function ReadabilityScore({ result, className }: ReadabilityScoreProps) {
  const barColor = getBarColor(result.level);
  const barWidth = `${Math.max(5, result.score)}%`;

  return (
    <div className={cn('space-y-3', className)}>
      {/* Score bar */}
      <div>
        <div className="flex items-center justify-between mb-1">
          <span className="text-xs font-medium text-text-primary">Keterbacaan</span>
          <span className="text-xs font-semibold" style={{ color: getLevelColor(result.level) }}>
            {result.score}/100 — {result.label}
          </span>
        </div>
        <div className="h-2 w-full overflow-hidden rounded-full bg-neutral-100">
          <div
            className={`h-full rounded-full transition-all duration-500 ${barColor}`}
            style={{ width: barWidth }}
          />
        </div>
      </div>

      {/* Detail stats */}
      <div className="grid grid-cols-2 gap-2">
        <div className={cn('rounded-md border px-2.5 py-2', getLevelBg(result.level))}>
          <p className={cn('text-xs font-medium', getLevelText(result.level))}>
            {result.avgSentenceLength.toFixed(0)}
          </p>
          <p className="text-[10px] text-text-muted">rata-rata kata/kalimat</p>
        </div>
        <div className={cn('rounded-md border px-2.5 py-2', getLevelBg(result.level))}>
          <p className={cn('text-xs font-medium', getLevelText(result.level))}>
            {result.avgParagraphLength.toFixed(0)}
          </p>
          <p className="text-[10px] text-text-muted">rata-rata kata/paragraf</p>
        </div>
        <div className="rounded-md border border-border-default bg-bg-surface px-2.5 py-2">
          <p className="text-xs font-medium text-text-primary">{result.longSentences}</p>
          <p className="text-[10px] text-text-muted">kalimat panjang (&gt;25 kata)</p>
        </div>
        <div className="rounded-md border border-border-default bg-bg-surface px-2.5 py-2">
          <p className="text-xs font-medium text-text-primary">{result.longParagraphs}</p>
          <p className="text-[10px] text-text-muted">paragraf panjang (&gt;100 kata)</p>
        </div>
      </div>

      {/* Tips */}
      <div className="rounded-md border border-border-default bg-bg-surface px-3 py-2">
        <p className="text-[10px] font-medium text-text-muted mb-1">Tips:</p>
        <ul className="space-y-0.5">
          {result.longSentences > 0 && (
            <li className="text-[10px] text-text-secondary">
              • Bagi kalimat panjang menjadi beberapa kalimat pendek
            </li>
          )}
          {result.longParagraphs > 0 && (
            <li className="text-[10px] text-text-secondary">
              • Bagi paragraf panjang menjadi beberapa paragraf
            </li>
          )}
          {result.avgSentenceLength > 20 && (
            <li className="text-[10px] text-text-secondary">
              • Gunakan kalimat yang lebih pendek dan langsung
            </li>
          )}
          {result.score >= 70 && (
            <li className="text-[10px] text-success-600">• Keterbacaan sudah baik, pertahankan!</li>
          )}
        </ul>
      </div>
    </div>
  );
}
