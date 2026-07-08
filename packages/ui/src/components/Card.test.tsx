import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Card } from './Card';

describe('Card', () => {
  it('renders children', () => {
    render(<Card>Card content</Card>);
    expect(screen.getByText('Card content')).toBeInTheDocument();
  });

  it('renders with default padding (md)', () => {
    render(<Card>Content</Card>);
    expect(screen.getByText('Content').className).toContain('p-4');
  });

  it('renders with sm padding', () => {
    render(<Card padding="sm">Content</Card>);
    expect(screen.getByText('Content').className).toContain('p-3');
  });

  it('renders with lg padding', () => {
    render(<Card padding="lg">Content</Card>);
    expect(screen.getByText('Content').className).toContain('p-6');
  });

  it('renders with custom className', () => {
    render(<Card className="custom-class">Content</Card>);
    expect(screen.getByText('Content').className).toContain('custom-class');
  });

  it('passes additional HTML attributes', () => {
    render(<Card data-testid="card-1">Content</Card>);
    expect(screen.getByTestId('card-1')).toBeInTheDocument();
  });

  it('renders with border and surface classes', () => {
    render(<Card>Content</Card>);
    const el = screen.getByText('Content');
    expect(el.className).toContain('border-border');
    expect(el.className).toContain('bg-surface');
  });
});
