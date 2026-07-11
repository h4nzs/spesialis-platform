import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ForgotPasswordForm } from './ForgotPasswordForm';

vi.mock('@ahlipanggilan/ui', () => ({
  Button: ({
    children,
    onClick,
    type,
  }: {
    children: React.ReactNode;
    onClick?: () => void;
    type?: string;
  }) => (
    <button type={type ?? 'button'} onClick={onClick}>
      {children}
    </button>
  ),
}));

const mockPost = vi.fn();

vi.mock('../lib/auth.ts', () => ({
  getApiClient: () => ({ post: mockPost }),
}));

beforeEach(() => {
  vi.clearAllMocks();
});

describe('ForgotPasswordForm', () => {
  it('renders email input and submit button', () => {
    render(<ForgotPasswordForm />);
    expect(screen.getByLabelText('Email')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Kirim Link Reset' })).toBeInTheDocument();
  });

  it('shows validation error for empty email', () => {
    render(<ForgotPasswordForm />);
    fireEvent.click(screen.getByRole('button', { name: 'Kirim Link Reset' }));
    expect(screen.getByText('Invalid email address')).toBeInTheDocument();
  });

  it('shows loading state when submitting', () => {
    mockPost.mockImplementation(() => new Promise(() => {}));
    render(<ForgotPasswordForm />);
    fireEvent.change(screen.getByLabelText('Email'), { target: { value: 'a@b.com' } });
    fireEvent.click(screen.getByRole('button', { name: 'Kirim Link Reset' }));
    expect(screen.getByText('Mengirim...')).toBeInTheDocument();
  });

  it('shows success message after submit', async () => {
    mockPost.mockResolvedValue(undefined);
    render(<ForgotPasswordForm />);
    fireEvent.change(screen.getByLabelText('Email'), { target: { value: 'a@b.com' } });
    fireEvent.click(screen.getByRole('button', { name: 'Kirim Link Reset' }));
    expect(await screen.findByText('Cek Email Anda')).toBeInTheDocument();
  });

  it('shows error on API failure', async () => {
    mockPost.mockRejectedValue(new Error('Gagal mengirim'));
    render(<ForgotPasswordForm />);
    fireEvent.change(screen.getByLabelText('Email'), { target: { value: 'a@b.com' } });
    fireEvent.click(screen.getByRole('button', { name: 'Kirim Link Reset' }));
    expect(await screen.findByText('Gagal mengirim')).toBeInTheDocument();
  });

  it('has link to login', () => {
    render(<ForgotPasswordForm />);
    expect(screen.getByText('Masuk')).toHaveAttribute('href', '/login');
  });
});
