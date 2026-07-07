import { describe, it, expect } from 'vitest';
import {
  createContractSchema,
  updateContractSchema,
  updateContractStatusSchema,
} from './contract.ts';

const UUID = '550e8400-e29b-41d4-a716-446655440000';

// ───── Create Contract Schema ─────

describe('createContractSchema', () => {
  const validContract = {
    companyId: UUID,
    startDate: '2026-01-01',
    endDate: '2026-12-31',
  };

  it('accepts valid contract (minimal)', () => {
    const result = createContractSchema.safeParse(validContract);
    expect(result.success).toBe(true);
  });

  it('accepts with all optional fields', () => {
    const result = createContractSchema.safeParse({
      ...validContract,
      slaResponseHours: 4,
      slaResolutionHours: 24,
      discountPercent: 10,
      discountAmount: 500000,
      notes: 'Kontrak tahunan dengan diskon 10%',
    });
    expect(result.success).toBe(true);
  });

  it('accepts nullable fields as null', () => {
    const result = createContractSchema.safeParse({
      ...validContract,
      slaResponseHours: null,
      slaResolutionHours: null,
      discountPercent: null,
      discountAmount: null,
      notes: null,
    });
    expect(result.success).toBe(true);
  });

  it('coerces string slaResponseHours to number', () => {
    const result = createContractSchema.safeParse({
      ...validContract,
      slaResponseHours: '4',
    });
    expect(result.success).toBe(true);
  });

  it('rejects invalid companyId', () => {
    const result = createContractSchema.safeParse({
      ...validContract,
      companyId: 'not-uuid',
    });
    expect(result.success).toBe(false);
  });

  it('rejects invalid startDate format', () => {
    const result = createContractSchema.safeParse({
      ...validContract,
      startDate: '01-01-2026',
    });
    expect(result.success).toBe(false);
  });

  it('rejects invalid endDate format', () => {
    const result = createContractSchema.safeParse({
      ...validContract,
      endDate: '31/12/2026',
    });
    expect(result.success).toBe(false);
  });

  it('rejects missing startDate', () => {
    const { startDate: _sd, ...noStart } = validContract;
    const result = createContractSchema.safeParse(noStart);
    expect(result.success).toBe(false);
  });

  it('rejects missing endDate', () => {
    const { endDate: _ed, ...noEnd } = validContract;
    const result = createContractSchema.safeParse(noEnd);
    expect(result.success).toBe(false);
  });

  it('rejects negative slaResponseHours', () => {
    const result = createContractSchema.safeParse({
      ...validContract,
      slaResponseHours: -1,
    });
    expect(result.success).toBe(false);
  });

  it('rejects non-integer slaResponseHours', () => {
    const result = createContractSchema.safeParse({
      ...validContract,
      slaResponseHours: 4.5,
    });
    expect(result.success).toBe(false);
  });

  it('rejects discountPercent above 100', () => {
    const result = createContractSchema.safeParse({
      ...validContract,
      discountPercent: 150,
    });
    expect(result.success).toBe(false);
  });

  it('rejects negative discountPercent', () => {
    const result = createContractSchema.safeParse({
      ...validContract,
      discountPercent: -5,
    });
    expect(result.success).toBe(false);
  });

  it('accepts discountPercent 0 and 100 (boundaries)', () => {
    expect(createContractSchema.safeParse({ ...validContract, discountPercent: 0 }).success).toBe(
      true,
    );
    expect(createContractSchema.safeParse({ ...validContract, discountPercent: 100 }).success).toBe(
      true,
    );
  });

  it('rejects negative discountAmount', () => {
    const result = createContractSchema.safeParse({
      ...validContract,
      discountAmount: -1000,
    });
    expect(result.success).toBe(false);
  });

  it('rejects notes exceeding 1000 chars', () => {
    const result = createContractSchema.safeParse({
      ...validContract,
      notes: 'x'.repeat(1001),
    });
    expect(result.success).toBe(false);
  });
});

// ───── Update Contract Schema ─────

describe('updateContractSchema', () => {
  it('accepts empty object (no changes)', () => {
    const result = updateContractSchema.safeParse({});
    expect(result.success).toBe(true);
  });

  it('accepts partial update with sla only', () => {
    const result = updateContractSchema.safeParse({
      slaResponseHours: 2,
      slaResolutionHours: 12,
    });
    expect(result.success).toBe(true);
  });

  it('rejects companyId (should be omitted)', () => {
    // partial().omit({ companyId: true }) means companyId is not accepted
    // Zod strips unknown keys by default — cast because TS knows companyId is omitted
    const data = updateContractSchema.parse({ companyId: UUID } as Record<string, unknown>);
    expect('companyId' in data).toBe(false);
  });

  it('accepts nullable discountPercent', () => {
    const result = updateContractSchema.safeParse({ discountPercent: null });
    expect(result.success).toBe(true);
  });

  it('rejects invalid startDate format', () => {
    const result = updateContractSchema.safeParse({ startDate: 'invalid-date' });
    expect(result.success).toBe(false);
  });

  it('rejects negative discountPercent', () => {
    const result = updateContractSchema.safeParse({ discountPercent: -5 });
    expect(result.success).toBe(false);
  });

  it('rejects notes exceeding 1000 chars', () => {
    const result = updateContractSchema.safeParse({ notes: 'x'.repeat(1001) });
    expect(result.success).toBe(false);
  });
});

// ───── Update Contract Status Schema ─────

describe('updateContractStatusSchema', () => {
  it('accepts all valid statuses', () => {
    for (const s of ['Draft', 'Active', 'Expired', 'Terminated']) {
      const result = updateContractStatusSchema.safeParse({ status: s });
      expect(result.success).toBe(true);
    }
  });

  it('rejects invalid status', () => {
    const result = updateContractStatusSchema.safeParse({ status: 'Invalid' });
    expect(result.success).toBe(false);
  });

  it('rejects empty status', () => {
    const result = updateContractStatusSchema.safeParse({ status: '' });
    expect(result.success).toBe(false);
  });

  it('rejects missing status', () => {
    const result = updateContractStatusSchema.safeParse({});
    expect(result.success).toBe(false);
  });
});
