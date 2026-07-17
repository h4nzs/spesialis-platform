import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { PartnerRegistrationForm } from './PartnerRegistrationForm';

const mockPost = vi.fn();

vi.mock('@ahlipanggilan/shared', () => ({
  createBrowserClient: () => ({
    post: mockPost,
    get: vi.fn().mockResolvedValue([]),
  }),
  parseApiError: (err: unknown, fallback?: string) => {
    if (err instanceof Error) return { fieldErrors: {}, generalError: err.message };
    return { fieldErrors: {}, generalError: fallback ?? 'Terjadi kesalahan' };
  },
  SCHEMA_TEMPLATES: [],
}));

beforeEach(() => {
  vi.clearAllMocks();
});

describe('PartnerRegistrationForm', () => {
  it('renders all form fields', () => {
    render(<PartnerRegistrationForm />);
    expect(screen.getByLabelText('Nama Lengkap')).toBeInTheDocument();
    expect(screen.getByLabelText('Email')).toBeInTheDocument();
    expect(screen.getByLabelText('Nomor HP')).toBeInTheDocument();
    expect(screen.getByLabelText('Nomor KTP')).toBeInTheDocument();
    expect(screen.getByLabelText('Password')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Daftar sebagai Mitra' })).toBeInTheDocument();
  });

  it('shows validation errors for empty submit', () => {
    render(<PartnerRegistrationForm />);
    fireEvent.click(screen.getByRole('button', { name: 'Daftar sebagai Mitra' }));
    expect(screen.getByText(/nama lengkap/i)).toBeInTheDocument();
  });

  it('shows loading state when submitting', () => {
    mockPost.mockImplementation(() => new Promise(() => {}));
    render(<PartnerRegistrationForm />);
    fireEvent.change(screen.getByLabelText('Nama Lengkap'), { target: { value: 'Partner A' } });
    fireEvent.change(screen.getByLabelText('Email'), { target: { value: 'a@b.com' } });
    fireEvent.change(screen.getByLabelText('Nomor HP'), { target: { value: '08123456789' } });
    fireEvent.change(screen.getByLabelText('Nomor KTP'), { target: { value: '1234567890123456' } });
    fireEvent.change(screen.getByLabelText('Password'), { target: { value: 'Str0ng!P1' } });
    fireEvent.click(screen.getByRole('button', { name: 'Daftar sebagai Mitra' }));
    expect(screen.getByText('Mendaftarkan...')).toBeInTheDocument();
  });

  it('shows success after submission', async () => {
    mockPost.mockResolvedValue(undefined);
    render(<PartnerRegistrationForm />);
    fireEvent.change(screen.getByLabelText('Nama Lengkap'), { target: { value: 'Partner A' } });
    fireEvent.change(screen.getByLabelText('Email'), { target: { value: 'a@b.com' } });
    fireEvent.change(screen.getByLabelText('Nomor HP'), { target: { value: '08123456789' } });
    fireEvent.change(screen.getByLabelText('Nomor KTP'), { target: { value: '1234567890123456' } });
    fireEvent.change(screen.getByLabelText('Password'), { target: { value: 'Str0ng!P1' } });
    fireEvent.click(screen.getByRole('button', { name: 'Daftar sebagai Mitra' }));
    expect(await screen.findByText('Registrasi Berhasil!')).toBeInTheDocument();
  });

  it('shows API error on failure', async () => {
    mockPost.mockRejectedValue(new Error('Email sudah terdaftar'));
    render(<PartnerRegistrationForm />);
    fireEvent.change(screen.getByLabelText('Nama Lengkap'), { target: { value: 'Partner A' } });
    fireEvent.change(screen.getByLabelText('Email'), { target: { value: 'a@b.com' } });
    fireEvent.change(screen.getByLabelText('Nomor HP'), { target: { value: '08123456789' } });
    fireEvent.change(screen.getByLabelText('Nomor KTP'), { target: { value: '1234567890123456' } });
    fireEvent.change(screen.getByLabelText('Password'), { target: { value: 'Str0ng!P1' } });
    fireEvent.click(screen.getByRole('button', { name: 'Daftar sebagai Mitra' }));
    expect(await screen.findByText('Email sudah terdaftar')).toBeInTheDocument();
  });
});
