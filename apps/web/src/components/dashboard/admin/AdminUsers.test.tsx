import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, within } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { AdminUsers } from './AdminUsers';

const { mockGet, mockPatch, mockDownloadCSV } = vi.hoisted(() => ({
  mockGet: vi.fn(),
  mockPatch: vi.fn(),
  mockDownloadCSV: vi.fn(),
}));

vi.mock('@specialist/shared', () => ({
  createBrowserClient: () => ({ get: mockGet, patch: mockPatch }),
  downloadCSV: mockDownloadCSV,
}));

vi.mock('@specialist/ui', () => ({
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
        <div key={i} data-testid="user-row">
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
    placeholder,
    value,
    onChange,
  }: {
    placeholder?: string;
    value: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  }) => (
    <div>
      <input
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        data-testid="search-input"
      />
    </div>
  ),
  Select: ({
    value,
    onChange,
    options,
  }: {
    value: string;
    onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
    options: { value: string; label: string }[];
  }) => (
    <div>
      <select value={value} onChange={onChange}>
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
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

describe('AdminUsers', () => {
  it('shows loading state initially', () => {
    mockGet.mockImplementation(() => new Promise(() => {}));
    render(<AdminUsers />);
    // Loading state renders skeleton shimmer (aria-hidden, no visible text)
    // Search form is always rendered; check that user data table is absent
    expect(screen.queryByText('Tidak ada user ditemukan')).not.toBeInTheDocument();
  });

  it('shows user list when loaded', async () => {
    mockGet.mockResolvedValueOnce({
      data: [
        {
          id: 'u1',
          email: 'user@test.com',
          phone: '08123456789',
          role: 'customer',
          status: 'active',
          emailVerifiedAt: '2026-01-01',
          lastLoginAt: null,
          createdAt: '2026-01-01',
        },
      ],
    });
    render(<AdminUsers />);
    expect(await screen.findByText('user@test.com')).toBeInTheDocument();
  });

  it('shows empty state', async () => {
    mockGet.mockResolvedValueOnce({ data: [] });
    render(<AdminUsers />);
    expect(await screen.findByText('Tidak ada user ditemukan')).toBeInTheDocument();
  });

  it('shows search input and filter selects', async () => {
    mockGet.mockResolvedValueOnce({ data: [] });
    render(<AdminUsers />);
    expect(await screen.findByPlaceholderText('Cari email atau nomor HP...')).toBeInTheDocument();
    expect(screen.getByText('Cari')).toBeInTheDocument();
  });

  it('shows Ubah Status button per row', async () => {
    mockGet.mockResolvedValueOnce({
      data: [
        {
          id: 'u1',
          email: 'user@test.com',
          phone: '',
          role: 'partner',
          status: 'active',
          emailVerifiedAt: null,
          lastLoginAt: null,
          createdAt: '2026-01-01',
        },
      ],
    });
    render(<AdminUsers />);
    expect(await screen.findByText('Ubah Status')).toBeInTheDocument();
  });

  it('shows status modal with current status', async () => {
    const user = userEvent.setup();
    mockGet.mockResolvedValueOnce({
      data: [
        {
          id: 'u1',
          email: 'user@test.com',
          phone: '',
          role: 'customer',
          status: 'active',
          emailVerifiedAt: null,
          lastLoginAt: null,
          createdAt: '2026-01-01',
        },
      ],
    });
    render(<AdminUsers />);
    const btn = await screen.findByText('Ubah Status');
    await user.click(btn);
    expect(await screen.findByTestId('modal')).toBeInTheDocument();
    expect(screen.getByText(/Status saat ini/)).toBeInTheDocument();
  });

  // --- Interaction Tests ---

  it('calls get API with search term on form submit', async () => {
    const user = userEvent.setup();
    mockGet.mockResolvedValueOnce({ data: [] });
    render(<AdminUsers />);
    expect(await screen.findByPlaceholderText('Cari email atau nomor HP...')).toBeInTheDocument();

    const searchInput = screen.getByTestId('search-input');
    await user.type(searchInput, 'test@email.com');
    await user.click(screen.getByText('Cari'));

    await waitFor(() => {
      expect(mockGet).toHaveBeenCalledWith('/api/v1/admin/users', {
        params: expect.objectContaining({
          search: 'test@email.com',
          limit: 100,
        }),
      });
    });
  });

  it('calls patch API when status is updated and Simpan is clicked', async () => {
    const user = userEvent.setup();
    mockGet.mockResolvedValueOnce({
      data: [
        {
          id: 'u1',
          email: 'user@test.com',
          phone: '081',
          role: 'customer',
          status: 'active',
          emailVerifiedAt: null,
          lastLoginAt: null,
          createdAt: '2026-01-01',
        },
      ],
    });
    mockPatch.mockResolvedValue(undefined);
    render(<AdminUsers />);
    const btn = await screen.findByText('Ubah Status');
    await user.click(btn);
    await waitFor(() => {
      expect(screen.getByTestId('modal')).toBeInTheDocument();
    });

    const modal = screen.getByTestId('modal');
    const select = within(modal).getByRole('combobox');
    await user.selectOptions(select, 'suspended');

    await user.click(screen.getByText('Simpan'));

    await waitFor(() => {
      expect(mockPatch).toHaveBeenCalledWith('/api/v1/admin/users/u1/status', {
        body: { status: 'suspended' },
      });
    });
  });

  it('does not call patch API when status is unchanged', async () => {
    const user = userEvent.setup();
    mockGet.mockResolvedValueOnce({
      data: [
        {
          id: 'u1',
          email: 'user@test.com',
          phone: '',
          role: 'customer',
          status: 'active',
          emailVerifiedAt: null,
          lastLoginAt: null,
          createdAt: '2026-01-01',
        },
      ],
    });
    mockPatch.mockResolvedValue(undefined);
    render(<AdminUsers />);
    const btn = await screen.findByText('Ubah Status');
    await user.click(btn);
    await waitFor(() => {
      expect(screen.getByTestId('modal')).toBeInTheDocument();
    });

    await user.click(screen.getByText('Simpan'));

    await waitFor(() => {
      expect(mockPatch).not.toHaveBeenCalled();
    });
  });

  it('closes modal on Batal and does not call API', async () => {
    const user = userEvent.setup();
    mockGet.mockResolvedValueOnce({
      data: [
        {
          id: 'u1',
          email: 'user@test.com',
          phone: '',
          role: 'customer',
          status: 'active',
          emailVerifiedAt: null,
          lastLoginAt: null,
          createdAt: '2026-01-01',
        },
      ],
    });
    render(<AdminUsers />);
    const btn = await screen.findByText('Ubah Status');
    await user.click(btn);
    await waitFor(() => {
      expect(screen.getByTestId('modal')).toBeInTheDocument();
    });

    await user.click(screen.getByText('Batal'));

    await waitFor(() => {
      expect(screen.queryByTestId('modal')).not.toBeInTheDocument();
    });
    expect(mockPatch).not.toHaveBeenCalled();
  });

  // ─── CSV Export Tests ───────────────────────────────────────────

  describe('CSV export', () => {
    beforeEach(() => {
      mockGet.mockResolvedValue({
        data: [
          {
            id: 'u1',
            email: 'user@test.com',
            phone: '08123456789',
            role: 'customer',
            status: 'active',
            emailVerifiedAt: '2026-01-01',
            lastLoginAt: null,
            createdAt: '2026-01-01',
          },
        ],
      });
    });

    it('renders Export CSV button when data loaded', async () => {
      render(<AdminUsers />);
      expect(await screen.findByText('Export CSV')).toBeInTheDocument();
    });

    it('does not render Export CSV button when no users', async () => {
      mockGet.mockReset();
      mockGet.mockResolvedValue({ data: [] });
      render(<AdminUsers />);
      expect(await screen.findByText('Tidak ada user ditemukan')).toBeInTheDocument();
      expect(screen.queryByText('Export CSV')).not.toBeInTheDocument();
    });

    it('calls downloadCSV with correct data on click', async () => {
      const user = userEvent.setup();
      render(<AdminUsers />);
      expect(await screen.findByText('Export CSV')).toBeInTheDocument();

      await user.click(screen.getByText('Export CSV'));

      expect(mockDownloadCSV).toHaveBeenCalledTimes(1);
      expect(mockDownloadCSV).toHaveBeenCalledWith(
        ['Email', 'No. HP', 'Role', 'Status', 'Email Terverifikasi', 'Terakhir Login', 'Dibuat'],
        [['user@test.com', '08123456789', 'Customer', 'active', 'Ya', 'Tidak pernah', '1/1/2026']],
        'user-export.csv',
      );
    });
  });
});
