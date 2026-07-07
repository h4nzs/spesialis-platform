import { describe, it, expect, vi, afterEach, beforeEach } from 'vitest';
import {
  parseBookingDateTime,
  daysBetween,
  addDays,
  isBookingPast,
  isWithinHours,
} from './date.ts';

describe('parseBookingDateTime', () => {
  it('parses date and time correctly', () => {
    const d = parseBookingDateTime('2026-07-15', '14:30');
    expect(d.getFullYear()).toBe(2026);
    expect(d.getMonth()).toBe(6);
    expect(d.getDate()).toBe(15);
    expect(d.getHours()).toBe(14);
    expect(d.getMinutes()).toBe(30);
  });

  it('handles single-digit month and day', () => {
    const d = parseBookingDateTime('2026-01-05', '09:05');
    expect(d.getMonth()).toBe(0);
    expect(d.getDate()).toBe(5);
    expect(d.getMinutes()).toBe(5);
  });
});

describe('isBookingPast', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-07-15T10:00:00'));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('returns false for future date', () => {
    expect(isBookingPast('2026-07-15', '11:00')).toBe(false);
  });

  it('returns true for past date', () => {
    expect(isBookingPast('2026-07-15', '09:00')).toBe(true);
  });

  it('returns false for exactly now', () => {
    expect(isBookingPast('2026-07-15', '10:00')).toBe(false);
  });

  it('returns true for past day', () => {
    expect(isBookingPast('2026-07-14', '10:00')).toBe(true);
  });
});

describe('isWithinHours', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-07-15T10:00:00'));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('returns true within 1 hour', () => {
    expect(isWithinHours('2026-07-15', '10:30', 1)).toBe(true);
  });

  it('returns false beyond hours', () => {
    expect(isWithinHours('2026-07-15', '14:00', 2)).toBe(false);
  });

  it('returns false for already past', () => {
    expect(isWithinHours('2026-07-15', '09:00', 1)).toBe(false);
  });

  it('returns true at exact boundary', () => {
    expect(isWithinHours('2026-07-15', '12:00', 2)).toBe(true);
  });

  it('returns true at 2h boundary when within 3h window', () => {
    expect(isWithinHours('2026-07-15', '12:00', 3)).toBe(true);
  });

  it('returns false when just past boundary', () => {
    expect(isWithinHours('2026-07-15', '13:01', 3)).toBe(false);
  });
});

describe('daysBetween', () => {
  it('calculates days between two dates', () => {
    expect(daysBetween('2026-07-01', '2026-07-10')).toBe(9);
  });

  it('returns 0 for same day', () => {
    expect(daysBetween('2026-07-01', '2026-07-01')).toBe(0);
  });

  it('works regardless of order', () => {
    expect(daysBetween('2026-07-10', '2026-07-01')).toBe(9);
  });
});

describe('addDays', () => {
  it('adds positive days', () => {
    expect(addDays('2026-07-01', 5)).toBe('2026-07-06');
  });

  it('subtracts days', () => {
    expect(addDays('2026-07-10', -3)).toBe('2026-07-07');
  });

  it('crosses month boundary', () => {
    const result = addDays('2026-07-30', 5);
    expect(result).toBe('2026-08-04');
  });
});

describe('getDateRange', () => {
  it('returns today range with same start and end', async () => {
    const mod = await import('./date.ts');
    const range = mod.getDateRange('today');
    expect(range.start).toBe(range.end);
  });

  it('returns this_month range with valid date format', async () => {
    const mod = await import('./date.ts');
    const range = mod.getDateRange('this_month');
    expect(range.start).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    expect(range.start <= range.end).toBe(true);
  });

  it('returns last_month with earlier start than end', async () => {
    const mod = await import('./date.ts');
    const range = mod.getDateRange('last_month');
    expect(range.start < range.end).toBe(true);
  });

  it('returns this_week with start < end', async () => {
    const mod = await import('./date.ts');
    const range = mod.getDateRange('this_week');
    expect(range.start <= range.end).toBe(true);
  });
});
