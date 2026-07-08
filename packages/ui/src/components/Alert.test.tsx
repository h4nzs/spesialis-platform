import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Alert } from './Alert.tsx';

describe('Alert', () => {
  it('renders children', () => {
    render(<Alert>Pesan sukses</Alert>);
    expect(screen.getByText('Pesan sukses')).toBeTruthy();
  });

  it('renders title', () => {
    render(<Alert title="Berhasil">Pesan</Alert>);
    expect(screen.getByText('Berhasil')).toBeTruthy();
  });

  it('renders with role alert', () => {
    render(<Alert>Pesan</Alert>);
    expect(screen.getByRole('alert')).toBeTruthy();
  });

  it('renders dismiss button when dismissible', () => {
    render(<Alert dismissible>Pesan</Alert>);
    expect(screen.getByLabelText('Tutup')).toBeTruthy();
  });

  it('calls onDismiss when dismiss button clicked', () => {
    const fn = vi.fn();
    render(
      <Alert dismissible onDismiss={fn}>
        Pesan
      </Alert>,
    );
    fireEvent.click(screen.getByLabelText('Tutup'));
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it('renders success variant', () => {
    const { container } = render(<Alert variant="success">Sukses</Alert>);
    expect((container.firstChild as HTMLElement).className).toContain('border-success-200');
  });

  it('renders danger variant', () => {
    const { container } = render(<Alert variant="danger">Gagal</Alert>);
    expect((container.firstChild as HTMLElement).className).toContain('border-danger-200');
  });
});
