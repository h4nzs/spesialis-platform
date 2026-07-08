import { type HTMLAttributes } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../utils/cn.ts';

const flexVariants = cva('flex', {
  variants: {
    direction: {
      row: 'flex-row',
      'row-reverse': 'flex-row-reverse',
      col: 'flex-col',
      'col-reverse': 'flex-col-reverse',
    },
    align: {
      start: 'items-start',
      center: 'items-center',
      end: 'items-end',
      stretch: 'items-stretch',
      baseline: 'items-baseline',
    },
    justify: {
      start: 'justify-start',
      center: 'justify-center',
      end: 'justify-end',
      between: 'justify-between',
      around: 'justify-around',
      evenly: 'justify-evenly',
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
    wrap: {
      true: 'flex-wrap',
      'wrap-reverse': 'flex-wrap-reverse',
      nowrap: 'flex-nowrap',
    },
  },
  defaultVariants: {
    direction: 'row',
    align: 'center',
    gap: 4,
  },
});

export interface FlexProps
  extends HTMLAttributes<HTMLDivElement>, VariantProps<typeof flexVariants> {}

/**
 * Flexible container with alignment, direction, gap, and wrap control.
 *
 * A thin wrapper over CSS Flexbox using CVA variants.
 *
 * @example
 * <Flex justify="between" align="center">
 *   <h2>Title</h2>
 *   <Button>Action</Button>
 * </Flex>
 *
 * <Flex gap={2} wrap="true">
 *   <Badge>Tag 1</Badge>
 *   <Badge>Tag 2</Badge>
 * </Flex>
 */
export function Flex({ direction, align, justify, gap, wrap, className, ...props }: FlexProps) {
  return (
    <div
      className={cn(flexVariants({ direction, align, justify, gap, wrap }), className)}
      {...props}
    />
  );
}
