import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { CorporateOverview } from './CorporateOverview';

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
  formatDateRange: (s: string, e: string | null) => `${s} - ${e ?? '∞'}`,
  isExpiringSoon: () => false,
  getInvoiceBadge: (s: string) => ({ variant: 'default' as const, label: s }),
  getStatusLabel: (s: string) => s,
  getStatusColor: () => 'default' as const,
  SCHEMA_TEMPLATES: [],
}));

beforeEach(() => {
  vi.clearAllMocks();
});

describe('CorporateOverview', () => {
  it('shows loading state initially', () => {
    mockGet.mockImplementation(() => new Promise(() => {}));
    render(<CorporateOverview />);
    // Loading state renders Card + Skeleton components (aria-hidden, no visible text)
    expect(screen.queryByText('Perusahaan')).not.toBeInTheDocument();
  });

  it('shows company profile and stats when loaded', async () => {
    mockGet.mockResolvedValueOnce({
      id: 'co1',
      companyName: 'PT Maju Sejahtera',
      status: 'Verified',
      employeeCount: 250,
    });
    mockGet.mockResolvedValueOnce([
      {
        id: 'o1',
        status: 'Confirmed',
        basePrice: '100000',
        bookingNumber: 'SP-001',
        bookingDate: '2026-07-15',
        createdAt: '2026-07-15T10:00:00Z',
      },
      {
        id: 'o2',
        status: 'Working',
        basePrice: '150000',
        bookingNumber: 'SP-002',
        bookingDate: '2026-07-16',
        createdAt: '2026-07-16T10:00:00Z',
      },
      {
        id: 'o3',
        status: 'Waiting Payment',
        basePrice: '200000',
        bookingNumber: 'SP-003',
        bookingDate: '2026-07-17',
        createdAt: '2026-07-17T10:00:00Z',
      },
    ]);
    mockGet.mockResolvedValueOnce([
      { id: 'b1', name: 'Jakarta' },
      { id: 'b2', name: 'Bandung' },
    ]);
    mockGet.mockResolvedValueOnce([]); // contracts
    mockGet.mockResolvedValueOnce([]); // invoices
    render(<CorporateOverview />);
    expect(
      await screen.findByText((content) => content.includes('PT Maju Sejahtera')),
    ).toBeInTheDocument();
    expect(screen.getByText('Aktif')).toBeInTheDocument();
    expect(screen.getByText('Karyawan')).toBeInTheDocument();
    expect(screen.getByText('250')).toBeInTheDocument();
    const pesananAktif = screen.getAllByText('Pesanan Aktif');
    expect(pesananAktif.length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText('Total Cabang')).toBeInTheDocument();
  });

  it('filters out paid/closed/cancelled from active orders', async () => {
    mockGet.mockResolvedValueOnce({
      id: 'co1',
      companyName: 'Test Corp',
      status: 'Verified',
      employeeCount: 10,
    });
    mockGet.mockResolvedValueOnce([
      {
        id: 'o1',
        status: 'Confirmed',
        basePrice: '100000',
        bookingNumber: 'SP-001',
        bookingDate: '2026-07-15',
        createdAt: '2026-07-15T10:00:00Z',
      },
      {
        id: 'o2',
        status: 'Paid',
        basePrice: '200000',
        bookingNumber: 'SP-002',
        bookingDate: '2026-07-16',
        createdAt: '2026-07-16T10:00:00Z',
      },
      {
        id: 'o3',
        status: 'Closed',
        basePrice: '300000',
        bookingNumber: 'SP-003',
        bookingDate: '2026-07-17',
        createdAt: '2026-07-17T10:00:00Z',
      },
      {
        id: 'o4',
        status: 'Cancelled',
        basePrice: '400000',
        bookingNumber: 'SP-004',
        bookingDate: '2026-07-18',
        createdAt: '2026-07-18T10:00:00Z',
      },
      {
        id: 'o5',
        status: 'Working',
        basePrice: '500000',
        bookingNumber: 'SP-005',
        bookingDate: '2026-07-19',
        createdAt: '2026-07-19T10:00:00Z',
      },
    ]);
    mockGet.mockResolvedValueOnce([]);
    mockGet.mockResolvedValueOnce([]); // contracts
    mockGet.mockResolvedValueOnce([]); // invoices
    render(<CorporateOverview />);
    const twos = await screen.findAllByText((content: string) => content.trim() === '2');
    expect(twos.length).toBeGreaterThanOrEqual(1); // at least active orders = 2
    expect(screen.queryByText('4')).not.toBeInTheDocument();
  });

  it('shows fallback when profile fetch fails', async () => {
    mockGet.mockRejectedValue(new Error('Gagal'));
    render(<CorporateOverview />);
    expect(await screen.findByText('Gagal memuat data perusahaan')).toBeInTheDocument();
  });

  it('shows dash for null employeeCount', async () => {
    mockGet.mockResolvedValueOnce({
      id: 'co1',
      companyName: 'Test',
      status: 'Pending',
      employeeCount: null,
    });
    mockGet.mockResolvedValueOnce([]);
    mockGet.mockResolvedValueOnce([]);
    render(<CorporateOverview />);
    expect(await screen.findByText('-')).toBeInTheDocument();
  });
});
