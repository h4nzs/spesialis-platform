import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { LockBadge } from './LockBadge';

describe('LockBadge', () => {
  it('renders the lockedByEmail text', () => {
    render(<LockBadge lockedByEmail="budi@example.com" />);
    expect(screen.getByText('budi@example.com')).toBeInTheDocument();
  });

  it('renders with warning text color', () => {
    render(<LockBadge lockedByEmail="budi@example.com" />);
    const el = screen.getByText('budi@example.com');
    expect(el.className).toContain('text-warning-700');
  });

  it('renders with title attribute showing Diedit oleh', () => {
    render(<LockBadge lockedByEmail="budi@example.com" />);
    const span = screen.getByTitle('Diedit oleh budi@example.com');
    expect(span).toBeInTheDocument();
  });

  it('renders with inline-flex layout', () => {
    render(<LockBadge lockedByEmail="budi@example.com" />);
    const span = screen.getByTitle('Diedit oleh budi@example.com');
    expect(span.className).toContain('inline-flex');
  });

  it('renders with gap-1', () => {
    render(<LockBadge lockedByEmail="budi@example.com" />);
    const span = screen.getByTitle('Diedit oleh budi@example.com');
    expect(span.className).toContain('gap-1');
  });

  it('renders with text-xs size', () => {
    render(<LockBadge lockedByEmail="budi@example.com" />);
    const span = screen.getByTitle('Diedit oleh budi@example.com');
    expect(span.className).toContain('text-xs');
  });

  it('renders the lock SVG icon', () => {
    const { container } = render(<LockBadge lockedByEmail="budi@example.com" />);
    const svg = container.querySelector('svg');
    expect(svg).toBeInTheDocument();
    expect(svg).toHaveAttribute('width', '12');
    expect(svg).toHaveAttribute('height', '12');
  });

  it('renders different email correctly', () => {
    render(<LockBadge lockedByEmail="admin@ahlipanggilan.id" />);
    expect(screen.getByText('admin@ahlipanggilan.id')).toBeInTheDocument();
    expect(screen.getByTitle('Diedit oleh admin@ahlipanggilan.id')).toBeInTheDocument();
  });
});
