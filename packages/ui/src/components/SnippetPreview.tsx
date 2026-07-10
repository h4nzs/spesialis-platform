import { useState } from 'react';
import { cn } from '../utils/cn.ts';

export interface SnippetPreviewProps {
  title: string;
  description: string;
  url: string;
  className?: string;
}

type DeviceView = 'desktop' | 'mobile';

export function SnippetPreview({ title, description, url, className }: SnippetPreviewProps) {
  const [view, setView] = useState<DeviceView>('desktop');

  const displayTitle = title || 'Meta Title akan tampil di sini';
  const displayDesc = description || 'Meta description akan tampil di sini...';
  const displayUrl = url || 'https://spesialis.id/...';

  const titleTooLong = title.length > 60;
  const descTooLong = description.length > 160;

  return (
    <div className={cn('rounded-md border border-border-default bg-bg-page', className)}>
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border-default px-3 py-2">
        <span className="text-[10px] font-medium uppercase tracking-wider text-text-muted">
          Google Preview
        </span>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => setView('desktop')}
            className={cn(
              'rounded px-2 py-1 text-[10px] font-medium transition-colors',
              view === 'desktop'
                ? 'bg-primary-100 text-primary-700'
                : 'text-text-muted hover:text-text-primary',
            )}
            aria-label="Tampilan desktop"
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
              <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
              <line x1="8" x2="16" y1="21" y2="21" />
              <line x1="12" x2="12" y1="17" y2="21" />
            </svg>
          </button>
          <button
            type="button"
            onClick={() => setView('mobile')}
            className={cn(
              'rounded px-2 py-1 text-[10px] font-medium transition-colors',
              view === 'mobile'
                ? 'bg-primary-100 text-primary-700'
                : 'text-text-muted hover:text-text-primary',
            )}
            aria-label="Tampilan mobile"
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
              <rect x="5" y="2" width="14" height="20" rx="2" ry="2" />
              <line x1="12" x2="12.01" y1="18" y2="18" />
            </svg>
          </button>
        </div>
      </div>

      {/* Preview */}
      <div className={cn('p-3', view === 'mobile' ? 'max-w-[320px] mx-auto' : '')}>
        {/* Warning indicators */}
        {titleTooLong && (
          <p className="mb-2 flex items-center gap-1 text-[10px] text-danger-500">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="12"
              height="12"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="12" cy="12" r="10" />
              <line x1="12" x2="12" y1="8" y2="12" />
              <line x1="12" x2="12.01" y1="16" y2="16" />
            </svg>
            Title terlalu panjang ({title.length}/60 karakter) — kemungkinan terpotong di hasil
            pencarian
          </p>
        )}
        {descTooLong && (
          <p className="mb-2 flex items-center gap-1 text-[10px] text-danger-500">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="12"
              height="12"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="12" cy="12" r="10" />
              <line x1="12" x2="12" y1="8" y2="12" />
              <line x1="12" x2="12.01" y1="16" y2="16" />
            </svg>
            Description terlalu panjang ({description.length}/160 karakter) — kemungkinan terpotong
          </p>
        )}

        {/* Google-style result */}
        <div className="space-y-1">
          {/* URL + breadcrumb */}
          <p className="flex items-center gap-1 text-xs text-success-700">
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
              className="shrink-0"
            >
              <circle cx="12" cy="12" r="10" />
              <line x1="2" x2="22" y1="12" y2="12" />
              <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
            </svg>
            <span className="truncate">{displayUrl}</span>
          </p>

          {/* Title */}
          <p
            className={cn(
              'text-sm font-medium text-primary leading-tight hover:underline cursor-pointer line-clamp-1',
              titleTooLong && 'text-danger-500',
            )}
          >
            {displayTitle}
          </p>

          {/* Description */}
          <p
            className={cn(
              'text-xs text-text-secondary leading-relaxed',
              descTooLong && 'text-danger-500/80',
            )}
            style={{
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
            }}
          >
            {displayDesc}
          </p>
        </div>
      </div>

      {/* Char count footer */}
      <div className="flex items-center gap-3 border-t border-border-default px-3 py-1.5 text-[10px] text-text-muted">
        <span className={titleTooLong ? 'text-danger-500 font-medium' : ''}>
          Title: {title.length}/60
        </span>
        <span className={descTooLong ? 'text-danger-500 font-medium' : ''}>
          Desc: {description.length}/160
        </span>
        <span className="ml-auto">{view === 'desktop' ? 'Desktop' : 'Mobile'}</span>
      </div>
    </div>
  );
}
