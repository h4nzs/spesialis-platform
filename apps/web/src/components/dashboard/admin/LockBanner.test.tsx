import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { LockBanner } from './LockBanner';

describe('LockBanner', () => {
  // ── Locked variant (full) ────────────────────────────────────

  it('renders locked message with resource name and email', () => {
    render(<LockBanner type="locked" resourceName="Artikel" lockedByEmail="user@example.com" />);
    expect(screen.getByText(/Artikel sedang diedit oleh/)).toBeInTheDocument();
    expect(screen.getByText('user@example.com')).toBeInTheDocument();
  });

  it('renders full description text for non-compact locked', () => {
    render(<LockBanner type="locked" resourceName="Halaman" lockedByEmail="admin@test.com" />);
    expect(
      screen.getByText(/tidak dapat menyimpan perubahan hingga pengguna menyelesaikan/),
    ).toBeInTheDocument();
  });

  it('renders Ambil Alih and Kembali buttons when handlers provided', () => {
    render(
      <LockBanner
        type="locked"
        resourceName="Artikel"
        lockedByEmail="a@b.com"
        onTakeover={vi.fn()}
        onBack={vi.fn()}
      />,
    );
    expect(screen.getByRole('button', { name: 'Ambil Alih' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Kembali' })).toBeInTheDocument();
  });

  it('does not render buttons when handlers omitted', () => {
    render(<LockBanner type="locked" resourceName="Artikel" lockedByEmail="a@b.com" />);
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });

  it('calls onTakeover when Ambil Alih clicked', async () => {
    const takeover = vi.fn();
    render(
      <LockBanner
        type="locked"
        resourceName="Artikel"
        lockedByEmail="a@b.com"
        onTakeover={takeover}
        onBack={vi.fn()}
      />,
    );
    await userEvent.click(screen.getByRole('button', { name: 'Ambil Alih' }));
    expect(takeover).toHaveBeenCalledTimes(1);
  });

  it('calls onBack when Kembali clicked', async () => {
    const back = vi.fn();
    render(
      <LockBanner type="locked" resourceName="Artikel" lockedByEmail="a@b.com" onBack={back} />,
    );
    await userEvent.click(screen.getByRole('button', { name: 'Kembali' }));
    expect(back).toHaveBeenCalledTimes(1);
  });

  it('renders with warning (yellow) styling for locked type', () => {
    const { container } = render(
      <LockBanner type="locked" resourceName="Artikel" lockedByEmail="a@b.com" />,
    );
    const outer = container.firstElementChild!;
    expect(outer.className).toContain('bg-warning-50');
    expect(outer.className).toContain('border-warning-200');
  });

  it('shows Unknown when lockedByEmail is undefined', () => {
    render(<LockBanner type="locked" resourceName="Artikel" />);
    expect(screen.getByText('Unknown')).toBeInTheDocument();
  });

  // ── Locked variant (compact) ─────────────────────────────────

  it('renders compact locked with smaller text and Tutup button', () => {
    render(
      <LockBanner
        type="locked"
        resourceName="FAQ"
        lockedByEmail="user@test.com"
        compact
        onBack={vi.fn()}
      />,
    );
    // Compact: Tutup instead of Kembali
    expect(screen.getByRole('button', { name: 'Tutup' })).toBeInTheDocument();
    // Compact: shorter description
    expect(screen.getByText('Anda hanya dapat melihat.')).toBeInTheDocument();
  });

  it('renders compact locked with text-xs class', () => {
    render(<LockBanner type="locked" resourceName="FAQ" lockedByEmail="u@t.com" compact />);
    const headings = screen.getAllByText(/FAQ sedang diedit oleh/);
    expect(headings[0].className).toContain('text-xs');
  });

  // ── LockLost variant (full) ──────────────────────────────────

  it('renders lockLost message', () => {
    render(<LockBanner type="lockLost" resourceName="Artikel" />);
    expect(screen.getByText('Kunci telah diambil alih oleh pengguna lain')).toBeInTheDocument();
  });

  it('renders full lockLost description for non-compact', () => {
    render(<LockBanner type="lockLost" resourceName="Artikel" />);
    expect(screen.getByText(/Salin perubahan Anda dan mulai ulang/)).toBeInTheDocument();
  });

  it('does not render buttons for lockLost', () => {
    render(
      <LockBanner type="lockLost" resourceName="Artikel" onTakeover={vi.fn()} onBack={vi.fn()} />,
    );
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });

  it('renders with danger (red) styling for lockLost type', () => {
    const { container } = render(<LockBanner type="lockLost" resourceName="Artikel" />);
    const outer = container.firstElementChild!;
    expect(outer.className).toContain('bg-danger-50');
    expect(outer.className).toContain('border-danger-200');
  });

  // ── LockLost variant (compact) ───────────────────────────────

  it('renders compact lockLost with shorter description', () => {
    render(<LockBanner type="lockLost" resourceName="FAQ" compact />);
    expect(screen.getByText('Kunci telah diambil alih oleh pengguna lain')).toBeInTheDocument();
    // Compact description
    expect(screen.getByText('Salin perubahan Anda dan mulai ulang.')).toBeInTheDocument();
  });

  it('renders compact lockLost with text-xs class', () => {
    render(<LockBanner type="lockLost" resourceName="FAQ" compact />);
    const text = screen.getByText('Kunci telah diambil alih oleh pengguna lain');
    expect(text.className).toContain('text-xs');
  });

  // ── Custom backLabel ─────────────────────────────────────────

  it('renders custom backLabel override', () => {
    render(
      <LockBanner
        type="locked"
        resourceName="Artikel"
        lockedByEmail="a@b.com"
        onBack={vi.fn()}
        backLabel="Keluar"
      />,
    );
    expect(screen.getByRole('button', { name: 'Keluar' })).toBeInTheDocument();
  });
});
