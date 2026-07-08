import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Select } from './Select';

const options = [
  { value: 'ac', label: 'AC Service' },
  { value: 'plumbing', label: 'Plumbing' },
  { value: 'cleaning', label: 'Cleaning' },
];

describe('Select', () => {
  it('renders select element', () => {
    render(<Select options={options} />);
    expect(screen.getByRole('combobox')).toBeInTheDocument();
  });

  it('renders options', () => {
    render(<Select options={options} />);
    expect(screen.getByText('AC Service')).toBeInTheDocument();
    expect(screen.getByText('Plumbing')).toBeInTheDocument();
    expect(screen.getByText('Cleaning')).toBeInTheDocument();
  });

  it('renders with label', () => {
    render(<Select label="Layanan" options={options} />);
    expect(screen.getByLabelText('Layanan')).toBeInTheDocument();
  });

  it('renders placeholder', () => {
    render(<Select options={options} placeholder="Pilih layanan" />);
    expect(screen.getByText('Pilih layanan')).toBeInTheDocument();
  });

  it('shows error message', () => {
    render(<Select options={options} error="Wajib dipilih" />);
    expect(screen.getByText('Wajib dipilih')).toBeInTheDocument();
  });

  it('applies error border style', () => {
    render(<Select options={options} error="Error" />);
    expect(screen.getByRole('combobox').className).toContain('border-danger');
  });

  it('calls onChange when selecting', () => {
    const onChange = vi.fn();
    render(<Select options={options} onChange={onChange} />);
    fireEvent.change(screen.getByRole('combobox'), { target: { value: 'plumbing' } });
    expect(onChange).toHaveBeenCalled();
  });

  it('renders with id matching label', () => {
    render(<Select label="Kategori" options={options} id="kategori-select" />);
    expect(screen.getByLabelText('Kategori').id).toBe('kategori-select');
  });

  it('generates id from label when no id provided', () => {
    render(<Select label="Pilih Layanan" options={options} />);
    expect(screen.getByLabelText('Pilih Layanan').id).toBe('pilih-layanan');
  });
});
