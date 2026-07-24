import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { CorporateBranches } from './CorporateBranches';

const { mockGet, mockPost, mockDelete, mockDownloadCSV } = vi.hoisted(() => ({
  mockGet: vi.fn(),
  mockPost: vi.fn(),
  mockDelete: vi.fn(),
  mockDownloadCSV: vi.fn(),
}));

vi.mock('@ahlipanggilan/shared', () => ({
  createBrowserClient: () => ({ get: mockGet, post: mockPost, delete: mockDelete }),
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
        <div key={i} data-testid="branch-row">
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
    size: _size,
    variant: _variant,
  }: {
    children: React.ReactNode;
    onClick?: () => void;
    size?: string;
    variant?: string;
  }) => <button onClick={onClick}>{children}</button>,
  Input: ({
    label,
    value,
    onChange,
    required,
  }: {
    label: string;
    value: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    required?: boolean;
  }) => (
    <div>
      <label htmlFor={label}>{label}</label>
      <input id={label} value={value} onChange={onChange} required={required} />
    </div>
  ),
  EmptyState: ({ title, children }: { title?: string; children?: React.ReactNode }) => (
    <div>{title ?? children}</div>
  ),
  TableSkeleton: () => <div data-testid="table-skeleton" />,
  Card: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  Grid: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  Badge: ({ children }: { children: React.ReactNode }) => <span>{children}</span>,
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
}));

beforeEach(() => {
  vi.clearAllMocks();
});

describe('CorporateBranches', () => {
  it('shows loading state initially', () => {
    mockGet.mockImplementation(() => new Promise(() => {}));
    render(<CorporateBranches />);
    // Loading state renders skeleton shimmer (aria-hidden, no visible text)
    expect(screen.queryByText('Tambah Cabang')).not.toBeInTheDocument();
  });

  it('shows branches when loaded', async () => {
    mockGet.mockResolvedValueOnce({ id: 'company1' });
    mockGet.mockResolvedValueOnce([
      { id: 'b1', name: 'Branch 1', address: 'Jl. Merdeka', city: 'Jakarta', phone: '08123456789' },
    ]);
    render(<CorporateBranches />);
    expect(await screen.findByText('Branch 1')).toBeInTheDocument();
    expect(screen.getByText('Tambah Cabang')).toBeInTheDocument();
  });

  it('shows empty state', async () => {
    mockGet.mockResolvedValueOnce({ id: 'company1' });
    mockGet.mockResolvedValueOnce([]);
    render(<CorporateBranches />);
    expect(await screen.findByText('Belum ada cabang')).toBeInTheDocument();
  });

  it('handles API error', async () => {
    mockGet.mockRejectedValue(new Error('Gagal'));
    render(<CorporateBranches />);
    expect(await screen.findByText('Belum ada cabang')).toBeInTheDocument();
  });

  it('shows Tambah Cabang modal', async () => {
    const user = userEvent.setup();
    mockGet.mockResolvedValueOnce({ id: 'company1' });
    mockGet.mockResolvedValueOnce([]);
    render(<CorporateBranches />);
    const btn = await screen.findByText('Tambah Cabang');
    await user.click(btn);
    expect(await screen.findByTestId('modal')).toBeInTheDocument();
    expect(screen.getByText('Batal')).toBeInTheDocument();
    expect(screen.getByText('Nama Cabang')).toBeInTheDocument();
    expect(screen.getByText('Alamat')).toBeInTheDocument();
    expect(screen.getByText('Kota')).toBeInTheDocument();
    expect(screen.getByText('Telepon')).toBeInTheDocument();
  });

  it('shows Hapus button per branch row', async () => {
    mockGet.mockResolvedValueOnce({ id: 'company1' });
    mockGet.mockResolvedValueOnce([
      { id: 'b1', name: 'Branch 1', address: 'Jl. Merdeka', city: 'Jakarta', phone: null },
    ]);
    render(<CorporateBranches />);
    expect(await screen.findByText('Hapus')).toBeInTheDocument();
  });

  // ─── CSV Export Tests ───────────────────────────────────────────

  describe('CSV export', () => {
    beforeEach(() => {
      mockGet.mockResolvedValueOnce({ id: 'company1' });
      mockGet.mockResolvedValueOnce([
        {
          id: 'b1',
          name: 'Branch 1',
          address: 'Jl. Merdeka',
          city: 'Jakarta',
          phone: '08123456789',
        },
      ]);
    });

    it('renders Export CSV button when data loaded', async () => {
      render(<CorporateBranches />);
      expect(await screen.findByText('Export CSV')).toBeInTheDocument();
    });

    it('does not render Export CSV button when no branches', async () => {
      mockGet.mockReset();
      mockGet.mockResolvedValueOnce({ id: 'company1' });
      mockGet.mockResolvedValueOnce([]);
      render(<CorporateBranches />);
      expect(await screen.findByText('Belum ada cabang')).toBeInTheDocument();
      expect(screen.queryByText('Export CSV')).not.toBeInTheDocument();
    });

    it('calls downloadCSV with correct data on click', async () => {
      const user = userEvent.setup();
      render(<CorporateBranches />);
      expect(await screen.findByText('Export CSV')).toBeInTheDocument();

      await user.click(screen.getByText('Export CSV'));

      expect(mockDownloadCSV).toHaveBeenCalledTimes(1);
      expect(mockDownloadCSV).toHaveBeenCalledWith(
        ['Nama', 'Alamat', 'Kota', 'Telepon'],
        [['Branch 1', 'Jl. Merdeka', 'Jakarta', '08123456789']],
        'cabang-export.csv',
      );
    });
  });
});
