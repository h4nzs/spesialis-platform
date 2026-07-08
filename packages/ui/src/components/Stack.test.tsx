import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Stack } from './Stack.tsx';

describe('Stack', () => {
  it('renders children', () => {
    render(
      <Stack>
        <p>Item</p>
      </Stack>,
    );
    expect(screen.getByText('Item')).toBeTruthy();
  });

  it('defaults to vertical direction', () => {
    const { container } = render(
      <Stack>
        <p>A</p>
        <p>B</p>
      </Stack>,
    );
    const el = container.firstChild as HTMLElement;
    expect(el.className).toContain('flex-col');
  });

  it('renders horizontal direction', () => {
    const { container } = render(
      <Stack direction="horizontal">
        <p>A</p>
        <p>B</p>
      </Stack>,
    );
    const el = container.firstChild as HTMLElement;
    expect(el.className).toContain('flex-row');
  });

  it('applies gap class', () => {
    const { container } = render(
      <Stack gap={6}>
        <p>A</p>
        <p>B</p>
      </Stack>,
    );
    const el = container.firstChild as HTMLElement;
    expect(el.className).toContain('gap-6');
  });

  it('renders with align center', () => {
    const { container } = render(
      <Stack align="center">
        <p>A</p>
      </Stack>,
    );
    const el = container.firstChild as HTMLElement;
    expect(el.className).toContain('items-center');
  });
});
