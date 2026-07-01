import { describe, it, expect } from 'vitest';
import { createComplaintSchema, resolveComplaintSchema } from './complaint.ts';

describe('createComplaintSchema', () => {
  it('accepts valid complaint', () => {
    const result = createComplaintSchema.safeParse({
      orderId: '550e8400-e29b-41d4-a716-446655440000',
      title: 'Hasil tidak sesuai',
      description: 'Pekerjaan tidak selesai dengan baik. Masih ada kebocoran setelah diperbaiki.',
    });
    expect(result.success).toBe(true);
  });

  it('rejects short description', () => {
    const result = createComplaintSchema.safeParse({
      orderId: '550e8400-e29b-41d4-a716-446655440000',
      title: 'Hasil tidak sesuai',
      description: 'Pendek',
    });
    expect(result.success).toBe(false);
  });

  it('rejects empty title', () => {
    const result = createComplaintSchema.safeParse({
      orderId: '550e8400-e29b-41d4-a716-446655440000',
      title: '',
      description: 'Pekerjaan tidak selesai dengan baik. Masih ada kebocoran.',
    });
    expect(result.success).toBe(false);
  });
});

describe('resolveComplaintSchema', () => {
  it('accepts valid resolution', () => {
    const result = resolveComplaintSchema.safeParse({
      resolution: 'Partner telah diperbaiki',
      status: 'Resolved',
    });
    expect(result.success).toBe(true);
  });

  it('rejects unknown status', () => {
    const result = resolveComplaintSchema.safeParse({
      resolution: 'Telah diperbaiki',
      status: 'Open',
    });
    expect(result.success).toBe(false);
  });
});
