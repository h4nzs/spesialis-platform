import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { AdminServices } from './AdminServices';

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
  SCHEMA_TEMPLATES: [],
}));

vi.mock('@ahlipanggilan/ui', () => ({
  Modal: ({
    children,
    open,
    title,
  }: {
    children: React.ReactNode;
    open: boolean;
    title: string;
  }) =>
    open ? (
      <div data-testid="modal">
        <h2>{title}</h2>
        {children}
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
        <div key={i} data-testid="service-row">
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
  }: {
    children: React.ReactNode;
    onClick?: () => void;
    type?: 'button' | 'submit' | 'reset';
    disabled?: boolean;
  }) => (
    <button type={type ?? 'button'} onClick={onClick} disabled={disabled}>
      {children}
    </button>
  ),
  Input: ({
    label,
    value,
    onChange,
    required,
    type,
  }: {
    label: string;
    value: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    required?: boolean;
    type?: string;
  }) => (
    <div>
      <label htmlFor={label}>{label}</label>
      <input
        id={label}
        value={value}
        onChange={onChange}
        required={required}
        type={type ?? 'text'}
        data-testid={`input-${label}`}
      />
    </div>
  ),
  Select: ({
    label,
    value,
    onChange,
    options,
    placeholder,
    required,
  }: {
    label: string;
    value: string;
    onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
    options: { value: string; label: string }[];
    placeholder?: string;
    required?: boolean;
  }) => (
    <div>
      <label>{label}</label>
      <select value={value} onChange={onChange} required={required} data-testid={`select-${label}`}>
        {placeholder && <option value="">{placeholder}</option>}
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </div>
  ),
  Textarea: ({
    label,
    value,
    onChange,
  }: {
    label: string;
    value: string;
    onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  }) => (
    <div>
      <label>{label}</label>
      <textarea value={value} onChange={onChange} />
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
    data,
    columns,
    filename,
  }: {
    data?: Record<string, unknown>[];
    columns?: { key: string; label?: string; format?: (v: unknown) => string }[];
    filename?: string;
  }) => (
    <button
      type="button"
      onClick={() => {
        const headers = (columns ?? []).map(
          (c: { label?: string; key?: string }) => c.label ?? c.key ?? '',
        );
        const rows = (data ?? []).map((row: Record<string, unknown>) =>
          (columns ?? []).map((col: { key: string; format?: (v: unknown) => string }) =>
            col.format ? col.format(row[col.key]) : String(row[col.key] ?? ''),
          ),
        );
        mockDownloadCSV(headers, rows, filename ?? 'export.csv');
      }}
    >
      Export CSV
    </button>
  ),
  Pagination: () => <div />,
  ConfirmDialog: () => null,
  Spinner: () => <div aria-hidden="true" />,
  MediaBrowser: ({
    open,
    onClose,
    onSelect,
  }: {
    open: boolean;
    onClose: () => void;
    onSelect: (url: string) => void;
  }) =>
    open ? (
      <div data-testid="media-browser">
        <button onClick={() => onSelect('https://example.com/img.jpg')}>Pilih Gambar</button>
        <button onClick={onClose}>Tutup</button>
      </div>
    ) : null,
}));

beforeEach(() => {
  vi.clearAllMocks();
});

