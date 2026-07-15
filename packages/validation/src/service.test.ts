import { describe, it, expect } from 'vitest';
import { createServiceSchema, updateServiceSchema } from './service.ts';

const validService = {
  categoryId: '550e8400-e29b-41d4-a716-446655440000',
  name: 'Cuci AC Standar',
  slug: 'cuci-ac-standar',
  basePrice: '150000',
};

describe('createServiceSchema', () => {
  it('accepts valid service', () => {
    const result = createServiceSchema.safeParse(validService);
    expect(result.success).toBe(true);
  });

  it('accepts with all optional fields', () => {
    const result = createServiceSchema.safeParse({
      ...validService,
      shortDescription: 'Cuci AC standar 1 PK',
      description: 'Layanan cuci AC untuk unit 1 PK',
      estimatedDuration: 60,
      warrantyDays: 7,
      isFeatured: true,
      displayOrder: 1,
    });
    expect(result.success).toBe(true);
  });

  it('rejects missing categoryId', () => {
    const result = createServiceSchema.safeParse({ ...validService, categoryId: undefined });
    expect(result.success).toBe(false);
  });

  it('rejects invalid UUID categoryId', () => {
    const result = createServiceSchema.safeParse({ ...validService, categoryId: 'not-uuid' });
    expect(result.success).toBe(false);
  });

  it('rejects invalid slug format', () => {
    const result = createServiceSchema.safeParse({ ...validService, slug: 'Cuci AC' });
    expect(result.success).toBe(false);
  });

  it('rejects empty base price', () => {
    const result = createServiceSchema.safeParse({ ...validService, basePrice: '' });
    expect(result.success).toBe(false);
  });

  it('rejects shortDescription exceeding 300 chars', () => {
    const result = createServiceSchema.safeParse({
      ...validService,
      shortDescription: 'a'.repeat(301),
    });
    expect(result.success).toBe(false);
  });

  it('rejects estimatedDuration of 0', () => {
    const result = createServiceSchema.safeParse({ ...validService, estimatedDuration: 0 });
    expect(result.success).toBe(false);
  });
});

describe('updateServiceSchema', () => {
  it('accepts partial update', () => {
    const result = updateServiceSchema.safeParse({ name: 'Cuci AC Premium' });
    expect(result.success).toBe(true);
  });

  it('accepts nullable fields set to null', () => {
    const result = updateServiceSchema.safeParse({
      shortDescription: null,
      estimatedDuration: null,
    });
    expect(result.success).toBe(true);
  });

  it('rejects invalid slug in update', () => {
    const result = updateServiceSchema.safeParse({ slug: 'Invalid Slug' });
    expect(result.success).toBe(false);
  });
});
