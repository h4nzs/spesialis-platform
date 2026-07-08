import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Flex } from './Flex.tsx';

describe('Flex', () => {
  it('renders children', () => {
    render(
      <Flex>
        <p>Item</p>
      </Flex>,
    );
    expect(screen.getByText('Item')).toBeTruthy();
  });

  it('renders with direction col', () => {
    const { container } = render(
      <Flex direction="col">
        <p>A</p>
      </Flex>,
    );
    const el = container.firstChild as HTMLElement;
    expect(el.className).toContain('flex-col');
  });

  it('renders with justify between', () => {
    const { container } = render(
      <Flex justify="between">
        <p>A</p>
        <p>B</p>
      </Flex>,
    );
    const el = container.firstChild as HTMLElement;
    expect(el.className).toContain('justify-between');
  });

  it('renders with gap class', () => {
    const { container } = render(
      <Flex gap={3}>
        <p>A</p>
        <p>B</p>
      </Flex>,
    );
    const el = container.firstChild as HTMLElement;
    expect(el.className).toContain('gap-3');
  });

  it('renders with wrap', () => {
    const { container } = render(
      <Flex wrap>
        <p>A</p>
      </Flex>,
    );
    const el = container.firstChild as HTMLElement;
    expect(el.className).toContain('flex-wrap');
  });
});
