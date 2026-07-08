import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Grid } from './Grid.tsx';

describe('Grid', () => {
  it('renders children', () => {
    render(
      <Grid>
        <p>Item</p>
      </Grid>,
    );
    expect(screen.getByText('Item')).toBeTruthy();
  });

  it('renders 1 column by default', () => {
    const { container } = render(
      <Grid>
        <p>A</p>
      </Grid>,
    );
    const el = container.firstChild as HTMLElement;
    expect(el.className).toContain('grid-cols-1');
  });

  it('renders 3 columns', () => {
    const { container } = render(
      <Grid cols={3}>
        <p>A</p>
        <p>B</p>
        <p>C</p>
      </Grid>,
    );
    const el = container.firstChild as HTMLElement;
    expect(el.className).toContain('lg:grid-cols-3');
  });

  it('applies gap class', () => {
    const { container } = render(
      <Grid gap={8}>
        <p>A</p>
      </Grid>,
    );
    const el = container.firstChild as HTMLElement;
    expect(el.className).toContain('gap-8');
  });

  it('renders 12 columns', () => {
    const { container } = render(
      <Grid cols={12}>
        <p>A</p>
      </Grid>,
    );
    const el = container.firstChild as HTMLElement;
    expect(el.className).toContain('grid-cols-12');
  });
});
