import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Card } from './Card';

describe('Card', () => {
  it('renders children', () => {
    render(<Card>Card Content</Card>);
    expect(screen.getByText('Card Content')).toBeInTheDocument();
  });

  it('renders with default padding', () => {
    render(<Card>Content</Card>);
    expect(screen.getByText('Content').className).toContain('p-4');
  });

  it('renders with sm padding', () => {
    render(<Card padding="sm">Small</Card>);
    expect(screen.getByText('Small').className).toContain('p-3');
  });

  it('renders with lg padding', () => {
    render(<Card padding="lg">Large</Card>);
    expect(screen.getByText('Large').className).toContain('p-6');
  });

  it('has border and shadow classes', () => {
    render(<Card>Styled</Card>);
    const el = screen.getByText('Styled');
    expect(el.className).toContain('border-border');
    expect(el.className).toContain('shadow-xs');
  });

  it('accepts additional className', () => {
    render(<Card className="extra">Extra</Card>);
    expect(screen.getByText('Extra').className).toContain('extra');
  });
});
