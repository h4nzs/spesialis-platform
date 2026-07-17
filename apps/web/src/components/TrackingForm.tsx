import { useState } from 'react';
import { Button, Badge } from '@ahlipanggilan/ui';
import {
  createBrowserClient,
  formatCurrency,
  getStatusLabel,
  getStatusColor,
  parseApiError,
} from '@ahlipanggilan/shared';
import type { OrderStatus } from '@ahlipanggilan/types';

interface TimelineEntry {
  fromStatus: OrderStatus | null;
  toStatus: OrderStatus;
  createdAt: string;
}

interface TrackingResult {
  id: string;
  bookingNumber: string;
  status: OrderStatus;
  bookingDate: string;
  bookingTime: string;
  basePrice: number;
  finalPrice: number | null;
  notes: string | null;
  createdAt: string;
  timeline: TimelineEntry[];
}

export function TrackingForm() {
  const api = createBrowserClient();
  const [bookingNumber, setBookingNumber] = useState('');
  const [result, setResult] = useState<TrackingResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e: React.SyntheticEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!bookingNumber.trim()) return;

    setLoading(true);
    setError('');
    setResult(null);

    try {
      const data = await api.get<TrackingResult>(
        `/api/v1/bookings/tracking/${encodeURIComponent(bookingNumber.trim())}`,
      );
      setResult(data);
    } catch (err: unknown) {
      const { generalError } = parseApiError(err, 'Terjadi kesalahan. Silakan coba lagi.');
      setError(generalError);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <form onSubmit={handleSubmit} className="flex gap-3">
        <input
          type="text"
          value={bookingNumber}
          onChange={(e) => setBookingNumber(e.target.value)}
          placeholder="Contoh: SP-2026-000001"
          className="flex-1 rounded-md border border-border-default bg-bg-surface px-4 py-2.5 text-sm text-text-primary outline-none transition-colors focus:border-primary focus:ring-1 focus:ring-primary placeholder:text-text-secondary"
        />
        <Button type="submit" variant="primary" disabled={loading || !bookingNumber.trim()}>
          {loading ? 'Mencari...' : 'Lacak'}
        </Button>
      </form>

      {error && (
        <div className="mt-6 rounded-md border border-danger-500/30 bg-danger-500/5 px-4 py-3 text-sm text-danger-500">
          {error}
        </div>
      )}

      {result && (
        <div className="mt-8 space-y-6">
          <div className="rounded-lg border border-border-default bg-bg-surface p-6">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <p className="text-xs text-text-secondary">No. Booking</p>
                <p className="text-xl font-bold tracking-wider text-text-primary">
                  {result.bookingNumber}
                </p>
              </div>
              <Badge
                variant={
                  getStatusColor(result.status) as
                    'default' | 'success' | 'warning' | 'danger' | 'info'
                }
              >
                {getStatusLabel(result.status)}
              </Badge>
            </div>

            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <div>
                <p className="text-xs text-text-secondary">Tanggal</p>
                <p className="font-medium text-text-primary">{result.bookingDate}</p>
              </div>
              <div>
                <p className="text-xs text-text-secondary">Jam</p>
                <p className="font-medium text-text-primary">{result.bookingTime}</p>
              </div>
              <div>
                <p className="text-xs text-text-secondary">Estimasi Harga</p>
                <p className="font-medium text-text-primary">{formatCurrency(result.basePrice)}</p>
              </div>
              {result.finalPrice && (
                <div>
                  <p className="text-xs text-text-secondary">Harga Final</p>
                  <p className="font-medium text-text-primary">
                    {formatCurrency(result.finalPrice)}
                  </p>
                </div>
              )}
            </div>

            {result.notes && (
              <div className="mt-4">
                <p className="text-xs text-text-secondary">Catatan</p>
                <p className="mt-1 text-sm text-text-primary">{result.notes}</p>
              </div>
            )}
          </div>

          {/* Timeline */}
          {result.timeline.length > 0 && (
            <div className="rounded-lg border border-border-default bg-bg-surface p-6">
              <h3 className="text-sm font-semibold text-text-primary">Riwayat Status</h3>
              <div className="mt-4 space-y-0">
                {result.timeline.map((entry, i) => (
                  <div key={i} className="relative flex gap-4 pb-6 last:pb-0">
                    <div className="flex flex-col items-center">
                      <div className="h-3 w-3 rounded-full border-2 border-primary bg-bg-surface" />
                      {i < result.timeline.length - 1 && (
                        <div className="mt-1 h-full w-px bg-neutral-200" />
                      )}
                    </div>
                    <div className="flex-1 pb-2">
                      <p className="text-sm font-medium text-text-primary">
                        {getStatusLabel(entry.toStatus)}
                      </p>
                      <p className="text-xs text-text-secondary">
                        {new Date(entry.createdAt).toLocaleString('id-ID', {
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
