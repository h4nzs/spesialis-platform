import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { CustomerOverview } from './CustomerOverview';

vi.mock('@ahlipanggilan/ui', () => ({
  Card: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  Grid: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  Skeleton: () => <div aria-hidden="true" />,
  Badge: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  EmptyState: ({ title, children }: { title?: string; children?: React.ReactNode }) => (
    <div>{title ?? children}</div>
  ),
}));

const mockGet = vi.fn();

vi.mock('@ahlipanggilan/shared', () => ({
  createBrowserClient: () => ({ get: mockGet }),
  formatCurrency: (n: number | string) => {
    const num = typeof n === 'string' ? Number(n) : n;
    return `Rp${num.toLocaleString('id-ID')}`;
  },
  formatDate: (d: string) => d,
  getStatusLabel: (s: string) => s,
  getStatusColor: () => 'default' as const,
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
    mockGet.mockResolvedValueOnce({
      user: { id: 'u1', email: 'a@b.com', phone: '081', role: 'customer', emailVerifiedAt: null },
    });
    mockGet.mockResolvedValueOnce([
      { status: 'Working' },
      { status: 'Completed' },
      { status: 'Waiting Payment' },
      { status: 'Closed' },
    ]);
    mockGet.mockResolvedValueOnce([{ id: 'a1' }, { id: 'a2' }, { id: 'a3' }]);
    render(<CustomerOverview />);
    expect(await screen.findAllByText('Pesanan Aktif')).toHaveLength(2);
    expect(screen.getByText('Selesai')).toBeInTheDocument();
    expect(screen.getByText('Total Pesanan')).toBeInTheDocument();
    expect(screen.getByText('Alamat Tersimpan')).toBeInTheDocument();
  });

  it('shows empty state on API failure', async () => {
    mockGet.mockRejectedValue(new Error('Gagal'));
    render(<CustomerOverview />);
    expect(await screen.findByText('Belum ada pesanan')).toBeInTheDocument();
  });
});
