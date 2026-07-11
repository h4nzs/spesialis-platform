import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { AdminCustomers } from './AdminCustomers';

const { mockGet, mockPatch, mockDownloadCSV } = vi.hoisted(() => ({
  mockGet: vi.fn(),
  mockPatch: vi.fn(),
  mockDownloadCSV: vi.fn(),
}));

vi.mock('@ahlipanggilan/shared', () => ({
  createBrowserClient: () => ({ get: mockGet, patch: mockPatch }),
  downloadCSV: mockDownloadCSV,
}));

beforeEach(() => {
  vi.clearAllMocks();
});

describe('AdminCustomers', () => {
  it('shows loading state initially', () => {
    mockGet.mockImplementation(() => new Promise(() => {}));
    render(<AdminCustomers />);
    // Loading state renders skeleton shimmer (aria-hidden, no visible text)
    expect(screen.queryByText('Export CSV')).not.toBeInTheDocument();
  });

  it('shows customer table when loaded', async () => {
    mockGet.mockResolvedValue([
      {
        id: 'c1',
        email: 'user@test.com',
        phone: '08123456789',
        fullName: 'John Doe',
        status: 'active',
        createdAt: '2026-01-01',
      },
    ]);
    render(<AdminCustomers />);
    expect(await screen.findByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('user@test.com')).toBeInTheDocument();
    expect(screen.getByText('08123456789')).toBeInTheDocument();
    expect(screen.getByText('active')).toBeInTheDocument();
  });

  it('shows suspend button for active customer', async () => {
    mockGet.mockResolvedValue([
      {
        id: 'c1',
        email: 'a@b.com',
        phone: '081',
        fullName: 'A',
        status: 'active',
        createdAt: '2026-01-01',
      },
    ]);
    render(<AdminCustomers />);
    expect(await screen.findByText('Suspends')).toBeInTheDocument();
  });

  it('shows activate button for suspended customer', async () => {
    mockGet.mockResolvedValue([
      {
        id: 'c2',
        email: 'b@b.com',
        phone: '082',
        fullName: 'B',
        status: 'suspended',
        createdAt: '2026-01-01',
      },
    ]);
    render(<AdminCustomers />);
    expect(await screen.findByText('Aktifkan')).toBeInTheDocument();
  });

  it('shows blocked customer without action buttons', async () => {
    mockGet.mockResolvedValue([
      {
        id: 'c3',
        email: 'c@b.com',
        phone: '083',
        fullName: 'C',
        status: 'blocked',
        createdAt: '2026-01-01',
      },
    ]);
    render(<AdminCustomers />);
    expect(await screen.findByText('C')).toBeInTheDocument();
    expect(screen.queryByText('Suspends')).not.toBeInTheDocument();
    expect(screen.queryByText('Aktifkan')).not.toBeInTheDocument();
    expect(screen.queryByText('Blokir')).not.toBeInTheDocument();
  });

  it('shows empty state when no customers', async () => {
    mockGet.mockResolvedValue([]);
    render(<AdminCustomers />);
    expect(await screen.findByText('Belum ada customer')).toBeInTheDocument();
  });

  it('shows empty state on API error', async () => {
    mockGet.mockRejectedValue(new Error('Gagal'));
    render(<AdminCustomers />);
    expect(await screen.findByText('Belum ada customer')).toBeInTheDocument();
  });

  it('calls patch API when Suspends is clicked', async () => {
    mockGet.mockResolvedValue([
      {
        id: 'c1',
        email: 'a@b.com',
        phone: '081',
        fullName: 'A',
        status: 'active',
        createdAt: '2026-01-01',
      },
    ]);
    mockPatch.mockResolvedValue(undefined);
    render(<AdminCustomers />);
    expect(await screen.findByText('Suspends')).toBeInTheDocument();
    screen.getByText('Suspends').click();
    await waitFor(() => {
      expect(mockPatch).toHaveBeenCalledWith('/api/v1/customers/c1/status', {
        body: { status: 'suspended' },
      });
    });
  });

  it('calls patch API when Aktifkan is clicked', async () => {
    mockGet.mockResolvedValue([
      {
        id: 'c2',
        email: 'b@b.com',
        phone: '082',
        fullName: 'B',
        status: 'suspended',
        createdAt: '2026-01-01',
      },
    ]);
    mockPatch.mockResolvedValue(undefined);
    render(<AdminCustomers />);
    expect(await screen.findByText('Aktifkan')).toBeInTheDocument();
    screen.getByText('Aktifkan').click();
    await waitFor(() => {
      expect(mockPatch).toHaveBeenCalledWith('/api/v1/customers/c2/status', {
        body: { status: 'active' },
      });
    });
  });

  it('calls patch API when Blokir is clicked (active customer)', async () => {
    mockGet.mockResolvedValue([
      {
        id: 'c3',
        email: 'c@c.com',
        phone: '083',
        fullName: 'C',
        status: 'active',
        createdAt: '2026-01-01',
      },
    ]);
    mockPatch.mockResolvedValue(undefined);
    render(<AdminCustomers />);
    expect(await screen.findByText('Blokir')).toBeInTheDocument();
    screen.getByText('Blokir').click();
    await waitFor(() => {
      expect(mockPatch).toHaveBeenCalledWith('/api/v1/customers/c3/status', {
        body: { status: 'blocked' },
      });
    });
  });

  // ─── CSV Export Tests ───────────────────────────────────────────

  describe('CSV export', () => {
    beforeEach(() => {
      mockGet.mockResolvedValue([
        {
          id: 'c1',
          email: 'user@test.com',
          phone: '08123456789',
          fullName: 'John Doe',
          status: 'active',
          createdAt: '2026-01-01',
        },
      ]);
    });

    it('renders Export CSV button when data loaded', async () => {
      render(<AdminCustomers />);
      expect(await screen.findByText('Export CSV')).toBeInTheDocument();
    });

    it('does not render Export CSV button when no customers', async () => {
      mockGet.mockReset();
      mockGet.mockResolvedValue([]);
      render(<AdminCustomers />);
      expect(await screen.findByText('Belum ada customer')).toBeInTheDocument();
      expect(screen.queryByText('Export CSV')).not.toBeInTheDocument();
    });

    it('calls downloadCSV with correct data on click', async () => {
      const user = userEvent.setup();
      render(<AdminCustomers />);
      expect(await screen.findByText('Export CSV')).toBeInTheDocument();

      await user.click(screen.getByText('Export CSV'));

      expect(mockDownloadCSV).toHaveBeenCalledTimes(1);
      expect(mockDownloadCSV).toHaveBeenCalledWith(
        ['Nama', 'Email', 'No. HP', 'Status', 'Dibuat'],
        [['John Doe', 'user@test.com', '08123456789', 'active', '2026-01-01']],
        'customer-export.csv',
      );
    });
  });
});
