import { type ReactNode } from 'react';
import { cn } from '../utils/cn.ts';

export interface EmptyStateProps {
  /** Optional icon rendered as inline SVG string (Lucide-compatible). */
  icon?: string;
  /** Primary heading text. */
  title: string;
  /** Supporting description. */
  description?: string;
  /** Call-to-action element (button, link). */
  action?: ReactNode;
  className?: string;
}

/**
 * Empty state placeholder with icon, title, description, and optional action.
 *
 * @example
 * <EmptyState
 *   icon='<svg .../>'
 *   title="Belum ada pesanan"
 *   description="Pesan layanan pertama Anda sekarang."
 *   action={<Button>Booking Sekarang</Button>}
 * />
 */
export function EmptyState({ icon, title, description, action, className }: EmptyStateProps) {
  return (
    <div
      className={cn('flex flex-col items-center justify-center px-6 py-16 text-center', className)}
    >
      {icon && (
        <div
          className="mb-5 flex h-12 w-12 items-center justify-center rounded-full bg-neutral-100 text-text-muted"
          aria-hidden="true"
          dangerouslySetInnerHTML={{ __html: icon }}
        />
      )}
      <h3 className="text-h5 text-text-primary">{title}</h3>
      {description && <p className="mt-2 max-w-sm text-body text-text-secondary">{description}</p>}
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}
