import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { TrackingForm } from './TrackingForm';

const mockGet = vi.fn();

vi.mock('@specialist/shared', () => ({
  createBrowserClient: () => ({ get: mockGet }),
  formatCurrency: (n: number) => `Rp${n.toLocaleString('id-ID')}`,
  getStatusLabel: (s: string) => s,
  getStatusColor: () => 'default',
}));

beforeEach(() => {
  vi.clearAllMocks();
});

describe('TrackingForm', () => {
  it('renders input and search button', () => {
    render(<TrackingForm />);
    expect(screen.getByPlaceholderText('Contoh: SP-2026-000001')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Lacak' })).toBeInTheDocument();
  });

  it('disables button when input is empty', () => {
    render(<TrackingForm />);
    expect(screen.getByRole('button', { name: 'Lacak' })).toBeDisabled();
  });

  it('enables button when input has text', () => {
    render(<TrackingForm />);
    fireEvent.change(screen.getByPlaceholderText('Contoh: SP-2026-000001'), {
      target: { value: 'SP-2026-000001' },
    });
    expect(screen.getByRole('button', { name: 'Lacak' })).not.toBeDisabled();
  });

  it('shows loading state while searching', () => {
    mockGet.mockImplementation(() => new Promise(() => {}));
    render(<TrackingForm />);
    fireEvent.change(screen.getByPlaceholderText('Contoh: SP-2026-000001'), {
      target: { value: 'SP-2026-000001' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Lacak' }));
    expect(screen.getByText('Mencari...')).toBeInTheDocument();
  });

  it('shows error when booking not found', async () => {
    mockGet.mockRejectedValue(new Error('Booking tidak ditemukan'));
    render(<TrackingForm />);
    fireEvent.change(screen.getByPlaceholderText('Contoh: SP-2026-000001'), {
      target: { value: 'SP-2026-000001' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Lacak' }));
    expect(await screen.findByText('Booking tidak ditemukan')).toBeInTheDocument();
  });

  it('shows booking result when found', async () => {
    mockGet.mockResolvedValue({
      bookingNumber: 'SP-2026-000001',
      status: 'Confirmed',
      bookingDate: '2026-07-15',
      bookingTime: '10:00',
      basePrice: 150000,
      finalPrice: null,
      notes: null,
      createdAt: new Date().toISOString(),
      timeline: [
        { fromStatus: null, toStatus: 'Pending Confirmation', createdAt: new Date().toISOString() },
      ],
    });
    render(<TrackingForm />);
    fireEvent.change(screen.getByPlaceholderText('Contoh: SP-2026-000001'), {
      target: { value: 'SP-2026-000001' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Lacak' }));
    expect(await screen.findByText('SP-2026-000001')).toBeInTheDocument();
    expect(await screen.findByText('Confirmed')).toBeInTheDocument();
  });
});
