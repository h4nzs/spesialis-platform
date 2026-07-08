import { type ReactNode } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../utils/cn.ts';

const tooltipVariants = cva(
  'pointer-events-none absolute z-tooltip whitespace-nowrap rounded-md bg-neutral-900 px-2.5 py-1.5 text-caption text-white opacity-0 shadow-sm transition-all duration-150 ease-out group-hover:opacity-100 group-focus-within:opacity-100',
  {
    variants: {
      position: {
        top: 'bottom-full left-1/2 -translate-x-1/2 -translate-y-1.5 mb-1.5 group-hover:-translate-y-0 group-focus-within:-translate-y-0',
        bottom:
          'top-full left-1/2 -translate-x-1/2 translate-y-1.5 mt-1.5 group-hover:translate-y-0 group-focus-within:translate-y-0',
        left: 'right-full top-1/2 -translate-y-1/2 -translate-x-1.5 mr-1.5 group-hover:-translate-x-0 group-focus-within:-translate-x-0',
        right:
          'left-full top-1/2 -translate-y-1/2 translate-x-1.5 ml-1.5 group-hover:translate-x-0 group-focus-within:translate-x-0',
      },
    },
    defaultVariants: {
      position: 'top',
    },
  },
);

export interface TooltipProps extends VariantProps<typeof tooltipVariants> {
  /** The element that triggers the tooltip on hover/focus. */
  children: ReactNode;
  /** Tooltip content text. */
  content: string;
  className?: string;
}

/**
 * CSS-only tooltip that appears on hover and focus.
 *
 * Uses a wrapping `<span>` with `group` class so no JavaScript
 * is required. Respects `prefers-reduced-motion` via global CSS.
 *
 * @example
 * <Tooltip content="Hapus booking">
 *   <button>X</button>
 * </Tooltip>
 *
 * <Tooltip content="Detail" position="right">
 *   <button>...</button>
 * </Tooltip>
 */
export function Tooltip({ children, content, position, className }: TooltipProps) {
  return (
    <span className={cn('group relative inline-flex', className)}>
      {children}
      <span role="tooltip" className={cn(tooltipVariants({ position }))}>
        {content}
      </span>
    </span>
  );
}
