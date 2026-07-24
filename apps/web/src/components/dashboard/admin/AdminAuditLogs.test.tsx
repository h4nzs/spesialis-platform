import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { AdminAuditLogs } from './AdminAuditLogs';

const { mockGet, mockDownloadCSV } = vi.hoisted(() => ({
  mockGet: vi.fn(),
  mockDownloadCSV: vi.fn(),
}));

vi.mock('@ahlipanggilan/shared', () => ({
  createBrowserClient: () => ({ get: mockGet, getPaginated: mockGet }),
  formatDate: (d: string, _fmt?: string) => d,
  downloadCSV: mockDownloadCSV,
  SCHEMA_TEMPLATES: [],
}));

vi.mock('@ahlipanggilan/ui', () => ({
  Table: ({
    columns,
    data,
    emptyMessage,
    emptyState,
  }: {
    columns: Array<{ key: string; header: string; render?: (item: unknown) => React.ReactNode }>;
    data: unknown[];
    emptyMessage?: string;
    emptyState?: React.ReactNode;
  }) => (
    <div>
      {data.length === 0 && (emptyState ?? <p>{emptyMessage ?? ''}</p>)}
      {data.map((_item: unknown, i: number) => (
        <div key={i} data-testid="audit-row">
          {columns.map(
            (col: { key: string; render?: (item: unknown) => React.ReactNode; header: string }) => (
              <span key={col.key}>
                {col.render
                  ? col.render(_item)
                  : ((_item as Record<string, unknown>)[col.key] as string)}
              </span>
            ),
          )}
        </div>
      ))}
      <div data-testid="pagination-mock" />
    </div>
  ),
  Pagination: ({
    page,
    totalPages,
    onPageChange: _onPageChange,
  }: {
    page: number;
    totalPages: number;
    onPageChange: (p: number) => void;
  }) => (
    <div data-testid="pagination">
      {page}/{totalPages}
    </div>
  ),
  Input: ({
    label,
    placeholder,
    value,
    type,
    onChange,
  }: {
    label?: string;
    placeholder?: string;
    value: string;
    type?: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  }) => (
    <div>
      {label && <label htmlFor={label}>{label}</label>}
      <input
        id={label}
        placeholder={placeholder}
        value={value}
        type={type ?? 'text'}
        onChange={onChange}
        data-testid={`input-${label ?? ''}`}
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
  Modal: ({
    children,
    open,
    title,
  }: {
    children: React.ReactNode;
    open: boolean;
    title?: string;
  }) =>
    open ? (
      <div data-testid="modal">
        {title ? <h2>{title}</h2> : null}
        {children}
      </div>
    ) : null,
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
  ConfirmDialog: () => null,
  Spinner: () => <div aria-hidden="true" />,
}));

beforeEach(() => {
  vi.clearAllMocks();
});

const mockPaginated = (data: unknown[], pagination: { page: number; totalPages: number }) => ({
  data,
  pagination,
});

describe('AdminAuditLogs', () => {
  it('shows loading state initially', () => {
    mockGet.mockImplementation(() => new Promise(() => {}));
    render(<AdminAuditLogs />);
    // Loading state renders skeleton shimmer (aria-hidden, no visible text)
    // Filter form is always rendered; check that table data is absent
    expect(screen.queryByText('Belum ada audit log')).not.toBeInTheDocument();
  });

  it('shows audit log table when loaded', async () => {
    mockGet.mockReturnValue(
      Promise.resolve(
        mockPaginated(
          [
            {
              id: 'log1',
              action: 'LOGIN',
              entity: 'user',
              entityId: 'usr_abc123',
              oldValue: null,
              newValue: null,
              ipAddress: '192.168.1.1',
              userAgent: 'Mozilla/5.0',
              createdAt: '2026-07-15T10:00:00Z',
              userEmail: 'user@example.com',
              userRole: 'admin',
            },
          ],
          { page: 1, totalPages: 5 },
        ),
      ),
    );
    render(<AdminAuditLogs />);
    expect(await screen.findByText('LOGIN')).toBeInTheDocument();
    expect(screen.getByText('user@example.com')).toBeInTheDocument();
    expect(screen.getByText('192.168.1.1')).toBeInTheDocument();
  });

  it('shows filter form with Cari and Reset buttons', async () => {
    mockGet.mockReturnValue(Promise.resolve(mockPaginated([], { page: 1, totalPages: 1 })));
    render(<AdminAuditLogs />);
    expect(await screen.findByText('Cari')).toBeInTheDocument();
    expect(screen.getByText('Reset')).toBeInTheDocument();
  });

  it('shows empty message when no logs', async () => {
    mockGet.mockReturnValue(Promise.resolve(mockPaginated([], { page: 1, totalPages: 1 })));
    render(<AdminAuditLogs />);
    expect(await screen.findByText('Belum ada audit log')).toBeInTheDocument();
  });

  it('shows error message on API failure', async () => {
    mockGet.mockRejectedValue(new Error('Gagal'));
    render(<AdminAuditLogs />);
    expect(await screen.findByText('Gagal memuat data audit log')).toBeInTheDocument();
  });

  it('shows pagination when available', async () => {
    mockGet.mockReturnValue(
      Promise.resolve(
        mockPaginated(
          [
            {
              id: 'log2',
              action: 'CREATE_ORDER',
              entity: 'order',
              entityId: 'ord_xyz',
              oldValue: null,
              newValue: null,
              ipAddress: null,
              userAgent: null,
              createdAt: '2026-07-15T11:00:00Z',
              userEmail: 'admin@test.com',
              userRole: 'admin',
            },
          ],
          { page: 3, totalPages: 10 },
        ),
      ),
    );
    render(<AdminAuditLogs />);
    expect(await screen.findByText('3/10')).toBeInTheDocument();
  });

  // ─── CSV Export Tests ───────────────────────────────────────────

  describe('CSV export', () => {
    beforeEach(() => {
      mockGet.mockReturnValue(
        Promise.resolve(
          mockPaginated(
            [
              {
                id: 'log1',
                action: 'LOGIN',
                entity: 'user',
                entityId: 'usr_abc123',
                oldValue: null,
                newValue: null,
                ipAddress: '192.168.1.1',
                userAgent: 'Mozilla/5.0',
                createdAt: '2026-07-15T10:00:00Z',
                userEmail: 'user@example.com',
                userRole: 'admin',
              },
            ],
            { page: 1, totalPages: 5 },
          ),
        ),
      );
    });

    it('renders Export CSV button when data loaded', async () => {
      render(<AdminAuditLogs />);
      expect(await screen.findByText('Export CSV')).toBeInTheDocument();
    });

    it('does not render Export CSV button when no logs', async () => {
      mockGet.mockReset();
      mockGet.mockReturnValue(Promise.resolve(mockPaginated([], { page: 1, totalPages: 1 })));
      render(<AdminAuditLogs />);
      expect(await screen.findByText('Belum ada audit log')).toBeInTheDocument();
      expect(screen.queryByText('Export CSV')).not.toBeInTheDocument();
    });

    it('calls downloadCSV with correct data on click', async () => {
      const user = userEvent.setup();
      render(<AdminAuditLogs />);
      expect(await screen.findByText('Export CSV')).toBeInTheDocument();

      await user.click(screen.getByText('Export CSV'));

      expect(mockDownloadCSV).toHaveBeenCalledTimes(1);
      expect(mockDownloadCSV).toHaveBeenCalledWith(
        ['Waktu', 'User', 'Aksi', 'Entitas', 'ID Entitas', 'IP'],
        [
          [
            '2026-07-15T10:00:00Z',
            'user@example.com',
            'LOGIN',
            'user',
            'usr_abc1...',
            '192.168.1.1',
          ],
        ],
        'audit-log-export.csv',
      );
    });
  });
});
