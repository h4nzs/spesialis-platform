import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ServiceList } from './ServiceList';

const mockGet = vi.fn();

vi.mock('@ahlipanggilan/shared', () => ({
  createBrowserClient: () => ({ get: mockGet }),
  formatCurrency: (n: number) => `Rp${n.toLocaleString('id-ID')}`,
  SCHEMA_TEMPLATES: [],
}));

beforeEach(() => {
  vi.clearAllMocks();
});

describe('ServiceList', () => {
  it('shows loading skeleton initially', () => {
    mockGet.mockImplementation(() => new Promise(() => {}));
    const { container } = render(<ServiceList />);
    expect(container.querySelector('.animate-pulse')).toBeInTheDocument();
  });

  it('shows services when loaded', async () => {
    mockGet.mockResolvedValue([
      {
        id: '1',
        name: 'AC Service',
        slug: 'ac-service',
        shortDescription: 'Service AC',
        basePrice: '150000',
        estimatedDuration: 60,
        thumbnail: null,
      },
    ]);
    render(<ServiceList />);
    expect(await screen.findByText('AC Service')).toBeInTheDocument();
    expect(await screen.findByText('Service AC')).toBeInTheDocument();
  });

  it('shows error state on API failure', async () => {
    mockGet.mockRejectedValue(new Error('Gagal memuat layanan'));
    render(<ServiceList />);
    expect(await screen.findByText('Gagal memuat layanan')).toBeInTheDocument();
  });

  it('shows empty state when no services', async () => {
    mockGet.mockResolvedValue([]);
    render(<ServiceList />);
    expect(await screen.findByText('Belum ada layanan tersedia')).toBeInTheDocument();
  });
});
