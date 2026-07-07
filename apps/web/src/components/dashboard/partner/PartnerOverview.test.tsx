import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { PartnerOverview } from './PartnerOverview';

const mockGet = vi.fn();

vi.mock('@specialist/shared', () => ({
  createBrowserClient: () => ({ get: mockGet }),
}));

beforeEach(() => {
  vi.clearAllMocks();
});

describe('PartnerOverview', () => {
  it('shows loading state initially', () => {
    mockGet.mockImplementation(() => new Promise(() => {}));
    render(<PartnerOverview />);
    expect(screen.getByText('Memuat...')).toBeInTheDocument();
  });

  it('shows profile and stats when loaded', async () => {
    mockGet.mockResolvedValueOnce({
      fullName: 'Budi Partner',
      ratingAverage: '4.5',
      completedJobs: 12,
      availability: 'Available',
      verificationStatus: 'Verified',
    });
    mockGet.mockResolvedValueOnce([]);
    render(<PartnerOverview />);
    expect(await screen.findByText('Selamat datang, Budi Partner')).toBeInTheDocument();
    expect(screen.getByText('4.5 / 5.0')).toBeInTheDocument();
    expect(screen.getByText('12')).toBeInTheDocument();
    expect(screen.getByText('Available')).toBeInTheDocument();
    expect(screen.getByText('Verified')).toBeInTheDocument();
  });

  it('shows fallback when loading fails', async () => {
    mockGet.mockRejectedValue(new Error('Gagal'));
    render(<PartnerOverview />);
    expect(await screen.findByText('Gagal memuat profil')).toBeInTheDocument();
  });

  it('shows dash for no rating', async () => {
    mockGet.mockResolvedValueOnce({
      fullName: 'Budi',
      ratingAverage: null,
      completedJobs: 0,
      availability: 'Available',
      verificationStatus: 'Unverified',
    });
    mockGet.mockResolvedValueOnce([]);
    render(<PartnerOverview />);
    expect(await screen.findByText('-')).toBeInTheDocument();
  });
});
