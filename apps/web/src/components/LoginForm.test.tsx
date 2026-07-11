import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { LoginForm } from './LoginForm';

vi.mock('@ahlipanggilan/validation', () => ({
  loginSchema: {
    safeParse: (data: { email: string; password: string }) => {
      if (!data.email || !data.email.includes('@'))
        return {
          success: false,
          error: { issues: [{ path: ['email'], message: 'Invalid email address' }] },
        };
      return { success: true, data };
    },
  },
}));

vi.mock('@ahlipanggilan/ui', () => ({
  Button: ({
    children,
    onClick,
    type,
  }: {
    children: React.ReactNode;
    onClick?: () => void;
    type?: 'button' | 'submit' | 'reset';
  }) => (
    <button type={type ?? 'button'} onClick={onClick}>
      {children}
    </button>
  ),
}));

const mockPost = vi.fn();
const mockSetTokens = vi.fn();

vi.mock('../lib/auth.ts', () => ({
  getApiClient: () => ({
    post: mockPost,
    getTokenStore: () => ({ setTokens: mockSetTokens }),
  }),
  redirectToDashboard: vi.fn(),
}));

beforeEach(() => {
  vi.clearAllMocks();
});

describe('LoginForm', () => {
  it('renders email and password inputs', () => {
    render(<LoginForm />);
    expect(screen.getByLabelText('Email')).toBeInTheDocument();
    expect(screen.getByLabelText('Password')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Masuk' })).toBeInTheDocument();
  });

  it('shows validation errors for empty fields', () => {
    render(<LoginForm />);
    fireEvent.click(screen.getByRole('button', { name: 'Masuk' }));
    expect(screen.getByText('Invalid email address')).toBeInTheDocument();
  });

  it('shows loading state when submitting', async () => {
    mockPost.mockImplementation(() => new Promise(() => {})); // never resolves
    render(<LoginForm />);
    fireEvent.change(screen.getByLabelText('Email'), { target: { value: 'a@b.com' } });
    fireEvent.change(screen.getByLabelText('Password'), { target: { value: 'Str0ng!P1' } });
    fireEvent.click(screen.getByRole('button', { name: 'Masuk' }));
    expect(await screen.findByText('Memproses...')).toBeInTheDocument();
  });

  it('shows error message on API failure', async () => {
    mockPost.mockRejectedValue(new Error('Email atau password salah'));
    render(<LoginForm />);
    fireEvent.change(screen.getByLabelText('Email'), { target: { value: 'a@b.com' } });
    fireEvent.change(screen.getByLabelText('Password'), { target: { value: 'Str0ng!P1' } });
    fireEvent.click(screen.getByRole('button', { name: 'Masuk' }));
    expect(await screen.findByText('Email atau password salah')).toBeInTheDocument();
  });

  it('has link to forgot password', () => {
    render(<LoginForm />);
    expect(screen.getByText('Lupa password?')).toHaveAttribute('href', '/forgot-password');
  });

  it('has link to register', () => {
    render(<LoginForm />);
    expect(screen.getByText('Daftar')).toHaveAttribute('href', '/register');
  });
});
