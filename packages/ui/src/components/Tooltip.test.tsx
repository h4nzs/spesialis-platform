import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Tooltip } from './Tooltip.tsx';

describe('Tooltip', () => {
  it('renders children', () => {
    render(
      <Tooltip content="Hapus">
        <button>X</button>
      </Tooltip>,
    );
    expect(screen.getByText('X')).toBeTruthy();
  });

  it('renders tooltip content with role', () => {
    render(
      <Tooltip content="Hapus item">
        <button>X</button>
      </Tooltip>,
    );
    const tooltip = screen.getByRole('tooltip');
    expect(tooltip).toBeTruthy();
    expect(tooltip.textContent).toBe('Hapus item');
  });

  it('renders with default position (top)', () => {
    render(
      <Tooltip content="Info">
        <span>i</span>
      </Tooltip>,
    );
    const tooltip = screen.getByRole('tooltip');
    expect(tooltip.className).toContain('bottom-full');
  });
});
