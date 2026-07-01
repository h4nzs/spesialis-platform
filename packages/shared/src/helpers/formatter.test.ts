import { describe, it, expect } from 'vitest';
import {
  formatCurrency,
  parseCurrency,
  formatPhone,
  formatBookingNumber,
  parseBookingNumber,
  formatDate,
  formatTime,
  formatDuration,
  formatRating,
} from './formatter.ts';

describe('formatCurrency', () => {
  it('formats number to Rupiah', () => {
    expect(formatCurrency(150000)).toBe('Rp150.000');
  });

  it('formats with space separator', () => {
    expect(formatCurrency(150000, true)).toBe('Rp 150.000');
  });

  it('handles string input', () => {
    expect(formatCurrency('250000')).toBe('Rp250.000');
  });

  it('handles zero', () => {
    expect(formatCurrency(0)).toBe('Rp0');
  });
});

describe('parseCurrency', () => {
  it('parses formatted Rupiah', () => {
    expect(parseCurrency('Rp150.000')).toBe(150000);
  });

  it('parses with space', () => {
    expect(parseCurrency('Rp 150.000')).toBe(150000);
  });
});

describe('formatPhone', () => {
  it('formats 62 prefix', () => {
    expect(formatPhone('6281234567890')).toBe('0812-3456-7890');
  });

  it('formats 0 prefix 11-digit', () => {
    expect(formatPhone('08123456789')).toBe('081-2345-6789');
  });
});

describe('formatBookingNumber', () => {
  it('formats booking number', () => {
    expect(formatBookingNumber(2026, 1)).toBe('SP-2026-000001');
    expect(formatBookingNumber(2026, 123)).toBe('SP-2026-000123');
  });
});

describe('parseBookingNumber', () => {
  it('parses valid booking number', () => {
    const result = parseBookingNumber('SP-2026-000001');
    expect(result).toEqual({ prefix: 'SP', year: 2026, sequence: 1 });
  });

  it('returns null for invalid format', () => {
    expect(parseBookingNumber('invalid')).toBeNull();
  });
});

describe('formatDate', () => {
  it('formats long date', () => {
    const result = formatDate('2026-06-30');
    expect(result).toBe('30 Juni 2026');
  });

  it('formats short date', () => {
    const result = formatDate('2026-06-30', 'short');
    expect(result).toBe('30/06/2026');
  });

  it('returns empty string for invalid date', () => {
    expect(formatDate('invalid')).toBe('');
  });
});

describe('formatTime', () => {
  it('formats time with WIB', () => {
    expect(formatTime('14:30')).toBe('14:30 WIB');
  });

  it('returns original string for invalid format', () => {
    expect(formatTime('invalid')).toBe('invalid');
  });
});

describe('formatDuration', () => {
  it('formats minutes only', () => {
    expect(formatDuration(45)).toBe('45 menit');
  });

  it('formats hours only', () => {
    expect(formatDuration(120)).toBe('2 jam');
  });

  it('formats hours and minutes', () => {
    expect(formatDuration(90)).toBe('1 jam 30 menit');
  });
});

describe('formatRating', () => {
  it('formats full stars', () => {
    expect(formatRating(5)).toBe('★★★★★');
  });

  it('formats with half star', () => {
    expect(formatRating(4.5)).toBe('★★★★½');
  });

  it('formats with empty stars', () => {
    expect(formatRating(3)).toBe('★★★☆☆');
  });
});
