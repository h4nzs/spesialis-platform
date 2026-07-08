import { type HTMLAttributes } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../utils/cn.ts';

const skeletonVariants = cva('animate-skeleton rounded-sm bg-neutral-200', {
  variants: {
    variant: {
      text: 'h-4 w-full',
      heading: 'h-8 w-3/4',
      avatar: 'h-10 w-10 rounded-full shrink-0',
      card: 'h-48 w-full rounded-xl',
      table: 'h-12 w-full rounded-md',
      form: 'h-10 w-full rounded-md',
      dashboard: 'h-32 w-full rounded-xl',
      hero: 'h-96 w-full rounded-xl',
    },
  },
  defaultVariants: {
    variant: 'text',
  },
});

export interface SkeletonProps
  extends HTMLAttributes<HTMLDivElement>, VariantProps<typeof skeletonVariants> {}

/**
 * Skeleton loading placeholder.
 *
 * Use `variant` to match the shape of the content being loaded.
 * The shimmer animation runs via the `animate-skeleton` class
 * (defined in global.css keyframes).
 *
 * @example
 * <Skeleton variant="card" />
 * <Skeleton variant="text" className="w-1/2" />
 */
export function Skeleton({ variant, className, ...props }: SkeletonProps) {
  return (
    <div className={cn(skeletonVariants({ variant }), className)} aria-hidden="true" {...props} />
  );
}
