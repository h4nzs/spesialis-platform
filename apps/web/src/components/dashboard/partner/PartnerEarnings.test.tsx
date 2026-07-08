import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { PartnerEarnings } from './PartnerEarnings';

const mockGet = vi.fn();

vi.mock('@specialist/shared', () => ({
  createBrowserClient: () => ({ get: mockGet }),
  formatDate: (d: string) => d,
  getStatusLabel: (s: string) => s,
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
        <div key={i} data-testid="job-row">
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

describe('PartnerEarnings', () => {
  it('shows loading state initially', () => {
    mockGet.mockImplementation(() => new Promise(() => {}));
    render(<PartnerEarnings />);
    // Loading state renders Skeleton components (aria-hidden, no visible text)
    // Data elements should not be present during loading
    expect(screen.queryByText('Pekerjaan Selesai')).not.toBeInTheDocument();
  });

  it('shows stats cards when loaded', async () => {
    mockGet.mockResolvedValueOnce({ completedJobs: 30, ratingAverage: '4.2' });
    mockGet.mockResolvedValueOnce([
      {
        id: 'j1',
        orderId: 'o1',
        status: 'Completed',
        assignedAt: '2026-07-01',
        completedAt: '2026-07-02',
        orderStatus: 'Completed',
        bookingNumber: 'SP-0001',
      },
    ]);
    render(<PartnerEarnings />);
    expect(await screen.findByText('30')).toBeInTheDocument();
    expect(screen.getByText('4.2')).toBeInTheDocument();
    expect(screen.getByText('1')).toBeInTheDocument();
  });

  it('shows completed jobs table', async () => {
    mockGet.mockResolvedValueOnce({ completedJobs: 30, ratingAverage: '4.2' });
    mockGet.mockResolvedValueOnce([
      {
        id: 'j1',
        orderId: 'o1',
        status: 'Completed',
        assignedAt: '2026-07-01',
        completedAt: '2026-07-02',
        orderStatus: 'Completed',
        bookingNumber: 'SP-0001',
      },
      {
        id: 'j2',
        orderId: 'o2',
        status: 'Completed',
        assignedAt: '2026-07-05',
        completedAt: '2026-07-06',
        orderStatus: 'Paid',
        bookingNumber: 'SP-0002',
      },
    ]);
    render(<PartnerEarnings />);
    expect(await screen.findByText('Riwayat Pekerjaan')).toBeInTheDocument();
    expect(screen.getByText('SP-0001')).toBeInTheDocument();
    expect(screen.getByText('SP-0002')).toBeInTheDocument();
  });

  it('shows dash when rating is null', async () => {
    mockGet.mockResolvedValueOnce({ completedJobs: 5, ratingAverage: null });
    mockGet.mockResolvedValueOnce([]);
    render(<PartnerEarnings />);
    expect(await screen.findByText('-')).toBeInTheDocument();
  });

  it('shows empty state', async () => {
    mockGet.mockResolvedValueOnce({ completedJobs: 5, ratingAverage: null });
    mockGet.mockResolvedValueOnce([]);
    render(<PartnerEarnings />);
    expect(await screen.findByText('Pekerjaan Selesai')).toBeInTheDocument();
  });
});
