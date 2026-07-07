import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { AdminBookings } from './AdminBookings';

const mockGet = vi.fn();
const mockPost = vi.fn();

vi.mock('@specialist/shared', () => ({
  createBrowserClient: () => ({ get: mockGet, post: mockPost }),
  formatCurrency: (n: number) => `Rp${n.toLocaleString('id-ID')}`,
  formatDate: (d: string) => d,
  getStatusLabel: (s: string) => s,
  getStatusColor: () => 'default',
}));

beforeEach(() => {
  vi.clearAllMocks();
});

describe('AdminBookings', () => {
  it('shows loading state initially', () => {
    mockGet.mockImplementation(() => new Promise(() => {}));
    render(<AdminBookings />);
    expect(screen.getByText('Memuat...')).toBeInTheDocument();
  });

  it('shows booking table when loaded', async () => {
    mockGet.mockResolvedValue([
      {
        id: 'b1',
        bookingNumber: 'SP-2026-00001',
        status: 'Pending Confirmation',
        bookingDate: '2026-07-15',
        basePrice: '150000',
        finalPrice: null,
        createdAt: '2026-07-15T10:00:00Z',
      },
    ]);
    render(<AdminBookings />);
    expect(await screen.findByText('SP-2026-00001')).toBeInTheDocument();
    expect(screen.getByText('Pending Confirmation')).toBeInTheDocument();
    expect(screen.getByText('Konfirmasi')).toBeInTheDocument();
  });

  it('shows action buttons based on status (Pending Confirmation)', async () => {
    mockGet.mockResolvedValue([
      {
        id: 'b1',
        bookingNumber: 'SP-001',
        status: 'Pending Confirmation',
        bookingDate: '2026-07-15',
        basePrice: '150000',
        finalPrice: null,
        createdAt: '2026-07-15T10:00:00Z',
      },
    ]);
    render(<AdminBookings />);
    expect(await screen.findByText('Konfirmasi')).toBeInTheDocument();
    expect(screen.getByText('Batal')).toBeInTheDocument();
  });

  it('shows assign and cancel button for Waiting Assignment status', async () => {
    mockGet.mockResolvedValue([
      {
        id: 'b2',
        bookingNumber: 'SP-002',
        status: 'Waiting Assignment',
        bookingDate: '2026-07-15',
        basePrice: '150000',
        finalPrice: null,
        createdAt: '2026-07-15T10:00:00Z',
      },
    ]);
    render(<AdminBookings />);
    expect(await screen.findByText('Assign')).toBeInTheDocument();
    expect(screen.getByText('Batal')).toBeInTheDocument();
  });

  it('shows empty state when no bookings', async () => {
    mockGet.mockResolvedValue([]);
    render(<AdminBookings />);
    expect(await screen.findByText('Belum ada booking')).toBeInTheDocument();
  });

  it('shows empty state on API error', async () => {
    mockGet.mockRejectedValue(new Error('Gagal'));
    render(<AdminBookings />);
    expect(await screen.findByText('Belum ada booking')).toBeInTheDocument();
  });
});
