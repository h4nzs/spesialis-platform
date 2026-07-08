import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { DatePicker } from './DatePicker';

describe('DatePicker', () => {
  it('renders date input', () => {
    render(<DatePicker label="Tanggal" />);
    const input = screen.getByLabelText('Tanggal') as HTMLInputElement;
    expect(input.type).toBe('date');
  });

  it('renders with label', () => {
    render(<DatePicker label="Tanggal Booking" />);
    expect(screen.getByLabelText('Tanggal Booking')).toBeInTheDocument();
  });

  it('renders with value', () => {
    render(<DatePicker label="Tgl" value="2026-07-20" onChange={() => {}} />);
    expect(screen.getByDisplayValue('2026-07-20')).toBeInTheDocument();
  });

  it('calls onChange when date selected', () => {
    const onChange = vi.fn();
    render(<DatePicker label="Tgl" onChange={onChange} />);
    fireEvent.change(screen.getByLabelText('Tgl'), { target: { value: '2026-08-01' } });
    expect(onChange).toHaveBeenCalled();
  });

  it('shows error message', () => {
    render(<DatePicker error="Tanggal wajib diisi" />);
    expect(screen.getByText('Tanggal wajib diisi')).toBeInTheDocument();
  });

  it('applies error border style', () => {
    render(<DatePicker label="Tgl" error="Error" />);
    expect(screen.getByLabelText('Tgl').className).toContain('border-danger-500');
  });

  it('renders disabled state', () => {
    render(<DatePicker label="Tgl" disabled />);
    expect(screen.getByLabelText('Tgl')).toBeDisabled();
  });

  it('renders with id matching label', () => {
    render(<DatePicker label="Tanggal Mulai" id="tgl-mulai" />);
    expect(screen.getByLabelText('Tanggal Mulai').id).toBe('tgl-mulai');
  });
});
