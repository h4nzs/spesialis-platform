import type { ReactNode, HTMLAttributes } from 'react';

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  padding?: 'sm' | 'md' | 'lg';
}

const paddings = {
  sm: 'p-3',
  md: 'p-4',
  lg: 'p-6',
};

export function Card({ children, padding = 'md', className = '', ...props }: CardProps) {
  return (
    <div
      className={`rounded-xl border border-border-default bg-bg-surface shadow-xs ${paddings[padding]} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}
