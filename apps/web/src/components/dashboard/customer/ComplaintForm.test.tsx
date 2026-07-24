import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { ComplaintForm } from './ComplaintForm';

const mockPost = vi.fn();

vi.mock('@ahlipanggilan/shared', () => ({
  createBrowserClient: () => ({ post: mockPost }),
  parseApiError: (err: unknown, fallback?: string) => {
    if (err instanceof Error) return { fieldErrors: {}, generalError: err.message };
    return { fieldErrors: {}, generalError: fallback ?? 'Terjadi kesalahan' };
  },
  SCHEMA_TEMPLATES: [],
}));

vi.mock('@ahlipanggilan/ui', () => ({
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
    placeholder,
    error,
  }: {
    label: string;
    value: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    placeholder?: string;
    error?: string;
  }) => (
    <div>
      <label htmlFor={label}>{label}</label>
      <input id={label} value={value} onChange={onChange} placeholder={placeholder} />
      {error && <p className="text-sm text-danger">{error}</p>}
    </div>
  ),
  Textarea: ({
    label,
    value,
    onChange,
    placeholder,
    error,
  }: {
    label: string;
    value: string;
    onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
    placeholder?: string;
    error?: string;
  }) => (
    <div>
      <label htmlFor={label}>{label}</label>
      <textarea id={label} value={value} onChange={onChange} placeholder={placeholder} />
      {error && <p className="text-sm text-danger">{error}</p>}
    </div>
  ),
  Card: ({ children, padding: _padding }: { children: React.ReactNode; padding?: string }) => (
    <div>{children}</div>
  ),
  TableSkeleton: () => <div data-testid="table-skeleton" />,
  Grid: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  Badge: ({ children }: { children: React.ReactNode }) => <span>{children}</span>,
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
  CSVExportButton: ({ onClick }: { onClick?: () => void }) => (
    <button type="button" onClick={onClick}>
      Export CSV
    </button>
  ),
  EmptyState: ({ title, children }: { title?: string; children?: React.ReactNode }) => (
    <div>{title ?? children}</div>
  ),
  Pagination: () => <div />,
  ConfirmDialog: () => null,
  Spinner: () => <div aria-hidden="true" />,
}));

vi.mock('@ahlipanggilan/validation', () => ({
  createComplaintSchema: {
    safeParse: (data: unknown) => {
      const d = data as { orderId: string; title: string; description: string };
      if (!d.orderId)
        return {
          success: false,
          error: { issues: [{ path: ['orderId'], message: 'Order ID wajib diisi' }] },
        };
      if (!d.title)
        return {
          success: false,
          error: { issues: [{ path: ['title'], message: 'Judul wajib diisi' }] },
        };
      if (!d.description || d.description.length < 10)
        return {
          success: false,
          error: { issues: [{ path: ['description'], message: 'Deskripsi minimal 10 karakter' }] },
        };
      return { success: true, data: d };
    },
  },
}));

beforeEach(() => {
  vi.clearAllMocks();
});

describe('ComplaintForm', () => {
  it('renders form fields', () => {
    render(<ComplaintForm />);
    expect(screen.getByText('ID Pesanan')).toBeInTheDocument();
    expect(screen.getByText('Judul')).toBeInTheDocument();
    expect(screen.getByText('Deskripsi')).toBeInTheDocument();
    expect(screen.getByText('Kirim Komplain')).toBeInTheDocument();
  });

  it('shows validation errors for empty fields', async () => {
    const user = userEvent.setup();
    render(<ComplaintForm />);
    await user.click(screen.getByText('Kirim Komplain'));
    expect(screen.getByText('Order ID wajib diisi')).toBeInTheDocument();
  });

  it('shows validation error for short description', async () => {
    const user = userEvent.setup();
    render(<ComplaintForm />);
    await user.type(screen.getByLabelText('ID Pesanan'), 'order1');
    await user.type(screen.getByLabelText('Judul'), 'Test complaint');
    await user.type(screen.getByLabelText('Deskripsi'), 'short');
    await user.click(screen.getByText('Kirim Komplain'));
    expect(screen.getByText('Deskripsi minimal 10 karakter')).toBeInTheDocument();
  });

  it('submits successfully', async () => {
    mockPost.mockResolvedValue(undefined);
    const user = userEvent.setup();
    render(<ComplaintForm />);
    await user.type(screen.getByLabelText('ID Pesanan'), 'order1');
    await user.type(screen.getByLabelText('Judul'), 'Test complaint');
    await user.type(screen.getByLabelText('Deskripsi'), 'This is a valid complaint description');
    await user.click(screen.getByText('Kirim Komplain'));
    expect(await screen.findByText('Komplain berhasil dikirim')).toBeInTheDocument();
    expect(screen.getByText('Kembali ke daftar komplain')).toBeInTheDocument();
  });

  it('shows server error on failure', async () => {
    mockPost.mockRejectedValue(new Error('Gagal mengirim komplain'));
    const user = userEvent.setup();
    render(<ComplaintForm />);
    await user.type(screen.getByLabelText('ID Pesanan'), 'order1');
    await user.type(screen.getByLabelText('Judul'), 'Test complaint');
    await user.type(screen.getByLabelText('Deskripsi'), 'This is a valid complaint description');
    await user.click(screen.getByText('Kirim Komplain'));
    expect(await screen.findByText(/Gagal mengirim komplain/)).toBeInTheDocument();
  });
});
