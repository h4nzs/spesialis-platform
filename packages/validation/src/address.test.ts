import { describe, it, expect } from 'vitest';
import { createAddressSchema, updateAddressSchema } from './address.ts';

const validAddress = {
  receiverName: 'John Doe',
  receiverPhone: '081234567890',
  province: 'DKI Jakarta',
  city: 'Jakarta Selatan',
  district: 'Kebayoran Baru',
  postalCode: '12120',
  address: 'Jl. Contoh No. 123',
};

describe('createAddressSchema', () => {
  it('accepts valid address', () => {
    const result = createAddressSchema.safeParse(validAddress);
    expect(result.success).toBe(true);
  });

  it('accepts address with all optional fields', () => {
    const result = createAddressSchema.safeParse({
      ...validAddress,
      label: 'Rumah',
      latitude: -6.2,
      longitude: 106.8,
      isDefault: true,
      notes: 'Pintu pagar hitam',
    });
    expect(result.success).toBe(true);
  });

  it('rejects missing receiverName', () => {
    const result = createAddressSchema.safeParse({ ...validAddress, receiverName: undefined });
    expect(result.success).toBe(false);
  });

  it('rejects invalid phone (contains non-digit)', () => {
    const result = createAddressSchema.safeParse({ ...validAddress, receiverPhone: '0812-abc' });
    expect(result.success).toBe(false);
  });

  it('rejects phone too short', () => {
    const result = createAddressSchema.safeParse({ ...validAddress, receiverPhone: '081' });
    expect(result.success).toBe(false);
  });

  it('rejects address exceeding 500 chars', () => {
    const result = createAddressSchema.safeParse({ ...validAddress, address: 'a'.repeat(501) });
    expect(result.success).toBe(false);
  });

  it('rejects invalid latitude', () => {
    const result = createAddressSchema.safeParse({ ...validAddress, latitude: 100 });
    expect(result.success).toBe(false);
  });

  it('accepts optional label', () => {
    const result = createAddressSchema.safeParse({ ...validAddress, label: 'Kantor' });
    expect(result.success).toBe(true);
  });
});

describe('updateAddressSchema', () => {
  it('accepts partial update with one field', () => {
    const result = updateAddressSchema.safeParse({ label: 'Baru' });
    expect(result.success).toBe(true);
  });

  it('accepts empty object', () => {
    const result = updateAddressSchema.safeParse({});
    expect(result.success).toBe(true);
  });

  it('rejects invalid phone', () => {
    const result = updateAddressSchema.safeParse({ receiverPhone: 'abc' });
    expect(result.success).toBe(false);
  });
});
