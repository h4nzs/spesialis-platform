import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { CustomerOrders } from './CustomerOrders';

const mockGet = vi.fn();

vi.mock('@specialist/shared', () => ({
  createBrowserClient: () => ({ get: mockGet }),
  formatCurrency: (n: number) => `Rp${n.toLocaleString('id-ID')}`,
  formatDate: (d: string) => d,
  getStatusLabel: (s: string) => s,
  getStatusColor: () => 'default',
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
});
