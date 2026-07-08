import { type HTMLAttributes, type ReactNode } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../utils/cn.ts';

const sectionVariants = cva('', {
  variants: {
    variant: {
      default: 'bg-bg-page',
      alternate: 'bg-bg-section',
      brand: 'bg-primary-900 text-white',
    },
    padding: {
      none: 'py-0',
      sm: 'py-8 md:py-12',
      md: 'py-12 md:py-20',
      lg: 'py-16 md:py-24',
    },
  },
  defaultVariants: {
    variant: 'default',
    padding: 'md',
  },
});

export interface SectionProps
  extends Omit<HTMLAttributes<HTMLElement>, 'title'>, VariantProps<typeof sectionVariants> {
  /** Optional heading rendered at the top of the section. */
  title?: ReactNode;
  /** Optional description rendered below the title. */
  description?: ReactNode;
  /** Optional action element (button, link) rendered next to the title. */
  action?: ReactNode;
  children: ReactNode;
}

/**
 * Page section with consistent vertical spacing.
 *
 * Provides background variants (`default`, `alternate`, `brand`)
 * and padding scale. When `title` is provided, renders a header
 * with optional `description` and `action`.
 *
 * @example
 * <Section title="Layanan Kami" description="Pilih layanan yang Anda butuhkan">
 *   <ServiceGrid />
 * </Section>
 *
 * <Section variant="alternate" padding="sm">
 *   <p>Content</p>
 * </Section>
 */
export function Section({
  variant,
  padding,
  title,
  description,
  action,
  children,
  className,
  ...props
}: SectionProps) {
  return (
    <section className={cn(sectionVariants({ variant, padding }), className)} {...props}>
      <div className="container-page">
        {(title || description || action) && (
          <div className="mb-8 flex flex-col items-start gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              {title &&
                (typeof title === 'string' ? (
                  <h2 className="text-h2 text-text-primary">{title}</h2>
                ) : (
                  title
                ))}
              {description &&
                (typeof description === 'string' ? (
                  <p className="mt-2 max-w-2xl text-body text-text-secondary">{description}</p>
                ) : (
                  description
                ))}
            </div>
            {action && <div className="shrink-0">{action}</div>}
          </div>
        )}
        {children}
      </div>
    </section>
  );
}
