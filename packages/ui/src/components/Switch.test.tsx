import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Switch } from './Switch.tsx';

describe('Switch', () => {
  it('renders with label', () => {
    render(<Switch label="Aktif" />);
    expect(screen.getByText('Aktif')).toBeTruthy();
  });

  it('has role switch and aria-checked', () => {
    render(<Switch label="Test" checked={false} />);
    const input = screen.getByRole('switch');
    expect(input).toBeTruthy();
    expect(input).toHaveAttribute('aria-checked', 'false');
  });

  it('renders checked state', () => {
    render(<Switch label="Test" checked={true} readOnly />);
    const input = screen.getByRole('switch');
    expect(input).toBeChecked();
  });

  it('calls onChange when clicked', () => {
    const onChange = vi.fn();
    render(<Switch label="Test" checked={false} onChange={onChange} />);
    const input = screen.getByRole('switch');
    fireEvent.click(input);
    expect(onChange).toHaveBeenCalledTimes(1);
  });

  it('is disabled when disabled prop is set', () => {
    render(<Switch label="Test" disabled />);
    const input = screen.getByRole('switch');
    expect(input).toBeDisabled();
  });

  it('renders sm size', () => {
    const { container } = render(<Switch size="sm" />);
    const track = container.querySelector('span.relative');
    expect(track?.className).toContain('h-5');
  });
});
