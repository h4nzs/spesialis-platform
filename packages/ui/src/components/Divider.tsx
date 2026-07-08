import { type ReactNode } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../utils/cn.ts';

const dividerVariants = cva('border-border-default', {
  variants: {
    orientation: {
      horizontal: 'w-full border-t',
      vertical: 'h-full min-h-4 border-l self-stretch',
    },
    variant: {
      solid: '',
      dashed: 'border-dashed',
      light: 'border-neutral-100',
    },
  },
  defaultVariants: {
    orientation: 'horizontal',
    variant: 'solid',
  },
});

export interface DividerProps extends VariantProps<typeof dividerVariants> {
  /** Optional label rendered in the center of horizontal dividers. */
  label?: ReactNode;
  className?: string;
}

/**
 * Visual separator between content sections.
 *
 * Supports horizontal and vertical orientations. When a `label` is
 * provided on a horizontal divider, it appears centered with lines
 * on both sides.
 *
 * @example
 * <Divider />
 * <Divider orientation="vertical" />
 * <Divider label="atau" />
 */
export function Divider({ orientation = 'horizontal', variant, label, className }: DividerProps) {
  if (orientation === 'vertical') {
    return (
      <div
        className={cn(dividerVariants({ orientation, variant }), className)}
        aria-orientation="vertical"
        role="separator"
      />
    );
  }

  if (label) {
    return (
      <div className={cn('flex w-full items-center gap-3', className)} role="separator">
        <span className={cn(dividerVariants({ orientation, variant }), 'flex-1')} />
        {label && (
          <span className="shrink-0 text-caption font-medium text-text-muted">{label}</span>
        )}
        <span className={cn(dividerVariants({ orientation, variant }), 'flex-1')} />
      </div>
    );
  }

  return (
    <div className={cn(dividerVariants({ orientation, variant }), className)} role="separator" />
  );
}
