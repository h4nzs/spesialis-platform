import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { PartnerReviews } from './PartnerReviews';

const mockGet = vi.fn();

vi.mock('@specialist/shared', () => ({
  createBrowserClient: () => ({ get: mockGet }),
  formatDate: (d: string) => d,
  formatRating: (r: number) => `${r}/5`,
}));

vi.mock('@specialist/ui', () => ({
  Table: ({
    data,
    emptyMessage,
    columns,
  }: {
    data: unknown[];
    emptyMessage: string;
    columns: { key: string; header: string; render?: (item: unknown) => React.ReactNode }[];
  }) => (
    <div>
      {data.length === 0 && <p>{emptyMessage}</p>}
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
}));

beforeEach(() => {
  vi.clearAllMocks();
});

describe('PartnerReviews', () => {
  it('shows loading state initially', () => {
    mockGet.mockImplementation(() => new Promise(() => {}));
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
});
