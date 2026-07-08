import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { PartnerPenalties } from './PartnerPenalties';

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
  downloadCSV: mockDownloadCSV,
}));

vi.mock('@specialist/ui', () => ({
  Card: ({ children, padding: _padding }: { children: React.ReactNode; padding?: string }) => (
    <div>{children}</div>
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
        <div key={i} data-testid="penalty-row">
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
  Badge: ({ children }: { children: React.ReactNode }) => <span>{children}</span>,
  EmptyState: ({ title, children }: { title?: string; children?: React.ReactNode }) => (
    <div>{title ?? children}</div>
  ),
  Skeleton: () => <div aria-hidden="true" />,
}));

beforeEach(() => {
  vi.clearAllMocks();
});

describe('PartnerPenalties', () => {
  it('shows loading state initially', () => {
    mockGet.mockImplementation(() => new Promise(() => {}));
    render(<PartnerPenalties />);
    // Loading state renders Skeleton components (aria-hidden, no visible text)
    // The data state elements should not be present
    expect(screen.queryByText('Total Penalty')).not.toBeInTheDocument();
  });

  it('shows stat cards and table when loaded', async () => {
    mockGet.mockResolvedValue([
      {
        id: 'pen1',
        orderId: null,
        type: 'Late',
        amount: '50000',
        reason: 'Terlambat 2 jam',
        status: 'Pending',
        imposedAt: '2026-07-15T10:00:00Z',
        resolvedAt: null,
        notes: null,
      },
      {
        id: 'pen2',
        orderId: 'o1',
        type: 'Complaint',
        amount: '100000',
        reason: 'Komplain customer',
        status: 'Applied',
        imposedAt: '2026-07-10T10:00:00Z',
        resolvedAt: '2026-07-12T10:00:00Z',
        notes: null,
      },
    ]);
    render(<PartnerPenalties />);

    // Stat cards
    expect(await screen.findByText('Total Penalty')).toBeInTheDocument();
    // Dikenakan appears in both stat card label and Applied badge
    expect(screen.getAllByText('Dikenakan')).toHaveLength(2);

    // Table content — use getAllByText for text that appears both in cards and table
    expect(screen.getAllByText('Menunggu')).toHaveLength(2); // card label + Pending badge
    expect(screen.getByText('Terlambat 2 jam')).toBeInTheDocument();
    expect(screen.getByText('Komplain customer')).toBeInTheDocument();
    expect(screen.getByText('Komplain')).toBeInTheDocument();
  });

  it('shows correct stat values', async () => {
    mockGet.mockResolvedValue([
      {
        id: 'p1',
        orderId: null,
        type: 'Late',
        amount: '50000',
        reason: 'A',
        status: 'Pending',
        imposedAt: '2026-07-15',
        resolvedAt: null,
        notes: null,
      },
      {
        id: 'p2',
        orderId: null,
        type: 'Late',
        amount: '25000',
        reason: 'B',
        status: 'Pending',
        imposedAt: '2026-07-15',
        resolvedAt: null,
        notes: null,
      },
      {
        id: 'p3',
        orderId: null,
        type: 'NoShow',
        amount: '100000',
        reason: 'C',
        status: 'Applied',
        imposedAt: '2026-07-15',
        resolvedAt: null,
        notes: null,
      },
    ]);
    render(<PartnerPenalties />);

    // Total = 50000 + 25000 + 100000 = 175000
    // Menunggu = 50000 + 25000 = 75000  (appears as stat value only)
    // Dikenakan = 100000 (appears as stat value only)
    expect(await screen.findByText('Rp175.000')).toBeInTheDocument();
    expect(screen.getByText('Rp75.000')).toBeInTheDocument();
    // Rp100.000 appears in both Dikenakan stat card and Applied table row
    expect(screen.getAllByText('Rp100.000')).toHaveLength(2);
  });

  it('shows zero stats when no penalties', async () => {
    mockGet.mockResolvedValue([]);
    render(<PartnerPenalties />);

    // Rp0 appears in all 3 stat cards when there are no penalties
    expect(await screen.findByText('Belum ada penalty')).toBeInTheDocument();
    expect(screen.getAllByText('Rp0')).toHaveLength(3); // Total, Menunggu, Dikenakan
  });

  it('shows empty state on API error', async () => {
    mockGet.mockRejectedValue(new Error('Gagal'));
    render(<PartnerPenalties />);
    expect(await screen.findByText('Belum ada penalty')).toBeInTheDocument();
  });

  it('shows dash for unresolved penalties', async () => {
    mockGet.mockResolvedValue([
      {
        id: 'p1',
        orderId: null,
        type: 'Late',
        amount: '50000',
        reason: 'Terlambat',
        status: 'Pending',
        imposedAt: '2026-07-15',
        resolvedAt: null,
        notes: null,
      },
    ]);
    render(<PartnerPenalties />);
    // Terlambat appears as both type label and reason text
    const terlambatElements = await screen.findAllByText('Terlambat');
    expect(terlambatElements).toHaveLength(2);
    // The dash appears once in the Selesai column (resolvedAt=null → '-')
    expect(screen.getByText('-')).toBeInTheDocument();
  });

  // ─── CSV Export Tests ───────────────────────────────────────────

  describe('CSV export', () => {
    beforeEach(() => {
      mockGet.mockResolvedValue([
        {
          id: 'pen1',
          orderId: null,
          type: 'Late',
          amount: '50000',
          reason: 'Terlambat 2 jam',
          status: 'Pending',
          imposedAt: '2026-07-15',
          resolvedAt: null,
          notes: null,
        },
      ]);
    });

    it('renders Export CSV button when data loaded', async () => {
      render(<PartnerPenalties />);
      expect(await screen.findByText('Export CSV')).toBeInTheDocument();
    });

    it('does not render Export CSV button when no penalties', async () => {
      mockGet.mockReset();
      mockGet.mockResolvedValue([]);
      render(<PartnerPenalties />);
      expect(await screen.findByText('Belum ada penalty')).toBeInTheDocument();
      expect(screen.queryByText('Export CSV')).not.toBeInTheDocument();
    });

    it('calls downloadCSV with correct data on click', async () => {
      const user = userEvent.setup();
      render(<PartnerPenalties />);
      expect(await screen.findByText('Export CSV')).toBeInTheDocument();

      await user.click(screen.getByText('Export CSV'));

      expect(mockDownloadCSV).toHaveBeenCalledTimes(1);
      expect(mockDownloadCSV).toHaveBeenCalledWith(
        ['Tipe', 'Jumlah', 'Alasan', 'Status', 'Tanggal', 'Selesai'],
        [['Terlambat', 'Rp50.000', 'Terlambat 2 jam', 'Menunggu', '2026-07-15', '-']],
        'penalty-partner-export.csv',
      );
    });
  });
});
