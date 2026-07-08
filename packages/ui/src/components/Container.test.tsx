import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Container } from './Container';

describe('Container', () => {
  it('renders children', () => {
    render(<Container>Content</Container>);
    expect(screen.getByText('Content')).toBeInTheDocument();
  });

  it('applies max width class', () => {
    render(<Container>Content</Container>);
    expect(screen.getByText('Content').className).toContain('max-w-7xl');
  });

  it('applies responsive padding', () => {
    render(<Container>Content</Container>);
    const el = screen.getByText('Content');
    expect(el.className).toContain('px-4');
    expect(el.className).toContain('sm:px-6');
    expect(el.className).toContain('lg:px-8');
  });

  it('accepts custom className', () => {
    render(<Container className="custom-container">Content</Container>);
    expect(screen.getByText('Content').className).toContain('custom-container');
  });

  it('passes additional HTML attributes', () => {
    render(<Container data-testid="container-1">Content</Container>);
    expect(screen.getByTestId('container-1')).toBeInTheDocument();
  });

  it('renders nested elements', () => {
    render(
      <Container>
        <div data-testid="nested">Nested</div>
      </Container>,
    );
    expect(screen.getByTestId('nested')).toBeInTheDocument();
  });
});
