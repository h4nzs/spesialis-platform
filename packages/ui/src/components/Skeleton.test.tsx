import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { Skeleton } from './Skeleton.tsx';

describe('Skeleton', () => {
  it('renders with default text variant', () => {
    const { container } = render(<Skeleton />);
    const el = container.firstChild as HTMLElement;
    expect(el).toBeTruthy();
    expect(el.className).toContain('animate-skeleton');
    expect(el.className).toContain('h-4');
    expect(el).toHaveAttribute('aria-hidden', 'true');
  });

  it('renders avatar variant with rounded-full', () => {
    const { container } = render(<Skeleton variant="avatar" />);
    const el = container.firstChild as HTMLElement;
    expect(el.className).toContain('rounded-full');
  });

  it('renders card variant with rounded-xl', () => {
    const { container } = render(<Skeleton variant="card" />);
    const el = container.firstChild as HTMLElement;
    expect(el.className).toContain('rounded-xl');
  });

  it('accepts custom className', () => {
    const { container } = render(<Skeleton className="w-1/2" />);
    const el = container.firstChild as HTMLElement;
    expect(el.className).toContain('w-1/2');
  });
});
