import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { CorporateOverview } from './CorporateOverview';

const mockGet = vi.fn();

vi.mock('@ahlipanggilan/shared', () => ({
  createBrowserClient: () => ({ get: mockGet }),
}));

beforeEach(() => {
  vi.clearAllMocks();
});

describe('CorporateOverview', () => {
  it('shows loading state initially', () => {
    mockGet.mockImplementation(() => new Promise(() => {}));
    render(<CorporateOverview />);
    // Loading state renders Card + Skeleton components (aria-hidden, no visible text)
    expect(screen.queryByText('Perusahaan')).not.toBeInTheDocument();
  });

  it('shows company profile and stats when loaded', async () => {
    mockGet.mockResolvedValueOnce({
      id: 'co1',
      companyName: 'PT Maju Sejahtera',
      status: 'Verified',
      employeeCount: 250,
    });
    mockGet.mockResolvedValueOnce([
      { id: 'o1', status: 'Confirmed' },
      { id: 'o2', status: 'Working' },
      { id: 'o3', status: 'Waiting Payment' },
    ]);
    mockGet.mockResolvedValueOnce([
      { id: 'b1', name: 'Jakarta' },
      { id: 'b2', name: 'Bandung' },
    ]);
    render(<CorporateOverview />);
    expect(await screen.findByText('PT Maju Sejahtera')).toBeInTheDocument();
    expect(screen.getByText('Status: Verified')).toBeInTheDocument();
    expect(screen.getByText('Karyawan')).toBeInTheDocument();
    expect(screen.getByText('250')).toBeInTheDocument();
    expect(screen.getByText('Pesanan Aktif')).toBeInTheDocument();
    expect(screen.getByText('3')).toBeInTheDocument();
    expect(screen.getByText('Cabang')).toBeInTheDocument();
    expect(screen.getByText('2')).toBeInTheDocument();
  });

  it('filters out paid/closed/cancelled from active orders', async () => {
    mockGet.mockResolvedValueOnce({
      id: 'co1',
      companyName: 'Test Corp',
      status: 'Verified',
      employeeCount: 10,
    });
    mockGet.mockResolvedValueOnce([
      { id: 'o1', status: 'Confirmed' },
      { id: 'o2', status: 'Paid' },
      { id: 'o3', status: 'Closed' },
      { id: 'o4', status: 'Cancelled' },
      { id: 'o5', status: 'Working' },
    ]);
    mockGet.mockResolvedValueOnce([]);
    render(<CorporateOverview />);
    expect(await screen.findByText('2')).toBeInTheDocument(); // only Confirmed + Working
    expect(screen.queryByText('4')).not.toBeInTheDocument();
  });

  it('shows fallback when profile fetch fails', async () => {
    mockGet.mockRejectedValue(new Error('Gagal'));
    render(<CorporateOverview />);
    expect(await screen.findByText('Perusahaan')).toBeInTheDocument();
    expect(screen.getByText('Status: -')).toBeInTheDocument();
  });

  it('shows dash for null employeeCount', async () => {
    mockGet.mockResolvedValueOnce({
      id: 'co1',
      companyName: 'Test',
      status: 'Pending',
      employeeCount: null,
    });
    mockGet.mockResolvedValueOnce([]);
    mockGet.mockResolvedValueOnce([]);
    render(<CorporateOverview />);
    expect(await screen.findByText('-')).toBeInTheDocument();
  });
});
