import { useEffect, useState } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../utils/cn.ts';

const toastVariants = cva(
  'pointer-events-auto flex items-start gap-3 rounded-xl border bg-bg-surface px-4 py-3 text-body-sm shadow-lg transition-all duration-200 ease-out',
  {
    variants: {
      variant: {
        info: 'border-info-200',
        success: 'border-success-200',
        warning: 'border-warning-200',
        danger: 'border-danger-200',
      },
    },
    defaultVariants: {
      variant: 'info',
    },
  },
);

const ICONS: Record<string, string> = {
  info: '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/></svg>',
  success:
    '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>',
  warning:
    '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3"/><path d="M12 9v4"/><path d="M12 17h.01"/></svg>',
  danger:
    '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="15" x2="9" y1="9" y2="15"/><line x1="9" x2="15" y1="9" y2="15"/></svg>',
};

export interface ToastProps extends VariantProps<typeof toastVariants> {
  /** Toast content. */
  children: React.ReactNode;
  /** Auto-dismiss duration in ms. Set to 0 to disable. */
  duration?: number;
  /** If true, renders a dismiss button. */
  dismissible?: boolean;
  onDismiss?: () => void;
  className?: string;
}

export function Toast({
  variant = 'info',
  children,
  duration = 4000,
  dismissible = true,
  onDismiss,
  className,
}: ToastProps) {
  const [visible, setVisible] = useState(false);
  const [exiting, setExiting] = useState(false);

  useEffect(() => {
    // Animate in after mount
    const show = requestAnimationFrame(() => setVisible(true));
    return () => cancelAnimationFrame(show);
  }, []);

  useEffect(() => {
    if (!duration || duration <= 0) return;
    const timer = setTimeout(() => {
      setExiting(true);
      setTimeout(() => onDismiss?.(), 200); // match CSS transition
    }, duration);
    return () => clearTimeout(timer);
  }, [duration, onDismiss]);

  function handleDismiss() {
    setExiting(true);
    setTimeout(() => onDismiss?.(), 200);
  }

  if (!visible) return null;

  return (
    <div
      className={cn(
        toastVariants({ variant }),
        exiting ? 'opacity-0 translate-y-2' : 'opacity-100 translate-y-0',
        'transition-all duration-200 ease-out',
        className,
      )}
      role="status"
      aria-live="polite"
    >
      <span
        className="mt-0.5 shrink-0"
        aria-hidden="true"
        dangerouslySetInnerHTML={{ __html: ICONS[variant ?? 'info'] ?? '' }}
      />
      <div className="flex-1 min-w-0">{children}</div>
      {dismissible && (
        <button
          type="button"
          onClick={handleDismiss}
          className="shrink-0 rounded-md p-0.5 opacity-60 transition-opacity hover:opacity-100"
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
/**
 * Standalone toast manager — call `showToast({ variant, message, duration })`.
 * Renders on document.body via imperative DOM. Uses static class lookup
 * so Tailwind JIT scanner picks up all variant classes at build time.
 */
let toastContainer: HTMLDivElement | null = null;
let toastId = 0;

interface ToastOptions {
  variant?: 'info' | 'success' | 'warning' | 'danger';
  message: string;
  duration?: number;
}

const TOAST_BORDER_CLASSES: Record<string, string> = {
  info: 'border-info-200',
  success: 'border-success-200',
  warning: 'border-warning-200',
  danger: 'border-danger-200',
};

export function showToast(options: ToastOptions) {
  if (!toastContainer) {
    toastContainer = document.createElement('div');
    toastContainer.className =
      'fixed bottom-4 right-4 z-toast flex flex-col gap-3 pointer-events-none';
    document.body.appendChild(toastContainer);
  }

  const id = ++toastId;
  const el = document.createElement('div');
  el.id = `toast-${id}`;
  toastContainer.appendChild(el);

  const remove = () => {
    el.remove();
    if (toastContainer && toastContainer.children.length === 0) {
      toastContainer.remove();
      toastContainer = null;
    }
  };

  const borderClass = TOAST_BORDER_CLASSES[options.variant ?? 'info'] ?? 'border-info-200';
  el.outerHTML = `<div id="toast-${id}" class="pointer-events-auto animate-slide-up rounded-xl border ${borderClass} bg-bg-surface px-4 py-3 text-body-sm shadow-lg">${options.message}</div>`;

  const dur = options.duration ?? 4000;
  if (dur > 0) {
    setTimeout(remove, dur);
  }

  return { remove, id };
}
