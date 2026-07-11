import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { CustomerComplaints } from './CustomerComplaints';

const mockGet = vi.fn();

vi.mock('@ahlipanggilan/shared', () => ({
  createBrowserClient: () => ({ get: mockGet }),
  formatDate: (d: string) => d,
  SCHEMA_TEMPLATES: [],
}));

vi.mock('@ahlipanggilan/ui', () => ({
  Card: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  Badge: ({ children, variant: _variant }: { children: React.ReactNode; variant?: string }) => (
    <span>{children}</span>
  ),
  EmptyState: ({ title, children }: { title?: string; children?: React.ReactNode }) => (
    <div>{title ?? children}</div>
  ),
  TableSkeleton: () => <div data-testid="table-skeleton" />,
  Grid: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
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

describe('CustomerComplaints', () => {
  it('shows loading state initially', () => {
    mockGet.mockImplementation(() => new Promise(() => {}));
    render(<CustomerComplaints />);
    // Loading state renders skeleton shimmer (aria-hidden, no visible text)
    expect(screen.queryByText('Buat Komplain')).not.toBeInTheDocument();
  });

  it('shows complaints list when loaded', async () => {
    mockGet.mockResolvedValue([
      {
        id: 'c1',
        title: 'Broken item',
        description: 'Item arrived broken',
        status: 'Open',
        resolution: null,
        createdAt: '2026-07-15',
      },
    ]);
    render(<CustomerComplaints />);
    expect(await screen.findByText('Broken item')).toBeInTheDocument();
    expect(screen.getByText('Item arrived broken')).toBeInTheDocument();
    expect(screen.getByText('Open')).toBeInTheDocument();
  });

  it('shows resolution when available', async () => {
    mockGet.mockResolvedValue([
      {
        id: 'c2',
        title: 'Late arrival',
        description: 'Came 2 hours late',
        status: 'Resolved',
        resolution: 'Apologized',
        createdAt: '2026-07-10',
      },
    ]);
    render(<CustomerComplaints />);
    expect(await screen.findByText(/Resolusi: Apologized/)).toBeInTheDocument();
  });

  it('shows empty state', async () => {
    mockGet.mockResolvedValue([]);
    render(<CustomerComplaints />);
    expect(await screen.findByText('Belum ada komplain')).toBeInTheDocument();
  });

  it('handles API error', async () => {
    mockGet.mockRejectedValue(new Error('Gagal'));
    render(<CustomerComplaints />);
    expect(await screen.findByText('Belum ada komplain')).toBeInTheDocument();
  });

  it('shows Buat Komplain link', async () => {
    mockGet.mockResolvedValue([]);
    render(<CustomerComplaints />);
    expect(await screen.findByText('Buat Komplain')).toBeInTheDocument();
    expect(screen.getByText('Buat Komplain').closest('a')).toHaveAttribute(
      'href',
      '/dashboard/customer/complaints/new',
    );
  });
});
