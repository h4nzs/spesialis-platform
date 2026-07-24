import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { AdminBookings } from './AdminBookings';
import { userEvent } from '@testing-library/user-event';

const { mockGet, mockPost, mockDownloadCSV, mockDownloadBlob, mockGetAccessToken } = vi.hoisted(
  () => ({
    mockGet: vi.fn(),
    mockPost: vi.fn(),
    mockDownloadCSV: vi.fn(),
    mockDownloadBlob: vi.fn(),
    mockGetAccessToken: vi.fn(() => 'mock-token'),
  }),
);

vi.mock('@ahlipanggilan/shared', () => ({
  createBrowserClient: () => ({
    get: mockGet,
    post: mockPost,
    getTokenStore: () => ({ getAccessToken: mockGetAccessToken }),
  }),
  formatCurrency: (n: number) => `Rp${n.toLocaleString('id-ID')}`,
  formatDate: (d: string) => d,
  getStatusLabel: (s: string) => s,
  getStatusColor: () => 'default' as const,
  downloadCSV: mockDownloadCSV,
  downloadBlob: mockDownloadBlob,
  SCHEMA_TEMPLATES: [],
}));

vi.mock('@ahlipanggilan/ui', () => ({
  Modal: ({
    children,
    open,
    title,
    footer,
  }: {
    children: React.ReactNode;
    open: boolean;
    title: string;
    footer?: React.ReactNode;
  }) =>
    open ? (
      <div data-testid="modal">
        <h2>{title}</h2>
        {children}
        {footer && <div data-testid="modal-footer">{footer}</div>}
      </div>
    ) : null,
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
        <div key={i} data-testid="booking-row">
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
  Pagination: () => <div data-testid="pagination" />,
  Input: ({
    label,
    value,
    onChange,
    placeholder,
    type,
    required,
  }: {
    label?: string;
    value?: string;
    onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
    placeholder?: string;
    type?: string;
    required?: boolean;
  }) => (
    <div>
      {label && <label>{label}</label>}
      <input
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        type={type ?? 'text'}
        required={required}
        data-testid={`input-${label ?? ''}`}
      />
    </div>
  ),
  Textarea: ({
    label,
    value,
    onChange,
    placeholder,
    required,
  }: {
    label?: string;
    value?: string;
    onChange?: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
    placeholder?: string;
    required?: boolean;
  }) => (
    <div>
      {label && <label>{label}</label>}
      <textarea
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        data-testid={`textarea-${label ?? ''}`}
      />
    </div>
  ),
  Badge: ({ children, variant: _variant }: { children: React.ReactNode; variant?: string }) => (
    <span>{children}</span>
  ),
  EmptyState: ({ title, children }: { title?: string; children?: React.ReactNode }) => (
    <div>{title ?? children}</div>
  ),
  TableSkeleton: () => <div data-testid="table-skeleton" />,
  Card: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  Grid: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  CSVExportButton: ({
    onClick,
    loading,
    loadingLabel,
    disabled,
  }: {
    onClick?: () => void;
    loading?: boolean;
    loadingLabel?: string;
    disabled?: boolean;
  }) => (
    <button type="button" onClick={onClick} disabled={disabled || loading}>
      {loading ? (loadingLabel ?? 'Loading...') : 'Export CSV'}
    </button>
  ),
  ConfirmDialog: () => null,
  Spinner: () => <div aria-hidden="true" />,
}));

beforeEach(() => {
  vi.clearAllMocks();
});

