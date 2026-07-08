import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { CustomerOrders } from './CustomerOrders';

const { mockGet, mockDownloadCSV } = vi.hoisted(() => ({
  mockGet: vi.fn(),
  mockDownloadCSV: vi.fn(),
}));

vi.mock('@specialist/shared', () => ({
  createBrowserClient: () => ({ get: mockGet }),
  formatCurrency: (n: number) => `Rp${n.toLocaleString('id-ID')}`,
  formatDate: (d: string) => d,
  getStatusLabel: (s: string) => s,
  getStatusColor: () => 'default',
  downloadCSV: mockDownloadCSV,
}));

beforeEach(() => {
  vi.clearAllMocks();
});

describe('CustomerOrders', () => {
  it('shows loading state initially', () => {
    mockGet.mockImplementation(() => new Promise(() => {}));
    render(<CustomerOrders />);
    expect(screen.getByText('Memuat...')).toBeInTheDocument();
  });

  it('shows order table when loaded', async () => {
    mockGet.mockResolvedValue([
      {
        id: 'o1',
        bookingNumber: 'SP-2026-00001',
        status: 'Confirmed',
        bookingDate: '2026-07-15',
        basePrice: '150000',
        finalPrice: null,
        createdAt: '2026-07-15T10:00:00Z',
      },
    ]);
    render(<CustomerOrders />);
    expect(await screen.findByText('SP-2026-00001')).toBeInTheDocument();
    expect(screen.getByText('Rp150.000')).toBeInTheDocument();
    expect(screen.getByText('Confirmed')).toBeInTheDocument();
    expect(screen.getByText('Detail')).toBeInTheDocument();
    expect(screen.getByText('Detail').closest('a')).toHaveAttribute(
      'href',
      '/tracking?q=SP-2026-00001',
    );
  });

  it('shows empty state when no orders', async () => {
    mockGet.mockResolvedValue([]);
    render(<CustomerOrders />);
    expect(await screen.findByText('Belum ada pesanan')).toBeInTheDocument();
  });

  it('shows empty state on API error', async () => {
    mockGet.mockRejectedValue(new Error('Gagal'));
    render(<CustomerOrders />);
    expect(await screen.findByText('Belum ada pesanan')).toBeInTheDocument();
  });

  it('handles pagination', async () => {
    const items = Array.from({ length: 20 }, (_, i) => ({
      id: `o${i}`,
      bookingNumber: `SP-2026-${String(i + 1).padStart(5, '0')}`,
      status: 'Confirmed',
      bookingDate: '2026-07-15',
      basePrice: '150000',
      finalPrice: null,
      createdAt: '2026-07-15T10:00:00Z',
    }));
    mockGet.mockResolvedValue(items);
    render(<CustomerOrders />);
    expect(await screen.findByText('SP-2026-00001')).toBeInTheDocument();
    expect(screen.getByText('SP-2026-00020')).toBeInTheDocument();
  });

  // ─── CSV Export Tests ───────────────────────────────────────────

  describe('CSV export', () => {
    beforeEach(() => {
      mockGet.mockResolvedValue([
        {
          id: 'o1',
          bookingNumber: 'SP-2026-00001',
          status: 'Confirmed',
          bookingDate: '2026-07-15',
          basePrice: '150000',
          finalPrice: null,
          createdAt: '2026-07-15T10:00:00Z',
        },
      ]);
    });

    it('renders Export CSV button when data loaded', async () => {
      render(<CustomerOrders />);
      expect(await screen.findByText('Export CSV')).toBeInTheDocument();
    });

    it('does not render Export CSV button when no orders', async () => {
      mockGet.mockReset();
      mockGet.mockResolvedValue([]);
      render(<CustomerOrders />);
      expect(await screen.findByText('Belum ada pesanan')).toBeInTheDocument();
      expect(screen.queryByText('Export CSV')).not.toBeInTheDocument();
    });

    it('calls downloadCSV with correct data on click', async () => {
      const user = userEvent.setup();
      render(<CustomerOrders />);
      expect(await screen.findByText('Export CSV')).toBeInTheDocument();

      await user.click(screen.getByText('Export CSV'));

      expect(mockDownloadCSV).toHaveBeenCalledTimes(1);
      expect(mockDownloadCSV).toHaveBeenCalledWith(
        ['No. Booking', 'Status', 'Tanggal', 'Harga'],
        [['SP-2026-00001', 'Confirmed', '2026-07-15', 'Rp150.000']],
        'pesanan-saya-export.csv',
      );
    });
  });
});
