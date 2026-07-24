import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { LazyFallback } from './LazyFallback';

vi.mock('@ahlipanggilan/ui', () => ({
  Spinner: ({ size }: { size?: string }) => <div data-testid="spinner" data-size={size} />,
  TableSkeleton: () => <div data-testid="table-skeleton" />,
  Card: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  Grid: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  Badge: ({ children }: { children: React.ReactNode }) => <span>{children}</span>,
  Modal: ({
    children,
    open,
    title,
  }: {
    children: React.ReactNode;
    open: boolean;
    title?: string;
  }) =>
    open ? (
      <div data-testid="modal">
        {title ? <h2>{title}</h2> : null}
        {children}
      </div>
    ) : null,
  CSVExportButton: ({ onClick }: { onClick?: () => void }) => (
    <button type="button" onClick={onClick}>
      Export CSV
    </button>
  ),
  EmptyState: ({ title, children }: { title?: string; children?: React.ReactNode }) => (
    <div>{title ?? children}</div>
  ),
  Pagination: () => <div />,
  ConfirmDialog: () => null,
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
