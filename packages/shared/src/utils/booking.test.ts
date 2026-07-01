import { describe, it, expect } from 'vitest';
import {
  validateStatusChange,
  canCustomerCancel,
  getNextStatuses,
  getStatusLabel,
  getStatusColor,
} from './booking.ts';

describe('validateStatusChange', () => {
  it('allows Draft to Pending Confirmation', () => {
    const result = validateStatusChange('Draft', 'Pending Confirmation');
    expect(result.valid).toBe(true);
  });

  it('allows Partner Accepted to On The Way', () => {
    const result = validateStatusChange('Partner Accepted', 'On The Way');
    expect(result.valid).toBe(true);
  });

  it('allows On The Way to Working', () => {
    const result = validateStatusChange('On The Way', 'Working');
    expect(result.valid).toBe(true);
  });

  it('allows Working to Completed', () => {
    const result = validateStatusChange('Working', 'Completed');
    expect(result.valid).toBe(true);
  });

  it('blocks Completed to Working (no reverse)', () => {
    const result = validateStatusChange('Completed', 'Working');
    expect(result.valid).toBe(false);
  });

  it('blocks same status transition', () => {
    const result = validateStatusChange('Confirmed', 'Confirmed');
    expect(result.valid).toBe(false);
    if (!result.valid) expect(result.reason).toContain('sama');
  });

  it('blocks transition from final status', () => {
    const result = validateStatusChange('Closed', 'Pending Confirmation');
    expect(result.valid).toBe(false);
    if (!result.valid) expect(result.reason).toContain('final');
  });

  it('blocks invalid transition', () => {
    const result = validateStatusChange('Draft', 'Working');
    expect(result.valid).toBe(false);
  });
});

describe('canCustomerCancel', () => {
  it('allows cancel on Pending Confirmation', () => {
    expect(canCustomerCancel('Pending Confirmation')).toBe(true);
  });

  it('allows cancel on Confirmed', () => {
    expect(canCustomerCancel('Confirmed')).toBe(true);
  });

  it('allows cancel on Waiting Assignment', () => {
    expect(canCustomerCancel('Waiting Assignment')).toBe(true);
  });

  it('blocks cancel on Working', () => {
    expect(canCustomerCancel('Working')).toBe(false);
  });

  it('blocks cancel on Completed', () => {
    expect(canCustomerCancel('Completed')).toBe(false);
  });
});

describe('getNextStatuses', () => {
  it('returns next statuses for Draft', () => {
    const next = getNextStatuses('Draft');
    expect(next).toContain('Pending Confirmation');
  });

  it('returns empty array for Closed', () => {
    expect(getNextStatuses('Closed')).toEqual([]);
  });
});

describe('getStatusLabel', () => {
  it('returns Indonesian label', () => {
    expect(getStatusLabel('Pending Confirmation')).toBe('Menunggu Konfirmasi');
    expect(getStatusLabel('On The Way')).toBe('Dalam Perjalanan');
    expect(getStatusLabel('Working')).toBe('Sedang Dikerjakan');
    expect(getStatusLabel('Completed')).toBe('Selesai');
    expect(getStatusLabel('Cancelled')).toBe('Dibatalkan');
  });
});

describe('getStatusColor', () => {
  it('returns danger for cancelled', () => {
    expect(getStatusColor('Cancelled')).toBe('danger');
  });

  it('returns success for completed', () => {
    expect(getStatusColor('Completed')).toBe('success');
  });

  it('returns warning for pending', () => {
    expect(getStatusColor('Pending Confirmation')).toBe('warning');
  });
});
