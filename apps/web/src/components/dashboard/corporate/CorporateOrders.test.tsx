import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { CorporateOrders } from './CorporateOrders';

const mockGet = vi.fn();

vi.mock('@specialist/shared', () => ({
  createBrowserClient: () => ({ get: mockGet }),
  formatCurrency: (n: number | string) => {
    const num = typeof n === 'string' ? Number(n) : n;
    return `Rp${num.toLocaleString('id-ID')}`;
  },
  formatDate: (d: string) => d,
  getStatusLabel: (s: string) => s,
  getStatusColor: () => 'default' as const,
}));

vi.mock('@specialist/ui', () => ({
  Badge: ({ children, variant: _variant }: { children: React.ReactNode; variant?: string }) => (
    <span>{children}</span>
  ),
  Table: ({
    data,
    emptyMessage,
    columns,
  }: {
    data: unknown[];
    emptyMessage: string;
    columns: { key: string; header: string; render?: (item: unknown) => React.ReactNode }[];
  }) => (
    <div>
      {data.length === 0 && <p>{emptyMessage}</p>}
      {data.map((item, i) => (
        <div key={i} data-testid="order-row">
          {columns.map((col) => (
            <span key={col.key}>
              {col.render
                ? col.render(item)
                : ((item as Record<string, unknown>)[col.key] as string)}
            </span>
          ))}
        </div>
      ))}
    </div>
  ),
}));

beforeEach(() => {
  vi.clearAllMocks();
});

describe('CorporateOrders', () => {
  it('shows loading state initially', () => {
    mockGet.mockImplementation(() => new Promise(() => {}));
    render(<CorporateOrders />);
    expect(screen.getByText('Memuat...')).toBeInTheDocument();
  });

  it('shows orders when loaded', async () => {
    mockGet.mockResolvedValue([
      {
        id: 'o1',
        bookingNumber: 'SP-001',
        status: 'Confirmed',
        bookingDate: '2026-07-15',
        basePrice: '150000',
        finalPrice: '180000',
        createdAt: '2026-07-15T10:00:00Z',
      },
    ]);
    render(<CorporateOrders />);
    expect(await screen.findByText('SP-001')).toBeInTheDocument();
    expect(screen.getByText('Confirmed')).toBeInTheDocument();
    expect(screen.getByText('Rp150.000')).toBeInTheDocument();
  });

  it('shows Muat Lainnya when hasMore is true', async () => {
    const items = Array.from({ length: 20 }, (_, i) => ({
      id: `o${i}`,
      bookingNumber: `SP-${String(i + 1).padStart(3, '0')}`,
      status: 'Confirmed',
      bookingDate: '2026-07-15',
      basePrice: '100000',
      finalPrice: null,
      createdAt: '2026-07-15T10:00:00Z',
    }));
    mockGet.mockResolvedValue(items);
    render(<CorporateOrders />);
    expect(await screen.findByText('SP-001')).toBeInTheDocument();
    expect(screen.getByText('Muat Lainnya')).toBeInTheDocument();
  });

  it('shows empty state', async () => {
    mockGet.mockResolvedValue([]);
    render(<CorporateOrders />);
    expect(await screen.findByText('Belum ada pesanan')).toBeInTheDocument();
  });

  it('handles API error', async () => {
    mockGet.mockRejectedValue(new Error('Gagal'));
    render(<CorporateOrders />);
    expect(await screen.findByText('Belum ada pesanan')).toBeInTheDocument();
  });
});
