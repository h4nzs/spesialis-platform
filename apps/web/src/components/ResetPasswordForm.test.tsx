import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ResetPasswordForm } from './ResetPasswordForm';

const mockPost = vi.fn();

vi.mock('../lib/auth.ts', () => ({
  getApiClient: () => ({ post: mockPost }),
}));

beforeEach(() => {
  vi.clearAllMocks();
});

const TOKEN = 'test-reset-token';

describe('ResetPasswordForm', () => {
  it('renders password inputs', () => {
    render(<ResetPasswordForm token={TOKEN} />);
    expect(screen.getByLabelText('Password Baru')).toBeInTheDocument();
    expect(screen.getByLabelText('Konfirmasi Password')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Reset Password' })).toBeInTheDocument();
  });

  it('shows error when passwords do not match', () => {
    render(<ResetPasswordForm token={TOKEN} />);
    fireEvent.change(screen.getByLabelText('Password Baru'), { target: { value: 'Str0ng!P1' } });
    fireEvent.change(screen.getByLabelText('Konfirmasi Password'), {
      target: { value: 'Different' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Reset Password' }));
    expect(screen.getByText('Password tidak cocok')).toBeInTheDocument();
  });

  it('shows validation error for weak password', () => {
    render(<ResetPasswordForm token={TOKEN} />);
    fireEvent.change(screen.getByLabelText('Password Baru'), { target: { value: '123' } });
    fireEvent.change(screen.getByLabelText('Konfirmasi Password'), { target: { value: '123' } });
    fireEvent.click(screen.getByRole('button', { name: 'Reset Password' }));
    expect(screen.getByText('Password minimal 8 karakter')).toBeInTheDocument();
  });

  it('shows loading state when submitting', () => {
    mockPost.mockImplementation(() => new Promise(() => {}));
    render(<ResetPasswordForm token={TOKEN} />);
    fireEvent.change(screen.getByLabelText('Password Baru'), { target: { value: 'Str0ng!P1' } });
    fireEvent.change(screen.getByLabelText('Konfirmasi Password'), {
      target: { value: 'Str0ng!P1' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Reset Password' }));
    expect(screen.getByText('Menyimpan...')).toBeInTheDocument();
  });

  it('shows success message after submit', async () => {
    mockPost.mockResolvedValue(undefined);
    render(<ResetPasswordForm token={TOKEN} />);
    fireEvent.change(screen.getByLabelText('Password Baru'), { target: { value: 'Str0ng!P1' } });
    fireEvent.change(screen.getByLabelText('Konfirmasi Password'), {
      target: { value: 'Str0ng!P1' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Reset Password' }));
    expect(await screen.findByText('Password Berhasil Diubah')).toBeInTheDocument();
  });

  it('shows error on API failure', async () => {
    mockPost.mockRejectedValue(new Error('Token tidak valid'));
    render(<ResetPasswordForm token={TOKEN} />);
    fireEvent.change(screen.getByLabelText('Password Baru'), { target: { value: 'Str0ng!P1' } });
    fireEvent.change(screen.getByLabelText('Konfirmasi Password'), {
      target: { value: 'Str0ng!P1' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Reset Password' }));
    expect(await screen.findByText('Token tidak valid')).toBeInTheDocument();
  });
});
