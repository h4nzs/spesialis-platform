import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ConfirmDialog } from './ConfirmDialog.tsx';

describe('ConfirmDialog', () => {
  it('renders nothing when closed', () => {
    const { container } = render(
      <ConfirmDialog open={false} title="Hapus?" onConfirm={vi.fn()} onCancel={vi.fn()}>
        Yakin?
      </ConfirmDialog>,
    );
    expect(container.innerHTML).toBe('');
  });

  it('renders when open', () => {
    render(
      <ConfirmDialog open={true} title="Hapus?" onConfirm={vi.fn()} onCancel={vi.fn()}>
        Yakin ingin menghapus?
      </ConfirmDialog>,
    );
    expect(screen.getByText('Yakin ingin menghapus?')).toBeTruthy();
    expect(screen.getByText('Konfirmasi')).toBeTruthy();
    expect(screen.getByText('Batal')).toBeTruthy();
  });

  it('calls onCancel when cancel clicked', () => {
    const cancel = vi.fn();
    render(
      <ConfirmDialog open={true} title="Hapus?" onConfirm={vi.fn()} onCancel={cancel}>
        Yakin?
      </ConfirmDialog>,
    );
    fireEvent.click(screen.getByText('Batal'));
    expect(cancel).toHaveBeenCalledTimes(1);
  });

  it('calls onConfirm when confirm clicked', () => {
    const confirm = vi.fn();
    render(
      <ConfirmDialog open={true} title="Hapus?" onConfirm={confirm} onCancel={vi.fn()}>
        Yakin?
      </ConfirmDialog>,
    );
    fireEvent.click(screen.getByText('Konfirmasi'));
    expect(confirm).toHaveBeenCalledTimes(1);
  });
});
