import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { NotificationBell } from './NotificationBell';

const mockGet = vi.fn();
const mockPatch = vi.fn();

vi.mock('@ahlipanggilan/shared', () => ({
  createBrowserClient: () => ({ get: mockGet, patch: mockPatch }),
  formatDate: (d: string) => d,
}));

beforeEach(() => {
  vi.clearAllMocks();
});

describe('NotificationBell', () => {
  it('shows bell icon with no badge initially', async () => {
    mockGet.mockResolvedValue({ unread: 0 });
    render(<NotificationBell />);
    expect(screen.getByLabelText('Notifikasi')).toBeInTheDocument();
  });

  it('shows unread count badge', async () => {
    mockGet.mockResolvedValue({ unread: 5 });
    render(<NotificationBell />);
    expect(await screen.findByText('5')).toBeInTheDocument();
    expect(screen.getByLabelText('Notifikasi (5 belum dibaca)')).toBeInTheDocument();
  });

  it('shows 99+ for large unread count', async () => {
    mockGet.mockResolvedValue({ unread: 150 });
    render(<NotificationBell />);
    expect(await screen.findByText('99+')).toBeInTheDocument();
  });

  it('opens dropdown on click and fetches notifications', async () => {
    mockGet
      .mockResolvedValueOnce({ unread: 1 }) // 1st call: fetchUnread on mount
      .mockResolvedValueOnce({
        // 2nd call: fetchRecent after click
        data: [
          {
            id: 'n1',
            type: 'booking.confirmed',
            title: 'Booking Dikonfirmasi',
            message: 'Booking #SP-001 telah dikonfirmasi.',
            isRead: false,
            createdAt: '2026-07-15T10:00:00Z',
          },
        ],
      });
    render(<NotificationBell />);
    await screen.findByText('1');
    await userEvent.click(screen.getByLabelText('Notifikasi (1 belum dibaca)'));
    expect(await screen.findByText('Booking Dikonfirmasi')).toBeInTheDocument();
    expect(screen.getByText('Booking #SP-001 telah dikonfirmasi.')).toBeInTheDocument();
  });

  it('shows "Belum ada notifikasi" when empty', async () => {
    mockGet
      .mockResolvedValueOnce({ unread: 0 }) // 1st call: fetchUnread on mount
      .mockResolvedValueOnce({ data: [] }); // 2nd call: fetchRecent after click
    render(<NotificationBell />);
    await userEvent.click(screen.getByLabelText('Notifikasi'));
    expect(await screen.findByText('Belum ada notifikasi')).toBeInTheDocument();
  });

  it('shows "Tandai semua dibaca" when there are unread notifications', async () => {
    mockGet
      .mockResolvedValueOnce({ unread: 2 }) // 1st call: fetchUnread on mount
      .mockResolvedValueOnce({
        // 2nd call: fetchRecent after click
        data: [
          { id: 'n1', title: 'Notif 1', isRead: false, createdAt: '2026-07-15T10:00:00Z' },
          { id: 'n2', title: 'Notif 2', isRead: true, createdAt: '2026-07-15T11:00:00Z' },
        ],
      });
    render(<NotificationBell />);
    await screen.findByText('2'); // wait for badge to appear
    await userEvent.click(screen.getByLabelText('Notifikasi (2 belum dibaca)'));
    expect(await screen.findByText('Tandai semua dibaca')).toBeInTheDocument();
  });
});
