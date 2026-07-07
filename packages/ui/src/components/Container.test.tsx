import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Container } from './Container';

describe('Container', () => {
  it('renders children', () => {
    render(<Container>Content</Container>);
    expect(screen.getByText('Content')).toBeInTheDocument();
  });

  it('has max-width and padding classes', () => {
    render(<Container>Content</Container>);
    const el = screen.getByText('Content');
    expect(el.className).toContain('max-w-7xl');
    expect(el.className).toContain('px-4');
  });

  it('accepts additional className', () => {
    render(<Container className="my-class">Content</Container>);
    expect(screen.getByText('Content').className).toContain('my-class');
  });
});
