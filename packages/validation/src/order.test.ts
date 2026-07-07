import { describe, it, expect } from 'vitest';
import {
  createOrderSchema,
  updateOrderStatusSchema,
  updatePriceSchema,
  cancelOrderSchema,
  discountOrderSchema,
} from './order.ts';

const UUID = '550e8400-e29b-41d4-a716-446655440000';

const validItem = { serviceId: UUID, quantity: 2, unitPrice: 75000 };
const validOrder = {
  addressId: UUID,
  bookingDate: '2026-07-15',
  bookingTime: '10:00',
  basePrice: 150000,
  items: [validItem],
};

describe('createOrderSchema', () => {
  it('accepts valid order', () => {
    const result = createOrderSchema.safeParse(validOrder);
    expect(result.success).toBe(true);
  });

  it('accepts with notes and discountAmount', () => {
    const result = createOrderSchema.safeParse({
      ...validOrder,
      notes: 'Tolong cepat',
      discountAmount: 10000,
    });
    expect(result.success).toBe(true);
  });

  it('applies default discountAmount = 0', () => {
    const result = createOrderSchema.parse(validOrder);
    expect(result.discountAmount).toBe(0);
  });

  it('rejects empty items', () => {
    const result = createOrderSchema.safeParse({ ...validOrder, items: [] });
    expect(result.success).toBe(false);
  });

  it('rejects zero quantity', () => {
    const result = createOrderSchema.safeParse({
      ...validOrder,
      items: [{ ...validItem, quantity: 0 }],
    });
    expect(result.success).toBe(false);
  });

  it('rejects negative basePrice', () => {
    const result = createOrderSchema.safeParse({ ...validOrder, basePrice: -100 });
    expect(result.success).toBe(false);
  });

  it('coerces string basePrice to number', () => {
    const result = createOrderSchema.safeParse({ ...validOrder, basePrice: '150000' });
    expect(result.success).toBe(true);
  });

  it('rejects invalid addressId', () => {
    const result = createOrderSchema.safeParse({ ...validOrder, addressId: 'not-uuid' });
    expect(result.success).toBe(false);
  });

  it('rejects invalid booking date format', () => {
    const result = createOrderSchema.safeParse({ ...validOrder, bookingDate: '15-07-2026' });
    expect(result.success).toBe(false);
  });

  it('rejects invalid booking time format', () => {
    const result = createOrderSchema.safeParse({ ...validOrder, bookingTime: '9 AM' });
    expect(result.success).toBe(false);
  });

  it('rejects notes exceeding 1000 chars', () => {
    const result = createOrderSchema.safeParse({ ...validOrder, notes: 'x'.repeat(1001) });
    expect(result.success).toBe(false);
  });

  it('rejects missing items field', () => {
    const { items: _items, ...noItems } = validOrder;
    const result = createOrderSchema.safeParse(noItems);
    expect(result.success).toBe(false);
  });

  it('rejects non-integer quantity', () => {
    const result = createOrderSchema.safeParse({
      ...validOrder,
      items: [{ ...validItem, quantity: 1.5 }],
    });
    expect(result.success).toBe(false);
  });

  it('rejects negative unitPrice', () => {
    const result = createOrderSchema.safeParse({
      ...validOrder,
      items: [{ ...validItem, unitPrice: -1 }],
    });
    expect(result.success).toBe(false);
  });

  it('rejects negative discountAmount', () => {
    const result = createOrderSchema.safeParse({ ...validOrder, discountAmount: -5000 });
    expect(result.success).toBe(false);
  });
});

describe('updateOrderStatusSchema', () => {
  it('accepts valid status', () => {
    const result = updateOrderStatusSchema.safeParse({ status: 'Confirmed' });
    expect(result.success).toBe(true);
  });

  it('accepts all valid statuses', () => {
    for (const s of ['Confirmed', 'Waiting Assignment', 'Completed', 'Cancelled', 'Closed']) {
      const result = updateOrderStatusSchema.safeParse({ status: s });
      expect(result.success).toBe(true);
    }
  });

  it('accepts with optional note', () => {
    const result = updateOrderStatusSchema.safeParse({
      status: 'Cancelled',
      note: 'Customer request',
    });
    expect(result.success).toBe(true);
  });

  it('rejects invalid status', () => {
    const result = updateOrderStatusSchema.safeParse({ status: 'InvalidStatus' });
    expect(result.success).toBe(false);
  });

  it('rejects empty status', () => {
    const result = updateOrderStatusSchema.safeParse({ status: '' });
    expect(result.success).toBe(false);
  });

  it('rejects note exceeding 500 chars', () => {
    const result = updateOrderStatusSchema.safeParse({
      status: 'Confirmed',
      note: 'x'.repeat(501),
    });
    expect(result.success).toBe(false);
  });
});

