import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { EmptyState } from './EmptyState.tsx';

describe('EmptyState', () => {
  it('renders title', () => {
    render(<EmptyState title="Belum ada data" />);
    expect(screen.getByText('Belum ada data')).toBeTruthy();
  });

  it('renders description', () => {
    render(<EmptyState title="Kosong" description="Belum ada pesanan." />);
    expect(screen.getByText('Belum ada pesanan.')).toBeTruthy();
  });

  it('renders action element', () => {
    render(<EmptyState title="Kosong" action={<button>Buat Baru</button>} />);
    expect(screen.getByText('Buat Baru')).toBeTruthy();
  });
});
