import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { AdminOverview } from './AdminOverview';

const mockGet = vi.fn();

vi.mock('@specialist/shared', () => ({
  createBrowserClient: () => ({ get: mockGet }),
  formatCurrency: (n: number) => `Rp${n.toLocaleString('id-ID')}`,
}));

beforeEach(() => {
  vi.clearAllMocks();
});

describe('AdminOverview', () => {
  it('shows loading state initially', () => {
    mockGet.mockImplementation(() => new Promise(() => {}));
    render(<AdminOverview />);
    // Loading state renders Card + Skeleton components (aria-hidden, no visible text)
    expect(screen.queryByText('Pesanan Hari Ini')).not.toBeInTheDocument();
  });

  it('shows dashboard stats when loaded', async () => {
    mockGet.mockResolvedValue({
      orders: { total: 100, active: 25, waitingAssignment: 5, today: 10 },
      partners: { available: 8, pendingVerification: 3 },
      revenue: { total: 50000000 },
      complaints: { total: 12, open: 4 },
    });
    render(<AdminOverview />);
    expect(await screen.findByText('Pesanan Hari Ini')).toBeInTheDocument();
    expect(screen.getByText('10')).toBeInTheDocument();
    expect(screen.getByText('25')).toBeInTheDocument();
    expect(screen.getByText('5')).toBeInTheDocument();
    expect(screen.getByText('100')).toBeInTheDocument();
    expect(screen.getByText('8')).toBeInTheDocument();
    expect(screen.getByText('3')).toBeInTheDocument();
    expect(screen.getByText('4')).toBeInTheDocument();
    expect(screen.getByText(/Rp50.000.000/)).toBeInTheDocument();
  });

  it('shows quick action links', async () => {
    mockGet.mockResolvedValue({});
    render(<AdminOverview />);
    expect(await screen.findByText('Aksi Cepat')).toBeInTheDocument();
    expect(screen.getByText('Kelola Booking')).toHaveAttribute('href', '/dashboard/admin/bookings');
    expect(screen.getByText('Verifikasi Partner')).toHaveAttribute(
      'href',
      '/dashboard/admin/partners',
    );
    expect(screen.getByText('Tambah Layanan')).toHaveAttribute('href', '/dashboard/admin/services');
    expect(screen.getByText('Tulis Artikel')).toHaveAttribute('href', '/dashboard/admin/articles');
    expect(screen.getByText('Kelola User')).toHaveAttribute('href', '/dashboard/admin/users');
  });

  it('shows zero stats when fetch fails', async () => {
    mockGet.mockRejectedValue(new Error('Gagal'));
    render(<AdminOverview />);
    expect(await screen.findByText('Pesanan Hari Ini')).toBeInTheDocument();
    expect(screen.getAllByText('0')).toHaveLength(7);
  });
});
