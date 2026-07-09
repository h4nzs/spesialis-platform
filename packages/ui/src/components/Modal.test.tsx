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
    // Click the backdrop (identified by aria-hidden="true")
    const backdrop = document.querySelector('[aria-hidden="true"]')!;
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

  // --- Accessibility tests ---

  it('sets role="dialog" and aria-modal="true" on the dialog container', () => {
    render(
      <Modal open={true} onClose={() => {}} title="Test">
        Content
      </Modal>,
    );
    const dialog = screen.getByRole('dialog');
    expect(dialog).toHaveAttribute('aria-modal', 'true');
  });

  it('links title to dialog via aria-labelledby', () => {
    render(
      <Modal open={true} onClose={() => {}} title="Aksesibilitas">
        Content
      </Modal>,
    );
    const dialog = screen.getByRole('dialog');
    const heading = screen.getByText('Aksesibilitas');
    const labelledby = dialog.getAttribute('aria-labelledby');
    expect(labelledby).toBeTruthy();
    expect(heading.getAttribute('id')).toBe(labelledby);
  });

  it('links content to dialog via aria-describedby', () => {
    render(
      <Modal open={true} onClose={() => {}}>
        Deskripsi konten
      </Modal>,
    );
    const dialog = screen.getByRole('dialog');
    const content = screen.getByText('Deskripsi konten');
    const describedby = dialog.getAttribute('aria-describedby');
    expect(describedby).toBeTruthy();
    expect(content.closest('[id]')?.getAttribute('id')).toBe(describedby);
  });

  it('closes on Escape key', () => {
    const onClose = vi.fn();
    render(
      <Modal open={true} onClose={onClose} title="Test">
        Content
      </Modal>,
    );
    const dialog = screen.getByRole('dialog');
    fireEvent.keyDown(dialog, { key: 'Escape' });
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('focuses the first focusable element on open', () => {
    render(
      <Modal open={true} onClose={() => {}}>
        <button type="button">Tombol A</button>
        <button type="button">Tombol B</button>
      </Modal>,
    );
    expect(document.activeElement).toBe(screen.getByText('Tombol A'));
  });

  it('does not set aria-labelledby when no title is provided', () => {
    render(
      <Modal open={true} onClose={() => {}}>
        Content
      </Modal>,
    );
    const dialog = screen.getByRole('dialog');
    expect(dialog.getAttribute('aria-labelledby')).toBeFalsy();
  });

  it('traps Tab: cycles from last element back to first', () => {
    render(
      <Modal open={true} onClose={() => {}}>
        <button type="button">Tombol 1</button>
        <button type="button">Tombol 2</button>
      </Modal>,
    );

    const btn1 = screen.getByText('Tombol 1');
    const btn2 = screen.getByText('Tombol 2');
    const dialog = screen.getByRole('dialog');

    // Initial focus on first element (set by useEffect)
    expect(document.activeElement).toBe(btn1);

    // Programmatically focus the last element, then Tab should cycle to first
    btn2.focus();
    fireEvent.keyDown(dialog, { key: 'Tab' });
    expect(document.activeElement).toBe(btn1);
  });

  it('traps Shift+Tab: cycles from first element back to last', () => {
    render(
      <Modal open={true} onClose={() => {}}>
        <button type="button">Tombol 1</button>
        <button type="button">Tombol 2</button>
      </Modal>,
    );

    const btn1 = screen.getByText('Tombol 1');
    const btn2 = screen.getByText('Tombol 2');
    const dialog = screen.getByRole('dialog');

    // Focus the first element, then Shift+Tab should cycle to last
    btn1.focus();
    fireEvent.keyDown(dialog, { key: 'Tab', shiftKey: true });
    expect(document.activeElement).toBe(btn2);
  });

  it('locks body scroll when open and restores on close', () => {
    const { rerender } = render(
      <Modal open={true} onClose={() => {}}>
        Content
      </Modal>,
    );
    expect(document.body.style.overflow).toBe('hidden');

    rerender(
      <Modal open={false} onClose={() => {}}>
        Content
      </Modal>,
    );
    expect(document.body.style.overflow).toBe('');
  });
});
