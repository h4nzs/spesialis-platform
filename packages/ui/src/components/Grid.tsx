import { type HTMLAttributes } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../utils/cn.ts';

const gridVariants = cva('grid', {
  variants: {
    cols: {
      1: 'grid-cols-1',
      2: 'grid-cols-1 sm:grid-cols-2',
      3: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
      4: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4',
      5: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5',
      6: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6',
      12: 'grid-cols-12',
    },
    gap: {
      0: 'gap-0',
      1: 'gap-1',
      2: 'gap-2',
      3: 'gap-3',
      4: 'gap-4',
      5: 'gap-5',
      6: 'gap-6',
      8: 'gap-8',
      10: 'gap-10',
      12: 'gap-12',
    },
  },
  defaultVariants: {
    cols: 1,
    gap: 6,
  },
});

export interface GridProps
  extends HTMLAttributes<HTMLDivElement>, VariantProps<typeof gridVariants> {}

/**
 * Responsive grid layout.
 *
 * Columns automatically adjust at breakpoints:
 * - 1 col on mobile
 * - 2 cols on sm (640px)
 * - 3-6 cols on lg (1024px+), depending on the `cols` prop
 *
 * @example
 * <Grid cols={3} gap={6}>
 *   <ServiceCard />
 *   <ServiceCard />
 *   <ServiceCard />
 * </Grid>
 *
 * <Grid cols={2} gap={4}>
 *   <div>Left</div>
 *   <div>Right</div>
 * </Grid>
 */
export function Grid({ cols, gap, className, ...props }: GridProps) {
  return <div className={cn(gridVariants({ cols, gap }), className)} {...props} />;
}
