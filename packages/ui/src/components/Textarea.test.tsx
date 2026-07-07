import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Textarea } from './Textarea';

describe('Textarea', () => {
  it('renders textarea element', () => {
    render(<Textarea />);
    expect(screen.getByRole('textbox')).toBeInTheDocument();
  });

  it('renders with label', () => {
    render(<Textarea label="Catatan" />);
    expect(screen.getByLabelText('Catatan')).toBeInTheDocument();
  });

  it('displays placeholder', () => {
    render(<Textarea placeholder="Tulis catatan..." />);
    expect(screen.getByPlaceholderText('Tulis catatan...')).toBeInTheDocument();
  });

  it('displays value', () => {
    render(<Textarea value="Some text" onChange={() => {}} />);
    expect(screen.getByDisplayValue('Some text')).toBeInTheDocument();
  });

  it('calls onChange when typing', () => {
    const onChange = vi.fn();
    render(<Textarea onChange={onChange} />);
    fireEvent.change(screen.getByRole('textbox'), { target: { value: 'new text' } });
    expect(onChange).toHaveBeenCalled();
  });

  it('shows error message', () => {
    render(<Textarea error="Catatan terlalu pendek" />);
    expect(screen.getByText('Catatan terlalu pendek')).toBeInTheDocument();
  });

  it('applies error border', () => {
    render(<Textarea error="Error" />);
    expect(screen.getByRole('textbox').className).toContain('border-danger');
  });

  it('renders disabled state', () => {
    render(<Textarea disabled />);
    expect(screen.getByRole('textbox')).toBeDisabled();
  });

  it('generates id from label', () => {
    render(<Textarea label="Deskripsi" />);
    expect(screen.getByLabelText('Deskripsi').id).toBe('deskripsi');
  });
});
