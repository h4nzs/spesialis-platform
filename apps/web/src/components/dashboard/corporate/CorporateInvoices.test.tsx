import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { CorporateInvoices } from './CorporateInvoices';

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
        <div key={i} data-testid="invoice-row">
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

describe('CorporateInvoices', () => {
  it('shows loading state initially', () => {
    mockGet.mockImplementation(() => new Promise(() => {}));
    render(<CorporateInvoices />);
    // Loading state renders skeleton shimmer (aria-hidden, no visible text)
    expect(screen.queryByText('Total')).not.toBeInTheDocument();
  });

  it('shows summary cards and table when loaded', async () => {
    mockGet.mockResolvedValue([
      {
        id: 'i1',
        bookingNumber: 'INV-001',
        status: 'Paid',
        bookingDate: '2026-07-15',
        finalPrice: '150000',
        completedAt: '2026-07-16',
      },
      {
        id: 'i2',
        bookingNumber: 'INV-002',
        status: 'Pending Confirmation',
        bookingDate: '2026-07-14',
        finalPrice: '200000',
        completedAt: null,
      },
      {
        id: 'i3',
        bookingNumber: 'INV-003',
        status: 'Closed',
        bookingDate: '2026-07-13',
        finalPrice: '250000',
        completedAt: '2026-07-14',
      },
    ]);
    render(<CorporateInvoices />);
    expect(await screen.findByText('Total')).toBeInTheDocument();
    expect(screen.getByText('3')).toBeInTheDocument();
    expect(screen.getByText('Lunas')).toBeInTheDocument();
    expect(screen.getByText('2')).toBeInTheDocument();
    expect(screen.getByText('Menunggu')).toBeInTheDocument();
    expect(screen.getByText('1')).toBeInTheDocument();
    expect(screen.getByText('INV-001')).toBeInTheDocument();
    expect(screen.getByText('INV-003')).toBeInTheDocument();
  });

  it('shows all lunas when all invoices are Paid/Closed', async () => {
    mockGet.mockResolvedValue([
      {
        id: 'i1',
        bookingNumber: 'INV-001',
        status: 'Paid',
        bookingDate: '2026-07-15',
        finalPrice: '150000',
        completedAt: '2026-07-16',
      },
      {
        id: 'i2',
        bookingNumber: 'INV-002',
        status: 'Closed',
        bookingDate: '2026-07-14',
        finalPrice: '200000',
        completedAt: '2026-07-15',
      },
      {
        id: 'i3',
        bookingNumber: 'INV-003',
        status: 'Paid',
        bookingDate: '2026-07-13',
        finalPrice: '250000',
        completedAt: '2026-07-14',
      },
    ]);
    render(<CorporateInvoices />);
    expect(await screen.findByText('Lunas')).toBeInTheDocument();
    expect(screen.getByText('0')).toBeInTheDocument(); // menunggu = 0
    expect(screen.getAllByText('3').length).toBeGreaterThanOrEqual(1);
  });

  it('shows empty state', async () => {
    mockGet.mockResolvedValue([]);
    render(<CorporateInvoices />);
    expect(await screen.findByText('Belum ada invoice')).toBeInTheDocument();
  });

  it('handles API error', async () => {
    mockGet.mockRejectedValue(new Error('Gagal'));
    render(<CorporateInvoices />);
    expect(await screen.findByText('Belum ada invoice')).toBeInTheDocument();
  });

  // ─── CSV Export Tests ───────────────────────────────────────────

  describe('CSV export', () => {
    beforeEach(() => {
      mockGet.mockResolvedValue([
        {
          id: 'i1',
          bookingNumber: 'INV-001',
          status: 'Paid',
          bookingDate: '2026-07-15',
          finalPrice: '150000',
          completedAt: '2026-07-16',
        },
      ]);
    });

    it('renders Export CSV button when data loaded', async () => {
      render(<CorporateInvoices />);
      expect(await screen.findByText('Export CSV')).toBeInTheDocument();
    });

    it('does not render Export CSV button when no invoices', async () => {
      mockGet.mockReset();
      mockGet.mockResolvedValue([]);
      render(<CorporateInvoices />);
      expect(await screen.findByText('Belum ada invoice')).toBeInTheDocument();
      expect(screen.queryByText('Export CSV')).not.toBeInTheDocument();
    });

    it('calls downloadCSV with correct data on click', async () => {
      const user = userEvent.setup();
      render(<CorporateInvoices />);
      expect(await screen.findByText('Export CSV')).toBeInTheDocument();

      await user.click(screen.getByText('Export CSV'));

      expect(mockDownloadCSV).toHaveBeenCalledTimes(1);
      expect(mockDownloadCSV).toHaveBeenCalledWith(
        ['No. Invoice', 'Status', 'Tanggal', 'Jumlah', 'Selesai'],
        [['INV-001', 'Paid', '2026-07-15', 'Rp150.000', '2026-07-16']],
        'invoice-export.csv',
      );
    });
  });
});
