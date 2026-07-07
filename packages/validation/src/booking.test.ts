import { describe, it, expect } from 'vitest';
import {
  createGuestBookingSchema,
  createCustomerBookingSchema,
  confirmBookingSchema,
  assignPartnerSchema,
  acceptAssignmentSchema,
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

const validBase = {
  fullName: 'John Doe',
  phone: '081234567890',
  address: validAddress,
  bookingDate: '2026-07-15',
  bookingTime: '09:00',
  items: [validItem],
};

describe('createGuestBookingSchema', () => {
  it('accepts valid guest booking', () => {
    const result = createGuestBookingSchema.safeParse(validBase);
    expect(result.success).toBe(true);
  });

  it('accepts optional notes and mediaIds', () => {
    const result = createGuestBookingSchema.safeParse({
      ...validBase,
      notes: 'Tolong cepat',
      mediaIds: ['550e8400-e29b-41d4-a716-446655440000'],
    });
    expect(result.success).toBe(true);
  });

  it('rejects missing items', () => {
    const { items: _items, ...noItems } = validBase;
    const result = createGuestBookingSchema.safeParse(noItems);
    expect(result.success).toBe(false);
  });

  it('rejects empty items array', () => {
    const result = createGuestBookingSchema.safeParse({ ...validBase, items: [] });
    expect(result.success).toBe(false);
  });

  it('rejects zero quantity', () => {
    const result = createGuestBookingSchema.safeParse({
      ...validBase,
      items: [{ ...validItem, quantity: 0 }],
    });
    expect(result.success).toBe(false);
  });

  it('rejects negative quantity', () => {
    const result = createGuestBookingSchema.safeParse({
      ...validBase,
      items: [{ ...validItem, quantity: -1 }],
    });
    expect(result.success).toBe(false);
  });

  it('accepts phone with leading +', () => {
    const result = createGuestBookingSchema.safeParse({
      ...validBase,
      phone: '+6281234567890',
    });
    expect(result.success).toBe(true);
  });

  it('rejects phone with dashes', () => {
    const result = createGuestBookingSchema.safeParse({
      ...validBase,
      phone: '0812-3456-7890',
    });
    expect(result.success).toBe(false);
  });

  it('rejects phone with letters', () => {
    const result = createGuestBookingSchema.safeParse({
      ...validBase,
      phone: '0812abc5678',
    });
    expect(result.success).toBe(false);
  });

  it('rejects phone too short (< 10)', () => {
    const result = createGuestBookingSchema.safeParse({ ...validBase, phone: '081' });
    expect(result.success).toBe(false);
  });

  it('rejects phone too long (> 30)', () => {
    const result = createGuestBookingSchema.safeParse({
      ...validBase,
      phone: '0'.repeat(31),
    });
    expect(result.success).toBe(false);
  });

  it('rejects receiverPhone with dashes', () => {
    const result = createGuestBookingSchema.safeParse({
      ...validBase,
      address: { ...validAddress, receiverPhone: '0812-3456' },
    });
    expect(result.success).toBe(false);
  });

  it('rejects notes exceeding 1000 chars', () => {
    const result = createGuestBookingSchema.safeParse({
      ...validBase,
      notes: 'x'.repeat(1001),
    });
    expect(result.success).toBe(false);
  });

  it('rejects invalid booking date format', () => {
    const result = createGuestBookingSchema.safeParse({
      ...validBase,
      bookingDate: '15-07-2026',
    });
    expect(result.success).toBe(false);
  });

  it('rejects invalid booking time format', () => {
    const result = createGuestBookingSchema.safeParse({
      ...validBase,
      bookingTime: '9 AM',
    });
    expect(result.success).toBe(false);
  });

  it('rejects address with empty province', () => {
    const result = createGuestBookingSchema.safeParse({
      ...validBase,
      address: { ...validAddress, province: '' },
    });
    expect(result.success).toBe(false);
  });

  it('rejects mediaIds exceeding 10 items', () => {
    const result = createGuestBookingSchema.safeParse({
      ...validBase,
      mediaIds: Array.from({ length: 11 }, () => '550e8400-e29b-41d4-a716-446655440000'),
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

describe('acceptAssignmentSchema', () => {
  it('accepts without note', () => {
    const result = acceptAssignmentSchema.safeParse({});
    expect(result.success).toBe(true);
  });

  it('accepts with note', () => {
    const result = acceptAssignmentSchema.safeParse({ note: 'Siap' });
    expect(result.success).toBe(true);
  });

  it('rejects note exceeding 500 chars', () => {
    const result = acceptAssignmentSchema.safeParse({ note: 'x'.repeat(501) });
    expect(result.success).toBe(false);
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

  it('rejects reason exceeding 500 chars', () => {
    const result = rejectAssignmentSchema.safeParse({ reason: 'x'.repeat(501) });
    expect(result.success).toBe(false);
  });
});
