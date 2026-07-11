import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { PartnerReviews } from './PartnerReviews';

const { mockGet, mockDownloadCSV } = vi.hoisted(() => ({
  mockGet: vi.fn(),
  mockDownloadCSV: vi.fn(),
}));

vi.mock('@ahlipanggilan/shared', () => ({
  createBrowserClient: () => ({ get: mockGet }),
  formatDate: (d: string) => d,
  formatRating: (r: number) => `${r}/5`,
  downloadCSV: mockDownloadCSV,
  SCHEMA_TEMPLATES: [],
}));

vi.mock('@ahlipanggilan/ui', () => ({
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
        <div key={i} data-testid="review-row">
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
  Skeleton: () => <div aria-hidden="true" />,
  TableSkeleton: () => <div data-testid="table-skeleton" />,
  Card: ({ children, ..._props }: { children: React.ReactNode; [key: string]: unknown }) => (
    <div>{children}</div>
  ),
  Grid: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  Badge: ({ children, ..._props }: { children: React.ReactNode; [key: string]: unknown }) => (
    <span>{children}</span>
  ),
  Modal: ({
    children,
    open,
    onClose,
    title,
  }: {
    children: React.ReactNode;
    open: boolean;
    onClose?: () => void;
    title?: string;
  }) =>
    open ? (
      <div data-testid="modal">
        {title ? <h2>{title}</h2> : null}
        {children}
      </div>
    ) : null,
  CSVExportButton: ({ onClick }: { onClick?: () => void }) => (
    <button type="button" onClick={onClick}>
      Export CSV
    </button>
  ),
  Pagination: ({ ..._props }: { [key: string]: unknown }) => <div />,
  ConfirmDialog: ({ ..._props }: { [key: string]: unknown }) => null,
  Spinner: () => <div aria-hidden="true" />,
}));

beforeEach(() => {
  vi.clearAllMocks();
});

describe('PartnerReviews', () => {
  it('shows loading state initially', () => {
    mockGet.mockImplementation(() => new Promise(() => {}));
    render(<PartnerReviews />);
    // Loading state renders Skeleton components (aria-hidden, no visible text)
    // The data state elements should not be present
    expect(screen.queryByText('Export CSV')).not.toBeInTheDocument();
  });

  it('shows reviews when loaded', async () => {
    mockGet.mockResolvedValueOnce({ id: 'partner1' });
    mockGet.mockResolvedValueOnce([
      { id: 'r1', rating: 5, comment: 'Great service!', createdAt: '2026-07-15' },
    ]);
    render(<PartnerReviews />);
    expect(await screen.findByText('5/5')).toBeInTheDocument();
    expect(screen.getByText('Great service!')).toBeInTheDocument();
  });

  it('shows empty state', async () => {
    mockGet.mockResolvedValueOnce({ id: 'partner1' });
    mockGet.mockResolvedValueOnce([]);
    render(<PartnerReviews />);
    expect(await screen.findByText('Belum ada ulasan')).toBeInTheDocument();
  });

  it('handles API error', async () => {
    mockGet.mockRejectedValue(new Error('Gagal'));
    render(<PartnerReviews />);
    expect(await screen.findByText('Belum ada ulasan')).toBeInTheDocument();
  });

  // ─── CSV Export Tests ───────────────────────────────────────────

  describe('CSV export', () => {
    beforeEach(() => {
      mockGet.mockResolvedValueOnce({ id: 'partner1' });
      mockGet.mockResolvedValueOnce([
        { id: 'r1', rating: 5, comment: 'Great service!', createdAt: '2026-07-15' },
      ]);
    });

    it('renders Export CSV button when data loaded', async () => {
      render(<PartnerReviews />);
      expect(await screen.findByText('Export CSV')).toBeInTheDocument();
    });

    it('does not render Export CSV button when no reviews', async () => {
      mockGet.mockReset();
      mockGet.mockResolvedValueOnce({ id: 'partner1' });
      mockGet.mockResolvedValueOnce([]);
      render(<PartnerReviews />);
      expect(await screen.findByText('Belum ada ulasan')).toBeInTheDocument();
      expect(screen.queryByText('Export CSV')).not.toBeInTheDocument();
    });

    it('calls downloadCSV with correct data on click', async () => {
      const user = userEvent.setup();
      render(<PartnerReviews />);
      expect(await screen.findByText('Export CSV')).toBeInTheDocument();

      await user.click(screen.getByText('Export CSV'));

      expect(mockDownloadCSV).toHaveBeenCalledTimes(1);
      expect(mockDownloadCSV).toHaveBeenCalledWith(
        ['Rating', 'Komentar', 'Tanggal'],
        [['5', 'Great service!', '2026-07-15']],
        'ulasan-partner-export.csv',
      );
    });
  });
});
