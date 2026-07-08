import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Badge } from './Badge';

describe('Badge', () => {
  it('renders children text', () => {
    render(<Badge>Active</Badge>);
    expect(screen.getByText('Active')).toBeInTheDocument();
  });

  it('renders with default variant', () => {
    render(<Badge>Default</Badge>);
    expect(screen.getByText('Default').className).toContain('bg-neutral-100');
  });

  it('renders with success variant', () => {
    render(<Badge variant="success">Success</Badge>);
    expect(screen.getByText('Success').className).toContain('bg-success-50');
  });

  it('renders with warning variant', () => {
    render(<Badge variant="warning">Warning</Badge>);
    expect(screen.getByText('Warning').className).toContain('bg-warning-50');
  });

  it('renders with danger variant', () => {
    render(<Badge variant="danger">Danger</Badge>);
    expect(screen.getByText('Danger').className).toContain('bg-danger-50');
  });

  it('renders with info variant', () => {
    render(<Badge variant="info">Info</Badge>);
    expect(screen.getByText('Info').className).toContain('bg-primary-50');
  });

  it('renders with number as children', () => {
    render(<Badge>42</Badge>);
    expect(screen.getByText('42')).toBeInTheDocument();
  });

  it('renders rounded pill shape', () => {
    render(<Badge>Pill</Badge>);
    expect(screen.getByText('Pill').className).toContain('rounded-full');
  });

  it('renders with caption text size', () => {
    render(<Badge>Small</Badge>);
    expect(screen.getByText('Small').className).toContain('text-caption');
  });
});
