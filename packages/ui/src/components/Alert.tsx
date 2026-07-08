import { type HTMLAttributes } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../utils/cn.ts';

const alertVariants = cva('flex items-start gap-3 rounded-xl border px-4 py-3 text-body-sm', {
  variants: {
    variant: {
      info: 'border-info-200 bg-info-50 text-info-800',
      success: 'border-success-200 bg-success-50 text-success-800',
      warning: 'border-warning-200 bg-warning-50 text-warning-800',
      danger: 'border-danger-200 bg-danger-50 text-danger-800',
    },
  },
  defaultVariants: {
    variant: 'info',
  },
});

const ICONS: Record<string, string> = {
  info: '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/></svg>',
  success:
    '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>',
  warning:
    '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3"/><path d="M12 9v4"/><path d="M12 17h.01"/></svg>',
  danger:
    '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="15" x2="9" y1="9" y2="15"/><line x1="9" x2="15" y1="9" y2="15"/></svg>',
};

export interface AlertProps
  extends HTMLAttributes<HTMLDivElement>, VariantProps<typeof alertVariants> {
  /** Optional title rendered in bold above the message. */
  title?: string;
  /** If true, renders a dismiss (X) button. */
  dismissible?: boolean;
  onDismiss?: () => void;
}

export function Alert({
  variant = 'info',
  title,
  dismissible,
  onDismiss,
  children,
  className,
  ...props
}: AlertProps) {
  return (
    <div className={cn(alertVariants({ variant }), className)} role="alert" {...props}>
      <span
        className="mt-0.5 shrink-0"
        aria-hidden="true"
        dangerouslySetInnerHTML={{ __html: ICONS[variant ?? 'info'] ?? '' }}
      />
      <div className="flex-1 min-w-0">
        {title && <p className="font-semibold text-body-sm">{title}</p>}
        <div className={title ? 'mt-1' : ''}>{children}</div>
      </div>
      {dismissible && (
        <button
          type="button"
          onClick={onDismiss}
          className="shrink-0 rounded-md p-0.5 opacity-60 transition-opacity hover:opacity-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-current"
          aria-label="Tutup"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <path d="M18 6 6 18" />
            <path d="m6 6 12 12" />
          </svg>
        </button>
      )}
    </div>
  );
}
