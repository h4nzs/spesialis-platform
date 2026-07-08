import { describe, it, expect } from 'vitest';
import { createInvoiceSchema, updateInvoiceStatusSchema } from './invoice.ts';

const validUuid = '550e8400-e29b-41d4-a716-446655440000';

describe('createInvoiceSchema', () => {
  it('accepts valid invoice with all fields', () => {
    const result = createInvoiceSchema.safeParse({
      companyId: validUuid,
      orderId: validUuid,
      amount: 500000,
      dueDate: '2026-08-15',
      notes: 'Pembayaran maintenance bulan Agustus',
    });
    expect(result.success).toBe(true);
  });

  it('accepts invoice without orderId', () => {
    const result = createInvoiceSchema.safeParse({
      companyId: validUuid,
      amount: 250000,
      dueDate: '2026-08-15',
    });
    expect(result.success).toBe(true);
  });

  it('accepts invoice without notes', () => {
    const result = createInvoiceSchema.safeParse({
      companyId: validUuid,
      amount: 100000,
      dueDate: '2026-08-15',
    });
    expect(result.success).toBe(true);
  });

  it('rejects missing companyId', () => {
    const result = createInvoiceSchema.safeParse({
      amount: 500000,
      dueDate: '2026-08-15',
    });
    expect(result.success).toBe(false);
  });

  it('rejects invalid companyId', () => {
    const result = createInvoiceSchema.safeParse({
      companyId: 'not-a-uuid',
      amount: 500000,
      dueDate: '2026-08-15',
    });
    expect(result.success).toBe(false);
  });

  it('rejects negative amount', () => {
    const result = createInvoiceSchema.safeParse({
      companyId: validUuid,
      amount: -1000,
      dueDate: '2026-08-15',
    });
    expect(result.success).toBe(false);
  });

  it('rejects invalid dueDate format', () => {
    const result = createInvoiceSchema.safeParse({
      companyId: validUuid,
      amount: 500000,
      dueDate: '15-08-2026',
    });
    expect(result.success).toBe(false);
  });

  it('coerces string amount to number', () => {
    const result = createInvoiceSchema.safeParse({
      companyId: validUuid,
      amount: '500000',
      dueDate: '2026-08-15',
    });
    expect(result.success).toBe(true);
  });

  it('rejects notes exceeding 1000 characters', () => {
    const result = createInvoiceSchema.safeParse({
      companyId: validUuid,
      amount: 500000,
      dueDate: '2026-08-15',
      notes: 'x'.repeat(1001),
    });
    expect(result.success).toBe(false);
  });
});

describe('updateInvoiceStatusSchema', () => {
  it('accepts Draft status', () => {
    const result = updateInvoiceStatusSchema.safeParse({ status: 'Draft' });
    expect(result.success).toBe(true);
  });

  it('accepts Paid status with notes', () => {
    const result = updateInvoiceStatusSchema.safeParse({
      status: 'Paid',
      notes: 'Pembayaran via transfer',
    });
    expect(result.success).toBe(true);
  });

  it('accepts Cancelled status', () => {
    const result = updateInvoiceStatusSchema.safeParse({ status: 'Cancelled' });
    expect(result.success).toBe(true);
  });

  it('rejects invalid status', () => {
    const result = updateInvoiceStatusSchema.safeParse({ status: 'Refunded' });
    expect(result.success).toBe(false);
  });

  it('rejects missing status', () => {
    const result = updateInvoiceStatusSchema.safeParse({});
    expect(result.success).toBe(false);
  });
});
