import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { ComplaintForm } from './ComplaintForm';

const mockPost = vi.fn();

vi.mock('@ahlipanggilan/shared', () => ({
  createBrowserClient: () => ({ post: mockPost }),
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
  }: {
    label: string;
    value: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    placeholder?: string;
  }) => (
    <div>
      <label htmlFor={label}>{label}</label>
      <input id={label} value={value} onChange={onChange} placeholder={placeholder} />
    </div>
  ),
  Textarea: ({
    label,
    value,
    onChange,
    placeholder,
  }: {
    label: string;
    value: string;
    onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
    placeholder?: string;
  }) => (
    <div>
      <label htmlFor={label}>{label}</label>
      <textarea id={label} value={value} onChange={onChange} placeholder={placeholder} />
    </div>
  ),
  Card: ({ children, padding: _padding }: { children: React.ReactNode; padding?: string }) => (
    <div>{children}</div>
  ),
}));

vi.mock('@ahlipanggilan/validation', () => ({
  createComplaintSchema: {
    safeParse: (data: unknown) => {
      const d = data as { orderId: string; title: string; description: string };
      if (!d.orderId)
        return { success: false, error: { issues: [{ message: 'Order ID wajib diisi' }] } };
      if (!d.title)
        return { success: false, error: { issues: [{ message: 'Judul wajib diisi' }] } };
      if (!d.description || d.description.length < 10)
        return {
          success: false,
          error: { issues: [{ message: 'Deskripsi minimal 10 karakter' }] },
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