describe('AdminBookings', () => {
  it('shows loading state initially', () => {
    mockGet.mockImplementation(() => new Promise(() => {}));
    render(<AdminBookings />);
    // Loading state renders skeleton shimmer (aria-hidden, no visible text)
    expect(screen.queryByText('Belum ada booking')).not.toBeInTheDocument();
  });

  it('shows booking table when loaded', async () => {
    mockGet.mockResolvedValue([
      {
        id: 'b1',
        bookingNumber: 'SP-2026-00001',
        status: 'Pending Confirmation',
        bookingDate: '2026-07-15',
        basePrice: '150000',
        finalPrice: null,
        createdAt: '2026-07-15T10:00:00Z',
      },
    ]);
    render(<AdminBookings />);
    expect(await screen.findByText('SP-2026-00001')).toBeInTheDocument();
    expect(screen.getByText('Pending Confirmation')).toBeInTheDocument();
    expect(screen.getByText('Konfirmasi')).toBeInTheDocument();
  });

  it('shows action buttons based on status (Pending Confirmation)', async () => {
    mockGet.mockResolvedValue([
      {
        id: 'b1',
        bookingNumber: 'SP-001',
        status: 'Pending Confirmation',
        bookingDate: '2026-07-15',
        basePrice: '150000',
        finalPrice: null,
        createdAt: '2026-07-15T10:00:00Z',
      },
    ]);
    render(<AdminBookings />);
    expect(await screen.findByText('Konfirmasi')).toBeInTheDocument();
    expect(screen.getByText('Batal')).toBeInTheDocument();
  });

  it('shows assign and cancel button for Waiting Assignment status', async () => {
    mockGet.mockResolvedValue([
      {
        id: 'b2',
        bookingNumber: 'SP-002',
        status: 'Waiting Assignment',
        bookingDate: '2026-07-15',
        basePrice: '150000',
        finalPrice: null,
        createdAt: '2026-07-15T10:00:00Z',
      },
    ]);
    render(<AdminBookings />);
    expect(await screen.findByText('Assign')).toBeInTheDocument();
    expect(screen.getByText('Batal')).toBeInTheDocument();
  });

  it('shows empty state when no bookings', async () => {
    mockGet.mockResolvedValue([]);
    render(<AdminBookings />);
    expect(await screen.findByText('Belum ada booking')).toBeInTheDocument();
  });

  it('shows empty state on API error', async () => {
    mockGet.mockRejectedValue(new Error('Gagal'));
    render(<AdminBookings />);
    expect(await screen.findByText('Belum ada booking')).toBeInTheDocument();
  });

  // --- Modal Interaction Tests ---

  it('opens confirm modal when Konfirmasi is clicked', async () => {
    mockGet.mockResolvedValue([
      {
        id: 'b1',
        bookingNumber: 'SP-001',
        status: 'Pending Confirmation',
        bookingDate: '2026-07-15',
        basePrice: '150000',
        finalPrice: null,
        createdAt: '2026-07-15T10:00:00Z',
      },
    ]);
    render(<AdminBookings />);
    expect(await screen.findByText('Konfirmasi')).toBeInTheDocument();
    screen.getByText('Konfirmasi').click();
    await waitFor(() => {
      expect(screen.getByTestId('modal')).toBeInTheDocument();
    });
    expect(screen.getByText('Konfirmasi Booking')).toBeInTheDocument();
    expect(screen.getByText('Harga Final')).toBeInTheDocument();
    expect(screen.getByText('Simpan')).toBeInTheDocument();
  });

  it('opens assign modal when Assign is clicked', async () => {
    mockGet.mockResolvedValue([
      {
        id: 'b2',
        bookingNumber: 'SP-002',
        status: 'Waiting Assignment',
        bookingDate: '2026-07-15',
        basePrice: '150000',
        finalPrice: null,
        createdAt: '2026-07-15T10:00:00Z',
      },
    ]);
    render(<AdminBookings />);
    expect(await screen.findByText('Assign')).toBeInTheDocument();
    screen.getByText('Assign').click();
    await waitFor(() => {
      expect(screen.getByTestId('modal')).toBeInTheDocument();
    });
    expect(screen.getByText('Assign Partner')).toBeInTheDocument();
    expect(screen.getByText('ID Partner')).toBeInTheDocument();
  });

  it('opens cancel modal when Batal is clicked', async () => {
    mockGet.mockResolvedValue([
      {
        id: 'b1',
        bookingNumber: 'SP-001',
        status: 'Pending Confirmation',
        bookingDate: '2026-07-15',
        basePrice: '150000',
        finalPrice: null,
        createdAt: '2026-07-15T10:00:00Z',
      },
    ]);
    render(<AdminBookings />);
    expect(await screen.findByText('Batal')).toBeInTheDocument();
    screen.getByText('Batal').click();
    await waitFor(() => {
      expect(screen.getByTestId('modal')).toBeInTheDocument();
    });
    expect(screen.getByText('Batalkan Booking')).toBeInTheDocument();
    expect(screen.getByText('Alasan Pembatalan')).toBeInTheDocument();
  });

  it('submits confirm with final price and calls post API', async () => {
    const user = userEvent.setup();
    mockGet.mockResolvedValue([
      {
        id: 'b1',
        bookingNumber: 'SP-001',
        status: 'Pending Confirmation',
        bookingDate: '2026-07-15',
        basePrice: '150000',
        finalPrice: null,
        createdAt: '2026-07-15T10:00:00Z',
      },
    ]);
    mockPost.mockResolvedValue(undefined);
    render(<AdminBookings />);
    expect(await screen.findByText('Konfirmasi')).toBeInTheDocument();
    await user.click(screen.getByText('Konfirmasi'));
    await waitFor(() => {
      expect(screen.getByTestId('modal')).toBeInTheDocument();
    });

    const priceInput = screen.getByTestId('input-Harga Final');
    await user.type(priceInput, '180000');

    await user.click(screen.getByText('Simpan'));

    await waitFor(() => {
      expect(mockPost).toHaveBeenCalledWith('/api/v1/bookings/b1/confirm', {
        body: { finalPrice: '180000', note: '' },
      });
    });
  });

  it('submits assign with partnerId and calls post API', async () => {
    const user = userEvent.setup();
    mockGet.mockResolvedValue([
      {
        id: 'b2',
        bookingNumber: 'SP-002',
        status: 'Waiting Assignment',
        bookingDate: '2026-07-15',
        basePrice: '150000',
        finalPrice: null,
        createdAt: '2026-07-15T10:00:00Z',
      },
    ]);
    mockPost.mockResolvedValue(undefined);
    render(<AdminBookings />);
    expect(await screen.findByText('Assign')).toBeInTheDocument();
    await user.click(screen.getByText('Assign'));
    await waitFor(() => {
      expect(screen.getByTestId('modal')).toBeInTheDocument();
    });

    const partnerInput = screen.getByTestId('input-ID Partner');
    await user.type(partnerInput, 'partner-123');

    await user.click(screen.getByText('Simpan'));

    await waitFor(() => {
      expect(mockPost).toHaveBeenCalledWith('/api/v1/bookings/b2/assign', {
        body: { partnerId: 'partner-123', note: '' },
      });
    });
  });

  it('submits cancel with reason and calls post API', async () => {
    const user = userEvent.setup();
    mockGet.mockResolvedValue([
      {
        id: 'b1',
        bookingNumber: 'SP-001',
        status: 'Pending Confirmation',
        bookingDate: '2026-07-15',
        basePrice: '150000',
        finalPrice: null,
        createdAt: '2026-07-15T10:00:00Z',
      },
    ]);
    mockPost.mockResolvedValue(undefined);
    render(<AdminBookings />);
    expect(await screen.findByText('Batal')).toBeInTheDocument();
    await user.click(screen.getByText('Batal'));
    await waitFor(() => {
      expect(screen.getByTestId('modal')).toBeInTheDocument();
    });

    const reasonInput = screen.getByTestId('textarea-Alasan Pembatalan');
    await user.type(reasonInput, 'Customer request');

    await user.click(screen.getByText('Simpan'));

    await waitFor(() => {
      expect(mockPost).toHaveBeenCalledWith('/api/v1/bookings/b1/cancel', {
        body: { reason: 'Customer request' },
      });
    });
  });

  // ─── CSV Export Tests ───────────────────────────────────────────

  describe('CSV export', () => {
    function mockFetchCSVResponse() {
      const fetchMock = vi.fn<typeof fetch>().mockResolvedValue({
        ok: true,
        headers: {
          get: (name: string) => (name === 'Content-Type' ? 'text/csv; charset=utf-8' : null),
          forEach: () => {},
        },
        blob: () => Promise.resolve(new Blob(['a,b,c'], { type: 'text/csv' })),
        json: () => Promise.resolve({}),
        text: () => Promise.resolve(''),
        status: 200,
        statusText: 'OK',
        redirected: false,
        type: 'basic' as const,
        url: '',
        clone: function () {
          return this as unknown as Response;
        },
        body: null,
        bodyUsed: false,
        bytes: () => Promise.resolve(new Uint8Array()),
        arrayBuffer: () => Promise.resolve(new ArrayBuffer(0)),
        formData: () => Promise.resolve(new FormData()),
      } as unknown as Response);
      vi.stubGlobal('fetch', fetchMock);
      return fetchMock;
    }

    function mockFetchNonCSVResponse() {
      const fetchMock = vi.fn<typeof fetch>().mockResolvedValue({
        ok: true,
        headers: {
          get: (name: string) =>
            name === 'Content-Type' ? 'application/json; charset=utf-8' : null,
          forEach: () => {},
        },
        blob: () => Promise.resolve(new Blob(['{}'], { type: 'application/json' })),
        json: () => Promise.resolve({ success: true, data: [] }),
        text: () => Promise.resolve('{}'),
        status: 200,
        statusText: 'OK',
        redirected: false,
        type: 'basic' as const,
        url: '',
        clone: function () {
          return this as unknown as Response;
        },
        body: null,
        bodyUsed: false,
        bytes: () => Promise.resolve(new Uint8Array()),
        arrayBuffer: () => Promise.resolve(new ArrayBuffer(0)),
        formData: () => Promise.resolve(new FormData()),
      } as unknown as Response);
      vi.stubGlobal('fetch', fetchMock);
      return fetchMock;
    }

    function mockFetchError() {
      const fetchMock = vi.fn<typeof fetch>().mockRejectedValue(new Error('Network error'));
      vi.stubGlobal('fetch', fetchMock);
      return fetchMock;
    }

    beforeEach(() => {
      // Stub globals used by the blob download path
      vi.stubGlobal('fetch', vi.fn());
      vi.stubGlobal('URL', {
        createObjectURL: vi.fn(() => 'blob:mock'),
        revokeObjectURL: vi.fn(),
      });

      // Provide initial bookings data so the component is loaded
      mockGet.mockResolvedValue([
        {
          id: 'b1',
          bookingNumber: 'SP-2026-00001',
          status: 'Pending Confirmation',
          bookingDate: '2026-07-15',
          basePrice: '150000',
          finalPrice: null,
          createdAt: '2026-07-15T10:00:00Z',
        },
      ]);
    });

    it('renders Export CSV button', async () => {
      render(<AdminBookings />);
      expect(await screen.findByText('Export CSV')).toBeInTheDocument();
    });

    it('fetches export endpoint with auth token on click', async () => {
      const fetchMock = mockFetchCSVResponse();
      const user = userEvent.setup();

      render(<AdminBookings />);
      expect(await screen.findByText('Export CSV')).toBeInTheDocument();

      await user.click(screen.getByText('Export CSV'));

      await waitFor(() => {
        expect(fetchMock).toHaveBeenCalledWith('/api/v1/admin/orders/export', {
          headers: {
            Authorization: 'Bearer mock-token',
            Accept: 'text/csv,application/json',
          },
        });
      });
    });

    it('downloads blob directly for CSV response (does not call fallback)', async () => {
      mockFetchCSVResponse();
      const user = userEvent.setup();

      render(<AdminBookings />);
      expect(await screen.findByText('Export CSV')).toBeInTheDocument();

      await user.click(screen.getByText('Export CSV'));

      // Wait for fetch to complete and downloadBlob to be called
      await waitFor(() => {
        expect(mockDownloadBlob).toHaveBeenCalled();
      });
      expect(mockDownloadBlob).toHaveBeenCalledWith(expect.any(Blob), 'orders-export.csv');

      // downloadCSV should NOT have been called (blob path used instead)
      expect(mockDownloadCSV).not.toHaveBeenCalled();
    });

    it('calls downloadCSV fallback for non-CSV response', async () => {
      mockFetchNonCSVResponse();
      const user = userEvent.setup();

      render(<AdminBookings />);
      expect(await screen.findByText('Export CSV')).toBeInTheDocument();

      await user.click(screen.getByText('Export CSV'));

      await waitFor(() => {
        expect(mockDownloadCSV).toHaveBeenCalledTimes(1);
      });
      expect(mockDownloadCSV).toHaveBeenCalledWith(
        ['No. Booking', 'Status', 'Tanggal', 'Harga Dasar', 'Harga Final'],
        expect.any(Array),
        'orders-export.csv',
      );
    });

    it('calls downloadCSV fallback on network error', async () => {
      mockFetchError();
      const user = userEvent.setup();

      render(<AdminBookings />);
      expect(await screen.findByText('Export CSV')).toBeInTheDocument();

      await user.click(screen.getByText('Export CSV'));

      await waitFor(() => {
        expect(mockDownloadCSV).toHaveBeenCalledTimes(1);
      });
    });

    it('shows loading state and disables button during export', async () => {
      // Keep fetch pending indefinitely
      vi.stubGlobal(
        'fetch',
        vi.fn(() => new Promise<Response>(() => {})),
      );
      const user = userEvent.setup();

      render(<AdminBookings />);
      expect(await screen.findByText('Export CSV')).toBeInTheDocument();

      await user.click(screen.getByText('Export CSV'));

      await waitFor(() => {
        expect(screen.getByText('Mengexport...')).toBeInTheDocument();
      });
      expect(screen.queryByText('Export CSV')).not.toBeInTheDocument();
      expect(screen.getByText('Mengexport...')).toBeDisabled();
    });
  });
});
