import { describe, it, expect } from 'vitest';
import { updateCustomerSchema, updateCustomerStatusSchema } from './customer.ts';

describe('updateCustomerSchema', () => {
  it('accepts valid full update', () => {
    const result = updateCustomerSchema.safeParse({
      fullName: 'John Doe',
      avatar: 'https://example.com/avatar.jpg',
      birthDate: '1990-01-01',
      gender: 'L',
      defaultAddressId: '550e8400-e29b-41d4-a716-446655440000',
    });
    expect(result.success).toBe(true);
  });

  it('accepts empty object (partial update)', () => {
    const result = updateCustomerSchema.safeParse({});
    expect(result.success).toBe(true);
  });

  it('accepts single field update', () => {
    const result = updateCustomerSchema.safeParse({ fullName: 'Jane Doe' });
    expect(result.success).toBe(true);
  });

  it('rejects invalid birthDate format', () => {
    const result = updateCustomerSchema.safeParse({ birthDate: '01-01-1990' });
    expect(result.success).toBe(false);
  });

  it('rejects invalid gender', () => {
    const result = updateCustomerSchema.safeParse({ gender: 'X' });
    expect(result.success).toBe(false);
  });

  it('rejects non-uuid defaultAddressId', () => {
    const result = updateCustomerSchema.safeParse({ defaultAddressId: 'not-a-uuid' });
    expect(result.success).toBe(false);
  });

  it('rejects invalid avatar URL', () => {
    const result = updateCustomerSchema.safeParse({ avatar: 'not-a-url' });
    expect(result.success).toBe(false);
  });

  it('rejects empty fullName', () => {
    const result = updateCustomerSchema.safeParse({ fullName: '' });
    expect(result.success).toBe(false);
  });
});

describe('updateCustomerStatusSchema', () => {
  it('accepts active status', () => {
    const result = updateCustomerStatusSchema.safeParse({ status: 'active' });
    expect(result.success).toBe(true);
  });

  it('accepts suspended status', () => {
    const result = updateCustomerStatusSchema.safeParse({ status: 'suspended' });
    expect(result.success).toBe(true);
  });

  it('accepts blocked status', () => {
    const result = updateCustomerStatusSchema.safeParse({ status: 'blocked' });
    expect(result.success).toBe(true);
  });

  it('rejects invalid status', () => {
    const result = updateCustomerStatusSchema.safeParse({ status: 'deleted' });
    expect(result.success).toBe(false);
  });

  it('rejects missing status', () => {
    const result = updateCustomerStatusSchema.safeParse({});
    expect(result.success).toBe(false);
  });
});
