import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { AdminReports } from './AdminReports';

const mockGet = vi.fn();

vi.mock('@ahlipanggilan/shared', () => ({
  createBrowserClient: () => ({ get: mockGet }),
  formatCurrency: (n: number) => `Rp${n.toLocaleString('id-ID')}`,
  SCHEMA_TEMPLATES: [],
}));

beforeEach(() => {
  vi.clearAllMocks();
});

function makeReportData() {
  return {
    summary: {
      totalOrders: 150,
      totalPartners: 25,
      avgRating: '4.5',
      totalCompletedJobs: 320,
    },
    revenueByMonth: [
      { month: '2026-07', order_count: 12, revenue: '15000000' },
      { month: '2026-08', order_count: 18, revenue: '22000000' },
    ],
    ordersByStatus: [
      { status: 'Completed', count: 45 },
      { status: 'Working', count: 12 },
    ],
    ordersByDay: [
      { day: 'Sen', count: 8 },
      { day: 'Sel', count: 12 },
    ],
    topServices: [
      { name: 'Service A', slug: 'service-a', category: 'Category 1', order_count: 30 },
    ],
  };
}

describe('AdminReports', () => {
  it('shows loading state initially', () => {
    mockGet.mockImplementation(() => new Promise(() => {}));
    render(<AdminReports />);
    // Loading state renders skeleton shimmer (aria-hidden, no visible text)
    expect(screen.queryByText('Total Pesanan')).not.toBeInTheDocument();
  });

  it('shows summary cards when loaded', async () => {
    mockGet.mockResolvedValue(makeReportData());
    render(<AdminReports />);
    expect(await screen.findByText('150')).toBeInTheDocument();
    expect(screen.getByText('25')).toBeInTheDocument();
    expect(screen.getByText('4.5')).toBeInTheDocument();
    expect(screen.getByText('320')).toBeInTheDocument();
  });

  it('shows revenue bar chart by default', async () => {
    mockGet.mockResolvedValue(makeReportData());
    render(<AdminReports />);
    expect(await screen.findByText('Pendapatan per Bulan (12 Bulan Terakhir)')).toBeInTheDocument();
    expect(screen.getByText('Jul 2026')).toBeInTheDocument();
    expect(screen.getByText('Agu 2026')).toBeInTheDocument();
  });

  it('switches to orders tab', async () => {
    const user = userEvent.setup();
    mockGet.mockResolvedValue(makeReportData());
    render(<AdminReports />);
    expect(await screen.findByText('Pendapatan')).toBeInTheDocument();
    await user.click(screen.getByText('Pesanan'));
    expect(screen.getByText('Status Pesanan')).toBeInTheDocument();
    expect(screen.getByText('Pesanan per Hari (30 Hari Terakhir)')).toBeInTheDocument();
  });

  it('switches to services tab and shows table', async () => {
    const user = userEvent.setup();
    mockGet.mockResolvedValue(makeReportData());
    render(<AdminReports />);
    expect(await screen.findByText('Pendapatan')).toBeInTheDocument();
    await user.click(screen.getByText('Layanan'));
    expect(screen.getByText('10 Layanan Terpopuler')).toBeInTheDocument();
    expect(screen.getByText('Service A')).toBeInTheDocument();
    expect(screen.getByText('Category 1')).toBeInTheDocument();
  });

  it('shows empty state on API error', async () => {
    mockGet.mockRejectedValue(new Error('Gagal'));
    render(<AdminReports />);
    expect(await screen.findByText('Gagal memuat data laporan.')).toBeInTheDocument();
  });

  it('shows empty data messages when arrays are empty', async () => {
    const user = userEvent.setup();
    mockGet.mockResolvedValue({
      summary: { totalOrders: 0, totalPartners: 0, avgRating: '0', totalCompletedJobs: 0 },
      revenueByMonth: [],
      ordersByStatus: [],
      ordersByDay: [],
      topServices: [],
    });
    render(<AdminReports />);
    expect(await screen.findByText('Belum ada data pendapatan')).toBeInTheDocument();
    await user.click(screen.getByText('Pesanan'));
    expect(await screen.findByText('Status Pesanan')).toBeInTheDocument();
    expect(screen.getAllByText('Belum ada data pesanan').length).toBeGreaterThanOrEqual(1);
    await user.click(screen.getByText('Layanan'));
    expect(await screen.findByText('Belum ada data layanan')).toBeInTheDocument();
  });
});
