import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Modal } from './Modal';

describe('Modal', () => {
  it('renders nothing when closed', () => {
    const { container } = render(
      <Modal open={false} onClose={() => {}}>
        Content
      </Modal>,
    );
    expect(container.textContent).toBe('');
  });

  it('renders content when open', () => {
    render(
      <Modal open={true} onClose={() => {}}>
        Modal content
      </Modal>,
    );
    expect(screen.getByText('Modal content')).toBeInTheDocument();
  });

  it('renders title when provided', () => {
    render(
      <Modal open={true} onClose={() => {}} title="Konfirmasi">
        Content
      </Modal>,
    );
    expect(screen.getByText('Konfirmasi')).toBeInTheDocument();
  });

  it('calls onClose when clicking backdrop', () => {
    const onClose = vi.fn();
    render(
      <Modal open={true} onClose={onClose}>
        Content
      </Modal>,
    );
    const backdrop = document.querySelector('.bg-black\\/50')!;
    fireEvent.click(backdrop);
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('calls onClose when clicking close button', () => {
    const onClose = vi.fn();
    render(
      <Modal open={true} onClose={onClose} title="Modal Title">
        Content
      </Modal>,
    );
    fireEvent.click(screen.getByLabelText('Tutup'));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('renders footer when provided', () => {
    render(
      <Modal open={true} onClose={() => {}} footer={<button>Simpan</button>}>
        Content
      </Modal>,
    );
    expect(screen.getByText('Simpan')).toBeInTheDocument();
  });

  it('does not render title when not provided', () => {
    render(
      <Modal open={true} onClose={() => {}}>
        Content
      </Modal>,
    );
    expect(screen.queryByRole('heading')).not.toBeInTheDocument();
  });
});
