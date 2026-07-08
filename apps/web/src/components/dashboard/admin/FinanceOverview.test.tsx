import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { FinanceOverview } from './FinanceOverview';

const { mockGet, mockDownloadCSV } = vi.hoisted(() => ({
  mockGet: vi.fn(),
  mockDownloadCSV: vi.fn(),
}));

vi.mock('@specialist/shared', () => ({
  createBrowserClient: () => ({ get: mockGet }),
  formatCurrency: (n: number) => {
    const rounded = Math.round(n);
    const formatted = rounded.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
    return `Rp${formatted}`;
  },
  downloadCSV: mockDownloadCSV,
}));

vi.mock('@specialist/ui', () => ({
  Card: ({ children, padding: _padding }: { children: React.ReactNode; padding?: string }) => (
    <div>{children}</div>
  ),
}));

beforeEach(() => {
  vi.clearAllMocks();
});

describe('FinanceOverview', () => {
  it('shows loading state initially', () => {
    mockGet.mockImplementation(() => new Promise(() => {}));
    render(<FinanceOverview />);
    expect(screen.getByText('Memuat...')).toBeInTheDocument();
  });

  describe('CSV export', () => {
    beforeEach(() => {
      mockGet.mockResolvedValue({
        revenueByMonth: [
          { month: '2026-06', order_count: 15, revenue: 1500000 },
          { month: '2026-07', order_count: 22, revenue: 2200000 },
        ],
        totalRevenue: 3700000,
        growthPercent: 46.67,
        monthsCount: 2,
      });
    });

    it('renders Export CSV button when data loaded', async () => {
      render(<FinanceOverview />);
      expect(await screen.findByText('Export CSV')).toBeInTheDocument();
    });

    it('does not render Export CSV button when no revenue data', async () => {
      mockGet.mockReset();
      mockGet.mockResolvedValue({
        revenueByMonth: [],
        totalRevenue: 0,
        growthPercent: null,
        monthsCount: 0,
      });
      render(<FinanceOverview />);
      await waitFor(() => {
        expect(screen.queryByText('Export CSV')).not.toBeInTheDocument();
      });
    });

    it('calls downloadCSV with correct data on click', async () => {
      const user = userEvent.setup();
      render(<FinanceOverview />);
      expect(await screen.findByText('Export CSV')).toBeInTheDocument();

      await user.click(screen.getByText('Export CSV'));

      expect(mockDownloadCSV).toHaveBeenCalledTimes(1);
      expect(mockDownloadCSV).toHaveBeenCalledWith(
        ['Bulan', 'Pesanan', 'Pendapatan'],
        [
          ['Jun 2026', '15', '1500000.00'],
          ['Jul 2026', '22', '2200000.00'],
        ],
        'pendapatan-12bln.csv',
      );
    });
  });
});
