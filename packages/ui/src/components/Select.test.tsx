import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Select } from './Select';

const OPTIONS = [
  { value: 'ac', label: 'AC Service' },
  { value: 'plumbing', label: 'Plumbing' },
  { value: 'electrical', label: 'Electrical' },
];

describe('Select', () => {
  it('renders all options', () => {
    render(<Select options={OPTIONS} />);
    const select = screen.getByRole('combobox');
    expect(select).toBeInTheDocument();
    expect(screen.getByText('AC Service')).toBeInTheDocument();
    expect(screen.getByText('Plumbing')).toBeInTheDocument();
  });

  it('renders with label', () => {
    render(<Select label="Layanan" options={OPTIONS} />);
    expect(screen.getByLabelText('Layanan')).toBeInTheDocument();
  });

  it('renders placeholder option', () => {
    render(<Select options={OPTIONS} placeholder="Pilih layanan" />);
    expect(screen.getByText('Pilih layanan')).toBeInTheDocument();
  });

  it('calls onChange when selection changes', () => {
    const onChange = vi.fn();
    render(<Select options={OPTIONS} onChange={onChange} />);
    fireEvent.change(screen.getByRole('combobox'), { target: { value: 'plumbing' } });
    expect(onChange).toHaveBeenCalled();
  });

  it('shows error message', () => {
    render(<Select options={OPTIONS} error="Pilih layanan" />);
    expect(screen.getByText('Pilih layanan')).toBeInTheDocument();
  });

  it('applies error border style', () => {
    render(<Select options={OPTIONS} error="Error" />);
    expect(screen.getByRole('combobox').className).toContain('border-danger');
  });

  it('renders disabled state', () => {
    render(<Select options={OPTIONS} disabled />);
    expect(screen.getByRole('combobox')).toBeDisabled();
  });

  it('generates id from label', () => {
    render(<Select label="Pilih Kota" options={OPTIONS} />);
    expect(screen.getByLabelText('Pilih Kota').id).toBe('pilih-kota');
  });
});
