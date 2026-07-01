import { describe, it, expect } from 'vitest';
import { uuidSchema, phoneSchema, slugSchema, paginationQuerySchema } from './common.ts';

describe('uuidSchema', () => {
  it('accepts valid UUID', () => {
    const result = uuidSchema.safeParse('550e8400-e29b-41d4-a716-446655440000');
    expect(result.success).toBe(true);
  });

  it('rejects invalid UUID', () => {
    const result = uuidSchema.safeParse('not-a-uuid');
    expect(result.success).toBe(false);
  });

  it('rejects empty string', () => {
    const result = uuidSchema.safeParse('');
    expect(result.success).toBe(false);
  });
});

describe('phoneSchema', () => {
  it('accepts 08123456789', () => {
    const result = phoneSchema.safeParse('08123456789');
    expect(result.success).toBe(true);
  });

  it('accepts +628123456789', () => {
    const result = phoneSchema.safeParse('+628123456789');
    expect(result.success).toBe(true);
  });

  it('rejects phone with letters', () => {
    const result = phoneSchema.safeParse('0812abc');
    expect(result.success).toBe(false);
  });

  it('rejects too short phone', () => {
    const result = phoneSchema.safeParse('081');
    expect(result.success).toBe(false);
  });
});

describe('slugSchema', () => {
  it('accepts lowercase-slug', () => {
    const result = slugSchema.safeParse('cuci-ac-standar');
    expect(result.success).toBe(true);
  });

  it('accepts slug with numbers', () => {
    const result = slugSchema.safeParse('service-2');
    expect(result.success).toBe(true);
  });

  it('rejects slug with uppercase', () => {
    const result = slugSchema.safeParse('Cuci-AC');
    expect(result.success).toBe(false);
  });

  it('rejects empty slug', () => {
    const result = slugSchema.safeParse('');
    expect(result.success).toBe(false);
  });
});

describe('paginationQuerySchema', () => {
  it('applies defaults for empty query', () => {
    const result = paginationQuerySchema.parse({});
    expect(result.page).toBe(1);
    expect(result.limit).toBe(20);
    expect(result.sort).toBeUndefined();
    expect(result.q).toBeUndefined();
  });

  it('coerces string page and limit to numbers', () => {
    const result = paginationQuerySchema.parse({ page: '3', limit: '50' });
    expect(result.page).toBe(3);
    expect(result.limit).toBe(50);
  });

  it('rejects page below 1', () => {
    const result = paginationQuerySchema.safeParse({ page: 0 });
    expect(result.success).toBe(false);
  });

  it('rejects limit above 100', () => {
    const result = paginationQuerySchema.safeParse({ limit: 200 });
    expect(result.success).toBe(false);
  });
});
