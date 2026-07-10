import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { LazyFallback } from './LazyFallback';

vi.mock('@specialist/ui', () => ({
  Spinner: ({ size }: { size?: string }) => <div data-testid="spinner" data-size={size} />,
}));

describe('LazyFallback', () => {
  it('renders centered container', () => {
    const { container } = render(<LazyFallback />);
    const div = container.firstChild as HTMLElement;
    expect(div.className).toContain('flex');
    expect(div.className).toContain('items-center');
    expect(div.className).toContain('justify-center');
    expect(div.className).toContain('min-h-[300px]');
  });

  it('renders Spinner with size lg', () => {
    render(<LazyFallback />);
    const spinner = screen.getByTestId('spinner');
    expect(spinner).toBeInTheDocument();
    expect(spinner).toHaveAttribute('data-size', 'lg');
  });
});
