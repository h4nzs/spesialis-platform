import { describe, it, expect } from 'vitest';
import {
  createGuestBookingSchema,
  createCustomerBookingSchema,
  confirmBookingSchema,
  assignPartnerSchema,
  rejectAssignmentSchema,
} from './booking.ts';

const validAddress = {
  province: 'DKI Jakarta',
  city: 'Jakarta Selatan',
  district: 'Kebayoran Baru',
  postalCode: '12120',
  address: 'Jl. Contoh No. 123',
  receiverName: 'John Doe',
  receiverPhone: '081234567890',
};

const validItem = { serviceId: '550e8400-e29b-41d4-a716-446655440000', quantity: 1 };

describe('createGuestBookingSchema', () => {
  it('accepts valid guest booking', () => {
    const result = createGuestBookingSchema.safeParse({
      fullName: 'John Doe',
      phone: '081234567890',
      address: validAddress,
      bookingDate: '2026-07-15',
      bookingTime: '09:00',
      items: [validItem],
    });
    expect(result.success).toBe(true);
  });

  it('rejects missing items', () => {
    const result = createGuestBookingSchema.safeParse({
      fullName: 'John Doe',
      phone: '081234567890',
      address: validAddress,
      bookingDate: '2026-07-15',
      bookingTime: '09:00',
    });
    expect(result.success).toBe(false);
  });

  it('rejects invalid booking date format', () => {
    const result = createGuestBookingSchema.safeParse({
      fullName: 'John Doe',
      phone: '081234567890',
      address: validAddress,
      bookingDate: '15-07-2026',
      bookingTime: '09:00',
      items: [validItem],
    });
    expect(result.success).toBe(false);
  });

  it('rejects invalid booking time format', () => {
    const result = createGuestBookingSchema.safeParse({
      fullName: 'John Doe',
      phone: '081234567890',
      address: validAddress,
      bookingDate: '2026-07-15',
      bookingTime: '9 AM',
      items: [validItem],
    });
    expect(result.success).toBe(false);
  });
});

describe('createCustomerBookingSchema', () => {
  it('accepts valid customer booking', () => {
    const result = createCustomerBookingSchema.safeParse({
      addressId: '550e8400-e29b-41d4-a716-446655440000',
      bookingDate: '2026-07-15',
      bookingTime: '09:00',
      items: [validItem],
    });
    expect(result.success).toBe(true);
  });

  it('rejects invalid addressId', () => {
    const result = createCustomerBookingSchema.safeParse({
      addressId: 'not-a-uuid',
      bookingDate: '2026-07-15',
      bookingTime: '09:00',
      items: [validItem],
    });
    expect(result.success).toBe(false);
  });
});

describe('confirmBookingSchema', () => {
  it('accepts confirm without final price', () => {
    const result = confirmBookingSchema.safeParse({});
    expect(result.success).toBe(true);
  });

  it('accepts confirm with final price', () => {
    const result = confirmBookingSchema.safeParse({ finalPrice: 250000 });
    expect(result.success).toBe(true);
  });

  it('rejects negative price', () => {
    const result = confirmBookingSchema.safeParse({ finalPrice: -100 });
    expect(result.success).toBe(false);
  });
});

describe('assignPartnerSchema', () => {
  it('accepts valid assignment', () => {
    const result = assignPartnerSchema.safeParse({
      partnerId: '550e8400-e29b-41d4-a716-446655440000',
    });
    expect(result.success).toBe(true);
  });
});

describe('rejectAssignmentSchema', () => {
  it('accepts reject with reason', () => {
    const result = rejectAssignmentSchema.safeParse({ reason: 'Terlalu jauh' });
    expect(result.success).toBe(true);
  });

  it('rejects empty reason', () => {
    const result = rejectAssignmentSchema.safeParse({});
    expect(result.success).toBe(false);
  });
});
