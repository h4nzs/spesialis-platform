import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { AdminPenalties } from './AdminPenalties';

const { mockGet, mockPost, mockPatch, mockDownloadCSV } = vi.hoisted(() => ({
  mockGet: vi.fn(),
  mockPost: vi.fn(),
  mockPatch: vi.fn(),
  mockDownloadCSV: vi.fn(),
}));

vi.mock('@ahlipanggilan/shared', () => ({
  createBrowserClient: () => ({ get: mockGet, post: mockPost, patch: mockPatch }),
  formatCurrency: (n: number | string) => {
    const num = typeof n === 'string' ? Number(n) : n;
    return `Rp${num.toLocaleString('id-ID')}`;
  },
  downloadCSV: mockDownloadCSV,
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
  Button: ({
    children,
    onClick,
    type,
    disabled,
    variant: _variant,
    size: _size,
  }: {
    children: React.ReactNode;
    onClick?: () => void;
    type?: 'button' | 'submit';
    disabled?: boolean;
    variant?: string;
    size?: string;
  }) => (
    <button onClick={onClick} type={type ?? 'button'} disabled={disabled}>
      {children}
    </button>
  ),
  Modal: ({
    open,
    title,
    children,
  }: {
    open: boolean;
    title?: string;
    children: React.ReactNode;
  }) =>
    open ? (
      <div data-testid="modal">
        <h2>{title}</h2>
        {children}
      </div>
    ) : null,
  Input: (props: {
    label?: string;
    value?: string;
    onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
    placeholder?: string;
    type?: string;
  }) => (
    <div>
      {props.label && <label>{props.label}</label>}
      <input
        value={props.value}
        onChange={props.onChange}
        placeholder={props.placeholder}
        type={props.type ?? 'text'}
      />
    </div>
  ),
  Select: ({
    label,
    value,
    onChange,
    options,
  }: {
    label?: string;
    value?: string;
    onChange?: (e: React.ChangeEvent<HTMLSelectElement>) => void;
    options: { value: string; label: string }[];
  }) => (
    <div>
      {label && <label>{label}</label>}
      <select value={value} onChange={onChange}>
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </div>
  ),
  Textarea: (props: {
    label?: string;
    value?: string;
    onChange?: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
    placeholder?: string;
  }) => (
    <div>
      {props.label && <label>{props.label}</label>}
      <textarea value={props.value} onChange={props.onChange} placeholder={props.placeholder} />
    </div>
  ),
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

describe('AdminPenalties', () => {
  it('shows loading state initially', () => {
    mockGet.mockImplementation(() => new Promise(() => {}));
    render(<AdminPenalties />);
    // Loading state renders skeleton shimmer (aria-hidden, no visible text)
    expect(screen.queryByText('Tambah Penalty')).not.toBeInTheDocument();
  });

  it('shows penalty table when loaded', async () => {
    mockGet.mockResolvedValue([
      {
        id: 'pen1',
        partnerId: 'p1',
        partnerName: 'Partner A',
        orderId: null,
        bookingNumber: null,
        type: 'Late',
        amount: '50000',
        reason: 'Terlambat 2 jam',
        status: 'Pending',
        imposedAt: '2026-07-15T10:00:00Z',
        paidAt: null,
        resolvedAt: null,
        notes: null,
      },
    ]);
    render(<AdminPenalties />);
    expect(await screen.findByText('Partner A')).toBeInTheDocument();
    expect(screen.getByText('Terlambat')).toBeInTheDocument();
    expect(screen.getByText('Menunggu')).toBeInTheDocument();
    expect(screen.getByText('Terapkan')).toBeInTheDocument();
    expect(screen.getByText('Hapuskan')).toBeInTheDocument();
  });

  it('shows Tambah Penalty button', async () => {
    mockGet.mockResolvedValue([]);
    render(<AdminPenalties />);
    expect(await screen.findByText('Tambah Penalty')).toBeInTheDocument();
  });

  it('opens impose modal on button click', async () => {
    mockGet.mockResolvedValue([]);
    render(<AdminPenalties />);
    expect(await screen.findByText('Tambah Penalty')).toBeInTheDocument();

    screen.getByText('Tambah Penalty').click();

    await waitFor(() => {
      expect(screen.getByTestId('modal')).toBeInTheDocument();
    });
    // Modal title and page button both contain "Tambah Penalty" — skip redundant text check
  });

  it('shows empty state when no penalties', async () => {
    mockGet.mockResolvedValue([]);
    render(<AdminPenalties />);
    expect(await screen.findByText('Belum ada penalty')).toBeInTheDocument();
  });

  it('shows empty state on API error', async () => {
    mockGet.mockRejectedValue(new Error('Gagal'));
    render(<AdminPenalties />);
    expect(await screen.findByText('Belum ada penalty')).toBeInTheDocument();
  });

  it('shows Terapkan and Hapuskan for Disputed penalties', async () => {
    mockGet.mockResolvedValue([
      {
        id: 'pen2',
        partnerId: 'p2',
        partnerName: 'Partner B',
        orderId: null,
        bookingNumber: null,
        type: 'Complaint',
        amount: '100000',
        reason: 'Komplain customer',
        status: 'Disputed',
        imposedAt: '2026-07-15T10:00:00Z',
        paidAt: null,
        resolvedAt: null,
        notes: null,
      },
    ]);
    render(<AdminPenalties />);
    expect(await screen.findByText('Partner B')).toBeInTheDocument();
    expect(screen.getByText('Terapkan')).toBeInTheDocument();
    expect(screen.getByText('Hapuskan')).toBeInTheDocument();
  });

  it('shows status update modal when Terapkan is clicked', async () => {
    mockGet.mockResolvedValue([
      {
        id: 'pen1',
        partnerId: 'p1',
        partnerName: 'Partner A',
        orderId: null,
        bookingNumber: null,
        type: 'Late',
        amount: '50000',
        reason: 'Terlambat',
        status: 'Pending',
        imposedAt: '2026-07-15T10:00:00Z',
        paidAt: null,
        resolvedAt: null,
        notes: null,
      },
    ]);
    render(<AdminPenalties />);
    expect(await screen.findByText('Terapkan')).toBeInTheDocument();

    screen.getByText('Terapkan').click();

    await waitFor(() => {
      expect(screen.getByText('Terapkan Penalty')).toBeInTheDocument();
    });
    expect(screen.getByText('Konfirmasi')).toBeInTheDocument();
  });

  // --- Search Dropdown Interaction Tests ---

  async function openImposeModal() {
    render(<AdminPenalties />);
    expect(await screen.findByText('Tambah Penalty')).toBeInTheDocument();
    screen.getByText('Tambah Penalty').click();
    await waitFor(() => {
      expect(screen.getByTestId('modal')).toBeInTheDocument();
    });
  }

  describe('partner search dropdown', () => {
    it('shows partner search input in impose modal', async () => {
      mockGet.mockResolvedValue([]);
      await openImposeModal();
      expect(screen.getByPlaceholderText('Cari nama partner...')).toBeInTheDocument();
    });

    it('shows search results after typing', async () => {
      mockGet.mockImplementation((url: string) => {
        if (url.includes('/api/v1/partners')) {
          return Promise.resolve({
            data: [{ id: 'p1', fullName: 'Partner Satu' }],
          });
        }
        return Promise.resolve([]);
      });

      await openImposeModal();

      fireEvent.change(screen.getByPlaceholderText('Cari nama partner...'), {
        target: { value: 'Partner' },
      });

      await waitFor(() => {
        expect(screen.getByText('Partner Satu')).toBeInTheDocument();
      });
    });

    it('shows loading indicator while searching', async () => {
      let resolveSearch: (v: unknown) => void;
      const searchPromise = new Promise((resolve) => {
        resolveSearch = resolve;
      });

      mockGet.mockImplementation((url: string) => {
        if (url.includes('/api/v1/partners')) {
          return searchPromise;
        }
        return Promise.resolve([]);
      });

      await openImposeModal();

      fireEvent.change(screen.getByPlaceholderText('Cari nama partner...'), {
        target: { value: 'Partner' },
      });

      await waitFor(() => {
        expect(screen.getByText('Mencari...')).toBeInTheDocument();
      });

      resolveSearch!(Promise.resolve({ data: [] }));
    });

    it('shows not found message when search has no results', async () => {
      mockGet.mockImplementation((url: string) => {
        if (url.includes('/api/v1/partners')) {
          return Promise.resolve({ data: [] });
        }
        return Promise.resolve([]);
      });

      await openImposeModal();

      fireEvent.change(screen.getByPlaceholderText('Cari nama partner...'), {
        target: { value: 'Unknown' },
      });

      await waitFor(() => {
        expect(screen.getByText('Partner tidak ditemukan')).toBeInTheDocument();
      });
    });

    it('selects partner and shows selected state with Ganti button', async () => {
      mockGet.mockImplementation((url: string) => {
        if (url.includes('/api/v1/partners')) {
          return Promise.resolve({
            data: [{ id: 'p1', fullName: 'Partner Satu' }],
          });
        }
        return Promise.resolve([]);
      });

      await openImposeModal();

      fireEvent.change(screen.getByPlaceholderText('Cari nama partner...'), {
        target: { value: 'Partner' },
      });

      await waitFor(() => {
        expect(screen.getByText('Partner Satu')).toBeInTheDocument();
      });

      screen.getByText('Partner Satu').click();

      await waitFor(() => {
        expect(screen.getByText('Ganti')).toBeInTheDocument();
      });
      expect(screen.queryByPlaceholderText('Cari nama partner...')).not.toBeInTheDocument();
    });

    it('Ganti button clears partner and shows search input again', async () => {
      mockGet.mockImplementation((url: string) => {
        if (url.includes('/api/v1/partners')) {
          return Promise.resolve({
            data: [{ id: 'p1', fullName: 'Partner Satu' }],
          });
        }
        return Promise.resolve([]);
      });

      await openImposeModal();

      // Search and select partner
      fireEvent.change(screen.getByPlaceholderText('Cari nama partner...'), {
        target: { value: 'Partner' },
      });
      await waitFor(() => {
        expect(screen.getByText('Partner Satu')).toBeInTheDocument();
      });
      screen.getByText('Partner Satu').click();

      await waitFor(() => {
        expect(screen.getByText('Ganti')).toBeInTheDocument();
      });

      // Click Ganti
      screen.getByText('Ganti').click();

      await waitFor(() => {
        expect(screen.getByPlaceholderText('Cari nama partner...')).toBeInTheDocument();
      });
    });
  });

  describe('order search dropdown', () => {
    it('shows order search input in impose modal', async () => {
      mockGet.mockResolvedValue([]);
      await openImposeModal();
      expect(screen.getByPlaceholderText('Cari nomor booking...')).toBeInTheDocument();
    });

    it('shows search results after typing', async () => {
      mockGet.mockImplementation((url: string) => {
        if (url.includes('/api/v1/bookings')) {
          return Promise.resolve({
            data: [{ id: 'o1', bookingNumber: 'BK-001', status: 'Active' }],
          });
        }
        return Promise.resolve([]);
      });

      await openImposeModal();

      fireEvent.change(screen.getByPlaceholderText('Cari nomor booking...'), {
        target: { value: 'BK' },
      });

      await waitFor(() => {
        expect(screen.getByText('BK-001')).toBeInTheDocument();
      });
    });

    it('shows not found message when search has no results', async () => {
      mockGet.mockImplementation((url: string) => {
        if (url.includes('/api/v1/bookings')) {
          return Promise.resolve({ data: [] });
        }
        return Promise.resolve([]);
      });

      await openImposeModal();

      fireEvent.change(screen.getByPlaceholderText('Cari nomor booking...'), {
        target: { value: 'XYZ' },
      });

      await waitFor(() => {
        expect(screen.getByText('Order tidak ditemukan')).toBeInTheDocument();
      });
    });

    it('selects order and shows selected state with Ganti button', async () => {
      mockGet.mockImplementation((url: string) => {
        if (url.includes('/api/v1/bookings')) {
          return Promise.resolve({
            data: [{ id: 'o1', bookingNumber: 'BK-001', status: 'Active' }],
          });
        }
        return Promise.resolve([]);
      });

      await openImposeModal();

      // Search and select order
      fireEvent.change(screen.getByPlaceholderText('Cari nomor booking...'), {
        target: { value: 'BK' },
      });
      await waitFor(() => {
        expect(screen.getByText('BK-001')).toBeInTheDocument();
      });
      screen.getByText('BK-001').click();

      await waitFor(() => {
        // After selection, orderSearch shows "BK-001 — Active"
        expect(screen.getByText(/BK-001.*Active/)).toBeInTheDocument();
        expect(screen.getByText('Ganti')).toBeInTheDocument();
      });
    });

    it('Ganti button clears order and shows search input again', async () => {
      mockGet.mockImplementation((url: string) => {
        if (url.includes('/api/v1/bookings')) {
          return Promise.resolve({
            data: [{ id: 'o1', bookingNumber: 'BK-001', status: 'Active' }],
          });
        }
        return Promise.resolve([]);
      });

      await openImposeModal();

      // Search and select order
      fireEvent.change(screen.getByPlaceholderText('Cari nomor booking...'), {
        target: { value: 'BK' },
      });
      await waitFor(() => {
        expect(screen.getByText('BK-001')).toBeInTheDocument();
      });
      screen.getByText('BK-001').click();

      await waitFor(() => {
        expect(screen.getByText(/BK-001.*Active/)).toBeInTheDocument();
        expect(screen.getByText('Ganti')).toBeInTheDocument();
      });

      // Click Ganti
      screen.getByText('Ganti').click();

      await waitFor(() => {
        expect(screen.getByPlaceholderText('Cari nomor booking...')).toBeInTheDocument();
      });
    });
  });

  // ─── CSV Export Tests ───────────────────────────────────────────

  describe('CSV export', () => {
    beforeEach(() => {
      mockGet.mockResolvedValue([
        {
          id: 'pen1',
          partnerId: 'p1',
          partnerName: 'Partner A',
          orderId: null,
          bookingNumber: null,
          type: 'Late',
          amount: '50000',
          reason: 'Terlambat 2 jam',
          status: 'Pending',
          imposedAt: '2026-07-15T10:00:00Z',
          paidAt: null,
          resolvedAt: null,
          notes: null,
        },
      ]);
    });

    it('renders Export CSV button when data loaded', async () => {
      render(<AdminPenalties />);
      expect(await screen.findByText('Export CSV')).toBeInTheDocument();
    });

    it('does not render Export CSV button when no penalties', async () => {
      mockGet.mockReset();
      mockGet.mockResolvedValue([]);
      render(<AdminPenalties />);
      expect(await screen.findByText('Belum ada penalty')).toBeInTheDocument();
      expect(screen.queryByText('Export CSV')).not.toBeInTheDocument();
    });

    it('calls downloadCSV with correct data on click', async () => {
      const user = userEvent.setup();
      render(<AdminPenalties />);
      expect(await screen.findByText('Export CSV')).toBeInTheDocument();

      await user.click(screen.getByText('Export CSV'));

      expect(mockDownloadCSV).toHaveBeenCalledTimes(1);
      expect(mockDownloadCSV).toHaveBeenCalledWith(
        ['Partner', 'Booking', 'Tipe', 'Jumlah', 'Alasan', 'Status', 'Tanggal'],
        [['Partner A', '-', 'Terlambat', 'Rp50.000', 'Terlambat 2 jam', 'Menunggu', '15 Jul 2026']],
        'penalty-export.csv',
      );
    });
  });
});
