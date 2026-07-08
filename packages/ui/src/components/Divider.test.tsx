import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Divider } from './Divider.tsx';

describe('Divider', () => {
  it('renders horizontal divider', () => {
    const { container } = render(<Divider />);
    const el = container.firstChild as HTMLElement;
    expect(el).toHaveAttribute('role', 'separator');
    expect(el.className).toContain('border-t');
  });

  it('renders vertical divider', () => {
    const { container } = render(<Divider orientation="vertical" />);
    const el = container.firstChild as HTMLElement;
    expect(el).toHaveAttribute('aria-orientation', 'vertical');
    expect(el.className).toContain('border-l');
  });

  it('renders label in center', () => {
    render(<Divider label="atau" />);
    expect(screen.getByText('atau')).toBeTruthy();
  });

  it('renders dashed variant', () => {
    const { container } = render(<Divider variant="dashed" />);
    const el = container.firstChild as HTMLElement;
    expect(el.className).toContain('border-dashed');
  });
});
