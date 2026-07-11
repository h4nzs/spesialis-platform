import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { CorporateInquiryForm } from './CorporateInquiryForm';

const mockPost = vi.fn();

vi.mock('@ahlipanggilan/shared', () => ({
  createBrowserClient: () => ({ post: mockPost }),
}));

beforeEach(() => {
  vi.clearAllMocks();
});

describe('CorporateInquiryForm', () => {
  it('renders all form fields', () => {
    render(<CorporateInquiryForm />);
    expect(screen.getByLabelText('Nama Perusahaan')).toBeInTheDocument();
    expect(screen.getByLabelText('Nama Legal (sesuai akta)')).toBeInTheDocument();
    expect(screen.getByLabelText('Email')).toBeInTheDocument();
    expect(screen.getByLabelText('Nomor HP')).toBeInTheDocument();
    expect(screen.getByLabelText('Buat Password')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Daftar' })).toBeInTheDocument();
  });

  it('shows validation errors for empty submit', () => {
    render(<CorporateInquiryForm />);
    fireEvent.click(screen.getByRole('button', { name: 'Daftar' }));
    expect(screen.getByText(/nama perusahaan/i)).toBeInTheDocument();
  });

  it('shows loading state when submitting', () => {
    mockPost.mockImplementation(() => new Promise(() => {}));
    render(<CorporateInquiryForm />);
    fireEvent.change(screen.getByLabelText('Nama Perusahaan'), { target: { value: 'PT Maju' } });
    fireEvent.change(screen.getByLabelText('Nama Legal (sesuai akta)'), {
      target: { value: 'PT Maju Sejahtera' },
    });
    fireEvent.change(screen.getByLabelText('Email'), { target: { value: 'a@b.com' } });
    fireEvent.change(screen.getByLabelText('Nomor HP'), { target: { value: '08123456789' } });
    fireEvent.change(screen.getByLabelText('Buat Password'), { target: { value: 'Str0ng!P1' } });
    fireEvent.click(screen.getByRole('button', { name: 'Daftar' }));
    expect(screen.getByText('Mengirim...')).toBeInTheDocument();
  });

  it('shows success after submission', async () => {
    mockPost.mockResolvedValue(undefined);
    render(<CorporateInquiryForm />);
    fireEvent.change(screen.getByLabelText('Nama Perusahaan'), { target: { value: 'PT Maju' } });
    fireEvent.change(screen.getByLabelText('Nama Legal (sesuai akta)'), {
      target: { value: 'PT Maju Sejahtera' },
    });
    fireEvent.change(screen.getByLabelText('Email'), { target: { value: 'a@b.com' } });
    fireEvent.change(screen.getByLabelText('Nomor HP'), { target: { value: '08123456789' } });
    fireEvent.change(screen.getByLabelText('Buat Password'), { target: { value: 'Str0ng!P1' } });
    fireEvent.click(screen.getByRole('button', { name: 'Daftar' }));
    expect(await screen.findByText('Pendaftaran Terkirim!')).toBeInTheDocument();
  });

  it('shows API error on failure', async () => {
    mockPost.mockRejectedValue(new Error('Gagal mengirim'));
    render(<CorporateInquiryForm />);
    fireEvent.change(screen.getByLabelText('Nama Perusahaan'), { target: { value: 'PT Maju' } });
    fireEvent.change(screen.getByLabelText('Nama Legal (sesuai akta)'), {
      target: { value: 'PT Maju Sejahtera' },
    });
    fireEvent.change(screen.getByLabelText('Email'), { target: { value: 'a@b.com' } });
    fireEvent.change(screen.getByLabelText('Nomor HP'), { target: { value: '08123456789' } });
    fireEvent.change(screen.getByLabelText('Buat Password'), { target: { value: 'Str0ng!P1' } });
    fireEvent.click(screen.getByRole('button', { name: 'Daftar' }));
    expect(await screen.findByText('Gagal mengirim. Silakan coba lagi.')).toBeInTheDocument();
  });
});
