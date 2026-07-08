import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Sidebar } from './Sidebar';

vi.mock('../../lib/auth.ts', () => ({
  forceLogout: vi.fn(),
}));

beforeEach(() => {
  vi.clearAllMocks();
});

describe('Sidebar', () => {
  it('shows customer nav items', () => {
    render(<Sidebar role="customer" currentPath="/dashboard/customer" />);
    expect(screen.getByText('Ringkasan')).toBeInTheDocument();
    expect(screen.getByText('Pesanan')).toBeInTheDocument();
    expect(screen.getByText('Alamat')).toBeInTheDocument();
    expect(screen.getByText('Ulasan')).toBeInTheDocument();
    expect(screen.getByText('Komplain')).toBeInTheDocument();
    expect(screen.getByText('Pengaturan')).toBeInTheDocument();
    expect(screen.getByText('Keluar')).toBeInTheDocument();
  });

  it('shows partner nav items', () => {
    render(<Sidebar role="partner" currentPath="/dashboard/partner" />);
    expect(screen.getByText('Ringkasan')).toBeInTheDocument();
    expect(screen.getByText('Pekerjaan')).toBeInTheDocument();
    expect(screen.getByText('Ketersediaan')).toBeInTheDocument();
    expect(screen.getByText('Pendapatan')).toBeInTheDocument();
    expect(screen.getByText('Ulasan')).toBeInTheDocument();
    expect(screen.getByText('Pengaturan')).toBeInTheDocument();
    expect(screen.getByText('Keluar')).toBeInTheDocument();
  });

  it('shows admin nav items', () => {
    render(<Sidebar role="admin" currentPath="/dashboard/admin" />);
    expect(screen.getByText('Ringkasan')).toBeInTheDocument();
    expect(screen.getByText('Booking')).toBeInTheDocument();
    expect(screen.getByText('Partner')).toBeInTheDocument();
    expect(screen.getByText('Customer')).toBeInTheDocument();
    expect(screen.getByText('User')).toBeInTheDocument();
    expect(screen.getByText('Layanan')).toBeInTheDocument();
    expect(screen.getByText('Artikel')).toBeInTheDocument();
    expect(screen.getByText('Audit Log')).toBeInTheDocument();
    expect(screen.getByText('Laporan')).toBeInTheDocument();
    expect(screen.getByText('Keluar')).toBeInTheDocument();
  });

  it('shows corporate nav items', () => {
    render(<Sidebar role="corporate" currentPath="/dashboard/corporate" />);
    expect(screen.getByText('Ringkasan')).toBeInTheDocument();
    expect(screen.getByText('Pesanan')).toBeInTheDocument();
    expect(screen.getByText('Cabang')).toBeInTheDocument();
    expect(screen.getByText('Invoice')).toBeInTheDocument();
    expect(screen.getByText('Pengaturan')).toBeInTheDocument();
    expect(screen.getByText('Keluar')).toBeInTheDocument();
  });

  it('shows content_manager nav items', () => {
    render(<Sidebar role="content_manager" currentPath="/dashboard/admin" />);
    expect(screen.getByText('Ringkasan')).toBeInTheDocument();
    expect(screen.getByText('Artikel')).toBeInTheDocument();
    expect(screen.getByText('Layanan')).toBeInTheDocument();
    expect(screen.getByText('Pengaturan')).toBeInTheDocument();
  });

  it('highlights active nav item', () => {
    render(<Sidebar role="customer" currentPath="/dashboard/customer/orders" />);
    const pesananLink = screen.getByText('Pesanan');
    expect(pesananLink.closest('a')).toHaveClass('text-primary-700');
  });

  it('href attribute points to correct dashboard paths', () => {
    render(<Sidebar role="admin" currentPath="/dashboard/admin" />);
    expect(screen.getByText('Booking').closest('a')).toHaveAttribute(
      'href',
      '/dashboard/admin/bookings',
    );
    expect(screen.getByText('Partner').closest('a')).toHaveAttribute(
      'href',
      '/dashboard/admin/partners',
    );
  });
});