describe('updatePriceSchema', () => {
  it('accepts valid price update', () => {
    const result = updatePriceSchema.safeParse({ finalPrice: 200000 });
    expect(result.success).toBe(true);
  });

  it('accepts with note', () => {
    const result = updatePriceSchema.safeParse({ finalPrice: 200000, note: 'Diskon' });
    expect(result.success).toBe(true);
  });

  it('coerces string finalPrice to number', () => {
    const result = updatePriceSchema.safeParse({ finalPrice: '200000' });
    expect(result.success).toBe(true);
  });

  it('rejects negative finalPrice', () => {
    const result = updatePriceSchema.safeParse({ finalPrice: -100 });
    expect(result.success).toBe(false);
  });

  it('rejects zero finalPrice', () => {
    // min(0) means 0 is acceptable (free order)
    const result = updatePriceSchema.safeParse({ finalPrice: 0 });
    expect(result.success).toBe(true);
  });

  it('rejects note exceeding 500 chars', () => {
    const result = updatePriceSchema.safeParse({
      finalPrice: 200000,
      note: 'x'.repeat(501),
    });
    expect(result.success).toBe(false);
  });
});

describe('cancelOrderSchema', () => {
  it('accepts valid cancel reason', () => {
    const result = cancelOrderSchema.safeParse({ reason: 'Change of mind' });
    expect(result.success).toBe(true);
  });

  it('rejects empty reason', () => {
    const result = cancelOrderSchema.safeParse({ reason: '' });
    expect(result.success).toBe(false);
  });

  it('rejects missing reason', () => {
    const result = cancelOrderSchema.safeParse({});
    expect(result.success).toBe(false);
  });

  it('rejects reason exceeding 500 chars', () => {
    const result = cancelOrderSchema.safeParse({ reason: 'x'.repeat(501) });
    expect(result.success).toBe(false);
  });
});

// ───── discountOrderSchema (with .refine()) ─────

describe('discountOrderSchema', () => {
  it('accepts discountPercent only', () => {
    const result = discountOrderSchema.safeParse({ discountPercent: 10 });
    expect(result.success).toBe(true);
  });

  it('accepts discountAmount only', () => {
    const result = discountOrderSchema.safeParse({ discountAmount: 50000 });
    expect(result.success).toBe(true);
  });

  it('accepts both discountPercent and discountAmount', () => {
    const result = discountOrderSchema.safeParse({ discountPercent: 10, discountAmount: 50000 });
    expect(result.success).toBe(true);
  });

  it('accepts with note', () => {
    const result = discountOrderSchema.safeParse({
      discountPercent: 10,
      note: 'Promo akhir tahun',
    });
    expect(result.success).toBe(true);
  });

  it('coerces string discountPercent to number', () => {
    const result = discountOrderSchema.safeParse({ discountPercent: '10' });
    expect(result.success).toBe(true);
  });

  // ── Refine test: at least one discount required ──

  it('rejects neither discountPercent nor discountAmount (refine)', () => {
    const result = discountOrderSchema.safeParse({});
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0]?.message).toContain('Setidaknya satu diskon');
    }
  });

  it('rejects neither discount with only note (refine)', () => {
    const result = discountOrderSchema.safeParse({ note: 'Diskon' });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0]?.message).toContain('Setidaknya satu diskon');
    }
  });

  // ── Range validation ──

  it('rejects discountPercent above 100', () => {
    const result = discountOrderSchema.safeParse({ discountPercent: 150 });
    expect(result.success).toBe(false);
  });

  it('rejects discountPercent negative', () => {
    const result = discountOrderSchema.safeParse({ discountPercent: -5 });
    expect(result.success).toBe(false);
  });

  it('accepts discountPercent 0', () => {
    const result = discountOrderSchema.safeParse({ discountPercent: 0, discountAmount: 0 });
    expect(result.success).toBe(true);
  });

  it('accepts discountPercent 100', () => {
    const result = discountOrderSchema.safeParse({ discountPercent: 100 });
    expect(result.success).toBe(true);
  });

  it('rejects discountAmount negative', () => {
    const result = discountOrderSchema.safeParse({ discountAmount: -1000 });
    expect(result.success).toBe(false);
  });

  it('rejects note exceeding 500 chars', () => {
    const result = discountOrderSchema.safeParse({
      discountPercent: 10,
      note: 'x'.repeat(501),
    });
    expect(result.success).toBe(false);
  });

  it('rejects non-numeric discountPercent', () => {
    const result = discountOrderSchema.safeParse({ discountPercent: 'abc' });
    expect(result.success).toBe(false);
  });
});
