import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { DatePicker } from './DatePicker';

describe('DatePicker', () => {
  it('renders date input', () => {
    const { container } = render(<DatePicker />);
    expect(container.querySelector('input')).toBeInTheDocument();
  });

  it('renders with label', () => {
    render(<DatePicker label="Tanggal Booking" />);
    expect(screen.getByLabelText('Tanggal Booking')).toBeInTheDocument();
  });

  it('renders as type date', () => {
    const { container } = render(<DatePicker />);
    expect(container.querySelector('input')).toHaveAttribute('type', 'date');
  });

  it('calls onChange when date selected', () => {
    const onChange = vi.fn();
    const { container } = render(<DatePicker onChange={onChange} />);
    const input = container.querySelector('input')!;
    fireEvent.change(input, { target: { value: '2026-07-15' } });
    expect(onChange).toHaveBeenCalled();
  });

  it('shows error message', () => {
    render(<DatePicker error="Pilih tanggal" />);
    expect(screen.getByText('Pilih tanggal')).toBeInTheDocument();
  });

  it('applies error border', () => {
    render(<DatePicker error="Error" />);
    const input = document.querySelector('input[type="date"]');
    expect(input?.className).toContain('border-danger');
  });

  it('renders disabled state', () => {
    render(<DatePicker disabled />);
    const input = document.querySelector('input[type="date"]');
    expect(input).toBeDisabled();
  });

  it('generates id from label', () => {
    render(<DatePicker label="Tanggal Mulai" />);
    expect(screen.getByLabelText('Tanggal Mulai').id).toBe('tanggal-mulai');
  });
});
