import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { FileUpload } from './FileUpload';

function createMockFile(name: string, size: number, type: string): File {
  const file = new File(['x'.repeat(size)], name, { type });
  return file;
}

describe('FileUpload', () => {
  it('renders upload button', () => {
    render(<FileUpload />);
    expect(screen.getByText('Klik untuk upload')).toBeInTheDocument();
  });

  it('renders with label', () => {
    render(<FileUpload label="Upload Foto" />);
    expect(screen.getByText('Upload Foto')).toBeInTheDocument();
  });

  it('shows error when file exceeds max size', () => {
    render(<FileUpload maxSizeMB={1} />);
    const input = screen.getByTestId('file-input');
    const largeFile = createMockFile('photo.jpg', 2 * 1024 * 1024, 'image/jpeg');
    fireEvent.change(input, { target: { files: [largeFile] } });
    expect(screen.getByText('Ukuran file maksimal 1MB')).toBeInTheDocument();
  });

  it('calls onChange when file selected', () => {
    const onChange = vi.fn();
    render(<FileUpload onChange={onChange} />);
    const input = screen.getByTestId('file-input');
    const file = createMockFile('photo.jpg', 1024, 'image/jpeg');
    fireEvent.change(input, { target: { files: [file] } });
    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onChange).toHaveBeenCalledWith([file]);
  });

  it('shows error prop', () => {
    render(<FileUpload error="File tidak valid" />);
    expect(screen.getByText('File tidak valid')).toBeInTheDocument();
  });

  it('accepts custom accept type', () => {
    render(<FileUpload accept=".pdf" />);
    expect(screen.getByTestId('file-input')).toHaveAttribute('accept', '.pdf');
  });

  it('accepts multiple files', () => {
    render(<FileUpload multiple />);
    expect(screen.getByTestId('file-input')).toHaveAttribute('multiple');
  });
});
