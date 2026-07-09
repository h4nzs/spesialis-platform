import { type HTMLAttributes } from 'react';
import { cn } from '../utils/cn.ts';

export interface TableSkeletonProps extends HTMLAttributes<HTMLDivElement> {
  /** Number of table row skeletons to render. Default 3. */
  rows?: number;
  /** Show a toolbar skeleton (export button placeholder). Default true. */
  showToolbar?: boolean;
  /** Width class for the toolbar skeleton. Default 'w-32'. */
  toolbarWidth?: string;
}

/**
 * Reusable table loading skeleton that replaces the duplicated
 * toolbar + table-row `animate-skeleton` block found across 15+ dashboard components.
 *
 * - Renders a toolbar skeleton button on the right (unless `showToolbar` is false).
 * - Renders `rows` full-width row skeletons.
 * - Wrapped in a `space-y-4` container.
 * - All skeletons have `aria-hidden="true"`.
 *
 * @example
 * ```tsx
 * // 3 rows with toolbar (default)
 * <TableSkeleton />
 *
 * // 5 rows, no toolbar
 * <TableSkeleton rows={5} showToolbar={false} />
 *
 * // Wider toolbar for two-button layouts
 * <TableSkeleton toolbarWidth="w-40" />
 * ```
 */
export function TableSkeleton({
  rows = 3,
  showToolbar = true,
  toolbarWidth = 'w-32',
  className,
  ...props
}: TableSkeletonProps) {
  return (
    <div
      className={cn('space-y-4', className)}
      {...props}
      aria-label="Memuat data..."
      role="status"
    >
      {showToolbar && (
        <div className="flex justify-end">
          <div
            className={`animate-skeleton h-10 ${toolbarWidth} rounded-lg bg-neutral-200`}
            aria-hidden="true"
          />
        </div>
      )}
      {Array.from({ length: rows }, (_, i) => (
        <div
          key={i}
          className="animate-skeleton h-12 w-full rounded-lg bg-neutral-200"
          aria-hidden="true"
        />
      ))}
    </div>
  );
}
