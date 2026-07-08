import { describe, it, expect } from 'vitest';
import { assignSchema, acceptSchema, rejectSchema } from './assignment.ts';

const validUuid = '550e8400-e29b-41d4-a716-446655440000';

describe('assignSchema', () => {
  it('accepts valid assign with partnerId only', () => {
    const result = assignSchema.safeParse({ partnerId: validUuid });
    expect(result.success).toBe(true);
  });

  it('accepts valid assign with note', () => {
    const result = assignSchema.safeParse({ partnerId: validUuid, note: 'Segera konfirmasi' });
    expect(result.success).toBe(true);
  });

  it('rejects missing partnerId', () => {
    const result = assignSchema.safeParse({});
    expect(result.success).toBe(false);
  });

  it('rejects invalid partnerId', () => {
    const result = assignSchema.safeParse({ partnerId: 'not-a-uuid' });
    expect(result.success).toBe(false);
  });

  it('rejects note exceeding 500 characters', () => {
    const result = assignSchema.safeParse({ partnerId: validUuid, note: 'x'.repeat(501) });
    expect(result.success).toBe(false);
  });
});

describe('acceptSchema', () => {
  it('accepts accept without note', () => {
    const result = acceptSchema.safeParse({});
    expect(result.success).toBe(true);
  });

  it('accepts accept with note', () => {
    const result = acceptSchema.safeParse({ note: 'Saya siap mengerjakan' });
    expect(result.success).toBe(true);
  });

  it('rejects note exceeding 500 characters', () => {
    const result = acceptSchema.safeParse({ note: 'x'.repeat(501) });
    expect(result.success).toBe(false);
  });
});

describe('rejectSchema', () => {
  it('accepts valid reject with reason', () => {
    const result = rejectSchema.safeParse({ reason: 'Jadwal bentrok' });
    expect(result.success).toBe(true);
  });

  it('rejects missing reason', () => {
    const result = rejectSchema.safeParse({});
    expect(result.success).toBe(false);
  });

  it('rejects empty reason', () => {
    const result = rejectSchema.safeParse({ reason: '' });
    expect(result.success).toBe(false);
  });

  it('rejects reason exceeding 500 characters', () => {
    const result = rejectSchema.safeParse({ reason: 'x'.repeat(501) });
    expect(result.success).toBe(false);
  });
});
