import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { CustomerComplaints } from './CustomerComplaints';

const mockGet = vi.fn();

vi.mock('@specialist/shared', () => ({
  createBrowserClient: () => ({ get: mockGet }),
  formatDate: (d: string) => d,
}));

vi.mock('@specialist/ui', () => ({
  Card: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  Badge: ({ children, variant: _variant }: { children: React.ReactNode; variant?: string }) => (
    <span>{children}</span>
  ),
  EmptyState: ({ title, children }: { title?: string; children?: React.ReactNode }) => (
    <div>{title ?? children}</div>
  ),
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
