import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { FileUpload } from './FileUpload';

describe('FileUpload', () => {
  it('renders upload button', () => {
    render(<FileUpload />);
    expect(screen.getByText('Klik untuk upload')).toBeInTheDocument();
  });

  it('renders with label', () => {
    render(<FileUpload label="Upload Foto" />);
    expect(screen.getByText('Upload Foto')).toBeInTheDocument();
  });

  it('renders hidden file input', () => {
    render(<FileUpload />);
    const input = screen.getByTestId('file-input') as HTMLInputElement;
    expect(input).toBeInTheDocument();
    expect(input.type).toBe('file');
  });

  it('shows error message when provided', () => {
    render(<FileUpload error="File terlalu besar" />);
    expect(screen.getByText('File terlalu besar')).toBeInTheDocument();
  });

  it('accepts custom accept attribute', () => {
    render(<FileUpload accept=".pdf" />);
    const input = screen.getByTestId('file-input') as HTMLInputElement;
    expect(input.accept).toBe('.pdf');
  });

  it('supports multiple files', () => {
    render(<FileUpload multiple />);
    const input = screen.getByTestId('file-input') as HTMLInputElement;
    expect(input.multiple).toBe(true);
  });

  it('clicks hidden input on button click', () => {
    const clickSpy = vi.fn();
    render(<FileUpload />);
    const input = screen.getByTestId('file-input') as HTMLInputElement;
    input.click = clickSpy;
    fireEvent.click(screen.getByText('Klik untuk upload'));
    expect(clickSpy).toHaveBeenCalled();
  });
});