describe('AdminServices', () => {
  it('shows loading state initially', () => {
    mockGet.mockImplementation(() => new Promise(() => {}));
    render(<AdminServices />);
    // Loading state renders skeleton shimmer (aria-hidden, no visible text)
    expect(screen.queryByText('Tambah Layanan')).not.toBeInTheDocument();
  });

  it('shows service list when loaded', async () => {
    mockGet.mockResolvedValueOnce({
      data: [
        {
          id: 's1',
          name: 'Service 1',
          slug: 'service-1',
          basePrice: '150000',
          isActive: true,
          isFeatured: false,
          categoryName: 'Cat 1',
        },
      ],
    });
    mockGet.mockResolvedValueOnce([{ id: 'c1', name: 'Cat 1', slug: 'cat-1' }]);
    render(<AdminServices />);
    expect(await screen.findByText('Service 1')).toBeInTheDocument();
    expect(screen.getByText('Tambah Layanan')).toBeInTheDocument();
  });

  it('shows empty state', async () => {
    mockGet.mockResolvedValueOnce({ data: [] });
    mockGet.mockResolvedValueOnce([]);
    render(<AdminServices />);
    expect(await screen.findByText('Belum ada layanan')).toBeInTheDocument();
  });

  it('opens create modal', async () => {
    const user = userEvent.setup();
    mockGet.mockResolvedValueOnce({ data: [] });
    mockGet.mockResolvedValueOnce([]);
    render(<AdminServices />);
    expect(await screen.findByText('Tambah Layanan')).toBeInTheDocument();
    await user.click(screen.getByText('Tambah Layanan'));
    expect(await screen.findByTestId('modal')).toBeInTheDocument();
    expect(screen.getByText('Batal')).toBeInTheDocument();
  });

  it('shows edit and toggle buttons per row', async () => {
    mockGet.mockResolvedValueOnce({
      data: [
        {
          id: 's1',
          name: 'Service 1',
          slug: 'service-1',
          basePrice: '150000',
          isActive: true,
          isFeatured: false,
          categoryName: 'Cat 1',
          displayOrder: 0,
          estimatedDuration: null,
        },
      ],
    });
    mockGet.mockResolvedValueOnce([]);
    render(<AdminServices />);
    expect(await screen.findByText('Edit')).toBeInTheDocument();
    expect(screen.getByText('Nonaktifkan')).toBeInTheDocument();
  });

  it('shows Aktifkan for inactive service', async () => {
    mockGet.mockResolvedValueOnce({
      data: [
        {
          id: 's2',
          name: 'Service 2',
          slug: 'service-2',
          basePrice: '200000',
          isActive: false,
          isFeatured: false,
          categoryName: null,
          displayOrder: 0,
          estimatedDuration: null,
        },
      ],
    });
    mockGet.mockResolvedValueOnce([]);
    render(<AdminServices />);
    expect(await screen.findByText('Aktifkan')).toBeInTheDocument();
  });

  // --- Interaction Tests ---

  it('calls patch API when Nonaktifkan is clicked', async () => {
    mockGet.mockResolvedValueOnce({
      data: [
        {
          id: 's1',
          name: 'Service 1',
          slug: 'service-1',
          basePrice: '150000',
          isActive: true,
          isFeatured: false,
          categoryName: 'Cat 1',
          displayOrder: 0,
          estimatedDuration: null,
        },
      ],
    });
    mockGet.mockResolvedValueOnce([]);
    mockPatch.mockResolvedValue(undefined);
    render(<AdminServices />);
    expect(await screen.findByText('Nonaktifkan')).toBeInTheDocument();
    screen.getByText('Nonaktifkan').click();
    await waitFor(() => {
      expect(mockPatch).toHaveBeenCalledWith('/api/v1/admin/services/s1', {
        body: { isActive: false },
      });
    });
  });

  it('calls patch API when Aktifkan is clicked', async () => {
    mockGet.mockResolvedValueOnce({
      data: [
        {
          id: 's2',
          name: 'Service 2',
          slug: 'service-2',
          basePrice: '200000',
          isActive: false,
          isFeatured: false,
          categoryName: null,
          displayOrder: 0,
          estimatedDuration: null,
        },
      ],
    });
    mockGet.mockResolvedValueOnce([]);
    mockPatch.mockResolvedValue(undefined);
    render(<AdminServices />);
    expect(await screen.findByText('Aktifkan')).toBeInTheDocument();
    screen.getByText('Aktifkan').click();
    await waitFor(() => {
      expect(mockPatch).toHaveBeenCalledWith('/api/v1/admin/services/s2', {
        body: { isActive: true },
      });
    });
  });

  it('shows validation error when submitting empty form', async () => {
    const user = userEvent.setup();
    mockGet.mockResolvedValueOnce({ data: [] });
    mockGet.mockResolvedValueOnce([]);
    render(<AdminServices />);
    expect(await screen.findByText('Tambah Layanan')).toBeInTheDocument();
    await user.click(screen.getByText('Tambah Layanan'));
    await waitFor(() => {
      expect(screen.getByTestId('modal')).toBeInTheDocument();
    });

    // Fire submit event on the form directly (click on submit button doesn't trigger form submit in JSDOM)
    const form = screen.getByTestId('modal').querySelector('form');
    fireEvent.submit(form!);

    await waitFor(() => {
      expect(screen.getByText('Nama, slug, dan harga wajib diisi')).toBeInTheDocument();
    });
  });

  it('submits form and calls post API', async () => {
    const user = userEvent.setup();
    mockGet.mockResolvedValueOnce({ data: [] });
    mockGet.mockResolvedValueOnce([{ id: 'c1', name: 'Cat 1', slug: 'cat-1' }]);
    mockPost.mockResolvedValue(undefined);
    render(<AdminServices />);
    expect(await screen.findByText('Tambah Layanan')).toBeInTheDocument();
    await user.click(screen.getByText('Tambah Layanan'));
    await waitFor(() => {
      expect(screen.getByTestId('modal')).toBeInTheDocument();
    });

    const nameInput = screen.getByTestId('input-Nama Layanan');
    const slugInput = screen.getByTestId('input-Slug');
    const priceInput = screen.getByTestId('input-Harga');
    const categorySelect = screen.getByTestId('select-Kategori');

    await user.type(nameInput, 'New Service');
    await user.type(slugInput, 'new-service');
    await user.type(priceInput, '250000');
    await user.selectOptions(categorySelect, 'c1');

    await user.click(screen.getByText('Buat'));

    await waitFor(() => {
      expect(mockPost).toHaveBeenCalledWith('/api/v1/admin/services', {
        body: expect.objectContaining({
          name: 'New Service',
          slug: 'new-service',
          basePrice: '250000',
          categoryId: 'c1',
        }),
      });
    });
  }, 10000);

  // ─── CSV Export Tests ───────────────────────────────────────────

  describe('CSV export', () => {
    beforeEach(() => {
      mockGet.mockResolvedValueOnce({
        data: [
          {
            id: 's1',
            name: 'Service 1',
            slug: 'service-1',
            basePrice: '150000',
            isActive: true,
            isFeatured: false,
            categoryName: 'Cat 1',
            displayOrder: 0,
            estimatedDuration: null,
          },
        ],
      });
      mockGet.mockResolvedValueOnce([{ id: 'c1', name: 'Cat 1', slug: 'cat-1' }]);
    });

    it('renders Export CSV button when data loaded', async () => {
      render(<AdminServices />);
      expect(await screen.findByText('Export CSV')).toBeInTheDocument();
    });

    it('does not render Export CSV button when no services', async () => {
      mockGet.mockReset();
      mockGet.mockResolvedValueOnce({ data: [] });
      mockGet.mockResolvedValueOnce([]);
      render(<AdminServices />);
      expect(await screen.findByText('Tambah Layanan')).toBeInTheDocument();
      expect(screen.queryByText('Export CSV')).not.toBeInTheDocument();
    });

    it('calls downloadCSV with correct data on click', async () => {
      const user = userEvent.setup();
      render(<AdminServices />);
      expect(await screen.findByText('Export CSV')).toBeInTheDocument();

      await user.click(screen.getByText('Export CSV'));

      expect(mockDownloadCSV).toHaveBeenCalledTimes(1);
      expect(mockDownloadCSV).toHaveBeenCalledWith(
        ['Nama', 'Slug', 'Kategori', 'Harga', 'Status', 'Featured'],
        [['Service 1', 'service-1', 'Cat 1', '150000', 'Aktif', 'Tidak']],
        'layanan-export.csv',
      );
    });
  });
});
