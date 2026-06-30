import type { ReactNode, HTMLAttributes } from 'react';

type HeadingLevel = 'h1' | 'h2' | 'h3' | 'h4';

const tagStyles: Record<HeadingLevel, string> = {
  h1: 'text-3xl font-bold tracking-tight sm:text-4xl',
  h2: 'text-2xl font-semibold tracking-tight',
  h3: 'text-xl font-semibold',
  h4: 'text-lg font-medium',
};

export function Heading({
  level = 'h2',
  children,
  className = '',
  ...props
}: HTMLAttributes<HTMLHeadingElement> & { level?: HeadingLevel }) {
  const Tag = level;
  return (
    <Tag className={`text-text ${tagStyles[level]} ${className}`} {...props}>
      {children}
    </Tag>
  );
}

export function Text({ children, className = '', ...props }: HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p className={`text-text-muted leading-relaxed ${className}`} {...props}>
      {children}
    </p>
  );
}
