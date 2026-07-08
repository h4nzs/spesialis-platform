import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { PartnerReviews } from './PartnerReviews';

const { mockGet, mockDownloadCSV } = vi.hoisted(() => ({
  mockGet: vi.fn(),
  mockDownloadCSV: vi.fn(),
}));

vi.mock('@specialist/shared', () => ({
  createBrowserClient: () => ({ get: mockGet }),
  formatDate: (d: string) => d,
  formatRating: (r: number) => `${r}/5`,
  downloadCSV: mockDownloadCSV,
}));

vi.mock('@specialist/ui', () => ({
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
}));

beforeEach(() => {
  vi.clearAllMocks();
});

describe('PartnerReviews', () => {
  it('shows loading state initially', () => {
    EmptyState: (({ title, children }: { title?: string; children?: React.ReactNode }) => (
      <div>{title ?? children}</div>
    ),
      mockGet.mockImplementation(() => new Promise(() => {})));
    render(<PartnerReviews />);
    expect(screen.getByText('Memuat...')).toBeInTheDocument();
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
