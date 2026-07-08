import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { CustomerAddresses } from './CustomerAddresses';

const mockGet = vi.fn();
const mockPost = vi.fn();
const mockPatch = vi.fn();
const mockDelete = vi.fn();

vi.mock('@specialist/shared', () => ({
  createBrowserClient: () => ({
    get: mockGet,
    post: mockPost,
    patch: mockPatch,
    delete: mockDelete,
  }),
}));

beforeEach(() => {
  vi.clearAllMocks();
});

describe('CustomerAddresses', () => {
  it('shows loading state initially', () => {
    mockGet.mockImplementation(() => new Promise(() => {}));
    render(<CustomerAddresses />);
    // Loading state renders skeleton shimmer (aria-hidden, no visible text)
    expect(screen.queryByText('Tambah Alamat')).not.toBeInTheDocument();
  });

  it('shows addresses list when loaded', async () => {
    mockGet.mockResolvedValue([
      {
        id: 'a1',
        label: 'Rumah',
        receiverName: 'John',
        receiverPhone: '08123456789',
        address: 'Jl. Merdeka No. 1',
        city: 'Jakarta Pusat',
        province: 'DKI Jakarta',
        postalCode: '10110',
        isDefault: true,
      },
      {
        id: 'a2',
        label: 'Kantor',
        receiverName: 'Jane',
        receiverPhone: '08198765432',
        address: 'Jl. Sudirman No. 10',
        city: 'Jakarta Selatan',
        province: 'DKI Jakarta',
        postalCode: '12120',
        isDefault: false,
      },
    ]);
    render(<CustomerAddresses />);
    expect(await screen.findByText('Rumah')).toBeInTheDocument();
    expect(screen.getByText('Kantor')).toBeInTheDocument();
    expect(
      screen.getByText((content) => content.includes('Jl. Merdeka No. 1')),
    ).toBeInTheDocument();
    expect(
      screen.getByText((content) => content.includes('Jl. Sudirman No. 10')),
    ).toBeInTheDocument();
  });

  it('shows empty state when no addresses', async () => {
    mockGet.mockResolvedValue([]);
    render(<CustomerAddresses />);
    expect(await screen.findByText('Belum ada alamat tersimpan')).toBeInTheDocument();
  });

  it('shows empty state on API error', async () => {
    mockGet.mockRejectedValue(new Error('Gagal'));
    render(<CustomerAddresses />);
    expect(await screen.findByText('Belum ada alamat tersimpan')).toBeInTheDocument();
  });
});
