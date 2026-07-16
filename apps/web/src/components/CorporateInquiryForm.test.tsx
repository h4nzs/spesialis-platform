import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { CorporateInquiryForm } from './CorporateInquiryForm';

const mockPost = vi.fn();

vi.mock('@ahlipanggilan/shared', () => ({
  createBrowserClient: () => ({ post: mockPost }),
  SCHEMA_TEMPLATES: [],
}));

beforeEach(() => {
  vi.clearAllMocks();
});

const fillRequiredFields = () => {
  fireEvent.change(screen.getByLabelText('Nama Perusahaan'), { target: { value: 'PT Maju' } });
  fireEvent.change(screen.getByLabelText('Email'), { target: { value: 'a@b.com' } });
  fireEvent.change(screen.getByLabelText('Nomor HP'), { target: { value: '08123456789' } });
  // Pilih opsi dropdown jumlah karyawan
  fireEvent.change(screen.getByLabelText('Jumlah Karyawan'), {
    target: { value: '10-50' },
  });
  fireEvent.change(screen.getByLabelText('Buat Password'), { target: { value: 'Str0ng!P1' } });
};

describe('CorporateInquiryForm', () => {
  it('renders all form fields', () => {
    render(<CorporateInquiryForm />);
    expect(screen.getByLabelText('Nama Perusahaan')).toBeInTheDocument();
    expect(screen.getByLabelText('Email')).toBeInTheDocument();
    expect(screen.getByLabelText('Nomor HP')).toBeInTheDocument();
    expect(screen.getByLabelText('Jumlah Karyawan')).toBeInTheDocument();
    expect(screen.getByLabelText('Buat Password')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Daftar' })).toBeInTheDocument();
    // Pastikan legalName tidak ada
    expect(screen.queryByLabelText('Nama Legal (sesuai akta)')).not.toBeInTheDocument();
  });

  it('shows validation errors for empty submit', () => {
    render(<CorporateInquiryForm />);
    fireEvent.click(screen.getByRole('button', { name: 'Daftar' }));
    expect(screen.getByText(/nama perusahaan/i)).toBeInTheDocument();
  });

  it('shows loading state when submitting', () => {
    mockPost.mockImplementation(() => new Promise(() => {}));
    render(<CorporateInquiryForm />);
    fillRequiredFields();
    fireEvent.click(screen.getByRole('button', { name: 'Daftar' }));
    expect(screen.getByText('Mengirim...')).toBeInTheDocument();
  });

  it('shows success after submission', async () => {
    mockPost.mockResolvedValue(undefined);
    render(<CorporateInquiryForm />);
    fillRequiredFields();
    fireEvent.click(screen.getByRole('button', { name: 'Daftar' }));
    expect(await screen.findByText('Pendaftaran Terkirim!')).toBeInTheDocument();
  });

  it('shows API error on failure', async () => {
    mockPost.mockRejectedValue(new Error('Gagal mengirim'));
    render(<CorporateInquiryForm />);
    fillRequiredFields();
    fireEvent.click(screen.getByRole('button', { name: 'Daftar' }));
    expect(await screen.findByText('Gagal mengirim. Silakan coba lagi.')).toBeInTheDocument();
  });
});
