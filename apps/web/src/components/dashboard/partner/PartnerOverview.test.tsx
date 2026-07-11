import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { PartnerOverview } from './PartnerOverview';

vi.mock('@ahlipanggilan/ui', () => ({
  Card: ({ children, ..._props }: { children: React.ReactNode; [key: string]: unknown }) => (
    <div>{children}</div>
  ),
  Grid: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  Skeleton: () => <div aria-hidden="true" />,
  Badge: ({ children }: { children: React.ReactNode }) => <span>{children}</span>,
  Button: ({
    children,
    onClick,
    type,
  }: {
    children: React.ReactNode;
    onClick?: () => void;
    type?: string;
  }) => (
    <button type={type ?? 'button'} onClick={onClick}>
      {children}
    </button>
  ),
  EmptyState: ({ title, children }: { title?: string; children?: React.ReactNode }) => (
    <div>{title ?? children}</div>
  ),
}));

const mockGet = vi.fn();

vi.mock('@ahlipanggilan/shared', () => ({
  createBrowserClient: () => ({ get: mockGet }),
  SCHEMA_TEMPLATES: [],
}));

beforeEach(() => {
  vi.clearAllMocks();
});

describe('PartnerOverview', () => {
  it('shows loading state initially', () => {
    mockGet.mockImplementation(() => new Promise(() => {}));
    render(<PartnerOverview />);
    // Loading state renders Skeleton + Card components (aria-hidden, no visible text)
    expect(screen.queryByText('Selamat datang,')).not.toBeInTheDocument();
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
    expect(screen.getByText('Tersedia')).toBeInTheDocument();
    expect(screen.getByText('Verified')).toBeInTheDocument();
  });

  it('shows fallback when loading fails', async () => {
    mockGet.mockRejectedValue(new Error('Gagal'));
    render(<PartnerOverview />);
    expect(await screen.findByText('Gagal memuat profil mitra.')).toBeInTheDocument();
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
