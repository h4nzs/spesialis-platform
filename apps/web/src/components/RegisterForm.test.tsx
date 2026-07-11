import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { RegisterForm } from './RegisterForm';

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
  redirectToDashboard: vi.fn(),
}));

beforeEach(() => {
  vi.clearAllMocks();
});

describe('RegisterForm', () => {
  it('renders all form fields', () => {
    render(<RegisterForm />);
    expect(screen.getByLabelText('Nama Lengkap')).toBeInTheDocument();
    expect(screen.getByLabelText('Email')).toBeInTheDocument();
    expect(screen.getByLabelText('Nomor HP')).toBeInTheDocument();
    expect(screen.getByLabelText('Password')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Daftar' })).toBeInTheDocument();
  });

  it('shows validation errors for empty submit', () => {
    render(<RegisterForm />);
    fireEvent.click(screen.getByRole('button', { name: 'Daftar' }));
    expect(screen.getByText(/nama lengkap/i)).toBeInTheDocument();
  });

  it('shows loading state when submitting', () => {
    mockPost.mockImplementation(() => new Promise(() => {}));
    render(<RegisterForm />);
    fireEvent.change(screen.getByLabelText('Nama Lengkap'), { target: { value: 'User A' } });
    fireEvent.change(screen.getByLabelText('Email'), { target: { value: 'a@b.com' } });
    fireEvent.change(screen.getByLabelText('Nomor HP'), { target: { value: '08123456789' } });
    fireEvent.change(screen.getByLabelText('Password'), { target: { value: 'Str0ng!P1' } });
    fireEvent.click(screen.getByRole('button', { name: 'Daftar' }));
    expect(screen.getByText('Memproses...')).toBeInTheDocument();
  });

  it('shows error on API failure', async () => {
    mockPost.mockRejectedValue(new Error('Email sudah terdaftar'));
    render(<RegisterForm />);
    fireEvent.change(screen.getByLabelText('Nama Lengkap'), { target: { value: 'User A' } });
    fireEvent.change(screen.getByLabelText('Email'), { target: { value: 'a@b.com' } });
    fireEvent.change(screen.getByLabelText('Nomor HP'), { target: { value: '08123456789' } });
    fireEvent.change(screen.getByLabelText('Password'), { target: { value: 'Str0ng!P1' } });
    fireEvent.click(screen.getByRole('button', { name: 'Daftar' }));
    expect(await screen.findByText('Email sudah terdaftar')).toBeInTheDocument();
  });

  it('has link to login', () => {
    render(<RegisterForm />);
    expect(screen.getByText('Masuk')).toHaveAttribute('href', '/login');
  });
});
