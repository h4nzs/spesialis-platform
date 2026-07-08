import { describe, it, expect } from 'vitest';
import { imposePenaltySchema, updatePenaltyStatusSchema } from './penalty.ts';

const validUuid = '550e8400-e29b-41d4-a716-446655440000';

describe('imposePenaltySchema', () => {
  it('accepts valid penalty with all fields', () => {
    const result = imposePenaltySchema.safeParse({
      partnerId: validUuid,
      orderId: validUuid,
      type: 'Late',
      amount: 50000,
      reason: 'Datang terlambat 2 jam',
      notes: 'Konfirmasi dari admin',
    });
    expect(result.success).toBe(true);
  });

  it('accepts penalty without orderId', () => {
    const result = imposePenaltySchema.safeParse({
      partnerId: validUuid,
      type: 'NoShow',
      amount: 100000,
      reason: 'Tidak hadir tanpa konfirmasi',
    });
    expect(result.success).toBe(true);
  });

  it('accepts penalty without notes', () => {
    const result = imposePenaltySchema.safeParse({
      partnerId: validUuid,
      type: 'Cancellation',
      amount: 25000,
      reason: 'Membatalkan di menit terakhir',
    });
    expect(result.success).toBe(true);
  });

  it('accepts Complaint type', () => {
    const result = imposePenaltySchema.safeParse({
      partnerId: validUuid,
      type: 'Complaint',
      amount: 0,
      reason: 'Komplain pelanggan terbukti',
    });
    expect(result.success).toBe(true);
  });

  it('accepts Other type', () => {
    const result = imposePenaltySchema.safeParse({
      partnerId: validUuid,
      type: 'Other',
      amount: 75000,
      reason: 'Pelanggaran SOP',
    });
    expect(result.success).toBe(true);
  });

  it('rejects missing partnerId', () => {
    const result = imposePenaltySchema.safeParse({
      type: 'Late',
      amount: 50000,
      reason: 'Terlambat',
    });
    expect(result.success).toBe(false);
  });

  it('rejects invalid partnerId', () => {
    const result = imposePenaltySchema.safeParse({
      partnerId: 'not-a-uuid',
      type: 'Late',
      amount: 50000,
      reason: 'Terlambat',
    });
    expect(result.success).toBe(false);
  });

  it('rejects invalid type', () => {
    const result = imposePenaltySchema.safeParse({
      partnerId: validUuid,
      type: 'Fraud',
      amount: 50000,
      reason: 'Penipuan',
    });
    expect(result.success).toBe(false);
  });

  it('rejects negative amount', () => {
    const result = imposePenaltySchema.safeParse({
      partnerId: validUuid,
      type: 'Late',
      amount: -1000,
      reason: 'Terlambat',
    });
    expect(result.success).toBe(false);
  });

  it('rejects empty reason', () => {
    const result = imposePenaltySchema.safeParse({
      partnerId: validUuid,
      type: 'Late',
      amount: 50000,
      reason: '',
    });
    expect(result.success).toBe(false);
  });

  it('rejects reason exceeding 1000 characters', () => {
    const result = imposePenaltySchema.safeParse({
      partnerId: validUuid,
      type: 'Late',
      amount: 50000,
      reason: 'x'.repeat(1001),
    });
    expect(result.success).toBe(false);
  });

  it('coerces string amount to number', () => {
    const result = imposePenaltySchema.safeParse({
      partnerId: validUuid,
      type: 'Late',
      amount: '50000',
      reason: 'Terlambat',
    });
    expect(result.success).toBe(true);
  });
});

describe('updatePenaltyStatusSchema', () => {
  it('accepts Applied status', () => {
    const result = updatePenaltyStatusSchema.safeParse({ status: 'Applied' });
    expect(result.success).toBe(true);
  });

  it('accepts Waived status with notes', () => {
    const result = updatePenaltyStatusSchema.safeParse({
      status: 'Waived',
      notes: 'Alasan cukup, dihapus',
    });
    expect(result.success).toBe(true);
  });

  it('rejects Pending status (not in update enum)', () => {
    const result = updatePenaltyStatusSchema.safeParse({ status: 'Pending' });
    expect(result.success).toBe(false);
  });

  it('rejects Disputed status (not in update enum)', () => {
    const result = updatePenaltyStatusSchema.safeParse({ status: 'Disputed' });
    expect(result.success).toBe(false);
  });

  it('rejects missing status', () => {
    const result = updatePenaltyStatusSchema.safeParse({});
    expect(result.success).toBe(false);
  });

  it('rejects notes exceeding 1000 characters', () => {
    const result = updatePenaltyStatusSchema.safeParse({
      status: 'Waived',
      notes: 'x'.repeat(1001),
    });
    expect(result.success).toBe(false);
  });
});
