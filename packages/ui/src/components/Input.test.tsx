import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Input } from './Input';

describe('Input', () => {
  it('renders input element', () => {
    render(<Input />);
    expect(screen.getByRole('textbox')).toBeInTheDocument();
  });

  it('renders with label', () => {
    render(<Input label="Nama" />);
    expect(screen.getByLabelText('Nama')).toBeInTheDocument();
  });

  it('renders placeholder text', () => {
    render(<Input placeholder="Masukkan nama" />);
    expect(screen.getByPlaceholderText('Masukkan nama')).toBeInTheDocument();
  });

  it('displays value', () => {
    render(<Input value="John" onChange={() => {}} />);
    expect(screen.getByDisplayValue('John')).toBeInTheDocument();
  });

  it('calls onChange when typing', () => {
    const onChange = vi.fn();
    render(<Input onChange={onChange} />);
    fireEvent.change(screen.getByRole('textbox'), { target: { value: 'a' } });
    expect(onChange).toHaveBeenCalled();
  });

  it('shows error message', () => {
    render(<Input error="Field wajib diisi" />);
    expect(screen.getByText('Field wajib diisi')).toBeInTheDocument();
  });

  it('applies error border style', () => {
    render(<Input error="Error" />);
    expect(screen.getByRole('textbox').className).toContain('border-danger');
  });

  it('renders disabled state', () => {
    render(<Input disabled />);
    expect(screen.getByRole('textbox')).toBeDisabled();
  });

  it('renders with id matching label', () => {
    render(<Input label="Email" id="email-field" />);
    expect(screen.getByLabelText('Email').id).toBe('email-field');
  });

  it('generates id from label when no id provided', () => {
    render(<Input label="Nama Lengkap" />);
    const input = screen.getByLabelText('Nama Lengkap');
    expect(input.id).toBe('nama-lengkap');
  });
});
