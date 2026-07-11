import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { PartnerJobs } from './PartnerJobs';

const mockGet = vi.fn();
const mockPost = vi.fn();

vi.mock('@ahlipanggilan/shared', () => ({
  createBrowserClient: () => ({ get: mockGet, post: mockPost }),
  formatDate: (d: string) => d,
  getStatusLabel: (s: string) => s,
  SCHEMA_TEMPLATES: [],
}));

beforeEach(() => {
  vi.clearAllMocks();
});

describe('PartnerJobs', () => {
  it('shows loading state initially', () => {
    mockGet.mockImplementation(() => new Promise(() => {}));
    render(<PartnerJobs />);
    // Loading state renders Skeleton components (aria-hidden, no visible text)
    // Data elements should not be present during loading
    expect(screen.queryByText('Belum ada pekerjaan')).not.toBeInTheDocument();
  });

  it('shows jobs with action buttons when loaded', async () => {
    mockGet.mockResolvedValue([
      {
        id: 'j1',
        orderId: 'o1',
        status: 'Assigned',
        assignedAt: '2026-07-15T10:00:00Z',
        acceptedAt: null,
        completedAt: null,
        orderStatus: 'Partner Assigned',
        bookingNumber: 'SP-2026-00001',
      },
    ]);
    render(<PartnerJobs />);
    expect(await screen.findByText('SP-2026-00001')).toBeInTheDocument();
    expect(screen.getByText('Terima')).toBeInTheDocument();
    expect(screen.getByText('Tolak')).toBeInTheDocument();
  });

  it('shows "Dalam Perjalanan" button for Partner Accepted status', async () => {
    mockGet.mockResolvedValue([
      {
        id: 'j2',
        orderId: 'o2',
        status: 'Accepted',
        assignedAt: '2026-07-15T10:00:00Z',
        acceptedAt: '2026-07-15T11:00:00Z',
        completedAt: null,
        orderStatus: 'Partner Accepted',
        bookingNumber: 'SP-2026-00002',
      },
    ]);
    render(<PartnerJobs />);
    expect(await screen.findByText('Dalam Perjalanan')).toBeInTheDocument();
  });

  it('shows "Mulai" button for On The Way status', async () => {
    mockGet.mockResolvedValue([
      {
        id: 'j3',
        orderId: 'o3',
        status: 'OnTheWay',
        assignedAt: '2026-07-15T10:00:00Z',
        acceptedAt: null,
        completedAt: null,
        orderStatus: 'On The Way',
        bookingNumber: 'SP-2026-00003',
      },
    ]);
    render(<PartnerJobs />);
    expect(await screen.findByText('Mulai')).toBeInTheDocument();
  });

  it('shows "Selesaikan" button for Working status', async () => {
    mockGet.mockResolvedValue([
      {
        id: 'j4',
        orderId: 'o4',
        status: 'Working',
        assignedAt: '2026-07-15T10:00:00Z',
        acceptedAt: null,
        completedAt: null,
        orderStatus: 'Working',
        bookingNumber: 'SP-2026-00004',
      },
    ]);
    render(<PartnerJobs />);
    expect(await screen.findByText('Selesaikan')).toBeInTheDocument();
  });

  it('shows empty state when no jobs', async () => {
    mockGet.mockResolvedValue([]);
    render(<PartnerJobs />);
    expect(await screen.findByText('Belum ada pekerjaan')).toBeInTheDocument();
  });

  it('shows empty state on API error', async () => {
    mockGet.mockRejectedValue(new Error('Gagal'));
    render(<PartnerJobs />);
    expect(await screen.findByText('Belum ada pekerjaan')).toBeInTheDocument();
  });
});
