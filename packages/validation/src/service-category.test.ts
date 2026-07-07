import { describe, it, expect } from 'vitest';
import { createServiceCategorySchema, updateServiceCategorySchema } from './service-category.ts';

describe('createServiceCategorySchema', () => {
  it('accepts valid category with name only', () => {
    const result = createServiceCategorySchema.safeParse({ name: 'AC Service' });
    expect(result.success).toBe(true);
  });

  it('accepts with all optional fields', () => {
    const result = createServiceCategorySchema.safeParse({
      name: 'AC Service',
      slug: 'ac-service',
      description: 'Layanan perbaikan AC',
      icon: 'snowflake',
      displayOrder: 1,
    });
    expect(result.success).toBe(true);
  });

  it('coerces string displayOrder to number', () => {
    const result = createServiceCategorySchema.safeParse({
      name: 'test',
      displayOrder: '2',
    });
    expect(result.success).toBe(true);
    const data = result.data!;
    expect(data.displayOrder).toBe(2);
  });

  it('accepts auto-generated slug pattern (using slugSchema)', () => {
    const result = createServiceCategorySchema.safeParse({
      name: 'test',
      slug: 'test-slug-123',
    });
    expect(result.success).toBe(true);
  });

  it('rejects empty name', () => {
    const result = createServiceCategorySchema.safeParse({ name: '' });
    expect(result.success).toBe(false);
  });

  it('rejects name exceeding 255 chars', () => {
    const result = createServiceCategorySchema.safeParse({ name: 'x'.repeat(256) });
    expect(result.success).toBe(false);
  });

  it('rejects invalid slug (uppercase)', () => {
    const result = createServiceCategorySchema.safeParse({ name: 'test', slug: 'TEST-SLUG' });
    expect(result.success).toBe(false);
  });

  it('rejects invalid slug (spaces)', () => {
    const result = createServiceCategorySchema.safeParse({ name: 'test', slug: 'test slug' });
    expect(result.success).toBe(false);
  });

  it('rejects invalid slug (special chars)', () => {
    const result = createServiceCategorySchema.safeParse({ name: 'test', slug: 'test_slug!' });
    expect(result.success).toBe(false);
  });

  it('rejects negative displayOrder', () => {
    const result = createServiceCategorySchema.safeParse({ name: 'test', displayOrder: -1 });
    expect(result.success).toBe(false);
  });

  it('rejects missing name', () => {
    const result = createServiceCategorySchema.safeParse({});
    expect(result.success).toBe(false);
  });
});

describe('updateServiceCategorySchema', () => {
  it('accepts empty object (no changes)', () => {
    const result = updateServiceCategorySchema.safeParse({});
    expect(result.success).toBe(true);
  });

  it('accepts partial update with name only', () => {
    const result = updateServiceCategorySchema.safeParse({ name: 'Updated' });
    expect(result.success).toBe(true);
  });

  it('accepts valid slug', () => {
    const result = updateServiceCategorySchema.safeParse({ slug: 'updated-slug' });
    expect(result.success).toBe(true);
  });

  it('accepts isActive boolean', () => {
    expect(updateServiceCategorySchema.safeParse({ isActive: true }).success).toBe(true);
    expect(updateServiceCategorySchema.safeParse({ isActive: false }).success).toBe(true);
  });

  it('rejects invalid slug', () => {
    const result = updateServiceCategorySchema.safeParse({ slug: 'INVALID SLUG' });
    expect(result.success).toBe(false);
  });

  it('rejects name exceeding 255 chars', () => {
    const result = updateServiceCategorySchema.safeParse({ name: 'x'.repeat(256) });
    expect(result.success).toBe(false);
  });

  it('rejects negative displayOrder', () => {
    const result = updateServiceCategorySchema.safeParse({ displayOrder: -1 });
    expect(result.success).toBe(false);
  });

  it('rejects isActive non-boolean', () => {
    const result = updateServiceCategorySchema.safeParse({ isActive: 'yes' });
    expect(result.success).toBe(false);
  });
});
