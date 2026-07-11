import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { ProfileSettings } from './ProfileSettings';

const mockGet = vi.fn();
const mockPatch = vi.fn();

vi.mock('@ahlipanggilan/shared', () => ({
  createBrowserClient: () => ({ get: mockGet, patch: mockPatch }),
  SCHEMA_TEMPLATES: [],
}));

vi.mock('@ahlipanggilan/ui', () => ({
  Input: ({
    label,
    value,
    onChange,
    type,
  }: {
    label: string;
    value: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    type?: string;
  }) => (
    <div>
      <label htmlFor={label}>{label}</label>
      <input id={label} value={value} onChange={onChange} type={type ?? 'text'} />
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
  TableSkeleton: () => <div data-testid="table-skeleton" />,
  Card: ({ children, ..._props }: { children: React.ReactNode; [key: string]: unknown }) => (
    <div>{children}</div>
  ),
  Grid: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  Badge: ({ children, ..._props }: { children: React.ReactNode; [key: string]: unknown }) => (
    <span>{children}</span>
  ),
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
  EmptyState: ({
    title,
    children,
    ..._props
  }: {
    title?: string;
    children?: React.ReactNode;
    [key: string]: unknown;
  }) => <div>{title ?? children}</div>,
  Pagination: ({ ..._props }: { [key: string]: unknown }) => <div />,
  ConfirmDialog: ({ ..._props }: { [key: string]: unknown }) => null,
  Spinner: () => <div aria-hidden="true" />,
}));

vi.mock('@ahlipanggilan/validation', () => ({
  updateProfileSchema: {
    safeParse: (data: unknown) => {
      const d = data as { email: string; phone: string };
      if (!d.email)
        return { success: false, error: { issues: [{ message: 'Email wajib diisi' }] } };
      if (!d.email.includes('@'))
        return { success: false, error: { issues: [{ message: 'Email tidak valid' }] } };
      return { success: true, data: d };
    },
  },
  changePasswordSchema: {
    safeParse: (data: unknown) => {
      const d = data as { currentPassword: string; newPassword: string };
      if (!d.currentPassword)
        return {
          success: false,
          error: { issues: [{ message: 'Password saat ini wajib diisi' }] },
        };
      if (!d.newPassword || d.newPassword.length < 6)
        return {
          success: false,
          error: { issues: [{ message: 'Password baru minimal 6 karakter' }] },
        };
      return { success: true, data: d };
    },
  },
}));

beforeEach(() => {
  vi.clearAllMocks();
});

describe('ProfileSettings', () => {
  it('shows loading state initially', () => {
    mockGet.mockImplementation(() => new Promise(() => {}));
    render(<ProfileSettings />);
    expect(screen.getByText('Memuat profil...')).toBeInTheDocument();
  });

  it('shows profile form when loaded', async () => {
    mockGet.mockResolvedValue({
      id: 'user1',
      email: 'user@test.com',
      phone: '08123456789',
      role: 'customer',
    });
    render(<ProfileSettings />);
    expect(await screen.findByText('Profil')).toBeInTheDocument();
    expect(screen.getByDisplayValue('user@test.com')).toBeInTheDocument();
    expect(screen.getByDisplayValue('08123456789')).toBeInTheDocument();
  });

  it('shows error state when profile fetch fails', async () => {
    mockGet.mockRejectedValue(new Error('Gagal'));
    render(<ProfileSettings />);
    expect(await screen.findByText('Gagal memuat profil')).toBeInTheDocument();
  });

  it('shows password change section', async () => {
    mockGet.mockResolvedValue({
      id: 'user1',
      email: 'user@test.com',
      phone: '08123456789',
      role: 'customer',
    });
    render(<ProfileSettings />);
    expect(await screen.findByRole('heading', { name: 'Ubah Password' })).toBeInTheDocument();
    expect(screen.getByText('Password Saat Ini')).toBeInTheDocument();
    expect(screen.getByText('Password Baru')).toBeInTheDocument();
  });

  it('shows validation error on profile submit', async () => {
    const user = userEvent.setup();
    mockGet.mockResolvedValue({
      id: 'user1',
      email: 'user@test.com',
      phone: '08123456789',
      role: 'customer',
    });
    render(<ProfileSettings />);
    expect(await screen.findByText('Simpan Profil')).toBeInTheDocument();
    const emailInput = screen.getByLabelText('Email');
    await user.clear(emailInput);
    await user.type(emailInput, 'invalid-email');
    fireEvent.submit(screen.getByText('Simpan Profil').closest('form')!);
    expect(await screen.findByText('Email tidak valid')).toBeInTheDocument();
  });

  it('shows validation error on password submit', async () => {
    const user = userEvent.setup();
    mockGet.mockResolvedValue({
      id: 'user1',
      email: 'user@test.com',
      phone: '08123456789',
      role: 'customer',
    });
    render(<ProfileSettings />);
    expect(await screen.findByRole('heading', { name: 'Ubah Password' })).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Ubah Password' }));
    expect(await screen.findByText('Password saat ini wajib diisi')).toBeInTheDocument();
  });

  it('shows profile success message', async () => {
    mockPatch.mockResolvedValue(undefined);
    const user = userEvent.setup();
    mockGet.mockResolvedValue({
      id: 'user1',
      email: 'user@test.com',
      phone: '08123456789',
      role: 'customer',
    });
    render(<ProfileSettings />);
    expect(await screen.findByText('Simpan Profil')).toBeInTheDocument();
    await user.click(screen.getByText('Simpan Profil'));
    expect(await screen.findByText('Profil berhasil diperbarui')).toBeInTheDocument();
  });
});
