import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { AdminUsers } from './AdminUsers';

const mockGet = vi.fn();
const mockPatch = vi.fn();

vi.mock('@specialist/shared', () => ({
  createBrowserClient: () => ({ get: mockGet, patch: mockPatch }),
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
    columns,
  }: {
    data: unknown[];
    emptyMessage: string;
    columns: { key: string; header: string; render?: (item: unknown) => React.ReactNode }[];
  }) => (
    <div>
      {data.length === 0 && <p>{emptyMessage}</p>}
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
}));

beforeEach(() => {
  vi.clearAllMocks();
});

describe('AdminUsers', () => {
  it('shows loading state initially', () => {
    mockGet.mockImplementation(() => new Promise(() => {}));
    render(<AdminUsers />);
    expect(screen.getByText('Memuat...')).toBeInTheDocument();
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
});
