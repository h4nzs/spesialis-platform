import { cn } from '../utils/cn.ts';
import type { SeoCheck } from '@specialist/shared';

export interface SeoChecklistProps {
  checks: SeoCheck[];
  className?: string;
}

function CheckIcon({ status }: { status: SeoCheck['status'] }) {
  if (status === 'pass') {
    return (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="shrink-0 text-success-500"
      >
        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
        <polyline points="22 4 12 14.01 9 11.01" />
      </svg>
    );
  }
  if (status === 'warning') {
    return (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="shrink-0 text-warning-500"
      >
        <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
        <line x1="12" x2="12" y1="9" y2="13" />
        <line x1="12" x2="12.01" y1="17" y2="17" />
      </svg>
    );
  }
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="shrink-0 text-danger-500"
    >
      <circle cx="12" cy="12" r="10" />
      <line x1="15" x2="9" y1="9" y2="15" />
      <line x1="9" x2="15" y1="9" y2="15" />
    </svg>
  );
}

export function SeoChecklist({ checks, className }: SeoChecklistProps) {
  if (checks.length === 0) {
    return (
      <p className="text-sm text-text-muted italic">
        Masukkan kata kunci fokus untuk melihat analisis
      </p>
    );
  }

  return (
    <div className={cn('space-y-2', className)}>
      {checks.map((check) => (
        <div
          key={check.id}
          className={cn(
            'flex items-start gap-2.5 rounded-md border px-3 py-2.5 transition-colors',
            check.status === 'pass' && 'border-success-200 bg-success-50/50',
            check.status === 'warning' && 'border-warning-200 bg-warning-50/50',
            check.status === 'fail' && 'border-danger-200 bg-danger-50/50',
          )}
        >
          <CheckIcon status={check.status} />
          <div className="min-w-0 flex-1">
            <p
              className={cn(
                'text-sm font-medium',
                check.status === 'pass' && 'text-success-700',
                check.status === 'warning' && 'text-warning-700',
                check.status === 'fail' && 'text-danger-700',
              )}
            >
              {check.label}
            </p>
            <p className="text-xs text-text-secondary mt-0.5">{check.message}</p>
            {check.detail && <p className="text-[10px] text-text-muted mt-0.5">{check.detail}</p>}
          </div>
        </div>
      ))}
    </div>
  );
}
