/**
 * Parse booking date and time into a single Date object.
 *
 * @example
 *   parseBookingDateTime('2026-06-30', '14:30') // Date(2026-06-30T14:30:00)
 */
export function parseBookingDateTime(date: string, time: string): Date {
  const [year, month, day] = date.split('-').map(Number);
  const [hour, minute] = time.split(':').map(Number);
  return new Date(year!, month! - 1, day!, hour!, minute!);
}

/**
 * Cek apakah booking date/time sudah lewat.
 */
export function isBookingPast(date: string, time: string): boolean {
  return parseBookingDateTime(date, time) < new Date();
}

/**
 * Cek apakah booking date/time masih dalam X jam ke depan.
 */
export function isWithinHours(date: string, time: string, hours: number): boolean {
  const bookingDate = parseBookingDateTime(date, time);
  const diffMs = bookingDate.getTime() - Date.now();
  return diffMs > 0 && diffMs <= hours * 60 * 60 * 1000;
}

/**
 * Dapatkan selisih hari antara dua tanggal (ISO string).
 */
export function daysBetween(date1: string, date2: string): number {
  const d1 = new Date(date1);
  const d2 = new Date(date2);
  const diffMs = Math.abs(d2.getTime() - d1.getTime());
  return Math.floor(diffMs / (1000 * 60 * 60 * 24));
}

/**
 * Tambah hari ke tanggal (ISO string).
 */
export function addDays(date: string, days: number): string {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d.toISOString().split('T')[0]!;
}

/**
 * Dapatkan range tanggal untuk filter (hari ini, minggu ini, bulan ini).
 */
export function getDateRange(range: 'today' | 'this_week' | 'this_month' | 'last_month'): {
  start: string;
  end: string;
} {
  const now = new Date();
  const end = now.toISOString().split('T')[0]!;

  let start: Date;
  switch (range) {
    case 'today':
      start = now;
      break;
    case 'this_week': {
      const dayOfWeek = now.getDay();
      const diff = dayOfWeek === 0 ? 6 : dayOfWeek - 1; // Senin = 0
      start = new Date(now);
      start.setDate(now.getDate() - diff);
      break;
    }
    case 'this_month':
      start = new Date(now.getFullYear(), now.getMonth(), 1);
      break;
    case 'last_month':
      start = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      break;
  }

  return { start: start!.toISOString().split('T')[0]!, end };
}
