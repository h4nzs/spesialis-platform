import { describe, it, expect } from 'vitest';
import { createBranchSchema, updateBranchSchema } from './branch.ts';

const validBranch = {
  name: 'Cabang Jakarta Pusat',
  address: 'Jl. Merdeka No. 1, Jakarta Pusat',
  city: 'Jakarta Pusat',
};

describe('createBranchSchema', () => {
  it('accepts valid branch (minimal)', () => {
    const result = createBranchSchema.safeParse(validBranch);
    expect(result.success).toBe(true);
  });

  it('accepts with optional phone', () => {
    const result = createBranchSchema.safeParse({
      ...validBranch,
      phone: '02112345678',
    });
    expect(result.success).toBe(true);
  });

  it('accepts phone with leading +', () => {
    const result = createBranchSchema.safeParse({
      ...validBranch,
      phone: '+622112345678',
    });
    expect(result.success).toBe(true);
  });

  it('rejects empty name', () => {
    const result = createBranchSchema.safeParse({ ...validBranch, name: '' });
    expect(result.success).toBe(false);
  });

  it('rejects name exceeding 255 chars', () => {
    const result = createBranchSchema.safeParse({ ...validBranch, name: 'x'.repeat(256) });
    expect(result.success).toBe(false);
  });

  it('rejects empty address', () => {
    const result = createBranchSchema.safeParse({ ...validBranch, address: '' });
    expect(result.success).toBe(false);
  });

  it('rejects address exceeding 500 chars', () => {
    const result = createBranchSchema.safeParse({ ...validBranch, address: 'x'.repeat(501) });
    expect(result.success).toBe(false);
  });

  it('rejects empty city', () => {
    const result = createBranchSchema.safeParse({ ...validBranch, city: '' });
    expect(result.success).toBe(false);
  });

  it('rejects city exceeding 255 chars', () => {
    const result = createBranchSchema.safeParse({ ...validBranch, city: 'x'.repeat(256) });
    expect(result.success).toBe(false);
  });

  it('rejects phone with letters', () => {
    const result = createBranchSchema.safeParse({
      ...validBranch,
      phone: '021abc12345',
    });
    expect(result.success).toBe(false);
  });

  it('rejects phone too short (< 10)', () => {
    const result = createBranchSchema.safeParse({
      ...validBranch,
      phone: '021',
    });
    expect(result.success).toBe(false);
  });

  it('rejects phone too long (> 30)', () => {
    const result = createBranchSchema.safeParse({
      ...validBranch,
      phone: '0'.repeat(31),
    });
    expect(result.success).toBe(false);
  });

  it('rejects missing name', () => {
    const { name: _n, ...noName } = validBranch;
    const result = createBranchSchema.safeParse(noName);
    expect(result.success).toBe(false);
  });

  it('rejects missing address', () => {
    const { address: _a, ...noAddress } = validBranch;
    const result = createBranchSchema.safeParse(noAddress);
    expect(result.success).toBe(false);
  });

  it('rejects missing city', () => {
    const { city: _c, ...noCity } = validBranch;
    const result = createBranchSchema.safeParse(noCity);
    expect(result.success).toBe(false);
  });
});

describe('updateBranchSchema', () => {
  it('accepts empty object (no changes)', () => {
    const result = updateBranchSchema.safeParse({});
    expect(result.success).toBe(true);
  });

  it('accepts partial update with name only', () => {
    const result = updateBranchSchema.safeParse({ name: 'Cabang Baru' });
    expect(result.success).toBe(true);
  });

  it('accepts partial update with all fields', () => {
    const result = updateBranchSchema.safeParse({
      name: 'Updated',
      address: 'Jl. Baru No. 5',
      city: 'Jaksel',
      phone: '02198765432',
    });
    expect(result.success).toBe(true);
  });

  it('rejects invalid phone', () => {
    const result = updateBranchSchema.safeParse({ phone: 'invalid-phone' });
    expect(result.success).toBe(false);
  });

  it('rejects name exceeding 255 chars', () => {
    const result = updateBranchSchema.safeParse({ name: 'x'.repeat(256) });
    expect(result.success).toBe(false);
  });

  it('rejects address exceeding 500 chars', () => {
    const result = updateBranchSchema.safeParse({ address: 'x'.repeat(501) });
    expect(result.success).toBe(false);
  });
});
