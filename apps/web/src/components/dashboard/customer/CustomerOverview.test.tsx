import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { CustomerOverview } from './CustomerOverview';

const mockGet = vi.fn();

vi.mock('@specialist/shared', () => ({
  createBrowserClient: () => ({ get: mockGet }),
}));

beforeEach(() => {
  vi.clearAllMocks();
});

describe('CustomerOverview', () => {
  it('shows loading state initially', () => {
    mockGet.mockImplementation(() => new Promise(() => {}));
    render(<CustomerOverview />);
    expect(screen.getByText('Memuat...')).toBeInTheDocument();
  });

  it('shows stats when loaded', async () => {
    mockGet.mockResolvedValueOnce([
      { status: 'Working' },
      { status: 'Completed' },
      { status: 'Waiting Payment' },
      { status: 'Closed' },
    ]);
    mockGet.mockResolvedValueOnce([{ id: 'a1' }, { id: 'a2' }, { id: 'a3' }]);
    render(<CustomerOverview />);
    expect(await screen.findByText('Pesanan Aktif')).toBeInTheDocument();
    expect(screen.getAllByText('1')).toHaveLength(2);
    expect(screen.getByText('Selesai')).toBeInTheDocument();
    expect(screen.getByText('2')).toBeInTheDocument();
    expect(screen.getByText('Menunggu Pembayaran')).toBeInTheDocument();
    expect(screen.getByText('Alamat Tersimpan')).toBeInTheDocument();
    expect(screen.getByText('3')).toBeInTheDocument();
  });

  it('shows zero stats on API failure', async () => {
    mockGet.mockRejectedValue(new Error('Gagal'));
    render(<CustomerOverview />);
    expect(await screen.findByText('Pesanan Aktif')).toBeInTheDocument();
    expect(screen.getAllByText('0')).toHaveLength(4);
  });
});
