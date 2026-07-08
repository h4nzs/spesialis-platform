import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { CorporateOrders } from './CorporateOrders';

const { mockGet, mockDownloadCSV } = vi.hoisted(() => ({
  mockGet: vi.fn(),
  mockDownloadCSV: vi.fn(),
}));

vi.mock('@specialist/shared', () => ({
  createBrowserClient: () => ({ get: mockGet }),
  formatCurrency: (n: number | string) => {
    const num = typeof n === 'string' ? Number(n) : n;
    return `Rp${num.toLocaleString('id-ID')}`;
  },
  formatDate: (d: string) => d,
  getStatusLabel: (s: string) => s,
  getStatusColor: () => 'default' as const,
  downloadCSV: mockDownloadCSV,
}));

vi.mock('@specialist/ui', () => ({
  Badge: ({ children, variant: _variant }: { children: React.ReactNode; variant?: string }) => (
    <span>{children}</span>
  ),
  Table: ({
    data,
    emptyMessage,
    emptyState,
    columns,
  }: {
    data: unknown[];
    emptyMessage?: string;
    emptyState?: React.ReactNode;
    columns: { key: string; header: string; render?: (item: unknown) => React.ReactNode }[];
  }) => (
    <div>
      {data.length === 0 && (emptyState ?? <p>{emptyMessage ?? ''}</p>)}
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
  EmptyState: ({ title, children }: { title?: string; children?: React.ReactNode }) => (
    <div>{title ?? children}</div>
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
      EmptyState: ({ title, children }: { title?: string; children?: React.ReactNode }) => (
        <div>{title ?? children}</div>
      ),
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

  // ─── CSV Export Tests ───────────────────────────────────────────

  describe('CSV export', () => {
    beforeEach(() => {
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
    });

    it('renders Export CSV button when data loaded', async () => {
      render(<CorporateOrders />);
      expect(await screen.findByText('Export CSV')).toBeInTheDocument();
    });

    it('does not render Export CSV button when no orders', async () => {
      mockGet.mockReset();
      mockGet.mockResolvedValue([]);
      render(<CorporateOrders />);
      expect(await screen.findByText('Belum ada pesanan')).toBeInTheDocument();
      expect(screen.queryByText('Export CSV')).not.toBeInTheDocument();
    });

    it('calls downloadCSV with correct data on click', async () => {
      const user = userEvent.setup();
      render(<CorporateOrders />);
      expect(await screen.findByText('Export CSV')).toBeInTheDocument();

      await user.click(screen.getByText('Export CSV'));

      expect(mockDownloadCSV).toHaveBeenCalledTimes(1);
      expect(mockDownloadCSV).toHaveBeenCalledWith(
        ['No. Booking', 'Status', 'Tanggal', 'Estimasi', 'Harga Final'],
        [['SP-001', 'Confirmed', '2026-07-15', 'Rp150.000', 'Rp180.000']],
        'pesanan-korporat-export.csv',
      );
    });
  });
});
