import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { CustomerOverview } from './CustomerOverview';

vi.mock('@ahlipanggilan/ui', () => ({
  Card: ({ children, ..._props }: { children: React.ReactNode; [key: string]: unknown }) => (
    <div>{children}</div>
  ),
  Grid: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  Skeleton: () => <div aria-hidden="true" />,
  Badge: ({ children }: { children: React.ReactNode }) => <span>{children}</span>,
  EmptyState: ({ title, children }: { title?: string; children?: React.ReactNode }) => (
    <div>{title ?? children}</div>
  ),
}));

const mockGet = vi.fn();

vi.mock('@ahlipanggilan/shared', () => ({
  createBrowserClient: () => ({ get: mockGet }),
  SCHEMA_TEMPLATES: [],
}));

beforeEach(() => {
  vi.clearAllMocks();
});

describe('CustomerOverview', () => {
  it('shows loading state initially', () => {
    mockGet.mockImplementation(() => new Promise(() => {}));
    render(<CustomerOverview />);
    // Loading state renders Card + Skeleton components (aria-hidden, no visible text)
    expect(screen.queryByText('Pesanan Aktif')).not.toBeInTheDocument();
  });

  it('shows stats when loaded', async () => {
    mockGet.mockResolvedValueOnce([
      { status: 'Working' },
      { status: 'Completed' },
      { status: 'Waiting Payment' },
      { status: 'Closed' },
    ]);
    mockGet.mockResolvedValueOnce([{ id: 'a1' }, { id: 'a2' }, { id: 'a3' }]);
    render(<CustomerOverview />);
    expect(await screen.findByText('Pesanan Aktif')).toBeInTheDocument();
    expect(screen.getAllByText('1')).toHaveLength(2);
    expect(screen.getByText('Selesai')).toBeInTheDocument();
    expect(screen.getByText('2')).toBeInTheDocument();
    expect(screen.getByText('Menunggu Pembayaran')).toBeInTheDocument();
    expect(screen.getByText('Alamat Tersimpan')).toBeInTheDocument();
    expect(screen.getByText('3')).toBeInTheDocument();
  });

  it('shows zero stats on API failure', async () => {
    mockGet.mockRejectedValue(new Error('Gagal'));
    render(<CustomerOverview />);
    expect(await screen.findByText('Pesanan Aktif')).toBeInTheDocument();
    expect(screen.getAllByText('0')).toHaveLength(4);
  });
});
