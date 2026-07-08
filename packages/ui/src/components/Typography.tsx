import { type HTMLAttributes, type ReactNode } from 'react';
import { cn } from '../utils/cn.ts';

// ─── Heading ─────────────────────────────────────────────────────────────
// Covers H1–H6 per docs/frontend/typography.md

type HeadingLevel = 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';

const headingStyles: Record<HeadingLevel, string> = {
  h1: 'text-h1',
  h2: 'text-h2',
  h3: 'text-h3',
  h4: 'text-h4',
  h5: 'text-h5',
  h6: 'text-h6',
};

export interface HeadingProps extends HTMLAttributes<HTMLHeadingElement> {
  /** Heading level: h1–h6. Defaults to h2. */
  level?: HeadingLevel;
  children: ReactNode;
}

/**
 * Semantic heading component.
 * Renders the specified HTML heading tag with the correct typography scale.
 *
 * @example
 * <Heading level="h1">Page Title</Heading>
 * <Heading level="h3">Sub Section</Heading>
 */
export function Heading({ level = 'h2', children, className, ...props }: HeadingProps) {
  const Tag = level;
  return (
    <Tag className={cn('text-text-primary', headingStyles[level], className)} {...props}>
      {children}
    </Tag>
  );
}

// ─── Display ─────────────────────────────────────────────────────────────
// Hero/large display text — only for marketing sections
// Per docs: Display XL (60px) and Display (48px)

type DisplaySize = 'xl' | 'lg';

const displayStyles: Record<DisplaySize, string> = {
  xl: 'text-display-xl',
  lg: 'text-display',
};

export interface DisplayProps extends HTMLAttributes<HTMLHeadingElement> {
  /** Display size: 'xl' (60px) for hero, 'lg' (48px) for sections. */
  size?: DisplaySize;
  /** HTML element to render. Defaults to h1 for xl, h2 for lg. */
  as?: 'h1' | 'h2' | 'h3';
  children: ReactNode;
}

/**
 * Large display heading for hero sections.
 * Use sparingly — only on landing/marketing pages.
 *
 * @example
 * <Display size="xl">Layanan Profesional Tanpa Ribet</Display>
 * <Display size="lg" as="h2">Mengapa Memilih Kami</Display>
 */
export function Display({ size = 'xl', as: Tag, children, className, ...props }: DisplayProps) {
  const defaultTag: Record<DisplaySize, 'h1' | 'h2'> = { xl: 'h1', lg: 'h2' };
  const Component = Tag ?? defaultTag[size];

  return (
    <Component className={cn('text-text-primary', displayStyles[size], className)} {...props}>
      {children}
    </Component>
  );
}

// ─── Text ────────────────────────────────────────────────────────────────
// Body text variants per docs/frontend/typography.md

type TextVariant = 'body-lg' | 'body' | 'body-sm' | 'caption' | 'overline' | 'lead' | 'code';

const textStyles: Record<TextVariant, string> = {
  'body-lg': 'text-body-lg text-text-secondary',
  body: 'text-body text-text-secondary',
  'body-sm': 'text-body-sm text-text-secondary',
  caption: 'text-caption text-text-muted',
  overline: 'text-overline text-text-muted',
  lead: 'text-body-lg text-text-secondary',
  code: 'text-body-sm font-mono text-text-secondary bg-neutral-100 rounded-sm px-1.5 py-0.5',
};

/** Maps each variant to its semantically appropriate HTML tag. */
const textTags: Record<TextVariant, 'p' | 'span'> = {
  'body-lg': 'p',
  body: 'p',
  'body-sm': 'p',
  caption: 'span',
  overline: 'span',
  lead: 'p',
  code: 'span',
};

export interface TextProps extends HTMLAttributes<HTMLParagraphElement | HTMLSpanElement> {
  /**
   * Text variant.
   * - `body` (default): standard paragraph
   * - `body-lg`: larger paragraph
   * - `body-sm`: smaller paragraph / description
   * - `caption`: metadata, timestamps
   * - `overline`: category labels (uppercase)
   * - `lead`: intro paragraph (larger, muted)
   * - `code`: inline code
   */
  variant?: TextVariant;
  children: ReactNode;
  /** Override the rendered HTML tag. */
  as?: 'p' | 'span' | 'small' | 'div' | 'label';
}

/**
 * Text component with variant-based styling.
 *
 * @example
 * <Text>Standard paragraph</Text>
 * <Text variant="body-sm">Description text</Text>
 * <Text variant="caption">12 Jan 2026</Text>
 * <Text variant="overline">Kategori</Text>
 * <Text variant="lead">Introductory paragraph</Text>
 */
export function Text({
  variant = 'body',
  children,
  className,
  as: TagOverride,
  ...props
}: TextProps) {
  const Tag = TagOverride ?? textTags[variant];

  return (
    <Tag className={cn(textStyles[variant], className)} {...props}>
      {children}
    </Tag>
  );
}
