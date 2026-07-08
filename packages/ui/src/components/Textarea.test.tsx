import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Textarea } from './Textarea';

describe('Textarea', () => {
  it('renders textarea element', () => {
    render(<Textarea />);
    expect(screen.getByRole('textbox')).toBeInTheDocument();
  });

  it('renders with label', () => {
    render(<Textarea label="Deskripsi" />);
    expect(screen.getByLabelText('Deskripsi')).toBeInTheDocument();
  });

  it('renders placeholder text', () => {
    render(<Textarea placeholder="Tulis deskripsi..." />);
    expect(screen.getByPlaceholderText('Tulis deskripsi...')).toBeInTheDocument();
  });

  it('displays value', () => {
    render(<Textarea value="Test content" onChange={() => {}} />);
    expect(screen.getByDisplayValue('Test content')).toBeInTheDocument();
  });

  it('calls onChange when typing', () => {
    const onChange = vi.fn();
    render(<Textarea onChange={onChange} />);
    fireEvent.change(screen.getByRole('textbox'), { target: { value: 'new text' } });
    expect(onChange).toHaveBeenCalled();
  });

  it('shows error message', () => {
    render(<Textarea error="Field wajib diisi" />);
    expect(screen.getByText('Field wajib diisi')).toBeInTheDocument();
  });

  it('applies error border style', () => {
    render(<Textarea error="Error" />);
    expect(screen.getByRole('textbox').className).toContain('border-danger-500');
  });

  it('renders disabled state', () => {
    render(<Textarea disabled />);
    expect(screen.getByRole('textbox')).toBeDisabled();
  });

  it('renders with id matching label', () => {
    render(<Textarea label="Catatan" id="catatan-field" />);
    expect(screen.getByLabelText('Catatan').id).toBe('catatan-field');
  });

  it('has minimum height', () => {
    render(<Textarea />);
    expect(screen.getByRole('textbox').className).toContain('min-h');
  });
});
