import { BOOKING_NUMBER_PREFIX } from '../constants.ts';

/**
 * Format angka ke format mata uang Rupiah.
 *
 * @example
 *   formatCurrency(150000) // 'Rp150.000'
 *   formatCurrency(150000, true) // 'Rp 150.000'
 */
export function formatCurrency(amount: number | string, withSpace = false): string {
  const num = typeof amount === 'string' ? Number(amount) : amount;
  if (isNaN(num)) return 'Rp0';

  const formatted = Math.round(num)
    .toString()
    .replace(/\B(?=(\d{3})+(?!\d))/g, '.');

  return withSpace ? `Rp ${formatted}` : `Rp${formatted}`;
}

/**
 * Parse string Rupiah kembali ke number.
 *
 * @example
 *   parseCurrency('Rp150.000') // 150000
 *   parseCurrency('Rp 150.000') // 150000
 */
export function parseCurrency(value: string): number {
  const cleaned = value.replace(/[^0-9]/g, '');
  return parseInt(cleaned, 10) || 0;
}

/**
 * Format nomor HP Indonesia.
 * 6281234567890 → 0812-3456-7890
 */
export function formatPhone(phone: string): string {
  const cleaned = phone.replace(/[^0-9]/g, '');
  if (cleaned.startsWith('62')) {
    return `0${cleaned.slice(2).replace(/^(\d{3})(\d{4})(\d{4})$/, '$1-$2-$3')}`;
  }
  if (cleaned.startsWith('0')) {
    return cleaned.replace(/^(\d{3})(\d{4})(\d{4})$/, '$1-$2-$3');
  }
  return cleaned;
}

/**
 * Format booking number: SP-2026-000001
 */
export function formatBookingNumber(year: number, sequence: number): string {
  return `${BOOKING_NUMBER_PREFIX}-${year}-${String(sequence).padStart(6, '0')}`;
}

/**
 * Parse booking number jadi components.
 * SP-2026-000001 → { prefix: 'SP', year: 2026, sequence: 1 }
 */
export function parseBookingNumber(
  bookingNumber: string,
): { prefix: string; year: number; sequence: number } | null {
  const match = bookingNumber.match(/^(\w+)-(\d{4})-(\d+)$/);
  if (!match) return null;
  return {
    prefix: match[1]!,
    year: parseInt(match[2]!, 10),
    sequence: parseInt(match[3]!, 10),
  };
}

/**
 * Format tanggal ke format Indonesia.
 *
 * @example
 *   formatDate('2026-06-30') // '30 Juni 2026'
 */
export function formatDate(date: string | Date, format: 'long' | 'short' | 'iso' = 'long'): string {
  const d = typeof date === 'string' ? new Date(date) : date;

  if (isNaN(d.getTime())) return '';

  if (format === 'iso') {
    return d.toISOString().split('T')[0]!;
  }

  const months = [
    'Januari',
    'Februari',
    'Maret',
    'April',
    'Mei',
    'Juni',
    'Juli',
    'Agustus',
    'September',
    'Oktober',
    'November',
    'Desember',
  ];

  const day = d.getDate();
  const month = months[d.getMonth()]!;
  const year = d.getFullYear();

  if (format === 'short') {
    return `${String(day).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${year}`;
  }

  return `${day} ${month} ${year}`;
}

/**
 * Format waktu ke format Indonesia.
 *
 * @example
 *   formatTime('14:30') // '14:30 WIB'
 */
export function formatTime(time: string): string {
  const match = time.match(/^(\d{2}):(\d{2})/);
  if (!match) return time;
  return `${match[1]}:${match[2]} WIB`;
}

/**
 * Format durasi dalam menit ke string.
 *
 * @example
 *   formatDuration(90) // '1 jam 30 menit'
 *   formatDuration(45) // '45 menit'
 */
export function formatDuration(minutes: number): string {
  if (minutes < 60) {
    return `${minutes} menit`;
  }
  const hours = Math.floor(minutes / 60);
  const remaining = minutes % 60;
  if (remaining === 0) {
    return `${hours} jam`;
  }
  return `${hours} jam ${remaining} menit`;
}

/**
 * Format rating ke bintang (string).
 *
 * @example
 *   formatRating(4.5) // '★★★★½'
 */
export function formatRating(rating: number): string {
  const full = Math.floor(rating);
  const half = rating - full >= 0.25 && rating - full < 0.75;
  const empty = 5 - full - (half ? 1 : 0);

  return '★'.repeat(full) + (half ? '½' : '') + '☆'.repeat(empty);
}
