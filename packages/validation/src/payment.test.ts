import { describe, it, expect } from 'vitest';
import { createPaymentSchema, verifyPaymentSchema } from './payment.ts';

describe('createPaymentSchema', () => {
  it('accepts valid payment', () => {
    const result = createPaymentSchema.safeParse({
      orderId: '550e8400-e29b-41d4-a716-446655440000',
      method: 'Transfer',
      amount: 150000,
    });
    expect(result.success).toBe(true);
  });

  it('rejects invalid method', () => {
    const result = createPaymentSchema.safeParse({
      orderId: '550e8400-e29b-41d4-a716-446655440000',
      method: 'Bitcoin',
      amount: 150000,
    });
    expect(result.success).toBe(false);
  });

  it('rejects negative amount', () => {
    const result = createPaymentSchema.safeParse({
      orderId: '550e8400-e29b-41d4-a716-446655440000',
      method: 'Cash',
      amount: -100,
    });
    expect(result.success).toBe(false);
  });

  it('accepts all valid methods', () => {
    for (const method of ['Cash', 'Transfer', 'QRIS', 'E-Wallet', 'Other'] as const) {
      const result = createPaymentSchema.safeParse({
        orderId: '550e8400-e29b-41d4-a716-446655440000',
        method,
        amount: 50000,
      });
      expect(result.success).toBe(true);
    }
  });
});

describe('verifyPaymentSchema', () => {
  it('accepts mark as paid', () => {
    const result = verifyPaymentSchema.safeParse({ status: 'Paid' });
    expect(result.success).toBe(true);
  });

  it('accepts mark as failed', () => {
    const result = verifyPaymentSchema.safeParse({ status: 'Failed' });
    expect(result.success).toBe(true);
  });

  it('rejects unknown status', () => {
    const result = verifyPaymentSchema.safeParse({ status: 'Pending' });
    expect(result.success).toBe(false);
  });
});
